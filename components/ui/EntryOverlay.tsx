"use client";

import { useEffect, useRef, useState } from "react";
import { useIntro } from "@/store/intro";
import { buzz } from "@/lib/device";
import { intro } from "@/content/intro";

/** A small pixel fist seen from the side, knuckles to the left (13 × 10 grid). */
function KnockHand() {
  const rows = [
    ".....XXXXX...",
    "...XXoooooX..",
    "..XoooooooX..",
    ".XXXXXXoooX..",
    "XooooXoooooX.",
    "XXXXXXoooooX.",
    "XooooXoooooX.",
    "XXXXXXooooX..",
    ".XoooXooooX..",
    "..XXXXXXXX...",
  ];
  return (
    <svg viewBox="0 0 13 10" width="65" height="50" className="knock-hand" shapeRendering="crispEdges" aria-hidden="true">
      {rows.flatMap((r, y) =>
        [...r].map((ch, x) =>
          ch === "." ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={ch === "X" ? "var(--brown)" : "var(--on-brown)"} />
          ),
        ),
      )}
    </svg>
  );
}

/**
 * The entrance's 2D layer: "knock knock" over the door (and over the page while the room loads),
 * then (while she says hello) a full-screen button that skips straight to her leading the way in.
 * If the room hasn't loaded after 10 seconds, a link lets the visitor come straight in.
 */
const SLOW_MS = 10000;

export default function EntryOverlay() {
  const stage = useIntro((s) => s.stage);
  const ready = useIntro((s) => s.ready);
  const knock = useIntro((s) => s.knock);
  const walk = useIntro((s) => s.walk);
  const finish = useIntro((s) => s.finish);
  const btn = useRef<HTMLButtonElement>(null);
  const [slow, setSlow] = useState(false);
  const loadingNow = stage === "knock" && !ready;

  // never leave anyone stuck at the door: after a while, offer the way straight in
  useEffect(() => {
    if (!loadingNow) return;
    const t = window.setTimeout(() => setSlow(true), SLOW_MS);
    return () => window.clearTimeout(t);
  }, [loadingNow]);

  useEffect(() => {
    if (stage === "knock" || stage === "greeting") btn.current?.focus();
  }, [stage, ready]);

  if (stage !== "knock" && stage !== "opening" && stage !== "greeting" && stage !== "walking") return null;
  const loading = stage === "knock" && !ready;

  return (
    <div className={`fixed inset-0 z-40 ${stage === "walking" ? "pointer-events-none" : ""}`}>
      {/* while the room loads, cover the page; afterwards the 3D door shows through */}
      <div
        className="absolute inset-0 bg-bg transition-opacity duration-500"
        style={{ opacity: loading ? 1 : 0 }}
        aria-hidden="true"
      />
      <p className="sr-only-text" aria-live="polite">
        {stage === "greeting" ? `Laavanya says: ${intro.greeting}` : ""}
      </p>

      {/* positioned above her head every frame by SpeechBubbleTracker in the room */}
      <div id="speech-bubble" className="pointer-events-none absolute left-0 top-0" aria-hidden="true">
        {stage !== "knock" && (
          <div className="speech-bubble font-pixel mb-3" data-show={stage === "greeting" ? "true" : "false"}>
            {intro.greeting}
          </div>
        )}
      </div>

      {stage === "knock" && (
        <button
          ref={btn}
          type="button"
          onClick={() => {
            buzz();
            knock();
          }}
          disabled={loading}
          aria-label={loading ? "The room is loading" : "Knock on the door to come in"}
          className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-4 focus:outline-none disabled:cursor-wait"
        >
          <span className="knock-cue flex flex-col items-center gap-3" data-ready={ready ? "true" : "false"}>
            {ready && <KnockHand />}
            <span className="font-pixel rounded-sm border-2 border-on-brown bg-brown/90 px-4 py-2 text-lg tracking-wider text-on-brown">
              {intro.knock}
            </span>
          </span>
        </button>
      )}

      {loading && slow && (
        <button
          type="button"
          onClick={finish}
          className="font-pixel absolute inset-x-0 bottom-12 mx-auto w-fit rounded-sm border-2 border-on-brown bg-brown px-4 py-2 text-sm text-on-brown"
        >
          {intro.slow}
        </button>
      )}

      {stage === "greeting" && (
        <button
          ref={btn}
          type="button"
          onClick={walk}
          aria-label="Follow Laavanya into the room"
          className="absolute inset-0 cursor-pointer focus:outline-none"
        />
      )}
    </div>
  );
}
