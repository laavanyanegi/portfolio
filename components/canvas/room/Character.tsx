"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { CHAIR } from "./dims";
import { RIG, VIEW, type P3 } from "./characterRig";

/**
 * Laavanya in her desk chair, as a 3D model built to the measurements in characterRig.ts and painted
 * with her own pixel-art drawings (public/character/atlas.webp, made by scripts/character-atlas.mjs).
 * The painting follows the viewing angle: seen from the front she wears the front drawing, from three-
 * quarters the three-quarter drawing, from the side the side drawing, cross-fading as she turns.
 * The room's pixel filter does the rest. She faces +z in her own space; her left hand is on +x.
 */

const C = {
  frame: "#161415",
  chair: "#1f1c1d",
  mesh: "#2a2628",
  seat: "#33241e",
  braid: "#3a2418",
  watch: "#1b1918",
  beadA: "#9cc79a",
  beadB: "#efe4cf",
  pearl: "#f6f1e7",
};

/* ───────── geometry helpers (all in her own space) ───────── */

const V = (p: P3) => new THREE.Vector3(p[0], p[1], p[2]);
const mirror = (p: P3): P3 => [-p[0], p[1], p[2]];

function ellipsoid(c: P3, r: P3, seg: [number, number] = [20, 14], phi?: [number, number], theta?: [number, number]) {
  const g = new THREE.SphereGeometry(1, seg[0], seg[1], phi?.[0] ?? 0, phi?.[1] ?? Math.PI * 2, theta?.[0] ?? 0, theta?.[1] ?? Math.PI);
  g.scale(r[0], r[1], r[2]);
  g.translate(c[0], c[1], c[2]);
  return g;
}

/** A tapered limb from a to b with rounded ends. */
function limb(a: P3, b: P3, ra: number, rb = ra) {
  const va = V(a);
  const vb = V(b);
  const dir = vb.clone().sub(va);
  const len = dir.length();
  const cyl = new THREE.CylinderGeometry(rb, ra, len, 14, 2, true);
  cyl.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()));
  const mid = va.add(vb).multiplyScalar(0.5);
  cyl.translate(mid.x, mid.y, mid.z);
  return [cyl, ellipsoid(a, [ra, ra, ra], [14, 10]), ellipsoid(b, [rb, rb, rb], [14, 10])];
}

/** A body section turned on a lathe: [radius, height] outline, squashed front-to-back by depth. */
function lathe(outline: [number, number][], depth: number, z: number) {
  const g = new THREE.LatheGeometry(outline.map(([r, h]) => new THREE.Vector2(r, h)), 28);
  g.scale(1, 1, depth);
  g.translate(0, 0, z);
  return g;
}

/** The head: an ellipsoid with the jaw tapering to her chin, as in the front drawing. */
function headShape() {
  const { c, r } = RIG.head;
  const g = ellipsoid(c, r, [28, 22]);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const below = Math.max(0, (c[1] - p.getY(i)) / r[1]); // 0 at the middle → 1 at the chin
    const t = below * below;
    p.setX(i, p.getX(i) * (1 - 0.3 * t));
    p.setZ(i, c[2] + (p.getZ(i) - c[2]) * (1 - 0.12 * t) + 0.012 * t);
  }
  g.computeVertexNormals();
  return g;
}

function tube(points: P3[], r: number, closed = false, seg = 40) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(V), closed), seg, r, 8, closed);
}

/* ───────── hair ───────── */

/**
 * Her long wavy hair as one continuous curtain. Each row is the hair's outline seen from above at
 * one height, for her left side (mirrored for the right): front-inner edge of the lock over her
 * chest, front-outer edge, side, back-quarter, and back centre. Measured from the front and side drawings.
 */
