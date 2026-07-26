# Production Readiness Fix Plan — NowaWeb

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status (2026-07-25):** fazy 0–8 **WDROŻONE**. `dist` spadł do ~1.5 MB. Gate’y build/validate PASS.

**Pozostałe ops (poza kodem):**
1. Cloudflare Turnstile: site key → `PUBLIC_TURNSTILE_SITE_KEY`, secret w Netlify
2. Netlify Forms: powiadomienia na `kontakt@nowaweb.pl` dla `kontakt` + `kontakt-home`
3. Live test submit na produkcji
4. Domena + HTTPS

**Goal:** Domknąć blokery produkcyjne (asset weight, mobile nav, SEO, formularz + Turnstile, cookies, headers, 404) bez psucia layoutu, animacji ani istniejących walidacji.

**Architecture:** Praca w fazach. Każda faza kończy się zielonym `npm run build` + odpowiednimi `validate:*`. Najpierw usuwamy martwy ciężar i brakujące fundamenty (SEO/nav), potem formularz/Turnstile i hardening. Nie ruszamy copy marketingowego ani GSAP/process/portfolio logiki poza tym, co konieczne.

**Tech Stack:** Astro static, React islands, Netlify Forms, Cloudflare Turnstile, Netlify headers, WebP assets

**Źródło audytu:** rozmowa 2026-07-25 + pomiar `public/assets/nowaweb/` (~105 MB w `dist`)

---

## Safety protocol (obowiązkowe przed każdą fazą i po niej)

### Do NOT touch (chyba że faza explicite każe)
- Teksty marketingowe / AI-copy (już przepisane)
- `ProcessIsland.tsx` / `ProcessIsland.css` motion (poza ewentualnym `loading` na obrazkach — brak obrazków z public)
- `PortfolioCarousel.tsx` logika pozycji / transition names
- `SiteMotion.tsx` smooth-scroll / sequences
- Dane firmy w `src/data/site.ts` (email/telefon/NIP) — tylko czytaj
- Strony prawne treść merytoryczna (tylko jeśli faza cookies wymaga 1–2 zdań o Turnstile)

### Regression gates (uruchamiaj po KAŻDEJ fazie)

```bash
npm run build
npm run validate:process
npm run validate:portfolio
```

Expected: wszystkie PASS, build 5 stron.

Dodatkowo po fazach UI:
- Desktop 1440: header, hero, nav hash scroll, comparison, process, portfolio, CTA form open
- Mobile 390: **menu działa**, CTA widoczne, formularz używalny

### Rollback rule
Jeśli gate pada → cofnij tylko pliki z bieżącej fazy (`git checkout -- <paths>`), nie mieszaj faz.

### Commit rule
Jeden commit na zakończoną fazę (po zielonych gate’ach). Nie commitować sekretów Turnstile.

---

## File map (co powstanie / co się ruszy)

| Path | Rola |
|---|---|
| `src/components/SiteHeader.astro` | Wspólny header + mobile menu (używany przez index i BaseLayout) |
| `src/components/SiteHead.astro` | Wspólny `<head>`: favicon, OG, canonical, JSON-LD |
| `src/components/MobileNav.tsx` | Island: open/close, Escape, focus trap light |
| `src/components/ContactForm.astro` | + Turnstile widget + env site key |
| `src/components/CookieConsent.tsx` | Uczciwy copy bez fake analytics |
| `src/layouts/BaseLayout.astro` | Używa SiteHead + SiteHeader |
| `src/pages/index.astro` | Używa SiteHead + SiteHeader; hero loading/webp |
| `src/pages/404.astro` | Branded 404 |
| `src/pages/kontakt.astro` | Success UX (ukryj form gdy sent) |
| `astro.config.mjs` | `site`, `@astrojs/sitemap` |
| `public/robots.txt` | Allow + sitemap URL |
| `public/favicon.svg` (+ opcjonalnie png) | Ikona |
| `public/assets/nowaweb/og-default.jpg` | OG image 1200×630 |
| `netlify.toml` | Headers + opcjonalnie Turnstile env note |
| `scripts/audit-public-assets.mjs` | Lista używanych vs martwych assetów |
| `_archive/assets-unused/` | Przeniesione nieużywane foldery (NIE w `public/`) |
| `.env.example` | `PUBLIC_TURNSTILE_SITE_KEY=` (bez sekretów) |

