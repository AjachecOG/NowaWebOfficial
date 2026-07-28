# Large Persistent Strategy Workshop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enlarge the stage-2 workshop and notes, slow both motion variants, and hold permanently on the completed workshop board.

**Architecture:** Remove the separate `.story-workshop-final` layer so the board itself is the only visual state. Change the board and note keyframes to fill forwards, widen only the stage-2 card with `:has(.story-scene--strategy)`, and update CDP tests to measure geometry, timing, replay, reduced motion, and the persistent final board.

**Tech Stack:** React/TypeScript, CSS keyframes, existing GSAP stage activation, Node source validation, Chrome DevTools Protocol verification.

## Global Constraints

- Desktop stage-2 visual minimum height: about `315px`.
- Desktop stage-2 columns: about `37% / 63%` with a smaller gap.
- Board inset: `6px` to `8px`.
- Note font: about `0.55rem`, roughly 30% larger than the current `0.42rem`.
- Full sequence: about `7s`; reduced sequence: about `5s`.
- Final state: board, all six notes, and priority visible; no `.story-workshop-final` layer.
- Mobile shows the persistent completed board without overflow.
- Preserve unrelated dirty-worktree changes and leave implementation files unstaged.

---

### Task 1: Remove the final image and make the board persistent

**Files:**
- Modify: `scripts/validate-process-story.mjs:20-40`
- Modify: `scripts/verify-process-story.mjs:218-290,630-670`
- Modify: `src/components/ProcessIsland.tsx:170-210`
- Modify: `src/components/ProcessIsland.css:712-920,1165-1280`

**Interfaces:**
- Consumes: `.story-workshop-board`, six `.story-workshop-note` nodes, and `.story-workshop-priority`.
- Produces: a single persistent board whose final computed state has board opacity `1`, six visible notes, priority opacity `1`, and no `.story-workshop-final` node.

- [ ] **Step 1: Write failing source and runtime assertions**

```js
["persistent workshop board", component.includes("story-workshop-board") && !component.includes("story-workshop-final")],
["no workshop final image styles", !styles.includes(".story-workshop-final") && !styles.includes("workshop-final-in")],
```

Change the final runtime frame to:

```js
const frame = () => ({
  noteCount: scene.querySelectorAll('.story-workshop-note').length,
  visibleNotes: [...scene.querySelectorAll('.story-workshop-note')]
    .filter((note) => Number(getComputedStyle(note).opacity) > 0.7).length,
  boardOpacity: Number(getComputedStyle(scene.querySelector('.story-workshop-board')).opacity),
  priorityOpacity: Number(getComputedStyle(scene.querySelector('.story-workshop-priority')).opacity),
  finalLayerCount: scene.querySelectorAll('.story-workshop-final').length,
  running: scene.getAnimations({ subtree: true }).filter((item) => item.playState === 'running').length,
});
```

Sample reveal at `1400ms`, grouped state at `4400ms`, and final at `7200ms`. Require in the final state:

```js
if (strategyPlayback.complete.boardOpacity < 0.9 ||
    strategyPlayback.complete.visibleNotes !== 6 ||
    strategyPlayback.complete.priorityOpacity < 0.9 ||
    strategyPlayback.complete.finalLayerCount !== 0) {
  failures.push("strategy workshop does not hold on the completed board");
}
```

- [ ] **Step 2: Run RED**

Run: `npm run validate:process`, then `npm run verify:process`.

Expected: source validation reports the final layer; browser verification reports the board disappearing and the final layer remaining.

- [ ] **Step 3: Remove the final JSX layer**

Delete this complete block from the `index === 1` branch:

```tsx
<div className="story-workshop-final story-scene__final">
  <span className="story-workshop-final-nav"><i /><i /><i /></span>
  <span className="story-workshop-final-hero"><i /><i /></span>
  <span className="story-workshop-final-grid"><i /><i /></span>
  <span className="story-workshop-final-cta" />
  <b>Kierunek gotowy</b>
</div>
```

Change the priority pseudo-label from `priorytet` to `kierunek wybrany`.

- [ ] **Step 4: Remove final-layer CSS and make the full sequence persistent**

Delete all `.story-workshop-final*`, `@keyframes workshop-final-in`, and active final selectors. Replace the board/note/priority timing with:

