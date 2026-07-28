# Professional Service Card Backs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the note-like backs of all six service cards with a restrained paper-editorial layout that keeps the existing colors and flip behavior.

**Architecture:** Keep the existing Astro service data, card dimensions, and React interaction controller. Add a small semantic metadata row to each back face, then restyle only the back-face CSS with a subtle paper grid, left-aligned hierarchy, divided scope rows, and a separate action footer.

**Tech Stack:** Astro, CSS, Node.js assertions, browser visual verification.

## Global Constraints

- Preserve the existing navy, blue, orange, and paper color variables.
- Preserve all six service texts, the 4:3 card ratio, flip interaction, keyboard behavior, and reduced-motion fallback.
- Do not add generated images or dependencies.
- Do not change any section outside the service card backs.

---

### Task 1: Implement and verify the professional paper-editorial back face

**Files:**
- Modify: `scripts/validate-service-card-flip.mjs`
- Modify: `src/pages/index.astro:254-301`
- Modify: `src/styles/global.css:2262-2398`

**Interfaces:**
- Consumes: the existing `services` array and `index` from `services.map(...)`.
- Produces: `.service-card-back-meta`, `.service-card-back-index`, `.service-card-back-label`, `.service-card-back-copy`, and the unchanged `.service-card-back-actions` interaction surface.

- [ ] **Step 1: Update the structural assertions and verify RED**

Require a two-digit service index, the “Zakres usługi” label, left-aligned heading hierarchy, paper-grid background, divided list rows, isolated action footer, and all existing flip/accessibility assertions. Remove assertions tied to the old centered “Ink premium” preview.

Run: `node scripts/validate-service-card-flip.mjs`

Expected: FAIL because the new metadata classes and editorial CSS are absent.

- [ ] **Step 2: Add the back-face metadata and copy grouping**

Inside `services.map`, derive `const serviceNumber = String(index + 1).padStart(2, "0");`. Render this structure inside `.service-card-back` while keeping the existing CTA and close button:

```astro
<div class="service-card-back-meta" aria-hidden="true">
  <span class="service-card-back-index">{serviceNumber}</span>
  <span class="service-card-back-label">Zakres usługi</span>
</div>
<div class="service-card-back-copy">
  <h3>{title}</h3>
  <p>{benefit}</p>
</div>
<ul>
  {points.map((point) => <li>{point}</li>)}
</ul>
```

- [ ] **Step 3: Replace the back-face visual rules**

Keep `display: flex`, `transform: rotateY(180deg)`, and pointer-event behavior. Use a faint blue grid over `var(--paper-clean)`, a compact top metadata rule, left-aligned display heading, restrained benefit copy, three separated scope rows with orange markers, and a footer with a top border. Retain the orange corner accent in a cleaner, thinner form and preserve current focus-visible outlines.

- [ ] **Step 4: Verify GREEN and build**

Run: `node scripts/validate-service-card-flip.mjs`

Expected: `Service card flip structure is present.`

Run: `npm run build`

Expected: Astro exits with code 0.

- [ ] **Step 5: Visually verify and refine**

Inspect all six flipped cards at 1440 px and 390 px. Confirm consistent hierarchy, no clipped long titles or list items, no horizontal overflow, legible focus rings, and a coherent relationship to the illustrated fronts. Re-run the structural test and build after any correction.

