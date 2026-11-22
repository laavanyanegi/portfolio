"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

/** Pixel light-switch icon. Lights on = day. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const night = mounted && resolvedTheme === "night";

  return (
    <button
      type="button"
      onClick={() => setTheme(night ? "day" : "night")}
      aria-label={night ? "Switch to day mode" : "Switch to night mode"}
      aria-pressed={night}
      className={`grid h-10 w-10 place-items-center rounded-sm border-2 border-current bg-panel text-ink ${className}`}
    >
      <svg viewBox="0 0 12 12" width="22" height="22" shapeRendering="crispEdges" aria-hidden="true">
        <rect x="3" y="1" width="6" height="10" fill="currentColor" opacity="0.2" />
        <rect x="3" y="1" width="6" height="10" fill="none" stroke="currentColor" strokeWidth="1" />
        <rect x="4" y={night ? 6 : 2} width="4" height="4" fill="currentColor" />
      </svg>
    </button>
  );
}
