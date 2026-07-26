# Process Launch Upload and Configuration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fourth Process scene with a one-shot upload and segmented configuration animation that ends on a persistent success state.

**Architecture:** Keep `ProcessIsland`'s existing active-card and `data-story-visible` lifecycle. Render three overlapping semantic visual phases inside the existing browser frame and drive them with scoped CSS animations; no React timers or new dependencies. Extend the current structural and CDP browser checks so the implementation is verified through real computed styles and responsive layout.

**Tech Stack:** Astro, React/TSX, CSS animations, Node.js validation, Chrome DevTools Protocol.

## Global Constraints

- The full sequence lasts about 9 seconds, runs once, and persists on the completed state.
- Re-entering stage 4 restarts through the existing active-card selector contract.
- Stops and copy are exactly: 24% “Odpędzamy negatywne opinie…”, 67% “Przyciągamy właściwych klientów…”, 88% “Dopinamy ostatnie szczegóły…”.
- The completion copy is exactly “Gotowe. Twoja strona pracuje.”
- `prefers-reduced-motion: reduce` shows the final state immediately with zero launch-scene animations.
- No new dependencies, React timers, horizontal overflow, or changes to the other Process scenes.

---

### Task 1: Specify observable launch-scene behavior

**Files:**
- Modify: `scripts/verify-process-story.mjs`
- Modify: `scripts/validate-process-story.mjs`

**Interfaces:**
- Consumes: `[data-process-scene="launch"]` and the existing stage activation lifecycle.
- Produces: browser assertions for upload, progress stops, completion, replay, reduced motion, and mobile overflow; static guardrails for required copy and removed legacy classes.

- [ ] **Step 1: Add a failing browser test for launch playback**

Add a `launchPlayback` sample that activates the fourth card, pauses only the scene's CSS animations at hand-checked times, and reads these real values:

```js
const frame = () => ({
  uploadOpacity: Number(getComputedStyle(scene.querySelector('.story-upload-phase')).opacity),
  configOpacity: Number(getComputedStyle(scene.querySelector('.story-config-phase')).opacity),
  completeOpacity: Number(getComputedStyle(scene.querySelector('.story-launch-complete')).opacity),
  progressScale: new DOMMatrix(
    getComputedStyle(scene.querySelector('.story-config-progress__fill')).transform,
  ).a,
  overflow: scene.scrollWidth > scene.clientWidth || scene.scrollHeight > scene.clientHeight,
});
```

Assert that the samples expose upload first, approximately `0.24`, `0.67`, and `0.88` at the three holds, then `1` with persistent completion. Reactivating stage 4 must reset to upload. The production change caught by this test is a missing phase, incorrect hold percentage, non-persistent final, or failed replay.

- [ ] **Step 2: Run the browser verifier and confirm RED**

Run: `npm run verify:process`

Expected: FAIL because `.story-upload-phase`, `.story-config-phase`, `.story-config-progress__fill`, and `.story-launch-complete` do not exist.

- [ ] **Step 3: Add structural guardrails and confirm RED**

Require all phase class names, the four exact messages, `data-progress="24|67|88"`, and new keyframes. Require the legacy `story-publish`, `story-online`, `story-support`, and `story-page-shell--live` markup to be absent.

Run: `npm run validate:process`

Expected: FAIL on the missing launch upload/configuration contract.

### Task 2: Implement the one-shot scene

**Files:**
- Modify: `src/components/ProcessIsland.tsx:240`
- Modify: `src/components/ProcessIsland.css:1270`

**Interfaces:**
- Consumes: `.process-story[data-story-visible="true"] .process-story__card.is-active`.
- Produces: `.story-upload-phase`, `.story-config-phase`, `.story-config-progress__fill`, three `.story-config-status` nodes, and `.story-launch-complete`.

- [ ] **Step 1: Replace only the launch markup**

Keep the browser chrome and replace the live-page mockup with three overlapping phases:

```tsx
<div className="story-browser story-launch-browser story-scene__final">
  <span className="story-browser__bar"><i /><i /><i /><b>nowa-strona.pl</b></span>
  <div className="story-launch-page">
    <div className="story-upload-phase">
      <span className="story-upload-spinner"><i /></span>
      <b className="story-uploading-label">Uploading…</b>
      <b className="story-uploaded-label">Uploaded</b>
    </div>
    <div className="story-config-phase">
      <b>Konfiguracja</b>
      <div className="story-config-progress">
        <span className="story-config-progress__fill" />
        <i style={{ "--stop": "24%" } as CSSProperties} />
        <i style={{ "--stop": "67%" } as CSSProperties} />
        <i style={{ "--stop": "88%" } as CSSProperties} />
      </div>
      <span className="story-config-status" data-progress="24">Odpędzamy negatywne opinie…</span>
      <span className="story-config-status" data-progress="67">Przyciągamy właściwych klientów…</span>
      <span className="story-config-status" data-progress="88">Dopinamy ostatnie szczegóły…</span>
    </div>
    <div className="story-launch-complete"><span><i /></span><b>Gotowe.</b><small>Twoja strona pracuje.</small></div>
  </div>
</div>
```

- [ ] **Step 2: Add scoped CSS timeline and visual styling**

Use absolute, overlapping phases so layout does not shift. The fill animation uses literal held scales:

```css
@keyframes story-config-fill {
  0% { transform: scaleX(0); }
  12%, 25% { transform: scaleX(0.24); }
  38%, 53% { transform: scaleX(0.67); }
  65%, 78% { transform: scaleX(0.88); }
  92%, 100% { transform: scaleX(1); }
}
```

Scope every animation below the existing active launch selector. Use a decelerating spinner, cross-fade `Uploading…` to `Uploaded`, reveal configuration near 3 seconds, show each status only during its hold, and reveal the completion overlay near 8.4 seconds. Use `both` fill mode so the final remains visible.

- [ ] **Step 3: Add mobile and reduced-motion final states**

At `max-width: 760px`, reduce frame insets and copy size without changing the timeline. In the existing reduced-motion media query, force:

```css
.story-upload-phase,
.story-config-phase { opacity: 0 !important; }
.story-launch-complete { opacity: 1 !important; transform: none !important; }
```

No launch child may have a running CSS animation in reduced motion.

- [ ] **Step 4: Run focused checks and confirm GREEN**

Run: `npm run validate:process`

Expected: all structural checks pass.

Run: `npm run verify:process`

Expected: browser playback, replay, mobile, and reduced-motion checks pass.

### Task 3: Build and visual verification

**Files:**
- Verify: `src/components/ProcessIsland.tsx`
- Verify: `src/components/ProcessIsland.css`
- Output: `output/playwright/process-launch-desktop.png`
- Output: `output/playwright/process-launch-mobile.png`

**Interfaces:**
- Consumes: completed Task 2 implementation.
- Produces: build evidence and reviewed desktop/mobile captures.

- [ ] **Step 1: Run the full production build**

Run: `npm run build`

Expected: Astro build exits with code 0 and no TypeScript or CSS errors.

- [ ] **Step 2: Capture the active fourth scene at 1440×1000 and 390×1200**

Use the existing local server and browser tooling. Navigate to the Process section, activate stage 4, wait for the completion frame, and save both viewport captures under `output/playwright/`.

- [ ] **Step 3: Inspect both captures**

Confirm the browser frame reads as a blank website background, all status copy fits, the progress bar has three meaningful stops, the completion state is centered, and neither viewport has clipping or horizontal overflow.

- [ ] **Step 4: Run final verification**

Run: `npm run validate:process`

Run: `npm run verify:process`

Run: `npm run build`

Expected: all three commands exit with code 0 using the final files.
