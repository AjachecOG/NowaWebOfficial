import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(root, "dist");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath, files);
    else files.push(fullPath);
  }
  return files;
}

test("built contact forms use Netlify controls and bounded fields", () => {
  for (const relativePath of ["dist/index.html", "dist/kontakt/index.html"]) {
    const html = read(relativePath);

    assert.match(html, /<form\b[^>]*data-netlify="true"/i, relativePath);
    assert.match(html, /data-netlify-honeypot="bot-field"/i, relativePath);
    assert.match(html, /<input\b[^>]*name="name"[^>]*maxlength="120"/i, relativePath);
    assert.match(html, /<input\b[^>]*name="email"[^>]*maxlength="254"/i, relativePath);
    assert.match(html, /<input\b[^>]*name="phone"[^>]*maxlength="32"/i, relativePath);
    assert.match(html, /<textarea\b[^>]*name="message"[^>]*maxlength="4000"/i, relativePath);
    assert.doesNotMatch(html, /<input\b[^>]*name="privacy"/i, relativePath);
    assert.match(html, /href="\/polityka-prywatnosci\/"/i, relativePath);
  }
});

test("built runtime contains no Cloudflare Turnstile integration", () => {
  const runtime = walk(distRoot)
    .filter((file) => [".html", ".js"].includes(path.extname(file)))
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");

  assert.doesNotMatch(runtime, /turnstile|challenges\.cloudflare\.com/i);
});

test("Netlify config enforces the hardened CSP contract", () => {
  const config = read("netlify.toml");
  const policy = config.match(/^\s*Content-Security-Policy\s*=\s*"([^"]+)"/m)?.[1];

  assert.ok(policy, "Content-Security-Policy header must be configured");
  assert.doesNotMatch(config, /Content-Security-Policy-Report-Only/);
  assert.match(policy, /base-uri 'self'/);
  assert.match(policy, /object-src 'none'/);
  assert.match(policy, /frame-ancestors 'none'/);
  assert.match(policy, /form-action 'self'/);
  assert.doesNotMatch(policy, /cloudflare/i);
});

test("JSON embedded in HTML cannot close its script element", async () => {
  const moduleUrl = pathToFileURL(path.join(root, "src/utils/safe-json.mjs")).href;
  const { safeJsonForHtml } = await import(moduleUrl);
  const payload = { value: "</script><script>alert(1)</script>" };
  const serialized = safeJsonForHtml(payload);

  assert.doesNotMatch(serialized, /</);
  assert.deepEqual(JSON.parse(serialized), payload);
});

