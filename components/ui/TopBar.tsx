"use client";

import Link from "next/link";
import { buzz } from "@/lib/device";
import { useRouter } from "next/navigation";
import { useUI } from "@/store/ui";
import { sections } from "@/content/nav";
import HandleButton from "./HandleButton";
import ThemeToggle from "./ThemeToggle";

/** How long the section panel takes to fade out before the room takes over (matches SectionPanel). */
const LEAVE_MS = 300;

export default function TopBar({ pathname }: { pathname: string }) {
  const router = useRouter();
  const leaving = useUI((s) => s.leaving);

  // back to the room: fade the page out first, then let the camera pull back
  const goHome = (e: React.MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // new tab etc.
    e.preventDefault();
    if (useUI.getState().leaving) return;
    useUI.setState({ leaving: true });
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => router.push("/"), still ? 0 : LEAVE_MS);
    // if the page change never happens (an error), bring the page back rather than leave it faded out
    window.setTimeout(() => {
      if (window.location.pathname !== "/") useUI.setState({ leaving: false });
    }, 2000);
  };

  return (
    <header
      style={{ opacity: leaving ? 0 : 1, transition: "opacity 0.3s ease" }}
      className="fixed inset-x-0 top-0 z-20 flex flex-wrap items-end gap-x-3 gap-y-1 px-2 pt-2 md:flex-nowrap md:px-4 md:pt-3">
      <Link
        href="/"
        onClick={goHome}
        aria-label="Back to the room (home)"
        className="mb-1 grid h-10 w-10 shrink-0 place-items-center rounded-sm border-2 border-on-brown bg-brown text-on-brown"
      >
        <svg viewBox="0 0 12 12" width="22" height="22" shapeRendering="crispEdges" aria-hidden="true">
          <path d="M6 1 L1 6 H2 V11 H5 V8 H7 V11 H10 V6 H11 Z" fill="currentColor" />
        </svg>
      </Link>

      <div className="mb-1 ml-auto flex shrink-0 items-center gap-2 md:order-3">
        <ThemeToggle />
        <HandleButton />
      </div>

      <nav aria-label="Sections" className="flex w-full items-end gap-1 md:order-2 md:w-auto md:gap-2">
        {sections.map((s) => {
          const active = pathname === s.href || pathname.startsWith(s.href + "/");
          return (
            <Link
              key={s.href}
              href={s.href}
              aria-current={active ? "page" : undefined}
              onClick={active ? undefined : buzz}
              className={
                active
                  ? "font-pixel relative rounded-t-md border-2 border-b-0 border-line bg-panel px-3 py-2 text-xs uppercase text-ink md:px-5 md:text-sm"
                  : "font-pixel px-2 py-2 text-xs lowercase text-ink opacity-30 hover:opacity-100 md:px-3 md:text-sm"
              }
            >
              {active ? s.label.toUpperCase() : s.label}
              {active && (
                <svg
                  className="absolute inset-x-2 -bottom-1 h-2 w-[calc(100%-1rem)] text-accent"
                  viewBox="0 0 40 4"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M0 2 Q5 0 10 2 T20 2 T30 2 T40 2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
