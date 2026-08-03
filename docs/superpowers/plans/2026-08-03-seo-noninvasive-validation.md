# SEO Non-Invasive Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a reversible branch that corrects sitemap and canonical-link signals and lowers avoidable mobile work without changing the public design or publishing the branch.

**Architecture:** Keep all existing routes and visual components. Add one Node static-regression test that exercises generated output and the small source-level hydration contract. The only runtime changes are sitemap serialization, canonical href literals, below-fold island hydration, and responsive hero-image candidates.

**Tech Stack:** Astro 7 static output, React 19 islands, Node.js built-in test runner, Sharp 0.35, Lighthouse CLI.

## Global Constraints

- Work only in branch `codex/seo-noninvasive-validation` and its linked worktree.
- Do not merge, push, deploy, edit `master`, alter copy, add routes, change forms, or add dependencies.
- Preserve the existing hero composition, animations, navigation behavior, contact flow, desktop asset candidates, and public URL structure.
- Keep the primary monitor image eager and high priority; it is the current LCP candidate.
- Derive mobile hero candidates from the committed WebP originals using Sharp at quality 82.
- Report measured Lighthouse results; do not claim a target is met without a fresh run.

---

### Task 1: Add a failing SEO regression contract

**Files:**
- Create: `tests/seo-noninvasive-validation.test.mjs`
- Modify: none
- Test: `tests/seo-noninvasive-validation.test.mjs`, `tests/security-hardening.test.mjs`

**Interfaces:**
- Consumes: generated `dist/` from `npm run build`, source page at `src/pages/index.astro`, and five generated hero assets.
- Produces: a repeatable `node --test` contract for sitemap dates, canonical hrefs, deferred islands, and responsive candidates.

- [ ] **Step 1: Write the failing test**

Create `tests/seo-noninvasive-validation.test.mjs` with this content:

```js
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
```

- [ ] **Step 2: Build the current branch and verify the test fails for the intended gaps**

Run:

```powershell
npm run build
node --test tests/seo-noninvasive-validation.test.mjs
```

Expected: the sitemap test fails because every URL has `lastmod`; the link test fails on slashless internal page URLs; the island/image test fails because the below-fold islands use `client:load` and compact candidates do not exist.

- [ ] **Step 3: Commit the red test**

```powershell
git add tests/seo-noninvasive-validation.test.mjs
git commit -m "test: cover non-invasive SEO contract"
```

### Task 2: Correct sitemap metadata and canonical internal hrefs

**Files:**
- Modify: `astro.config.mjs`
- Modify: `src/data/site.ts`
- Modify: `src/components/SiteHeader.astro`
- Modify: `src/components/MobileNav.tsx`
- Modify: `src/components/ContactForm.astro`, `src/components/CookieConsent.tsx`
- Modify: `src/pages/404.astro`, `src/pages/dziekujemy.astro`, and the three legal pages
- Test: `tests/seo-noninvasive-validation.test.mjs`

**Interfaces:**
- Consumes: Task 1 contract and existing trailing-slash canonical URLs.
- Produces: sitemap entries without synthetic `lastmod` and navigation that links directly to canonical route URLs.

- [ ] **Step 1: Remove only the synthetic sitemap date**

In `astro.config.mjs`, delete only this line from `serialize(item)`:

```js
item.lastmod = new Date();
```

Keep the existing filter, `changefreq`, priority calculation, `site`, and static-output configuration intact.

- [ ] **Step 2: Change the existing page href literals to canonical forms**

Use these exact path values:

```ts
// src/data/site.ts
{ href: "/kontakt/", label: "Kontakt" },
{ href: "/polityka-prywatnosci/", label: "Polityka prywatnoĹ›ci" },
{ href: "/polityka-cookies/", label: "Polityka cookies" },
{ href: "/regulamin/", label: "Regulamin" },
```

In `SiteHeader.astro`, `MobileNav.tsx`, the form, cookie notice, thank-you and 404 pages, and legal pages, change each page-route target to its trailing-slash form. Keep section links such as `/#proces` unchanged.

- [ ] **Step 3: Build and verify the first two behaviors turn green**

Run:

```powershell
npm run build
node --test tests/seo-noninvasive-validation.test.mjs
```

Expected: the sitemap and canonical-href tests pass; the deferred-island/image test still fails.

- [ ] **Step 4: Commit the metadata/navigation patch**

```powershell
git add astro.config.mjs src/data/site.ts src/components/SiteHeader.astro src/components/MobileNav.tsx
git commit -m "fix: align sitemap and canonical internal links"
```

### Task 3: Reduce below-fold JavaScript and mobile hero-image transfer

**Files:**
- Create: `scripts/generate-responsive-hero-assets.mjs`
- Create: `public/assets/nowaweb/hero/logo-card-cutout-420.webp`
- Create: `public/assets/nowaweb/hero/poster-cutout-420.webp`
- Create: `public/assets/nowaweb/hero/tool-rail-cutout-240.webp`
- Create: `public/assets/nowaweb/hero/notebook-cutout-450.webp`
- Create: `public/assets/nowaweb/hero/cup-cutout-360.webp`
- Modify: `src/pages/index.astro`
- Test: `tests/seo-noninvasive-validation.test.mjs`

**Interfaces:**
- Consumes: the existing five hero WebP files and Sharp already present in dev dependencies.
- Produces: deterministic smaller WebP candidates and source markup that lets the browser select them on narrow screens.

