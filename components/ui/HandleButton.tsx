"use client";

import { useUI } from "@/store/ui";
import { idCard } from "@/content/idcard";
import { usePhone } from "@/lib/device";

/** Opens the ID card. Text handle on desktop, pixel ID icon on mobile. */
export default function HandleButton({ className = "" }: { className?: string }) {
  const open = useUI((s) => s.openIdCard);
  // phones (incl. held sideways) show the ID icon; narrow screens show it even before scripts run
  const phone = usePhone();
  return (
    <button
      type="button"
      onClick={open}
      aria-haspopup="dialog"
      aria-label={`Open ID card, ${idCard.handle}`}
      className={`inline-flex h-10 items-center gap-2 rounded-sm border-2 border-current bg-panel px-3 text-ink ${className}`}
    >
      <svg viewBox="0 0 12 12" width="20" height="20" shapeRendering="crispEdges" className={phone ? "" : "md:hidden"} aria-hidden="true">
        <rect x="1" y="2" width="10" height="8" fill="none" stroke="currentColor" />
        <rect x="2" y="4" width="3" height="3" fill="currentColor" />
        <rect x="6" y="4" width="4" height="1" fill="currentColor" />
        <rect x="6" y="6" width="3" height="1" fill="currentColor" />
      </svg>
      <span className={`font-pixel hidden text-sm ${phone ? "" : "md:inline"}`}>{idCard.handle}</span>
    </button>
  );
}
