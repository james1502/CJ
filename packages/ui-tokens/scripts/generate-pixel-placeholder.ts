/**
 * Builds a generic unbranded pixel mark used as the shared icon source.
 * Two ink eyes on an orange block — no product name or mascot likeness.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = new URL("../../../", import.meta.url);
const path = (name: string) => fileURLToPath(new URL(name, root));

const SIZE = 1024;
const CELL = 64; // 16×16 logical pixels
const ORANGE = { r: 249, g: 125, b: 22, alpha: 1 };
const INK = { r: 20, g: 20, b: 20, alpha: 1 };
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

/** 16×16 cells: `#` body, `o` eye (ink or clear), `.` empty. */
const GRID = [
  "................",
  "....########....",
  "...##########...",
  "..############..",
  "..##oo####oo##..",
  "..##oo####oo##..",
  "..############..",
  "..############..",
  "...##########...",
  "....########....",
  ".....######.....",
  "......####......",
  ".......##.......",
  "................",
  "................",
  "................",
];

function paintGrid(fill: { r: number; g: number; b: number; alpha: number }, eyeClear: boolean) {
  const channels = 4;
  const data = Buffer.alloc(SIZE * SIZE * channels);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const gx = Math.floor(x / CELL);
      const gy = Math.floor(y / CELL);
      const cell = GRID[gy]?.[gx] ?? ".";
      const i = (y * SIZE + x) * channels;
      let color = CLEAR;
      if (cell === "#") color = fill;
      else if (cell === "o") color = eyeClear ? CLEAR : INK;
      data[i] = color.r;
      data[i + 1] = color.g;
      data[i + 2] = color.b;
      data[i + 3] = Math.round(color.alpha * 255);
    }
  }
  return sharp(data, { raw: { width: SIZE, height: SIZE, channels: 4 } })
    .png()
    .toBuffer();
}

const body = await paintGrid(ORANGE, false);
const transparentFg = await paintGrid(ORANGE, true);
const mono = await paintGrid(WHITE, true);

await mkdir(path("packages/ui-tokens/assets/Rakazo.icon/Assets"), { recursive: true });
await writeFile(path("packages/ui-tokens/assets/Rakazo.icon/Assets/orange-bot.png"), body);

// Platform-hand exports that Icon Composer normally supplies.
await sharp(body).png().toFile(path("apps/mobile/assets/icon.png"));
await sharp(transparentFg).png().toFile(path("apps/mobile/assets/adaptive-icon.png"));
await sharp({
  create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
})
  .png()
  .toFile(path("apps/mobile/assets/icon-background.png"));
await sharp(mono).png().toFile(path("apps/mobile/assets/monochrome-icon.png"));
await sharp(body)
  .extend({ top: 96, bottom: 96, left: 96, right: 96, background: CLEAR })
  .resize(SIZE, SIZE)
  .png()
  .toFile(path("apps/desktop/assets/icon-macos.png"));

// Marketing kit placeholders (keep existing filenames so B3 path renames stay deferred).
await mkdir(path("apps/www/public/brand/kit"), { recursive: true });
await sharp(body).png().toFile(path("apps/www/public/brand/kit/rakazo-icon.png"));
await sharp(body)
  .resize(700, 700)
  .png()
  .toFile(path("apps/www/public/brand/kit/rakazo-mascot.png"));
await sharp(body)
  .resize(256, 256)
  .extend({ top: 160, bottom: 160, left: 0, right: 1456, background: CLEAR })
  .composite([
    {
      input: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="1456" height="576">
          <text x="280" y="360" font-family="monospace" font-size="220" font-weight="700" fill="#141414">app</text>
        </svg>`,
      ),
      top: 0,
      left: 0,
    },
  ])
  .png()
  .toFile(path("apps/www/public/brand/kit/rakazo-logo.png"));

await writeFile(
  path("apps/www/public/brand/kit/rakazo-wordmark.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 64" role="img" aria-label="app">
  <text x="0" y="48" font-family="ui-monospace, monospace" font-size="56" font-weight="700" fill="#141414">app</text>
</svg>
`,
);

// Simple previews: same assets resized / re-encoded.
await sharp(path("apps/www/public/brand/kit/rakazo-icon.png"))
  .resize(256, 256)
  .webp()
  .toFile(path("apps/www/public/brand/kit/rakazo-icon-preview.webp"));
await sharp(path("apps/www/public/brand/kit/rakazo-mascot.png"))
  .resize(256, 256)
  .webp()
  .toFile(path("apps/www/public/brand/kit/rakazo-mascot-preview.webp"));
await sharp(path("apps/www/public/brand/kit/rakazo-logo.png"))
  .resize(428, 144)
  .webp()
  .toFile(path("apps/www/public/brand/kit/rakazo-logo-preview.webp"));

// README hero: flat void with the mark centered.
await sharp({
  create: { width: 1600, height: 900, channels: 3, background: { r: 0, g: 0, b: 0 } },
})
  .composite([{ input: await sharp(body).resize(320, 320).png().toBuffer(), top: 290, left: 640 }])
  .png()
  .toFile(path("docs/readme-hero.png"));

console.log("Wrote generic pixel placeholder brand assets.");
