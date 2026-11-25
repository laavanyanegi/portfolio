"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ROOM } from "@/lib/roomPalette";
import { BEDSIDE_LAMP, CHAIR, D, FLOOR_LAMP, MIRROR, W } from "./dims";
import { useNight } from "./parts";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Day: low warm sun through the balcony window + door, blue-ish sky fill.
 * Night: moonlight, purple desk lamp (with shadows), amber bedside lamp, floor lamp, mirror bulbs, laptop glow.
 * Every light always exists and only its intensity/colour fades, so switching never stutters.
 */
/**
 * `softAmber`: the Creatives close-up is open, right next to the amber bedside lamp, so it glides down a little.
 * `lite` (phones, low-end devices): a smaller sun shadow and no desk-lamp shadow (a lamp's shadow means
 * drawing the room six more times each frame).
 */
export default function Lights({ softAmber = false, lite = false }: { softAmber?: boolean; lite?: boolean }) {
  const t = useNight();
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(3, 0, 3.5);
    return o;
  }, []);
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const desk = useRef<THREE.PointLight>(null);
  const amber = useRef<THREE.PointLight>(null);
  const screen = useRef<THREE.PointLight>(null);
  const fill = useRef<THREE.PointLight>(null);
  const floorLamp = useRef<THREE.PointLight>(null);
  const mirror = useRef<THREE.PointLight>(null);
  const amberDim = useRef(1);
  const c = useMemo(
    () => ({
      sun: new THREE.Color(ROOM.sun),
      moon: new THREE.Color(ROOM.moon),
      skyD: new THREE.Color(ROOM.skyFillDay),
      skyN: new THREE.Color(ROOM.skyFillNight),
      gndD: new THREE.Color(ROOM.groundFillDay),
      gndN: new THREE.Color("#120c10"),
    }),
    [],
  );

  useFrame((_, dt) => {
    const n = t.current;
    amberDim.current += ((softAmber ? 0.55 : 1) - amberDim.current) * Math.min(1, dt * 2.5);
    if (sun.current) {
      sun.current.intensity = lerp(6, 0.35, n);
      sun.current.color.copy(c.sun).lerp(c.moon, n);
    }
    if (hemi.current) {
      hemi.current.intensity = lerp(1.2, 0.5, n);
      hemi.current.color.copy(c.skyD).lerp(c.skyN, n);
      hemi.current.groundColor.copy(c.gndD).lerp(c.gndN, n);
    }
    if (desk.current) desk.current.intensity = 3.2 * n;
    if (amber.current) amber.current.intensity = 2.4 * n * amberDim.current;
    if (screen.current) screen.current.intensity = 0.6 * n;
    if (fill.current) fill.current.intensity = 1.1 * n;
    if (floorLamp.current) floorLamp.current.intensity = 2.6 * n;
    if (mirror.current) mirror.current.intensity = 1.1 * n;
  });

  const shadowCam = { left: -8, right: 8, top: 8, bottom: -8, near: 0.5, far: 30 };
  return (
    <>
      <primitive object={target} />
      <directionalLight
        ref={sun}
        position={[-5, 3.8, -0.5]}
        target={target}
        castShadow
        shadow-mapSize={lite ? [1024, 1024] : [2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={shadowCam.left}
        shadow-camera-right={shadowCam.right}
        shadow-camera-top={shadowCam.top}
        shadow-camera-bottom={shadowCam.bottom}
        shadow-camera-near={shadowCam.near}
        shadow-camera-far={shadowCam.far}
      />
      <hemisphereLight ref={hemi} />
      <pointLight
        ref={desk}
        position={[CHAIR[0] - 0.53, 1.03, D - 0.22]}
        color={ROOM.lampGlow}
        intensity={0}
        distance={7}
        decay={1.6}
        castShadow={!lite}
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.002}
      />
      <pointLight ref={amber} position={[BEDSIDE_LAMP[0] + 0.05, BEDSIDE_LAMP[1], BEDSIDE_LAMP[2]]} color={ROOM.amberGlow} intensity={0} distance={5.5} decay={1.6} />
      {/* bed wall: floor lamp + the bulbs round the mirror */}
      <pointLight ref={floorLamp} position={[FLOOR_LAMP.x, FLOOR_LAMP.bulbY, FLOOR_LAMP.z + 0.05]} color="#ffc27a" intensity={0} distance={6} decay={1.5} />
      <pointLight ref={mirror} position={[MIRROR.x, 1.0, 0.45]} color="#ffd9a0" intensity={0} distance={3} decay={1.8} />
      {/* soft, shadowless night fill so no corner falls into black */}
      <pointLight ref={fill} position={[W / 2, 2.3, D / 2]} color="#d9b48c" intensity={0} distance={9} decay={1.1} />
      <pointLight ref={screen} position={[CHAIR[0], 0.95, D - 0.55]} color={ROOM.screenGlow} intensity={0} distance={2} decay={2} />
    </>
  );
}
