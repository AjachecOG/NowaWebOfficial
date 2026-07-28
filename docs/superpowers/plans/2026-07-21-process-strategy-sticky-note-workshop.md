# Sticky Note Strategy Workshop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stage-2 A/B comparison with a replayable sticky-note workshop that groups insights and resolves into a page direction.

**Architecture:** Keep the scene inside the existing `ProcessVisual` branch in `ProcessIsland.tsx`. Use decorative DOM for the board, six notes, three groups, priority mark, and final layout; drive playback with scoped CSS animations that restart with the active card. Extend the existing source validator and CDP browser verifier before production changes.

**Tech Stack:** Astro, React, TypeScript, CSS keyframes, GSAP/ScrollTrigger stage activation, Node validation scripts, Chrome DevTools Protocol.

## Global Constraints

- Preserve the title and copy for „Strategia i makieta”.
- Use the existing paper, navy, blue, and orange visual language.
- DOM and CSS only; add no image, canvas, or dependency.
- Keep `aria-hidden="true"` because the visual is decorative.
- Full playback lasts about 4.8 seconds, plays once per activation, and holds on „Kierunek gotowy”.
- Reduced playback lasts about 2.2 seconds and uses opacity changes without flying, rotation, loops, or large motion.
- Fit current desktop and mobile containers without internal scrolling or page overflow.
- Preserve unrelated dirty-worktree changes. Do not stage implementation files unless the user explicitly requests it.

---

### Task 1: Replace the source contract and stage markup

**Files:**
- Modify: `scripts/validate-process-story.mjs:20-25`
- Modify: `src/components/ProcessIsland.tsx:170-220`

**Interfaces:**
- Consumes: `ProcessVisual({ index, playConversation })` and the existing `index === 1` branch.
- Produces: `.story-workshop-board`, three `.story-workshop-group` nodes, six `.story-workshop-note` nodes, `.story-workshop-priority`, `.story-workshop-final`, and `Kierunek gotowy`.

- [ ] **Step 1: Write failing source assertions**

Replace the A/B assertions with:

```js
["strategy workshop copy", ["Warsztat strategii", "Cele", "Treści", "Priorytety", "Kierunek gotowy"]
  .every((copy) => component.includes(copy))],
["three strategy workshop groups", (component.match(/className="story-workshop-group"/g) ?? []).length === 3],
["six strategy workshop notes", (component.match(/className="story-workshop-note"/g) ?? []).length === 6],
["strategy workshop final", component.includes("story-workshop-final story-scene__final")],
["old strategy showdown removed", !["story-direction-duel", "story-direction--a", "story-direction--b", "Wybrany kierunek"]
  .some((legacy) => component.includes(legacy))],
```

- [ ] **Step 2: Run RED**

Run: `npm run validate:process`

Expected: FAIL for workshop copy, groups, notes, final, and old-showdown removal.

- [ ] **Step 3: Replace only the `index === 1` JSX branch**

