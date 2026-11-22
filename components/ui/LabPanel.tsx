"use client";

import { useState } from "react";
import Link from "next/link";
import { useLab, type LookSettings, type Mode } from "@/store/lab";
import ThemeToggle from "./ThemeToggle";

const SLIDERS: { key: keyof LookSettings; label: string; min: number; max: number; step: number }[] = [
  { key: "pixelSize", label: "Pixel size", min: 1, max: 10, step: 1 },
  { key: "levels", label: "Colour steps", min: 2, max: 32, step: 1 },
  { key: "dither", label: "Dither dots", min: 0, max: 1.5, step: 0.05 },
  { key: "grain", label: "Film grain", min: 0, max: 0.3, step: 0.01 },
  { key: "exposure", label: "Brightness", min: 0.3, max: 3, step: 0.05 },
  { key: "contrast", label: "Contrast", min: 0.6, max: 1.6, step: 0.05 },
  { key: "saturation", label: "Colour strength", min: 0, max: 2, step: 0.05 },
  { key: "warmth", label: "Warmth", min: -1, max: 1, step: 0.05 },
  { key: "splitTone", label: "Amber / blue tint", min: 0, max: 2, step: 0.05 },
  { key: "vignette", label: "Dark edges", min: 0, max: 1.5, step: 0.05 },
];

export default function LabPanel({ mode }: { mode: Mode }) {
  const settings = useLab((s) => s.settings);
  const setValue = useLab((s) => s.set);
  const reset = useLab((s) => s.reset);
  // open on desktop, collapsed on phones so the room is visible (panel only renders client-side)
  const [open, setOpen] = useState(() => window.matchMedia("(min-width: 640px)").matches);
  const [copied, setCopied] = useState(false);
  const current = settings[mode];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: values are still visible on screen */
    }
  };

  return (
    <aside
      aria-label="Look test controls"
      className="fixed bottom-3 right-3 left-3 z-20 max-h-[55vh] overflow-auto rounded-sm border-2 border-ink bg-panel text-ink shadow-lg sm:left-auto sm:w-80 sm:max-h-[85vh]"
    >
      <div className="flex items-center gap-2 border-b-2 border-ink px-3 py-2">
        <h1 className="font-display text-lg">Look test</h1>
        <span className="text-xs text-muted">({mode})</span>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="lab-sliders"
            className="h-10 rounded-sm border-2 border-current px-2 text-sm"
          >
            {open ? "Hide" : "Tune"}
          </button>
        </div>
      </div>
      {open && (
        <div id="lab-sliders" className="space-y-2 px-3 py-3">
          <p className="text-xs text-muted">
            Drag to look around. Sliders change the {mode} look only; flip the switch to tune the other mode.
          </p>
          {SLIDERS.map(({ key, label, min, max, step }) => (
            <label key={key} className="block text-sm">
              <span className="flex justify-between">
                <span>{label}</span>
                <span className="tabular-nums text-muted">{current[key]}</span>
              </span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={current[key]}
                onChange={(e) => setValue(mode, key, Number(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
            </label>
          ))}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={copy}
              className="flex-1 rounded-sm border-2 border-ink bg-brown px-2 py-1.5 text-sm text-on-brown"
            >
              {copied ? "Copied!" : "Copy settings"}
            </button>
            <button
              type="button"
              onClick={() => reset(mode)}
              className="rounded-sm border-2 border-ink px-2 py-1.5 text-sm"
            >
              Reset {mode}
            </button>
          </div>
          <Link href="/" className="block pt-1 text-xs text-muted underline">
            Back to the site
          </Link>
        </div>
      )}
    </aside>
  );
}
