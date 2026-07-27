import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("public");
const svgPath = path.join(root, "favicon.svg");
const svg = fs.readFileSync(svgPath);

/** Minimal ICO with one embedded PNG (Vista+). */
function pngToIco(pngBuffer) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0); // width
  entry.writeUInt8(32, 1); // height
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4); // planes
  entry.writeUInt16LE(32, 6); // bit count
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(22, 12); // offset after header+entry

  return Buffer.concat([header, entry, pngBuffer]);
}

async function writePng(size, outName) {
  const out = path.join(root, outName);
  await sharp(svg).resize(size, size).png().toFile(out);
  console.log(outName, `${(fs.statSync(out).size / 1024).toFixed(1)}KB`);
}

const png32 = await sharp(svg).resize(32, 32).png().toBuffer();
fs.writeFileSync(path.join(root, "favicon.ico"), pngToIco(png32));
console.log("favicon.ico", `${(fs.statSync(path.join(root, "favicon.ico")).size / 1024).toFixed(1)}KB`);

await writePng(32, "favicon-32x32.png");
await writePng(180, "apple-touch-icon.png");
await writePng(192, "icon-192.png");
await writePng(512, "icon-512.png");

const manifest = {
  name: "NowaWeb",
  short_name: "NowaWeb",
  description: "Lekkie strony firmowe bez WordPressa",
  start_url: "/",
  display: "browser",
  background_color: "#fff7ea",
  theme_color: "#0557f2",
  icons: [
    {
      src: "/icon-192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: "/icon-512.png",
      sizes: "512x512",
      type: "image/png",
    },
  ],
};

fs.writeFileSync(path.join(root, "site.webmanifest"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log("site.webmanifest written");
