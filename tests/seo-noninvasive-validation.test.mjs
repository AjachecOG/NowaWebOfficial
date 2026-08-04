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
    "dist/o-nas/index.html",
    "dist/uslugi/index.html",
    "dist/uslugi/strony-firmowe/index.html",
    "dist/realizacje/index.html",
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

test("homepage targets the service clearly in title, description and h1", () => {
  const page = read("dist/index.html");

  assert.match(page, /<title>Tworzenie stron internetowych dla firm \| NowaWeb<\/title>/i);
  assert.match(page, /<meta name="description" content="[^"]*strony internetowe dla firm/i);
  assert.match(page, /<h1\b[^>]*aria-label="Strony internetowe dla firm"/i);
});

test("sitemap includes real offer and trust pages but omits utility pages", () => {
  const sitemap = read("dist/sitemap-0.xml");

  for (const url of [
    "https://nowaweb.pl/",
    "https://nowaweb.pl/o-nas/",
    "https://nowaweb.pl/uslugi/",
    "https://nowaweb.pl/uslugi/strony-firmowe/",
    "https://nowaweb.pl/uslugi/landing-page/",
    "https://nowaweb.pl/realizacje/",
    "https://nowaweb.pl/kontakt/",
  ]) {
    assert.match(sitemap, new RegExp(`<loc>${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</loc>`));
  }

  assert.doesNotMatch(sitemap, /\/dziekujemy\//i);
  assert.doesNotMatch(sitemap, /\/404/i);
});

test("new indexable pages have self-canonicals and index directives", () => {
  const pages = new Map([
    ["dist/o-nas/index.html", "https://nowaweb.pl/o-nas/"],
    ["dist/uslugi/index.html", "https://nowaweb.pl/uslugi/"],
    ["dist/uslugi/strony-firmowe/index.html", "https://nowaweb.pl/uslugi/strony-firmowe/"],
    ["dist/realizacje/index.html", "https://nowaweb.pl/realizacje/"],
  ]);

  for (const [file, canonical] of pages) {
    const html = read(file);
    assert.match(html, new RegExp(`<link rel="canonical" href="${canonical}"`), file);
    assert.match(html, /<meta name="robots" content="index, follow, max-image-preview:large"/i, file);
    assert.doesNotMatch(html, /noindex/i, file);
  }
});

test("generated JSON-LD is valid and service pages identify their service", () => {
  const pages = [
    "dist/index.html",
    "dist/o-nas/index.html",
    "dist/uslugi/index.html",
    "dist/uslugi/strony-firmowe/index.html",
    "dist/realizacje/index.html",
  ];

  for (const file of pages) {
    const html = read(file);
    const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
    assert.ok(match, `JSON-LD missing in ${file}`);
    const data = JSON.parse(match[1]);
    assert.equal(data["@context"], "https://schema.org", file);
    assert.ok(Array.isArray(data["@graph"]), file);
    assert.ok(data["@graph"].some((node) => node["@id"] === "https://nowaweb.pl/#organization"), file);
  }

  const serviceHtml = read("dist/uslugi/strony-firmowe/index.html");
  const serviceData = JSON.parse(
    serviceHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)[1],
  );
  assert.ok(serviceData["@graph"].some((node) => node["@type"] === "Service"));
});

test("below-fold islands and compact hero-image candidates stay explicit", () => {
  const page = read("src/pages/index.astro");
  const billboard = read("src/scripts/monitor-billboard.ts");
  assert.match(page, /<ProcessIsland client:visible\s*\/>/);
  assert.match(page, /<PortfolioCarousel client:visible\s*\/>/);
  assert.match(page, /<BrandFlipCard client:visible\s*\/>/);
  assert.match(page, /<TypewriterStatement client:visible\s*\/>/);
  assert.match(page, /<ServiceCardMotion client:idle\s*\/>/);
  const firstGlitchDelay = Number(billboard.match(/FIRST_GLITCH_MS\s*=\s*(\d+)/)?.[1]);
  assert.ok(firstGlitchDelay >= 5000, "billboard must not swap the LCP image during initial load");

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
