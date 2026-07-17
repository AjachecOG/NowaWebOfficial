# Hero Intro Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a coordinated, one-shot hero entrance with a typed brand eyebrow, line-by-line headline reveal, and distinct professional interactions for both hero buttons.

**Architecture:** A focused React island owns only the one-shot eyebrow typing state and its reduced-motion fallback. Astro keeps the semantic headline and CTA links in the initial HTML, while scoped CSS handles the headline/lead/button entrance sequence and all hover, focus, active, and reduced-motion states. A dependency-free Node assertion script protects the required DOM and CSS contract.

**Tech Stack:** Astro, React, TypeScript, CSS keyframes and transitions, Node.js assertions, Chromium/Playwright visual verification.

## Global Constraints

- The opening sequence runs once and reaches its complete readable state in about 1.8 seconds; it never loops or erases text.
- Preserve the exact visible copy and existing link destinations `#kontakt` and `#projekty`.
- Keep the full headline and eyebrow accessible as complete phrases; decorative animated layers are hidden from assistive technology.
- Keep layout dimensions stable while the text is animating.
- At `prefers-reduced-motion: reduce`, show all content immediately and disable typing, masks, translations, shimmer, fill sweeps, and arrow motion.
- Add no dependencies.
- Preserve all pre-existing uncommitted work. `src/pages/index.astro` and `src/styles/global.css` already contain user changes; inspect diffs before and after every edit and never stage unrelated hunks.
- Do not refactor other page sections or the existing typewriter under the Poland map.

---

## File Map

- Create `src/components/HeroEyebrowTypewriter.tsx`: one-shot typing state, complete accessible copy, and reduced-motion rendering.
- Modify `src/pages/index.astro`: mount the eyebrow island, split the headline into semantic visual lines, and wrap button labels for controlled layering.
- Modify `src/styles/global.css`: replace the whole-copy hero entrance with the coordinated sequence and add scoped button microinteractions and reduced-motion rules.
- Create `scripts/validate-hero-intro-motion.mjs`: static assertions for the hero DOM/component/CSS contract.
- Inspect `output/playwright/hero-motion-desktop.png` and `output/playwright/hero-motion-mobile.png`: visual evidence only; do not commit generated screenshots unless requested.

---

### Task 1: Add the one-shot eyebrow and line-by-line copy entrance

**Files:**
- Create: `scripts/validate-hero-intro-motion.mjs`
- Create: `src/components/HeroEyebrowTypewriter.tsx`
- Modify: `src/pages/index.astro:13-20,82-94`
- Modify: `src/styles/global.css:181-194,2413-2434`

**Interfaces:**
- Consumes: browser `matchMedia("(prefers-reduced-motion: reduce)")`, the existing `.hero-copy`, `.eyebrow`, `.lead`, and `.action-row` structure.
- Produces: `<HeroEyebrowTypewriter client:load />`, `[data-hero-eyebrow-text]`, `.hero-title-line`, `.hero-title-line-inner`, and a complete visible state that later button styling can use.

- [ ] **Step 1: Create the failing structural validator**

Create `scripts/validate-hero-intro-motion.mjs` with this complete content:

```js
import { readFile } from "node:fs/promises";

const [page, component, css] = await Promise.all([
  readFile("src/pages/index.astro", "utf8"),
  readFile("src/components/HeroEyebrowTypewriter.tsx", "utf8").catch(() => ""),
  readFile("src/styles/global.css", "utf8"),
]);

const failures = [];

function expect(source, token, message) {
  if (!source.includes(token)) failures.push(message);
}

expect(page, 'import HeroEyebrowTypewriter from "../components/HeroEyebrowTypewriter";', "hero eyebrow component is not imported");
expect(page, "<HeroEyebrowTypewriter client:load />", "hero eyebrow is not hydrated on load");
expect(page, 'class="hero-title"', "hero title sequence class is missing");
expect(page, 'class="hero-title-line"', "hero title lines are missing");
expect(page, 'class="hero-title-line-inner"', "hero title line inner masks are missing");
expect(component, 'const FULL_TEXT = "NowaWeb - strony internetowe";', "full eyebrow copy is not fixed");
expect(component, "prefers-reduced-motion: reduce", "component has no reduced-motion fallback");
expect(component, "data-hero-eyebrow-text", "typed eyebrow target is missing");
expect(component, "hero-eyebrow-static", "static reduced-motion copy is missing");
expect(css, "@keyframes hero-title-line-in", "headline reveal keyframes are missing");
expect(css, "@keyframes hero-support-in", "lead/button support entrance is missing");
expect(css, "@media (prefers-reduced-motion: reduce)", "reduced-motion CSS is missing");

const lineCount = (page.match(/class="hero-title-line"/g) ?? []).length;
if (lineCount !== 3) failures.push(`expected 3 controlled headline lines, found ${lineCount}`);

if (failures.length) {
  throw new Error(failures.join("; "));
}

console.log("Hero intro motion structure is present.");
```

