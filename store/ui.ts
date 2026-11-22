import { create } from "zustand";

type UIState = {
  idCardOpen: boolean;
  openIdCard: () => void;
  closeIdCard: () => void;
  /** Which pair of room walls is shown. Used by the room in Phase 4. */
  wallView: "A" | "B";
  flipWallView: () => void;
};

export const useUI = create<UIState>((set) => ({
  idCardOpen: false,
  openIdCard: () => set({ idCardOpen: true }),
  closeIdCard: () => set({ idCardOpen: false }),
  wallView: "A",
  flipWallView: () => set((s) => ({ wallView: s.wallView === "A" ? "B" : "A" })),
}));
