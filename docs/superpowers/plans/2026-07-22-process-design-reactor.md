# Process Design Reactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the third process visual into a strategy-token-powered reactor that transforms a wireframe into the finished design and resolves into `wdrożone`.

**Architecture:** Extend the existing design-scene JSX with decorative reactor layers and drive the complete sequence through CSS keyframes scoped to the established active/visible selector. Preserve the existing React/GSAP scroll lifecycle and add source/runtime checks to the current process verification scripts.

**Tech Stack:** Astro, React, TypeScript, CSS keyframes, GSAP ScrollTrigger lifecycle, Node validation scripts, Chrome DevTools Protocol runtime verifier.

## Global Constraints

- No new dependencies or image assets.
- Do not modify process steps one, two, or four.
- Final visible status remains `wdrożone`.
- The complete Design Reactor animation plays regardless of `prefers-reduced-motion`; other scenes retain their existing preference handling.
- Preserve all unrelated working-tree changes.

---

### Task 1: Add the reactor contract test

**Files:**
- Modify: `scripts/validate-process-story.mjs`
- Test: `scripts/validate-process-story.mjs`

**Interfaces:**
- Consumes: current source-string validation arrays.
- Produces: checks for `.story-reactor-token`, `.story-reactor-core`, `.story-reactor-wave`, `.story-reactor-trail`, `story-reactor-impact`, and the always-on animation exception.

- [ ] **Step 1: Write the failing validation checks**

```js
["design reactor structure", ["story-reactor-token", "story-reactor-core", "story-reactor-wave", "story-reactor-trail"].every((name) => component.includes(name))],
["design reactor motion", ["story-reactor-flight", "story-reactor-impact", "story-reactor-reveal", "story-reactor-trail-run"].every((name) => styles.includes(name))],
["design reactor reduced final", styles.includes(".story-reactor-token") && styles.includes("clip-path: inset(0)")],
```

- [ ] **Step 2: Run validation to verify RED**

Run: `npm run validate:process`
Expected: FAIL for all new reactor checks because the elements and keyframes do not exist.

- [ ] **Step 3: Keep the checks focused**

Confirm the checks reference only the selected design scene and do not require changes to other process steps.

### Task 2: Build the design reactor

**Files:**
- Modify: `src/components/ProcessIsland.tsx`
- Modify: `src/components/ProcessIsland.css`
- Test: `scripts/validate-process-story.mjs`

**Interfaces:**
- Consumes: `[data-story-visible="true"] .process-story__card.is-active` scene lifecycle.
- Produces: decorative reactor DOM and CSS sequence ending in the existing `.story-code-check` final state.

- [ ] **Step 1: Add the minimal reactor JSX**

```tsx
<span className="story-reactor-token"><i />kierunek</span>
<span className="story-reactor-core"><i /><i /><i /></span>
<span className="story-reactor-wave" />
<span className="story-reactor-trail" />
```

Place the layers between the wireframe shell and designed shell so stacking remains explicit.

- [ ] **Step 2: Add the reactor layout and final-frame styles**

Define fixed percentages inside `.story-scene--design`, keep all layers pointer-inert, and make the designed shell fully readable as the static fallback.

- [ ] **Step 3: Add the active-scene choreography**

Create `story-reactor-flight`, `story-reactor-impact`, `story-reactor-reveal`, `story-reactor-trail-run`, `story-reactor-status`, and `story-reactor-settle` keyframes. Scope every animation to the existing active/visible selector and use backwards fill where a delayed element must stay hidden.

- [ ] **Step 4: Add responsive and reduced-motion states**

At `max-width: 760px`, shorten token/trail translations and remove perspective. Exclude the design scene from the reduced-motion animation reset so the complete reactor choreography always runs when the third card is active.

- [ ] **Step 5: Run validation to verify GREEN**

Run: `npm run validate:process`
Expected: PASS with zero failed checks.

### Task 3: Verify runtime choreography and layout

**Files:**
- Modify: `scripts/verify-process-story.mjs`
- Test: `scripts/verify-process-story.mjs`

**Interfaces:**
- Consumes: reactor DOM classes and computed CSS animation states.
- Produces: runtime assertions for initial, impact, final, mobile, and reduced-motion frames.

- [ ] **Step 1: Add runtime frame sampling**

Sample the third scene after activating its scroll segment at approximately 250 ms, 1250 ms, and 3900 ms. Record token opacity, core opacity, designed-shell clip-path, status opacity, and running animation count.

- [ ] **Step 2: Add mobile and motion-preference assertions**

Assert no horizontal overflow at 390 px. Under reduced motion, assert the same entry, impact, reveal, and completed frames as under `no-preference`.

- [ ] **Step 3: Run focused runtime verification**

Run: `npm run verify:process`
Expected: PASS with no runtime exceptions and all reactor frame assertions true.

- [ ] **Step 4: Run the production build**

Run: `npm run build`
Expected: Astro build exits 0 without TypeScript or CSS errors.

- [ ] **Step 5: Inspect the live scene**

Use the existing local page at `http://127.0.0.1:4321/`, activate the third process step, and visually confirm the token-to-wave-to-status narrative at desktop and mobile widths.