- [ ] **Step 2: Run the validator and confirm RED**

Run:

```powershell
node scripts/validate-hero-intro-motion.mjs
```

Expected: non-zero exit with messages including `hero eyebrow component is not imported` and `headline reveal keyframes are missing`.

- [ ] **Step 3: Implement the focused typewriter island**

Create `src/components/HeroEyebrowTypewriter.tsx` with this complete content:

```tsx
import { useEffect, useState } from "react";

const FULL_TEXT = "NowaWeb - strony internetowe";
const KEY_DELAYS = [44, 52, 48, 58, 46, 50] as const;

export default function HeroEyebrowTypewriter() {
  const [text, setText] = useState("");
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setText(FULL_TEXT);
      setComplete(true);
      return;
    }

    let cancelled = false;
    const timers = new Set<number>();

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const timer = window.setTimeout(() => {
          timers.delete(timer);
          resolve();
        }, ms);
        timers.add(timer);
      });

    const play = async () => {
      await wait(140);

      for (let index = 0; index < FULL_TEXT.length && !cancelled; index += 1) {
        setText(FULL_TEXT.slice(0, index + 1));
        await wait(KEY_DELAYS[index % KEY_DELAYS.length]);
      }

      if (!cancelled) {
        await wait(150);
        setComplete(true);
      }
    };

    void play();

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <p className="eyebrow hero-eyebrow" data-typing-complete={complete ? "true" : "false"}>
      <span className="hero-eyebrow-accessible">{FULL_TEXT}</span>
      <span className="hero-eyebrow-animated" aria-hidden="true">
        <span data-hero-eyebrow-text>{text}</span>
        <span className="hero-eyebrow-cursor" data-hero-eyebrow-cursor />
      </span>
      <span className="hero-eyebrow-static" aria-hidden="true">{FULL_TEXT}</span>
    </p>
  );
}
```

- [ ] **Step 4: Mount the island and split the heading into three controlled lines**

Add the import beside the other local component imports in `src/pages/index.astro`:

```astro
import HeroEyebrowTypewriter from "../components/HeroEyebrowTypewriter";
```

Replace only the current eyebrow and `h1` with:

```astro
<HeroEyebrowTypewriter client:load />
<h1
  id="hero-title"
  class="hero-title"
  aria-label="Profesjonalny design nie jest luksusem"
>
  <span class="hero-title-line">
    <span class="hero-title-line-inner">Profesjonalny</span>
  </span>
  <span class="hero-title-line">
    <span class="hero-title-line-inner">design <em>nie jest</em></span>
  </span>
  <span class="hero-title-line">
    <span class="hero-title-line-inner">luksusem</span>
  </span>
</h1>
```

Do not change the lead copy, CTA destinations, or product-scene markup.

- [ ] **Step 5: Add eyebrow layout and caret behavior**

Insert after the base `.eyebrow` rule in `src/styles/global.css`:

```css
.hero-eyebrow {
  display: flex;
  align-items: center;
  min-height: 1.2em;
}

.hero-eyebrow-accessible {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.hero-eyebrow-animated {
  display: inline-flex;
  align-items: center;
}

.hero-eyebrow-static {
  display: none;
}

.hero-eyebrow-cursor {
  width: 2px;
  height: 1.05em;
  margin-left: 5px;
  background: var(--blue);
  animation: hero-eyebrow-caret 760ms steps(1, end) infinite;
}

.hero-eyebrow[data-typing-complete="true"] .hero-eyebrow-cursor {
  animation: hero-eyebrow-caret-finish 420ms steps(1, end) 3 forwards;
}

@keyframes hero-eyebrow-caret {
  0%, 48% { opacity: 1; }
  49%, 100% { opacity: 0; }
}

@keyframes hero-eyebrow-caret-finish {
  0%, 48% { opacity: 1; }
  49%, 100% { opacity: 0; }
}
```

- [ ] **Step 6: Replace the whole-copy entrance with the coordinated sequence**

Replace the existing `.hero-copy { animation: hero-copy-in ... }` block and `@keyframes hero-copy-in` block in `src/styles/global.css` with:

```css
.hero-copy {
  animation: none;
}

.hero-title-line {
  display: block;
  overflow: hidden;
  padding: 0.05em 0 0.09em;
  margin: -0.05em 0 -0.09em;
}

.hero-title-line-inner {
  display: block;
  opacity: 0;
  filter: blur(7px);
  transform: translate3d(0, 0.72em, 0) rotate(0.45deg);
  animation: hero-title-line-in 760ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.hero-title-line:nth-child(1) .hero-title-line-inner { animation-delay: 360ms; }
.hero-title-line:nth-child(2) .hero-title-line-inner { animation-delay: 540ms; }
.hero-title-line:nth-child(3) .hero-title-line-inner { animation-delay: 720ms; }

.hero-title-line em {
  color: var(--orange);
}

.hero .lead {
  opacity: 0;
  translate: 0 18px;
  animation: hero-support-in 680ms cubic-bezier(0.22, 1, 0.36, 1) 960ms forwards;
}

.hero .action-row .button {
  opacity: 0;
  translate: 0 16px;
  animation: hero-support-in 620ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.hero .action-row .button:nth-child(1) { animation-delay: 1120ms; }
.hero .action-row .button:nth-child(2) { animation-delay: 1240ms; }

@keyframes hero-title-line-in {
  to {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0) rotate(0);
  }
}

@keyframes hero-support-in {
  to {
    opacity: 1;
    translate: 0 0;
  }
}
```

- [ ] **Step 7: Add the scoped reduced-motion state**

Append this scoped block at the end of `src/styles/global.css`:

```css
@media (prefers-reduced-motion: reduce) {
  .hero-eyebrow-animated {
    display: none;
  }

  .hero-eyebrow-static {
    display: inline;
  }

  .hero-title-line-inner,
  .hero .lead,
  .hero .action-row .button {
    opacity: 1;
    filter: none;
    translate: none;
    transform: none;
    animation: none;
  }
}
```

- [ ] **Step 8: Run Task 1 verification and inspect only the new diff**

Run:

```powershell
node scripts/validate-hero-intro-motion.mjs
npm run build
git diff --check -- src/components/HeroEyebrowTypewriter.tsx src/pages/index.astro src/styles/global.css scripts/validate-hero-intro-motion.mjs
git diff -- src/components/HeroEyebrowTypewriter.tsx src/pages/index.astro src/styles/global.css scripts/validate-hero-intro-motion.mjs
```

Expected: validator prints `Hero intro motion structure is present.`, Astro build exits `0`, and the diff contains only the new hero work plus clearly identifiable pre-existing user changes.

Do not stage or commit overlapping code files at this checkpoint. The current worktree already contains unrelated edits in those files, so a full-file `git add` would incorrectly capture user work.

---

### Task 2: Add distinct CTA microinteractions

**Files:**
- Modify: `scripts/validate-hero-intro-motion.mjs`
- Modify: `src/pages/index.astro:90-92`
- Modify: `src/styles/global.css:253-281`

**Interfaces:**
- Consumes: `.button.primary`, `.button.secondary`, the existing `ArrowRight` icons, and the Task 1 entrance animation.
- Produces: label wrappers above decorative pseudo-elements, primary shimmer/arrow travel, secondary fill sweep/arrow arc, keyboard-focus parity, and active press feedback.

- [ ] **Step 1: Extend the validator with failing CTA assertions**

