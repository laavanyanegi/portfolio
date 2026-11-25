"use client";

import { Suspense, useMemo, useRef, memo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ROOM } from "@/lib/roomPalette";
import { useTexture } from "@react-three/drei";
import { browserScreenTexture, hexBoardTexture, pictureTexture, rugTexture, speakerFrontTexture, type PictureKind } from "../textures";
import { BEDSIDE_LAMP, CHAIR, D, W, WINDOW, type V3 } from "./dims";
import { CutWall } from "./Shell";
import { Box, Cyl, Glow, NightGlow, Plant, useNight } from "./parts";
import Kuromi from "./Kuromi";

/**
 * The study wall (south, z = D) and the balcony wall (west, x = 0). Everything hung on a wall or
 * standing against it hides with that wall when it is cut away; the desk set stays in every view,
 * since Laavanya sits at it.
 */

/* ───────── South: study wall (west → east: pet bed by the balcony door, cabinet, desk, side table, mandala) ───────── */

const DESK_X = CHAIR[0];
const TOP = 0.775;

function Desk() {
  const z = D - 0.33;
  return (
    <group>
      <Box p={[DESK_X, 0.75, z]} s={[1.4, 0.05, 0.62]} c={ROOM.woodMid} />
      <Box p={[DESK_X, 0.68, z - 0.27]} s={[1.3, 0.1, 0.02]} c={ROOM.woodDark} />
      {[
        [-0.65, -0.26],
        [0.65, -0.26],
        [-0.65, 0.26],
        [0.65, 0.26],
      ].map(([dx, dz]) => (
        <Box key={`${dx}-${dz}`} p={[DESK_X + dx, 0.36, z + dz]} s={[0.06, 0.72, 0.06]} c={ROOM.woodMid} />
      ))}

      {/* laptop: base + screen hinged at the back edge */}
      <Box p={[DESK_X, TOP + 0.01, D - 0.34]} s={[0.36, 0.02, 0.25]} c={ROOM.laptop} />
      <group position={[DESK_X, TOP + 0.02, D - 0.215]} rotation={[0.25, 0, 0]}>
        <Box p={[0, 0.12, 0]} s={[0.36, 0.24, 0.012]} c={ROOM.laptop} />
        <LaptopScreen />
      </group>

      <DeskThings />
    </group>
  );
}

/** The laptop screen: a plain open browser window (nothing specific on it), glowing a little more at night. */
function LaptopScreen() {
  const tex = useMemo(() => browserScreenTexture(), []);
  const t = useNight();
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    if (mat.current) mat.current.emissiveIntensity = 0.55 + 0.35 * t.current;
  });
  return (
    <mesh position={[0, 0.125, -0.008]} rotation={[0, Math.PI, 0]} userData={{ ownGlow: true }}>
      <planeGeometry args={[0.32, 0.2]} />
      <meshStandardMaterial ref={mat} map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.55} roughness={0.6} />
    </mesh>
  );
}

/**
 * Everything on the desk besides the laptop and lamp (east → west): two books, the hexagon photo
 * board against the wall, black water bottle, pen stand, notepad, vase of flowers, aroma diffuser.
 */
