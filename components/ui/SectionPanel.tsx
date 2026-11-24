"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useUI } from "@/store/ui";

/**
 * The ~90% panel a section's page sits on. Opened from the room (coming from home), it fades in
 * after the camera has closed in on the spot; on a direct visit it is there from the first paint.
 * Moving between sections keeps it in place (the layout stays mounted). Going home from the top bar's
 * room icon, it fades out first (see TopBar); with the browser's Back button a snapshot of it fades out.
 *
 * Next keeps a left page alive in the background and shows it again on return, so the fade-in is
 * restarted every time the panel is shown, not only when it is first built.
 */
export default function SectionPanel({ children }: { children: React.ReactNode }) {
  const leaving = useUI((s) => s.leaving);
  const el = useRef<HTMLDivElement>(null);

  // runs each time the panel is shown, before it is painted
  useLayoutEffect(() => {
    const d = el.current;
    if (!d || useUI.getState().lastPath !== "/") return;
    d.classList.remove("panel-arrive");
    void d.offsetWidth; // restart the animation
    d.classList.add("panel-arrive");
  }, []);

  // browser Back/Forward to the room swaps the page at once: fade out a snapshot of it and the top bar
  useEffect(() => {
    let done = false;
    const fadeSnapshot = (to: string) => {
      const d = el.current;
      if (done || !d || to !== "/" || useUI.getState().leaving) return;
      done = true;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      for (const node of [d, document.querySelector("header")]) {
        if (!node) continue;
        const r = node.getBoundingClientRect();
        const ghost = node.cloneNode(true) as HTMLElement;
        ghost.setAttribute("aria-hidden", "true");
        ghost.setAttribute("inert", "");
        ghost.classList.remove("panel-arrive");
        Object.assign(ghost.style, {
          position: "fixed",
          left: `${r.left}px`,
          top: `${r.top}px`,
          width: `${r.width}px`,
          height: `${r.height}px`,
          right: "auto",
          bottom: "auto",
          margin: "0",
          zIndex: "25",
          pointerEvents: "none",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        });
        document.body.appendChild(ghost);
        ghost.scrollTop = node.scrollTop;
        requestAnimationFrame(() => {
          ghost.style.opacity = "0";
          if (node === d) ghost.style.transform = "translateY(0.75rem)";
        });
        window.setTimeout(() => ghost.remove(), 400);
      }
    };
    // The browser's navigation event fires as Back starts, before the router swaps the page away;
    // popstate is the fallback for browsers without it (it can arrive after the swap, then nothing fades).
    type NavEvent = Event & { navigationType?: string; destination?: { url: string } };
    const nav = (window as unknown as { navigation?: EventTarget }).navigation;
    const onNavigate = (e: Event) => {
      const n = e as NavEvent;
      if (n.navigationType === "traverse" && n.destination) fadeSnapshot(new URL(n.destination.url).pathname);
    };
    const onPop = () => fadeSnapshot(window.location.pathname);
    nav?.addEventListener("navigate", onNavigate);
    window.addEventListener("popstate", onPop, true);
    return () => {
      nav?.removeEventListener("navigate", onNavigate);
      window.removeEventListener("popstate", onPop, true);
    };
  }, []);

  return (
    <div
      ref={el}
      className="fixed inset-x-2 bottom-2 top-[6.25rem] overflow-y-auto rounded-md border-2 border-line text-ink md:inset-x-4 md:bottom-4 md:top-16"
      style={{
        background: "color-mix(in srgb, var(--panel) 90%, transparent)",
        opacity: leaving ? 0 : undefined,
        transform: leaving ? "translateY(0.75rem)" : undefined,
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}
    >
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-10 md:py-12">{children}</div>
    </div>
  );
}
