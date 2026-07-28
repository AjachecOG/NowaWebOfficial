# Workshop Note Impact Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make each workshop note hit, squash, rebound, and settle at a unique slight angle without changing the current sequence or persistent board finale.

**Architecture:** Keep the existing DOM and timing delays. Add deterministic `--note-rest-r` values to the six existing note selectors, replace full and reduced note keyframes with impact profiles, and extend source/browser verification to prove contact phases and distinct final rotations.

**Tech Stack:** CSS keyframes, existing React markup, Node source validator, Chrome DevTools Protocol browser verifier.

## Global Constraints

- Six final angles: `-2.2deg`, `1.4deg`, `2.1deg`, `-1.3deg`, `-1.8deg`, `1.9deg`.
- Full impact duration stays `900ms`; existing note delays stay unchanged.
- Reduced impact duration stays `650ms`; existing reduced delays stay unchanged.
- Full motion drops by about `14px`; reduced motion has no positional travel.
- Persistent board, priority, replay, large geometry, and mobile fit remain unchanged.
- Preserve unrelated dirty-worktree changes and leave implementation files unstaged.

---

### Task 1: Implement deterministic impact motion

**Files:**
- Modify: `scripts/validate-process-story.mjs:20-55`
- Modify: `scripts/verify-process-story.mjs:218-290,640-680`
- Modify: `src/components/ProcessIsland.css:1095-1185,1340-1415`

**Interfaces:**
- Consumes: six existing `.story-workshop-note` nodes and their current timing selectors.
- Produces: `--note-rest-r` on each note, `workshop-note-impact`, `workshop-note-impact-reduced`, and six distinct computed final rotations.

- [ ] **Step 1: Write failing source and runtime assertions**

```js
["six workshop note rest angles", (styles.match(/--note-rest-r:/g) ?? []).length === 6],
["workshop note impact contact", styles.includes("workshop-note-impact") && styles.includes("scale(1.04, 0.93)")],
["reduced workshop note impact", styles.includes("workshop-note-impact-reduced") && styles.includes("scale(1.03, 0.96)")],
```

Add final rotations to the strategy frame:

```js
noteRotations: Array.from(scene.querySelectorAll('.story-workshop-note')).map((note) => {
  const matrix = new DOMMatrixReadOnly(getComputedStyle(note).transform);
  return Math.round((Math.atan2(matrix.b, matrix.a) * 180 / Math.PI) * 10) / 10;
}),
```

Assert at completion:

```js
if (new Set(strategyPlayback.complete.noteRotations).size !== 6 ||
    strategyPlayback.complete.noteRotations.some((angle) => Math.abs(angle) < 0.5 || Math.abs(angle) > 3)) {
  failures.push("strategy workshop notes do not settle at distinct slight angles");
}
```

- [ ] **Step 2: Run RED**

Run: `npm run validate:process`, then `npm run verify:process`.

Expected: source checks fail because impact keyframes and rest variables are absent; runtime reports six zero-degree final rotations.

- [ ] **Step 3: Assign deterministic final angles**

Add one value to each existing timing selector in visual order:

```css
--note-rest-r: -2.2deg;
--note-rest-r: 1.4deg;
--note-rest-r: 2.1deg;
--note-rest-r: -1.3deg;
--note-rest-r: -1.8deg;
--note-rest-r: 1.9deg;
```

- [ ] **Step 4: Replace the full note keyframe and selector**

```css
@keyframes workshop-note-impact {
  0% {
    opacity: 0;
    box-shadow: 0 16px 24px rgb(6 21 50 / 5%);
    transform: translateY(-14px) rotate(var(--note-r)) scale(1.16);
  }
  42% {
    opacity: 1;
    box-shadow: 0 2px 4px rgb(6 21 50 / 18%);
    transform: translateY(1px) rotate(var(--note-rest-r)) scale(1.04, 0.93);
  }
  62% {
    box-shadow: 0 8px 15px rgb(6 21 50 / 11%);
    transform: translateY(-2px) rotate(var(--note-rest-r)) scale(0.99, 1.035);
  }
  78% {
    transform: translateY(0) rotate(var(--note-rest-r)) scale(1.015, 0.99);
  }
  100% {
    opacity: 1;
    box-shadow: 0 6px 14px rgb(6 21 50 / 12%);
    transform: rotate(var(--note-rest-r)) scale(1);
  }
}
.process-story[data-story-visible="true"] .process-story__card.is-active .story-workshop-note {
  animation: workshop-note-impact 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
```

- [ ] **Step 5: Replace the reduced keyframe and preserve angles on mobile**

```css
@keyframes workshop-note-impact-reduced {
  0% { opacity: 0; box-shadow: 0 9px 15px rgb(6 21 50 / 7%); transform: rotate(var(--note-rest-r)) scale(1.05); }
  42% { opacity: 1; box-shadow: 0 2px 4px rgb(6 21 50 / 16%); transform: rotate(var(--note-rest-r)) scale(1.03, 0.96); }
  68% { box-shadow: 0 7px 13px rgb(6 21 50 / 11%); transform: rotate(var(--note-rest-r)) scale(0.995, 1.02); }
  100% { opacity: 1; box-shadow: 0 6px 14px rgb(6 21 50 / 12%); transform: rotate(var(--note-rest-r)) scale(1); }
}
```

Use `workshop-note-impact-reduced 650ms ease both` in reduced motion. In the mobile static rule set notes to `transform: rotate(var(--note-rest-r))` rather than `none`.

- [ ] **Step 6: Run full verification and inspect the browser**

Run separately:

```powershell
npm run validate:process
npm run verify:process
npm run build
git diff --check
```

Reload stage 2 in the current browser, capture one note during impact and the final board, and confirm six visibly varied but subtle angles with no overflow or mockup layer.
