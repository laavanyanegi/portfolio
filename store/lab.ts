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
  day: {
    pixelSize: 4,
    levels: 10,
    dither: 0.8,
    grain: 0.06,
    exposure: 1.1,
    contrast: 1.1,
    saturation: 1.05,
    warmth: 0.35,
    splitTone: 0.6,
    vignette: 0.35,
  },
  night: {
    pixelSize: 4,
    levels: 10,
    dither: 0.8,
    grain: 0.07,
    exposure: 1.3,
    contrast: 1.1,
    saturation: 1.1,
    warmth: 0.05,
    splitTone: 0.5,
    vignette: 0.45,
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
