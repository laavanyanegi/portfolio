"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";
import { useUI, VIEW_WALLS, type Spot } from "@/store/ui";
import { CENTER } from "./dims";
import { cameraMotion } from "./parts";
import { SECTION_SHOTS } from "./sections";

const VIEW_A = (3 * Math.PI) / 4; // from the north-east, looking into the study + balcony corner
const POLAR = 1.0;
const R = 20;

export type Drag = { az: number; pol: number };

/** Home framing: the zoom, and how much of the width the section buttons take (the room centres left of them). */
export function homeFraming(width: number, height: number) {
  const nav = width >= 768 ? 240 : 0;
  return { nav, zoom: Math.min((width - nav) / 9.2, height / 7.4) }; // leaves headroom for the signs
}
export const HOME_VIEW = { az: VIEW_A, polar: POLAR };

/**
 * Isometric (orthographic) dollhouse camera. Each turn moves it 90° round the room to the next corner;
 * dragging adds a small look-around offset that eases back to centre on each flip.
 * With a section open it closes in on that section's spot (turning to the nearest view that shows its
 * wall), and pulls back out to the whole room on the way home. Deep links start already there.
 */
export default function CameraRig({
  dragRef,
  reducedMotion,
  active = true,
  section = null,
}: {
  dragRef: { current: Drag };
  reducedMotion: boolean;
  /** false while the entrance's first-person camera is in use */
  active?: boolean;
  /** the open section (from the route), or null on home */
  section?: Spot | null;
}) {
  const cam = useRef<THREE.OrthographicCamera>(null);
  const turns = useUI((s) => s.turns);
  const turnAz = useRef(VIEW_A);
  const dragAz = useRef(0);
  const lastTurns = useRef(turns);
  const size = useThree((s) => s.size);
  const focus = useMemo(() => new THREE.Vector3(...CENTER), []);
  const goal = useMemo(() => new THREE.Vector3(), []);
  const zoomMul = useRef(1);
  const navShift = useRef(1); // the room sits left of the section buttons on home, centred in a section
  const snap = useRef(6); // the first frames jump straight to the goal (deep links)

  // a section's spot must be in view: turn to the nearest view that shows its wall
  useEffect(() => {
    if (!section) return;
    const wall = SECTION_SHOTS[section].wall;
    const now = useUI.getState().turns;
    const fit = [0, 1, -1, 2, -2].map((d) => now + d).find((t) => VIEW_WALLS[((t % 4) + 4) % 4].includes(wall));
    if (fit !== undefined && fit !== now) useUI.setState({ turns: fit, view: ((fit % 4) + 4) % 4 });
  }, [section]);

  // a flip clears the drag offset
  useEffect(() => {
    if (turns !== lastTurns.current) {
      lastTurns.current = turns;
      dragRef.current = { az: 0, pol: 0 };
    }
  }, [turns, dragRef]);

  useFrame((_, dt) => {
    const c = cam.current;
    if (!c) return;
    const jump = reducedMotion || snap.current > 0;
    if (snap.current > 0) snap.current--;
    const base = VIEW_A + turns * (Math.PI / 2);
    const k = jump ? 1 : 1 - Math.exp(-dt * 5);
    const kz = jump ? 1 : 1 - Math.exp(-dt * 3.2); // closing in / pulling back: a little slower than a turn
    turnAz.current += (base - turnAz.current) * k;
    dragAz.current += (dragRef.current.az - dragAz.current) * k;
    cameraMotion.turning = Math.abs(base - turnAz.current);

    const shot = section ? SECTION_SHOTS[section] : null;
    goal.set(...(shot ? shot.focus : CENTER));
    focus.lerp(goal, kz);
    zoomMul.current = Math.exp(Math.log(zoomMul.current) + (Math.log(shot ? shot.zoom : 1) - Math.log(zoomMul.current)) * kz);
    navShift.current += ((shot ? 0 : 1) - navShift.current) * kz;

    // on desktop the section buttons sit on the right, so on home the room centres in the space left of them
    const { nav, zoom } = homeFraming(size.width, size.height);
    c.zoom = zoom * zoomMul.current;
    const shift = (nav / 2) * navShift.current;
    if (shift > 0.5) c.setViewOffset(size.width, size.height, shift, 0, size.width, size.height);
    else c.clearViewOffset();
    c.updateProjectionMatrix();

    const az = turnAz.current + dragAz.current;
    const pol = POLAR + dragRef.current.pol;
    c.position.set(
      focus.x + R * Math.sin(pol) * Math.sin(az),
      focus.y + R * Math.cos(pol),
      focus.z + R * Math.sin(pol) * Math.cos(az),
    );
    c.lookAt(focus);
  });

  return <OrthographicCamera ref={cam} makeDefault={active} near={0.1} far={60} position={[0, 10, 0]} />;
}