Insert these assertions immediately before the `lineCount` declaration in `scripts/validate-hero-intro-motion.mjs`:

```js
expect(page, '<span>Umów konsultację</span>', "primary CTA label wrapper is missing");
expect(page, '<span>Zobacz realizacje</span>', "secondary CTA label wrapper is missing");
expect(css, ".button.primary::before", "primary CTA shimmer is missing");
expect(css, ".button.secondary::before", "secondary CTA fill sweep is missing");
expect(css, ".button:focus-visible", "keyboard focus treatment is missing");
expect(css, ".button:active", "CTA press feedback is missing");
expect(css, ".button.primary:hover svg", "primary arrow motion is missing");
expect(css, ".button.secondary:hover svg", "secondary arrow motion is missing");
```

- [ ] **Step 2: Run the validator and confirm RED**

Run:

```powershell
node scripts/validate-hero-intro-motion.mjs
```

Expected: non-zero exit with CTA-specific failures including `primary CTA label wrapper is missing` and `primary CTA shimmer is missing`.

- [ ] **Step 3: Wrap only the two hero button labels**

Replace the two hero CTA anchors in `src/pages/index.astro` with:

```astro
<a class="button primary" href="#kontakt">
  <span>Umów konsultację</span>
  <ArrowRight aria-hidden="true" size={20} />
</a>
<a class="button secondary" href="#projekty">
  <span>Zobacz realizacje</span>
  <ArrowRight aria-hidden="true" size={20} />
</a>
```

- [ ] **Step 4: Upgrade the shared button foundation without changing dimensions**

Extend the current `.button` rule to include the following properties and transition list:

```css
.button {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  transition:
    color 220ms ease,
    transform 180ms ease,
    box-shadow 220ms ease,
    background 220ms ease;
}

.button > span,
.button > svg {
  position: relative;
  z-index: 1;
}

.button svg {
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

.button:focus-visible {
  outline: 3px solid rgba(255, 90, 31, 0.72);
  outline-offset: 4px;
}

.button:active {
  transform: translateY(1px) scale(0.98);
}
```

Merge these declarations into the existing rule rather than duplicating the base `.button` selector; retain its display, sizing, border, typography, and padding.

- [ ] **Step 5: Add the primary shimmer and arrow travel**

Add after `.button.primary`:

```css
.button.primary::before {
  content: "";
  position: absolute;
  inset: -45% -30%;
  z-index: 0;
  background: linear-gradient(105deg, transparent 38%, rgba(255, 255, 255, 0.34) 50%, transparent 62%);
  transform: translateX(-145%) skewX(-18deg);
  transition: transform 560ms cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.button.primary:hover::before,
.button.primary:focus-visible::before {
  transform: translateX(145%) skewX(-18deg);
}

.button.primary:hover svg,
.button.primary:focus-visible svg {
  transform: translateX(6px);
}
```

- [ ] **Step 6: Add the secondary fill sweep and arrow arc**

Add after `.button.secondary`:

```css
.button.secondary::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  background: var(--blue);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.button.secondary:hover,
.button.secondary:focus-visible {
  color: white;
}

.button.secondary:hover::before,
.button.secondary:focus-visible::before {
  transform: scaleX(1);
}

.button.secondary:hover svg,
.button.secondary:focus-visible svg {
  transform: translate3d(5px, -2px, 0) rotate(-12deg);
}
```

Keep the existing shared hover lift and shadow. Ensure the active rule follows the hover rule so pressing visually moves the button down.

- [ ] **Step 7: Disable decorative CTA motion in the scoped reduced-motion block**

Add inside the Task 1 `@media (prefers-reduced-motion: reduce)` block:

```css
  .hero .button,
  .hero .button::before,
  .hero .button svg {
    transition: none;
  }

  .hero .button::before {
    display: none;
  }

  .hero .button:hover,
  .hero .button:focus-visible,
  .hero .button:active,
  .hero .button:hover svg,
  .hero .button:focus-visible svg {
    transform: none;
  }

  .hero .button.secondary:hover,
  .hero .button.secondary:focus-visible {
    background: var(--blue);
    color: white;
  }
```

- [ ] **Step 8: Run Task 2 verification**

