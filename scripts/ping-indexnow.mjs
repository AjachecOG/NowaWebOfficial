#!/usr/bin/env node
/**
 * Ping IndexNow (Bing / compatible engines) after deploy.
 * Usage: node scripts/ping-indexnow.mjs
 * Optional: INDEXNOW_HOST=nowaweb.pl INDEXNOW_KEY=... node scripts/ping-indexnow.mjs
 */
import fs from "node:fs";
import path from "node:path";

const host = process.env.INDEXNOW_HOST || "nowaweb.pl";
const key = process.env.INDEXNOW_KEY || "nowaweb-indexnow-7f3c9a2e1b84";
const keyLocation = `https://${host}/${key}.txt`;
const sitemapPath = path.join(process.cwd(), "dist", "sitemap-0.xml");

if (!fs.existsSync(sitemapPath)) {
  console.error("Missing dist/sitemap-0.xml — run npm run build first.");
  process.exit(1);
}

const xml = fs.readFileSync(sitemapPath, "utf8");
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

if (urls.length === 0) {
  console.error("No URLs found in sitemap.");
  process.exit(1);
}

const payload = {
  host,
  key,
  keyLocation,
  urlList: urls.slice(0, 100),
};

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

console.log(`IndexNow status ${response.status} for ${payload.urlList.length} URLs`);
if (!response.ok) {
  console.error(await response.text());
  process.exit(1);
}
