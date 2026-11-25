import { create } from "zustand";

/**
 * Phones: where the visitor, sitting on the bed, is looking. Both are offsets (radians) from
 * facing Laavanya in her chair. yaw turns all the way round; pitch looks a little up or down.
 * Changed by dragging the 360° orb or the room; the bed camera follows it.
 */
const PITCH_UP = 0.5;
const PITCH_DOWN = -0.55;

type LookState = {
  yaw: number;
  pitch: number;
  lookBy: (dYaw: number, dPitch: number) => void;
  /** face Laavanya again */
  recentre: () => void;
};

export const useLook = create<LookState>((set) => ({
  yaw: 0,
  pitch: 0,
  lookBy: (dYaw, dPitch) =>
    set((s) => ({
      yaw: s.yaw + dYaw,
      pitch: Math.max(PITCH_DOWN, Math.min(PITCH_UP, s.pitch + dPitch)),
    })),
  recentre: () => set({ yaw: 0, pitch: 0 }),
}));

/** Drag sensitivity (radians per pixel): a swipe across a phone screen turns about half way round. */
export const LOOK_PER_PX = { yaw: 0.008, pitch: 0.005 };