```tsx
if (index === 1) {
  const workshopGroups = [
    { label: "Cele", notes: ["Zaciekawić", "Pokazać efekt"] },
    { label: "Treści", notes: ["Prosta historia", "Mocny nagłówek"] },
    { label: "Priorytety", notes: ["Jeden kierunek", "Jasne CTA"] },
  ];

  return (
    <div className="process-visual story-scene story-scene--strategy" data-process-scene="strategy" aria-hidden="true">
      <div className="story-workshop-board">
        <strong className="story-workshop-title"><i />Warsztat strategii</strong>
        <div className="story-workshop-groups">
          {workshopGroups.map((group) => (
            <section className="story-workshop-group" key={group.label}>
              <b>{group.label}</b>
              {group.notes.map((note) => <span className="story-workshop-note" key={note}>{note}</span>)}
            </section>
          ))}
        </div>
        <span className="story-workshop-priority" />
      </div>
      <div className="story-workshop-final story-scene__final">
        <span className="story-workshop-final-nav"><i /><i /><i /></span>
        <span className="story-workshop-final-hero"><i /><i /></span>
        <span className="story-workshop-final-grid"><i /><i /></span>
        <span className="story-workshop-final-cta" />
        <b>Kierunek gotowy</b>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run GREEN and inspect scope**

Run: `npm run validate:process`

Expected: new markup checks PASS.

Run: `git diff -- scripts/validate-process-story.mjs src/components/ProcessIsland.tsx`

Expected: only strategy assertions and the `index === 1` visual branch change; leave files unstaged.

---

### Task 2: Implement the full 4.8-second playback

**Files:**
- Modify: `scripts/verify-process-story.mjs:218-250,610-632`
- Modify: `src/components/ProcessIsland.css:712-898,1153-1266`

**Interfaces:**
- Consumes: Task 1 workshop classes and the existing `.process-story[data-story-visible="true"] .process-story__card.is-active` replay trigger.
- Produces: observable note-reveal, grouped-priority, and final-layout states.

- [ ] **Step 1: Write the failing runtime sample**

Replace `strategyPlayback` with a sample that activates progress `1 / 3`, then records at 900ms, 3000ms, and 5200ms:

```js
const sample = () => ({
  noteCount: scene.querySelectorAll('.story-workshop-note').length,
  visibleNotes: [...scene.querySelectorAll('.story-workshop-note')]
    .filter((note) => Number(getComputedStyle(note).opacity) > 0.7).length,
  boardOpacity: Number(getComputedStyle(scene.querySelector('.story-workshop-board')).opacity),
  priorityOpacity: Number(getComputedStyle(scene.querySelector('.story-workshop-priority')).opacity),
  finalOpacity: Number(getComputedStyle(scene.querySelector('.story-workshop-final')).opacity),
  finalText: scene.querySelector('.story-workshop-final > b')?.textContent ?? '',
  running: scene.getAnimations({ subtree: true }).filter((item) => item.playState === 'running').length,
});
```

Use these assertions:

```js
if (strategyPlayback.reveal.noteCount !== 6 || strategyPlayback.reveal.visibleNotes < 1 ||
    strategyPlayback.reveal.visibleNotes >= 6 || strategyPlayback.reveal.running < 1) {
  failures.push("strategy workshop does not stagger note entry");
}
if (strategyPlayback.grouped.visibleNotes !== 6 || strategyPlayback.grouped.priorityOpacity < 0.7 ||
    strategyPlayback.grouped.finalOpacity > 0.2) {
  failures.push("strategy workshop does not group and prioritize notes");
}
if (strategyPlayback.complete.boardOpacity > 0.1 || strategyPlayback.complete.finalOpacity < 0.9 ||
    strategyPlayback.complete.finalText !== "Kierunek gotowy") {
  failures.push("strategy workshop does not resolve into the final direction");
}
```

- [ ] **Step 2: Run RED**

Run: `npm run verify:process`

Expected: FAIL because notes have no staged styling and the final is visible immediately.

- [ ] **Step 3: Replace old A/B CSS with complete workshop states**

```css
.story-workshop-board,
.story-workshop-final { position: absolute; inset: 16px; }
.story-workshop-board {
  display: grid; grid-template-rows: 25px 1fr; gap: 10px; padding: 10px;
  border: 1px solid rgb(5 87 242 / 16%); border-radius: 12px;
  background: linear-gradient(145deg, #fff, #fffaf1);
  box-shadow: 0 10px 26px rgb(6 21 50 / 8%); opacity: 0;
}
.story-workshop-title { display: flex; gap: 6px; align-items: center; color: var(--process-ink); font-size: .55rem; font-weight: 900; }
.story-workshop-title i { width: 7px; height: 7px; border-radius: 50%; background: var(--process-orange); }
.story-workshop-groups { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
.story-workshop-group {
  position: relative; display: grid; grid-template-rows: 15px repeat(2, minmax(0, 1fr));
  gap: 6px; min-width: 0; padding: 7px; border: 1px dashed rgb(5 87 242 / 16%);
  border-radius: 9px; background: rgb(5 87 242 / 2%);
}
.story-workshop-group > b { color: rgb(6 21 50 / 56%); font-size: .43rem; font-weight: 900; text-transform: uppercase; }
.story-workshop-note {
  display: grid; min-width: 0; place-items: center; padding: 5px; border-radius: 3px;
  background: #dceaff; color: var(--process-ink); box-shadow: 0 4px 9px rgb(6 21 50 / 9%);
  font-size: .42rem; font-weight: 850; line-height: 1.05; text-align: center; opacity: 0;
}
.story-workshop-group:nth-child(2) .story-workshop-note { background: #fff0bc; }
.story-workshop-group:nth-child(3) .story-workshop-note { background: #ffe0d7; }
.story-workshop-priority {
  position: absolute; right: 8px; bottom: 7px; width: calc(33.333% - 12px); height: calc(50% - 9px);
  border: 2px solid var(--process-orange); border-radius: 50%; opacity: 0; transform: rotate(-5deg);
}
.story-workshop-final {
  display: grid; grid-template-rows: 18px 1fr .55fr 12px; gap: 7px; padding: 12px;
  border: 1px solid rgb(5 87 242 / 18%); border-radius: 12px; background: #fff; opacity: 0;
}
.story-workshop-final-nav, .story-workshop-final-hero, .story-workshop-final-grid {
  display: grid; gap: 6px; border-radius: 6px; background: rgb(5 87 242 / 6%);
}
.story-workshop-final-nav { grid-template-columns: 2fr repeat(2, 1fr); padding: 6px; }
.story-workshop-final-nav i { border-radius: 4px; background: rgb(5 87 242 / 28%); }
.story-workshop-final-hero { place-content: center; padding: 10px; }
.story-workshop-final-hero i:first-child { width: 80px; height: 8px; background: var(--process-blue); }
.story-workshop-final-hero i:last-child { width: 54px; height: 5px; background: rgb(255 92 53 / 42%); }
.story-workshop-final-grid { grid-template-columns: repeat(2, 1fr); }
.story-workshop-final-grid i { margin: 6px; border-radius: 5px; background: rgb(5 87 242 / 10%); }
.story-workshop-final-cta { width: 46px; border-radius: 5px; background: var(--process-orange); }
.story-workshop-final > b { position: absolute; right: 10px; bottom: 9px; font-size: .46rem; color: var(--process-blue); }
```

- [ ] **Step 4: Add the full-motion keyframes and active selectors**

```css
@keyframes workshop-board-sequence {
  0% { opacity: 0; transform: scale(.96); }
  10%, 78% { opacity: 1; transform: none; }
  100% { opacity: 0; transform: scale(1.02); }
}
@keyframes workshop-note-in {
  0% { opacity: 0; transform: translate(var(--note-x), var(--note-y)) rotate(var(--note-r)) scale(.72); }
  55% { opacity: 1; transform: translate(0, 0) rotate(0) scale(1.06); }
  100% { opacity: 1; transform: none; }
}
@keyframes workshop-priority-in { from { opacity: 0; clip-path: inset(0 100% 0 0); } to { opacity: 1; clip-path: inset(0); } }
@keyframes workshop-final-in { from { opacity: 0; transform: translateY(8px) scale(.96); } to { opacity: 1; transform: none; } }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-workshop-board {
  animation: workshop-board-sequence 4300ms cubic-bezier(.16, 1, .3, 1) both;
}
.process-story[data-story-visible="true"] .process-story__card.is-active .story-workshop-note {
  animation: workshop-note-in 620ms cubic-bezier(.16, 1, .3, 1) both;
}
.story-workshop-note:nth-of-type(1) { --note-x: -34px; --note-y: -24px; --note-r: -8deg; animation-delay: 400ms !important; }
.story-workshop-note:nth-of-type(2) { --note-x: 24px; --note-y: -28px; --note-r: 7deg; animation-delay: 700ms !important; }
.story-workshop-group:nth-child(2) .story-workshop-note:nth-of-type(1) { --note-x: 8px; --note-y: 34px; --note-r: 6deg; animation-delay: 1000ms !important; }
.story-workshop-group:nth-child(2) .story-workshop-note:nth-of-type(2) { --note-x: -22px; --note-y: 26px; --note-r: -6deg; animation-delay: 1300ms !important; }
.story-workshop-group:nth-child(3) .story-workshop-note:nth-of-type(1) { --note-x: 34px; --note-y: -18px; --note-r: 8deg; animation-delay: 1600ms !important; }
.story-workshop-group:nth-child(3) .story-workshop-note:nth-of-type(2) { --note-x: 30px; --note-y: 24px; --note-r: -7deg; animation-delay: 1900ms !important; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-workshop-priority {
  animation: workshop-priority-in 720ms 2700ms ease both;
}
.process-story[data-story-visible="true"] .process-story__card.is-active .story-workshop-final {
  animation: workshop-final-in 700ms 4100ms cubic-bezier(.16, 1, .3, 1) both;
}
```

- [ ] **Step 5: Run GREEN and inspect scope**

Run: `npm run verify:process`

Expected: PASS for reveal, grouping, priority, and final direction.

Run: `git diff -- scripts/verify-process-story.mjs src/components/ProcessIsland.css`

Expected: A/B samples/styles are removed and workshop motion is scoped to stage 2; leave files unstaged.

---

### Task 3: Reduced motion, mobile fit, replay, and final QA

**Files:**
- Modify: `scripts/verify-process-story.mjs:465-560,710-746`
- Modify: `src/components/ProcessIsland.css:1325-1460`

**Interfaces:**
- Consumes: Tasks 1-2 workshop markup and full motion.
- Produces: a 2.2-second opacity-only reduced sequence, compact mobile layout, and replay/overflow evidence.

- [ ] **Step 1: Write failing reduced-motion and mobile assertions**

Activate stage 2 under `prefers-reduced-motion: reduce`, sample at 450ms and 2550ms, and capture:

```js
const state = () => ({
  visibleNotes: [...scene.querySelectorAll('.story-workshop-note')]
    .filter((note) => Number(getComputedStyle(note).opacity) > 0.7).length,
  finalOpacity: Number(getComputedStyle(scene.querySelector('.story-workshop-final')).opacity),
  running: scene.getAnimations({ subtree: true }).filter((item) => item.playState === 'running').length,
  overflow: scene.scrollWidth > scene.clientWidth || scene.scrollHeight > scene.clientHeight,
});
```

Assert:

```js
if (reducedStrategy.reveal.running < 1 || reducedStrategy.reveal.visibleNotes >= 6 ||
    reducedStrategy.complete.finalOpacity < 0.9 || reducedStrategy.complete.overflow) {
  failures.push("reduced-motion strategy workshop is static, incomplete, or overflowing");
}
if (reduced.otherSceneAnimationCount !== 0) {
  failures.push("reduced-motion non-strategy process scenes still animate");
}
```

Replay by navigating stage 2 → stage 1 → stage 2 and require `running > 0` plus `visibleNotes < 6` at 450ms. On mobile after 5.2 seconds require six notes, final opacity above `.9`, and no horizontal or vertical overflow.

- [ ] **Step 2: Run RED**

Run: `npm run verify:process`

Expected: FAIL because the current reduced selector suppresses strategy animation and mobile has no workshop sizing.

- [ ] **Step 3: Add the reduced sequence and exclude strategy from blanket suppression**

Delete the existing reduced-motion selectors for `.story-strategy-brief`, `.story-direction-duel`, `.story-direction--a`, `.story-direction--b`, `.story-direction-stamp`, `.story-strategy-score-fill`, and `.story-strategy-final`, then use:

```css
[data-process-scene]:not([data-process-scene="conversation"]):not([data-process-scene="strategy"]) *,
[data-process-scene]:not([data-process-scene="conversation"]):not([data-process-scene="strategy"]) *::before,
[data-process-scene]:not([data-process-scene="conversation"]):not([data-process-scene="strategy"]) *::after {
  animation: none !important;
  transition: none !important;
}
@keyframes workshop-reduced-board { 0%, 82% { opacity: 1; transform: none; } 100% { opacity: 0; transform: none; } }
@keyframes workshop-reduced-note { from { opacity: 0; transform: none; } to { opacity: 1; transform: none; } }
@keyframes workshop-reduced-priority { from { opacity: 0; } to { opacity: 1; } }
@keyframes workshop-reduced-final { from { opacity: 0; transform: none; } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .process-story[data-story-visible="true"] .process-story__card.is-active .story-workshop-board {
    animation: workshop-reduced-board 1800ms ease both;
  }
  .process-story[data-story-visible="true"] .process-story__card.is-active .story-workshop-note {
    animation: workshop-reduced-note 420ms ease both; transform: none;
  }
  .process-story[data-story-visible="true"] .process-story__card.is-active .story-workshop-note:nth-of-type(1) { animation-delay: 180ms !important; }
  .process-story[data-story-visible="true"] .process-story__card.is-active .story-workshop-note:nth-of-type(2) { animation-delay: 520ms !important; }
  .process-story[data-story-visible="true"] .process-story__card.is-active .story-workshop-priority {
    animation: workshop-reduced-priority 380ms 1050ms ease both;
  }
  .process-story[data-story-visible="true"] .process-story__card.is-active .story-workshop-final {
    animation: workshop-reduced-final 420ms 1800ms ease both;
  }
}
```

- [ ] **Step 4: Add compact mobile sizing inside `@media (max-width: 760px)`**

```css
.story-scene--strategy { min-height: 230px; }
.story-workshop-board, .story-workshop-final { inset: 12px; }
.story-workshop-board { padding: 8px; gap: 7px; }
.story-workshop-groups { gap: 5px; }
.story-workshop-group { gap: 4px; padding: 5px; }
.story-workshop-group > b { font-size: .38rem; }
.story-workshop-note { padding: 4px 2px; font-size: .37rem; }
```

- [ ] **Step 5: Run full verification**

Run each command separately:

```powershell
npm run validate:process
npm run verify:process
npm run build
git diff --check
```

Expected: all exit `0`. Browser verification proves full motion, reduced motion, replay, desktop fit, and mobile fit. `git diff --check` may print existing LF/CRLF warnings but no whitespace errors.

- [ ] **Step 6: Verify the actual in-app browser**

Reload `http://127.0.0.1:4321/#proces`, activate „2. Strategia i makieta”, and observe the current reduced-motion environment.

Expected: notes visibly reveal in groups, priorities highlight, then the scene fades to „Kierunek gotowy”; capture a workshop screenshot and a final screenshot, and confirm computed overflow is false.

- [ ] **Step 7: Review scope without staging dirty implementation files**

Run separately:

```powershell
git diff -- scripts/validate-process-story.mjs scripts/verify-process-story.mjs src/components/ProcessIsland.tsx src/components/ProcessIsland.css
git status --short
```

Expected: A/B implementation/tests are replaced by the sticky-note workshop, unrelated user changes remain untouched, and implementation files remain unstaged.
