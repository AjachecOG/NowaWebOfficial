import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const jobs = [
  { in: "public/assets/nowaweb/hero/monitor-screen-1.png", out: "public/assets/nowaweb/hero/monitor-screen-1.webp", width: 1200 },
  { in: "public/assets/nowaweb/hero/monitor-screen-2.png", out: "public/assets/nowaweb/hero/monitor-screen-2.webp", width: 1200 },
  { in: "public/assets/nowaweb/hero/monitor-screen-3.png", out: "public/assets/nowaweb/hero/monitor-screen-3.webp", width: 1200 },
  { in: "public/assets/nowaweb/hero/logo-card-cutout.png", out: "public/assets/nowaweb/hero/logo-card-cutout.webp", width: 700 },
  { in: "public/assets/nowaweb/hero/poster-cutout.png", out: "public/assets/nowaweb/hero/poster-cutout.webp", width: 700 },
  { in: "public/assets/nowaweb/hero/tool-rail-cutout.png", out: "public/assets/nowaweb/hero/tool-rail-cutout.webp", width: 500 },
  { in: "public/assets/nowaweb/hero/notebook-cutout.png", out: "public/assets/nowaweb/hero/notebook-cutout.webp", width: 900 },
  { in: "public/assets/nowaweb/hero/cup-cutout.png", out: "public/assets/nowaweb/hero/cup-cutout.webp", width: 500 },
  { in: "public/assets/nowaweb/portfolio/cakepops.png", out: "public/assets/nowaweb/portfolio/cakepops.webp", width: 1400 },
  { in: "public/assets/nowaweb/portfolio/new-york-rolls.png", out: "public/assets/nowaweb/portfolio/new-york-rolls.webp", width: 1400 },
  { in: "public/assets/nowaweb/portfolio/atmo-vision.png", out: "public/assets/nowaweb/portfolio/atmo-vision.webp", width: 1400 },
  { in: "public/assets/nowaweb/services/corporate-websites.png", out: "public/assets/nowaweb/services/corporate-websites.webp", width: 900 },
  { in: "public/assets/nowaweb/services/landing-page.png", out: "public/assets/nowaweb/services/landing-page.webp", width: 900 },
  { in: "public/assets/nowaweb/services/one-page.png", out: "public/assets/nowaweb/services/one-page.webp", width: 900 },
  { in: "public/assets/nowaweb/services/website-refresh.png", out: "public/assets/nowaweb/services/website-refresh.webp", width: 900 },
  { in: "public/assets/nowaweb/services/ux-copywriting.png", out: "public/assets/nowaweb/services/ux-copywriting.webp", width: 900 },
  { in: "public/assets/nowaweb/services/care-growth.png", out: "public/assets/nowaweb/services/care-growth.webp", width: 900 },
];

for (const job of jobs) {
  if (!fs.existsSync(job.in)) {
    console.warn("missing", job.in);
    continue;
  }
  await sharp(job.in)
    .resize({ width: job.width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(job.out);
  const before = fs.statSync(job.in).size;
  const after = fs.statSync(job.out).size;
  console.log(path.basename(job.out), `${(before / 1e6).toFixed(2)}MB -> ${(after / 1e6).toFixed(2)}MB`);
}
