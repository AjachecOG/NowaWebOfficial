import sharp from "sharp";

const jobs = [
  ["logo-card-cutout.webp", "logo-card-cutout-420.webp", 420],
  ["poster-cutout.webp", "poster-cutout-420.webp", 420],
  ["tool-rail-cutout.webp", "tool-rail-cutout-240.webp", 240],
  ["notebook-cutout.webp", "notebook-cutout-450.webp", 450],
  ["cup-cutout.webp", "cup-cutout-360.webp", 360],
];

for (const [input, output, width] of jobs) {
  await sharp(`public/assets/nowaweb/hero/${input}`)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(`public/assets/nowaweb/hero/${output}`);
}
