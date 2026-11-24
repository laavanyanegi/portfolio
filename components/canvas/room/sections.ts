import type { Spot, Wall } from "@/store/ui";
import { CHAIR, type V3 } from "./dims";

/**
 * Opening a section: where the camera closes in, how far it zooms (times the home zoom), and which
 * wall must be in view. Work stays at the desk (she swivels to the laptop); for the others she gets
 * up and walks to a standing spot beside the place, along a route through the open middle of the room.
 */
export const SECTION_SHOTS: Record<Spot, { focus: V3; zoom: number; wall: Wall }> = {
  work: { focus: [3.1, 0.95, 4.5], zoom: 3.2, wall: "south" },
  about: { focus: [0.45, 1.0, 1.8], zoom: 2.6, wall: "west" },
  creatives: { focus: [0.5, 1.6, 0.95], zoom: 2.4, wall: "west" },
  contact: { focus: [5.75, 1.05, 4.2], zoom: 2.6, wall: "east" },
};

export type P2 = [number, number]; // x, z on the floor

export const CHAIR_XZ: P2 = [CHAIR[0], CHAIR[2]];
/** Just in front of the chair: every route starts and ends through here. */
export const JUNCTION: P2 = [3.1, 3.3];

/** Route from the junction to where she stands for each section (last point = her standing spot). */
export const ROUTES: Record<Exclude<Spot, "work">, P2[]> = {
  about: [[1.9, 2.4], [0.95, 1.8]], // beside the bookshelf
  creatives: [[1.9, 2.0], [1.25, 1.45]], // by the bed, under the gallery
  contact: [[4.6, 3.75], [5.3, 4.2]], // just inside the entry door
};
