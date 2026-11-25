"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useLab, type LookSettings, type Mode } from "@/store/lab";

/** Day → night look, mixed by t (0 = day, 1 = night). */
function mix(a: LookSettings, b: LookSettings, t: number): LookSettings {
  const out = { ...a };
  for (const k of Object.keys(a) as (keyof LookSettings)[]) out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}

/**
 * The pixel-art look. Renders the scene into a small, low-resolution image, then draws it
 * full-screen with nearest-neighbour scaling, tone mapping, a colour grade, ordered
 * (Bayer) dithering, film grain and a vignette.
 */

const vertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const fragment = /* glsl */ `
uniform sampler2D tScene;
uniform vec2 uRes;
uniform float uLevels, uDither, uGrain, uTime, uExposure, uContrast, uSat, uWarmth, uSplit, uVignette;
varying vec2 vUv;

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}
float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec3 c = texture2D(tScene, vUv).rgb * uExposure;
  c = aces(c);
  c = pow(c, vec3(1.0 / 2.2));

  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(lum), c, uSat);
  c = (c - 0.5) * uContrast + 0.5;
  c += vec3(0.06, 0.015, -0.06) * uWarmth;
  // split-tone: dusty blue in the shadows, amber in the highlights
  vec3 tint = mix(vec3(-0.03, 0.0, 0.05), vec3(0.06, 0.025, -0.045), smoothstep(0.15, 0.85, lum));
  c += tint * uSplit;

  vec2 d = vUv - 0.5;
  c *= 1.0 - uVignette * dot(d, d) * 1.6;

  c += (hash(gl_FragCoord.xy + uTime) - 0.5) * uGrain;

  // ordered dither in room-pixel space, then quantise
  float steps = max(uLevels - 1.0, 1.0);
  float b = bayer4(floor(vUv * uRes)) - 0.5;
  c = floor(clamp(c, 0.0, 1.0) * steps + 0.5 + b * uDither) / steps;

  gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}`;

/** The low-res image the room is drawn into (materials must be prepared for it, not for the screen). */
export const sceneTarget: { current: THREE.WebGLRenderTarget | null } = { current: null };

export default function PixelPass({
  mode,
  animate,
  blend,
}: {
  mode: Mode;
  animate: boolean;
  /** When given, the look fades between the day and night values by blend.current (0…1). */
  blend?: { current: number };
}) {
  const { size } = useThree();
  const pixelSize = useLab((s) => s.settings[mode].pixelSize);

  const target = useMemo(
    () =>
      new THREE.WebGLRenderTarget(1, 1, {
        type: THREE.HalfFloatType,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        depthBuffer: true,
      }),
    [],
  );

  const post = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tScene: { value: target.texture },
        uRes: { value: new THREE.Vector2(1, 1) },
        uLevels: { value: 10 },
        uDither: { value: 1 },
        uGrain: { value: 0 },
        uTime: { value: 0 },
        uExposure: { value: 1 },
        uContrast: { value: 1 },
        uSat: { value: 1 },
        uWarmth: { value: 0 },
        uSplit: { value: 0 },
        uVignette: { value: 0 },
      },
    });
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
    return { scene, material, camera: new THREE.Camera() };
  }, [target]);

  useEffect(() => {
    const w = Math.max(1, Math.round(size.width / pixelSize));
    const h = Math.max(1, Math.round(size.height / pixelSize));
    target.setSize(w, h);
    post.material.uniforms.uRes.value.set(w, h);
  }, [size.width, size.height, pixelSize, target, post]);

  useEffect(
    () => () => {
      target.dispose();
      post.material.dispose();
    },
    [target, post],
  );

  const postRef = useRef<typeof post | null>(null);
  useEffect(() => {
    postRef.current = post;
  }, [post]);

  // priority 1 = we take over rendering from R3F
  useFrame((state) => {
    const all = useLab.getState().settings;
    const s = blend ? mix(all.day, all.night, blend.current) : all[mode];
    const p = postRef.current;
    if (!p) return;
    const u = p.material.uniforms;
    u.uLevels.value = s.levels;
    u.uDither.value = s.dither;
    u.uGrain.value = s.grain;
    u.uExposure.value = s.exposure;
    u.uContrast.value = s.contrast;
    u.uSat.value = s.saturation;
    u.uWarmth.value = s.warmth;
    u.uSplit.value = s.splitTone;
    u.uVignette.value = s.vignette;
    if (animate) u.uTime.value = (state.clock.elapsedTime * 60) % 1000;

    const { gl, scene, camera } = state;
    sceneTarget.current = target;
    gl.setRenderTarget(target);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    gl.render(p.scene, p.camera);
  }, 1);

  return null;
}
