/**
 * Laavanya's seated body, measured from her pixel-art sheets (front + side views).
 * Metres, in the chair's own space: origin = centre of the chair base on the floor, she faces +z,
 * her left hand is on +x. Shared by the 3D model (Character.tsx) and scripts/check-character.mjs,
 * which draws these points over the drawings to check the fit.
 */
export type P3 = [number, number, number];

/**
 * How the drawings map to metres: every view is 588 × 436 px, floor at the bottom edge.
 * `views` lists the atlas tiles in order (see scripts/character-atlas.mjs): the angle the drawing is
 * seen from (0 = in front of her, +90° = from her left) and the pixel column of the chair's axis.
 */
export const VIEW = {
  w: 588,
  h: 436,
  mPerPx: 1.364 / 436,
  views: [
    { name: "front", angle: 0, pivot: 292.1 },
    { name: "left", angle: Math.PI / 2, pivot: 430.0 },
    { name: "right", angle: -Math.PI / 2, pivot: 157.0 },
    { name: "front-left", angle: 0.44, pivot: 290.0 },
    { name: "front-right", angle: -0.44, pivot: 297.5 },
  ],
};

/** Where a point in her space lands in a drawing: [column, row] in pixels. */
export function toDrawing(view: (typeof VIEW.views)[number], p: P3): [number, number] {
  const across = p[0] * Math.cos(view.angle) - p[2] * Math.sin(view.angle);
  return [view.pivot + across / VIEW.mPerPx, VIEW.h - p[1] / VIEW.mPerPx];
}

export const RIG = {
  head: { c: [0, 1.157, -0.005] as P3, r: [0.093, 0.135, 0.11] as P3 },
  nose: [0, 1.122, 0.108] as P3,
  neck: { a: [0, 0.93, -0.02] as P3, b: [0, 1.05, -0.012] as P3, r: 0.043 },
  torso: { top: 0.958, bottom: 0.655, rTop: 0.168, rBottom: 0.15, depth: 0.7, z: -0.03 },
  hips: { top: 0.68, bottom: 0.47, rTop: 0.152, rBottom: 0.178, depth: 0.78, z: -0.035 },
  shoulder: { c: [0.193, 0.922, -0.075] as P3, r: 0.054 },
  elbow: [0.222, 0.69, -0.065] as P3,
  upperArmR: 0.04,
  wrist: [0.262, 0.64, 0.1] as P3,
  forearmR: 0.034,
  hand: { c: [0.274, 0.632, 0.158] as P3, s: [0.058, 0.042, 0.095] as P3 },
  hip: [0.085, 0.535, -0.04] as P3,
  knee: [0.08, 0.49, 0.355] as P3,
  thighR: 0.08,
  kneeR: 0.052,
  ankle: [0.074, 0.095, 0.345] as P3,
  shinR: [0.048, 0.032] as [number, number],
  foot: { c: [0.074, 0.03, 0.4] as P3, s: [0.075, 0.055, 0.22] as P3 },
  earring: [0.092, 1.078, 0.002] as P3,
  hairTop: 1.333,
  hairEnd: 0.7,
  chair: {
    seat: { c: [0, 0.425, -0.01] as P3, s: [0.5, 0.09, 0.48] as P3 },
    armPad: { c: [0.28, 0.575, 0.015] as P3, s: [0.075, 0.035, 0.3] as P3 },
    /** chair back centre line, bottom → top: [height, z] (the S-curve seen from the side) */
    back: [
      [0.5, -0.225],
      [0.65, -0.205],
      [0.85, -0.235],
      [1.08, -0.27],
    ] as [number, number][],
    backHalfW: [0.2, 0.215, 0.21, 0.185],
    headrest: { c: [0, 1.17, -0.29] as P3, s: [0.26, 0.11, 0.06] as P3 },
    baseR: 0.31,
  },
};
