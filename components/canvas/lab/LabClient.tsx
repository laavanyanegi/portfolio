"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import LabPanel from "@/components/ui/LabPanel";

const LabCanvas = dynamic(() => import("./LabCanvas"), {
  ssr: false,
  loading: () => <p className="p-6 text-muted">Loading the room…</p>,
});

const RM = "(prefers-reduced-motion: reduce)";
function subscribeRM(cb: () => void) {
  const mq = window.matchMedia(RM);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export default function LabClient() {
  const { resolvedTheme } = useTheme();
  const reducedMotion = useSyncExternalStore(
    subscribeRM,
    () => window.matchMedia(RM).matches,
    () => false,
  );
  // the theme is only known in the browser, so render the panel after mount
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const night = mounted && resolvedTheme === "night";

  return (
    <div className="fixed inset-0 z-10 bg-bg">
      <LabCanvas night={night} reducedMotion={reducedMotion} />
      {mounted && <LabPanel mode={night ? "night" : "day"} />}
    </div>
  );
}
