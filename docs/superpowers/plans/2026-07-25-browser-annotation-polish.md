# Browser Annotation Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the three approved browser annotations for process copy, launch motion, and portfolio blending.

**Architecture:** Keep the existing React markup and CSS animation system. Extend the existing validators first, then make surgical TSX and CSS changes in the two affected components.

**Tech Stack:** Astro, React, TypeScript, native CSS, Node validation scripts

## Global Constraints

- Stage 3 copy is exactly `To będzie Twoja strona ;)`.
- Reduced launch motion is finite and avoids translation or scale motion except for the progress fill.
- The centered portfolio card stays crisp; the stage does not clip its shadow, and side cards fade radially.
- No new dependencies.

---

### Task 1: Process annotation and reduced launch motion

**Files:**
- Modify: `scripts/validate-process-story.mjs`
- Modify: `src/components/ProcessIsland.tsx`
- Modify: `src/components/ProcessIsland.css`
- Test: `scripts/validate-process-story.mjs`

**Interfaces:**
- Consumes: Existing `data-story-visible="true"`, `.process-story__card.is-active`, and `prefers-reduced-motion` contracts.
- Produces: Approved stage 3 copy and visible reduced launch-sequence styles.

- [x] **Step 1: Write the failing validator checks**

```js
["personal process copy", component.includes("To będzie Twoja strona ;)")],
["stage three personal message styling", styles.includes("font-style: italic")],
["visible reduced launch sequence", [
  "story-stage-in-reduced",
  "story-publish-fill-reduced",
  "story-support-in-reduced",
].every((token) => styles.includes(token))],
```

- [x] **Step 2: Run the validator and confirm RED**

Run: `npm run validate:process`
Expected: FAIL for the new copy, typography, and reduced launch-motion checks.

- [x] **Step 3: Implement the minimal TSX and CSS changes**

```tsx
<span className="story-page-hero"><b>To będzie Twoja strona ;)</b><i /></span>
```

```css
.story-page-shell--designed .story-page-hero b {
  padding-bottom: 1px;
  font-size: clamp(0.72rem, 0.9vw, 0.84rem);
  font-style: italic;
}

@keyframes story-stage-in-reduced {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

- [x] **Step 4: Run the validator and confirm GREEN**

Run: `npm run validate:process`
Expected: all process checks pass.

### Task 2: Portfolio side-card blend

**Files:**
- Modify: `scripts/validate-portfolio-carousel.mjs`
- Modify: `src/components/PortfolioCarousel.css`
- Test: `scripts/validate-portfolio-carousel.mjs`

**Interfaces:**
- Consumes: Existing `data-position="left"`, `data-position="center"`, and `data-position="right"` card states.
- Produces: An unclipped stage, a shorter neutral center shadow, and a radial alpha fade on side cards only.

- [x] **Step 1: Write the failing validator check**

```js
assert.match(
  componentStyles,
  /\.portfolio-carousel__card\[data-position="left"\],[^}]*mask-image:\s*radial-gradient\(/s,
  "side cards should fade into the page background above the project name",
);
```

- [x] **Step 2: Run the validator and confirm RED**

Run: `npm run validate:portfolio`
Expected: FAIL for the missing side-card blend.

- [x] **Step 3: Implement the minimal CSS blend**

```css
.portfolio-carousel__card[data-position="left"],
.portfolio-carousel__card[data-position="right"] {
  -webkit-mask-image: radial-gradient(ellipse 72% 92% at 50% 18%, #000 0%, #000 58%, rgba(0, 0, 0, 0.82) 72%, transparent 100%);
  mask-image: radial-gradient(ellipse 72% 92% at 50% 18%, #000 0%, #000 58%, rgba(0, 0, 0, 0.82) 72%, transparent 100%);
}

.portfolio-carousel__card[data-position="center"] {
  box-shadow: 0 26px 64px rgba(84, 92, 110, 0.14);
}
```

- [x] **Step 4: Run the validator and confirm GREEN**

Run: `npm run validate:portfolio`
Expected: the portfolio validator passes.

### Task 3: Integrated verification

**Files:**
- Verify: `src/components/ProcessIsland.tsx`
- Verify: `src/components/ProcessIsland.css`
- Verify: `src/components/PortfolioCarousel.css`

**Interfaces:**
- Consumes: Tasks 1 and 2.
- Produces: Verified production output.

- [x] **Step 1: Run the full build**

Run: `npm run build`
Expected: Astro build exits with code 0.

- [x] **Step 2: Verify in the local browser**

Confirm computed stage 3 typography, visible reduced launch animation names, and a soft side-card transition at the portfolio name boundary.
