import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const componentUrl = new URL("../src/components/PortfolioCarousel.tsx", import.meta.url);
const component = await readFile(componentUrl, "utf8");

const assets = [
  ["cakepops.png", new URL("../public/assets/nowaweb/portfolio/cakepops.png", import.meta.url)],
  ["new-york-rolls.png", new URL("../public/assets/nowaweb/portfolio/new-york-rolls.png", import.meta.url)],
  ["atmo-vision.png", new URL("../public/assets/nowaweb/portfolio/atmo-vision.png", import.meta.url)],
];

for (const [name, url] of assets) {
  const metadata = await stat(url);
  assert.ok(metadata.size > 100_000, `${name} should be a real screenshot asset`);
  const signature = (await readFile(url)).subarray(0, 8).toString("hex");
  assert.equal(signature, "89504e470d0a1a0a", `${name} should be a PNG`);
}

for (const expected of [
  "Cakepops.pl",
  "New York Rolls",
  "Atmo‑Vision",
  "/assets/nowaweb/portfolio/cakepops.png",
  "/assets/nowaweb/portfolio/new-york-rolls.png",
  "/assets/nowaweb/portfolio/atmo-vision.png",
]) {
  assert.ok(component.includes(expected), `missing real portfolio value: ${expected}`);
}

for (const obsolete of ["Atelier Mira", "Kancelaria Północ", "Nord Clinic"]) {
  assert.ok(!component.includes(obsolete), `obsolete fictional project remains: ${obsolete}`);
}

console.log("Portfolio real project assets and content are present.");
