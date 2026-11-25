"use client";

import { useMemo, useRef, type ReactNode, memo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ROOM } from "@/lib/roomPalette";
import { planksTexture, skylineTexture } from "../textures";
import { BALCONY_DOOR, CENTER, D, ENTRY_DOOR, H, T, W, WINDOW, type V3 } from "./dims";
import { Box, cameraMotion, useNight } from "./parts";
import type { Wall } from "@/store/ui";

type Side = Wall;

/** Is the camera on the outside of this wall (so it is cut away)? */
function isCut(side: Side, p: THREE.Vector3) {
  if (cameraMotion.inside) return false;
  if (cameraMotion.planeCut) {
    if (p.y < H) return false;
    if (side === "west") return p.x < 0;
    if (side === "east") return p.x > W;
    if (side === "north") return p.z < 0;
    return p.z > D;
  }
  if (side === "west") return p.x < CENTER[0];
  if (side === "east") return p.x > CENTER[0];
  if (side === "north") return p.z < CENTER[2];
  return p.z > CENTER[2];
}

/** Phones look round the room from the bed, so the room gets a ceiling there (the dollhouse view has none). */
function Ceiling() {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const night = useNight();
  useFrame(() => {
    if (ref.current) ref.current.visible = cameraMotion.inside;
    // the lights mostly shine down, so the ceiling gets a soft glow of its own (dimmer at night)
    if (mat.current) mat.current.emissiveIntensity = 0.45 - 0.35 * night.current;
  });
  return (
    <mesh ref={ref} position={[W / 2, H, D / 2]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
      <planeGeometry args={[W + 2 * T, D + 2 * T]} />
      <meshStandardMaterial ref={mat} color={ROOM.wall} emissive={ROOM.wall} emissiveIntensity={0.45} roughness={0.95} />
    </mesh>
  );
}

/**
 * Dollhouse cut-away: a wall (and everything hung on it or standing against it) disappears while
 * the camera is on its outside. Walls keep casting shadows, so sunlight still only enters through
 * the balcony openings. A corner piece passes both its walls and hides only when both are cut.
 */
export function CutWall({
  side,
  children,
  dropShadows = false,
}: {
  side: Side | Side[];
  children: ReactNode;
  /** furniture: stop casting shadows while hidden, so no shadow appears from nothing */
  dropShadows?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const hidden = useRef<boolean | null>(null);
  const tick = useRef(0);
  useFrame(({ camera }) => {
    const h = (Array.isArray(side) ? side : [side]).every((s) => isCut(s, camera.position));
    // re-check every half second as well, so pieces that load later pick up the current state
    if (h === hidden.current && ++tick.current % 30 !== 0) return;
    hidden.current = h;
    ref.current?.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | undefined;
      if (!m || o.userData.cutHidden === h) return;
      o.userData.cutHidden = h;
      if (o.userData.baseDepthWrite === undefined) o.userData.baseDepthWrite = m.depthWrite;
      if (o.userData.baseCast === undefined) o.userData.baseCast = o.castShadow;
      m.colorWrite = !h;
      m.depthWrite = h ? false : o.userData.baseDepthWrite;
      if (dropShadows) o.castShadow = h ? false : o.userData.baseCast;
    });
  });
  return <group ref={ref}>{children}</group>;
}

type Opening = { a0: number; a1: number; y0: number; y1: number };

/** Boxes that make up a wall of length `len` with rectangular holes, measured along the wall. */
function pieces(len: number, openings: Opening[]) {
  const out: { a: number; y: number; la: number; ly: number }[] = [];
  let cursor = 0;
  for (const o of [...openings].sort((x, y) => x.a0 - y.a0)) {
    if (o.a0 > cursor) out.push({ a: (cursor + o.a0) / 2, y: H / 2, la: o.a0 - cursor, ly: H });
    if (o.y0 > 0) out.push({ a: (o.a0 + o.a1) / 2, y: o.y0 / 2, la: o.a1 - o.a0, ly: o.y0 });
    out.push({ a: (o.a0 + o.a1) / 2, y: (o.y1 + H) / 2, la: o.a1 - o.a0, ly: H - o.y1 });
    cursor = o.a1;
  }
  if (cursor < len) out.push({ a: (cursor + len) / 2, y: H / 2, la: len - cursor, ly: H });
  return out;
}

