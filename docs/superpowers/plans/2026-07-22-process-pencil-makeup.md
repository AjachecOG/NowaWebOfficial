# Pencil & Make-up Process Scene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Design Reactor in process step three with a replayable 4.5-second pencil-sketch and paint-polish animation whose tools reverse direction through deliberate jump-cuts.

**Architecture:** Keep the existing `ProcessVisual` branch and CSS-driven active-scene lifecycle. Replace only the design-scene decorative markup and reactor styles, using inline SVG paths for the drawing phase and CSS-built tools for the color, powder, eraser, and precision passes. Extend the current source and Chromium verification scripts so the animation is tested at meaningful phases under both motion preferences.

**Tech Stack:** React/TSX, CSS keyframes, inline SVG, Astro, Node source-contract tests, Chrome DevTools Protocol runtime verification.

## Global Constraints

- The complete sequence lasts approximately 4.5 seconds and restarts whenever the third card becomes active.
- Use inline decorative SVG, CSS gradients, transforms, opacity, clip paths, masks, and stroke-dash animation.
- Do not add raster assets, canvas, WebGL, animation dependencies, or new runtime state.
- Replace reactor-specific markup and styles instead of layering the new sequence over them.
- Do not change process steps one, two, or four.
- Preserve `Strona, która ciekawi.` and the final `wdrożone` status.
- Play the complete sequence for both `no-preference` and `prefers-reduced-motion: reduce`.
- Prevent horizontal and vertical overflow on desktop, compact desktop, and mobile.
- Pencil direction changes use 60–80 ms graphite-smudge jump-cuts rather than continuous rotation.
- The broad tool is a classic flat paint brush with an orange wooden handle, metal ferrule, and blue/coral-stained bristles.

---

### Task 1: Replace the Reactor Structure with the Atelier Scene

**Files:**
- Modify: `scripts/validate-process-story.mjs:28-34`
- Modify: `src/components/ProcessIsland.tsx:201-227`

**Interfaces:**
- Consumes: the existing `ProcessVisual(index)` branch and `data-process-scene="design"` lifecycle.
- Produces: `.story-sketch-svg`, `.story-sketch-pencil`, `.story-makeup-palette`, `.story-makeup-brush`, `.story-powder-puff`, `.story-detail-brush`, `.story-sketch-eraser`, `.story-page-shell--designed`, and `.story-code-check` nodes for CSS and runtime checks.

- [ ] **Step 1: Write the failing source contract**

Replace the three reactor checks in `scripts/validate-process-story.mjs` with:

```js
  ["pencil makeup structure", [
    "story-sketch-paper",
    "story-sketch-svg",
    "story-sketch-pencil",
    "story-makeup-palette",
    "story-makeup-brush",
    "story-powder-puff",
    "story-detail-brush",
    "story-sketch-eraser",
  ].every((name) => component.includes(name))],
  ["pencil sketch paths", (component.match(/pathLength="1"/g) ?? []).length >= 8],
  ["design reactor removed", ![
    "story-reactor-token",
    "story-reactor-core",
    "story-reactor-wave",
    "story-reactor-trail",
  ].some((name) => component.includes(name))],
```

- [ ] **Step 2: Run the contract and confirm RED**

Run: `npm run validate:process`

Expected: failures for `pencil makeup structure`, `pencil sketch paths`, and `design reactor removed`.

- [ ] **Step 3: Replace the design-scene JSX**

Keep the enclosing design scene and replace its children with this structure:

