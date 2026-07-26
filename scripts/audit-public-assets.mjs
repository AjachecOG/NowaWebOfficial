import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicRoot = path.join(root, "public", "assets", "nowaweb");
const srcRoot = path.join(root, "src");

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function readAllSource() {
  return walk(srcRoot)
    .filter((f) => /\.(astro|tsx|ts|js|css|mjs)$/.test(f))
    .map((f) => fs.readFileSync(f, "utf8"))
    .join("\n");
}

const source = readAllSource();
const assets = walk(publicRoot);
const unused = [];
const used = [];

for (const file of assets) {
  const rel = "/" + path.relative(path.join(root, "public"), file).replaceAll("\\", "/");
  if (source.includes(rel)) used.push(rel);
  else unused.push({ rel, mb: +(fs.statSync(file).size / 1e6).toFixed(2) });
}

console.log("USED", used.length);
console.log("UNUSED", unused.length, "MB", unused.reduce((s, u) => s + u.mb, 0).toFixed(1));
for (const u of unused.sort((a, b) => b.mb - a.mb)) {
  console.log(`  ${u.mb.toFixed(2)}  ${u.rel}`);
}
