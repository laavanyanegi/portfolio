"use client";

import { useLayoutEffect, useMemo, useRef, memo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Wall } from "@/store/ui";
import { D, H, W } from "./dims";
import { cameraMotion, NightGlow } from "./parts";
import { CutWall } from "./Shell";

/**
 * Warm fairy lights strung along the top of all four walls, pinned to the ceiling line and
 * swagging between the pins (from the bed-wall shelf reference). Each wall's string hides with its wall,
 * and all of them switch off while the room is turning to another view.
 */

const PIN_GAP = 0.75; // metres between ceiling pins
const SAG = 0.13; // how far the wire droops between pins
const BULB_GAP = 0.16;

type Run = { start: THREE.Vector3; along: THREE.Vector3; inward: THREE.Vector3; len: number };

const RUNS: Record<Wall, Run> = {
  north: { start: new THREE.Vector3(0, 0, 0), along: new THREE.Vector3(1, 0, 0), inward: new THREE.Vector3(0, 0, 1), len: W },
  south: { start: new THREE.Vector3(0, 0, D), along: new THREE.Vector3(1, 0, 0), inward: new THREE.Vector3(0, 0, -1), len: W },
  west: { start: new THREE.Vector3(0, 0, 0), along: new THREE.Vector3(0, 0, 1), inward: new THREE.Vector3(1, 0, 0), len: D },
  east: { start: new THREE.Vector3(W, 0, 0), along: new THREE.Vector3(0, 0, 1), inward: new THREE.Vector3(-1, 0, 0), len: D },
};

/** Point on the wire `s` metres along the wall. */
function wireAt(run: Run, s: number, span: number, drop = 0) {
  const f = (s % span) / span;
  const y = H - 0.04 - SAG * 4 * f * (1 - f) - drop;
  return run.start.clone().addScaledVector(run.along, s).addScaledVector(run.inward, 0.035).setY(y);
}

function LightString({ wall }: { wall: Wall }) {
  const run = RUNS[wall];
  const span = run.len / Math.round(run.len / PIN_GAP);
  const wire = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let s = 0.04; s <= run.len - 0.04; s += 0.03) pts.push(wireAt(run, s, span));
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: "#2a2420" }));
  }, [run, span]);
  const bulbs = useMemo(() => {
    const n = Math.round(run.len / BULB_GAP);
    return Array.from({ length: n }, (_, i) => wireAt(run, ((i + 0.5) * run.len) / n, span, 0.022));
  }, [run, span]);

  const mesh = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const o = new THREE.Object3D();
    bulbs.forEach((p, i) => {
      o.position.copy(p);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [bulbs]);

  return (
    <CutWall side={wall}>
      <primitive object={wire} />
      <instancedMesh ref={mesh} args={[undefined, undefined, bulbs.length]} frustumCulled={false} userData={{ ownGlow: true }}>
        <sphereGeometry args={[0.022, 6, 4]} />
        <NightGlow color="#fff2c8" glow="#ffc864" day={0.55} night={2.4} />
      </instancedMesh>
    </CutWall>
  );
}

function FairyLights() {
  const ref = useRef<THREE.Group>(null);
  const settled = useRef(1); // seconds since the camera finished turning
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    // off the moment a turn starts, back on just after the room settles in its new view
    settled.current = cameraMotion.turning > 0.01 ? 0 : settled.current + dt;
    g.visible = settled.current > 0.15;
  });
  return (
    <group ref={ref}>
      {(["north", "south", "west", "east"] as Wall[]).map((w) => (
        <LightString key={w} wall={w} />
      ))}
    </group>
  );
}

// the room never changes after it's built: skip re-rendering it when its parent does
export default memo(FairyLights);