Run:

```powershell
node scripts/validate-hero-intro-motion.mjs
npm run build
git diff --check -- src/pages/index.astro src/styles/global.css scripts/validate-hero-intro-motion.mjs
```

Expected: validator prints `Hero intro motion structure is present.`, Astro build exits `0`, and `git diff --check` reports no whitespace errors.

Again, leave overlapping code files unstaged unless the hero hunks can be isolated and reviewed without capturing the user's earlier changes.

---

### Task 3: Browser verification and visual refinement

**Files:**
- Inspect: `output/playwright/hero-motion-desktop.png`
- Inspect: `output/playwright/hero-motion-mobile.png`
- Modify if required: `src/styles/global.css`

**Interfaces:**
- Consumes: the completed Task 1 and Task 2 DOM/CSS contracts at `http://127.0.0.1:4321/`.
- Produces: evidence that timing, responsiveness, focus behavior, anchors, and reduced-motion behavior work in a real browser.

- [ ] **Step 1: Start the local Astro server**

Run in a persistent terminal:

```powershell
npm run dev
```

Expected: Astro reports a local URL at `http://127.0.0.1:4321/`.

- [ ] **Step 2: Inspect the live desktop sequence at 1440 × 1000**

Reload once and verify in order:

1. the eyebrow types once and finishes as `NowaWeb - strony internetowe`;
2. the three headline lines enter in order with no layout jump;
3. the lead enters after the headline;
4. primary and secondary CTAs enter in order;
5. the primary shimmer and secondary fill sweep remain visually restrained;
6. `#kontakt` and `#projekty` navigation still works.

Capture after the sequence settles:

```powershell
npx playwright screenshot --browser=chromium --viewport-size="1440,1000" http://127.0.0.1:4321 output/playwright/hero-motion-desktop.png
```

Expected: the full hero copy and both CTA buttons are visible without clipping or collision with the product scene.

- [ ] **Step 3: Inspect the live mobile sequence at 390 × 1000**

Capture after the sequence settles:

```powershell
npx playwright screenshot --browser=chromium --viewport-size="390,1000" http://127.0.0.1:4321 output/playwright/hero-motion-mobile.png
```

Expected: every controlled headline line fits inside the viewport; the eyebrow is not clipped; buttons remain full width per existing mobile rules; no horizontal scroll appears.

- [ ] **Step 4: Verify keyboard and reduced-motion behavior**

Using the browser:

- Tab to both CTA links and confirm the orange focus ring is visible.
- Activate each link with Enter and confirm its original anchor target.
- Emulate `prefers-reduced-motion: reduce`, reload, and confirm the full eyebrow, headline, lead, and CTAs are immediately visible.
- Confirm no caret, line reveal, shimmer, fill sweep, hover translation, or arrow movement runs in reduced-motion mode.

- [ ] **Step 5: Make only bounded visual corrections**

If a screenshot reveals overflow or excessive motion, adjust only these values:

- `.hero-title-line-inner` starting translation/blur;
- the three headline animation delays;
- `.hero-eyebrow-cursor` size/margin;
- primary shimmer opacity/speed;
- secondary sweep speed;
- mobile `h1` font size already defined in the existing media query.

Do not change copy, section spacing, the right-side product scene, or other sections.

- [ ] **Step 6: Run final verification from a clean server state**

Run:

```powershell
node scripts/validate-hero-intro-motion.mjs
node scripts/verify-motion.mjs
npm run build
git diff --check -- src/components/HeroEyebrowTypewriter.tsx src/pages/index.astro src/styles/global.css scripts/validate-hero-intro-motion.mjs
git status --short
```

Expected:

- `Hero intro motion structure is present.`
- `Motion verification passed.`
- Astro build exits `0`.
- no new whitespace errors;
- `git status` still shows the user's earlier changes plus only the new hero component, validator, and bounded hero hunks.

- [ ] **Step 7: Report completion without staging unrelated work**

Summarize the changed behavior, list the verification commands and results, and link the new component and relevant page/CSS files. Because the worktree contains pre-existing overlapping edits, do not create an implementation commit unless the user explicitly requests staging and the exact hero hunks can be isolated safely.