```tsx
<span className="story-sketch-paper" />
<svg className="story-sketch-svg" viewBox="0 0 320 210" aria-hidden="true">
  <path pathLength="1" d="M28 24H292Q302 24 302 34V180Q302 190 292 190H28Q18 190 18 180V34Q18 24 28 24Z" />
  <path pathLength="1" d="M18 50H302" />
  <path pathLength="1" d="M34 38H58M66 38H90M98 38H122" />
  <path pathLength="1" d="M34 66H286V132H34Z" />
  <path pathLength="1" d="M92 88H228M112 104H208" />
  <path pathLength="1" d="M34 144H108V176H34Z" />
  <path pathLength="1" d="M123 144H197V176H123Z" />
  <path pathLength="1" d="M212 144H286V176H212Z" />
  <path className="story-sketch-accent-line" pathLength="1" d="M246 35H282" />
  <path className="story-sketch-construction" pathLength="1" d="M12 58C42 44 68 42 96 48M226 198C250 188 274 176 304 158" />
</svg>
<span className="story-sketch-pencil"><i /><b /></span>
<span className="story-makeup-palette"><i /><i /><i /><i /></span>
<span className="story-makeup-brush"><i /><b /></span>
<div className="story-page-shell story-page-shell--designed story-scene__final">
  <span className="story-page-nav"><i /><i /><i /></span>
  <span className="story-page-hero"><b>Strona, która ciekawi.</b><i /></span>
  <span className="story-page-grid"><i /><i /><i /></span>
  <span className="story-page-cta" />
</div>
<span className="story-powder-puff"><i /><b /><b /><b /><b /></span>
<span className="story-detail-brush"><i /></span>
<span className="story-sketch-eraser" />
<span className="story-code-check"><i /> wdrożone</span>
```

- [ ] **Step 4: Run the source contract and confirm GREEN**

Run: `npm run validate:process`

Expected: all current source checks pass.

- [ ] **Step 5: Commit the structural slice**

```bash
git add scripts/validate-process-story.mjs src/components/ProcessIsland.tsx
git commit -m "feat: add pencil makeup process scene structure"
```

---

### Task 2: Define the Motion Contract Before Styling

**Files:**
- Modify: `scripts/validate-process-story.mjs:28-40`
- Modify: `scripts/verify-process-story.mjs:274-316,618-655,756-775,901-927`

**Interfaces:**
- Consumes: the class names created in Task 1.
- Produces: `pencilMakeup`, `reducedPencilMakeup`, and replay samples with `strokeProgress`, `pencilOpacity`, `brushOpacity`, `paletteOpacity`, `powderOpacity`, `designedClipPath`, `statusOpacity`, `running`, and `overflow` fields.

- [ ] **Step 1: Add failing motion checks to the source validator**

Insert after the structural checks:

```js
  ["pencil makeup motion", [
    "story-pencil-draw",
    "story-sketch-stroke",
    "story-palette-open",
    "story-brush-pass",
    "story-makeup-reveal",
    "story-powder-pop",
    "story-detail-pass",
    "story-sketch-erase",
    "story-makeup-status",
  ].every((name) => styles.includes(name))],
  ["pencil makeup always animates", styles.includes(':not([data-process-scene="design"])') && styles.includes("story-pencil-draw 1700ms")],
  ["reactor motion removed", !/story-reactor-(flight|impact|reveal|trail-run)/.test(styles)],
```

- [ ] **Step 2: Replace both design runtime samplers**

Rename `designReactor` to `pencilMakeup` and `reducedDesign` to `reducedPencilMakeup`. Use this common frame shape in both evaluators:

```js
const frame = () => {
  const style = (selector) => getComputedStyle(scene.querySelector(selector));
  const stroke = scene.querySelector('.story-sketch-svg path');
  return {
    active: Number(story.dataset.active),
    strokeProgress: Number(style('.story-sketch-svg path').strokeDashoffset),
    pencilOpacity: Number(style('.story-sketch-pencil').opacity),
    paletteOpacity: Number(style('.story-makeup-palette').opacity),
    brushOpacity: Number(style('.story-makeup-brush').opacity),
    powderOpacity: Number(style('.story-powder-puff').opacity),
    sketchOpacity: Number(style('.story-sketch-svg').opacity),
    designedClipPath: style('.story-page-shell--designed').clipPath,
    statusOpacity: Number(style('.story-code-check').opacity),
    running: scene.getAnimations({ subtree: true }).filter((item) => item.playState === 'running').length,
    overflow: scene.scrollWidth > scene.clientWidth || scene.scrollHeight > scene.clientHeight,
    pathCount: scene.querySelectorAll('.story-sketch-svg path').length,
    strokeExists: Boolean(stroke),
  };
};
```

