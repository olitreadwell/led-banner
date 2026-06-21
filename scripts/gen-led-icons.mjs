// Generates the LED Banner PWA icons (192 & 512 px) with no external deps.
// Renders "LED" in a 5x7 dot-matrix font on black — matching the app's look —
// and writes maskable-safe PNGs into the repo root. Re-run after design changes:
//   node scripts/gen-led-icons.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');

// 5x7 glyphs for the three letters we need.
const GLYPHS = {
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
};
const WORD = 'LED';

const ON = [0x39, 0xff, 0x14]; // neon green
const OFF = [0x10, 0x18, 0x10]; // dim "unlit" dot
const BG = [0x00, 0x00, 0x00];

// Build a width-17 x height-7 grid: each glyph is 5 wide, 1 col gap between.
const COLS = WORD.length * 5 + (WORD.length - 1);
const ROWS = 7;
const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
WORD.split('').forEach((ch, i) => {
  const g = GLYPHS[ch];
  const xOff = i * 6;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < 5; c++) if (g[r][c] === '1') grid[r][xOff + c] = 1;
});

function buildPng(size) {
  // Keep the matrix inside the centre ~70% so it survives maskable cropping.
  const safe = size * 0.7;
  const cell = Math.floor(Math.min(safe / COLS, safe / ROWS));
  const gridW = cell * COLS;
  const gridH = cell * ROWS;
  const offX = Math.floor((size - gridW) / 2);
  const offY = Math.floor((size - gridH) / 2);
  const radius = cell * 0.42;

  // Raw image: 1 filter byte per row + RGB per pixel.
  const raw = Buffer.alloc(size * (1 + size * 3));
  const px = (x, y, [r, g, b]) => {
    const idx = y * (1 + size * 3) + 1 + x * 3;
    raw[idx] = r;
    raw[idx + 1] = g;
    raw[idx + 2] = b;
  };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) px(x, y, BG);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cx = offX + c * cell + cell / 2;
      const cy = offY + r * cell + cell / 2;
      const color = grid[r][c] ? ON : OFF;
      for (let y = Math.floor(cy - radius); y <= cy + radius; y++) {
        for (let x = Math.floor(cx - radius); x <= cx + radius; x++) {
          if (x < 0 || y < 0 || x >= size || y >= size) continue;
          if ((x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2) px(x, y, color);
        }
      }
    }
  }
  return encodePng(size, size, raw);
}

// Minimal PNG encoder (RGB, 8-bit, single IDAT).
function encodePng(w, h, raw) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour RGB
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body) >>> 0, 0);
    return Buffer.concat([len, body, crc]);
  };
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++)
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ 0xffffffff;
}

for (const size of [192, 512]) {
  writeFileSync(join(OUT_DIR, `icon-${size}.png`), buildPng(size));
  console.log(`wrote icon-${size}.png`);
}
