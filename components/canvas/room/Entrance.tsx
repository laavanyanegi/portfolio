"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { ROOM } from "@/lib/roomPalette";
import { useIntro } from "@/store/intro";
import { CENTER, ENTRY_DOOR, T, W } from "./dims";
import { GREET_SPOT, lerp, placeOnChair, sitSpot, smooth as sm, standing, wrap } from "./laavanya";
import { cameraMotion, useNight } from "./parts";
import { CutWall } from "./Shell";
import { HOME_VIEW, homeFraming } from "./CameraRig";

/**
 * The entrance: the visitor stands outside the entry door (closet wall, east), knocks, the door
 * swings in, and Laavanya, standing just inside, says hello. Then she walks to her chair, turns and
 * sits down (her drawing lowers into the seat as her seated model fades in);
 * the camera follows her in, rises over the walls and swings out to the home corner view in one
 * move. It ends in a dolly zoom (far away, narrow angle), so the hand-off to the isometric home
 * camera is seamless.
 */

const DOOR_Z = (ENTRY_DOOR.z0 + ENTRY_DOOR.z1) / 2;

/* ───────── standing Laavanya: a flat sprite from her standing drawings ───────── */

/**
 * Tiles in public/character/standing.webp (made by scripts/standing-sprite.mjs, 6 × 3 grid):
 * standing still from each side, then her walk frames from each side. "left" = facing screen-left.
 */
const COLS = 6;
const ROWS = 3;
const STAND = { front: 0, back: 1, left: 2, right: 3 } as const;
const WALK_FRAMES = { front: [4, 5], back: [6, 7, 8, 9], left: [10, 11, 12, 13], right: [14, 15, 16] } as const;
const STEP_FPS = 7; // walk frames per second
const HEIGHT = 1.655; // the tile's height in metres (she is ~1.62 m; the tile has a little headroom)
const ASPECT = 264 / 480;


export function StandingLaavanya({ visible }: { visible: boolean }) {
  const tex = useTexture("/character/standing.webp", (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    t.repeat.set(1 / COLS, 1 / ROWS);
  });
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const shadow = useRef<THREE.MeshBasicMaterial>(null);
  const night = useNight();

  useFrame(({ camera, clock }) => {
    useIntro.getState().setReady(); // she has loaded, so the door can be knocked
    const g = group.current;
    const m = mat.current;
    if (!g || !m) return;
    // as she sits down she lowers into the seat and fades, while her seated model fades in
    const op = 1 - sm(standing.seat, 0.3, 0.95);
    m.opacity = op;
    m.transparent = op < 1;
    m.alphaTest = Math.max(0.02, 0.5 * op);
    if (shadow.current) shadow.current.opacity = 0.22 * op;
    // her own glow keeps the drawing readable by day; at night the warm grade and lamps light her enough
    m.emissiveIntensity = 0.35 - 0.27 * night.current;
    g.visible = visible && op > 0.02;
    if (!g.visible) return;
    const toCam = Math.atan2(camera.position.x - standing.x, camera.position.z - standing.z);
    // which drawing: from where the camera stands relative to the way she faces
    const rel = wrap(toCam - standing.heading);
    const a = Math.abs(rel);
    const side = a < Math.PI / 4 ? "front" : a > (3 * Math.PI) / 4 ? "back" : rel > 0 ? "left" : "right";
    const frames = WALK_FRAMES[side];
    const tile = standing.walking ? frames[Math.floor(clock.elapsedTime * STEP_FPS) % frames.length] : STAND[side];
    if (m.map) m.map.offset.set((tile % COLS) / COLS, 1 - (Math.floor(tile / COLS) + 1) / ROWS);
    g.position.set(standing.x, -0.3 * sm(standing.seat, 0, 1), standing.z);
    g.rotation.y = toCam; // always face the camera (turning about the vertical only)
  });

  return (
    <group ref={group}>
      <mesh position={[0, HEIGHT / 2, 0]}>
        <planeGeometry args={[HEIGHT * ASPECT, HEIGHT]} />
        <meshStandardMaterial
          ref={mat}
          map={tex}
          emissiveMap={tex}
          emissive="#ffffff"
          emissiveIntensity={0.35}
          alphaTest={0.5}
          roughness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* soft contact shadow under her feet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <circleGeometry args={[0.2, 16]} />
        <meshBasicMaterial ref={shadow} color="#000000" transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ───────── the greeting ───────── */

/** Pins the speech bubble (drawn in the page by EntryOverlay, id "speech-bubble") above her head. */
export function SpeechBubbleTracker() {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    const el = document.getElementById("speech-bubble");
    if (!el) return;
    v.set(standing.x, HEIGHT + 0.06, standing.z).project(camera);
    el.style.transform = `translate(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px) translate(-50%, -100%)`;
  });
  return null;
}