/** The view outside an opening: day picture with the night picture fading over it. */
function Outside({ p, w, h }: { p: V3; w: number; h: number }) {
  const sky = useMemo(() => ({ day: skylineTexture(false), night: skylineTexture(true) }), []);
  const t = useNight();
  const nightMat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    if (nightMat.current) nightMat.current.opacity = t.current;
  });
  return (
    <group position={p} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={sky.day} color="#fff4e6" />
      </mesh>
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial ref={nightMat} map={sky.night} transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Frame bars around an opening in the west wall. */
function Frame({ o, mullions }: { o: Opening; mullions: number[] }) {
  const f = 0.06;
  const x = -T / 2;
  const zc = (o.a0 + o.a1) / 2;
  const zw = o.a1 - o.a0;
  const hh = o.y1 - o.y0;
  const bars: [V3, V3][] = [
    [[x, o.y1 - f / 2, zc], [T + 0.02, f, zw]],
    [[x, o.y0 + f / 2, zc], [T + 0.02, f, zw]],
    [[x, (o.y0 + o.y1) / 2, o.a0 + f / 2], [T + 0.02, hh, f]],
    [[x, (o.y0 + o.y1) / 2, o.a1 - f / 2], [T + 0.02, hh, f]],
    [[x, (o.y0 + o.y1) / 2, zc], [T + 0.02, hh, f * 0.8]],
    ...mullions.map((y): [V3, V3] => [[x, y, zc], [T + 0.02, f * 0.6, zw]]),
  ];
  return (
    <>
      {bars.map(([p, s], i) => (
        <Box key={i} p={p} s={s} c={ROOM.frame} />
      ))}
    </>
  );
}

/** Two-tone curtains (dark outer, cream inner) on a rod, either side of an opening. */
function Curtains({ o, drop }: { o: Opening; drop: number }) {
  const zc = (o.a0 + o.a1) / 2;
  const top = Math.min(H - 0.15, o.y1 + 0.25);
  const panel = (z0: number, outerFirst: boolean, key: string) =>
    Array.from({ length: 6 }, (_, i) => (
      <Box
        key={`${key}-${i}`}
        p={[0.08 + (i % 2) * 0.04, top - drop / 2, z0 + i * 0.055]}
        s={[0.04, drop, 0.065]}
        c={(i < 3) === outerFirst ? ROOM.curtainDark : ROOM.curtainLight}
      />
    ));
  return (
    <group>
      {panel(o.a0 - 0.34, true, "a")}
      {panel(o.a1 + 0.01, false, "b")}
      <mesh position={[0.1, top + 0.02, zc]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, o.a1 - o.a0 + 0.9, 6]} />
        <meshStandardMaterial color={ROOM.rod} />
      </mesh>
    </group>
  );
}