type Ring = { h: number; pts: [number, number][] };
const HAIR_RINGS: Ring[] = [
  { h: 1.245, pts: [[0.088, 0.058], [0.102, 0.03], [0.11, -0.025], [0.086, -0.1], [0, -0.135]] },
  { h: 1.12, pts: [[0.1, 0.045], [0.15, 0.015], [0.158, -0.06], [0.125, -0.17], [0, -0.198]] },
  { h: 1.02, pts: [[0.104, 0.068], [0.172, 0.03], [0.176, -0.08], [0.14, -0.185], [0, -0.21]] },
  { h: 0.92, pts: [[0.1, 0.082], [0.166, 0.058], [0.166, -0.125], [0.12, -0.18], [0, -0.188]] },
  { h: 0.82, pts: [[0.104, 0.09], [0.15, 0.072], [0.152, -0.155], [0.1, -0.185], [0, -0.19]] },
  { h: 0.72, pts: [[0.128, -0.175], [0.13, -0.178], [0.132, -0.18], [0.08, -0.19], [0, -0.193]] },
];

function buildHairCurtain() {
  const rows = 28, cols = 56;
  const ringAt = (h: number) => {
    for (let i = 0; i < HAIR_RINGS.length - 1; i++) {
      const r0 = HAIR_RINGS[i], r1 = HAIR_RINGS[i + 1];
      if (h <= r0.h && h >= r1.h) {
        const t = (r0.h - h) / (r0.h - r1.h);
        return r0.pts.map((p, k) => [p[0] + (r1.pts[k][0] - p[0]) * t, p[1] + (r1.pts[k][1] - p[1]) * t] as [number, number]);
      }
    }
    return HAIR_RINGS[HAIR_RINGS.length - 1].pts;
  };
  const pos: number[] = [], idx: number[] = [];
  const top = HAIR_RINGS[0].h, bottom = HAIR_RINGS[HAIR_RINGS.length - 1].h;
  for (let j = 0; j <= rows; j++) {
    const h = top - ((top - bottom) * j) / rows;
    const half = ringAt(h);
    // left front → round the back → right front
    const ring = [...half.map(([x, z]) => new THREE.Vector3(x, h, z)), ...half.slice(0, -1).reverse().map(([x, z]) => new THREE.Vector3(-x, h, z))];
    const curve = new THREE.CatmullRomCurve3(ring);
    for (let i = 0; i <= cols; i++) {
      const p = curve.getPoint(i / cols);
      // soft waves: push the surface in and out along its outward direction
      const out = new THREE.Vector3(p.x, 0, p.z + 0.05).normalize();
      const wave = 0.015 * Math.sin(i * 0.9 + j * 0.55) * Math.min(1, j / 4);
      pos.push(p.x + out.x * wave, h, p.z + out.z * wave);
    }
  }
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const a = j * (cols + 1) + i, b = a + 1, d = a + cols + 1, e = d + 1;
      idx.push(a, d, b, b, d, e);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array((pos.length / 3) * 2), 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* ───────── painting from the drawings ───────── */

/**
 * Fallback painting, used wherever the drawing for the current viewing angle can't see a surface:
 * front-facing triangles read the front drawing, the rest the side drawing of the side they face.
 * `all` = may also use the three-quarter drawings (not the forearms, hands and lap: in those
 * drawings one hand rests on her lap instead of the armrest).
 */
function paint(geo: THREE.BufferGeometry, frontMin = 0.45, all = true) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const pos = g.attributes.position as THREE.BufferAttribute;
  const uv = new Float32Array(pos.count * 2);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const n = new THREE.Vector3(), e = new THREE.Vector3(), p = new THREE.Vector3();
  const M = VIEW.mPerPx;
  const W = VIEW.w * VIEW.views.length;
  const [front, left, right] = VIEW.views;
  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i);
    b.fromBufferAttribute(pos, i + 1);
    c.fromBufferAttribute(pos, i + 2);
    n.subVectors(b, a).cross(e.subVectors(c, a)).normalize();
    const cx = (a.x + b.x + c.x) / 3;
    let tile: number;
    let col: (q: THREE.Vector3) => number;
    if (n.z > frontMin) {
      tile = 0;
      col = (q) => front.pivot + q.x / M;
    } else {
      const isLeft = Math.abs(n.x) > 0.2 ? n.x > 0 : cx >= 0;
      tile = isLeft ? 1 : 2;
      col = isLeft ? (q) => left.pivot - q.z / M : (q) => right.pivot + q.z / M;
    }
    for (let k = 0; k < 3; k++) {
      p.fromBufferAttribute(pos, i + k);
      const px = Math.min(VIEW.w - 1, Math.max(1, col(p)));
      const py = Math.min(VIEW.h - 1, Math.max(1, VIEW.h - p.y / M));
      uv[(i + k) * 2] = (tile * VIEW.w + px) / W;
      uv[(i + k) * 2 + 1] = 1 - py / VIEW.h;
    }
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setAttribute("aAll", new THREE.BufferAttribute(new Float32Array(pos.count).fill(all ? 1 : 0), 1));
  return g;
}