- [ ] **Step 1: Write the responsive-asset generator**

Create `scripts/generate-responsive-hero-assets.mjs`:

```js
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
```

- [ ] **Step 2: Generate the committed candidates and confirm they are smaller than the originals**

Run:

```powershell
node scripts/generate-responsive-hero-assets.mjs
Get-Item public\assets\nowaweb\hero\*-cutout-*.webp | Select-Object Name,Length
```

Expected: all five new candidate files exist and each is smaller than its source WebP.

- [ ] **Step 3: Update only the five decorative hero images with `srcset` and `sizes`**

In `src/pages/index.astro`, retain each existing `src`, `alt`, dimensions, loading mode and decoding mode. Add the following responsive attributes to their matching elements:

```astro
<!-- logo card -->
srcset="/assets/nowaweb/hero/logo-card-cutout-420.webp 420w, /assets/nowaweb/hero/logo-card-cutout.webp 700w"
sizes="(max-width: 760px) 27vw, 23vw"

<!-- poster -->
srcset="/assets/nowaweb/hero/poster-cutout-420.webp 420w, /assets/nowaweb/hero/poster-cutout.webp 700w"
sizes="(max-width: 760px) 28vw, 22vw"

<!-- tool rail -->
srcset="/assets/nowaweb/hero/tool-rail-cutout-240.webp 240w, /assets/nowaweb/hero/tool-rail-cutout.webp 500w"
sizes="(max-width: 760px) 13vw, 10vw"

<!-- notebook -->
srcset="/assets/nowaweb/hero/notebook-cutout-450.webp 450w, /assets/nowaweb/hero/notebook-cutout.webp 900w"
sizes="(max-width: 760px) 28vw, 22vw"

<!-- cup -->
srcset="/assets/nowaweb/hero/cup-cutout-360.webp 360w, /assets/nowaweb/hero/cup-cutout.webp 500w"
sizes="(max-width: 760px) 29vw, 21vw"
```

Change only these island directives:

```astro
<ProcessIsland client:visible />
<PortfolioCarousel client:visible />
```

Do not change the monitor image priority, any CSS, markup order, animation code, or other hydration directives.

- [ ] **Step 4: Verify the full regression contract turns green**

Run:

```powershell
npm run build
node --test tests/seo-noninvasive-validation.test.mjs
```

Expected: all three tests pass.

- [ ] **Step 5: Commit the performance patch**

```powershell
git add scripts/generate-responsive-hero-assets.mjs public/assets/nowaweb/hero src/pages/index.astro
git commit -m "perf: defer below-fold islands and size hero assets"
```

### Task 4: Validate the isolated version and prepare the review handoff

**Files:**
- Modify: none unless a command exposes a regression in Tasks 1–3.
- Test: existing `tests/security-hardening.test.mjs`, new SEO contract, generated production output, and Lighthouse JSON reports.

**Interfaces:**
- Consumes: completed implementation commits and static `dist/` output.
- Produces: exact before/after evidence and an unmerged branch ready for accept-or-delete review.

- [ ] **Step 1: Run build and all automated tests**

Run:

```powershell
npm run build
node --test tests/security-hardening.test.mjs tests/seo-noninvasive-validation.test.mjs
```

Expected: build completes successfully and every test passes.

- [ ] **Step 2: Inspect built SEO artifacts**

Run:

```powershell
Select-String -Path dist\sitemap-0.xml -Pattern "lastmod"
rg -n 'href="\/(kontakt|polityka-prywatnosci|polityka-cookies|regulamin)"(?!\/)' dist
```

Expected: both commands return no matches.

- [ ] **Step 3: Run local visual and Lighthouse comparison**

Start the static preview in a hidden process, wait until it returns HTTP 200, then write reports under ignored `output/lighthouse/`:

```powershell
Start-Process -FilePath npm -ArgumentList "run","preview","--","--port","4321" -WindowStyle Hidden
npx --yes lighthouse http://127.0.0.1:4321 --only-categories=performance --only-categories=accessibility --only-categories=best-practices --only-categories=seo --output=json --output-path=output/lighthouse/mobile.json --chrome-flags="--headless=new"
npx --yes lighthouse http://127.0.0.1:4321 --preset=desktop --only-categories=performance --only-categories=accessibility --only-categories=best-practices --only-categories=seo --output=json --output-path=output/lighthouse/desktop.json --chrome-flags="--headless=new"
```

Capture mobile and desktop screenshots of `http://127.0.0.1:4321` and compare them with the audited production appearance. Stop only the preview process started for this task after capture.

Expected: no visible layout or interaction regression; record the exact performance, LCP, CLS and accessibility scores against the previous mobile 68 / 5.9 s LCP and desktop 98 / 1.1 s LCP laboratory baseline.

- [ ] **Step 4: Review the complete diff and branch status**

Run:

```powershell
git diff master...HEAD --check
git diff --stat master...HEAD
git status --short
git log --oneline master..HEAD
```

Expected: no whitespace errors, no uncommitted files other than ignored validation output, and commits limited to the documented scope.

- [ ] **Step 5: Commit only a necessary regression fix, otherwise preserve the review state**

If validation revealed a defect, add a failing test first, implement the smallest correction, rerun Steps 1–4, then commit it with a precise `fix:` message. Otherwise do not add a cosmetic commit. Leave the branch unmerged for the user’s accept-or-delete decision.
