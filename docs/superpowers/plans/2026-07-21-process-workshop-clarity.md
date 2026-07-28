# Process Workshop Clarity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enlarge the strategy workshop and raise its desktop typography to a crisp, readable scale while preserving all six notes and their animation.

**Architecture:** Keep the existing React markup and motion lifecycle unchanged. Make a focused CSS sizing pass, then lock the new visual thresholds into the existing static and Playwright process checks.

**Tech Stack:** Astro, React, native CSS, GSAP, Node.js validation, Chrome DevTools Protocol verification

## Global Constraints

- Preserve all six note strings, impact timing, final rotations, priority ring, replay, reduced-motion behavior, and static mobile state.
- Desktop scene height must be at least 390px in browser verification.
- Desktop sticky-note text must be at least 12px in browser verification.
- Do not add dependencies or change React markup.
- Keep the strategy scene overflow-free at desktop, compact desktop, and mobile sizes.

---

### Task 1: Lock in the readability regression

**Files:**
- Modify: `scripts/validate-process-story.mjs:21-28`
- Modify: `scripts/verify-process-story.mjs:661-664`

**Interfaces:**
- Consumes: existing CSS source text and `strategyPlayback.complete` browser measurements
- Produces: contract failures until the enlarged CSS is implemented

- [ ] **Step 1: Write the failing static checks**

Add checks requiring `min-height: 400px`, `font-size: 0.78rem`, and the desktop strategy layout marker.

- [ ] **Step 2: Raise the browser thresholds**

Change the existing browser assertion to require `visualHeight >= 390` and `noteFontSize >= 12`.

- [ ] **Step 3: Run tests to verify RED**

Run: `npm run validate:process` and `npm run verify:process`

Expected: both commands fail only on the new workshop size/readability requirements.

### Task 2: Enlarge and sharpen the workshop

**Files:**
- Modify: `src/components/ProcessIsland.css:190-195`
- Modify: `src/components/ProcessIsland.css:311-313`
- Modify: `src/components/ProcessIsland.css:723-839`
- Modify: `src/components/ProcessIsland.css:1263-1371`

**Interfaces:**
- Consumes: the existing `.story-scene--strategy` and `.story-workshop-*` class structure
- Produces: a 400px desktop strategy scene with 12.48px note copy and responsive overrides

- [ ] **Step 1: Expand the desktop strategy card**

Use a wider strategy visual column, a tighter strategy-specific gap and padding, and a `400px` strategy scene.

- [ ] **Step 2: Increase board typography and spacing**

Set the title to `0.75rem`, group labels to `0.66rem`, note copy to `0.78rem`, and increase board, group, and note spacing proportionally.

- [ ] **Step 3: Tune tablet and mobile overrides**

Use an intermediate `350px` tablet scene. Keep the mobile scene at `230px`, increase mobile note copy carefully, and preserve static final rotations.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `npm run validate:process` and `npm run verify:process`

Expected: both commands pass, including final rotations, replay, reduced motion, and overflow checks.

### Task 3: Production and visual verification

**Files:**
- Verify only: `src/components/ProcessIsland.css`

**Interfaces:**
- Consumes: completed CSS and local Astro development page
- Produces: ready-to-ship evidence

- [ ] **Step 1: Inspect the completed desktop state in the local browser**

Confirm computed strategy height, note font size, six final rotations, visible priority ring, and no console errors.

- [ ] **Step 2: Inspect responsive behavior**

Confirm no overflow at compact desktop and mobile sizes.

- [ ] **Step 3: Run production checks**

Run: `npm run build` and `git diff --check`

Expected: build exits 0 and diff check reports no whitespace errors.

