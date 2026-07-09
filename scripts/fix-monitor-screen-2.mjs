import sharp from "sharp";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HERO_DIR = join(__dirname, "..", "public", "assets", "nowaweb", "hero");

async function loadRgba(path, width, height) {
  const input = width && height
    ? sharp(readFileSync(path)).resize(width, height)
    : sharp(readFileSync(path));
  const { data, info } = await input.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { pixels: new Uint8ClampedArray(data), width: info.width, height: info.height };
}

function borderConnectedBackground(likelyBg, width, height) {
  const visited = new Uint8Array(width * height);
  const queue = [];
  const enqueue = (x, y) => {
    const idx = y * width + x;
    if (likelyBg[idx] && !visited[idx]) {
      visited[idx] = 1;
      queue.push([x, y]);
    }
  };
  for (let x = 0; x < width; x++) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }
  while (queue.length) {
    const [x, y] = queue.shift();
    if (x > 0) enqueue(x - 1, y);
    if (x < width - 1) enqueue(x + 1, y);
    if (y > 0) enqueue(x, y - 1);
    if (y < height - 1) enqueue(x, y + 1);
  }
  return visited;
}

function isDarkHardware(r, g, b) {
  const bright = Math.max(r, g, b);
  const sat = bright - Math.min(r, g, b);
  return bright < 92 && sat < 36;
}

async function processMonitorScreen(sourceName, outputName) {
  const sourcePath = join(HERO_DIR, sourceName);
  const outputPath = join(HERO_DIR, outputName);
  const cutoutPath = join(HERO_DIR, "monitor-cutout.png");

  const { pixels, width, height } = await loadRgba(sourcePath);
  const { pixels: cutout } = await loadRgba(cutoutPath, width, height);

  const bg = [252, 252, 252];
  const likelyBg = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const rgb = [pixels[i], pixels[i + 1], pixels[i + 2]];
      const d = Math.hypot(rgb[0] - bg[0], rgb[1] - bg[1], rgb[2] - bg[2]);
      const bright = Math.max(...rgb);
      const sat = bright - Math.min(...rgb);
      likelyBg[y * width + x] =
        d < 56 ||
        (bright > 228 && sat < 60) ||
        (bright > 186 && sat < 34) ||
        (bright > 200 && Math.min(...rgb) > 172 && d < 98)
          ? 1
          : 0;
    }
  }

  const connectedBg = borderConnectedBackground(likelyBg, width, height);
  const cutoutAlpha = new Float32Array(width * height);
  for (let i = 0, p = 0; i < cutoutAlpha.length; i++, p += 4) {
    cutoutAlpha[i] = cutout[p + 3] / 255;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const i = idx * 4;
      const matte = connectedBg[idx];
      let alpha = pixels[i + 3] * (1 - matte);
      alpha = Math.min(alpha, cutoutAlpha[idx] * 255);
      pixels[i + 3] = Math.max(0, Math.min(255, alpha));
    }
  }

  const bezelStartY = Math.floor(height * 0.8);
  const standStartY = Math.floor(height * 0.865);
  let patched = 0;

  for (let y = bezelStartY; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const i = idx * 4;
      if (cutout[i + 3] < 20) {
        pixels[i + 3] = 0;
        continue;
      }

      const shouldPatch =
        y >= standStartY ||
        isDarkHardware(cutout[i], cutout[i + 1], cutout[i + 2]);

      if (!shouldPatch) continue;

      pixels[i] = cutout[i];
      pixels[i + 1] = cutout[i + 1];
      pixels[i + 2] = cutout[i + 2];
      pixels[i + 3] = cutout[i + 3];
      patched++;
    }
  }

  await sharp(Buffer.from(pixels), { raw: { width, height, channels: 4 } }).png().toFile(outputPath);
  console.log(`${sourceName} -> ${outputName} (patched pixels: ${patched})`);
}

await processMonitorScreen("monitor-screen-2.source.png", "monitor-screen-2.png");
