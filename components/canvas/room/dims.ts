import type { Spot, Wall } from "@/store/ui";

/**
 * Room measurements in metres. x runs west → east, z north → south, y up.
 * West = balcony wall (x = 0), south = study wall (z = D), north = bed wall (z = 0), east = closet wall (x = W).
 */
export const W = 6.2;
export const D = 5.0;
export const H = 2.8;
export const T = 0.12; // wall thickness
/** What the camera looks at: set a little above mid-height so the signs over the far corner stay on screen. */
export const CENTER: [number, number, number] = [W / 2, 1.3, D / 2];

/** Openings in the west wall, measured along z. */
export const WINDOW = { z0: 2.3, z1: 3.2, y0: 0.95, y1: 2.15 };
export const BALCONY_DOOR = { z0: 3.45, z1: 4.35, y0: 0, y1: 2.3 };

/** Where the desk chair (and Laavanya) sits. */
export const CHAIR: [number, number, number] = [3.1, 0, D - 1.0];

/** Phones: the visitor's eyes, sitting on the foot end of the bed (north-west corner). */
export const BED_EYE: [number, number, number] = [1.9, 1.18, 0.72];

/** Amber lamp on the bedside table (between the bed and the bookshelf). */
export const BEDSIDE_LAMP: [number, number, number] = [0.22, 0.78, 1.28];

/* View B (from the bed-wall and closet-wall references) */
/** Floor lamp beside the foot of the bed (centre on the floor, and where its bulb sits). */
export const FLOOR_LAMP = { x: 2.62, z: 0.3, bulbY: 1.5 };
/** Full-length mirror leaning on the bed wall. */
export const MIRROR = { x: 3.55, w: 0.56, h: 1.66 };
/** Entry door at the south end of the closet wall, measured along z; light switch beside it. */
export const ENTRY_DOOR = { z0: 3.8, z1: 4.7, h: 2.1 };
export const LIGHT_SWITCH = { z: 3.6, y: 1.22 };

export type V3 = [number, number, number];

/** Floating label anchor for each section, and the wall it is on (its sign shows whenever that wall does). */
export const SPOTS: Record<Spot, { pos: V3; wall: Wall }> = {
  work: { pos: [3.1, 1.75, D - 0.35], wall: "south" },
  about: { pos: [0.3, 1.86, 2.0], wall: "west" },
  creatives: { pos: [0.05, 2.5, 0.55], wall: "west" },
  contact: { pos: [W - 0.05, 2.26, 4.25], wall: "east" },
};
