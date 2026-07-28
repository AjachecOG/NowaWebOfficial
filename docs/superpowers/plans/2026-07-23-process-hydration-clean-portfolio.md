# Process Hydration and Clean Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the Process island's GSAP hydration and convert the Portfolio carousel into a control-free, image-only coverflow driven by side-card clicks.

**Architecture:** Astro will explicitly pre-bundle all GSAP client dependencies so the late-hydrated Process island never requests stale optimized modules. The existing React carousel state machine remains intact, while its visible chrome and controls are removed and side cards receive direct semantic activation behavior.

**Tech Stack:** Astro 5, React 19, GSAP with ScrollTrigger, native CSS transitions, Node assertion scripts, Chrome DevTools Protocol.

## Global Constraints

- Preserve the existing Process content, four scenes, GSAP timeline, scroll behavior, mobile fallback, and reduced-motion behavior.
- Use the existing three real project PNG files and keep their order unchanged.
- Do not add autoplay or new dependencies.
- Preserve the 820 ms carousel transition and the 2.5 px side-card glass blur.
- Keep pointer drag, swipe, keyboard arrows, live-region announcements, mobile containment, and reduced-motion support.
- Do not stage or commit unrelated pre-existing worktree changes.

---

### Task 1: Make GSAP hydration deterministic

**Files:**
- Modify: `scripts/validate-process-story.mjs`
- Modify: `astro.config.mjs`

**Interfaces:**
- Consumes: Astro's `vite.optimizeDeps.include` configuration.
- Produces: eager optimized modules for `@gsap/react`, `gsap`, and `gsap/ScrollTrigger` before `ProcessIsland` becomes visible.

- [ ] **Step 1: Add a failing configuration assertion**

Read `astro.config.mjs` in `scripts/validate-process-story.mjs` and add these checks:

```js
const astroConfig = read("astro.config.mjs");

for (const dependency of ['"@gsap/react"', '"gsap"', '"gsap/ScrollTrigger"']) {
  checks.push([
    `Vite pre-bundles ${dependency}`,
    astroConfig.includes(dependency),
  ]);
}
```

- [ ] **Step 2: Run the validator and confirm RED**

Run: `npm run validate:process`

Expected: FAIL for all three missing Vite pre-bundle entries.

- [ ] **Step 3: Add the minimal Astro configuration**

Update `astro.config.mjs`:

```js
export default defineConfig({
  integrations: [react()],
  output: "static",
  vite: {
    optimizeDeps: {
      include: ["@gsap/react", "gsap", "gsap/ScrollTrigger"],
    },
  },
});
```

- [ ] **Step 4: Confirm GREEN and refresh the runtime**

Run: `npm run validate:process`

Expected: all Process checks PASS.

Stop only the Node process listening on port `4321`, verify its executable and workspace command first, then restart with:

```powershell
npm run dev -- --force
```

Expected: `/node_modules/.vite/deps/@gsap_react.js`, `gsap.js`, and `gsap_ScrollTrigger.js` return HTTP 200.

- [ ] **Step 5: Run the existing browser regression test**

Run: `npm run verify:process`

Expected: `Process story browser verification passed.` with active stages `0,1,2,3`, running scene animations, mobile checks, and reduced-motion checks.

### Task 2: Remove all visible carousel chrome

**Files:**
- Modify: `scripts/validate-portfolio-carousel.mjs`
- Modify: `src/components/PortfolioCarousel.tsx`
- Modify: `src/components/PortfolioCarousel.css`

**Interfaces:**
- Consumes: existing `projects`, `getCardPosition`, `activate`, pointer handlers, and keyboard handler.
- Produces: image-only `.portfolio-carousel__card` elements with side-card button semantics.

- [ ] **Step 1: Replace the old interaction assertions with the clean-card contract**

Keep assertions for state, pointer drag, keyboard arrows, and the live region. Remove assertions requiring side buttons, previous/next buttons, and external links. Add:

```js
for (const removed of [
  "portfolio-carousel__titlebar",
  "portfolio-carousel__meta",
  "portfolio-carousel__external",
  "portfolio-carousel__side-control",
  "portfolio-carousel__controls",
  "portfolio-carousel__hint",
]) {
  assert.ok(!component.includes(removed), `removed carousel chrome remains: ${removed}`);
}

assert.match(component, /role=\{isActive \? undefined : "button"\}/);
assert.match(component, /tabIndex=\{isActive \? -1 : 0\}/);
assert.match(component, /event\.key === "Enter" \|\| event\.key === " "/);
```

- [ ] **Step 2: Run the validator and confirm RED**

Run: `npm run validate:portfolio`

Expected: FAIL because the title bar, metadata, links, side controls, bottom controls, and hint still exist.