function Shell() {
  const planks = useMemo(() => {
    const t = planksTexture();
    t.repeat.set(4, 3.2);
    return t;
  }, []);
  const capY = H + 0.015;
  const win: Opening = { a0: WINDOW.z0, a1: WINDOW.z1, y0: WINDOW.y0, y1: WINDOW.y1 };
  const door: Opening = { a0: BALCONY_DOOR.z0, a1: BALCONY_DOOR.z1, y0: 0, y1: BALCONY_DOOR.y1 };

  return (
    <group>
      {/* floor slab: planks on top, dark wood on the cut edges */}
      <mesh position={[W / 2, -0.075, D / 2]} receiveShadow>
        <boxGeometry args={[W + 2 * T, 0.15, D + 2 * T]} />
        {[0, 1, 2, 3, 4, 5].map((i) =>
          i === 2 ? (
            <meshStandardMaterial key={i} attach={`material-${i}`} map={planks} roughness={0.7} />
          ) : (
            <meshStandardMaterial key={i} attach={`material-${i}`} color={ROOM.floorSide} />
          ),
        )}
      </mesh>

      <Ceiling />

      {/* invisible ceiling: never drawn, but it blocks sunlight from the open top */}
      <mesh position={[W / 2, H + 0.1, D / 2]} castShadow>
        <boxGeometry args={[W + 4, 0.2, D + 4]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>

      {/* WEST: balcony wall with a window and a glass door */}
      <CutWall side="west">
        {pieces(D + 2 * T, [
          { ...win, a0: win.a0 + T, a1: win.a1 + T },
          { ...door, a0: door.a0 + T, a1: door.a1 + T },
        ]).map((b, i) => (
          <Box key={i} p={[-T / 2, b.y, b.a - T]} s={[T, b.ly, b.la]} c={ROOM.wall} />
        ))}
        <Box p={[-T / 2, capY, D / 2]} s={[T, 0.03, D + 2 * T]} c={ROOM.wallCap} cast={false} />
        <Outside p={[-T - 0.02, (win.y0 + win.y1) / 2, (win.a0 + win.a1) / 2]} w={win.a1 - win.a0} h={win.y1 - win.y0} />
        <Outside p={[-T - 0.02, door.y1 / 2, (door.a0 + door.a1) / 2]} w={door.a1 - door.a0} h={door.y1} />
        <Frame o={win} mullions={[]} />
        <Frame o={door} mullions={[0.95, 1.65]} />
        <Curtains o={win} drop={1.55} />
        <Curtains o={door} drop={2.45} />
        <Box p={[0.01, 0.04, win.a0 / 2]} s={[0.02, 0.08, win.a0]} c={ROOM.frame} cast={false} />
        <Box p={[0.01, 0.04, (win.a1 + door.a0) / 2]} s={[0.02, 0.08, door.a0 - win.a1]} c={ROOM.frame} cast={false} />
        <Box p={[0.01, 0.04, (door.a1 + D) / 2]} s={[0.02, 0.08, D - door.a1]} c={ROOM.frame} cast={false} />
        {/* balcony railing outside (only its shadow is seen from View A) */}
        {Array.from({ length: 22 }, (_, i) => (
          <Box key={`r${i}`} p={[-0.9, 0.5, 2.1 + i * 0.12]} s={[0.03, 1, 0.03]} c={ROOM.railing} />
        ))}
        <Box p={[-0.9, 1.0, 3.4]} s={[0.05, 0.05, 2.8]} c={ROOM.railing} />
      </CutWall>

      {/* SOUTH: study wall */}
      <CutWall side="south">
        <Box p={[W / 2, H / 2, D + T / 2]} s={[W + 2 * T, H, T]} c={ROOM.wall} />
        <Box p={[W / 2, capY, D + T / 2]} s={[W + 2 * T, 0.03, T]} c={ROOM.wallCap} cast={false} />
        <Box p={[W / 2, 0.04, D - 0.01]} s={[W, 0.08, 0.02]} c={ROOM.frame} cast={false} />
      </CutWall>

      {/* NORTH: bed wall */}
      <CutWall side="north">
        <Box p={[W / 2, H / 2, -T / 2]} s={[W + 2 * T, H, T]} c={ROOM.wall} />
        <Box p={[W / 2, capY, -T / 2]} s={[W + 2 * T, 0.03, T]} c={ROOM.wallCap} cast={false} />
        <Box p={[W / 2, 0.04, 0.01]} s={[W, 0.08, 0.02]} c={ROOM.frame} cast={false} />
      </CutWall>

      {/* EAST: closet wall */}
      <CutWall side="east">
        {pieces(D + 2 * T, [{ a0: ENTRY_DOOR.z0 + T, a1: ENTRY_DOOR.z1 + T, y0: 0, y1: ENTRY_DOOR.h }]).map((b, i) => (
          <Box key={i} p={[W + T / 2, b.y, b.a - T]} s={[T, b.ly, b.la]} c={ROOM.wall} />
        ))}
        <Box p={[W + T / 2, capY, D / 2]} s={[T, 0.03, D + 2 * T]} c={ROOM.wallCap} cast={false} />
        <Box p={[W - 0.01, 0.04, D / 2]} s={[0.02, 0.08, D]} c={ROOM.frame} cast={false} />
      </CutWall>
    </group>
  );
}

// the room never changes after it's built: skip re-rendering it when its parent does
export default memo(Shell);
