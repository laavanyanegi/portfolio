// Builds public/character/atlas.webp: Laavanya's seated drawings from five angles (front, both
// front three-quarters, both sides), from docs/reference/character/ (local-only), cut out of their
// grid background, padded, and laid side by side. The 3D model in components/canvas/room/Character.tsx
// is painted from it. Also prints where the chair's gas lift sits in each drawing (its pivot column).
// Run: node scripts/character-atlas.mjs   (uses sharp, which ships with Next.js)
import sharp from "sharp";

const SHEETS = {
  main: "docs/reference/character/character-sitting-on-chair.webp",
  angles: "docs/reference/character/character-sitting-on-chair-other-4-angles.webp",
};
const QW = 600, QH = 448, INSET = 6;
const W = QW - 2 * INSET, H = QH - 2 * INSET; // 588 × 436 per view
// [name, sheet, quadrant x, quadrant y]. "left" = seen from her left side (she faces screen-left).
// Order matters: Character.tsx reads the tiles in this order.
const VIEWS = [
  ["front", "main", 0, 0],
  ["left", "main", 1, 1],
  ["right", "main", 0, 1],
  ["front-left", "angles", 1, 0],
  ["front-right", "angles", 0, 0],
];

const sheets = {};
for (const [k, file] of Object.entries(SHEETS)) sheets[k] = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });

function cutout(sheet, qx, qy) {
  const { data, info } = sheets[sheet];
  const ox = qx * QW + INSET, oy = qy * QH + INSET;
  const rgba = Buffer.alloc(W * H * 4), bgish = new Uint8Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = ((oy + y) * info.width + ox + x) * 3, o = (y * W + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      rgba[o] = r; rgba[o + 1] = g; rgba[o + 2] = b; rgba[o + 3] = 255;
      const sat = Math.max(r, g, b) - Math.min(r, g, b);
      bgish[y * W + x] = sat < 26 && (r + g + b) / 3 > 150 ? 1 : 0;
    }
  // flood-fill the page background from the edges
  const seen = new Uint8Array(W * H), st = [];
  for (let x = 0; x < W; x++) st.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) st.push(y * W, y * W + W - 1);
  while (st.length) {
    const p = st.pop();
    if (seen[p] || !bgish[p]) continue;
    seen[p] = 1;
    const x = p % W, y = (p / W) | 0;
    if (x > 0) st.push(p - 1);
    if (x < W - 1) st.push(p + 1);
    if (y > 0) st.push(p - W);
    if (y < H - 1) st.push(p + W);
  }
  for (let p = 0; p < W * H; p++) {
    const o = p * 4, r = rgba[o], g = rgba[o + 1], b = rgba[o + 2];
    const pure = Math.max(r, g, b) - Math.min(r, g, b) < 20 && (r + g + b) / 3 > 165;
    if (seen[p] || pure) rgba[o + 3] = 0;
  }
  // paint over the faint watermark sparkle near the chair (bottom-right quadrant)
  if (sheet === "main" && qx === 1 && qy === 1)
    for (let y = 276; y < 344; y++)
      for (let x = 430; x < 510; x++) {
        const o = (y * W + x) * 4, r = rgba[o], g = rgba[o + 1], b = rgba[o + 2];
        if (rgba[o + 3] && Math.max(r, g, b) - Math.min(r, g, b) < 30 && (r + g + b) / 3 > 62) {
          rgba[o] = 42; rgba[o + 1] = 36; rgba[o + 2] = 34;
        }
      }
  return rgba;
}

/** Spread edge colours into the transparent background, so a slightly-off model never samples a hole. */
function pad(rgba) {
  for (let left = true; left; ) {
    left = false;
    const next = Buffer.from(rgba);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const o = (y * W + x) * 4;
        if (rgba[o + 3]) continue;
        left = true;
        let r = 0, g = 0, b = 0, c = 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
          const q = (yy * W + xx) * 4;
          if (rgba[q + 3]) { r += rgba[q]; g += rgba[q + 1]; b += rgba[q + 2]; c++; }
        }
        if (c) { next[o] = r / c; next[o + 1] = g / c; next[o + 2] = b / c; next[o + 3] = 255; }
      }
    rgba = next;
  }
  return rgba;
}

/** Column of the chair's gas lift: the narrow dark upright between the seat and the base. */
function gasLift(rgba) {
  const counts = new Array(W).fill(0);
  for (let y = 335; y < 375; y++)
    for (let x = 0; x < W; x++) {
      const o = (y * W + x) * 4, r = rgba[o], g = rgba[o + 1], b = rgba[o + 2];
      if (rgba[o + 3] && (r + g + b) / 3 < 95 && Math.max(r, g, b) - Math.min(r, g, b) < 30) counts[x]++;
    }
  // longest run of columns that are dark in most rows, nearest the middle
  let best = null;
  for (let x = 0; x < W; ) {
    if (counts[x] < 32) { x++; continue; }
    let e = x;
    while (e < W && counts[e] >= 32) e++;
    const c = (x + e - 1) / 2, w = e - x;
    if (w >= 4 && w <= 40 && (!best || Math.abs(c - W / 2) < Math.abs(best.c - W / 2))) best = { c, w };
    x = e;
  }
  return best;
}

const cut = VIEWS.map(([, sheet, qx, qy]) => cutout(sheet, qx, qy));
VIEWS.forEach(([name], i) => console.log(name.padEnd(12), "gas lift", JSON.stringify(gasLift(cut[i]))));
if (process.env.CUTOUT_DIR)
  for (const [i, [name]] of VIEWS.entries())
    await sharp(cut[i], { raw: { width: W, height: H, channels: 4 } }).png().toFile(`${process.env.CUTOUT_DIR}/cut-${name}.png`);
const tiles = cut.map((c) => ({
  input: pad(c),
  raw: { width: W, height: H, channels: 4 },
}));
await sharp({ create: { width: W * VIEWS.length, height: H, channels: 4, background: "#000000" } })
  .composite(tiles.map((t, i) => ({ ...t, left: i * W, top: 0 })))
  .webp({ quality: 92 })
  .toFile("public/character/atlas.webp");
console.log(`atlas: ${W * VIEWS.length}×${H} (${VIEWS.map((v) => v[0]).join(", ")})`);
