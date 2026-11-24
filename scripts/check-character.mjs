// Draws the 3D model's measurements (components/canvas/room/characterRig.ts) over each of
// Laavanya's drawings in the atlas, to check the fit. Writes rig-check-<view>.png into the folder
// given as the first argument (default: the system temp folder).
// Run: node scripts/check-character.mjs [outDir]
import sharp from "sharp";
import os from "node:os";
import { RIG, VIEW, toDrawing } from "../components/canvas/room/characterRig.ts";

const out = process.argv[2] ?? os.tmpdir();
const S = 2; // draw at 2× for legibility
const M = VIEW.mPerPx;
const mirror = (p) => [-p[0], p[1], p[2]];

for (const [tile, v] of VIEW.views.entries()) {
  const shapes = [];
  const at = (p) => toDrawing(v, p).map((n) => n * S);
  const circle = (p, r, col = "#00e5ff") => {
    const [x, y] = at(p);
    shapes.push(`<circle cx="${x}" cy="${y}" r="${(r / M) * S}" fill="none" stroke="${col}" stroke-width="2"/>`);
  };
  const line = (a, b, col = "#00e5ff") => {
    const [x1, y1] = at(a), [x2, y2] = at(b);
    shapes.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="2"/>`);
  };
  // head outline: the ellipsoid's silhouette seen from this angle
  const hc = RIG.head.c, hr = RIG.head.r;
  const across = Math.hypot(hr[0] * Math.cos(v.angle), hr[2] * Math.sin(v.angle));
  const [hx, hy] = at(hc);
  shapes.push(`<ellipse cx="${hx}" cy="${hy}" rx="${(across / M) * S}" ry="${(hr[1] / M) * S}" fill="none" stroke="#ff2d55" stroke-width="2"/>`);
  circle(RIG.nose, 0.01, "#ff2d55");
  line(RIG.neck.a, RIG.neck.b);
  for (const f of [(p) => p, mirror]) {
    circle(f(RIG.shoulder.c), RIG.shoulder.r);
    line(f(RIG.shoulder.c), f(RIG.elbow));
    line(f(RIG.elbow), f(RIG.wrist));
    circle(f(RIG.hand.c), 0.03, "#ffd60a");
    line(f(RIG.hip), f(RIG.knee), "#34c759");
    circle(f(RIG.knee), RIG.kneeR, "#34c759");
    line(f(RIG.knee), f(RIG.ankle), "#34c759");
    circle(f(RIG.foot.c), 0.03, "#ffd60a");
    circle(f(RIG.earring), 0.01, "#ffd60a");
    circle(f(RIG.chair.armPad.c), 0.02, "#bf5af2");
  }
  for (const [h, z] of RIG.chair.back) circle([0, h, z], 0.015, "#bf5af2");
  circle(RIG.chair.headrest.c, 0.03, "#bf5af2");
  circle(RIG.chair.seat.c, 0.03, "#bf5af2");
  // waist and seat lines
  for (const [h, r, d, z] of [
    [RIG.torso.top, RIG.torso.rTop, RIG.torso.depth, RIG.torso.z],
    [RIG.torso.bottom, RIG.torso.rBottom, RIG.torso.depth, RIG.torso.z],
    [RIG.hips.bottom, RIG.hips.rBottom, RIG.hips.depth, RIG.hips.z],
  ]) {
    // widest extent of the elliptical section in this view
    const ex = r * Math.cos(v.angle), ez = r * d * Math.sin(v.angle);
    const half = Math.hypot(ex, ez);
    const c = toDrawing(v, [0, h, z]);
    shapes.push(`<line x1="${(c[0] - half / M) * S}" y1="${c[1] * S}" x2="${(c[0] + half / M) * S}" y2="${c[1] * S}" stroke="#ff9f0a" stroke-width="2"/>`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${VIEW.w * S}" height="${VIEW.h * S}">${shapes.join("")}</svg>`;
  await sharp("public/character/atlas.webp")
    .extract({ left: tile * VIEW.w, top: 0, width: VIEW.w, height: VIEW.h })
    .resize({ width: VIEW.w * S, kernel: "nearest" })
    .composite([{ input: Buffer.from(svg) }])
    .png()
    .toFile(`${out}/rig-check-${v.name}.png`);
}
console.log(`wrote rig-check-*.png for ${VIEW.views.map((v) => v.name).join(", ")} into ${out}`);
