# Process Scene Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the repeated process-scene headline with an approved personal before/after progression and remove the stage-3 deployment badge completely.

**Architecture:** Keep the existing scene structure and animation choreography. Change only the two hero text nodes, remove the badge node plus its orphaned CSS, and update both source and browser contracts so they validate the new final DOM instead of the removed status element.

**Tech Stack:** React/TSX, CSS keyframes, Node source validator, Chrome DevTools browser verifier, Astro build.

## Global Constraints

- Stage 3 copy is exactly `To będzie Twoja strona.`
- Stage 4 copy is exactly `To jest Twoja strona.`
- Remove `wdrożone`, `story-code-check`, and its orphaned CSS/animation instead of hiding them.
- Preserve all pencil, paint, powder, reveal, replay, responsive, and reduced-motion behavior.
- Do not refactor unrelated process code or include unrelated dirty-worktree changes in a commit.

---

### Task 1: Update the source contract and process scenes

**Files:**
- Modify: `scripts/validate-process-story.mjs:51-74`
- Modify: `src/components/ProcessIsland.tsx:226-255`
- Modify: `src/components/ProcessIsland.css:1270-1291,1536-1540,1688-1690,1841`

**Interfaces:**
- Consumes: The existing `component` and `styles` strings loaded by `scripts/validate-process-story.mjs`.
- Produces: Exact stage-3/stage-4 copy and a design scene with no `story-code-check` element or related CSS.

- [ ] **Step 1: Write the failing source contract**

Add these checks to `scripts/validate-process-story.mjs`:

```js
["personal process copy", [
  "To będzie Twoja strona.",
  "To jest Twoja strona.",
].every((text) => component.includes(text)) && !component.includes("Strona, która ciekawi.")],
["design deployment badge removed", [
  "story-code-check",
  "story-makeup-status",
].every((token) => !component.includes(token) && !styles.includes(token)) && !component.includes("wdrożone")],
```

Remove `"story-makeup-status"` from the existing `pencil makeup motion` token list because the badge animation will no longer exist.

- [ ] **Step 2: Run the source validator and verify RED**

Run:

```powershell
npm run validate:process
```

Expected: FAIL for `personal process copy` and `design deployment badge removed`, proving the contract observes the current copy and badge.

- [ ] **Step 3: Apply the minimal scene copy and markup change**

In `src/components/ProcessIsland.tsx`, use:

```tsx
<span className="story-page-hero"><b>To będzie Twoja strona.</b><i /></span>
```

for the designed page, and:

```tsx
<span className="story-page-hero"><b>To jest Twoja strona.</b><i /></span>
```

for the live page. Delete this node entirely:

```tsx
<span className="story-code-check"><i /> wdrożone</span>
```

- [ ] **Step 4: Remove only the orphaned badge CSS**

Delete the complete rules for `.story-code-check`, `.story-code-check i`, `@keyframes story-makeup-status`, the active-scene `.story-code-check` animation selector, and the mobile `.story-code-check` override. Leave `story-makeup-settle`, page reveal, and every tool animation unchanged.

- [ ] **Step 5: Run the source validator and verify GREEN**

Run:

```powershell
npm run validate:process
```

Expected: all process source checks PASS, including `personal process copy` and `design deployment badge removed`.

---

### Task 2: Update runtime assertions and verify the rendered result

**Files:**
- Modify: `scripts/verify-process-story.mjs:284-327,579-586,654-695,806-843,938-945,970-1008`
- Verify: `src/components/ProcessIsland.tsx`
- Verify: `src/components/ProcessIsland.css`

**Interfaces:**
- Consumes: The existing runtime frames `drawing`, `pencilReverse`, `makeup`, `paintReturn`, `powder`, `complete`, and `replay`.
- Produces: Runtime checks that validate animation completion without querying the removed badge.

- [ ] **Step 1: Remove the obsolete runtime field**

Delete every `statusOpacity` read from the desktop, reduced-motion, and mobile frame samplers. In `designMobile`, retain only:

```js
return {
  horizontalOverflow: scene.scrollWidth > scene.clientWidth,
  verticalOverflow: scene.scrollHeight > scene.clientHeight,
  designedOpacity: Number(getComputedStyle(scene.querySelector('.story-page-shell--designed')).opacity),
  designClipPath: getComputedStyle(scene.querySelector('.story-page-shell--designed')).clipPath,
};
```

- [ ] **Step 2: Remove only assertions tied to the deleted badge**

Delete the `statusOpacity` conditions from drawing, powder, complete, replay, mobile, and reduced-motion assertions. Preserve pencil opacity, brush direction, powder visibility, sketch fade, final clip path, overflow, running-animation, and replay checks. Change the powder failure message to:

```js
failures.push("powder and precision phase is missing");
```

- [ ] **Step 3: Run the full browser verifier**

Run:

```powershell
npm run verify:process
```

Expected: `Process story browser verification passed.` with no selector errors for `.story-code-check`.

- [ ] **Step 4: Inspect the live scene**

In the local page at `http://127.0.0.1:4321/#proces`, activate stage 3 and stage 4 through their numbered process navigation buttons. Verify:

- Stage 3 renders `To będzie Twoja strona.`
- Stage 3 has no lower deployment badge.
- Stage 4 renders `To jest Twoja strona.`
- The text remains centered and does not overflow at desktop and mobile breakpoints.

- [ ] **Step 5: Run final verification**

Run:

```powershell
npm run validate:process
npm run build
git diff --check
```

Expected: validator PASS, Astro build completes, and `git diff --check` exits 0.

- [ ] **Step 6: Preserve the dirty working tree**

Do not create an implementation commit because the four modified files already contain broader uncommitted process work. Report the exact files changed and leave integration to the user’s selected branch workflow.