Sample after `500 ms` as `drawing`, after another `1,650 ms` as `makeup`, after another `900 ms` as `powder`, and after another `1,550 ms` as `complete`. Before returning, click stage two, wait `150 ms`, click stage three, wait `500 ms`, and record `replay`.

- [ ] **Step 3: Replace the reactor assertions**

Use these assertions for both normal and reduced-motion runs:

```js
if (
  sample.drawing.active !== 2 ||
  sample.drawing.pathCount < 8 ||
  !sample.drawing.strokeExists ||
  sample.drawing.pencilOpacity < 0.2 ||
  sample.drawing.statusOpacity > 0.1 ||
  sample.drawing.running < 3
) failures.push("pencil scene does not begin with an active drawing phase");

if (
  sample.makeup.brushOpacity < 0.2 ||
  sample.makeup.paletteOpacity < 0.2 ||
  sample.makeup.designedClipPath === sample.drawing.designedClipPath
) failures.push("makeup pass does not progressively color the sketched page");

if (sample.powder.powderOpacity < 0.15 || sample.powder.statusOpacity > 0.4) {
  failures.push("powder and precision phase is missing or status arrives too early");
}

if (
  sample.complete.sketchOpacity > 0.1 ||
  sample.complete.pencilOpacity > 0.1 ||
  sample.complete.brushOpacity > 0.1 ||
  sample.complete.powderOpacity > 0.1 ||
  sample.complete.statusOpacity < 0.9 ||
  sample.complete.overflow
) failures.push("pencil makeup scene does not settle on the completed design");

if (sample.replay.pencilOpacity < 0.2 || sample.replay.statusOpacity > 0.1) {
  failures.push("pencil makeup scene does not replay after reverse navigation");
}
```

- [ ] **Step 4: Run both contracts and confirm RED**

Run: `npm run validate:process`

Expected: `pencil makeup motion`, `pencil makeup always animates`, and `reactor motion removed` fail.

Run: `npm run verify:process`

Expected: the new drawing/make-up assertions fail because the new elements have no phase animation yet.

- [ ] **Step 5: Commit the failing behavioral contract**

```bash
git add scripts/validate-process-story.mjs scripts/verify-process-story.mjs
git commit -m "test: define pencil makeup motion contract"
```

---

### Task 3: Implement the Pencil, Make-up, and Final Polish Motion

**Files:**
- Modify: `src/components/ProcessIsland.css:867-976,1259-1388,1460-1503,1641-1645`

**Interfaces:**
- Consumes: Task 1 class names and Task 2 phase timings.
- Produces: CSS-only drawing, color reveal, powder, detail, eraser, settle, and status animations that restart through the existing active-card selector.

- [ ] **Step 1: Replace reactor base styles**

Remove all `.story-reactor-*` and `.story-design-cursor` rules. Add one bounded scene layer for each new component. The critical initial-state declarations are:

```css
.story-scene--design { overflow: hidden; isolation: isolate; }
.story-sketch-paper { position: absolute; inset: 14px; z-index: 0; border-radius: 14px; background: #fffdf8; opacity: 0; }
.story-sketch-svg { position: absolute; inset: 12% 8%; z-index: 2; width: 84%; height: 76%; overflow: visible; fill: none; stroke: rgb(6 21 50 / 52%); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; opacity: 0; }
.story-sketch-svg path { stroke-dasharray: 1; stroke-dashoffset: 1; }
.story-sketch-accent-line { stroke: var(--process-orange); stroke-width: 2.2; }
.story-sketch-construction { stroke: rgb(6 21 50 / 24%); stroke-dasharray: 0.04 0.035; }
.story-sketch-pencil,
.story-makeup-palette,
.story-makeup-brush,
.story-powder-puff,
.story-detail-brush,
.story-sketch-eraser { position: absolute; z-index: 7; pointer-events: none; opacity: 0; }
.story-page-shell--designed { z-index: 3; opacity: 1; clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); }
.story-code-check { opacity: 0; }
```

Add the tool bodies with these declarations:

