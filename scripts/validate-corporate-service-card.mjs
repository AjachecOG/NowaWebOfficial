import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const page = await readFile(new URL("../src/pages/index.astro", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/styles/global.css", import.meta.url), "utf8");

const imageNames = [
  "corporate-websites.png",
  "landing-page.png",
  "one-page.png",
  "website-refresh.png",
  "ux-copywriting.png",
  "care-growth.png",
];

for (const imageName of imageNames) {
  assert.match(
    page,
    new RegExp(`/assets/nowaweb/services/${imageName.replace(".", "\\.")}`),
    `missing ${imageName} mapping`,
  );
  await access(new URL(`../public/assets/nowaweb/services/${imageName}`, import.meta.url));
}

assert.match(page, /class="service-card service-card--image"/, "missing image card markup");
assert.match(page, /class="service-card-image"/, "missing service image element");
assert.doesNotMatch(page, /service-card-browser/, "legacy generated browser illustration remains");
assert.match(
  styles,
  /\.service-card--image\s*\{[\s\S]*?--service-image-scale:\s*1\.08;[\s\S]*?--service-image-y:\s*0%;/,
  "service image cards should define the reference crop used by the final two images",
);
assert.match(
  styles,
  /\.service-card--image\s*\{[\s\S]*?border:\s*0;[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;/,
  "image service cards should not add a second frame around the artwork",
);
assert.match(
  styles,
  /\.service-card--image:hover\s*\{[\s\S]*?border-color:\s*transparent;[\s\S]*?box-shadow:\s*none;/,
  "image service cards should remain frameless on hover",
);
assert.match(
  styles,
  /\.service-card--image:nth-child\(1\)\s*\{[\s\S]*?--service-image-scale:\s*1\.26;[\s\S]*?--service-image-y:\s*3%;/,
  "corporate website image should normalize its short, top-biased paper frame",
);
assert.match(
  styles,
  /\.service-card--image:nth-child\(2\)\s*\{[\s\S]*?--service-image-scale:\s*1\.16;/,
  "landing page image should normalize its embedded paper frame",
);
assert.match(
  styles,
  /\.service-card--image:nth-child\(3\)\s*\{[\s\S]*?--service-image-scale:\s*1\.20;/,
  "one page image should normalize its embedded paper frame",
);
assert.match(
  styles,
  /\.service-card--image:nth-child\(4\)\s*\{[\s\S]*?--service-image-scale:\s*1\.10;/,
  "website refresh image should normalize its embedded paper frame",
);
assert.match(
  styles,
  /\.service-card-image\s*\{[\s\S]*?transform:\s*translateY\(var\(--service-image-y\)\)\s*scale\(var\(--service-image-scale\)\)/,
  "service images should use their per-card crop values",
);
assert.match(
  styles,
  /\.service-card--image\[data-reveal\]\.is-visible\s*\{[\s\S]*?transition:\s*transform 220ms ease;/,
  "visible service image cards should restore the short hover transition",
);
assert.match(
  styles,
  /\.service-card--image\[data-reveal\]\.is-visible:hover\s*\{[\s\S]*?transform:\s*translateY\(-6px\)/,
  "visible service image cards should lift on hover",
);
assert.match(
  styles,
  /\.service-board\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/,
  "missing three-column desktop layout",
);
assert.match(
  styles,
  /@media\s*\(max-width:\s*980px\)[\s\S]*?\.service-board\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/,
  "missing two-column tablet layout",
);
assert.match(
  styles,
  /@media\s*\(max-width:\s*760px\)[\s\S]*?\.service-board[\s\S]*?grid-template-columns:\s*1fr/,
  "missing one-column phone layout",
);

console.log("Service image card structure is present.");
