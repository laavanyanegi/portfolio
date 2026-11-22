"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useUI } from "@/store/ui";
import { idCard } from "@/content/idcard";

const FOCUSABLE = "a[href], button:not([disabled])";

export default function IdCardOverlay() {
  const open = useUI((s) => s.idCardOpen);
  const close = useUI((s) => s.closeIdCard);
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab" || !dialogRef.current) return;
      const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-center overflow-hidden bg-black/60 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="ID card"
            className="flex h-fit items-start gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={reduce ? { opacity: 0 } : { y: "-110%" }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: "-110%" }}
              transition={{ type: "spring", damping: 16, stiffness: 120 }}
              className="flex flex-col items-center"
            >
              {/* lanyard */}
              <svg width="56" height="90" viewBox="0 0 14 22" shapeRendering="crispEdges" aria-hidden="true">
                <rect x="4" y="0" width="6" height="14" fill="#6d55b5" />
                <rect x="5" y="14" width="4" height="3" fill="#9a8f84" />
                <rect x="4" y="17" width="6" height="5" fill="none" stroke="#9a8f84" strokeWidth="1" />
              </svg>
              <div className="-mt-3 grid w-[min(80vw,26rem)] grid-cols-[6rem_1fr] gap-4 rounded-md border-4 border-brown bg-panel p-4 text-ink shadow-xl sm:grid-cols-[9rem_1fr]">
                <div
                  className="font-pixel grid aspect-[3/4] place-items-center rounded-sm bg-accent-soft text-3xl text-ink"
                  role="img"
                  aria-label="Headshot placeholder"
                >
                  LN
                </div>
                <div className="min-w-0">
                  <h2 className="font-pixel text-lg leading-tight">{idCard.name}</h2>
                  <p className="font-semibold">{idCard.title}</p>
                  <p className="text-muted">{idCard.location}</p>
                  <p className="mt-3 text-sm">
                    <span className="font-semibold">Languages:</span> {idCard.languages.join(", ")}
                  </p>
                  <p className="mt-3 text-sm">
                    {idCard.connectUrl ? (
                      <a
                        className="font-semibold text-accent underline"
                        href={idCard.connectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Connect →
                      </a>
                    ) : (
                      <span className="text-muted">Connect link coming soon</span>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="mt-24 flex flex-col gap-2">
              <button
                type="button"
                onClick={close}
                aria-label="Close ID card"
                className="grid h-10 w-10 place-items-center rounded-sm bg-neutral-600 text-lg font-bold text-white"
              >
                ✕
              </button>
              <a
                href={idCard.pdf}
                download="laavanya-negi-id-card.pdf"
                aria-label="Download ID card as PDF"
                className="grid h-10 w-10 place-items-center rounded-sm bg-brown text-on-brown"
              >
                <svg viewBox="0 0 12 12" width="20" height="20" shapeRendering="crispEdges" aria-hidden="true">
                  <path d="M5 1h2v5h2L6 9 3 6h2z M2 10h8v1H2z" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
