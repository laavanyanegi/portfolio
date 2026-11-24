"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import type * as THREE from "three";
import { useUI } from "@/store/ui";
import { CENTER } from "./dims";
import { cameraMotion } from "./parts";

const VIEW_A = (3 * Math.PI) / 4; // from the north-east, looking into the study + balcony corner
const POLAR = 1.0;
const R = 20;

export type Drag = { az: number; pol: number };

/**
 * Isometric (orthographic) dollhouse camera. Each turn moves it 90° round the room to the next corner;
 * dragging adds a small look-around offset that eases back to centre on each flip.
 */
export default function CameraRig({ dragRef, reducedMotion }: { dragRef: { current: Drag }; reducedMotion: boolean }) {
  const cam = useRef<THREE.OrthographicCamera>(null);
  const turns = useUI((s) => s.turns);
  const turnAz = useRef(VIEW_A);
  const dragAz = useRef(0);
  const lastTurns = useRef(turns);
  const size = useThree((s) => s.size);

  // a flip clears the drag offset
  useEffect(() => {
    if (turns !== lastTurns.current) {
      lastTurns.current = turns;
      dragRef.current = { az: 0, pol: 0 };
    }
  }, [turns, dragRef]);

  useEffect(() => {
    const c = cam.current;
    if (!c) return;
    // on desktop the section buttons sit on the right, so centre the room in the space left of them
    const nav = size.width >= 768 ? 240 : 0;
    c.zoom = Math.min((size.width - nav) / 9.2, size.height / 7.4); // leaves headroom for the signs
    if (nav) c.setViewOffset(size.width, size.height, nav / 2, 0, size.width, size.height);
    else c.clearViewOffset();
    c.updateProjectionMatrix();
  }, [size.width, size.height]);

  useFrame((_, dt) => {
    const c = cam.current;
    if (!c) return;
    const base = VIEW_A + turns * (Math.PI / 2);
    const k = reducedMotion ? 1 : 1 - Math.exp(-dt * 5);
    turnAz.current += (base - turnAz.current) * k;
    dragAz.current += (dragRef.current.az - dragAz.current) * k;
    cameraMotion.turning = Math.abs(base - turnAz.current);
    const az = turnAz.current + dragAz.current;
    const pol = POLAR + dragRef.current.pol;
    c.position.set(
      CENTER[0] + R * Math.sin(pol) * Math.sin(az),
      CENTER[1] + R * Math.cos(pol),
      CENTER[2] + R * Math.sin(pol) * Math.cos(az),
    );
    c.lookAt(CENTER[0], CENTER[1], CENTER[2]);
  });

  return <OrthographicCamera ref={cam} makeDefault near={0.1} far={60} position={[0, 10, 0]} />;
}
