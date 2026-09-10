import sharp from 'sharp';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

// Retain full-size originals for high-density displays and generate smaller
// candidates so phones do not download desktop-size project screenshots.
for (const group of ['services', 'portfolio']) {
  const dir = `public/assets/nowaweb/${group}`;
  const files = (await readdir(dir)).filter(name => name.endsWith('.webp') && !/-\d+\.webp$/.test(name));
  for (const file of files) {
    for (const width of [480, 800]) {
      const target = join(dir, file.replace('.webp', `-${width}.webp`));
      await sharp(join(dir, file)).resize({ width, withoutEnlargement: true }).webp({ quality: 84 }).toFile(target);
    }
  }
}
for (const number of [1, 2, 3]) {
  await sharp(`public/assets/nowaweb/hero/monitor-screen-${number}.webp`).resize({width:640}).webp({quality:88}).toFile(`public/assets/nowaweb/hero/monitor-screen-${number}-640.webp`);
}
console.log('Generated responsive services, portfolio and monitor images.');
