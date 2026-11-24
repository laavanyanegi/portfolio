"use client";

import { Suspense, useMemo, useRef, type ReactNode } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { ROOM } from "@/lib/roomPalette";
import { creamRugTexture, mirrorTexture } from "../textures";
import { ENTRY_DOOR, FLOOR_LAMP, LIGHT_SWITCH, MIRROR, W } from "./dims";
import { Box, Cyl, Glow, NightGlow } from "./parts";
import { CutWall } from "./Shell";

/**
 * The bed wall (north, z = 0) and the closet wall (east, x = W), from Laavanya's bed-wall and
 * closet-wall references. Everything hung on a wall or standing against it hides with that wall
 * when it is cut away, so nothing blocks or floats in the other views.
 */

/** Closet-wall space: u runs along the wall (north → south, world z), d out from the wall into the room. */
function EastWall({ children }: { children: ReactNode }) {
  return (
    <group position={[W, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
      {children}
    </group>
  );
}

const SILVER = "#c9c9cf";

/* ───────── bed wall (north) ───────── */

/** Books standing on the bed-wall shelf, left → right: [width, height, colour]. */
const SHELF_BOOKS: [number, number, string][] = [
  [0.05, 0.24, "#4a3a6b"],
  [0.045, 0.27, "#2f3552"],
  [0.055, 0.25, "#6b4f8a"],
  [0.04, 0.22, "#4d5a2e"],
  [0.05, 0.26, "#c9a45a"],
];
const SHELF_BOOK_X = SHELF_BOOKS.reduce<number[]>((xs, [w], i) => {
  const prev = i ? xs[i - 1] + SHELF_BOOKS[i - 1][0] / 2 + 0.008 : 0;
  return [...xs, prev + w / 2];
}, []);

/** Wall shelf above the bed (from the bed-wall shelf reference): standing books, a stack lying flat, a potted cactus. */
function BedShelf() {
  const x0 = 0.5;
  const len = 1.3;
  const dep = 0.22;
  const y = 1.72; // top of the plank
  return (
    <group>
      <Box p={[x0 + len / 2, y - 0.0175, dep / 2]} s={[len, 0.035, dep]} c={ROOM.woodDark} />
      {[0.16, len - 0.16].map((dx) => (
        <Box key={dx} p={[x0 + dx, y - 0.1, 0.06]} s={[0.03, 0.13, 0.12]} c="#3a2214" />
      ))}
      {SHELF_BOOKS.map(([w, h, c], i) => (
        <Box key={i} p={[x0 + 0.12 + SHELF_BOOK_X[i], y + h / 2, 0.11]} s={[w, h, 0.16]} c={c} />
      ))}
      {/* a stack lying flat */}
      <Box p={[x0 + 0.74, y + 0.0225, 0.11]} s={[0.27, 0.045, 0.17]} c="#5b3f7a" />
      <Box p={[x0 + 0.75, y + 0.065, 0.11]} s={[0.24, 0.04, 0.16]} c="#3f6b4a" />
      <Box p={[x0 + 0.735, y + 0.1025, 0.11]} s={[0.21, 0.035, 0.15]} c="#3a3a4a" />
      {/* terracotta pot with a cactus */}
      <Cyl p={[x0 + 1.08, y + 0.06, 0.11]} rt={0.075} rb={0.06} h={0.12} c="#b8643e" seg={8} />
      <Cyl p={[x0 + 1.08, y + 0.125, 0.11]} rt={0.082} rb={0.082} h={0.03} c="#a0542f" seg={8} />
      <Cyl p={[x0 + 1.08, y + 0.22, 0.11]} rt={0.038} rb={0.048} h={0.18} c="#4e7a3a" seg={6} />
      <Cyl p={[x0 + 1.125, y + 0.24, 0.11]} rt={0.02} rb={0.022} h={0.08} c="#5d8c45" seg={6} />
      <Cyl p={[x0 + 1.03, y + 0.2, 0.11]} rt={0.018} rb={0.02} h={0.06} c="#5d8c45" seg={6} />
    </group>
  );
}

function FloorLamp() {
  const { x, z } = FLOOR_LAMP;
  return (
    <group position={[x, 0, z]}>
      <Cyl p={[0, 0.015, 0]} rt={0.13} rb={0.14} h={0.03} c="#1d1b1f" />
      <Cyl p={[0, 0.72, 0]} rt={0.014} rb={0.014} h={1.4} c="#1d1b1f" />
      <mesh position={[0, 1.55, 0]} userData={{ ownGlow: true }}>
        <cylinderGeometry args={[0.15, 0.2, 0.27, 16, 1, true]} />
        <NightGlow color="#f3e6c8" glow="#ffcf8a" day={0.05} night={1.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** Full-length mirror leaning on the wall, framed with little bulbs that light up at night. */
function Mirror() {
  const glass = useMemo(() => mirrorTexture(), []);
  const { x, w, h } = MIRROR;
  const lean = 0.17; // radians back towards the wall
  const bulbs = useMemo(() => {
    const out: [number, number][] = [];
    const n = 7;
    for (let i = 0; i <= n; i++) {
      out.push([-w / 2, (h * i) / n], [w / 2, (h * i) / n]);
    }
    for (let i = 1; i < 4; i++) out.push([-w / 2 + (w * i) / 4, h], [-w / 2 + (w * i) / 4, 0]);
    return out;
  }, [w, h]);
  return (
    <group position={[x, 0, 0.06 + Math.sin(lean) * h]} rotation={[-lean, 0, 0]}>
      {/* frame + glass */}
      <Box p={[0, h / 2, 0]} s={[w, h, 0.04]} c={ROOM.woodMid} />
      <mesh position={[0, h / 2, 0.021]} receiveShadow>
        <planeGeometry args={[w - 0.08, h - 0.08]} />
        <meshStandardMaterial map={glass} roughness={0.15} metalness={0.2} />
      </mesh>
      {bulbs.map(([bx, by], i) => (
        <mesh key={i} position={[bx, by, 0.025]} userData={{ ownGlow: true }}>
          <sphereGeometry args={[0.012, 6, 4]} />
          <NightGlow color="#fff1cc" glow="#ffd38a" day={0.3} night={2.4} />
        </mesh>
      ))}
    </group>
  );
}

function BedRug() {
  const tex = useMemo(() => creamRugTexture(), []);
  return (
    <mesh position={[3.2, 0.003, 0.55]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[1.7, 0.9]} />
      <meshStandardMaterial map={tex} roughness={1} />
    </mesh>
  );
}

/* ───────── closet wall (east) ───────── */

/** Tall dark-wood wardrobe: three columns, short doors on top, tall doors below. */
function Wardrobe() {
  const u0 = 0.03, wid = 1.54, dep = 0.6, hgt = 2.3;
  const col = wid / 3;
  return (
    <group>
      <Box p={[u0 + wid / 2, hgt / 2, dep / 2]} s={[wid, hgt, dep]} c={ROOM.woodDark} />
      {[0, 1, 2].map((i) => {
        const cu = u0 + col * (i + 0.5);
        return (
          <group key={i}>
            <Box p={[cu, 2.02, dep + 0.006]} s={[col - 0.03, 0.42, 0.012]} c="#57351f" cast={false} />
            <Box p={[cu, 0.95, dep + 0.006]} s={[col - 0.03, 1.66, 0.012]} c="#57351f" cast={false} />
          </group>
        );
      })}
      {/* handles where the doors meet */}
      {[col * 0.98, col * 1.02, col * 1.98].map((du, i) => (
        <group key={i}>
          <Box p={[u0 + du, 1.95, dep + 0.02]} s={[0.012, 0.1, 0.012]} c={SILVER} cast={false} />
          <Box p={[u0 + du, 1.05, dep + 0.02]} s={[0.012, 0.16, 0.012]} c={SILVER} cast={false} />
        </group>
      ))}
      <Box p={[u0 + wid / 2, 0.04, dep - 0.02]} s={[wid, 0.08, 0.02]} c="#3a2214" cast={false} />
    </group>
  );
}

/** Glass-front cabinet: shelves of jars and books behind glass, four drawers below. */
function GlassCabinet() {
  const u0 = 1.6, wid = 0.88, dep = 0.42, hgt = 2.02;
  const books = [ROOM.bookA, ROOM.bookB, ROOM.bookC, ROOM.lampBase, "#c96b4a"];
  return (
    <group>
      {/* solid drawer base, then a hollow glass-fronted top: back, sides, top */}
      <Box p={[u0 + wid / 2, 0.46, dep / 2]} s={[wid, 0.92, dep]} c={ROOM.woodMid} />
      <Box p={[u0 + wid / 2, 1.47, 0.02]} s={[wid, 1.1, 0.04]} c="#3a2214" />
      <Box p={[u0 + 0.02, 1.47, dep / 2]} s={[0.04, 1.1, dep]} c={ROOM.woodMid} />
      <Box p={[u0 + wid - 0.02, 1.47, dep / 2]} s={[0.04, 1.1, dep]} c={ROOM.woodMid} />
      <Box p={[u0 + wid / 2, hgt - 0.03, dep / 2]} s={[wid + 0.03, 0.06, dep + 0.02]} c={ROOM.woodMid} />
      {[1.12, 1.45, 1.78].map((y) => (
        <Box key={y} p={[u0 + wid / 2, y - 0.16, dep / 2]} s={[wid - 0.08, 0.015, dep - 0.04]} c={ROOM.woodMid} cast={false} />
      ))}
      {/* jars on the top shelf, books in the middle, books + jars at the bottom */}
      {[0.14, 0.27, 0.42, 0.6, 0.72].map((du, i) => (
        <Cyl key={`j${i}`} p={[u0 + du, 1.7, dep - 0.08]} rt={0.03} rb={0.03} h={0.1 + (i % 2) * 0.04} c={i % 2 ? "#c9a35a" : "#9fb7c9"} cast={false} />
      ))}
      {books.map((c, i) => (
        <Box key={`b${i}`} p={[u0 + 0.16 + i * 0.05, 1.4, dep - 0.08]} s={[0.04, 0.18 - (i % 3) * 0.03, 0.11]} c={c} cast={false} />
      ))}
      {[0, 1, 2].map((i) => (
        <Box key={`s${i}`} p={[u0 + 0.62, 1.31 + i * 0.035, dep - 0.08]} s={[0.24, 0.03, 0.14]} c={books[(i + 2) % 5]} cast={false} />
      ))}
      {[0.2, 0.32].map((du, i) => (
        <Cyl key={`k${i}`} p={[u0 + du, 1.04, dep - 0.08]} rt={0.032} rb={0.032} h={0.12} c={i ? "#b96b45" : "#9fb7c9"} cast={false} />
      ))}
      {/* glass doors: frames + panes */}
      {[0.25, 0.75].map((f) => (
        <group key={f}>
          <mesh position={[u0 + wid * f, 1.45, dep + 0.006]}>
            <planeGeometry args={[wid / 2 - 0.06, 0.96]} />
            <meshBasicMaterial color="#cfe3ee" transparent opacity={0.12} depthWrite={false} />
          </mesh>
          <Box p={[u0 + wid * f - (wid / 4 - 0.025), 1.45, dep + 0.008]} s={[0.025, 1.0, 0.012]} c={ROOM.woodDark} cast={false} />
          <Box p={[u0 + wid * f + (wid / 4 - 0.025), 1.45, dep + 0.008]} s={[0.025, 1.0, 0.012]} c={ROOM.woodDark} cast={false} />
          <Box p={[u0 + wid * f, 1.94, dep + 0.008]} s={[wid / 2 - 0.02, 0.025, 0.012]} c={ROOM.woodDark} cast={false} />
          <Box p={[u0 + wid * f, 0.96, dep + 0.008]} s={[wid / 2 - 0.02, 0.025, 0.012]} c={ROOM.woodDark} cast={false} />
        </group>
      ))}
      <Box p={[u0 + wid / 2 - 0.03, 1.45, dep + 0.02]} s={[0.01, 0.12, 0.01]} c={SILVER} cast={false} />
      <Box p={[u0 + wid / 2 + 0.03, 1.45, dep + 0.02]} s={[0.01, 0.12, 0.01]} c={SILVER} cast={false} />
      {/* four drawers */}
      {[0.12, 0.32, 0.52, 0.72].map((y) => (
        <group key={y}>
          <Box p={[u0 + wid / 2, y, dep + 0.006]} s={[wid - 0.06, 0.17, 0.012]} c="#9a6a40" cast={false} />
          <Box p={[u0 + wid / 2, y, dep + 0.018]} s={[0.12, 0.014, 0.012]} c={SILVER} cast={false} />
        </group>
      ))}
    </group>
  );
}

/** Low two-door sideboard with a small framed photo on top. */
function Sideboard() {
  const u0 = 2.56, wid = 1.12, dep = 0.42, hgt = 0.86;
  return (
    <group>
      <Box p={[u0 + wid / 2, hgt / 2 + 0.04, dep / 2]} s={[wid, hgt - 0.08, dep]} c={ROOM.woodDark} />
      <Box p={[u0 + wid / 2, hgt - 0.01, dep / 2 + 0.01]} s={[wid + 0.04, 0.03, dep + 0.03]} c="#57351f" />
      {[0.25, 0.75].map((f) => (
        <group key={f}>
          <Box p={[u0 + wid * f, 0.45, dep + 0.006]} s={[wid / 2 - 0.05, 0.66, 0.012]} c="#57351f" cast={false} />
          <Box p={[u0 + wid / 2 + (f < 0.5 ? -0.04 : 0.04), 0.5, dep + 0.02]} s={[0.01, 0.1, 0.01]} c={SILVER} cast={false} />
        </group>
      ))}
      {[0.08, wid - 0.08].map((du) => (
        <Box key={du} p={[u0 + du, 0.02, dep / 2]} s={[0.05, 0.04, dep - 0.06]} c="#3a2214" />
      ))}
      {/* framed photo */}
      <group position={[u0 + 0.88, hgt + 0.1, 0.2]} rotation={[0, 0.2, 0]}>
        <Box p={[0, 0, 0]} s={[0.14, 0.17, 0.02]} c={ROOM.woodMid} />
        <Box p={[0, 0, 0.011]} s={[0.1, 0.12, 0.004]} c="#6f9ac0" cast={false} />
        <Box p={[0, -0.06, -0.05]} s={[0.02, 0.12, 0.02]} r={[0.6, 0, 0]} c={ROOM.woodMid} />
      </group>
    </group>
  );
}

/** Laavanya's own photo (public/room/closet-photo.webp, 5:4) inside the gold frame. */
function FramedPhotoImage() {
  const tex = useTexture("/room/closet-photo.webp", (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
  });
  return (
    <mesh position={[0, 0, 0.031]}>
      <planeGeometry args={[0.58, 0.464]} />
      <meshStandardMaterial map={tex} roughness={0.9} />
    </mesh>
  );
}

/** Gold photo frame above the sideboard. */
function FramedPhoto() {
  return (
    <group position={[3.14, 1.55, 0]}>
      <Box p={[0, 0, 0.015]} s={[0.66, 0.53, 0.03]} c="#b08a4a" />
      <Suspense fallback={null}>
        <FramedPhotoImage />
      </Suspense>
    </group>
  );
}

/** The light switch by the door: click it to switch day/night (same as the switch icon in the top bar). */
function LightSwitch({ night, onToggle, enabled }: { night: boolean; onToggle: () => void; enabled: boolean }) {
  const rocker = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (rocker.current) {
      const goal = night ? -0.35 : 0.35;
      rocker.current.rotation.x += (goal - rocker.current.rotation.x) * Math.min(1, dt * 14);
    }
  });
  const pointer = (on: boolean) => (e: ThreeEvent<PointerEvent>) => {
    if (!enabled) return;
    e.stopPropagation();
    (e.nativeEvent.target as HTMLElement).style.cursor = on ? "pointer" : "";
  };
  return (
    <group
      position={[LIGHT_SWITCH.z, LIGHT_SWITCH.y, 0]}
      onClick={(e) => {
        if (!enabled) return;
        e.stopPropagation();
        onToggle();
      }}
      onPointerOver={pointer(true)}
      onPointerOut={pointer(false)}
    >
      <Box p={[0, 0, 0.006]} s={[0.085, 0.12, 0.012]} c={ROOM.frame} cast={false} />
      <mesh ref={rocker} position={[0, 0, 0.016]}>
        <boxGeometry args={[0.035, 0.055, 0.014]} />
        <meshStandardMaterial color="#f7f2e8" roughness={0.6} />
      </mesh>
      {/* a bigger invisible target, so it is easy to click */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[0.16, 0.2, 0.02]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
    </group>
  );
}

/** Dark-wood entry door with two raised panels and a silver lever (the Contact spot). */
function EntryDoor() {
  const { z0, z1, h } = ENTRY_DOOR;
  const wid = z1 - z0;
  const cu = (z0 + z1) / 2;
  return (
    <group>
      {/* architrave */}
      <Box p={[z0 - 0.04, (h + 0.06) / 2, 0.02]} s={[0.07, h + 0.06, 0.04]} c="#3a2214" />
      <Box p={[z1 + 0.04, (h + 0.06) / 2, 0.02]} s={[0.07, h + 0.06, 0.04]} c="#3a2214" />
      <Box p={[cu, h + 0.05, 0.02]} s={[wid + 0.15, 0.07, 0.04]} c="#3a2214" />
      {/* leaf + panels */}
      <Box p={[cu, h / 2, 0.012]} s={[wid, h, 0.024]} c="#4a2a18" />
      <Box p={[cu, h * 0.71, 0.026]} s={[wid - 0.22, h * 0.42, 0.008]} c="#3a2012" cast={false} />
      <Box p={[cu, h * 0.25, 0.026]} s={[wid - 0.22, h * 0.36, 0.008]} c="#3a2012" cast={false} />
      {/* lever handle on the north side */}
      <Cyl p={[z0 + 0.1, 1.0, 0.03]} rt={0.025} rb={0.025} h={0.01} c={SILVER} cast={false} />
      <Box p={[z0 + 0.15, 1.0, 0.05]} s={[0.11, 0.018, 0.018]} c={SILVER} />
      <Box p={[z0 + 0.1, 0.92, 0.03]} s={[0.035, 0.06, 0.008]} c={SILVER} cast={false} />
    </group>
  );
}

export default function ViewB({
  night,
  onToggleNight,
  interactive,
}: {
  night: boolean;
  onToggleNight: () => void;
  /** the light switch only responds on home, with this side of the room in view */
  interactive: boolean;
}) {
  return (
    <group>
      {/* bed wall */}
      <CutWall side="north" dropShadows>
        <BedShelf />
        <FloorLamp />
        <Mirror />
      </CutWall>
      <BedRug />

      {/* closet wall */}
      <CutWall side="east" dropShadows>
        <EastWall>
          <Wardrobe />
          <GlassCabinet />
          <Sideboard />
          <FramedPhoto />
          <LightSwitch night={night} onToggle={onToggleNight} enabled={interactive} />
          <Glow spot="contact">
            <EntryDoor />
          </Glow>
        </EastWall>
      </CutWall>
    </group>
  );
}
