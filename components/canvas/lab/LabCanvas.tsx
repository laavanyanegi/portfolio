"use client";

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import type * as THREE from "three";
import { ROOM } from "@/lib/roomPalette";
import CornerScene from "./CornerScene";
import PixelPass from "./PixelPass";

const LOOK_AT: [number, number, number] = [2.1, 0.9, 3.0];
const AZIMUTH = (3 * Math.PI) / 4; // looking from the north-east into the south-west corner
const POLAR = 1.0;

/** Keep the corner filling the screen at any window size. */
function FitZoom() {
  const size = useThree((s) => s.size);
  const get = useThree((s) => s.get);
  useEffect(() => {
    const cam = get().camera as THREE.OrthographicCamera;
    // on wide screens the tuning panel sits on the right, so frame the room in the space left of it
    const panel = size.width >= 640 ? 340 : 0;
    const w = size.width - panel;
    cam.zoom = Math.min(w / 7.2, size.height / 5.6);
    if (panel) cam.setViewOffset(size.width, size.height, panel / 2, 0, size.width, size.height);
    else cam.clearViewOffset();
    cam.updateProjectionMatrix();
  }, [get, size.width, size.height]);
  return null;
}

export default function LabCanvas({ night, reducedMotion }: { night: boolean; reducedMotion: boolean }) {
  const r = 20;
  const pos: [number, number, number] = [
    LOOK_AT[0] + r * Math.sin(POLAR) * Math.sin(AZIMUTH),
    LOOK_AT[1] + r * Math.cos(POLAR),
    LOOK_AT[2] + r * Math.sin(POLAR) * Math.cos(AZIMUTH),
  ];
  return (
    <Canvas
      shadows
      dpr={1}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      aria-label="Pixel-art preview of the desk and balcony corner of Laavanya's room"
      role="img"
      fallback={
        <p className="p-6 text-ink">This preview needs WebGL, which your browser has turned off.</p>
      }
    >
      <color attach="background" args={[night ? ROOM.voidNight : ROOM.voidDay]} />
      <OrthographicCamera makeDefault position={pos} near={0.1} far={60} />
      <FitZoom />
      <OrbitControls
        target={LOOK_AT}
        enablePan={false}
        enableZoom={false}
        enableDamping={!reducedMotion}
        minAzimuthAngle={AZIMUTH - 0.45}
        maxAzimuthAngle={AZIMUTH + 0.45}
        minPolarAngle={POLAR - 0.3}
        maxPolarAngle={POLAR + 0.25}
      />
      <CornerScene night={night} />
      <PixelPass mode={night ? "night" : "day"} animate={!reducedMotion} />
    </Canvas>
  );
}
