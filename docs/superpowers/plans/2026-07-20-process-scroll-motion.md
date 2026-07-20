# Smooth Process Scroll Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace discrete process-step switching with a GSAP ScrollTrigger timeline whose card stack follows scroll continuously and smoothly.

**Architecture:** Keep the existing Astro React island, sticky scene, markup, and mobile flow. `@gsap/react` owns a scoped GSAP context; a single ScrollTrigger maps the section scroll range to a three-segment timeline, while React state is updated only for accessibility and navigation labels.

**Tech Stack:** Astro, React, TypeScript, GSAP, `@gsap/react`, ScrollTrigger, CSS, Node validation scripts, headless Chrome CDP verification.

## Global Constraints

- Preserve the current content, colors, card dimensions, and section structure.
- Do not add GSAP pinning; the existing CSS sticky scene remains responsible for layout.
- Do not use snap, global scroll listeners, or automatic scrolling unrelated to a deliberate click/focus action.
- Desktop motion starts above 760 px; mobile 390 px remains a natural non-overlapping list.
- Reduced-motion mode keeps gentle scrubbed state changes but removes rotation, tilt, and large displacement.
- Scope edits to the process component, its CSS, its two validators, and GSAP dependency metadata.

---

### Task 1: Continuous GSAP Scroll Engine

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `scripts/validate-process-story.mjs`
- Modify: `src/components/ProcessIsland.tsx`
- Modify: `src/components/ProcessIsland.css`

**Interfaces:**
- Consumes: `.process-story`, `.process-story__card`, `.process-story__rail span`, and the existing four-step `steps` array.
- Produces: `getScrollPose(index: number, stage: number, reduced: boolean): ProcessPose` and one scoped ScrollTrigger referenced by `scrollTriggerRef`.

- [ ] **Step 1: Write the failing static contract**

Replace the observer checks in `scripts/validate-process-story.mjs` with assertions equivalent to:

```js
["GSAP React integration", component.includes('from "@gsap/react"')],
["ScrollTrigger integration", component.includes('from "gsap/ScrollTrigger"')],
["scrubbed scroll timeline", component.includes("scrub:")],
["scoped GSAP cleanup", component.includes("useGSAP(") && component.includes("matchMedia")],
["continuous card poses", component.includes("getScrollPose")],
["no observer step switching", !component.includes("IntersectionObserver")],
["no global scroll listener", !component.includes('addEventListener("scroll"')],
["GSAP transition isolation", styles.includes('[data-motion="gsap"]')],
```

- [ ] **Step 2: Run the static validator and observe the expected failure**

Run: `npm run validate:process`

Expected: FAIL for GSAP integration, ScrollTrigger, scrub, cleanup, continuous poses, observer removal, and transition isolation.

- [ ] **Step 3: Add the animation dependencies**

Run: `npm install gsap @gsap/react`

Expected: `package.json` and `package-lock.json` contain `gsap` and `@gsap/react` as production dependencies.

- [ ] **Step 4: Implement continuous poses and the scoped timeline**

In `ProcessIsland.tsx`, register the plugins and replace the observer effect with a scoped hook:

```tsx
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type ProcessPose = {
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
};

function getScrollPose(index: number, stage: number, reduced: boolean): ProcessPose {
  const depth = index - stage;
  const distance = Math.abs(depth);
  if (depth === 0) return { y: 0, scale: 1, rotation: 0, opacity: 1 };
  if (depth < 0) {
    return {
      y: distance * (reduced ? -8 : -24),
      scale: Math.max(reduced ? 0.96 : 0.88, 1 - distance * (reduced ? 0.012 : 0.035)),
      rotation: reduced ? 0 : distance * -0.35,
      opacity: Math.max(0.44, 0.72 - distance * 0.08),
    };
  }
  return {
    y: depth * (reduced ? 22 : 62),
    scale: Math.max(reduced ? 0.96 : 0.88, 0.97 - depth * (reduced ? 0.008 : 0.018)),
    rotation: reduced ? 0 : depth * 0.45,
    opacity: Math.max(0.26, 0.48 - (depth - 1) * 0.08),
  };
}
```