function DeskThings() {
  const board = useMemo(() => hexBoardTexture(), []);
  const pens: [number, number, string, number][] = [
    [-0.012, -0.008, "#2c5aa0", 0.12],
    [0.01, 0.006, "#c23b3b", -0.1],
    [0, 0.012, "#1f1f24", 0.05],
    [0.013, -0.01, "#e2b33c", -0.18],
  ];
  return (
    <group>
      {/* two books */}
      <Box p={[DESK_X + 0.53, TOP + 0.02, D - 0.3]} s={[0.2, 0.04, 0.26]} c={ROOM.bookA} />
      <Box p={[DESK_X + 0.53, TOP + 0.06, D - 0.3]} s={[0.18, 0.04, 0.24]} c={ROOM.bookC} />

      {/* hexagon grid board with polaroids, letters, notes and earrings, leaning on the wall */}
      <group position={[DESK_X + 0.5, TOP, D - 0.065]} rotation={[0, Math.PI, 0]}>
        <group rotation={[-0.14, 0, 0]}>
          <mesh position={[0, 0.175, 0]} receiveShadow>
            <planeGeometry args={[0.4, 0.35]} />
            <meshStandardMaterial map={board} alphaTest={0.5} roughness={0.9} />
          </mesh>
          {/* dark hexagon back, so it still shows from behind when the study wall is cut away */}
          <mesh position={[0, 0.175, -0.004]} rotation={[0, Math.PI, 0]} castShadow>
            <circleGeometry args={[0.2, 6]} />
            <meshStandardMaterial color="#1c1818" roughness={0.9} />
          </mesh>
        </group>
      </group>

      {/* black water bottle */}
      <Cyl p={[DESK_X + 0.28, TOP + 0.12, D - 0.34]} rt={0.034} rb={0.034} h={0.24} c="#1c1b20" seg={12} />
      <Cyl p={[DESK_X + 0.28, TOP + 0.255, D - 0.34]} rt={0.026} rb={0.03} h={0.03} c="#3b3a40" seg={12} />

      {/* pen stand */}
      <Cyl p={[DESK_X + 0.22, TOP + 0.05, D - 0.14]} rt={0.032} rb={0.032} h={0.1} c="#5a6e8c" seg={10} />
      {pens.map(([dx, dz, c, tilt]) => (
        <Box key={c} p={[DESK_X + 0.22 + dx, TOP + 0.14, D - 0.14 + dz]} s={[0.009, 0.15, 0.009]} r={[0, 0, tilt]} c={c} cast={false} />
      ))}

      {/* notepad with a pen on it */}
      <group position={[DESK_X - 0.34, TOP, D - 0.5]} rotation={[0, 0.15, 0]}>
        <Box p={[0, 0.006, 0]} s={[0.13, 0.012, 0.17]} c="#f2e6c4" cast={false} />
        <Box p={[0, 0.013, -0.07]} s={[0.13, 0.003, 0.025]} c="#c95b5b" cast={false} />
        {[-0.03, 0, 0.03].map((dz) => (
          <Box key={dz} p={[0, 0.0125, dz]} s={[0.1, 0.002, 0.004]} c="#b9ab8c" cast={false} />
        ))}
        <Box p={[0.03, 0.018, 0.01]} s={[0.008, 0.008, 0.13]} r={[0, -0.5, 0]} c="#2c5aa0" cast={false} />
      </group>

      <Flowers p={[DESK_X - 0.26, TOP, D - 0.13]} />
      <Diffuser p={[DESK_X - 0.55, TOP, D - 0.5]} />
    </group>
  );
}

