"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

/** First visit only: pick day/night from local time (night ≈ 7pm–6am). */
export default function ThemeInit() {
  const { setTheme } = useTheme();
  useEffect(() => {
    try {
      if (localStorage.getItem("theme")) return;
    } catch {
      /* storage blocked: still set from time */
    }
    const h = new Date().getHours();
    setTheme(h >= 19 || h < 6 ? "night" : "day");
  }, [setTheme]);
  return null;
}
