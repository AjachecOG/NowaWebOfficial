import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
const root = path.resolve(import.meta.dirname, '..', 'dist');
const routes = ['strony-internetowe-dla-firm', 'landing-page', 'modernizacja-stron', 'opieka-nad-strona', 'o-nas', 'cennik', 'realizacje', 'realizacje/cakepops', 'realizacje/new-york-rolls', 'realizacje/atmo-vision'];
const readPage = route => fs.readFileSync(path.join(root, route, 'index.html'), 'utf8');

test('all planned offers and projects are built with unique canonical metadata and real images', () => {
  const titles = new Set();
  const descriptions = new Set();
  const sitemap = fs.readFileSync(path.join(root, 'sitemap-0.xml'), 'utf8');
  for (const route of routes) {
    assert.ok(fs.existsSync(path.join(root, route, 'index.html')), `Missing public page: ${route}`);
    const html = readPage(route);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, route);
    assert.ok(html.includes(`rel="canonical" href="https://nowaweb.pl/${route}/"`), route);
    assert.ok(sitemap.includes(`<loc>https://nowaweb.pl/${route}/</loc>`), route);
    assert.doesNotMatch(html, /content="noindex/);
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
    const description = html.match(/name="description" content="([^"]+)"/)?.[1];
    assert.ok(title && !titles.has(title), `Duplicate/missing title: ${route}`);
    assert.ok(description && !descriptions.has(description), `Duplicate/missing description: ${route}`);
    titles.add(title); descriptions.add(description);
    for (const [, src] of html.matchAll(/<img\b[^>]*src="(\/[^"?]+)"/g)) {
      assert.ok(fs.existsSync(path.join(root, src)), `Missing image ${src} on ${route}`);
    }
    const image = html.match(/property="og:image" content="([^"]+)"/)?.[1];
    assert.ok(image && fs.existsSync(path.join(root, new URL(image).pathname)), `Missing OG image: ${route}`);
  }
});

test('all generated internal page links and fragments resolve', () => {
  for (const route of ['', ...routes, 'kontakt']) {
    const html = readPage(route);
    for (const [, href] of html.matchAll(/<a\b[^>]*href="([^" ]+)"/g)) {
      if (!href.startsWith('/') && !href.startsWith('#')) continue;
      const url = new URL(href, `https://nowaweb.pl/${route ? route + '/' : ''}`);
      const file = path.extname(url.pathname) ? path.join(root, url.pathname) : path.join(root, url.pathname, 'index.html');
      assert.ok(fs.existsSync(file), `${route}: broken link ${href}`);
      if (url.hash) {
        const target = fs.readFileSync(file, 'utf8');
        assert.ok(target.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${route}: broken fragment ${href}`);
      }
    }
  }
});

test('home and services expose FAQ answers in HTML without client execution', () => {
  for (const route of ['', ...routes.slice(0, 4)]) {
    const html = readPage(route);
    assert.ok((html.match(/<details\b/g) || []).length >= 5, `Missing FAQ answers on ${route || 'home'}`);
    assert.match(html, /<summary\b[^>]*>.+?<\/summary>/s);
  }
});

test('site identity stays stable across pages and structured data is parseable', () => {
  let identity;
  for (const route of ['', ...routes, 'kontakt']) {
    const html = readPage(route);
    const graphs = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));
    const site = graphs.flatMap(g => g['@graph'] || [g]).find(g => g['@type'] === 'WebSite');
    assert.ok(site, route);
    if (!identity) identity = site;
    assert.deepEqual(site, identity, `WebSite identity changed on ${route}`);
  }
});