Inside `useGSAP`, set the initial stage, build three linear one-second transitions, animate the rail over the full duration, and update React only when the rounded stage changes:

```tsx
const mm = gsap.matchMedia();
mm.add("(min-width: 761px)", () => {
  const cards = gsap.utils.toArray<HTMLElement>(".process-story__card");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const timeline = gsap.timeline({ defaults: { ease: "none" } });

  const toVars = (pose: ProcessPose) => ({
    "--card-y": `${pose.y}px`,
    "--card-scale": pose.scale,
    "--card-rotate": `${pose.rotation}deg`,
    "--card-opacity": pose.opacity,
  });

  cards.forEach((card, index) => gsap.set(card, toVars(getScrollPose(index, 0, reduced))));
  for (let stage = 1; stage < steps.length; stage += 1) {
    cards.forEach((card, index) => {
      timeline.to(card, { ...toVars(getScrollPose(index, stage, reduced)), duration: 1 }, stage - 1);
    });
  }
  timeline.fromTo(".process-story__rail span", { scaleY: 0 }, { scaleY: 1, duration: 3 }, 0);

  const microSelectors = [
    ".brief-bubble, .brief-checks b",
    ".wireframe-hero, .wireframe-grid i",
    ".design-canvas i, .design-canvas b, .design-swatches i, .design-cursor",
    ".launch-orbit, .launch-core, .launch-status",
  ];
  const firstMicro = gsap.utils.toArray<HTMLElement>(microSelectors[0], cards[0]);
  gsap.set(firstMicro, { autoAlpha: 1, y: 0 });
  for (let stage = 1; stage < steps.length; stage += 1) {
    const targets = gsap.utils.toArray<HTMLElement>(microSelectors[stage], cards[stage]);
    timeline.fromTo(
      targets,
      { autoAlpha: 0.25, y: reduced ? 4 : 14 },
      { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.035, ease: "power2.out" },
      stage - 0.28,
    );
  }

  scrollTriggerRef.current = ScrollTrigger.create({
    trigger: story,
    start: "top top+=80",
    end: "bottom bottom",
    animation: timeline,
    scrub: reduced ? 0.35 : 0.7,
    invalidateOnRefresh: true,
    onUpdate: (self) => setActive(Math.round(self.progress * (steps.length - 1))),
  });
});
return () => mm.revert();
```

Animate the existing card CSS variables so pointer tilt remains composable. Render every card with the stage-zero inline pose, leave React state responsible only for classes and ARIA, and set `data-motion="gsap"` on the story root. The scoped micro timelines replace the active-class CSS keyframes and reverse with scroll.

- [ ] **Step 5: Remove CSS interpolation that fights scrub**

Add focused overrides in `ProcessIsland.css`:

```css
.process-story[data-motion="gsap"] .process-story__card {
  transition: border-color 360ms ease, box-shadow 360ms ease;
}

.process-story[data-motion="gsap"] .process-story__rail span {
  transition: none;
}

.process-story[data-motion="gsap"] .process-visual * {
  animation: none;
  transition: none;
}
```

Do not change mobile positioning rules or the existing hover tilt.

- [ ] **Step 6: Run the static validator and build**

Run: `npm run validate:process`

Expected: every process contract reports PASS.

Run: `npm run build`

Expected: Astro builds one page without TypeScript or bundling errors.

- [ ] **Step 7: Commit the continuous engine**

```bash
git add package.json package-lock.json scripts/validate-process-story.mjs src/components/ProcessIsland.tsx src/components/ProcessIsland.css
git commit -m "feat: add scrubbed GSAP process motion"
```

---

### Task 2: Scroll-Aware Navigation and Runtime Regression Test

**Files:**
- Modify: `scripts/verify-process-story.mjs`
- Modify: `src/components/ProcessIsland.tsx`