```css
.story-sketch-pencil { left: 4%; top: 9%; width: 76px; height: 12px; border-radius: 3px; background: linear-gradient(180deg, #ff805f 0 28%, var(--process-orange) 28% 72%, #d83d1f 72%); transform-origin: 8px 50%; }
.story-sketch-pencil::before { content: ""; position: absolute; right: -16px; border-width: 6px 0 6px 16px; border-style: solid; border-color: transparent transparent transparent #e7c69d; }
.story-sketch-pencil::after { content: ""; position: absolute; right: -18px; top: 4px; border-width: 2px 0 2px 5px; border-style: solid; border-color: transparent transparent transparent #273044; }
.story-sketch-pencil i { position: absolute; left: -8px; inset-block: 0; width: 10px; border-radius: 3px 0 0 3px; background: #f4b6af; }
.story-sketch-pencil b { position: absolute; inset: 2px 14px 2px auto; width: 18px; background: rgb(255 255 255 / 36%); }
.story-makeup-palette { left: 7%; bottom: 8%; display: grid; grid-template-columns: repeat(2, 16px); gap: 5px; padding: 10px 13px; border: 1px solid rgb(6 21 50 / 15%); border-radius: 46% 54% 52% 48%; background: #fff8ef; box-shadow: 0 12px 28px rgb(6 21 50 / 16%); }
.story-makeup-palette i { width: 16px; aspect-ratio: 1; border-radius: 50%; background: var(--process-blue); }
.story-makeup-palette i:nth-child(2) { background: var(--process-orange); }
.story-makeup-palette i:nth-child(3) { background: var(--process-ink); }
.story-makeup-palette i:nth-child(4) { background: #42b878; }
.story-makeup-brush { left: -18%; top: 28%; width: 88px; height: 18px; border-radius: 999px; background: linear-gradient(180deg, #15356f, var(--process-ink)); transform-origin: 80% 50%; }
.story-makeup-brush::after { content: ""; position: absolute; right: -27px; top: -7px; width: 34px; height: 32px; border-radius: 52% 48% 44% 56%; background: linear-gradient(90deg, #ffc3b2, var(--process-orange)); }
.story-makeup-brush i { position: absolute; right: 2px; inset-block: 2px; width: 17px; border-radius: 2px; background: #d9b46f; }
.story-makeup-brush b { position: absolute; left: 12px; top: 5px; width: 42px; height: 3px; border-radius: 999px; background: rgb(255 255 255 / 24%); }
.story-powder-puff { right: 13%; top: 22%; width: 38px; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff, #f5ddd0 70%); box-shadow: 0 9px 18px rgb(6 21 50 / 14%); }
.story-powder-puff i { position: absolute; inset: 7px; border: 1px dashed rgb(255 92 53 / 45%); border-radius: 50%; }
.story-powder-puff b { position: absolute; width: 5px; aspect-ratio: 1; border-radius: 50%; background: rgb(255 92 53 / 45%); }
.story-powder-puff b:nth-of-type(1) { left: -12px; top: 5px; }
.story-powder-puff b:nth-of-type(2) { left: -18px; top: 19px; }
.story-powder-puff b:nth-of-type(3) { left: -7px; top: 32px; }
.story-powder-puff b:nth-of-type(4) { left: 5px; top: -10px; }
.story-detail-brush { right: 3%; top: 2%; width: 64px; height: 5px; border-radius: 999px; background: var(--process-ink); transform-origin: right center; }
.story-detail-brush::after { content: ""; position: absolute; left: -12px; top: -3px; border-width: 5px 12px 5px 0; border-style: solid; border-color: transparent var(--process-orange) transparent transparent; }
.story-detail-brush i { position: absolute; right: 6px; top: 1px; width: 18px; height: 2px; background: rgb(255 255 255 / 30%); }
.story-sketch-eraser { left: 72%; top: 70%; width: 34px; height: 16px; border-radius: 5px; background: linear-gradient(90deg, #f4b6af 0 42%, #fff7ea 42%); box-shadow: 0 5px 12px rgb(6 21 50 / 12%); }
```