function buildBody() {
  const parts: THREE.BufferGeometry[] = [];
  const add = (...g: THREE.BufferGeometry[]) => parts.push(...g.map((x) => paint(x)));
  // the face falls back to the front drawing until well round the side (no second eye on the cheek)
  const addFront = (min: number, ...g: THREE.BufferGeometry[]) => parts.push(...g.map((x) => paint(x, min)));
  const addBase = (min: number, ...g: THREE.BufferGeometry[]) => parts.push(...g.map((x) => paint(x, min, false)));
  const R = RIG;
  const T = R.torso;
  const Hp = R.hips;

  // head (tapering to the chin), nose, neck
  addFront(0.2, headShape());
  addFront(0.2, ellipsoid(R.nose, [0.014, 0.022, 0.016], [8, 6]));
  add(...limb(R.neck.a, R.neck.b, R.neck.r));

  // floral halter top: waist → chest → sloping shoulders → neckline
  add(
    lathe(
      [
        [T.rBottom, T.bottom],
        [T.rBottom + 0.003, T.bottom + 0.06],
        [0.161, 0.8],
        [T.rTop, 0.875],
        [0.163, 0.925],
        [0.135, T.top - 0.002],
        [0.085, T.top + 0.018],
        [0.046, T.top + 0.028],
      ],
      T.depth,
      T.z,
    ),
  );
  // pencil skirt: hips, and one panel over both thighs down to the knees
  addBase(
    -0.6,
    lathe(
      [
        [0.02, Hp.bottom],
        [Hp.rBottom - 0.02, Hp.bottom + 0.004],
        [Hp.rBottom, Hp.bottom + 0.04],
        [Hp.rBottom - 0.002, 0.58],
        [0.163, 0.64],
        [Hp.rTop, Hp.top],
      ],
      Hp.depth,
      Hp.z,
    ),
  );
  const skirt = new RoundedBoxGeometry(0.33, 0.15, 0.4, 3, 0.05);
  skirt.rotateX(0.11);
  skirt.translate(0, 0.515, 0.135);
  addBase(-0.6, skirt);

  for (const f of [(p: P3) => p, mirror]) {
    // shoulders and arms resting on the armrests
    add(ellipsoid(f(R.shoulder.c), [R.shoulder.r, R.shoulder.r, R.shoulder.r], [14, 10]));
    add(...limb(f(R.shoulder.c), f(R.elbow), R.upperArmR, R.upperArmR * 0.9));
    addBase(0.45, ...limb(f(R.elbow), f(R.wrist), R.forearmR, R.forearmR * 0.85));
    addBase(0.45, ellipsoid(f(R.hand.c), [R.hand.s[0] / 2, R.hand.s[1] / 2, R.hand.s[2] / 2], [12, 8]));
    // legs: skirt over the thighs, bare knees and shins, flats
    // (the thighs take the skirt from the front drawing; the side one has the armrest across them)
    addBase(-0.6, ...limb(f(R.hip), f(R.knee), R.thighR, R.thighR * 0.9));
    add(ellipsoid(f(R.knee), [R.kneeR, R.kneeR, R.kneeR], [14, 10]));
    add(...limb(f(R.knee), f(R.ankle), R.shinR[0], R.shinR[1]));
    add(ellipsoid(f(R.foot.c), [R.foot.s[0] / 2, R.foot.s[1] / 2, R.foot.s[2] / 2], [14, 8]));
  }

  // hair: crown, back + sides of the head (open at the face), and the long wavy curtain
  addFront(-0.3, ellipsoid([0, 1.175, -0.015], [0.104, 0.152, 0.124], [24, 10], undefined, [0, Math.PI * 0.36]));
  addFront(
    -0.3,
    ellipsoid([0, 1.175, -0.015], [0.106, 0.152, 0.126], [24, 14], [Math.PI / 2 + 0.85, Math.PI * 2 - 1.7], [Math.PI * 0.3, Math.PI * 0.62]),
  );
  addFront(-0.3, buildHairCurtain());

  const merged = mergeGeometries(parts);
  merged.computeBoundingSphere();
  return merged;
}

