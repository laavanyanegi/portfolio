"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ROOM } from "@/lib/roomPalette";
import { useUI, type Spot } from "@/store/ui";
import type { V3 } from "./dims";

/** `turning`: how far (radians) the camera still has to turn to reach the current view; 0 once settled.
 *  `planeCut`: during the entrance a wall is only cut once the camera is above it and has passed
 *  over it (so first-person shots show every wall, and nothing flickers as the camera rises).
 *  `inside`: phones, where the visitor stays in the room (on the bed): no wall is cut and the ceiling shows. */
export const cameraMotion = { turning: 0, planeCut: false, inside: false };

/** 0 = day, 1 = night. Fades over ~1s; read it inside useFrame. */
export const NightCtx = createContext<{ current: number }>({ current: 0 });
export const useNight = () => useContext(NightCtx);

export function Box({
  p,
  s,
  c,
  r,
  cast = true,
  receive = true,
  children,
}: {
  p: V3;
  s: V3;
  c?: string;
  r?: V3;
  cast?: boolean;
  receive?: boolean;
  children?: ReactNode;
}) {
  return (
    <mesh position={p} rotation={r} castShadow={cast} receiveShadow={receive}>
      <boxGeometry args={s} />
      {children ?? <meshStandardMaterial color={c} roughness={0.85} />}
    </mesh>
  );
}

export function Cyl({
  p,
  rt,
  rb,
  h,
  c,
  cast = true,
  seg = 10,
  children,
}: {
  p: V3;
  rt: number;
  rb: number;
  h: number;
  c?: string;
  cast?: boolean;
  seg?: number;
  children?: ReactNode;
}) {
  return (
    <mesh position={p} castShadow={cast} receiveShadow>
      <cylinderGeometry args={[rt, rb, h, seg]} />
      {children ?? <meshStandardMaterial color={c} roughness={0.8} />}
    </mesh>
  );
}

export function Plant({ p, s = 1 }: { p: V3; s?: number }) {
  return (
    <group position={p} scale={s}>
      <Cyl p={[0, 0.14, 0]} rt={0.14} rb={0.11} h={0.28} c={ROOM.pot} />
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.07, 0.42, Math.sin(a) * 0.07]}
            rotation={[Math.sin(a) * 0.4, 0, Math.cos(a) * 0.4]}
            castShadow
          >
            <coneGeometry args={[0.07, 0.36, 4]} />
            <meshStandardMaterial color={ROOM.plant} roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}

/** A material that glows at night (lamp shades, screens). */
export function NightGlow({
  color,
  glow,
  day = 0,
  night,
  side,
}: {
  color: string;
  glow: string;
  day?: number;
  night: number;
  side?: THREE.Side;
}) {
  const t = useNight();
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    if (ref.current) ref.current.emissiveIntensity = day + (night - day) * t.current;
  });
  // glowKey: StaticBatch may merge identical glows (e.g. the mirror bulbs) into one piece that keeps this material
  return (
    <meshStandardMaterial
      ref={ref}
      color={color}
      emissive={glow}
      emissiveIntensity={day}
      side={side}
      userData={{ glowKey: `${color}|${glow}|${day}|${night}|${side ?? 0}` }}
    />
  );
}

/** Gentle lavender highlight on a room spot while its label or nav button is hovered (eases in/out ~0.4s). */
export function Glow({ spot, children }: { spot: Spot; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const amt = useRef(0);
  const shown = useRef(-1);
  useFrame((_, dt) => {
    const on = useUI.getState().hoverSpot === spot ? 1 : 0;
    amt.current += (on - amt.current) * Math.min(1, dt * 5);
    if (Math.abs(amt.current - shown.current) < 0.002) return;
    shown.current = amt.current;
    ref.current?.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (!m || !("emissive" in m) || o.userData.ownGlow) return;
      m.emissive.set(ROOM.glow);
      m.emissiveIntensity = amt.current * 0.12;
    });
  });
  // a boundary for StaticBatch: merged blocks stay inside it, so they still light up on hover
  return (
    <group ref={ref} userData={{ batchBoundary: true }}>
      {children}
    </group>
  );
}
