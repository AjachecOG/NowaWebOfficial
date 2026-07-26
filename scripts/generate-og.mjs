import fs from "node:fs";
import sharp from "sharp";

const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff7ea"/>
      <stop offset="100%" stop-color="#dbe9ff"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="72" y="72" width="1056" height="486" rx="28" fill="#fffdf7" stroke="rgba(6,21,50,0.12)" stroke-width="2"/>
  <text x="120" y="250" font-family="Arial, Helvetica, sans-serif" font-size="84" font-weight="800" fill="#061532">NowaWeb</text>
  <circle cx="545" cy="222" r="14" fill="#0557f2"/>
  <text x="120" y="340" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="600" fill="#21365f">Strony firmowe bez WordPressa</text>
  <text x="120" y="420" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#21365f">Lekkie strony dla marek z całej Polski</text>
</svg>`);

await sharp(svg).jpeg({ quality: 88 }).toFile("public/assets/nowaweb/og-default.jpg");
console.log("og", (fs.statSync("public/assets/nowaweb/og-default.jpg").size / 1024).toFixed(1) + "KB");
