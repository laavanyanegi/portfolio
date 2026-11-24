import { create } from "zustand";

export type Spot = "work" | "creatives" | "about" | "contact";
export type Wall = "south" | "west" | "north" | "east";

/**
 * The four room views, one per quarter-turn: each shows two walls meeting in a corner.
 * 0 = study + balcony, 1 = study + closet, 2 = bed + closet, 3 = bed + balcony.
 */
export const VIEW_WALLS: [Wall, Wall][] = [
  ["south", "west"],
  ["south", "east"],
  ["north", "east"],
  ["north", "west"],
];
export const VIEW_NAMES = [
  "the study and balcony walls",
  "the study and closet walls",
  "the bed and closet walls",
  "the bed and balcony walls",
];

type UIState = {
  /** the page shown before the current one finished rendering (null on first load) */
  lastPath: string | null;
  /** the section panel is fading out on its way back to the room */
  leaving: boolean;
  idCardOpen: boolean;
  openIdCard: () => void;
  closeIdCard: () => void;
  /** Which of the four views is shown (index into VIEW_WALLS). */
  view: number;
  /** Quarter-turns the camera has made (keeps the rotation direction continuous). */
  turns: number;
  rotateView: (dir: 1 | -1) => void;
  /** Room spot highlighted by hovering a label or nav button. */
  hoverSpot: Spot | null;
  setHoverSpot: (s: Spot | null) => void;
};

export const useUI = create<UIState>((set) => ({
  lastPath: null,
  leaving: false,
  idCardOpen: false,
  openIdCard: () => set({ idCardOpen: true }),
  closeIdCard: () => set({ idCardOpen: false }),
  view: 0,
  turns: 0,
  rotateView: (dir) =>
    set((s) => {
      const turns = s.turns + dir;
      return { turns, view: ((turns % 4) + 4) % 4 };
    }),
  hoverSpot: null,
  setHoverSpot: (hoverSpot) => set({ hoverSpot }),
}));