```css
@keyframes workshop-board-in {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: none; }
}
.process-story[data-story-visible="true"] .process-story__card.is-active .story-workshop-board {
  animation: workshop-board-in 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
.process-story[data-story-visible="true"] .process-story__card.is-active .story-workshop-note {
  animation: workshop-note-in 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
.story-workshop-group:nth-child(1) .story-workshop-note:nth-of-type(1) { animation-delay: 600ms !important; }
.story-workshop-group:nth-child(1) .story-workshop-note:nth-of-type(2) { animation-delay: 1200ms !important; }
.story-workshop-group:nth-child(2) .story-workshop-note:nth-of-type(1) { animation-delay: 1800ms !important; }
.story-workshop-group:nth-child(2) .story-workshop-note:nth-of-type(2) { animation-delay: 2400ms !important; }
.story-workshop-group:nth-child(3) .story-workshop-note:nth-of-type(1) { animation-delay: 3000ms !important; }
.story-workshop-group:nth-child(3) .story-workshop-note:nth-of-type(2) { animation-delay: 3600ms !important; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-workshop-priority {
  animation: workshop-priority-in 1200ms 4800ms ease both;
}
```

- [ ] **Step 5: Run GREEN for persistent full motion**

Run: `npm run validate:process` and `npm run verify:process`.

Expected: all source checks pass; at `7200ms` the board, six notes, and priority remain visible with no final layer.

---

### Task 2: Enlarge the workshop and slow reduced motion

**Files:**
- Modify: `scripts/verify-process-story.mjs:218-290,480-570,720-780`
- Modify: `src/components/ProcessIsland.css:145-180,294-305,712-840,1320-1510`

**Interfaces:**
- Consumes: Task 1 persistent board.
- Produces: desktop visual height at least `300px`, note font at least `8.5px`, board-to-scene width ratio above `.92`, a roughly five-second reduced reveal, and static persistent mobile completion.

- [ ] **Step 1: Write failing geometry and reduced timing assertions**

Add to the desktop frame:

```js
visualHeight: scene.getBoundingClientRect().height,
boardWidthRatio: scene.querySelector('.story-workshop-board').getBoundingClientRect().width / scene.getBoundingClientRect().width,
noteFontSize: Number.parseFloat(getComputedStyle(scene.querySelector('.story-workshop-note')).fontSize),
```

Assert:

```js
if (strategyPlayback.complete.visualHeight < 300 ||
    strategyPlayback.complete.boardWidthRatio < 0.92 ||
    strategyPlayback.complete.noteFontSize < 8.5) {
  failures.push("strategy workshop window or notes are not large enough");
}
```

For reduced motion sample at `900ms` and `5400ms`; require fewer than six visible notes at reveal and six visible notes plus priority opacity above `.9` in the final state.

- [ ] **Step 2: Run RED**

Run: `npm run verify:process`.

Expected: current height `270px`, current note font about `6.7px`, and current reduced sequence completes too early.

- [ ] **Step 3: Enlarge only stage 2 on desktop**

```css
@media (min-width: 1021px) {
  .process-story__card:has(.story-scene--strategy) {
    grid-template-columns: minmax(0, 0.74fr) minmax(300px, 1.26fr);
    gap: clamp(18px, 2.4vw, 34px);
  }
}
.story-scene--strategy { min-height: 315px; }
.story-workshop-board { inset: 7px; grid-template-rows: 29px 1fr; gap: 11px; padding: 12px; }
.story-workshop-groups { gap: 9px; }
.story-workshop-group { grid-template-rows: 18px repeat(2, minmax(0, 1fr)); gap: 8px; padding: 9px; }
.story-workshop-group > b { font-size: 0.49rem; }
.story-workshop-note { padding: 8px 6px; font-size: 0.55rem; box-shadow: 0 6px 14px rgb(6 21 50 / 12%); }
```

- [ ] **Step 4: Slow and persist the reduced sequence**

Remove `workshop-reduced-board` and `workshop-reduced-final`. Keep the board visible with `animation: none; opacity: 1`. Use note duration `650ms` and delays `350ms`, `950ms`, `1550ms`, `2150ms`, `2750ms`, `3350ms`; animate the priority for `700ms` after `4300ms`. All animations use `both` fill mode.

For mobile set `.story-workshop-board`, `.story-workshop-note`, and `.story-workshop-priority` to `opacity: 1`, `animation: none`, and keep the scene free of overflow.

- [ ] **Step 5: Run full verification and inspect the in-app browser**

Run separately:

```powershell
npm run validate:process
npm run verify:process
npm run build
git diff --check
```

Reload `http://127.0.0.1:4321/#proces`, activate stage 2, capture a mid-animation frame and a frame after 5.5 seconds in the current reduced-motion browser.

Expected: larger visual and notes, visibly slower note sequence, and the same completed board in both frames after completion; no older mockup appears.