/* ───────── outside the door ───────── */

/**
 * Only what the door view needs: the outside face of the closet wall, a strip of floor and a doormat.
 * It hides with the closet wall once the camera has risen over it.
 */
export function DoorOutside() {
  const t = useNight();
  const light = useRef<THREE.PointLight>(null);
  useFrame(() => {
    if (light.current) light.current.intensity = 1.6 - 0.9 * t.current; // the night grade brightens warm light a lot
  });
  return (
    <CutWall side="east">
      {/* outside face of the wall, wide enough to fill the screen */}
      {[
        // [centre z, centre y, width, height]: left of the doorway, right of it, above it
        [(ENTRY_DOOR.z0 + DOOR_Z - 6) / 2, 1.6, ENTRY_DOOR.z0 - (DOOR_Z - 6), 3.2],
        [(ENTRY_DOOR.z1 + DOOR_Z + 6) / 2, 1.6, DOOR_Z + 6 - ENTRY_DOOR.z1, 3.2],
        [DOOR_Z, (ENTRY_DOOR.h + 3.2) / 2, ENTRY_DOOR.z1 - ENTRY_DOOR.z0, 3.2 - ENTRY_DOOR.h],
      ].map(([z, y, w, h], i) => (
        <mesh key={i} position={[W + T + 0.002, y, z]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial color={ROOM.wall} roughness={0.95} />
        </mesh>
      ))}
      {/* floor outside */}
      <mesh position={[W + T + 2, -0.001, DOOR_Z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4, 12]} />
        <meshStandardMaterial color={ROOM.floorSide} roughness={0.9} />
      </mesh>
      {/* doormat */}
      <mesh position={[W + T + 0.4, 0.008, DOOR_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.55, 0.85]} />
        <meshStandardMaterial color="#6b5236" roughness={1} />
      </mesh>
      {/* a soft warm light over the door */}
      <pointLight ref={light} position={[W + T + 0.7, 2.5, DOOR_Z]} color="#ffd7a0" distance={4} decay={1.6} />
    </CutWall>
  );
}

/* ───────── camera ───────── */

const EYE = 1.5;
const FOV = 50;
/** On tall, narrow (phone) screens the view widens so the doorway and Laavanya still fit side to side. */
const fovFor = (aspect: number) => Math.max(FOV, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(21)) / aspect)));
const FAR_X = W + T + 2.55; // knocking: the door fills most of the screen
const NEAR_X = W + T + 1.55; // after it opens: a step closer, so she is framed in the doorway
const GREET_TIME = 1.4; // seconds the greeting stays before she leads the way in (a click skips ahead)
const WALK_TIME = 2.7; // the whole walk-in, door to home view
const R_FAR = 600; // the dolly zoom ends this far away, where perspective is practically isometric

/**
 * The walk-in, e seconds after it began: she turns from the door (0–0.3s), walks to the spot in front
 * of her chair (0.15–1.45s), turns her back to the chair to face the room's home corner (1.45–1.75s),
 * then sits down (1.75–2.35s). The chair turns to meet her on the way.
 */
const SIT_FACE = HOME_VIEW.az; // she sits facing the home camera, then starts to spin
const WALK = [0.15, 1.45];
const TURN = [1.45, 1.75];
const SIT = [1.75, 2.35];
function walkHer(e: number) {
  const [gx, gz] = GREET_SPOT;
  const [sx, sz] = sitSpot(SIT_FACE);
  standing.chairFace = SIT_FACE;
  if (e < TURN[0]) {
    const k = sm(e, WALK[0], WALK[1]);
    standing.x = lerp(gx, sx, k);
    standing.z = lerp(gz, sz, k);
    const dir = Math.atan2(sx - gx, sz - gz);
    standing.heading = Math.PI / 2 + wrap(dir - Math.PI / 2) * sm(e, 0, 0.3);
    standing.walking = e > WALK[0];
    standing.seat = 0;
    return;
  }
  standing.walking = false;
  const dir = Math.atan2(sx - gx, sz - gz);
  standing.x = sx;
  standing.z = sz;
  standing.heading = dir + wrap(SIT_FACE - dir) * sm(e, TURN[0], TURN[1]);
  if (e >= SIT[0]) placeOnChair(SIT_FACE, sm(e, SIT[0], SIT[1]));
}

