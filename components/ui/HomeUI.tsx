"use client";

import { useEffect } from "react";
import Link from "next/link";
import { sections } from "@/content/nav";
import { useUI, VIEW_NAMES, type Spot } from "@/store/ui";
import HandleButton from "./HandleButton";
import ThemeToggle from "./ThemeToggle";

export default function HomeUI() {
  const view = useUI((s) => s.view);
  const rotate = useUI((s) => s.rotateView);
  const setHover = useUI((s) => s.setHoverSpot);

  // left/right arrow keys turn the room too
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (useUI.getState().idCardOpen || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.target instanceof Element && e.target.closest("input, textarea, select")) return;
      if (e.key === "ArrowLeft") rotate(-1);
      if (e.key === "ArrowRight") rotate(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rotate]);

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      {/* bottom brown gradient so the nav stands out without hiding the room */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/5"
        style={{ background: "linear-gradient(to top, var(--brown), transparent)", opacity: 0.85 }}
      />

      <div className="pointer-events-auto absolute left-4 top-4">
        <HandleButton />
      </div>
      <div className="pointer-events-auto absolute right-4 top-4">
        <ThemeToggle />
      </div>

      {/* name stays for screen readers and search; visitors see the handle + ID card instead */}
      <h1 className="sr-only-text">Laavanya Negi, Product Manager</h1>

      <nav
        aria-label="Sections"
        className="pointer-events-auto absolute inset-x-4 bottom-6 grid grid-cols-2 gap-3 md:inset-x-auto md:bottom-auto md:right-6 md:top-1/2 md:w-52 md:-translate-y-1/2 md:grid-cols-1"
      >
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            onPointerEnter={() => setHover(s.label as Spot)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(s.label as Spot)}
            onBlur={() => setHover(null)}
            className="font-pixel rounded-sm border-2 border-on-brown bg-brown/90 px-4 py-3 text-center text-sm uppercase tracking-wider text-on-brown transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--brown)_55%,var(--accent))] md:py-4"
          >
            {s.label}
          </Link>
        ))}
      </nav>

      <div className="pointer-events-auto absolute bottom-6 right-6 hidden items-center gap-2 md:flex">
        <span className="sr-only-text" aria-live="polite">
          {`Showing ${VIEW_NAMES[view]}`}
        </span>
        <button
          type="button"
          onClick={() => rotate(-1)}
          aria-label="Turn the room left"
          className="font-pixel h-10 w-10 rounded-sm border-2 border-on-brown bg-brown/90 text-on-brown"
        >
          ◀
        </button>
        <button
          type="button"
          onClick={() => rotate(1)}
          aria-label="Turn the room right"
          className="font-pixel h-10 w-10 rounded-sm border-2 border-on-brown bg-brown/90 text-on-brown"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
