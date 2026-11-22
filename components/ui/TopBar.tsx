"use client";

import Link from "next/link";
import { sections } from "@/content/nav";
import HandleButton from "./HandleButton";
import ThemeToggle from "./ThemeToggle";

export default function TopBar({ pathname }: { pathname: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-20 flex flex-wrap items-end gap-x-3 gap-y-1 px-2 pt-2 md:flex-nowrap md:px-4 md:pt-3">
      <Link
        href="/"
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