- [ ] **Step 3: Simplify the React card markup**

Remove the `ExternalLink` import, `domain`, `category`, and `url` fields, the title bar, metadata strip, external link, side button, bottom controls, progress dots, and hint. Keep the image wrapper and add semantic side-card activation:

```tsx
<article
  aria-current={isActive ? "true" : undefined}
  aria-label={!isActive ? `Pokaż projekt ${project.name}` : undefined}
  className="portfolio-carousel__card"
  data-position={position}
  data-project={project.name}
  key={project.name}
  onClick={() => !isActive && activate(index)}
  onKeyDown={(event) => {
    if (isActive || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    activate(index);
  }}
  role={isActive ? undefined : "button"}
  tabIndex={isActive ? -1 : 0}
>
  <div className="portfolio-carousel__screen">
    <img draggable={false} ... />
  </div>
</article>
```

- [ ] **Step 4: Simplify the CSS frame**

Delete styles for title bar, traffic lights, metadata, numbers, identity, external link, side controls, bottom controls, progress, hint, and their hover/focus rules. Make the screenshot touch the frame:

```css
.portfolio-carousel__screen {
  display: block;
  width: 100%;
  aspect-ratio: 1.82 / 1;
  overflow: hidden;
  background: transparent;
}

.portfolio-carousel__screen img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}
```

Retain `.portfolio-carousel__stage:focus-visible` and add `.portfolio-carousel__card[role="button"]:focus-visible` using the current blue focus ring.

- [ ] **Step 5: Run the validator and confirm GREEN**

Run: `npm run validate:portfolio`

Expected: `Portfolio real project assets and content are present.`

### Task 3: Update real-browser verification for control-free interaction

**Files:**
- Modify: `scripts/verify-portfolio-carousel.mjs`

**Interfaces:**
- Consumes: `data-position`, `data-active`, side-card `role="button"`, stage keyboard handling, and pointer handling.
- Produces: desktop/mobile screenshots and runtime assertions for the final component.

- [ ] **Step 1: Assert the visual chrome is absent**

Add desktop measurements:

```js
removedChromeCount: document.querySelectorAll(
  '.portfolio-carousel__titlebar, .portfolio-carousel__meta, .portfolio-carousel__external, .portfolio-carousel__side-control, .portfolio-carousel__controls, .portfolio-carousel__hint'
).length,
sideRoles: sideCards.map((card) => card.getAttribute('role')),
```

Assert `removedChromeCount === 0` and both side roles equal `button`.

- [ ] **Step 2: Replace control-driven navigation with side-image clicks**

Use this interaction sequence:

```js
document.querySelector('[data-position="right"] .portfolio-carousel__screen').click();
await waitForTransition();
const afterRight = active();
document.querySelector('[data-position="left"] .portfolio-carousel__screen').click();
await waitForTransition();
const afterLeft = active();
```

Then focus the stage, dispatch `ArrowLeft`, and assert the expected wrapped index. Keep the real CDP pointer drag test.

- [ ] **Step 3: Replace mobile side-control checks**

Assert both side cards expose `role="button"`, are visible, and have a nonzero clickable width. Keep the center-width, image-fit, and overflow checks.

- [ ] **Step 4: Run browser verification**

Run: `npm run verify:portfolio`

Expected: `Portfolio carousel browser verification passed.` with successful click sequence, real drag, keyboard navigation, mobile layout, no added overflow, and reduced-motion duration below 0.001 seconds.

### Task 4: Production and visual verification

**Files:**
- Verify: `astro.config.mjs`
- Verify: `src/components/ProcessIsland.tsx`
- Verify: `src/components/PortfolioCarousel.tsx`
- Verify: `src/components/PortfolioCarousel.css`
- Output: `output/playwright/portfolio-glass-desktop.png`
- Output: `output/playwright/portfolio-glass-mobile.png`

**Interfaces:**
- Consumes: final source, validators, and browser verifiers.
- Produces: a production build and inspectable screenshots.

- [ ] **Step 1: Run all focused checks fresh**

Run:

```powershell
npm run validate:process
npm run validate:portfolio
npm run verify:process
npm run verify:portfolio
```

Expected: all commands exit `0`.

- [ ] **Step 2: Build production output**

Run: `npm run build`

Expected: Astro reports `Complete!` and one page built.

- [ ] **Step 3: Inspect both screenshots**

Check desktop and mobile for image-only cards, no gray title or metadata bands, no visible carousel controls, readable full screenshots, visible glass side cards, and no clipping.

- [ ] **Step 4: Review the final diff**

Confirm only the plan's files changed for this task and preserve all unrelated dirty-worktree files.