---

## Phase 0 — Baseline freeze

### Task 0: Capture green baseline

**Files:** none (read-only)

- [ ] **Step 1: Run gates**

```bash
npm run build
npm run validate:process
npm run validate:portfolio
```

Expected: PASS.

- [ ] **Step 2: Record baseline sizes**

```bash
node -e "const fs=require('fs');const path=require('path');function walk(d,a=[]){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p,a);else a.push(p);}return a;} const files=walk('dist'); const bytes=files.reduce((s,f)=>s+fs.statSync(f).size,0); console.log('dist files',files.length,'MB',(bytes/1e6).toFixed(1));"
```

Zapisz wynik w notatce fazy (np. `dist ~XX MB`) — po Phase 1 musi spaść.

- [ ] **Step 3: Commit nothing** — to tylko checkpoint.

---

## Phase 1 — Asset hygiene (największy zysk, najmniejsze ryzyko UI)

**Cel:** Wyciągnąć z `public/` foldery nieużywane w `src/`, żeby Netlify ich nie publikował.

### Potwierdzone nieużywane (grep 2026-07-25 — zero referencji w `src/`):
- `public/assets/nowaweb/refs/` (~14.5 MB)
- `public/assets/nowaweb/offer/` (~7.9 MB)
- `public/assets/nowaweb/why/` (~7.5 MB)
- `public/assets/nowaweb/support/` (~9.2 MB)
- `public/assets/nowaweb/process/` (~6.5 MB)
- `public/assets/nowaweb/cta/` (~7.7 MB)
- `public/assets/nowaweb/compare/` (~5.2 MB)
- `public/assets/nowaweb/cards/` (~1.3 MB)
- `public/assets/nowaweb/poland-outline.svg`

**NIE ruszać (używane):**
- `hero/` (cutouts + monitor-screen-1/2/3)
- `services/*.png` (6 plików)
- `portfolio/cakepops.png`, `new-york-rolls.png`, `atmo-vision.png`

### Task 1: Add asset audit script

**Files:**
- Create: `scripts/audit-public-assets.mjs`
- Modify: `package.json` (script `audit:assets`)

- [ ] **Step 1: Create audit script**

```js
// scripts/audit-public-assets.mjs
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

if (unused.length === 0) process.exit(0);
```

- [ ] **Step 2: Wire script**

In `package.json` scripts add:

```json
"audit:assets": "node scripts/audit-public-assets.mjs"
```

- [ ] **Step 3: Run**

```bash
npm run audit:assets
```

Expected: lista UNUSED zawiera m.in. `/assets/nowaweb/refs/...`.

### Task 2: Move unused folders out of `public/`

**Files:**
- Move: listed folders → `_archive/assets-unused/nowaweb/`
- Modify: `.gitignore` only if `_archive/` should stay local (prefer **commit archive** OR gitignore — wybór: **gitignore `_archive/`** żeby nie puchnąć repo; foldery i tak nie idą na Netlify)

- [ ] **Step 1: Create archive dir and move**

PowerShell:

```powershell
New-Item -ItemType Directory -Force -Path "_archive/assets-unused/nowaweb" | Out-Null
$dirs = @("refs","offer","why","support","process","cta","compare","cards")
foreach ($d in $dirs) {
  $src = "public/assets/nowaweb/$d"
  if (Test-Path $src) { Move-Item $src "_archive/assets-unused/nowaweb/$d" }
}
if (Test-Path "public/assets/nowaweb/poland-outline.svg") {
  Move-Item "public/assets/nowaweb/poland-outline.svg" "_archive/assets-unused/nowaweb/poland-outline.svg"
}
```