- [ ] **Step 2: Add the complete keyframe set**

Add these named animations with the specified phase behavior:

```css
@keyframes story-sketch-paper-in { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: none; } }
@keyframes story-sketch-stroke { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes story-pencil-draw {
  0% { left: 4%; top: 9%; opacity: 0; transform: rotate(22deg) scale(0.8); }
  10% { opacity: 1; }
  34% { left: 72%; top: 18%; transform: rotate(8deg); }
  58% { left: 30%; top: 48%; transform: rotate(28deg); }
  82% { left: 78%; top: 72%; opacity: 1; transform: rotate(18deg); }
  100% { left: 94%; top: 82%; opacity: 0; transform: rotate(38deg) scale(0.84); }
}
@keyframes story-palette-open {
  0% { opacity: 0; transform: translate(-12px, 12px) rotate(-18deg) scale(0.5); }
  28%, 76% { opacity: 1; transform: rotate(5deg) scale(1); }
  100% { opacity: 0; transform: translate(-6px, 5px) rotate(-3deg) scale(0.82); }
}
@keyframes story-brush-pass {
  0% { left: -18%; top: 28%; opacity: 0; transform: rotate(-18deg) scale(0.84); }
  12% { opacity: 1; }
  48% { left: 84%; top: 34%; transform: rotate(7deg); }
  58% { left: 82%; top: 62%; transform: rotate(168deg); }
  92% { left: 4%; top: 68%; opacity: 1; transform: rotate(188deg); }
  100% { left: -16%; top: 72%; opacity: 0; transform: rotate(202deg) scale(0.8); }
}
@keyframes story-makeup-reveal {
  0% { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); }
  48% { clip-path: polygon(0 0, 78% 3%, 70% 49%, 0 56%); }
  58% { clip-path: polygon(0 0, 100% 0, 100% 54%, 0 48%); }
  100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
}
@keyframes story-powder-pop {
  0% { opacity: 0; transform: translate(18px, 12px) scale(0.55); }
  32%, 68% { opacity: 1; transform: translate(0) scale(1); }
  100% { opacity: 0; transform: translate(-8px, -5px) scale(0.84); }
}
@keyframes story-detail-pass {
  0% { right: 3%; top: 2%; opacity: 0; transform: rotate(36deg); }
  22%, 78% { opacity: 1; }
  100% { right: 10%; top: 15%; opacity: 0; transform: rotate(18deg); }
}
@keyframes story-sketch-erase {
  0% { left: 72%; top: 70%; opacity: 0; transform: rotate(-12deg); }
  18%, 76% { opacity: 1; }
  100% { left: 14%; top: 18%; opacity: 0; transform: rotate(14deg); }
}
@keyframes story-sketch-fade { from { opacity: 1; } to { opacity: 0; } }
@keyframes story-makeup-status { from { opacity: 0; transform: translateY(8px) scale(0.76); } 70% { opacity: 1; transform: translateY(-2px) scale(1.05); } to { opacity: 1; transform: none; } }
@keyframes story-makeup-settle { 0% { transform: scale(1); } 50% { transform: scale(1.012, 0.992); } 100% { transform: scale(1); } }
```

- [ ] **Step 3: Connect animations to the existing active-scene lifecycle**

Use only selectors rooted at the active design scene:

