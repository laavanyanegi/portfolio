"use client";

import { useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { ROOM } from "@/lib/roomPalette";
import { mandalaTexture, planksTexture, rugTexture, skylineTexture } from "./textures";

/**
 * South-west corner of the room: study wall (south, z = D) meets balcony wall (west, x = 0).
 * Units are metres. x runs west→east, z north→south, y up.
 */
const W = 5; // south wall length
const D = 4.5; // west wall length
const H = 2.8; // wall height
const T = 0.12; // wall thickness
const DOOR = { z0: 1.7, z1: 3.3, top: 2.3 }; // balcony glass door opening in the west wall

type V3 = [number, number, number];

function Box({
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

function Cyl({
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

function Shell() {
  const planks = useMemo(() => planksTexture(), []);
  const capY = H + 0.015;
  return (
    <group>
      {/* floor slab: planks on top, dark wood on the cut edges */}
      <mesh position={[(W - T) / 2, -0.075, (D + T) / 2]} receiveShadow>
        <boxGeometry args={[W + T, 0.15, D + T]} />
        {[0, 1, 2, 3, 4, 5].map((i) =>
          i === 2 ? (
            <meshStandardMaterial key={i} attach={`material-${i}`} map={planks} roughness={0.7} />
          ) : (
            <meshStandardMaterial key={i} attach={`material-${i}`} color={ROOM.floorSide} />
          ),
        )}
      </mesh>

      {/* west wall, built around the door opening */}
      <Box p={[-T / 2, H / 2, DOOR.z0 / 2]} s={[T, H, DOOR.z0]} c={ROOM.wall} />
      <Box
        p={[-T / 2, H / 2, (DOOR.z1 + D + T) / 2]}
        s={[T, H, D + T - DOOR.z1]}
        c={ROOM.wall}
      />
      <Box
        p={[-T / 2, (DOOR.top + H) / 2, (DOOR.z0 + DOOR.z1) / 2]}
        s={[T, H - DOOR.top, DOOR.z1 - DOOR.z0]}
        c={ROOM.wall}
      />
      {/* south wall */}
      <Box p={[(W - T) / 2, H / 2, D + T / 2]} s={[W + T, H, T]} c={ROOM.wall} />
      {/* dark caps on the cut wall tops */}
      <Box p={[-T / 2, capY, (D + T) / 2]} s={[T, 0.03, D + T]} c={ROOM.wallCap} cast={false} />
      <Box p={[(W - T) / 2, capY, D + T / 2]} s={[W + T, 0.03, T]} c={ROOM.wallCap} cast={false} />
      {/* invisible ceiling + north wall: never drawn, but they block sunlight so it only enters through the door */}
      {(
        [
          [[(W - T) / 2, H + 0.1, (D + T) / 2 - 0.5], [W + T + 2, 0.2, D + T + 3]],
          [[(W - T) / 2, H / 2, -T / 2 - 0.3], [W + T + 2, H + 0.4, T]],
        ] as [V3, V3][]
      ).map(([p, s], i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={s} />
          <meshBasicMaterial colorWrite={false} depthWrite={false} />
        </mesh>
      ))}
      {/* skirting */}
      <Box p={[0.01, 0.04, DOOR.z0 / 2]} s={[0.02, 0.08, DOOR.z0]} c={ROOM.frame} cast={false} />
      <Box p={[0.01, 0.04, (DOOR.z1 + D) / 2]} s={[0.02, 0.08, D - DOOR.z1]} c={ROOM.frame} cast={false} />
      <Box p={[W / 2, 0.04, D - 0.01]} s={[W, 0.08, 0.02]} c={ROOM.frame} cast={false} />
    </group>
  );
}

function BalconyDoor({ night }: { night: boolean }) {
  const sky = useMemo(() => ({ day: skylineTexture(false), night: skylineTexture(true) }), []);
  const zc = (DOOR.z0 + DOOR.z1) / 2;
  const zw = DOOR.z1 - DOOR.z0;
  const f = 0.06; // frame bar size
  const x = -T / 2;
  const bars: [V3, V3][] = [
    [[x, DOOR.top - f / 2, zc], [T + 0.02, f, zw]],
    [[x, f / 2, zc], [T + 0.02, f, zw]],
    [[x, DOOR.top / 2, DOOR.z0 + f / 2], [T + 0.02, DOOR.top, f]],
    [[x, DOOR.top / 2, DOOR.z1 - f / 2], [T + 0.02, DOOR.top, f]],
    [[x, DOOR.top / 2, zc], [T + 0.02, DOOR.top, f * 0.8]],
    [[x, 0.95, zc], [T + 0.02, f * 0.7, zw]],
    [[x, 1.65, zc], [T + 0.02, f * 0.5, zw]],
  ];
  return (
    <group>
      {/* the view, painted on a backdrop that does not block sunlight */}
      <mesh position={[-T + 0.01, DOOR.top / 2, zc]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[zw, DOOR.top]} />
        <meshBasicMaterial map={night ? sky.night : sky.day} color={night ? "#ffffff" : "#fff4e6"} />
      </mesh>
      {bars.map(([p, s], i) => (
        <Box key={i} p={p} s={s} c={ROOM.frame} />
      ))}
      {/* railing outside (only its shadow is seen) */}
      {Array.from({ length: 16 }, (_, i) => (
        <Box key={i} p={[-0.9, 0.5, DOOR.z0 - 0.4 + i * 0.16]} s={[0.03, 1, 0.03]} c={ROOM.railing} />
      ))}
      <Box p={[-0.9, 1.0, zc]} s={[0.05, 0.05, zw + 1]} c={ROOM.railing} />
      {/* curtains + rod */}
      {[DOOR.z0 - 0.32, DOOR.z1 + 0.02].map((z0, k) =>
        Array.from({ length: 5 }, (_, i) => (
          <Box
            key={`${k}-${i}`}
            p={[0.08 + (i % 2) * 0.04, 1.3, z0 + i * 0.06 + 0.03]}
            s={[0.04, 2.5, 0.07]}
            c={ROOM.curtain}
          />
        )),
      )}
      <mesh position={[0.1, 2.6, zc]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, zw + 0.9, 6]} />
        <meshStandardMaterial color={ROOM.rod} />
      </mesh>
    </group>
  );
}

function Plant({ p, s = 1 }: { p: V3; s?: number }) {
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

function Bookshelf() {
  const books = [ROOM.bookA, ROOM.bookB, ROOM.bookC, ROOM.lampBase, ROOM.bookA, ROOM.bookC];
  return (
    <group position={[0.2, 0, 0.6]}>
      <Box p={[0, 0.55, -0.4]} s={[0.34, 1.1, 0.03]} c={ROOM.woodMid} />
      <Box p={[0, 0.55, 0.4]} s={[0.34, 1.1, 0.03]} c={ROOM.woodMid} />
      <Box p={[-0.16, 0.55, 0]} s={[0.02, 1.1, 0.8]} c={ROOM.woodDark} />
      {[0.02, 0.38, 0.74, 1.09].map((y) => (
        <Box key={y} p={[0, y, 0]} s={[0.34, 0.03, 0.8]} c={ROOM.woodMid} />
      ))}
      {[0.04, 0.4].map((y, row) =>
        books.map((c, i) => (
          <Box
            key={`${row}-${i}`}
            p={[0, y + 0.14, -0.32 + i * 0.09 + row * 0.03]}
            s={[0.24, 0.26 - ((i + row) % 3) * 0.03, 0.07]}
            c={c}
          />
        )),
      )}
    </group>
  );
}

function Desk({ night }: { night: boolean }) {
  const z = D - 0.33;
  const top = 0.775;
  return (
    <group>
      <Box p={[2.25, 0.75, z]} s={[1.4, 0.05, 0.62]} c={ROOM.woodMid} />
      <Box p={[2.25, 0.68, z - 0.27]} s={[1.3, 0.1, 0.02]} c={ROOM.woodDark} />
      {[
        [1.6, z - 0.26],
        [2.9, z - 0.26],
        [1.6, z + 0.26],
        [2.9, z + 0.26],
      ].map(([x, zz]) => (
        <Box key={`${x}-${zz}`} p={[x, 0.36, zz]} s={[0.06, 0.72, 0.06]} c={ROOM.woodMid} />
      ))}

      {/* purple lamp */}
      <Cyl p={[1.72, top + 0.01, D - 0.2]} rt={0.07} rb={0.08} h={0.02} c={ROOM.lampBase} />
      <Cyl p={[1.72, top + 0.12, D - 0.2]} rt={0.015} rb={0.015} h={0.2} c={ROOM.lampBase} />
      <Cyl p={[1.72, top + 0.27, D - 0.2]} rt={0.08} rb={0.13} h={0.16} cast={false} seg={12}>
        <meshStandardMaterial
          color={ROOM.lampShade}
          emissive={ROOM.lampGlow}
          emissiveIntensity={night ? 1.6 : 0}
          side={THREE.DoubleSide}
        />
      </Cyl>

      {/* laptop: base + screen hinged at the back edge */}
      <Box p={[2.25, top + 0.01, D - 0.34]} s={[0.36, 0.02, 0.25]} c={ROOM.laptop} />
      <group position={[2.25, top + 0.02, D - 0.215]} rotation={[0.25, 0, 0]}>
        <Box p={[0, 0.12, 0]} s={[0.36, 0.24, 0.012]} c={ROOM.laptop} />
        <mesh position={[0, 0.125, -0.008]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.32, 0.2]} />
          <meshStandardMaterial
            color="#1b2430"
            emissive={night ? ROOM.screenNight : ROOM.screenDay}
            emissiveIntensity={night ? 1.4 : 0.5}
          />
        </mesh>
      </group>

      {/* desk clutter */}
      <Box p={[1.98, top + 0.005, D - 0.5]} s={[0.07, 0.01, 0.13]} c="#222" />
      <Cyl p={[2.5, top + 0.05, D - 0.14]} rt={0.035} rb={0.035} h={0.1} c={ROOM.pot} />
      <Cyl p={[2.58, top + 0.13, D - 0.1]} rt={0.035} rb={0.035} h={0.26} c={ROOM.bottle} />
      <Box p={[2.7, top + 0.09, D - 0.08]} s={[0.12, 0.16, 0.02]} c={ROOM.woodDark} r={[-0.15, 0, 0]} />
      <Box p={[2.78, top + 0.02, D - 0.3]} s={[0.2, 0.04, 0.26]} c={ROOM.bookA} />
      <Box p={[2.78, top + 0.06, D - 0.3]} s={[0.18, 0.04, 0.24]} c={ROOM.bookC} />
      <Box p={[2.0, top + 0.06, D - 0.12]} s={[0.08, 0.1, 0.08]} c={ROOM.pot} />
      <Plant p={[2.0, top + 0.08, D - 0.12]} s={0.3} />
    </group>
  );
}

function Chair() {
  return (
    <group position={[2.25, 0, D - 1.0]}>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <Box
            key={i}
            p={[Math.cos(a) * 0.15, 0.06, Math.sin(a) * 0.15]}
            s={[0.3, 0.035, 0.04]}
            r={[0, -a, 0]}
            c={ROOM.chair}
          />
        );
      })}
      <Cyl p={[0, 0.27, 0]} rt={0.025} rb={0.025} h={0.42} c={ROOM.chair} />
      <Box p={[0, 0.5, 0]} s={[0.5, 0.08, 0.48]} c={ROOM.chairMesh} />
      <group position={[0, 0.5, -0.24]} rotation={[-0.12, 0, 0]}>
        <Box p={[0, 0.38, 0]} s={[0.46, 0.62, 0.05]} c={ROOM.chairMesh} />
        <Box p={[0, 0.78, 0]} s={[0.3, 0.12, 0.06]} c={ROOM.chair} />
      </group>
      {[-0.28, 0.28].map((x) => (
        <group key={x}>
          <Box p={[x, 0.62, -0.02]} s={[0.04, 0.2, 0.04]} c={ROOM.chair} />
          <Box p={[x, 0.73, 0]} s={[0.07, 0.03, 0.26]} c={ROOM.chair} />
        </group>
      ))}
    </group>
  );
}

