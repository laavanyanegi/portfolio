"use client";

import { useRef, useState } from "react";
import { LOOK_PER_PX, useLook } from "@/store/look";

/**
 * Phones: a see-through orb over the room floor. Dragging it looks around from the bed, all the way
 * round; letting go leaves the view there. A tap (or Enter) turns back to face Laavanya.
 * The dot inside shows where she is: at the top when facing her.
 */
export default function LookOrb({ className = "" }: { className?: string }) {
  const yaw = useLook((s) => s.yaw);
  const recentre = useLook((s) => s.recentre);
  const drag = useRef<{ x: number; y: number; moved: number } | null>(null);
  const [active, setActive] = useState(false);

  return (
    <button
      type="button"
      aria-label="Look around the room: drag to turn, or use the arrow keys. Tap to face Laavanya again."
      className={`look-orb ${active ? "is-active" : ""} ${className}`}
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, y: e.clientY, moved: 0 };
        e.currentTarget.setPointerCapture(e.pointerId);
        setActive(true);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.x;
        const dy = e.clientY - d.y;
        d.moved += Math.abs(dx) + Math.abs(dy);
        d.x = e.clientX;
        d.y = e.clientY;
        useLook.getState().lookBy(dx * LOOK_PER_PX.yaw, dy * LOOK_PER_PX.pitch);
      }}
      onPointerUp={() => setActive(false)}
      onPointerCancel={() => {
        drag.current = null;
        setActive(false);
      }}
      onClick={() => {
        // a tap (not the end of a drag) turns back to her; keyboard Enter/Space lands here too
        const d = drag.current;
        drag.current = null;
        if (!d || d.moved < 8) recentre();
      }}
    >
      <span
        className="look-orb-dot"
        aria-hidden="true"
        style={{ transform: `translate(${(Math.sin(yaw) * 18).toFixed(1)}px, ${(-Math.cos(yaw) * 18).toFixed(1)}px)` }}
      />
    </button>
  );
}
