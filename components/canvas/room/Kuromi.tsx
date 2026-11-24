"use client";

import type { ReactNode } from "react";
import type { V3 } from "./dims";

/**
 * Laavanya's Kuromi plush, sitting on the inner side of the bed (between the pillow and the bed wall),
 * facing the foot of the bed and turned a little towards the room.
 * Built from simple rounded shapes so it reads at pixel size: charcoal hood with two pointed ears,
 * pink skull badge, white face and body, dark collar with pink pom-poms, pink paws.
 */
const HOOD = "#3b3940";
const WHITE = "#f4efe9";
const PINK = "#f2a7b8";
const INK = "#141214";

function Blob({ p, r, c, rot, cast = true }: { p: V3; r: V3; c: string; rot?: V3; cast?: boolean }) {
  return (
    <mesh position={p} rotation={rot} scale={r} castShadow={cast} receiveShadow>
      <sphereGeometry args={[1, 12, 8]} />
      <meshStandardMaterial color={c} roughness={0.95} />
    </mesh>
  );
}

function Ear({ side }: { side: 1 | -1 }): ReactNode {
  return (
    <group position={[side * 0.062, 0.285, -0.005]} rotation={[0, 0, -side * 0.55]}>
      <mesh position={[0, 0.055, 0]} castShadow>
        <coneGeometry args={[0.042, 0.13, 10]} />
        <meshStandardMaterial color={HOOD} roughness={0.95} />
      </mesh>
      {/* the tip curls outwards */}
      <Blob p={[side * 0.012, 0.118, 0]} r={[0.014, 0.014, 0.014]} c={HOOD} />
    </group>
  );
}

export default function Kuromi({ p = [0.33, 0.47, 0.19], turn = Math.PI / 2 - 0.4 }: { p?: V3; turn?: number }) {
  return (
    <group position={p} rotation={[0, turn, 0]}>
      {/* body, feet, arms + paws */}
      <Blob p={[0, 0.07, 0]} r={[0.072, 0.07, 0.064]} c={WHITE} />
      <Blob p={[-0.038, 0.025, 0.05]} r={[0.028, 0.025, 0.034]} c={WHITE} />
      <Blob p={[0.038, 0.025, 0.05]} r={[0.028, 0.025, 0.034]} c={WHITE} />
      <Blob p={[-0.072, 0.085, 0.02]} r={[0.024, 0.04, 0.024]} rot={[0.3, 0, 0.5]} c={WHITE} />
      <Blob p={[0.072, 0.085, 0.02]} r={[0.024, 0.04, 0.024]} rot={[0.3, 0, -0.5]} c={WHITE} />
      <Blob p={[-0.085, 0.058, 0.036]} r={[0.018, 0.016, 0.016]} c={PINK} cast={false} />
      <Blob p={[0.085, 0.058, 0.036]} r={[0.018, 0.016, 0.016]} c={PINK} cast={false} />

      {/* jester collar with pink pom-poms */}
      <mesh position={[0, 0.132, 0.004]} castShadow>
        <cylinderGeometry args={[0.055, 0.082, 0.035, 10]} />
        <meshStandardMaterial color={HOOD} roughness={0.95} />
      </mesh>
      <Blob p={[-0.04, 0.112, 0.066]} r={[0.017, 0.017, 0.017]} c={PINK} cast={false} />
      <Blob p={[0.04, 0.112, 0.066]} r={[0.017, 0.017, 0.017]} c={PINK} cast={false} />

      {/* hood + ears */}
      <Blob p={[0, 0.215, -0.006]} r={[0.104, 0.096, 0.094]} c={HOOD} />
      <Ear side={1} />
      <Ear side={-1} />

      {/* white face set into the hood, with eyes, nose and the pink skull above */}
      <Blob p={[0, 0.193, 0.052]} r={[0.074, 0.06, 0.05]} c={WHITE} cast={false} />
      <Blob p={[-0.027, 0.2, 0.1]} r={[0.01, 0.016, 0.006]} c={INK} cast={false} />
      <Blob p={[0.027, 0.2, 0.1]} r={[0.01, 0.016, 0.006]} c={INK} cast={false} />
      <Blob p={[0, 0.182, 0.102]} r={[0.007, 0.005, 0.004]} c={PINK} cast={false} />
      <Blob p={[0, 0.268, 0.084]} r={[0.026, 0.022, 0.01]} rot={[-0.5, 0, 0]} c={PINK} cast={false} />
      <Blob p={[-0.009, 0.271, 0.094]} r={[0.005, 0.005, 0.003]} rot={[-0.5, 0, 0]} c={INK} cast={false} />
      <Blob p={[0.009, 0.271, 0.094]} r={[0.005, 0.005, 0.003]} rot={[-0.5, 0, 0]} c={INK} cast={false} />
    </group>
  );
}
