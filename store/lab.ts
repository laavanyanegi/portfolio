import { create } from "zustand";

/** Look-test (/lab) post-processing settings. One set per mode. */
export type LookSettings = {
  pixelSize: number; // screen px per room pixel
  levels: number; // colour steps per channel
  dither: number; // 0 = plain posterize, 1 = full ordered dither
  grain: number;
  exposure: number;
  contrast: number;
  saturation: number;
  warmth: number; // -1 cool … 1 warm
  splitTone: number; // amber highlights / dusty-blue shadows
  vignette: number;
};

export type Mode = "day" | "night";

export const LOOK_DEFAULTS: Record<Mode, LookSettings> = {
  // approved by Laavanya, 2026-11-23
  day: {
    pixelSize: 1,
    levels: 32,
    dither: 1.15,
    grain: 0.01,
    exposure: 1.8,
    contrast: 1.2,
    saturation: 1,
    warmth: 1,
    splitTone: 1.5,
    vignette: 0.6,
  },
  night: {
    pixelSize: 1,
    levels: 32,
    dither: 1,
    grain: 0.05,
    exposure: 2,
    contrast: 1.05,
    saturation: 2,
    warmth: 0.5,
    splitTone: 1.2,
    vignette: 0.5,
  },
};

type LabState = {
  settings: Record<Mode, LookSettings>;
  set: (mode: Mode, key: keyof LookSettings, value: number) => void;
  reset: (mode: Mode) => void;
};

export const useLab = create<LabState>((set) => ({
  settings: LOOK_DEFAULTS,
  set: (mode, key, value) =>
    set((s) => ({ settings: { ...s.settings, [mode]: { ...s.settings[mode], [key]: value } } })),
  reset: (mode) => set((s) => ({ settings: { ...s.settings, [mode]: LOOK_DEFAULTS[mode] } })),
}));