- [ ] **Step 2: Add gitignore entry**

Append to `.gitignore`:

```
_archive/
```

- [ ] **Step 3: Also archive unused portfolio extras** (keep only 3 used)

```powershell
New-Item -ItemType Directory -Force -Path "_archive/assets-unused/nowaweb/portfolio-extra" | Out-Null
Get-ChildItem "public/assets/nowaweb/portfolio" -File | Where-Object {
  $_.Name -notin @("cakepops.png","new-york-rolls.png","atmo-vision.png")
} | Move-Item -Destination "_archive/assets-unused/nowaweb/portfolio-extra/"
```

- [ ] **Step 4: Archive unused hero sources** (keep runtime cutouts + screens)

Keep in `public/.../hero/`:
- `logo-card-cutout.png`, `poster-cutout.png`, `tool-rail-cutout.png`
- `notebook-cutout.png`, `cup-cutout.png`
- `monitor-screen-1.png`, `monitor-screen-2.png`, `monitor-screen-3.png`

Move everything else in `hero/` (`.source.png`, archived, non-cutout duplicates) to `_archive/assets-unused/nowaweb/hero-extra/`.

- [ ] **Step 5: Gates**

```bash
npm run audit:assets
npm run build
npm run validate:process
npm run validate:portfolio
```

Expected: UNUSED blisko 0 (albo tylko świadomie zostawione); build PASS; `dist` MB wyraźnie niższe vs baseline.

- [ ] **Step 6: Visual smoke** — hero + services + portfolio images still load.

- [ ] **Step 7: Commit**

```bash
git add scripts/audit-public-assets.mjs package.json .gitignore public/assets/nowaweb
git commit -m "$(cat <<'EOF'
chore: remove unused public assets from deploy bundle

EOF
)"
```

---

## Phase 2 — Hero / services / portfolio image performance

**Cel:** Zmniejszyć LCP i wagę bez zmiany kompozycji.

### Task 3: Convert critical PNGs to WebP (keep PNG fallback temporarily OR replace paths)

**Preferred approach (bezpieczniejszy wizualnie):** wygeneruj `.webp` obok, zamień `src` na webp, PNG zostaw w `_archive` dopiero gdy webp wygląda OK.

**Files:**
- Create: `scripts/optimize-images.mjs` (używa `sharp` — dodać jako devDependency)
- Modify: `src/pages/index.astro` hero `<img>`
- Modify: `src/components/BrandFlipCard.tsx` image paths
- Modify: `src/components/PortfolioCarousel.tsx` project image paths
- Modify: services paths in `index.astro` data

- [ ] **Step 1: Install sharp**

```bash
npm install -D sharp
```

- [ ] **Step 2: Create optimizer**

```js
// scripts/optimize-images.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const jobs = [
  // hero — display widths approximate
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
  await sharp(job.in).resize({ width: job.width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(job.out);
  const before = fs.statSync(job.in).size;
  const after = fs.statSync(job.out).size;
  console.log(path.basename(job.out), `${(before / 1e6).toFixed(2)}MB -> ${(after / 1e6).toFixed(2)}MB`);
}
```

- [ ] **Step 3: Run optimizer**

```bash
node scripts/optimize-images.mjs
```

- [ ] **Step 4: Point code to `.webp`** (search-replace paths in `index.astro`, `BrandFlipCard.tsx`, `PortfolioCarousel.tsx`)

- [ ] **Step 5: Fix loading strategy in hero (`index.astro`)**

