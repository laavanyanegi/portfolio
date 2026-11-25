"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Performance: the room is built from hundreds of small blocks, and the browser draws each one
 * separately, once for the picture and again for every shadow. Once the room has mounted, this merges
 * all the plain, still blocks (one colour, no picture, no glow, not moving, not clickable) into a few
 * big pieces, keeping each block's colour. The originals are only hidden, never removed.
 *
 * Merging never crosses a `batchBoundary` group (a CutWall or a hover Glow), so hiding a wall and the
 * hover highlight keep working on the merged pieces. Anything under a `dynamic` group (clock hands,
 * the door leaf, the light switch) is left alone.
 */

type Bucket = {
  parent: THREE.Object3D;
  mat: THREE.MeshStandardMaterial;
  /** a glow: the merged piece keeps the original (animated) material, so no per-block colours */
  shared: boolean;
  ownGlow: boolean;
  cast: boolean;
  receive: boolean;
  parts: THREE.BufferGeometry[];
};

function plain(m: THREE.Material | THREE.Material[]): m is THREE.MeshStandardMaterial {
  if (Array.isArray(m) || m.type !== "MeshStandardMaterial") return false;
  const s = m as THREE.MeshStandardMaterial;
  return (
    !s.map &&
    !s.emissiveMap &&
    !s.alphaMap &&
    !s.normalMap &&
    !s.transparent &&
    s.opacity === 1 &&
    s.alphaTest === 0 &&
    s.colorWrite &&
    s.depthWrite &&
    !s.vertexColors &&
    s.emissive.r + s.emissive.g + s.emissive.b === 0
  );
}

/** A night glow (NightGlow): identical ones can share one merged piece and keep glowing together. */
function glow(m: THREE.Material | THREE.Material[]): m is THREE.MeshStandardMaterial {
  if (Array.isArray(m) || m.type !== "MeshStandardMaterial") return false;
  const s = m as THREE.MeshStandardMaterial;
  return !!s.userData.glowKey && !s.map && !s.transparent && s.colorWrite && s.depthWrite;
}

/** Has React Three Fiber pointer handlers (clickable/hoverable): must stay its own object. */
function interactive(o: THREE.Object3D) {
  const h = (o as unknown as { __r3f?: { handlers?: Record<string, unknown> } }).__r3f?.handlers;
  return !!h && Object.keys(h).length > 0;
}

export function batchStatic(root: THREE.Object3D) {
  root.updateMatrixWorld(true);
  const buckets = new Map<string, Bucket>();
  const inv = new THREE.Matrix4();
  const rel = new THREE.Matrix4();
  const hidden: { mesh: THREE.Mesh; cast: boolean }[] = [];

  const visit = (o: THREE.Object3D, boundary: THREE.Object3D) => {
    if (o.userData.dynamic || !o.visible || interactive(o)) return;
    if (o !== root && o.userData.batchBoundary) boundary = o;
    const mesh = o as THREE.Mesh;
    const single = mesh.isMesh && !(o as THREE.InstancedMesh).isInstancedMesh;
    const isPlain = single && !o.userData.ownGlow && plain(mesh.material);
    const isGlow = single && !isPlain && glow(mesh.material);
    if (isPlain || isGlow) {
      const m = mesh.material as THREE.MeshStandardMaterial;
      const key = isGlow
        ? [boundary.uuid, "glow", m.userData.glowKey, !!o.userData.ownGlow, mesh.castShadow, mesh.receiveShadow].join("|")
        : [boundary.uuid, m.roughness, m.metalness, m.side, m.flatShading, mesh.castShadow, mesh.receiveShadow].join("|");
      let b = buckets.get(key);
      if (!b) {
        b = {
          parent: boundary,
          mat: isGlow
            ? m
            : new THREE.MeshStandardMaterial({ vertexColors: true, roughness: m.roughness, metalness: m.metalness, side: m.side, flatShading: m.flatShading }),
          shared: isGlow,
          ownGlow: !!o.userData.ownGlow,
          cast: mesh.castShadow,
          receive: mesh.receiveShadow,
          parts: [],
        };
        buckets.set(key, b);
      }
      // the block's shape, placed where it sits inside its boundary group, painted its colour
      inv.copy(boundary.matrixWorld).invert();
      rel.multiplyMatrices(inv, mesh.matrixWorld);
      let g = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
      for (const name of Object.keys(g.attributes)) if (name !== "position" && name !== "normal") g.deleteAttribute(name);
      g.morphAttributes = {};
      g.clearGroups();
      g.applyMatrix4(rel);
      if (rel.determinant() < 0) g = flipWinding(g); // mirrored blocks would otherwise face inside out
      if (!isGlow) {
        const n = g.attributes.position.count;
        const col = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) col.set([m.color.r, m.color.g, m.color.b], i * 3);
        g.setAttribute("color", new THREE.BufferAttribute(col, 3));
      }
      b.parts.push(g);
      hidden.push({ mesh, cast: mesh.castShadow });
      mesh.visible = false;
      mesh.castShadow = false;
    }
    for (const c of o.children) visit(c, boundary);
  };
  visit(root, root);

  const made: THREE.Mesh[] = [];
  for (const b of buckets.values()) {
    const geo = mergeGeometries(b.parts);
    b.parts.forEach((p) => p.dispose());
    if (!geo) continue;
    geo.computeBoundingSphere();
    const merged = new THREE.Mesh(geo, b.mat);
    merged.castShadow = b.cast;
    merged.receiveShadow = b.receive;
    merged.userData.batched = true;
    if (b.ownGlow) merged.userData.ownGlow = true;
    if (b.shared) merged.userData.sharedMaterial = true; // still owned (and animated) by its NightGlow
    b.parent.add(merged);
    made.push(merged);
  }
  // undo (unmount, or React running effects twice while developing): show the originals again
  return () => {
    for (const { mesh, cast } of hidden) {
      mesh.visible = true;
      mesh.castShadow = cast;
    }
    for (const m of made) {
      m.removeFromParent();
      m.geometry.dispose();
      if (!m.userData.sharedMaterial) (m.material as THREE.Material).dispose();
    }
  };
}

function flipWinding(g: THREE.BufferGeometry) {
  for (const name of ["position", "normal"]) {
    const a = g.attributes[name] as THREE.BufferAttribute;
    const arr = a.array as Float32Array;
    for (let t = 0; t < a.count; t += 3) {
      for (let k = 0; k < 3; k++) {
        const i1 = (t + 1) * 3 + k;
        const i2 = (t + 2) * 3 + k;
        const tmp = arr[i1];
        arr[i1] = arr[i2];
        arr[i2] = tmp;
      }
    }
    a.needsUpdate = true;
  }
  return g;
}

/** Wraps a static part of the room and merges its plain blocks once it has mounted. */
export default function StaticBatch({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    return batchStatic(ref.current);
  }, []);
  return <group ref={ref}>{children}</group>;
}
