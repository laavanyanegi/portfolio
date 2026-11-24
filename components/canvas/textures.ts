import * as THREE from "three";
import { ROOM } from "@/lib/roomPalette";

/** Small procedural pixel textures, drawn on a canvas and sampled with nearest-neighbour. */

function make(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  draw(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  return tex;
}

// deterministic pseudo-random so textures look the same every load
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

export function planksTexture() {
  const r = rng(7);
  const tex = make(64, 64, (c) => {
    const tones = ["#b98252", "#ad774a", "#c48c5a", "#a66f43"];
    for (let row = 0; row < 8; row++) {
      let x = -Math.floor(r() * 40);
      while (x < 64) {
        const len = 24 + Math.floor(r() * 30);
        c.fillStyle = tones[Math.floor(r() * tones.length)];
        c.fillRect(x, row * 8, len, 8);
        // grain flecks
        c.fillStyle = "rgba(80,45,20,0.25)";
        for (let i = 0; i < 4; i++) c.fillRect(x + Math.floor(r() * len), row * 8 + 2 + Math.floor(r() * 4), 3, 1);
        c.fillStyle = "#6e4528";
        c.fillRect(x, row * 8, 1, 8); // plank end
        x += len;
      }
      c.fillStyle = "#6e4528";
      c.fillRect(0, row * 8 + 7, 64, 1); // seam
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

export function mandalaTexture() {
  return make(128, 128, (c) => {
    const cx = 72; // centre sits right of middle so it wraps into the corner
    const cy = 64;
    c.strokeStyle = ROOM.mandala;
    c.fillStyle = ROOM.mandala;
    c.lineWidth = 2;
    const ring = (r: number) => {
      c.beginPath();
      c.arc(cx, cy, r, 0, Math.PI * 2);
      c.stroke();
    };
    const petals = (n: number, r: number, len: number, wid: number, offset = 0) => {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + offset;
        c.save();
        c.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        c.rotate(a);
        c.beginPath();
        c.ellipse(0, 0, len, wid, 0, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }
    };
    c.beginPath();
    c.arc(cx, cy, 5, 0, Math.PI * 2);
    c.fill();
    ring(9);
    petals(8, 15, 6, 3);
    ring(22);
    petals(12, 30, 8, 4, 0.26);
    ring(39);
    petals(16, 47, 9, 4);
    ring(56);
    petals(20, 62, 7, 3, 0.15);
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      c.fillRect(cx + Math.cos(a) * 70 - 1, cy + Math.sin(a) * 70 - 1, 2, 2);
    }
  });
}

export function rugTexture() {
  return make(32, 24, (c) => {
    c.fillStyle = "#d9c7a6";
    c.fillRect(0, 0, 32, 24);
    c.fillStyle = "#8a5a3a";
    c.fillRect(1, 1, 30, 1);
    c.fillRect(1, 22, 30, 1);
    c.fillRect(1, 1, 1, 22);
    c.fillRect(30, 1, 1, 22);
    c.fillStyle = "#9d84d6";
    for (let y = 4; y < 21; y += 4)
      for (let x = 4 + ((y / 4) % 2) * 2; x < 29; x += 4) c.fillRect(x, y, 2, 2);
  });
}

/** The view through the balcony door: sky, skyline and railing painted in one picture. */
export function skylineTexture(night: boolean) {
  const r = rng(night ? 11 : 5);
  return make(96, 128, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 128);
    if (night) {
      g.addColorStop(0, "#0b0d24");
      g.addColorStop(0.7, "#27264f");
      g.addColorStop(1, "#3a2c4a");
    } else {
      g.addColorStop(0, "#8fb3e0");
      g.addColorStop(0.65, "#d9e3ee");
      g.addColorStop(1, "#f6d9b0");
    }
    c.fillStyle = g;
    c.fillRect(0, 0, 96, 128);
    if (night) {
      c.fillStyle = "#e9e6ff";
      for (let i = 0; i < 18; i++) c.fillRect(Math.floor(r() * 96), Math.floor(r() * 60), 1, 1);
    }
    // two layers of buildings
    const layer = (base: number, col: string, win: string | null, minH: number, maxH: number) => {
      let x = 0;
      while (x < 96) {
        const w = 6 + Math.floor(r() * 10);
        const h = minH + Math.floor(r() * (maxH - minH));
        c.fillStyle = col;
        c.fillRect(x, base - h, w, h);
        if (win) {
          c.fillStyle = win;
          for (let wy = base - h + 2; wy < base - 2; wy += 3)
            for (let wx = x + 1; wx < x + w - 1; wx += 2) if (r() > (night ? 0.55 : 0.8)) c.fillRect(wx, wy, 1, 1);
        }
        x += w + Math.floor(r() * 2);
      }
    };
    layer(96, night ? "#1f1d38" : "#a9b4c6", null, 18, 40);
    layer(100, night ? "#15132a" : "#8794a8", night ? "#ffd27a" : "#c4cedb", 10, 30);
    // balcony floor and railing
    c.fillStyle = night ? "#2a2530" : "#a39d95";
    c.fillRect(0, 100, 96, 28);
    c.fillStyle = night ? "#0e0c12" : "#3a3633";
    c.fillRect(0, 78, 96, 3);
    for (let x = 2; x < 96; x += 6) c.fillRect(x, 78, 2, 24);
  });
}

/** Front of the little speaker on the side-table shelf: black grille, gold trim, script logo. */
export function speakerFrontTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const c = canvas.getContext("2d")!;
  c.fillStyle = "#151210";
  c.fillRect(0, 0, 256, 128);
  // grille texture
  c.fillStyle = "#221d1a";
  for (let y = 10; y < 118; y += 4) for (let x = 10; x < 246; x += 4) c.fillRect(x, y, 2, 2);
  c.strokeStyle = "#c9a35a";
  c.lineWidth = 6;
  c.strokeRect(6, 6, 244, 116);
  c.fillStyle = "#efe4cf";
  c.font = "italic bold 54px 'Brush Script MT', 'Segoe Script', cursive";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText("Marshall", 128, 66);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ───────── View B (bed + closet walls) ───────── */

export type PictureKind = "landscape" | "temple" | "plant" | "portrait" | "abstract" | "flower" | "sunset";

/** A tiny pixel picture for the gallery above the bed. */
export function pictureTexture(kind: PictureKind, seed: number) {
  const r = rng(seed);
  return make(24, 30, (c) => {
    const fill = (col: string, x: number, y: number, w: number, h: number) => {
      c.fillStyle = col;
      c.fillRect(x, y, w, h);
    };
    switch (kind) {
      case "landscape":
        fill("#9cc3dc", 0, 0, 24, 30);
        fill("#f3e1a8", 16, 4, 4, 4);
        fill("#7a9a5a", 0, 16, 24, 14);
        fill("#5d7f45", 0, 20, 14, 10);
        fill("#4c6a3a", 3 + Math.floor(r() * 6), 10, 3, 8);
        fill("#4c6a3a", 14, 12, 3, 6);
        break;
      case "temple":
        fill("#e9c9a0", 0, 0, 24, 30);
        fill("#b5603c", 6, 10, 12, 16);
        fill("#8a3f2a", 9, 4, 6, 6);
        fill("#d98a4e", 8, 14, 8, 12);
        fill("#6b8a4a", 0, 26, 24, 4);
        break;
      case "plant":
        fill("#efe3cf", 0, 0, 24, 30);
        fill("#b96b45", 8, 20, 8, 7);
        fill("#4f7a3a", 6, 8, 12, 12);
        fill("#6e9a4e", 9, 5, 6, 8);
        break;
      case "portrait":
        fill("#d7c0a5", 0, 0, 24, 30);
        fill("#2b1a12", 7, 5, 10, 12);
        fill("#c68a5c", 9, 8, 6, 8);
        fill("#7d5a9e", 5, 18, 14, 12);
        break;
      case "abstract":
        fill("#f1e6d2", 0, 0, 24, 30);
        fill("#c96b4a", 3, 4, 10, 10);
        fill("#4f86b8", 11, 13, 10, 10);
        fill("#e0b24c", 5, 20, 8, 7);
        break;
      case "flower":
        fill("#eadccb", 0, 0, 24, 30);
        fill("#5d7f45", 11, 12, 2, 14);
        fill("#c25b6e", 7, 5, 10, 8);
        fill("#f0c24f", 10, 8, 4, 3);
        break;
      case "sunset":
        fill("#e8955a", 0, 0, 24, 14);
        fill("#f2c37a", 0, 8, 24, 6);
        fill("#f7e3a0", 9, 9, 6, 4);
        fill("#3f5f7a", 0, 14, 24, 16);
        fill("#2c4459", 0, 22, 24, 8);
        break;
    }
  });
}

/** The landscape painting above the sideboard: sky, hills, a row of trees and a field. */
export function landscapePaintingTexture() {
  const r = rng(21);
  return make(48, 30, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 16);
    g.addColorStop(0, "#9ec4dc");
    g.addColorStop(1, "#f1dcb0");
    c.fillStyle = g;
    c.fillRect(0, 0, 48, 30);
    c.fillStyle = "#8aa36a";
    c.fillRect(0, 14, 48, 16);
    c.fillStyle = "#6f8f52";
    for (let x = 0; x < 48; x++) c.fillRect(x, 12 + Math.round(Math.sin(x / 6) * 2), 1, 4);
    c.fillStyle = "#c9a35a";
    c.fillRect(0, 22, 48, 8);
    for (let i = 0; i < 7; i++) {
      const x = 4 + i * 6 + Math.floor(r() * 3);
      c.fillStyle = "#3f5f37";
      c.fillRect(x, 8 + Math.floor(r() * 3), 4, 8);
      c.fillStyle = "#5a3a22";
      c.fillRect(x + 1, 15, 2, 3);
    }
    c.fillStyle = "#b5603c";
    c.fillRect(30, 14, 6, 5);
    c.fillStyle = "#8a3f2a";
    c.fillRect(29, 12, 8, 2);
  });
}