```css
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--design .story-sketch-paper { animation: story-sketch-paper-in 360ms ease both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--design .story-sketch-svg { animation: story-sketch-paper-in 240ms 180ms ease both, story-sketch-fade 500ms 3600ms ease both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--design .story-sketch-svg path { animation: story-sketch-stroke 560ms 320ms cubic-bezier(0.4, 0, 0.2, 1) both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--design .story-sketch-svg path:nth-child(2) { animation-delay: 440ms; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--design .story-sketch-svg path:nth-child(3) { animation-delay: 560ms; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--design .story-sketch-svg path:nth-child(4) { animation-delay: 680ms; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--design .story-sketch-svg path:nth-child(5) { animation-delay: 800ms; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--design .story-sketch-svg path:nth-child(6) { animation-delay: 920ms; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--design .story-sketch-svg path:nth-child(7) { animation-delay: 1040ms; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--design .story-sketch-svg path:nth-child(8) { animation-delay: 1160ms; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--design .story-sketch-svg path:nth-child(9) { animation-delay: 1280ms; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--design .story-sketch-svg path:nth-child(10) { animation-delay: 1400ms; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--design .story-sketch-pencil { animation: story-pencil-draw 1700ms 120ms cubic-bezier(0.4, 0, 0.2, 1) both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--design .story-makeup-palette { animation: story-palette-open 1100ms 1650ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--design .story-makeup-brush { animation: story-brush-pass 1500ms 1850ms cubic-bezier(0.4, 0, 0.2, 1) both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--design .story-page-shell--designed { animation: story-makeup-reveal 1500ms 1850ms cubic-bezier(0.16, 1, 0.3, 1) both, story-makeup-settle 480ms 4020ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--design .story-powder-puff { animation: story-powder-pop 760ms 3000ms ease both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--design .story-detail-brush { animation: story-detail-pass 720ms 3260ms ease both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--design .story-sketch-eraser { animation: story-sketch-erase 700ms 3400ms ease both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--design .story-code-check { animation: story-makeup-status 480ms 3920ms cubic-bezier(0.16, 1, 0.3, 1) both; }
```

- [ ] **Step 4: Preserve reduced-motion and mobile behavior**

Keep `design` excluded from the generic reduced-motion animation reset. Add these mobile overrides:

```css
@media (max-width: 760px) {
  .story-sketch-pencil { width: 61px; height: 10px; }
  .story-makeup-brush { width: 70px; height: 14px; }
  .story-makeup-palette { grid-template-columns: repeat(2, 13px); padding: 8px 10px; }
  .story-makeup-palette i { width: 13px; }
  .story-powder-puff { width: 30px; }
  .story-powder-puff b:nth-of-type(4) { display: none; }
  .story-detail-brush { width: 51px; }
  .story-sketch-eraser { width: 27px; height: 13px; }
}
```

- [ ] **Step 5: Run GREEN verification**

Run: `npm run validate:process`

Expected: every source contract reports `PASS`.

Run: `npm run verify:process`

Expected: `Process story browser verification passed.` Normal and reduced samples show drawing, make-up, powder, complete, and replay phases without overflow.

- [ ] **Step 6: Commit the completed motion**

```bash
git add src/components/ProcessIsland.css
git commit -m "feat: animate pencil and makeup design process"
```

---

### Task 4: Production and Visual Verification

**Files:**
- Verify: `src/components/ProcessIsland.tsx`
- Verify: `src/components/ProcessIsland.css`
- Verify: `scripts/validate-process-story.mjs`
- Verify: `scripts/verify-process-story.mjs`

**Interfaces:**
- Consumes: the complete scene and automated contracts from Tasks 1–3.
- Produces: fresh build evidence and desktop/mobile visual evidence in the local app.

- [ ] **Step 1: Run the production build**

Run: `npm run build`

Expected: Astro reports `Complete!` with one generated page.

- [ ] **Step 2: Inspect the animation in the in-app browser**

Reload `http://127.0.0.1:4321/#proces`, activate step two, then step three. Capture the scene near `500 ms`, `2,150 ms`, `3,300 ms`, and after `4,500 ms`. Confirm that the frames visibly differ as graphite drawing, broad color pass, powder/detail pass, and completed design.

- [ ] **Step 3: Verify replay and reduced-motion behavior**

Activate step two and return to step three. Confirm that the pencil and empty sketch restart instead of retaining `wdrożone`. In a browser reporting `prefers-reduced-motion: reduce`, confirm the same four-phase sequence still plays.

- [ ] **Step 4: Verify compact and mobile composition**

Inspect widths `850 px` and `390 px`. Confirm the tools remain clipped to the scene, the final page remains readable, and neither axis overflows.

- [ ] **Step 5: Run the final clean-diff check**

Run: `git diff --check`

Expected: exit code `0` with no whitespace errors.

---