Rules:
- `monitor-screen-1.webp`: `loading="eager"` + `fetchpriority="high"` + explicit `width`/`height`
- `monitor-screen-2/3.webp`: `loading="lazy"` (billboard swaps in JS — first paint only needs #1)
- desk props (cup, notebook, poster, logo, tool-rail): `loading="lazy"` **except** if visible in LCP; safer: leave logo+monitor eager, rest lazy

Example:

```astro
<img
  class="product-monitor monitor-state is-active"
  src="/assets/nowaweb/hero/monitor-screen-1.webp"
  alt=""
  width="1200"
  height="780"
  loading="eager"
  fetchpriority="high"
  decoding="async"
/>
```

- [ ] **Step 6: Visual compare** — hero desk, flip card, 6 service backs, 3 portfolio cards. No broken images.

- [ ] **Step 7: Gates + commit**

```bash
npm run build && npm run validate:process && npm run validate:portfolio
```

```bash
git add public/assets/nowaweb src/pages/index.astro src/components/BrandFlipCard.tsx src/components/PortfolioCarousel.tsx scripts/optimize-images.mjs package.json package-lock.json
git commit -m "$(cat <<'EOF'
perf: convert critical assets to WebP and lazy-load non-LCP hero images

EOF
)"
```

**Stop condition:** jeśli którykolwiek cutout ma brzydką krawędź alpha w WebP → podnieś `quality` do 90 albo zostaw ten jeden plik jako PNG.

---

## Phase 3 — Mobile navigation (blocker UX)

**Cel:** Poniżej 1160px użytkownik nadal ma dostęp do sekcji.

### Task 4: Extract shared header + mobile menu

**Files:**
- Create: `src/components/SiteHeader.astro`
- Create: `src/components/MobileNav.tsx`
- Modify: `src/styles/global.css` (mobile menu styles; **nie usuwaj** istniejącego desktop nav)
- Modify: `src/pages/index.astro` (replace inline header)
- Modify: `src/layouts/BaseLayout.astro` (replace inline header)

- [ ] **Step 1: Create `MobileNav.tsx`**

Behavior:
- Button `Menu` / `Zamknij` visible only `<1160px` (CSS)
- Panel with same links as desktop
- `Escape` closes
- Lock body scroll when open
- On link click → close
- `aria-expanded`, `aria-controls`

```tsx
import { useEffect, useId, useState } from "react";

const links = [
  { href: "/#onas", label: "O nas" },
  { href: "/#uslugi", label: "Usługi" },
  { href: "/#proces", label: "Proces" },
  { href: "/#projekty", label: "Projekty" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="mobile-nav">
      <button
        type="button"
        className="mobile-nav__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Zamknij" : "Menu"}
      </button>
      <div
        id={panelId}
        className="mobile-nav__panel"
        hidden={!open}
        data-open={open ? "true" : "false"}
      >
        <nav aria-label="Menu mobilne">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>
        <a className="button primary" href="/kontakt" onClick={() => setOpen(false)}>
          Umów rozmowę
        </a>
      </div>
    </div>
  );
}
```

Note: on homepage, hash links `/#onas` are correct (same as BaseLayout). Index currently uses `#onas` — **normalize both to `/#onas`** so menu działa też z `/kontakt`.

- [ ] **Step 2: Create `SiteHeader.astro`**

```astro
---
import MobileNav from "./MobileNav";
---
<header class="site-header">
  <a class="brand" href="/" aria-label="NowaWeb">NowaWeb<span>.</span></a>
  <nav class="site-header__desktop-nav" aria-label="Główna nawigacja">
    <a href="/#onas">O nas</a>
    <a href="/#uslugi">Usługi</a>
    <a href="/#proces">Proces</a>
    <a href="/#projekty">Projekty</a>
    <a href="/kontakt">Kontakt</a>
  </nav>
  <a class="header-cta" href="/kontakt">Umów rozmowę</a>
  <MobileNav client:load />
</header>
```

- [ ] **Step 3: CSS** — keep existing `.site-header nav { display:none }` at 1160, but target `.site-header__desktop-nav` instead. Show `.mobile-nav` only ≤1160.

```css
.mobile-nav { display: none; }
@media (max-width: 1160px) {
  .site-header__desktop-nav { display: none; }
  .mobile-nav { display: block; justify-self: end; }
  .header-cta { display: none; } /* CTA jest w panelu mobilnym — albo zostaw oba; prefer: zostaw header-cta jeśli mieści się */
}
```

**Decision (bezpieczniejsza):** poniżej 1160 zostaw `header-cta` widoczne + hamburger; panel tylko z linkami sekcji. Wtedy nie chowaj CTA.

- [ ] **Step 4: Replace headers in `index.astro` and `BaseLayout.astro` with `<SiteHeader />`.**

- [ ] **Step 5: Test**
  - 1440px: wygląda jak wcześniej (desktop nav)
  - 390px: Menu otwiera panel, linki scrollują / nawigują, Escape zamyka
  - Smooth scroll z `SiteMotion` nadal działa dla `/#...` na homepage (hash na tej samej stronie)

- [ ] **Step 6: Gates + commit**

```bash
npm run build && npm run validate:process && npm run validate:portfolio
```

```bash
git add src/components/SiteHeader.astro src/components/MobileNav.tsx src/pages/index.astro src/layouts/BaseLayout.astro src/styles/global.css
git commit -m "$(cat <<'EOF'
feat: add mobile navigation menu for small screens

EOF
)"
```

---

## Phase 4 — SEO chrome (favicon, sitemap, robots, OG, canonical)

### Task 5: Shared head + sitemap

**Files:**
- Create: `src/components/SiteHead.astro`
- Create: `public/favicon.svg`
- Create: `public/robots.txt`
- Create: `public/assets/nowaweb/og-default.jpg` (export 1200×630 z brand frame — może być prosty canvas/PNG→JPG)
- Modify: `astro.config.mjs`
- Modify: `package.json` (`@astrojs/sitemap`)
- Modify: `BaseLayout.astro`, `index.astro`

- [ ] **Step 1: Install sitemap**

```bash
npm install @astrojs/sitemap
```

- [ ] **Step 2: Update `astro.config.mjs`**

```js
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://nowaweb.pl",
  integrations: [react(), sitemap()],
  output: "static",
  vite: {
    optimizeDeps: {
      include: ["@gsap/react", "gsap", "gsap/ScrollTrigger"],
    },
  },
});
```

- [ ] **Step 3: `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://nowaweb.pl/sitemap-index.xml
```

- [ ] **Step 4: Minimal `public/favicon.svg`** — niebieskie tło + białe „N” (prosty SVG, bez zewnętrznych fontów).

- [ ] **Step 5: `SiteHead.astro`**

```astro
---
import { site } from "../data/site";
type Props = {
  title: string;
  description: string;
  canonicalPath?: string;
};
const { title, description, canonicalPath = Astro.url.pathname } = Astro.props;
const canonical = new URL(canonicalPath, site.url).toString();
const ogImage = new URL("/assets/nowaweb/og-default.jpg", site.url).toString();
---
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="pl_PL" />
<meta property="og:site_name" content={site.brand} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={ogImage} />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImage} />
<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.brand,
  url: site.url,
  email: site.email,
  telephone: site.phoneDisplay,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.company.addressLine,
    postalCode: site.company.postalCode,
    addressLocality: site.company.city,
    addressCountry: "PL",
  },
  taxID: site.company.nip,
})} />
```

- [ ] **Step 6: Wire into `BaseLayout` + `index.astro` `<head>`** — usuń zduplikowane meta/title.

- [ ] **Step 7: Build and verify dist**

```bash
npm run build
```

Check:
- `dist/favicon.svg` exists
- `dist/robots.txt` exists
- `dist/sitemap-index.xml` exists
- `dist/index.html` contains `og:title`, `canonical`, JSON-LD

- [ ] **Step 8: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat: add sitemap, robots, favicon, and shared Open Graph head

EOF
)"
```

---

## Phase 5 — Contact forms + Cloudflare Turnstile

**Cel:** Spam protection bez psucia Netlify Forms.

### Task 6: Turnstile on ContactForm

**Files:**
- Modify: `src/components/ContactForm.astro`
- Create: `.env.example`
- Modify: `netlify.toml` (optional headers only; secrets w Netlify UI)
- Modify: `src/pages/polityka-prywatnosci.astro` — 1 zdanie o Turnstile jako procesorze antyspamowym (opcjonalnie w tej fazie)
- Modify: `src/pages/kontakt.astro` — better success UX

- [ ] **Step 1: Create Cloudflare Turnstile site (ops)**
  - Widget type: Managed
  - Domains: `nowaweb.pl`, `www.nowaweb.pl`, `localhost`
  - Copy **Site Key** → Netlify env `PUBLIC_TURNSTILE_SITE_KEY`
  - Copy **Secret Key** → Netlify env `TURNSTILE_SECRET_KEY` (używane przez Netlify native integration LUB edge function)

**Preferred Netlify path (least custom code):**
1. Netlify UI → Forms → Form detection on
2. Enable **Netlify + Turnstile** integration if available for the site
3. OR add Turnstile widget field `cf-turnstile-response` which Netlify can validate when integration enabled

**Code path (always add widget):**

```astro
---
const turnstileSiteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY;
---
<!-- existing fields -->
{turnstileSiteKey ? (
  <div class="contact-form__turnstile">
    <div class="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="light"></div>
  </div>
) : null}

