import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const componentUrl = new URL("../src/components/PortfolioCarousel.tsx", import.meta.url);
const component = await readFile(componentUrl, "utf8");
const page = await readFile(new URL("../src/pages/index.astro", import.meta.url), "utf8");
const componentStyles = await readFile(
  new URL("../src/components/PortfolioCarousel.css", import.meta.url),
  "utf8",
);
const globalStyles = await readFile(new URL("../src/styles/global.css", import.meta.url), "utf8");

const assets = [
  ["cakepops.webp", new URL("../public/assets/nowaweb/portfolio/cakepops.webp", import.meta.url)],
  ["new-york-rolls.webp", new URL("../public/assets/nowaweb/portfolio/new-york-rolls.webp", import.meta.url)],
  ["atmo-vision.webp", new URL("../public/assets/nowaweb/portfolio/atmo-vision.webp", import.meta.url)],
];

for (const [name, url] of assets) {
  const metadata = await stat(url);
  assert.ok(metadata.size > 20_000, `${name} should be a real screenshot asset`);
  const header = Buffer.from(await readFile(url)).subarray(0, 12);
  assert.equal(header.subarray(0, 4).toString("ascii"), "RIFF", `${name} should be a WebP (RIFF)`);
  assert.equal(header.subarray(8, 12).toString("ascii"), "WEBP", `${name} should be a WebP`);
}

for (const expected of [
  "Cakepops.pl",
  "New York Rolls",
  "Atmo - Vision",
  "/assets/nowaweb/portfolio/cakepops.webp",
  "/assets/nowaweb/portfolio/new-york-rolls.webp",
  "/assets/nowaweb/portfolio/atmo-vision.webp",
]) {
  assert.ok(component.includes(expected), `missing real portfolio value: ${expected}`);
}

for (const obsolete of ["Atelier Mira", "Kancelaria Północ", "Nord Clinic"]) {
  assert.ok(!component.includes(obsolete), `obsolete fictional project remains: ${obsolete}`);
}

for (const pattern of [
  /type CardPosition = "left" \| "center" \| "right"/,
  /function getCardPosition/,
  /data-position=\{position\}/,
  /data-active=\{active\}/,
  /onPointerDown=\{handlePointerDown\}/,
  /onPointerUp=\{handlePointerUp\}/,
  /onKeyDown=\{handleKeyDown\}/,
  /Math\.abs\(deltaX\) < 48/,
  /role=\{isActive \? "group" : "button"\}/,
  /tabIndex=\{isActive \? -1 : 0\}/,
  /event\.key === "Enter" \|\| event\.key === " "/,
  /className="portfolio-carousel__project-name"/,
  /data-active=\{index === active \? "true" : "false"\}/,
  /aria-live="polite"/,
]) {
  assert.match(component, pattern, `missing carousel interaction contract: ${pattern}`);
}

for (const removed of [
  "portfolio-carousel__titlebar",
  "portfolio-carousel__meta",
  "portfolio-carousel__external",
  "portfolio-carousel__side-control",
  "portfolio-carousel__controls",
  "portfolio-carousel__hint",
]) {
  assert.ok(!component.includes(removed), `removed carousel chrome remains: ${removed}`);
}

assert.doesNotMatch(component, /Zobacz projekt:/, "carousel must not show the raw HTML project link");

for (const copy of ["Wybrane realizacje", "Trzy projekty", "Trzy różne pomysły"]) {
  assert.ok(page.includes(copy), `missing approved portfolio heading copy: ${copy}`);
}

for (const pattern of [
  /\.portfolio-carousel__card\[data-position="center"\]/,
  /translate\(-50%, -50%\) scale\(1\)/,
  /\.portfolio-carousel__card\[data-position="left"\]/,
  /\.portfolio-carousel__card\[data-position="right"\]/,
  /scale\(0\.8\)/,
  /backdrop-filter:\s*blur\(2\.5px\) saturate\(112%\)/,
  /\.portfolio\s*\{[^}]*width:\s*100%/s,
  /mask-image:\s*radial-gradient/,
  /\.portfolio-carousel__project-name\s*\{/,
  /font-family:\s*var\(--display\)/,
  /\.portfolio-carousel__project-name-item\s*\{/,
  /transition:[^}]*opacity[^}]*transform/s,
  /object-fit:\s*contain/,
  /--portfolio-spring:\s*900ms cubic-bezier\(0\.4, 0\.0, 0\.2, 1\)/,
  /@supports not \(backdrop-filter: blur\(1px\)\)/,
  /@media \(prefers-reduced-motion: reduce\)/,
  /@media \(max-width: 860px\)/,
  /@media \(max-width: 560px\)/,
  /:focus-visible/,
]) {
  assert.match(componentStyles, pattern, `missing approved portfolio style contract: ${pattern}`);
}

assert.doesNotMatch(componentStyles, /grayscale\(|brightness\(0\.|saturate\(0\./, "side cards must stay full-color");
const stageRule = componentStyles.match(/\.portfolio-carousel__stage\s*\{([^}]*)\}/s)?.[1] ?? "";
assert.doesNotMatch(
  stageRule,
  /mask-image/,
  "the stage must not clip the center-card shadow at the project-name boundary",
);
assert.match(
  componentStyles,
  /\.portfolio-carousel__card\[data-position="left"\],\s*\.portfolio-carousel__card\[data-position="right"\]\s*\{[^}]*mask-image:\s*radial-gradient\(/s,
  "side cards should fade into the page background above the project name",
);
assert.match(
  componentStyles,
  /\.portfolio-carousel__card\[data-position="center"\]\s*\{[^}]*0 26px 64px rgba\(84, 92, 110, 0\.14\)/s,
  "the center-card shadow should fade quickly with a neutral tint",
);
assert.doesNotMatch(globalStyles, /\.project-card\[data-position=/, "legacy portrait stack CSS must be removed");

console.log("Portfolio real project assets and content are present.");
