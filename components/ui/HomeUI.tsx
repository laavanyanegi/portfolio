"use client";

import Link from "next/link";
import { sections } from "@/content/nav";
import { useUI } from "@/store/ui";
import HandleButton from "./HandleButton";
import ThemeToggle from "./ThemeToggle";

export default function HomeUI() {
  const wallView = useUI((s) => s.wallView);
  const flip = useUI((s) => s.flipWallView);

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

      <div className="absolute inset-x-0 top-1/3 px-6 text-center md:inset-x-auto md:left-6 md:top-24 md:px-0 md:text-left">
        <h1 className="font-pixel text-3xl text-ink md:text-4xl">Laavanya Negi</h1>
        <p className="text-ink">Product Manager · DEL/BLR</p>
      </div>

      <nav
        aria-label="Sections"
        className="pointer-events-auto absolute inset-x-4 bottom-6 grid grid-cols-2 gap-3 md:inset-x-auto md:bottom-auto md:right-6 md:top-1/2 md:w-52 md:-translate-y-1/2 md:grid-cols-1"
      >
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="font-pixel rounded-sm border-2 border-on-brown bg-brown/90 px-4 py-3 text-center text-sm uppercase tracking-wider text-on-brown hover:bg-accent hover:text-white md:py-4"
          >
            {s.label}
          </Link>
        ))}
      </nav>

      <div className="pointer-events-auto absolute bottom-6 right-6 hidden items-center gap-2 md:flex">
        <span className="sr-only-text" aria-live="polite">
          View {wallView}
        </span>
        <button
          type="button"
          onClick={flip}
          aria-label="Previous room view"
          className="font-pixel h-10 w-10 rounded-sm border-2 border-on-brown bg-brown/90 text-on-brown"
        >
          ◀
        </button>
        <button
          type="button"
          onClick={flip}
          aria-label="Next room view"
          className="font-pixel h-10 w-10 rounded-sm border-2 border-on-brown bg-brown/90 text-on-brown"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
