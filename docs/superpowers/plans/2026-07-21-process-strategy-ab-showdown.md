# Strategy A/B Showdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the second process scene’s sitemap with an animated A/B creative-direction showdown that ends on the existing wireframe.

**Architecture:** Keep `ProcessVisual` and the CSS-owned active-scene lifecycle. Add three isolated strategy layers—brief chip, comparison stage, final wireframe—and animate only when the second card is active; source and CDP tests verify copy, intermediate states, final continuity, replay ownership, mobile overflow, and reduced motion.

**Tech Stack:** React, TypeScript, CSS keyframes, GSAP-owned process activation, Node source validation, Chrome DevTools Protocol verification.

## Global Constraints

- Exact visible copy: `Cel: zaciekawić`, `A`, `B`, `Uwaga`, `Czytelność`, `Decyzja`, `Wybrany kierunek`.
- Total sequence duration: approximately 4.8 seconds, then stop on the final wireframe.
- Variant B wins without percentages or claims of statistical testing.
- The final `story-page-shell--wireframe` must match the opening frame of stage 3.
- Animate opacity and transforms; score bars use `scaleX`, not width.
- At 390 px, the scene must not overflow horizontally or vertically.
- Reduced motion and no-JavaScript states show the complete final wireframe without running comparison animations.
- Do not change stage 1, stage 3, stage 4, card scrolling, or navigation.

---

### Task 1: Build and verify the strategy showdown

**Files:**
- Modify: `scripts/validate-process-story.mjs`
- Modify: `scripts/verify-process-story.mjs`
- Modify: `src/components/ProcessIsland.tsx`
- Modify: `src/components/ProcessIsland.css`

**Interfaces:**
- Consumes: `ProcessVisual({ index, playConversation })`, `data-process-scene="strategy"`, `.process-story[data-story-visible="true"] .process-story__card.is-active`, and the existing final `.story-page-shell--wireframe`.
- Produces: `.story-strategy-brief`, `.story-direction-duel`, `.story-direction--a`, `.story-direction--b`, `.story-strategy-scores`, `.story-direction-stamp`, and `.story-strategy-final` browser hooks.

- [x] **Step 1: Write failing source and browser contracts**

Add source checks equivalent to:

```js
["strategy showdown copy", ["Cel: zaciekawić", "Uwaga", "Czytelność", "Decyzja", "Wybrany kierunek"].every((copy) => component.includes(copy))],
["two strategy directions", component.includes("story-direction--a") && component.includes("story-direction--b")],
["strategy score transform", styles.includes("story-strategy-score-fill") && styles.includes("scaleX")],
["strategy final continuity", component.includes("story-page-shell story-page-shell--wireframe story-strategy-final")],
["old sitemap removed", !component.includes("story-sitemap") && !styles.includes(".story-sitemap")],
```

Add a desktop `strategyPlayback` sample in `verify-process-story.mjs` that activates stage 2 and records:

```js
const frame = () => ({
  aOpacity: Number(getComputedStyle(scene.querySelector('.story-direction--a')).opacity),
  bOpacity: Number(getComputedStyle(scene.querySelector('.story-direction--b')).opacity),
  stampOpacity: Number(getComputedStyle(scene.querySelector('.story-direction-stamp')).opacity),
  duelOpacity: Number(getComputedStyle(scene.querySelector('.story-direction-duel')).opacity),
  finalOpacity: Number(getComputedStyle(scene.querySelector('.story-strategy-final')).opacity),
});
```

Capture `duel` at 1400 ms, `winner` at 3400 ms, and `complete` at 5100 ms. Assert that both variants are visible in `duel`, A is dimmer than B and the stamp is visible in `winner`, and the duel is hidden while the final wireframe is visible in `complete`. Extend mobile completion to assert `scene.scrollWidth <= scene.clientWidth` and `scene.scrollHeight <= scene.clientHeight`.

- [x] **Step 2: Run the source validator and confirm RED**

Run: `npm run validate:process`

Expected: FAIL for showdown copy, two directions, score transform, final continuity, and old sitemap removal.

- [x] **Step 3: Replace the strategy markup**

Use this structure inside the `index === 1` branch:

```tsx
<span className="story-strategy-brief">Cel: zaciekawić</span>
<div className="story-direction-duel">
  <div className="story-direction story-direction--a">
    <b>A</b>
    <span className="story-direction-mini story-direction-mini--a"><i /><i /><i /></span>
  </div>
  <div className="story-direction story-direction--b">
    <b>B</b>
    <span className="story-direction-mini story-direction-mini--b"><i /><i /><i /></span>
    <strong className="story-direction-stamp">Wybrany kierunek</strong>
  </div>
  <span className="story-attention-marker" />
  <div className="story-strategy-scores">
    {[
      ["Uwaga", "0.58", "0.92"],
      ["Czytelność", "0.66", "0.88"],
      ["Decyzja", "0.52", "0.84"],
    ].map(([label, scoreA, scoreB]) => (
      <span className="story-strategy-score" key={label}>
        <b>{label}</b>
        <i className="story-strategy-score-fill story-strategy-score-fill--a" style={{ "--score": scoreA } as CSSProperties} />
        <i className="story-strategy-score-fill story-strategy-score-fill--b" style={{ "--score": scoreB } as CSSProperties} />
      </span>
    ))}
  </div>
</div>
<div className="story-page-shell story-page-shell--wireframe story-strategy-final story-scene__final">
  <span className="story-page-nav"><i /><i /><i /></span>
  <span className="story-page-hero"><b /><i /></span>
  <span className="story-page-grid"><i /><i /><i /></span>
  <span className="story-page-cta" />
</div>
```

The percentage strings are internal CSS scale values only and are never rendered as text.

- [x] **Step 4: Add static layout and active-only keyframes**

Default state: brief and duel are hidden; `.story-strategy-final` is visible. Add layout for two 92 px direction cards, miniature hero compositions, three compact score rows, the orange attention marker, and a rotated stamp contained within variant B.

Add active-only animations with these windows:

```css
.process-story[data-story-visible="true"] .process-story__card.is-active .story-strategy-brief {
  animation: strategy-brief-sequence 1100ms both;
}
.process-story[data-story-visible="true"] .process-story__card.is-active .story-direction-duel {
  animation: strategy-duel-sequence 4100ms 450ms both;
}
.process-story[data-story-visible="true"] .process-story__card.is-active .story-direction--a {
  animation: strategy-a-result 3900ms 650ms both;
}
.process-story[data-story-visible="true"] .process-story__card.is-active .story-direction--b {
  animation: strategy-b-result 3900ms 650ms both;
}
.process-story[data-story-visible="true"] .process-story__card.is-active .story-direction-stamp {
  animation: strategy-stamp-in 900ms 2850ms both;
}
.process-story[data-story-visible="true"] .process-story__card.is-active .story-strategy-final {
  animation: story-stage-in 700ms 4100ms both;
}
```

Stagger score-row and score-fill delays between 1250 ms and 2250 ms. Define `@keyframes strategy-attention-pass` to move once from A to B and stop. Ensure hidden/default intermediate layers have no running animation outside the active selector.

- [x] **Step 5: Run focused checks and confirm GREEN**

Run: `npm run validate:process`

Expected: all source checks print `PASS` and exit 0.

Run: `npm run verify:process`

Expected: `Process story browser verification passed.` and exit 0, including duel, winner, final frame, mobile, replay ownership, and reduced motion.

- [x] **Step 6: Review the diff without staging unrelated work**

Run:

```bash
git diff --check -- scripts/validate-process-story.mjs scripts/verify-process-story.mjs src/components/ProcessIsland.tsx src/components/ProcessIsland.css
```

Expected: exit 0. Leave the feature unstaged because these files contained unrelated user changes before this task.

### Task 2: Build and visual QA

**Files:**
- Verify: `src/components/ProcessIsland.tsx`
- Verify: `src/components/ProcessIsland.css`

**Interfaces:**
- Consumes: the complete stage-2 showdown from Task 1.
- Produces: verified desktop and mobile final visuals with a stable handoff to stage 3.

- [x] **Step 1: Run the production build**

Run: `npm run build`

Expected: Astro builds one page and exits 0.

- [x] **Step 2: Inspect desktop states**

At `http://127.0.0.1:4321/#proces`, activate stage 2 and inspect the comparison, winner, and final wireframe states. Confirm the brief is readable, variants are visually distinct, B wins unambiguously, the stamp stays inside the panel, and the final wireframe matches stage 3.

- [x] **Step 3: Inspect mobile and reduced-motion states**

At 390 px, activate stage 2 and confirm the two variants remain readable without horizontal or vertical overflow. Under reduced motion, confirm only the stable final wireframe is shown and no strategy animation runs.

- [x] **Step 4: Run final verification**

Run: `npm run validate:process`

Run: `npm run verify:process`

Expected: both commands exit 0, then leave the local preview open on `#proces`.