/** Mini vase with two red roses and one sunflower. */
function Flowers({ p }: { p: V3 }) {
  const stems: { dx: number; dz: number; h: number; tilt: number; sun?: boolean }[] = [
    { dx: -0.02, dz: 0.004, h: 0.16, tilt: 0.2 },
    { dx: 0.02, dz: -0.006, h: 0.14, tilt: -0.22 },
    { dx: 0, dz: 0.008, h: 0.2, tilt: 0.02, sun: true },
  ];
  return (
    <group position={p}>
      <Cyl p={[0, 0.045, 0]} rt={0.026} rb={0.038} h={0.09} c="#9cc3cf" seg={10} />
      <Cyl p={[0, 0.096, 0]} rt={0.02} rb={0.02} h={0.012} c="#7fa8b6" seg={10} />
      {stems.map((s, i) => (
        <group key={i} position={[s.dx, 0.09, s.dz]} rotation={[0, 0, s.tilt]}>
          <Box p={[0, s.h / 2, 0]} s={[0.006, s.h, 0.006]} c="#4f7a35" cast={false} />
          <mesh position={[0.012, s.h * 0.45, 0]} rotation={[0, 0, -0.8]}>
            <coneGeometry args={[0.01, 0.035, 4]} />
            <meshStandardMaterial color="#5d8c45" roughness={0.9} />
          </mesh>
          {s.sun ? (
            <group position={[0, s.h, 0]} rotation={[-Math.PI / 2 + 0.3, 0, 0]}>
              <Cyl p={[0, 0, 0]} rt={0.04} rb={0.04} h={0.008} c="#f2c230" seg={10} />
              <Cyl p={[0, -0.004, 0]} rt={0.017} rb={0.017} h={0.008} c="#5a3a1a" seg={8} cast={false} />
            </group>
          ) : (
            <mesh position={[0, s.h, 0]} castShadow>
              <sphereGeometry args={[0.022, 7, 5]} />
              <meshStandardMaterial color="#b8243a" roughness={0.8} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

/** Aroma diffuser: wood base, white dome, a soft LED ring at night and a wisp of mist. */
function Diffuser({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Cyl p={[0, 0.025, 0]} rt={0.045} rb={0.05} h={0.05} c="#b08a5a" seg={12} />
      <mesh position={[0, 0.05, 0]} castShadow>
        <sphereGeometry args={[0.045, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f1ece4" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.052, 0]} userData={{ ownGlow: true }}>
        <cylinderGeometry args={[0.047, 0.047, 0.006, 12]} />
        <NightGlow color="#d9c9f5" glow="#b48cf0" day={0.1} night={1.6} />
      </mesh>
      {/* faint wisp of mist */}
      {[
        [0, 0.12, 0.016, 0.13],
        [0.012, 0.18, 0.02, 0.07],
      ].map(([dx, y, r, o], i) => (
        <mesh key={i} position={[dx, y, 0]} scale={[1, 1.8, 1]}>
          <sphereGeometry args={[r, 8, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={o} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Round wall clock on the study wall, just west of the desk. It shows the visitor's real time. */
function WallClock() {
  const hour = useRef<THREE.Group>(null);
  const minute = useRef<THREE.Group>(null);
  useFrame(() => {
    const d = new Date();
    const m = d.getMinutes() + d.getSeconds() / 60;
    const h = (d.getHours() % 12) + m / 60;
    if (minute.current) minute.current.rotation.z = -(m / 60) * Math.PI * 2;
    if (hour.current) hour.current.rotation.z = -(h / 12) * Math.PI * 2;
  });
  return (
    <group position={[DESK_X - 1.12, 1.72, D]} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.17, 0.04, 20]} />
        <meshStandardMaterial color="#2a2420" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.041]}>
        <circleGeometry args={[0.145, 20]} />
        <meshStandardMaterial color="#f3ead8" roughness={0.9} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <Box
            key={i}
            p={[Math.sin(a) * 0.12, Math.cos(a) * 0.12, 0.043]}
            s={[0.012, i % 3 === 0 ? 0.03 : 0.014, 0.003]}
            r={[0, 0, -a]}
            c="#2a2420"
            cast={false}
          />
        );
      })}
      <group ref={hour} position={[0, 0, 0.046]} userData={{ dynamic: true }}>
        <Box p={[0, 0.035, 0]} s={[0.016, 0.08, 0.004]} c="#2a2420" cast={false} />
      </group>
      <group ref={minute} position={[0, 0, 0.05]} userData={{ dynamic: true }}>
        <Box p={[0, 0.05, 0]} s={[0.01, 0.11, 0.004]} c="#2a2420" cast={false} />
      </group>
    </group>
  );
}

/** Purple desk lamp (outside the Work glow so its own night glow is kept). */
function DeskLamp() {
  const x = DESK_X - 0.53;
  const z = D - 0.2;
  return (
    <group>
      <Cyl p={[x, TOP + 0.01, z]} rt={0.07} rb={0.08} h={0.02} c={ROOM.lampBase} />
      <Cyl p={[x, TOP + 0.12, z]} rt={0.015} rb={0.015} h={0.2} c={ROOM.lampBase} />
      <Cyl p={[x, TOP + 0.27, z]} rt={0.08} rb={0.13} h={0.16} cast={false} seg={12}>
        <NightGlow color={ROOM.lampShade} glow={ROOM.lampGlow} night={1.6} side={THREE.DoubleSide} />
      </Cyl>
    </group>
  );
}

function Cabinet() {
  const x = DESK_X - 1.05;
  const z = D - 0.25;
  return (
    <group>
      <Box p={[x, 0.25, z]} s={[0.45, 0.5, 0.42]} c={ROOM.woodDark} />
      <Box p={[x, 0.36, z - 0.215]} s={[0.38, 0.14, 0.01]} c={ROOM.woodMid} cast={false} />
      <Box p={[x, 0.36, z - 0.225]} s={[0.08, 0.02, 0.01]} c={ROOM.handle} cast={false} />
      <Box p={[x, 0.15, z - 0.215]} s={[0.38, 0.14, 0.01]} c={ROOM.woodMid} cast={false} />
    </group>
  );
}

function SideTable() {
  const x = DESK_X + 1.2;
  const z = D - 0.26;
  return (
    <group>
      <Box p={[x, 0.6, z]} s={[0.56, 0.04, 0.44]} c={ROOM.woodMid} />
      <Box p={[x, 0.5, z - 0.21]} s={[0.5, 0.14, 0.02]} c={ROOM.woodDark} />
      <Box p={[x, 0.15, z]} s={[0.5, 0.03, 0.4]} c={ROOM.woodMid} />
      {[
        [-0.25, -0.19],
        [0.25, -0.19],
        [-0.25, 0.19],
        [0.25, 0.19],
      ].map(([dx, dz]) => (
        <Box key={`${dx}-${dz}`} p={[x + dx, 0.3, z + dz]} s={[0.04, 0.6, 0.04]} c={ROOM.woodMid} />
      ))}
      <Box p={[x, 0.5, z - 0.222]} s={[0.06, 0.02, 0.01]} c={ROOM.handle} cast={false} />
      <Speaker p={[x, 0.165, z]} />
    </group>
  );
}

/** Marshall speaker on the side-table shelf: black body, gold top plate with knobs, script logo. */
function Speaker({ p }: { p: [number, number, number] }) {
  const front = useMemo(() => speakerFrontTexture(), []);
  const [x, y, z] = p;
  return (
    <group>
      <mesh position={[x, y + 0.1, z]} castShadow receiveShadow>
        <boxGeometry args={[0.38, 0.2, 0.2]} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <meshStandardMaterial
            key={i}
            attach={`material-${i}`}
            color={i === 5 ? "#ffffff" : ROOM.radio}
            map={i === 5 ? front : undefined}
            roughness={0.7}
          />
        ))}
      </mesh>
      <Box p={[x, y + 0.203, z]} s={[0.36, 0.006, 0.18]} c={ROOM.radioTrim} cast={false} />
      {[-0.12, -0.06, 0, 0.06, 0.12].map((dx) => (
        <Cyl key={dx} p={[x + dx, y + 0.215, z - 0.03]} rt={0.012} rb={0.012} h={0.02} c="#2a2624" cast={false} seg={8} />
      ))}
    </group>
  );
}

function PetBed() {
  return (
    <group position={[0.5, 0, D - 0.42]}>
      <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.3, 0.09, 6, 14]} />
        <meshStandardMaterial color={ROOM.petBed} roughness={0.95} />
      </mesh>
      <Cyl p={[0, 0.04, 0]} rt={0.3} rb={0.3} h={0.06} c={ROOM.petCushion} seg={14} />
    </group>
  );
}

/**
 * The mandala on the study wall, taken straight from Laavanya's table-wall artwork
 * (public/room/mandala-half.webp). It is centred on the east corner, so only its right half shows.
 * Size follows the reference: from just above the skirting to just under the ceiling.
 */
const MANDALA = { h: 2.65, w: 2.65 * (179 / 265), bottom: 0.14 };
function Mandala() {
  const tex = useTexture("/room/mandala-half.webp", (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
  });
  return (
    <mesh
      position={[W - MANDALA.w / 2, MANDALA.bottom + MANDALA.h / 2, D - 0.004]}
      rotation={[0, Math.PI, 0]}
      receiveShadow
    >
      <planeGeometry args={[MANDALA.w, MANDALA.h]} />
      <meshStandardMaterial map={tex} transparent depthWrite={false} roughness={0.9} />
    </mesh>
  );
}

function WallArtAndRug() {
  const rug = useMemo(() => rugTexture(), []);
  return (
    <group>
      <CutWall side="south">
        <Suspense fallback={null}>
          <Mandala />
        </Suspense>
      </CutWall>
      <mesh position={[DESK_X, 0.003, D - 0.95]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.8, 1.3]} />
        <meshStandardMaterial map={rug} roughness={1} />
      </mesh>
    </group>
  );
}

/* ───────── West: balcony wall (north → south: bed corner with the gallery above, bookshelf, dresser under window) ───────── */

/** Small framed pictures in the gallery, laid out as you face the wall (x left → right, y up). */
const PICTURES: { x: number; y: number; w: number; h: number; kind: PictureKind; gold?: boolean }[] = [
  { x: 0.42, y: 2.24, w: 0.17, h: 0.21, kind: "landscape" },
  { x: 0.42, y: 1.95, w: 0.12, h: 0.15, kind: "plant", gold: true },
  { x: 0.65, y: 2.3, w: 0.2, h: 0.26, kind: "temple" },
  { x: 0.63, y: 2.0, w: 0.11, h: 0.13, kind: "abstract", gold: true },
  { x: 0.63, y: 1.76, w: 0.15, h: 0.15, kind: "sunset" },
  { x: 0.88, y: 2.3, w: 0.21, h: 0.17, kind: "landscape" },
  { x: 0.87, y: 2.01, w: 0.16, h: 0.2, kind: "portrait" },
  { x: 0.87, y: 1.74, w: 0.13, h: 0.16, kind: "plant" },
  { x: 1.11, y: 2.33, w: 0.14, h: 0.19, kind: "abstract" },
  { x: 1.12, y: 2.01, w: 0.21, h: 0.27, kind: "temple", gold: true },
  { x: 1.35, y: 2.3, w: 0.14, h: 0.18, kind: "flower" },
  { x: 1.35, y: 1.99, w: 0.14, h: 0.14, kind: "portrait", gold: true },
];

/** The gallery of small framed pictures on the balcony wall, above the bed (the Creatives spot). */
function Gallery() {
  const tex = useMemo(() => PICTURES.map((p, i) => pictureTexture(p.kind, i + 3)), []);
  return (
    // turned to face into the room from the balcony wall, centred over the bed
    <group position={[0, 0, 1.46]} rotation={[0, Math.PI / 2, 0]}>
      {PICTURES.map((p, i) => (
        <group key={i} position={[p.x, p.y, 0]}>
          <Box p={[0, 0, 0.012]} s={[p.w, p.h, 0.024]} c={p.gold ? "#b08a4a" : ROOM.woodDark} />
          <Box p={[0, 0, 0.025]} s={[p.w - 0.03, p.h - 0.03, 0.004]} c={ROOM.frame} cast={false} />
          <mesh position={[0, 0, 0.028]}>
            <planeGeometry args={[p.w - 0.06, p.h - 0.06]} />
            <meshStandardMaterial map={tex[i]} roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* little macramé diamond on a string */}
      <Box p={[0.2, 2.36, 0.005]} s={[0.004, 0.14, 0.004]} c={ROOM.woodDark} cast={false} />
      <Box p={[0.2, 2.22, 0.015]} s={[0.07, 0.07, 0.012]} r={[0, 0, Math.PI / 4]} c="#b5603c" />
      <Box p={[0.2, 2.12, 0.015]} s={[0.02, 0.09, 0.006]} c="#d9c7a6" />
    </group>
  );
}

function Bookshelf() {
  const books = [ROOM.bookA, ROOM.bookB, ROOM.bookC, ROOM.lampBase, ROOM.bookA, ROOM.bookC];
  const h = 1.75;
  return (
    <group position={[0.2, 0, 1.75]}>
      <Box p={[0, h / 2, -0.3]} s={[0.36, h, 0.03]} c={ROOM.woodDark} />
      <Box p={[0, h / 2, 0.3]} s={[0.36, h, 0.03]} c={ROOM.woodDark} />
      <Box p={[-0.17, h / 2, 0]} s={[0.02, h, 0.6]} c={ROOM.woodDark} />
      {[0.03, 0.45, 0.87, 1.29, h - 0.015].map((y) => (
        <Box key={y} p={[0, y, 0]} s={[0.36, 0.03, 0.6]} c={ROOM.woodDark} />
      ))}
      {[0.05, 0.47, 0.89].map((y, row) =>
        books.slice(row, row + 5).map((c, i) => (
          <Box
            key={`${row}-${i}`}
            p={[0, y + 0.14, -0.22 + i * 0.085 + row * 0.03]}
            s={[0.24, 0.26 - ((i + row) % 3) * 0.04, 0.065]}
            c={c}
          />
        )),
      )}
      <Plant p={[0, 1.31, 0.12]} s={0.45} />
    </group>
  );
}

function Dresser() {
  const z = (WINDOW.z0 + WINDOW.z1) / 2;
  const len = 1.3;
  return (
    <group>
      <Box p={[0.24, 0.4, z]} s={[0.46, 0.8, len]} c={ROOM.dresser} />
      {/* two big drawers on the north half, open cubby with books on the south half */}
      {[0.58, 0.24].map((y) => (
        <group key={y}>
          <Box p={[0.475, y, z - 0.3]} s={[0.01, 0.28, 0.6]} c={ROOM.dresserFront} cast={false} />
          <Box p={[0.485, y, z - 0.3]} s={[0.01, 0.025, 0.16]} c={ROOM.handle} cast={false} />
        </group>
      ))}
      <Box p={[0.475, 0.24, z + 0.33]} s={[0.01, 0.28, 0.5]} c={ROOM.dresserFront} cast={false} />
      <Box p={[0.485, 0.24, z + 0.33]} s={[0.01, 0.025, 0.14]} c={ROOM.handle} cast={false} />
      <Box p={[0.3, 0.58, z + 0.33]} s={[0.36, 0.26, 0.54]} c={ROOM.handle} cast={false} />
      {[ROOM.bookB, ROOM.bookC, ROOM.bookA].map((c, i) => (
        <Box key={c} p={[0.32, 0.48 + i * 0.045, z + 0.28]} s={[0.26, 0.04, 0.3]} c={c} />
      ))}
      {/* on top: small photo */}
      <Box p={[0.2, 0.88, z + 0.1]} s={[0.02, 0.14, 0.11]} c={ROOM.woodDark} r={[0, 0, 0.12]} />
    </group>
  );
}

/** The bed sits in the north-west corner, headboard against the balcony wall. */
function Bed() {
  const z = 0.58;
  return (
    <group>
      <Box p={[0.06, 0.5, z]} s={[0.08, 1.0, 1.06]} c={ROOM.woodDark} />
      <Box p={[1.05, 0.18, z]} s={[2.0, 0.26, 1.04]} c={ROOM.woodMid} />
      <Box p={[1.07, 0.39, z]} s={[1.95, 0.16, 0.98]} c={ROOM.sheet} />
      <Box p={[0.32, 0.51, z]} s={[0.32, 0.1, 0.62]} c={ROOM.pillow} />
      <Box p={[1.25, 0.48, z]} s={[1.45, 0.04, 1.02]} c={ROOM.blanket} />
      <Box p={[1.72, 0.505, z]} s={[0.45, 0.03, 1.04]} c={ROOM.throw} />
      <Box p={[2.04, 0.22, z]} s={[0.06, 0.44, 1.06]} c={ROOM.woodDark} />
    </group>
  );
}

/** Bedside table between the bed and the bookshelf, with the amber lamp. */
function Nightstand() {
  const [x, , z] = BEDSIDE_LAMP;
  return (
    <group>
      <Box p={[x, 0.24, z]} s={[0.38, 0.48, 0.3]} c={ROOM.woodDark} />
      <Box p={[x + 0.191, 0.34, z]} s={[0.01, 0.13, 0.25]} c={ROOM.woodMid} cast={false} />
      <Box p={[x + 0.198, 0.34, z]} s={[0.01, 0.02, 0.07]} c={ROOM.handle} cast={false} />
      {/* amber lamp */}
      <Cyl p={[x, 0.54, z]} rt={0.03} rb={0.05} h={0.12} c="#d9d4cc" />
      <mesh position={[x, 0.7, z]} userData={{ ownGlow: true }}>
        <coneGeometry args={[0.1, 0.16, 6]} />
        <NightGlow color={ROOM.amberShade} glow={ROOM.amberGlow} night={1.4} />
      </mesh>
    </group>
  );
}

function ViewA() {
  return (
    <group>
      <WallArtAndRug />
      <CutWall side="south">
        <WallClock />
        {/* wall socket above the side table */}
        <Box p={[DESK_X + 1.15, 1.05, D - 0.005]} s={[0.1, 0.14, 0.01]} c={ROOM.frame} cast={false} />
      </CutWall>
      {/* the desk set stays in every view */}
      <Glow spot="work">
        <Desk />
      </Glow>
      <DeskLamp />
      <Cabinet />
      <SideTable />
      <CutWall side={["south", "west"]} dropShadows>
        <PetBed />
      </CutWall>
      <CutWall side="west" dropShadows>
        <Glow spot="about">
          <Bookshelf />
        </Glow>
        <Glow spot="creatives">
          <Gallery />
        </Glow>
        <Dresser />
      </CutWall>
      {/* the bed sits in the corner: it hides only when both its walls are cut away */}
      <CutWall side={["north", "west"]} dropShadows>
        <Nightstand />
        <Bed />
        <Kuromi />
      </CutWall>
    </group>
  );
}

// the room never changes after it's built: skip re-rendering it when its parent does
export default memo(ViewA);
