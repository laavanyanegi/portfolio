import { CHAIR, ENTRY_DOOR, W } from "./dims";

/**
 * Where Laavanya is and what she's doing, shared by everything that moves or draws her:
 * the entrance (Entrance.tsx), section walks (Walker.tsx), her standing sprite and her seated model.
 * Plain mutable values, read and written inside frame loops.
 */

export const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
export const smooth = (x: number, a: number, b: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Where she stands to greet: just inside the entry door, facing it. */
export const GREET_SPOT: [number, number] = [W - 1.05, (ENTRY_DOOR.z0 + ENTRY_DOOR.z1) / 2];

export const standing = {
  /** where she is on the floor, and which way she faces (0 = +z, π/2 = +x) */
  x: GREET_SPOT[0],
  z: GREET_SPOT[1],
  heading: Math.PI / 2,
  /** plays her walk frames */
  walking: false,
  /** 0 = on her feet … 1 = sitting in the chair. In between, her drawing lowers and fades as the seated model fades in. */
  seat: 0,
  /** while she sits down or gets up, the chair turns to face this way (null: the chair decides) */
  chairFace: null as number | null,
  /** the chair's current angle (kept up to date by the seated model) */
  chairAngle: 0,
};

/** How far in front of the seat she stands before sitting down. */
const REACH = 0.42;

/** The spot in front of the chair, for sitting down facing `face`. */
export function sitSpot(face: number): [number, number] {
  return [CHAIR[0] + REACH * Math.sin(face), CHAIR[2] + REACH * Math.cos(face)];
}

/**
 * The desk is south of the chair, so she only ever sits down or gets up on its north side:
 * a direction pointing south is mirrored to point north instead.
 */
export function awayFromDesk(face: number) {
  const f = Math.cos(face) > -0.25 ? Math.PI - face : face;
  return Math.cos(f) > -0.25 ? Math.PI : f;
}

/** Places her between the spot in front of the chair (seat 0) and the seat itself (seat 1). */
export function placeOnChair(face: number, seat: number) {
  const [sx, sz] = sitSpot(face);
  const k = 0.65 * seat;
  standing.x = lerp(sx, CHAIR[0], k);
  standing.z = lerp(sz, CHAIR[2], k);
  standing.heading = face;
  standing.seat = seat;
}