/** Mirror glass: pale blue with two diagonal glints. */
/**
 * Hexagon wire photo board for the desk: black frame and grid with polaroids, a letter, sticky
 * notes and hanging earrings clipped on. Transparent outside the hexagon.
 */
export function hexBoardTexture() {
  return make(64, 56, (c) => {
    const hex = () => {
      c.beginPath();
      c.moveTo(16, 0);
      c.lineTo(48, 0);
      c.lineTo(64, 28);
      c.lineTo(48, 56);
      c.lineTo(16, 56);
      c.lineTo(0, 28);
      c.closePath();
    };
    c.save();
    hex();
    c.clip();
    c.fillStyle = "#3a3333";
    c.fillRect(0, 0, 64, 56);
    c.fillStyle = "#1c1818";
    for (let x = 3; x < 64; x += 6) c.fillRect(x, 0, 1, 56);
    for (let y = 3; y < 56; y += 6) c.fillRect(0, y, 64, 1);
    // polaroids: white card, photo, thicker bottom edge
    const polaroid = (x: number, y: number, photo: string, ground: string) => {
      c.fillStyle = "#f4f1ea";
      c.fillRect(x, y, 11, 13);
      c.fillStyle = photo;
      c.fillRect(x + 1, y + 1, 9, 8);
      c.fillStyle = ground;
      c.fillRect(x + 1, y + 6, 9, 3);
      c.fillStyle = "#c9a45a"; // little clip
      c.fillRect(x + 4, y - 1, 3, 2);
    };
    polaroid(12, 9, "#8fbfe0", "#6f9a4e");
    polaroid(27, 5, "#f0b9c6", "#b46a7e");
    polaroid(41, 10, "#f2cf8a", "#c27a3e");
    polaroid(22, 37, "#a9d0c4", "#4e7a6a");
    // letter: envelope with a red heart seal
    c.fillStyle = "#efe6d2";
    c.fillRect(25, 23, 15, 10);
    c.fillStyle = "#b9a98a";
    for (let i = 0; i < 7; i++) {
      c.fillRect(25 + i, 23 + i, 1, 1);
      c.fillRect(39 - i, 23 + i, 1, 1);
    }
    c.fillStyle = "#c23b4b";
    c.fillRect(31, 29, 3, 2);
    // sticky notes
    c.fillStyle = "#f3d36b";
    c.fillRect(9, 27, 9, 9);
    c.fillStyle = "#f2a3b5";
    c.fillRect(45, 27, 9, 9);
    c.fillStyle = "#9b8a6a";
    c.fillRect(10, 30, 6, 1);
    c.fillRect(10, 32, 5, 1);
    c.fillRect(46, 30, 6, 1);
    // earrings hanging from the grid: gold hoops and pearl drops
    c.fillStyle = "#e0b84a";
    for (const x of [38, 43]) {
      c.fillRect(x, 39, 1, 3);
      c.fillRect(x - 1, 42, 3, 1);
      c.fillRect(x - 1, 45, 3, 1);
      c.fillRect(x - 2, 43, 1, 2);
      c.fillRect(x + 2, 43, 1, 2);
    }
    c.fillStyle = "#f6f1e6";
    c.fillRect(48, 41, 2, 2);
    c.fillRect(48, 44, 2, 2);
    c.restore();
    // frame
    c.strokeStyle = "#141010";
    c.lineWidth = 2;
    hex();
    c.stroke();
  });
}