<script is:inline src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
```

If `PUBLIC_TURNSTILE_SITE_KEY` missing in local dev → form still works (honeypot only). **Do not hard-fail build.**

- [ ] **Step 2: `.env.example`**

```
PUBLIC_TURNSTILE_SITE_KEY=
```

- [ ] **Step 3: Netlify ops checklist (document in commit message / plan status)**
  - [ ] Forms `kontakt` and `kontakt-home` appear after first prod deploy with forms
  - [ ] Notification email → `kontakt@nowaweb.pl`
  - [ ] Turnstile secret set
  - [ ] Live test submit from production domain

- [ ] **Step 4: Success UX on `kontakt.astro`**

When `sent`:
- show success message
- **hide** `<ContactForm />` (prevent fake URL from looking like editable success+form)
- add link „Wyślij kolejne zapytanie” → `/kontakt` bez query

```astro
{sent ? (
  <p class="contact-success" role="status">...</p>
  <p><a href="/kontakt">Wyślij kolejne zapytanie</a></p>
) : (
  <ContactForm formName="kontakt" />
)}
```

- [ ] **Step 5: Local verify**
  - Form markup still has `data-netlify="true"`, `form-name`, honeypot
  - Turnstile div present when env set
  - Build PASS without env (optional widget)

- [ ] **Step 6: Gates + commit** (no `.env` secrets)

```bash
git add src/components/ContactForm.astro src/pages/kontakt.astro .env.example
git commit -m "$(cat <<'EOF'
feat: add Cloudflare Turnstile slot to contact forms and tighten success UX