function SideTable({ night }: { night: boolean }) {
  const x = 3.6;
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
      {/* radio on the shelf */}
      <Box p={[x, 0.26, z]} s={[0.36, 0.19, 0.2]} c={ROOM.radio} />
      <Box p={[x, 0.26, z - 0.101]} s={[0.3, 0.12, 0.005]} c={ROOM.radioTrim} cast={false} />
      {/* amber lamp */}
      <Cyl p={[x + 0.1, 0.68, z + 0.05]} rt={0.03} rb={0.05} h={0.12} c="#d9d4cc" />
      <mesh position={[x + 0.1, 0.84, z + 0.05]}>
        <coneGeometry args={[0.1, 0.16, 6]} />
        <meshStandardMaterial
          color={ROOM.amberShade}
          emissive={ROOM.amberGlow}
          emissiveIntensity={night ? 1.4 : 0}
        />
      </mesh>
      {/* wall socket */}
      <Box p={[x - 0.05, 1.05, D - 0.005]} s={[0.1, 0.14, 0.01]} c={ROOM.frame} cast={false} />
    </group>
  );
}

function PetBed() {
  return (
    <group position={[4.45, 0, D - 0.55]}>
      <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.3, 0.09, 6, 14]} />
        <meshStandardMaterial color={ROOM.petBed} roughness={0.95} />
      </mesh>
      <Cyl p={[0, 0.04, 0]} rt={0.3} rb={0.3} h={0.06} c={ROOM.petCushion} seg={14} />
    </group>
  );
}