export function mirrorTexture() {
  return make(16, 48, (c) => {
    const g = c.createLinearGradient(0, 0, 16, 48);
    g.addColorStop(0, "#d7e6f0");
    g.addColorStop(1, "#a9c3d6");
    c.fillStyle = g;
    c.fillRect(0, 0, 16, 48);
    c.fillStyle = "rgba(255,255,255,0.55)";
    for (let y = 0; y < 48; y++) {
      c.fillRect(Math.round(14 - y * 0.35), y, 2, 1);
      c.fillRect(Math.round(10 - y * 0.35), y, 1, 1);
    }
  });
}

/** Cream rug with a woven border, under the floor lamp and mirror. */
export function creamRugTexture() {
  return make(40, 24, (c) => {
    c.fillStyle = "#e9dcc2";
    c.fillRect(0, 0, 40, 24);
    c.fillStyle = "#cdb894";
    c.fillRect(1, 1, 38, 1);
    c.fillRect(1, 22, 38, 1);
    c.fillRect(1, 1, 1, 22);
    c.fillRect(38, 1, 1, 22);
    for (let y = 5; y < 20; y += 4) for (let x = 5 + ((y / 4) % 2) * 2; x < 35; x += 4) c.fillRect(x, y, 2, 1);
  });
}

/** A generic open browser window for the laptop screen: tab strip, address bar, blank page with soft blocks. Nothing readable. */
export function browserScreenTexture() {
  return make(64, 40, (c) => {
    c.fillStyle = "#dfe3ea"; // window frame + tab strip
    c.fillRect(0, 0, 64, 40);
    c.fillStyle = "#f7f8fa"; // active tab
    c.fillRect(3, 2, 16, 4);
    c.fillStyle = "#c9ced8"; // other tab
    c.fillRect(20, 3, 12, 3);
    c.fillStyle = "#f7f8fa"; // toolbar
    c.fillRect(0, 6, 64, 5);
    c.fillStyle = "#e6e9ef"; // address bar
    c.fillRect(9, 7, 46, 3);
    c.fillStyle = "#9aa3b2"; // back / forward / reload dots
    c.fillRect(2, 8, 1, 1);
    c.fillRect(4, 8, 1, 1);
    c.fillRect(6, 8, 1, 1);
    c.fillStyle = "#ffffff"; // page
    c.fillRect(0, 11, 64, 29);
    c.fillStyle = "#e9e4f5"; // a soft header block and a few grey lines, nothing legible
    c.fillRect(6, 14, 52, 7);
    c.fillStyle = "#d9dde4";
    for (const [y, w] of [[24, 40], [27, 46], [30, 34], [33, 42]]) c.fillRect(6, y, w, 1);
  });
}
