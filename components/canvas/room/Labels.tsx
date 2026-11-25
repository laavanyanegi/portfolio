"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sections } from "@/content/nav";
import { useUI, VIEW_WALLS, type Spot } from "@/store/ui";
import { buzz } from "@/lib/device";
import { SPOTS } from "./dims";

export type LabelEls = { current: Partial<Record<Spot, HTMLAnchorElement | null>> };

const BUILT: Spot[] = ["work", "about", "creatives", "contact"];

/**
 * Floating pixel signs above each section's spot. They are ordinary links laid over the canvas
 * (keyboard and screen-reader friendly); <LabelTracker> moves them to follow the room each frame.
 */
export function RoomLabels({
  elsRef,
  navigate,
  all = false,
}: {
  elsRef: LabelEls;
  navigate: (href: string) => void;
  /** phones (looking round from the bed): every sign is live, and shows while its spot is in front */
  all?: boolean;
}) {
  const view = useUI((s) => s.view);
  const setHover = useUI((s) => s.setHoverSpot);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {sections.map((s) => {
        const spot = s.label as Spot;
        if (!BUILT.includes(spot) || (!all && !VIEW_WALLS[view].includes(SPOTS[spot].wall))) return null;
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
    for (const spot of BUILT) {
      const el = elsRef.current[spot];
      if (!el) continue;
      v.set(...SPOTS[spot].pos).project(camera);
      // behind the visitor (phones look all the way round): hide it
      if (v.z > 1) {
        el.style.visibility = "hidden";
        continue;
      }
      const x = ((v.x + 1) / 2) * size.width;
      const y = ((1 - v.y) / 2) * size.height;
      el.style.translate = `calc(${x.toFixed(1)}px - 50%) calc(${y.toFixed(1)}px - 100%)`;
      el.style.visibility = "visible";
    }
  });
  return null;
}
