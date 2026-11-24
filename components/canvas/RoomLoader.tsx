"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { useUI } from "@/store/ui";

// three.js only loads in the browser, after the page itself is readable
const RoomCanvas = dynamic(() => import("./RoomCanvas"), { ssr: false, loading: () => null });

const RM = "(prefers-reduced-motion: reduce)";
function subscribeRM(cb: () => void) {
  const mq = window.matchMedia(RM);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** The one persistent 3D room, behind every page. The CSS room in RoomSlot shows until it loads. */
export default function RoomLoader() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const idCardOpen = useUI((s) => s.idCardOpen);
  const reducedMotion = useSyncExternalStore(
    subscribeRM,
    () => window.matchMedia(RM).matches,
    () => false,
  );
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  if (!mounted || pathname.startsWith("/lab")) return null; // /lab has its own canvas

  return (
    <div aria-hidden={pathname !== "/"} className="fixed inset-0 z-0">
      <RoomCanvas
        night={resolvedTheme === "night"}
        reducedMotion={reducedMotion}
        home={pathname === "/" && !idCardOpen}
        navigate={(href) => router.push(href)}
        onToggleNight={() => setTheme(resolvedTheme === "night" ? "day" : "night")}
      />
    </div>
  );
}
