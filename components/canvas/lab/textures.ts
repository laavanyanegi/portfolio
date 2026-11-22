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