/* ───────── chair ───────── */

function meshTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 32;
  const c = canvas.getContext("2d")!;
  c.fillStyle = C.mesh;
  c.fillRect(0, 0, 32, 32);
  c.fillStyle = "#4d4748";
  for (let y = 0; y < 32; y += 4) for (let x = (y / 4) % 2 ? 2 : 0; x < 32; x += 4) c.fillRect(x, y, 2, 2);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(5, 7);
  t.magFilter = THREE.NearestFilter;
  return t;
}

/** The curved mesh back: follows the S-curve from the side, and bows forward at its edges. */
function buildBack() {
  const ch = RIG.chair;
  const centre = new THREE.CatmullRomCurve3(ch.back.map(([h, z]) => new THREE.Vector3(0, h, z)));
  const halfW = (t: number) => {
    const s = t * (ch.backHalfW.length - 1);
    const i = Math.min(ch.backHalfW.length - 2, Math.floor(s));
    return ch.backHalfW[i] + (ch.backHalfW[i + 1] - ch.backHalfW[i]) * (s - i);
  };
  const nu = 12, nv = 18;
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  const edges: { l: P3[]; r: P3[] } = { l: [], r: [] };
  for (let j = 0; j <= nv; j++) {
    const t = j / nv;
    const c = centre.getPoint(t);
    const w = halfW(t);
    for (let i = 0; i <= nu; i++) {
      const u = (i / nu) * 2 - 1;
      pos.push(u * w, c.y, c.z + 0.05 * u * u);
      uv.push(i / nu, t);
    }
    if (j % 3 === 0 || j === nv) {
      edges.l.push([w, c.y, c.z + 0.05]);
      edges.r.push([-w, c.y, c.z + 0.05]);
    }
  }
  for (let j = 0; j < nv; j++)
    for (let i = 0; i < nu; i++) {
      const a = j * (nu + 1) + i, b = a + 1, d = a + nu + 1, e = d + 1;
      idx.push(a, b, d, b, e, d);
    }
  const panel = new THREE.BufferGeometry();
  panel.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  panel.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  panel.setIndex(idx);
  panel.computeVertexNormals();
  // frame: a rounded loop around the panel
  const top = centre.getPoint(1);
  const bottom = centre.getPoint(0);
  const loop: P3[] = [
    ...edges.l,
    [0, top.y + 0.02, top.z],
    ...[...edges.r].reverse(),
    [0, bottom.y - 0.02, bottom.z],
  ];
  return { panel, frame: tube(loop, 0.018, true, 80) };
}

