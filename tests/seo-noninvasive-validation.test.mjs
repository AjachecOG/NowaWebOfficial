import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("generated sitemap omits artificial build-time lastmod values", () => {
  assert.doesNotMatch(read("dist/sitemap-0.xml"), /<lastmod>/i);
});

test("generated indexable pages link directly to canonical trailing-slash URLs", () => {
  const pages = [
    "dist/index.html",
    "dist/kontakt/index.html",
    "dist/polityka-prywatnosci/index.html",
    "dist/polityka-cookies/index.html",
    "dist/regulamin/index.html",
  ];
  const nonCanonicalHrefs = /href="\/(kontakt|polityka-prywatnosci|polityka-cookies|regulamin)"(?!\/)/i;

  for (const page of pages) {
    assert.doesNotMatch(read(page), nonCanonicalHrefs, page);
  }
});

test("below-fold islands and compact hero-image candidates stay explicit", () => {
  const page = read("src/pages/index.astro");
  assert.match(page, /<ProcessIsland client:visible\s*\/>/);
  assert.match(page, /<PortfolioCarousel client:visible\s*\/>/);

  for (const asset of [
    "logo-card-cutout-420.webp",
    "poster-cutout-420.webp",
    "tool-rail-cutout-240.webp",
    "notebook-cutout-450.webp",
    "cup-cutout-360.webp",
  ]) {
    assert.ok(fs.existsSync(path.join(root, "public/assets/nowaweb/hero", asset)), asset);
    assert.match(page, new RegExp(asset));
  }
});