EOF
)"
```

---

## Phase 6 — Cookie banner honesty

### Task 7: Align banner with reality (no analytics yet)

**Files:**
- Modify: `src/components/CookieConsent.tsx`
- Modify: `src/pages/polityka-cookies.astro` (1–2 sentences if needed)

- [ ] **Step 1: Change banner copy** to state that currently only essential/local consent storage is used; optional analytics will appear only after being added.

Suggested title/body:
- Title: `Pliki cookies`
- Body: `Używamy niezbędnych zapisów w przeglądarce, żeby zapamiętać Twój wybór. Nie ładujemy teraz narzędzi analitycznych. Jeśli je dodamy, włączymy je dopiero po zgodzie.`

Buttons can stay `Tylko niezbędne` / `Akceptuję` (Akceptuję = future-ready consent flag already stored).

- [ ] **Step 2: Do NOT add GA/Plausible in this plan** (YAGNI until real need).

- [ ] **Step 3: Gates + commit**

```bash
git commit -m "$(cat <<'EOF'
fix: align cookie banner copy with current lack of analytics

EOF
)"
```

---

## Phase 7 — Security headers + 404

### Task 8: Harden `netlify.toml` + add 404 page

**Files:**
- Modify: `netlify.toml`
- Create: `src/pages/404.astro`

- [ ] **Step 1: Headers**

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
    Content-Security-Policy-Report-Only = "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; frame-src https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com;"
```

