# Process Launch Readability and Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the launch spinner visibly rotate, localize its labels, and make configuration messages large and readable without visible stop markers.

**Architecture:** Preserve the existing three-phase launch timeline and its 24/67/88 percent holds. Change only launch markup, scoped CSS, the JSON design specification, and the existing structural/browser verification scripts; do not add dependencies or React timers.

**Tech Stack:** Astro, React/TSX, CSS animations, Node.js validation, Chrome DevTools Protocol.

## Global Constraints

- Upload copy is exactly `Publikowanie…` followed by `Opublikowano`.
- The dot ring visibly changes rotation during the upload phase and slows only near its end.
- The word `Konfiguracja` is absent from the launch scene.
- Exactly one configuration status is visible above the progress bar at each 24%, 67%, and 88% hold.
- Configuration status computed font size is at least 12px on desktop and mobile.
- Stop percentages remain timing values but have no visible marker elements on the bar.
- The 9-second sequence, replay behavior, completed state, reduced-motion override, and no-overflow guarantees remain unchanged.

---

### Task 1: Protect the revised behavior with failing tests

**Files:**
- Modify: `scripts/verify-process-story.mjs`
- Modify: `scripts/validate-process-story.mjs`

**Interfaces:**
- Consumes: `[data-process-scene="launch"]`, `.story-upload-spinner__dots`, `.story-config-status`, and `.story-config-progress__fill`.
- Produces: observable checks for spinner rotation, localized copy, status placement/readability, and absent marker elements.

- [ ] Add browser samples of the spinner transform at two upload-phase timestamps and require different transforms.
- [ ] Sample each configuration hold and require one visible status, a computed font size of at least 12px, and a status bottom edge above the progress bar top edge.
- [ ] Require zero `.story-config-progress > i` marker elements and no `Konfiguracja`, `Uploading…`, or `Uploaded` text in the launch scene.
- [ ] Run `npm run verify:process` and `npm run validate:process`; confirm both fail for the intended old behavior.

### Task 2: Implement the localized, readable animation

**Files:**
- Modify: `src/components/ProcessIsland.tsx`
- Modify: `src/components/ProcessIsland.css`

**Interfaces:**
- Consumes: the existing active-card CSS animation lifecycle.
- Produces: localized upload labels, a continuously rotating dot ring, a fixed status slot above the bar, and a marker-free progress track.

- [ ] Replace `Uploading…` with `Publikowanie…` and `Uploaded` with `Opublikowano`.
- [ ] Remove the `Konfiguracja` heading and the three marker `<i>` elements while retaining `data-progress="24|67|88"` on statuses.
- [ ] Give the dot ring an explicit centered transform origin and a multi-stage rotation keyframe with clear continuous motion and a final deceleration.
- [ ] Position all statuses in one fixed-height slot above the bar, center them, use at least 12px text, and keep the longest message on one line where space permits.
- [ ] Run `npm run validate:process` and `npm run verify:process`; confirm both pass.

### Task 3: Final verification

**Files:**
- Verify: `src/components/ProcessIsland.tsx`
- Verify: `src/components/ProcessIsland.css`
- Verify: `docs/superpowers/specs/2026-07-25-process-launch-upload-configuration-design.json`

**Interfaces:**
- Consumes: the completed launch scene.
- Produces: build and visual evidence for the final implementation.

- [ ] Parse the JSON specification and run `git diff --check`.
- [ ] Run `npm run build` and require exit code 0.
- [ ] In the local browser, activate stage 4 under native reduced motion; verify the ring changes orientation, configuration copy appears above the unmarked bar, and no overflow occurs.
- [ ] Keep the verified local page open as the deliverable browser tab.
