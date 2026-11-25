"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import type { Spot } from "@/store/ui";
import { useLook } from "@/store/look";
import { BED_EYE, CHAIR, type V3 } from "./dims";
import { wrap } from "./laavanya";
import { cameraMotion } from "./parts";

/**
 * Phones: the visitor sits on the foot end of the bed (north-west corner, BED_EYE) and looks at
 * Laavanya spinning in her chair, first person. The 360° orb (or dragging the room) turns their head;
 * opening a section turns the view to its spot and zooms in, without leaving the bed.
 */

/** What "facing Laavanya" looks at: her, in the chair. */
export const BED_HOME_LOOK: V3 = [CHAIR[0], 0.85, CHAIR[2]];

/** Turn direction (yaw: 0 = +z, π/2 = +x) and up/down tilt from the bed to a point. */
export function bedAim(p: V3) {
  const dx = p[0] - BED_EYE[0];
  const dy = p[1] - BED_EYE[1];
  const dz = p[2] - BED_EYE[2];
  return { yaw: Math.atan2(dx, dz), pitch: Math.atan2(dy, Math.hypot(dx, dz)), dist: Math.hypot(dx, dy, dz) };
}

/** Field of view (vertical, degrees) from the bed: wide enough on a tall phone to see her and the desk. */
export function bedFov(aspect: number) {
  return Math.max(55, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(20)) / aspect)));
}

/** Opening a section from the bed: where to look, and how many metres should fit across the screen. */
const BED_SHOTS: Record<Spot, { look: V3; width: number }> = {
  work: { look: [3.1, 1.0, 4.55], width: 1.4 }, // the laptop, her in front of it
  about: { look: [0.45, 1.05, 1.85], width: 1.6 }, // the bookshelf, her beside it
  creatives: { look: [0.15, 1.95, 0.62], width: 1.9 }, // the gallery over the bed, behind the visitor
  contact: { look: [6.0, 1.1, 4.25], width: 1.7 }, // the entry door, her inside it
};

/** Vertical field of view that fits `width` metres across the narrower screen side, `dist` away. */
function shotFov(width: number, dist: number, aspect: number, max: number) {
  const half = Math.atan(width / 2 / dist);
  const v = aspect < 1 ? 2 * Math.atan(Math.tan(half) / aspect) : 2 * half;
  return Math.min(max, Math.max(18, THREE.MathUtils.radToDeg(v)));
}

export default function BedCamera({
  active,
  section,
  reducedMotion,
}: {
  active: boolean;
  section: Spot | null;
  reducedMotion: boolean;
}) {
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const size = useThree((s) => s.size);
  const home = useMemo(() => bedAim(BED_HOME_LOOK), []);
  const yaw = useRef(home.yaw);
  const pitch = useRef(home.pitch);
  const fov = useRef(bedFov(size.width / size.height));
  const snap = useRef(6); // the first frames jump straight to the goal (deep links)
  const dir = useMemo(() => new THREE.Vector3(), []);
  const eye = useMemo(() => new THREE.Vector3(...BED_EYE), []);

  // opening a section turns away from wherever the visitor was looking; coming home faces her again
  useEffect(() => {
    if (section) useLook.getState().recentre();
  }, [section]);

  useFrame((_, dt) => {
    const c = cam.current;
    if (!c) return;
    cameraMotion.turning = 0; // no dollhouse turns here (a stale value would keep the fairy lights off)
    const jump = reducedMotion || snap.current > 0;
    if (snap.current > 0) snap.current--;
    const aspect = size.width / size.height;
    const base = bedFov(aspect);

    let gYaw: number, gPitch: number, gFov: number;
    if (section) {
      const shot = BED_SHOTS[section];
      const aim = bedAim(shot.look);
      gYaw = aim.yaw;
      gPitch = aim.pitch;
      gFov = shotFov(shot.width, aim.dist, aspect, base);
    } else {
      const look = useLook.getState();
      gYaw = home.yaw + look.yaw;
      gPitch = home.pitch + look.pitch;
      gFov = base;
    }
    // following a drag is quick; turning to a section (and back) is slower, like the desktop close-ups
    const k = jump ? 1 : 1 - Math.exp(-dt * (section ? 3.2 : 9));
    const kz = jump ? 1 : 1 - Math.exp(-dt * 3.2);
    yaw.current += wrap(gYaw - yaw.current) * k;
    pitch.current += (gPitch - pitch.current) * k;
    fov.current = Math.exp(Math.log(fov.current) + (Math.log(gFov) - Math.log(fov.current)) * kz);

    c.position.copy(eye);
    dir.set(
      Math.sin(yaw.current) * Math.cos(pitch.current),
      Math.sin(pitch.current),
      Math.cos(yaw.current) * Math.cos(pitch.current),
    );
    c.lookAt(dir.add(eye));
    if (Math.abs(c.fov - fov.current) > 0.001) {
      c.fov = fov.current;
      c.updateProjectionMatrix();
    }
  });

  return (
    <PerspectiveCamera
      ref={cam}
      makeDefault={active}
      fov={60}
      near={0.05}
      far={40}
      position={BED_EYE}
    />
  );
}
