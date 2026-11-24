// Builds public/character/standing.webp: Laavanya on her feet, from her full-body drawings in
// docs/reference/character/ (local-only):
//   standing-full-{front,back,right}.webp, standing-full-left-2.webp (the left figure: black flats)
//   character-walk-frame.webp, a 4 × 4 sheet of walk frames
// Each drawing is cut out of its white background, scaled so she is the same height in every tile,
// centred, with her feet on the tile's bottom edge. Only frames with her black flats are used, and the
// one frame with the watermark on her skirt is skipped.
// Tile order (Entrance.tsx reads it): 0 front, 1 back, 2 facing left, 3 facing right, then the walk
// frames listed in WALK below.
// Run: node scripts/standing-sprite.mjs   (uses sharp, which ships with Next.js)
import sharp from "sharp";

const DIR = "docs/reference/character";
const TW = 264, TH = 480; // one tile
const FIG = 470; // her height inside a tile, in pixels
const COLS = 6;

// [file, crop left, top, width, height]
const cell = (c, r) => [`${DIR}/character-walk-frame.webp`, c * 224, r * 300, 224, 300];
const STAND = [
  [`${DIR}/standing-full-front.webp`, 0, 0, 896, 1200],
  [`${DIR}/standing-full-back.webp`, 0, 0, 896, 1200],
  [`${DIR}/standing-full-left-2.webp`, 0, 0, 448, 1200],
  [`${DIR}/standing-full-right.webp`, 0, 0, 896, 1200],
];
const WALK = {
  front: [cell(0, 0), cell(1, 0)],
  back: [cell(0, 1), cell(1, 1), cell(2, 1), cell(3, 1)],
  left: [cell(0, 2), cell(1, 2), cell(2, 2), cell(0, 3)],
  right: [cell(2, 0), cell(3, 0), cell(2, 3)],
};

async function cutout([file, left, top, width, height]) {
  const { data } = await sharp(file).removeAlpha().extract({ left, top, width, height }).raw().toBuffer({ resolveWithObject: true });
  const W = width, H = height, N = W * H;
  const rgba = Buffer.alloc(N * 4);
  const bg = new Uint8Array(N);
  for (let p = 0; p < N; p++) {
    const r = data[p * 3], g = data[p * 3 + 1], b = data[p * 3 + 2];
    rgba.set([r, g, b, 255], p * 4);
    bg[p] = Math.min(r, g, b) > 222 && Math.max(r, g, b) - Math.min(r, g, b) < 22 ? 1 : 0;
  }
  // flood-fill the white page from the edges
  const seen = new Uint8Array(N), st = [];
  for (let x = 0; x < W; x++) st.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) st.push(y * W, y * W + W - 1);
  while (st.length) {
    const p = st.pop();
    if (seen[p] || !bg[p]) continue;
    seen[p] = 1;
    const x = p % W, y = (p / W) | 0;
    if (x > 0) st.push(p - 1);
    if (x < W - 1) st.push(p + 1);
    if (y > 0) st.push(p - W);
    if (y < H - 1) st.push(p + W);
  }
  for (let p = 0; p < N; p++) if (seen[p]) rgba[p * 4 + 3] = 0;
  // white pockets the fill can't reach (between her arm and body): any sizeable white patch is background
  for (let s = 0; s < N; s++) {
    if (seen[s] || !bg[s]) continue;
    const patch = [];
    st.push(s);
    while (st.length) {
      const p = st.pop();
      if (seen[p] || !bg[p]) continue;
      seen[p] = 1;
      patch.push(p);
      const x = p % W, y = (p / W) | 0;
      if (x > 0) st.push(p - 1);
      if (x < W - 1) st.push(p + 1);
      if (y > 0) st.push(p - W);
      if (y < H - 1) st.push(p + W);
    }
    if (patch.length >= 12) for (const p of patch) rgba[p * 4 + 3] = 0;
  }
  // trim the pale fringe the drawing tool left along her outline
  for (let pass = 0; pass < 3; pass++) {
    const off = [];
    for (let p = 0; p < N; p++) {
      if (!rgba[p * 4 + 3]) continue;
      const r = rgba[p * 4], g = rgba[p * 4 + 1], b = rgba[p * 4 + 2];
      if (Math.min(r, g, b) < 175 || Math.max(r, g, b) - Math.min(r, g, b) > 45) continue;
      const x = p % W, y = (p / W) | 0;
      const edge = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].some(
        ([a, c]) => a < 0 || c < 0 || a >= W || c >= H || !rgba[(c * W + a) * 4 + 3],
      );
      if (edge) off.push(p);
    }
    for (const p of off) rgba[p * 4 + 3] = 0;
  }
  // keep only the biggest piece (drops specks, neighbouring frames' edges and stray watermarks)
  const label = new Int32Array(N).fill(-1);
  let best = -1, bestN = 0;
  for (let s = 0; s < N; s++) {
    if (label[s] >= 0 || !rgba[s * 4 + 3]) continue;
    let n = 0;
    const q = [s];
    label[s] = s;
    while (q.length) {
      const p = q.pop();
      n++;
      const x = p % W, y = (p / W) | 0;
      for (const np of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1]) {
        if (np >= 0 && label[np] < 0 && rgba[np * 4 + 3]) {
          label[np] = s;
          q.push(np);
        }
      }
    }
    if (n > bestN) [best, bestN] = [s, n];
  }
  let x0 = W, x1 = 0, y0 = H, y1 = 0;
  for (let p = 0; p < N; p++) {
    if (label[p] !== best) {
      rgba[p * 4 + 3] = 0;
      continue;
    }
    const x = p % W, y = (p / W) | 0;
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  return sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
    .extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 })
    .png()
    .toBuffer();
}

async function tile(src) {
  const fig = await cutout(src);
  const m = await sharp(fig).metadata();
  const w = Math.min(TW, Math.round((m.width * FIG) / m.height));
  const input = await sharp(fig).resize(w, FIG, { kernel: "nearest", fit: "fill" }).png().toBuffer();
  return { input, w };
}

const sources = [...STAND, ...WALK.front, ...WALK.back, ...WALK.left, ...WALK.right];
const tiles = await Promise.all(sources.map(tile));
const rows = Math.ceil(tiles.length / COLS);
await sharp({ create: { width: TW * COLS, height: TH * rows, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite(
    tiles.map((t, i) => ({
      input: t.input,
      left: (i % COLS) * TW + Math.round((TW - t.w) / 2),
      top: Math.floor(i / COLS) * TH + (TH - FIG),
    })),
  )
  .webp({ lossless: true })
  .toFile("public/character/standing.webp");

let i = STAND.length;
const index = {};
for (const [k, v] of Object.entries(WALK)) index[k] = v.map(() => i++);
console.log(`wrote public/character/standing.webp: ${tiles.length} tiles, ${COLS} × ${rows}, ${TW} × ${TH} each`);
console.log("walk frames:", JSON.stringify(index));