function WallArt() {
  const mandala = useMemo(() => mandalaTexture(), []);
  const rug = useMemo(() => rugTexture(), []);
  return (
    <group>
      <mesh position={[0.75, 1.55, D - 0.004]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[1.6, 1.6]} />
        <meshStandardMaterial map={mandala} transparent alphaTest={0.4} roughness={0.9} />
      </mesh>
      <mesh position={[2.25, 0.003, D - 0.9]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.8, 1.3]} />
        <meshStandardMaterial map={rug} roughness={1} />
      </mesh>
    </group>
  );
}

function Lights({ night }: { night: boolean }) {
  // sunlight travels east, down and a little south through the balcony door
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(2.5, 0, 2.5);
    return o;
  }, []);
  const shadowCam = { left: -7, right: 7, top: 7, bottom: -7, near: 0.5, far: 25 };

  return (
    <>
      <primitive object={target} />
      <directionalLight
        position={[-5.5, 3.8, -1.5]}
        target={target}
        color={night ? ROOM.moon : ROOM.sun}
        intensity={night ? 0.35 : 6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={shadowCam.left}
        shadow-camera-right={shadowCam.right}
        shadow-camera-top={shadowCam.top}
        shadow-camera-bottom={shadowCam.bottom}
        shadow-camera-near={shadowCam.near}
        shadow-camera-far={shadowCam.far}
      />
      <hemisphereLight
        args={[
          night ? ROOM.skyFillNight : ROOM.skyFillDay,
          night ? "#120c10" : ROOM.groundFillDay,
          night ? 0.35 : 1.2,
        ]}
      />
      {night && (
        <>
          <pointLight
            position={[1.72, 1.03, D - 0.22]}
            color={ROOM.lampGlow}
            intensity={3.2}
            distance={7}
            decay={1.6}
            castShadow
            shadow-mapSize={[512, 512]}
            shadow-bias={-0.002}
          />
          <pointLight position={[3.7, 0.82, D - 0.21]} color={ROOM.amberGlow} intensity={1.6} distance={4} decay={1.8} />
          <pointLight position={[2.25, 0.95, D - 0.55]} color={ROOM.screenGlow} intensity={0.6} distance={2} decay={2} />
        </>
      )}
    </>
  );
}

export default function CornerScene({ night }: { night: boolean }) {
  return (
    <group>
      <Lights night={night} />
      <Shell />
      <BalconyDoor night={night} />
      <WallArt />
      <Bookshelf />
      <Plant p={[0.3, 0, 1.4]} s={1.2} />
      <Desk night={night} />
      <Chair />
      <SideTable night={night} />
      <PetBed />
    </group>
  );
}
