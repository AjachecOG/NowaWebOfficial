# Service Image Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the six HTML/CSS service illustrations with the six supplied complete card images in a responsive grid.

**Architecture:** Keep the section heading and its existing reveal behavior. Model each service as image metadata in `index.astro`, render one semantic `article` and `img` per item, and use a small CSS block for the 3/2/1-column responsive layout. Verify structure with a Node assertion script and appearance with browser screenshots.

**Tech Stack:** Astro, CSS, Node.js assertions, Playwright/Chromium visual verification.

## Global Constraints

- Desktop uses three columns; tablet uses two; phone uses one.
- Images retain their native aspect ratio and are never cropped.
- Do not duplicate image text as visible HTML.
- Preserve lazy loading, asynchronous decoding, reveal animation, and a subtle hover lift.
- Do not change other page sections.

---

### Task 1: Add a failing structural test

**Files:**
- Modify: `scripts/validate-corporate-service-card.mjs`

**Interfaces:**
- Consumes: `src/pages/index.astro`, `src/styles/global.css`, and six files under `public/assets/nowaweb/services/`.
- Produces: a zero-exit validation command when exactly six mapped image cards and responsive CSS are present.

- [ ] **Step 1: Replace old assertions with image-card assertions**

Assert six `/assets/nowaweb/services/*.png` paths, `.service-card-image`, three-column desktop CSS, two-column tablet CSS, one-column phone CSS, and absence of `service-card-browser`.

- [ ] **Step 2: Run the test and verify RED**

Run: `node scripts/validate-corporate-service-card.mjs`

Expected: failure because the six service asset paths and image-card markup are not present yet.

### Task 2: Add assets and render minimal image cards

**Files:**
- Create: `public/assets/nowaweb/services/corporate-websites.png`
- Create: `public/assets/nowaweb/services/landing-page.png`
- Create: `public/assets/nowaweb/services/one-page.png`
- Create: `public/assets/nowaweb/services/website-refresh.png`
- Create: `public/assets/nowaweb/services/ux-copywriting.png`
- Create: `public/assets/nowaweb/services/care-growth.png`
- Modify: `src/pages/index.astro:1-42,197-250`

**Interfaces:**
- Consumes: the six source PNG files from `C:/Users/Adam/Downloads/`.
- Produces: `services: { title: string; image: string }[]` and six `.service-card.service-card--image` articles.

- [ ] **Step 1: Copy and rename the six PNG files**

Map `(1)` through `(6)` to the filenames listed above in the same content order as the current cards.

- [ ] **Step 2: Simplify service metadata**

Remove service-only Lucide imports and define each service with `title` and `image`.

- [ ] **Step 3: Simplify service markup**

Render an `article` containing one `img.service-card-image` with `alt={title}`, `loading="lazy"`, `decoding="async"`, `width="1448"`, and `height="1086"`.

### Task 3: Replace legacy service illustration CSS

**Files:**
- Modify: `src/styles/global.css:1969-2206,3203-3223,3321-3338`

**Interfaces:**
- Consumes: `.service-board`, `.service-card--image`, and `.service-card-image` markup.
- Produces: uncropped 4:3 cards in a responsive 3/2/1-column grid.

- [ ] **Step 1: Remove old generated illustration rules**

Delete notebook/browser-specific service rules and their obsolete mobile overrides.

- [ ] **Step 2: Add image-card rules**

Use `padding: 0`, `aspect-ratio: 4 / 3`, `overflow: hidden`, `object-fit: cover`, inherited rounded corners, and existing hover motion.

- [ ] **Step 3: Add responsive column rules**

Keep three columns by default, set two columns at `max-width: 980px`, and one column at `max-width: 760px`.

- [ ] **Step 4: Run the structural test and verify GREEN**

Run: `node scripts/validate-corporate-service-card.mjs`

Expected: `Service image card structure is present.`

### Task 4: Build and visually verify

**Files:**
- Inspect: `output/playwright/services-desktop.png`
- Inspect: `output/playwright/services-mobile.png`

**Interfaces:**
- Consumes: built Astro page at `http://127.0.0.1:4321/#uslugi`.
- Produces: build evidence and desktop/mobile screenshots.

- [ ] **Step 1: Build**

Run: `npm run build`

Expected: Astro exits with code 0.

- [ ] **Step 2: Capture desktop and mobile views**

Capture the service section at widths 1440 px and 390 px.

- [ ] **Step 3: Inspect screenshots**

Confirm correct order, no cropping or distortion, no duplicated visible copy, and no horizontal overflow.

- [ ] **Step 4: Re-run final verification**

Run: `node scripts/validate-corporate-service-card.mjs` and `npm run build` after any visual corrections.
