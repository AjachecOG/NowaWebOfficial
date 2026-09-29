import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const dist = path.resolve(import.meta.dirname, '..', 'dist');
const htmlPages = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(directory, entry.name);
  return entry.isDirectory() ? htmlPages(file) : entry.name.endsWith('.html') ? [file] : [];
});

test('generated pages show contact channels without former company identity', () => {
  const pages = htmlPages(dist);

  for (const page of pages) {
    const html = fs.readFileSync(page, 'utf8');
    assert.ok(!/Revela|Muchoborska|8971850142|0000711172|369088470|Wrocławia-Fabrycznej/i.test(html), page);
    assert.match(html, /kontakt@nowaweb\.pl/, page);
    assert.match(html, /\+48 794 346 581/, page);

    for (const [, raw] of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)) {
      const graph = JSON.parse(raw);
      assert.doesNotMatch(JSON.stringify(graph), /legalName|streetAddress|postalCode|taxID|vatID/, page);
    }
  }
});