function SwivelTop() {
  const ch = RIG.chair;
  const { panel, frame } = useMemo(() => buildBack(), []);
  const mesh = useMemo(() => meshTexture(), []);
  const black = <meshStandardMaterial color={C.chair} roughness={0.6} />;
  const frameMat = <meshStandardMaterial color={C.frame} roughness={0.5} />;
  const struts = useMemo(
    () => ({
      spine: tube([[0, 0.34, -0.1], [0, 0.36, -0.22], [0, 0.45, -0.24], [0, 0.52, -0.22]], 0.022),
      arms: [1, -1].map((s) => tube([[s * 0.21, 0.37, -0.06], [s * 0.265, 0.43, -0.05], [s * 0.28, 0.555, -0.03]], 0.018, false, 16)),
      stalk: tube([[0, 1.07, -0.265], [0, 1.1, -0.28], [0, 1.13, -0.29]], 0.014, false, 8),
    }),
    [],
  );
  return (
    <group>
      <RoundedBox args={ch.seat.s} radius={0.03} position={ch.seat.c} castShadow receiveShadow>
        <meshStandardMaterial color={C.seat} roughness={0.9} />
      </RoundedBox>
      <mesh position={[0, 0.365, -0.01]} castShadow>
        <boxGeometry args={[0.46, 0.03, 0.44]} />
        {black}
      </mesh>
      <mesh position={[0, 0.33, -0.02]} castShadow>
        <boxGeometry args={[0.18, 0.06, 0.2]} />
        {black}
      </mesh>
      <mesh geometry={struts.spine} castShadow>
        {frameMat}
      </mesh>
      <mesh geometry={panel} castShadow receiveShadow>
        <meshStandardMaterial map={mesh} side={THREE.DoubleSide} roughness={0.8} transparent opacity={0.82} depthWrite={false} />
      </mesh>
      <mesh geometry={frame} castShadow>
        {frameMat}
      </mesh>
      <mesh geometry={struts.stalk}>{frameMat}</mesh>
      <RoundedBox args={ch.headrest.s} radius={0.025} position={ch.headrest.c} rotation={[-0.12, 0, 0]} castShadow>
        <meshStandardMaterial map={mesh} roughness={0.8} />
      </RoundedBox>
      {[1, -1].map((s, i) => (
        <group key={s}>
          <mesh geometry={struts.arms[i]} castShadow>
            {frameMat}
          </mesh>
          <RoundedBox args={ch.armPad.s} radius={0.015} position={[s * ch.armPad.c[0], ch.armPad.c[1], ch.armPad.c[2]]} castShadow>
            {black}
          </RoundedBox>
        </group>
      ))}
    </group>
  );
}

function ChairBase() {
  const r = RIG.chair.baseR;
  return (
    <group>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.026, 0.03, 0.24, 10]} />
        <meshStandardMaterial color="#3a3638" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.11, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.06, 0.06, 10]} />
        <meshStandardMaterial color={C.chair} roughness={0.6} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 + Math.PI / 10;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[r / 2, 0.08, 0]} rotation={[0, 0, -0.08]} castShadow>
              <boxGeometry args={[r, 0.035, 0.045]} />
              <meshStandardMaterial color={C.chair} roughness={0.6} />
            </mesh>
            <mesh position={[r, 0.032, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.035, 12]} />
              <meshStandardMaterial color={C.frame} roughness={0.5} />
            </mesh>
            <mesh position={[r - 0.01, 0.065, 0]} castShadow>
              <boxGeometry args={[0.03, 0.03, 0.04]} />
              <meshStandardMaterial color={C.chair} roughness={0.6} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ───────── her ───────── */