type Shot = { look: THREE.Vector3; r: number; pol: number; az: number; h: number };

export function EntryCamera({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const x = useRef(FAR_X);
  const look = useMemo(() => new THREE.Vector3(W, 1.12, DOOR_Z), []);
  const start = useRef<Shot | null>(null);
  const tgt = useMemo(() => new THREE.Vector3(), []);
  const follow = useMemo(() => new THREE.Vector3(), []);
  const center = useMemo(() => new THREE.Vector3(...CENTER), []);

  useEffect(() => {
    cameraMotion.planeCut = active;
    return () => {
      cameraMotion.planeCut = false;
    };
  }, [active]);

  useFrame(({ size }, dt) => {
    const intro = useIntro.getState();
    const c = cam.current;
    if (!c || !active) return;
    const { stage, since } = intro;
    const e = (performance.now() - since) / 1000;
    if (stage === "opening" && e > 0.85) intro.greet();
    if (stage === "greeting" && e > GREET_TIME) intro.walk();

    if (stage === "walking") {
      if (reducedMotion) {
        placeOnChair(SIT_FACE, 1);
        intro.finish();
        return;
      }
      // the walk-in starts from exactly where the camera is now
      if (!start.current) {
        const d = c.position.clone().sub(look);
        const r = d.length();
        start.current = {
          look: look.clone(),
          r,
          pol: Math.acos(d.y / r),
          az: Math.atan2(d.x, d.z),
          h: 2 * r * Math.tan(THREE.MathUtils.degToRad(c.fov / 2)),
        };
      }
      const s0 = start.current;
      walkHer(e);
      const u = Math.min(1, e / WALK_TIME);
      const { nav, zoom } = homeFraming(size.width, size.height);
      // look at her as she walks in, then at the middle of the room
      follow.set(standing.x, 1.15, standing.z);
      tgt.copy(s0.look).lerp(follow, sm(u, 0, 0.35)).lerp(center, sm(u, 0.3, 0.95));
      // rise first (so it clears the walls while still inside the room), swing round to the corner after
      const az = lerp(s0.az, HOME_VIEW.az, sm(u, 0.4, 0.95));
      const pol = lerp(s0.pol, HOME_VIEW.polar, sm(u, 0.1, 0.58));
      const r = Math.exp(lerp(Math.log(s0.r), Math.log(R_FAR), Math.pow(sm(u, 0.18, 1), 2.2)));
      // how much of the room fills the screen height, growing to the home view's framing
      const h = Math.exp(lerp(Math.log(s0.h), Math.log(size.height / zoom), sm(u, 0.15, 0.9)));
      c.position.set(
        tgt.x + r * Math.sin(pol) * Math.sin(az),
        tgt.y + r * Math.cos(pol),
        tgt.z + r * Math.sin(pol) * Math.cos(az),
      );
      c.lookAt(tgt);
      c.fov = THREE.MathUtils.radToDeg(2 * Math.atan(h / (2 * r)));
      c.near = Math.max(0.05, r - 15);
      c.far = r + 40;
      // slide the room left of the section buttons, as the home view does
      const shift = (nav / 2) * sm(u, 0.4, 1);
      if (shift > 0) c.setViewOffset(size.width, size.height, shift, 0, size.width, size.height);
      else c.clearViewOffset();
      c.updateProjectionMatrix();
      if (u >= 1) intro.finish();
      return;
    }

    start.current = null;
    const fov = fovFor(size.width / size.height);
    if (Math.abs(c.fov - fov) > 0.01) {
      c.fov = fov;
      c.updateProjectionMatrix();
    }
    const goal = stage === "opening" || stage === "greeting" ? NEAR_X : FAR_X;
    // a slow, smooth step forward as the door opens
    x.current += (goal - x.current) * Math.min(1, dt * 1.8);
    const k = (FAR_X - x.current) / (FAR_X - NEAR_X); // 0 → 1 as she comes into frame
    c.position.set(x.current, EYE, DOOR_Z);
    c.lookAt(look.set(W - 0.4 * k, 1.12 + 0.16 * k, DOOR_Z));
  });

  return <PerspectiveCamera ref={cam} makeDefault={active} fov={FOV} near={0.05} far={60} position={[FAR_X, EYE, DOOR_Z]} />;
}
