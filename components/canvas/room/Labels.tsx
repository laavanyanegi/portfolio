"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sections } from "@/content/nav";
import { useUI, type Spot } from "@/store/ui";
import { buzz } from "@/lib/device";
import { SPOTS } from "./dims";
import { isCut } from "./Shell";

export type LabelEls = { current: Partial<Record<Spot, HTMLAnchorElement | null>> };

const BUILT: Spot[] = ["work", "about", "creatives", "contact"];

/**
 * Floating pixel signs above each section's spot. They are ordinary links laid over the canvas
 * (keyboard and screen-reader friendly); <LabelTracker> moves them to follow the room each frame,
 * and shows each one exactly while its wall is on screen (also part-way through a turn).
 */
export function RoomLabels({ elsRef, navigate }: { elsRef: LabelEls; navigate: (href: string) => void }) {
  const setHover = useUI((s) => s.setHoverSpot);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {sections.map((s) => {
        const spot = s.label as Spot;
        if (!BUILT.includes(spot)) return null;
        return (
          <a
            key={spot}
            ref={(el) => {
              elsRef.current[spot] = el;
            }}
            href={s.href}
            aria-label={`Open ${s.label}`}
            onClick={(e) => {
              e.preventDefault();
              setHover(null);
              buzz();
              navigate(s.href);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerEnter={() => setHover(spot)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(spot)}
            onBlur={() => setHover(null)}
            className="room-sign-hit pointer-events-auto"
            style={{ visibility: "hidden" }}
          >
            {/* the visible sign bobs inside a still hit area, so hovering never flickers */}
            <span className="room-sign font-pixel">{s.label}</span>
          </a>
        );
      })}
    </div>
  );
}

/** Inside the canvas: projects each spot to the screen and moves its sign there. */
export function LabelTracker({ elsRef }: { elsRef: LabelEls }) {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    // the camera has already moved this frame, but its matrices only catch up when the room is drawn:
    // bring them up to date first, or the signs trail one frame behind while the room turns
    camera.updateMatrixWorld();
    for (const spot of BUILT) {
      const el = elsRef.current[spot];
      if (!el) continue;
      v.set(...SPOTS[spot].pos).project(camera);
      // hidden while its wall is cut away (it swaps exactly when the wall does), or behind the visitor (phones)
      if (isCut(SPOTS[spot].wall, camera.position) || v.z > 1) {
        if (el.style.visibility !== "hidden") el.style.visibility = "hidden";
        continue;
      }
      const x = ((v.x + 1) / 2) * size.width;
      const y = ((1 - v.y) / 2) * size.height;
      el.style.translate = `calc(${x.toFixed(1)}px - 50%) calc(${y.toFixed(1)}px - 100%)`;
      if (el.style.visibility !== "visible") el.style.visibility = "visible";
    }
    // priority 1: always after the camera has moved this frame (the room is drawn at this priority too)
  }, 1);
  return null;
}