function Jewellery() {
  const R = RIG;
  // bands sit around the wrist, square to the forearm
  const band = (side: 1 | -1, t: number) => {
    const e = side === 1 ? R.elbow : mirror(R.elbow);
    const w = side === 1 ? R.wrist : mirror(R.wrist);
    const dir = V(w).sub(V(e)).normalize();
    const at = V(e).lerp(V(w), t);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    return { position: at, quaternion: q };
  };
  return (
    <group>
      {/* watch on her left wrist */}
      <mesh {...band(1, 0.93)}>
        <torusGeometry args={[0.033, 0.009, 6, 14]} />
        <meshStandardMaterial color={C.watch} roughness={0.5} />
      </mesh>
      {/* beaded bracelets on her right wrist */}
      {[0.9, 0.97].map((t, i) => (
        <mesh key={t} {...band(-1, t)}>
          <torusGeometry args={[0.034, 0.008, 5, 12]} />
          <meshStandardMaterial color={i ? C.beadB : C.beadA} roughness={0.6} />
        </mesh>
      ))}
      {/* pearl earrings */}
      {[R.earring, mirror(R.earring)].map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.011, 8, 6]} />
          <meshStandardMaterial color={C.pearl} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/** The braided crown: a plait wrapping round the back of her head, temple to temple. */
function Braid() {
  const beads = useMemo(() => {
    const out: { p: THREE.Vector3; q: THREE.Quaternion }[] = [];
    const n = 30;
    for (let i = 0; i <= n; i++) {
      const th = 1.05 + ((Math.PI * 2 - 2.1) * i) / n; // from her left temple round the back to her right
      const h = 1.235 - 0.03 * Math.sin((i / n) * Math.PI);
      const p = new THREE.Vector3(0.105 * Math.sin(th), h, -0.015 + 0.125 * Math.cos(th));
      const tangent = new THREE.Vector3(Math.cos(th), 0, -Math.sin(th));
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), tangent);
      q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), (i % 2 ? 1 : -1) * 0.5));
      out.push({ p, q });
    }
    return out;
  }, []);
  return (
    <group>
      {beads.map((b, i) => (
        <mesh key={i} position={b.p} quaternion={b.q} scale={[0.017, 0.011, 0.012]} castShadow>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color={C.braid} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/* ───────── painting that follows the viewing angle ───────── */

// the drawings sorted by the angle they are seen from (−90° right side … +90° left side)
const VIEW_ORDER = VIEW.views.map((v, i) => ({ a: v.angle, i })).sort((x, y) => x.a - y.a);

/** Which two drawings to show for a camera at angle `rel` round her, and how far to fade between them. */
function pickViews(rel: number): [number, number, number] {
  const first = VIEW_ORDER[0];
  const last = VIEW_ORDER[VIEW_ORDER.length - 1];
  if (rel <= first.a) return [first.i, first.i, 0];
  if (rel >= last.a) return [last.i, last.i, 0];
  for (let k = 0; k < VIEW_ORDER.length - 1; k++) {
    const A = VIEW_ORDER[k];
    const B = VIEW_ORDER[k + 1];
    if (rel <= B.a) {
      // use the nearer drawing, with a quick fade at the halfway angle so features never double up for long
      const t = Math.min(1, Math.max(0, ((rel - A.a) / (B.a - A.a) - 0.42) / 0.16));
      return [A.i, B.i, t * t * (3 - 2 * t)];
    }
  }
  return [last.i, last.i, 0];
}

/**
 * Standard lit material whose colour comes from the drawing for the current viewing angle,
 * projected straight onto the model. Where that drawing can't see a surface (it faces away, or it
 * is a forearm/hand/lap in a three-quarter drawing) it falls back to the per-triangle painting.
 */
function makePaintMaterial(atlas: THREE.Texture) {
  const N = VIEW.views.length;
  const M = VIEW.mPerPx.toFixed(10);
  const uniforms = {
    uAtlas: { value: atlas },
    uViews: { value: VIEW.views.map((v) => new THREE.Vector2(v.angle, v.pivot)) },
    uViewA: { value: 0 },
    uViewB: { value: 0 },
    uViewMix: { value: 0 },
    uGlow: { value: 0.2 },
  };
  const m = new THREE.MeshStandardMaterial({ roughness: 1, side: THREE.DoubleSide });
  m.userData.uniforms = uniforms;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = sh.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
attribute float aAll;
varying vec3 vBodyPos;
varying vec3 vBodyNormal;
varying vec2 vFallbackUv;
varying float vAll;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
vBodyPos = position;
vBodyNormal = normal;
vFallbackUv = uv;
vAll = aAll;`,
      );
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
uniform sampler2D uAtlas;
uniform vec2 uViews[${N}];
uniform int uViewA;
uniform int uViewB;
uniform float uViewMix;
uniform float uGlow;
varying vec3 vBodyPos;
varying vec3 vBodyNormal;
varying vec2 vFallbackUv;
varying float vAll;
// tiles 3+ are the three-quarter drawings
vec3 paintFrom(int i) {
  float a = uViews[i].x;
  vec3 dir = vec3(sin(a), 0.0, cos(a));
  if ((i >= 3 && vAll < 0.5) || dot(normalize(vBodyNormal), dir) < 0.5) return texture2D(uAtlas, vFallbackUv).rgb;
  float across = vBodyPos.x * cos(a) - vBodyPos.z * sin(a);
  float px = clamp(uViews[i].y + across / ${M}, 1.0, ${VIEW.w - 1}.0);
  float py = clamp(${VIEW.h}.0 - vBodyPos.y / ${M}, 1.0, ${VIEW.h - 1}.0);
  return texture2D(uAtlas, vec2((float(i) * ${VIEW.w}.0 + px) / ${VIEW.w * N}.0, 1.0 - py / ${VIEW.h}.0)).rgb;
}`,
      )
      .replace(
        "#include <map_fragment>",
        `vec3 paintCol = mix(paintFrom(uViewA), paintFrom(uViewB), uViewMix);
diffuseColor.rgb *= paintCol;`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
totalEmissiveRadiance += paintCol * uGlow;`,
      );
  };
  m.customProgramCacheKey = () => "laavanya-paint";
  return m;
}

function Body() {
  const atlas = useTexture("/character/atlas.webp", (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    t.anisotropy = 4;
  });
  const geometry = useMemo(() => buildBody(), []);
  const material = useMemo(() => makePaintMaterial(atlas), [atlas]);
  const mesh = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial | null>(null);
  useEffect(() => {
    matRef.current = material;
    return () => material.dispose();
  }, [material]);
  const camLocal = useMemo(() => new THREE.Vector3(), []);

  // which drawing to wear: from where the camera is, measured round her (0 = in front, +90° = her left)
  useFrame(({ camera }) => {
    const m = mesh.current;
    const mat = matRef.current;
    if (!m || !mat) return;
    m.worldToLocal(camLocal.copy(camera.position));
    const [a, b, t] = pickViews(Math.atan2(camLocal.x, camLocal.z));
    const u = mat.userData.uniforms;
    u.uViewA.value = a;
    u.uViewB.value = b;
    u.uViewMix.value = t;
  });

  return (
    <group>
      <mesh ref={mesh} geometry={geometry} material={material} castShadow receiveShadow />
      <Braid />
      <Jewellery />
    </group>
  );
}

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/**
 * While `spinning`, she lazily swivels round (a push with her feet, then coasting).
 * Otherwise she turns to face the visitor and stays still.
 */
export default function Character({ spinning }: { spinning: boolean }) {
  const swivel = useRef<THREE.Group>(null);
  const angle = useRef<number | null>(null);

  useFrame(({ camera, clock }, dt) => {
    const g = swivel.current;
    if (!g) return;
    const toCam = Math.atan2(camera.position.x - CHAIR[0], camera.position.z - CHAIR[2]);
    if (angle.current === null) angle.current = toCam;
    if (spinning) {
      const push = 0.55 + 0.45 * Math.max(0, Math.sin(clock.elapsedTime * 1.1));
      angle.current += dt * ((Math.PI * 2) / 5) * push * 1.4;
    } else {
      angle.current += wrap(toCam - angle.current) * Math.min(1, dt * 3);
    }
    g.rotation.y = angle.current;
  });

  return (
    <group position={CHAIR}>
      <ChairBase />
      <group ref={swivel}>
        <SwivelTop />
        <Body />
      </group>
    </group>
  );
}
