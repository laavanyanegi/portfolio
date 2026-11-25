"use client";

import { useSyncExternalStore } from "react";

/**
 * Phones get the "sitting on the bed" room: screens narrower than a tablet, or a phone held sideways
 * (a touch screen under 500px tall). Tablets and laptops keep the dollhouse view.
 */
export const PHONE_QUERY = "(max-width: 767px), (max-height: 500px) and (pointer: coarse)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(PHONE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function isPhone() {
  return typeof window !== "undefined" && window.matchMedia(PHONE_QUERY).matches;
}

/** true on phones (follows rotation and window resizing). Always false on the server. */
export function usePhone() {
  return useSyncExternalStore(subscribe, isPhone, () => false);
}

/** A device with few CPU cores or little memory: it gets the lighter 3D scene too. */
export function isLowEnd() {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return (!!cores && cores <= 4) || (!!memory && memory <= 4);
}

/** One short vibration on key taps (knock, opening a section). Phones only; iOS Safari ignores it. */
export function buzz() {
  if (!isPhone() || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(15);
  } catch {
    // some browsers refuse vibration until the page has been tapped; that's fine
  }
}