**Interfaces:**
- Consumes: the `scrollTriggerRef` created in Task 1 and four navigation/card buttons.
- Produces: `activateStep(index: number)` that scrolls to `trigger.start + (trigger.end - trigger.start) * index / 3`.

- [ ] **Step 1: Extend the browser test and observe failure**

Before changing navigation, extend `scripts/verify-process-story.mjs` to sample two close scroll positions within the first segment and assert that the first card transform changes while `data-active` remains unchanged:

```js
const continuousMotion = await evaluate(client, `(async () => {
  const story = document.querySelector('.process-story');
  const card = document.querySelector('.process-story__card');
  const top = story.getBoundingClientRect().top + window.scrollY - 80;
  const range = story.offsetHeight - window.innerHeight + 80;
  const sample = async (progress) => {
    window.scrollTo({ top: top + range * progress, behavior: 'instant' });
    await new Promise((resolve) => setTimeout(resolve, 220));
    return {
      active: story.dataset.active,
      transform: getComputedStyle(card).transform,
    };
  };
  return { first: await sample(0.08), second: await sample(0.14) };
})()`);

if (continuousMotion.first.active !== continuousMotion.second.active) {
  failures.push('close scroll samples cross an active-stage boundary');
}
if (continuousMotion.first.transform === continuousMotion.second.transform) {
  failures.push('card transform does not follow scroll continuously');
}
```

Also record `window.scrollY` before and after clicking navigation item 3, wait for native smooth scrolling to settle, and require movement toward the third GSAP segment.

Run: `npm run verify:process`

Expected: FAIL because the old click handler changes state without moving to the matching ScrollTrigger position.

- [ ] **Step 2: Make click and focus navigate through the scroll timeline**

Replace the timer-based manual activation with:

```tsx
const activateStep = (index: number) => {
  const trigger = scrollTriggerRef.current;
  if (!trigger || window.innerWidth <= 760) {
    setActive(index);
    return;
  }
  const progress = index / (steps.length - 1);
  const top = gsap.utils.interpolate(trigger.start, trigger.end, progress);
  window.scrollTo({ top, behavior: "smooth" });
};
```

Keep the existing `onClick` and `onFocus` wiring. Remove the obsolete manual-activation refs and timer cleanup.

- [ ] **Step 3: Run browser verification**

Run: `npm run verify:process`

Expected: PASS with continuous transform samples, four ordered stages, scroll-aware click/focus behavior, static mobile flow, gentle reduced motion, and no runtime exceptions.

- [ ] **Step 4: Commit navigation and runtime coverage**

```bash
git add scripts/verify-process-story.mjs src/components/ProcessIsland.tsx
git commit -m "test: verify continuous process scroll motion"
```

---

### Task 3: Final Visual and Production Verification

**Files:**
- Verify only: `src/components/ProcessIsland.tsx`
- Verify only: `src/components/ProcessIsland.css`

**Interfaces:**
- Consumes: the finished GSAP process scene.
- Produces: no new code unless verification exposes a scoped regression.

- [ ] **Step 1: Run all process checks and the production build**

```bash
npm run validate:process
npm run verify:process
npm run build
git diff --check
```

Expected: all commands exit with code 0 and no new whitespace errors.

- [ ] **Step 2: Verify the live desktop scene**

At `http://127.0.0.1:4321/#proces`, sample the beginning, middle of each transition, and the final state. Confirm that transforms change at nearby scroll positions, the rail matches the same progress, all four cards remain readable, and reversing the scroll reverses the animation without a jump.

- [ ] **Step 3: Verify mobile and reduced motion**

At 390 px, confirm cards are in normal document flow with no horizontal overflow. With reduced motion enabled at desktop width, confirm zero card rotation and smaller displacement while all four stages remain reachable.

- [ ] **Step 4: Record final status**

Run: `git status --short`

Expected: only unrelated pre-existing user changes remain; all process-motion files from this plan are committed.