### Task 5: Add Directional Jump-Cuts and the Classic Paint Brush

**Files:**
- Modify: `scripts/validate-process-story.mjs:30-55`
- Modify: `scripts/verify-process-story.mjs:274-330,631-690,783-815,935-970`
- Modify: `src/components/ProcessIsland.tsx:220-232`
- Modify: `src/components/ProcessIsland.css:928-1065,1414-1436,1580-1590,1757-1761`

**Interfaces:**
- Consumes: the working pencil-and-make-up scene from Tasks 1–4.
- Produces: `.story-pencil-smudge`, `.story-paint-brush`, `.story-paint-daub`, pencil transform samples before/after the first cut, and paint-brush transform samples before/after its direction cut.

- [ ] **Step 1: Write the failing source contract**

Add these checks to `scripts/validate-process-story.mjs`:

```js
  ["directional jump cut structure", [
    "story-pencil-smudge",
    "story-paint-brush",
    "story-paint-daub",
  ].every((name) => component.includes(name)) && !component.includes("story-makeup-brush")],
  ["directional jump cut motion", [
    "story-pencil-smudge-cut",
    "story-paint-daub-cut",
    "scaleX(-1)",
  ].every((token) => styles.includes(token))],
  ["classic paint brush styling", styles.includes("linear-gradient(90deg, #d9e0e8") && styles.includes("#d97832")],
```

- [ ] **Step 2: Run the source contract and confirm RED**

Run: `npm run validate:process`

Expected: `directional jump cut structure`, `directional jump cut motion`, and `classic paint brush styling` fail.

- [ ] **Step 3: Replace the brush markup and add cut marks**

Replace the current tool nodes in `ProcessIsland.tsx` with:

```tsx
<span className="story-sketch-pencil"><i /><b /></span>
<span className="story-pencil-smudge"><i /><i /></span>
<span className="story-makeup-palette"><i /><i /><i /><i /></span>
<span className="story-paint-brush"><i /><b /></span>
<span className="story-paint-daub"><i /></span>
```

Keep the designed page, powder puff, detail brush, eraser, and status nodes unchanged.

- [ ] **Step 4: Extend the runtime samplers before changing CSS**

Add `pencilTransform` and `paintTransform` to the common frame function:

```js
pencilTransform: style('.story-sketch-pencil').transform,
paintTransform: style('.story-paint-brush').transform,
paintOpacity: Number(style('.story-paint-brush').opacity),
smudgeOpacity: Number(style('.story-pencil-smudge').opacity),
daubOpacity: Number(style('.story-paint-daub').opacity),
```

Sample the sequence at `500 ms` as `drawing`, after another `650 ms` as `pencilReverse`, after another `1,000 ms` as `makeup`, after another `650 ms` as `paintReturn`, after another `250 ms` as `powder`, and after another `1,550 ms` as `complete`. Apply the same timing to the reduced-motion evaluator.

Add these assertions for normal and reduced-motion samples:

```js
if (
  sample.drawing.pencilTransform === sample.pencilReverse.pencilTransform ||
  sample.pencilReverse.pencilOpacity < 0.2
) failures.push("pencil does not reverse orientation after its jump-cut");

if (
  sample.makeup.paintOpacity < 0.2 ||
  sample.paintReturn.paintOpacity < 0.2 ||
  sample.makeup.paintTransform === sample.paintReturn.paintTransform
) failures.push("classic paint brush does not return in the opposite orientation");
```

- [ ] **Step 5: Run runtime verification and confirm RED**

Run: `npm run verify:process`

Expected: the new transform assertions fail because the current pencil uses one continuous orientation and the classic paint brush does not exist.

- [ ] **Step 6: Implement the pencil jump-cuts**

Keep the existing pencil body. Change `transform-origin` to `50% 50%`, add a graphite smudge made from two short blurred-looking gradients without CSS `filter`, and replace `story-pencil-draw` with:

```css
@keyframes story-pencil-draw {
  0% { top: 9%; left: 4%; opacity: 0; transform: rotate(18deg) scaleX(1) scale(0.8); }
  8%, 28% { opacity: 1; }
  28% { top: 18%; left: 62%; transform: rotate(8deg) scaleX(1); }
  29%, 33% { opacity: 0; }
  33% { top: 31%; left: 63%; transform: rotate(-10deg) scaleX(-1); }
  37%, 56% { opacity: 1; }
  56% { top: 47%; left: 24%; transform: rotate(-24deg) scaleX(-1); }
  57%, 62% { opacity: 0; }
  62% { top: 53%; left: 18%; transform: rotate(12deg) scaleX(1); }
  66%, 88% { opacity: 1; }
  88% { top: 60%; left: 64%; transform: rotate(18deg) scaleX(1); }
  100% { top: 60%; left: 64%; opacity: 0; transform: rotate(26deg) scaleX(1) scale(0.84); }
}

@keyframes story-pencil-smudge-cut {
  0%, 27%, 34%, 56%, 63%, 100% { opacity: 0; transform: scaleX(0.3) rotate(-8deg); }
  29%, 32%, 58%, 61% { opacity: 0.7; transform: scaleX(1) rotate(4deg); }
}
```

Animate `.story-pencil-smudge` for `1700 ms 120 ms` with the same easing and fill mode as the pencil.

- [ ] **Step 7: Replace the make-up brush with a classic paint brush**

Use the existing span dimensions but style `.story-paint-brush` as:

```css
.story-paint-brush {
  top: 28%;
  left: -18%;
  width: 92px;
  height: 12px;
  border-radius: 999px 5px 5px 999px;
  background: linear-gradient(180deg, #ef9b55, #d97832 52%, #a94b20);
  box-shadow: 0 9px 18px rgb(6 21 50 / 18%);
  transform-origin: 50% 50%;
}
.story-paint-brush i {
  position: absolute;
  inset-block: -2px;
  right: -18px;
  width: 22px;
  background: linear-gradient(90deg, #d9e0e8, #aab5c4 72%, #7d8998);
}
.story-paint-brush b {
  position: absolute;
  top: -5px;
  right: -43px;
  width: 28px;
  height: 22px;
  border-radius: 2px 12px 12px 2px;
  background: linear-gradient(90deg, #174cbb 0 52%, var(--process-blue) 52% 75%, var(--process-orange) 75%);
}
@keyframes story-paint-brush-pass {
  0% { top: 28%; left: -16%; opacity: 0; transform: rotate(-8deg) scaleX(1); }
  10%, 43% { opacity: 1; }
  43% { top: 34%; left: 60%; transform: rotate(6deg) scaleX(1); }
  44%, 50% { opacity: 0; }
  50% { top: 58%; left: 58%; transform: rotate(-6deg) scaleX(-1); }
  55%, 90% { opacity: 1; }
  90% { top: 62%; left: 6%; transform: rotate(8deg) scaleX(-1); }
  100% { top: 62%; left: 2%; opacity: 0; transform: rotate(12deg) scaleX(-1) scale(0.84); }
}
@keyframes story-paint-daub-cut {
  0%, 42%, 51%, 100% { opacity: 0; transform: scale(0.4); }
  45%, 49% { opacity: 0.8; transform: scale(1); }
}
```

Rename the active animation selector to `.story-paint-brush`, animate it with `story-paint-brush-pass 1500ms 1850ms`, and animate `.story-paint-daub` with `story-paint-daub-cut 1500ms 1850ms`.

- [ ] **Step 8: Run GREEN verification**

Run: `npm run validate:process`

Expected: all source checks pass.

Run: `npm run verify:process`

Expected: normal, reduced-motion, replay, and mobile checks pass; transform samples differ across both tool cuts.

Run: `npm run build`

Expected: Astro reports `Complete!`.

- [ ] **Step 9: Perform visual QA and diff validation**

Capture frames immediately before and after each tool jump-cut in the in-app browser. Confirm the pencil tip and paint-brush bristles lead the new direction, the smudge/daub masks the 60–80 ms discontinuity, and no tool introduces overflow.

Run: `git diff --check`

Expected: exit code `0` with no whitespace errors.