Start with **Report-Only** CSP. After 1 week bez naruszeń → przełącz na egzekwujące (osobny mini-task).

- [ ] **Step 2: `404.astro`** using `BaseLayout`, short message, links Home + Kontakt.

- [ ] **Step 3: Build, open `/nie-ma-takiej` on preview, confirm 404 page.**

- [ ] **Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
chore: add security headers and branded 404 page

EOF
)"
```

---

## Phase 8 — Dependency pinning (stability)

### Task 9: Pin versions from lockfile

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Replace `"latest"` with exact versions currently resolved in `package-lock.json`** for:
  - `astro`, `@astrojs/react`, `react`, `react-dom`, `lucide-react`, `@types/react`, `@types/react-dom`, `typescript`

- [ ] **Step 2:**

```bash
npm install
npm run build && npm run validate:process && npm run validate:portfolio
```

- [ ] **Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
chore: pin dependency versions instead of latest tags

EOF
)"
```

---

## Phase 9 — Final production checklist (ops)

Nie jest to kod — odhacz przed DNS cutover:

- [ ] Netlify production branch = `main` (lub ustalony)
- [ ] Domain `nowaweb.pl` + `www` redirect
- [ ] HTTPS OK
- [ ] Env: `PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
- [ ] Forms notifications → `kontakt@nowaweb.pl` (sprawdź spam folder)
- [ ] Test submit both forms on production
- [ ] Lighthouse mobile: LCP < 2.5s target after WebP
- [ ] `https://nowaweb.pl/robots.txt` + sitemap reachable
- [ ] Favicon visible in tab
- [ ] Mobile menu works on real iPhone/Android
- [ ] Cookie banner text matches reality
- [ ] 404 branded page works

---

## Out of scope (świadomie)

- Dodawanie GA/Plausible
- Pełne egzekwujące CSP day-one
- Refactor całej homepage do BaseLayout slotów poza Head/Header
- Redesign wizualny / nowe sekcje
- Faza prawna copy (już zrobiona wcześniej)

---

## Spec coverage check

| Audyt item | Phase |
|---|---|
| Unused ~50MB assets | 1 |
| Hero/service/portfolio weight | 2 |
| Mobile nav missing | 3 |
| Favicon / sitemap / robots / OG / canonical / JSON-LD | 4 |
| Turnstile + Netlify form notifications | 5 |
| Fake `?wyslano=1` UX | 5 |
| Cookie banner vs no analytics | 6 |
| CSP/HSTS/Permissions-Policy | 7 |
| 404 page | 7 |
| `"latest"` deps | 8 |
| Ops launch checklist | 9 |

## Placeholder scan
Brak TBD — ścieżki, komendy i kryteria PASS są konkretne. OG bitmap wymaga ręcznego eksportu 1200×630 (jedyny asset kreatywny); jeśli brak czasu: użyj istniejącego monitor screenshot jako tymczasowy OG i oznacz follow-up.

---

## Execution order (recommended)

1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9  

Każda faza zostawia działającą stronę. Nie łącz Phase 2+3 w jednym PR jeśli chcesz łatwy rollback.
