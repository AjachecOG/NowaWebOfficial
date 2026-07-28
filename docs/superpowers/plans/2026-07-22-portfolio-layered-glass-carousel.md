# Layered Glass Portfolio Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fictional portrait portfolio stack with a responsive, layered glass carousel for Cakepops.pl, New York Rolls, and Atmo‑Vision using the three supplied full-width screenshots.

**Architecture:** Keep the portfolio as one isolated React island. The component owns project data, active-card state, click/keyboard/pointer gesture handling, and semantic controls; a colocated CSS file owns all positioning, glass treatment, responsive behavior, and reduced-motion fallbacks. A Node structural validator provides fast RED/GREEN feedback, while a Chrome DevTools Protocol verifier covers real browser interaction, responsive layout, and screenshots.

**Tech Stack:** Astro, React, TypeScript, CSS, Lucide React, Node.js assertions, headless Google Chrome through the Chrome DevTools Protocol.

## Global Constraints

- Render exactly three real projects: Cakepops.pl, New York Rolls, and Atmo‑Vision.
- The active screenshot must always use `object-fit: contain`; never crop it with `cover`.
- Desktop uses one large center card at roughly 60–64% of the stage width and two approximately 80%-scale cards partly behind it.
- Side cards remain full-color: no `grayscale`, dark overlay, or saturation reduction.
- The glass layer uses only about 2–3 px of blur plus a light reflection and border.
- Support side-card click, previous/next buttons, pointer drag, touch swipe, and ArrowLeft/ArrowRight.
- Use a closed three-item loop with no autoplay.
- Normal motion lasts about 700–850 ms and animates compositor-friendly properties.
- `prefers-reduced-motion: reduce` removes spatial motion.
- Render an external link only when the project has a confirmed URL; never ship a dead action.
- Add no animation or carousel dependency.
- Preserve unrelated dirty worktree changes and do not refactor other sections.

## File Map

- Create `public/assets/nowaweb/portfolio/cakepops.png`: supplied Cakepops.pl screenshot.
- Create `public/assets/nowaweb/portfolio/new-york-rolls.png`: supplied New York Rolls screenshot.
- Create `public/assets/nowaweb/portfolio/atmo-vision.png`: supplied Atmo‑Vision screenshot.
- Create `scripts/validate-portfolio-carousel.mjs`: fast structural regression test.
- Create `scripts/verify-portfolio-carousel.mjs`: real-browser interaction, layout, and screenshot verification.
- Create `src/components/PortfolioCarousel.css`: component-owned layout, glass, responsive, and reduced-motion rules.
- Modify `src/components/PortfolioCarousel.tsx:1-69`: replace data, markup, state, controls, and gesture handling.
- Modify `src/pages/index.astro:333-342`: update the section heading and supporting copy.
- Modify `src/styles/global.css:2122-2134,2939-3066,3518-3571,4052-4066`: remove the obsolete portrait-card portfolio system.
- Modify `package.json:6-12`: add portfolio validation and browser verification scripts.
- Inspect but do not commit `output/playwright/portfolio-glass-desktop.png` and `output/playwright/portfolio-glass-mobile.png`.

---

### Task 1: Lock the real project assets and content with a failing validator

**Files:**
- Create: `scripts/validate-portfolio-carousel.mjs`
- Create: `public/assets/nowaweb/portfolio/cakepops.png`
- Create: `public/assets/nowaweb/portfolio/new-york-rolls.png`
- Create: `public/assets/nowaweb/portfolio/atmo-vision.png`
- Modify: `src/components/PortfolioCarousel.tsx:4-23`
- Modify: `package.json:6-12`

**Interfaces:**
- Consumes: the three supplied PNG files in `C:/Users/Adam/AppData/Local/Temp/`.
- Produces: stable public image paths and a `projects` array whose later component work can reuse without renaming.

- [ ] **Step 1: Write the failing asset/content validator**

Create `scripts/validate-portfolio-carousel.mjs` with this complete content:

```js
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const componentUrl = new URL("../src/components/PortfolioCarousel.tsx", import.meta.url);
const component = await readFile(componentUrl, "utf8");

const assets = [
  ["cakepops.png", new URL("../public/assets/nowaweb/portfolio/cakepops.png", import.meta.url)],
  ["new-york-rolls.png", new URL("../public/assets/nowaweb/portfolio/new-york-rolls.png", import.meta.url)],
  ["atmo-vision.png", new URL("../public/assets/nowaweb/portfolio/atmo-vision.png", import.meta.url)],
];

for (const [name, url] of assets) {
  const metadata = await stat(url);
  assert.ok(metadata.size > 100_000, `${name} should be a real screenshot asset`);
  const signature = (await readFile(url)).subarray(0, 8).toString("hex");
  assert.equal(signature, "89504e470d0a1a0a", `${name} should be a PNG`);
}

for (const expected of [
  "Cakepops.pl",
  "New York Rolls",
  "Atmo‑Vision",
  "/assets/nowaweb/portfolio/cakepops.png",
  "/assets/nowaweb/portfolio/new-york-rolls.png",
  "/assets/nowaweb/portfolio/atmo-vision.png",
]) {
  assert.ok(component.includes(expected), `missing real portfolio value: ${expected}`);
}

for (const obsolete of ["Atelier Mira", "Kancelaria Północ", "Nord Clinic"]) {
  assert.ok(!component.includes(obsolete), `obsolete fictional project remains: ${obsolete}`);
}

console.log("Portfolio real project assets and content are present.");
```

- [ ] **Step 2: Add the validation command**

Add the highlighted entry to the existing `scripts` object in `package.json`:

```json
{
  "scripts": {
    "dev": "astro dev --host 127.0.0.1",
    "build": "astro build",
    "preview": "astro preview --host 127.0.0.1",
    "validate:portfolio": "node scripts/validate-portfolio-carousel.mjs",
    "validate:process": "node scripts/validate-process-story.mjs",
    "verify:process": "node scripts/verify-process-story.mjs"
  }
}
```

- [ ] **Step 3: Run the validator and verify RED**

Run:

```powershell
npm run validate:portfolio
```

Expected: FAIL with `ENOENT` for `cakepops.png`, because the stable assets do not exist yet.

- [ ] **Step 4: Copy the three supplied images to stable public paths**

Run from the repository root:

```powershell
Copy-Item -LiteralPath 'C:\Users\Adam\AppData\Local\Temp\codex-clipboard-bf8fdd4f-a671-4477-9cd4-4d8690bd5008.png' -Destination 'public\assets\nowaweb\portfolio\cakepops.png'
Copy-Item -LiteralPath 'C:\Users\Adam\AppData\Local\Temp\codex-clipboard-942b2777-5509-439f-87a0-f2985e504842.png' -Destination 'public\assets\nowaweb\portfolio\new-york-rolls.png'
Copy-Item -LiteralPath 'C:\Users\Adam\AppData\Local\Temp\codex-clipboard-c3759515-8c2f-4a9a-872a-672410d3ee13.png' -Destination 'public\assets\nowaweb\portfolio\atmo-vision.png'
```

Expected dimensions:

```text
cakepops.png        1453 x 796
new-york-rolls.png  1850 x 876
atmo-vision.png     1837 x 880
```

- [ ] **Step 5: Replace only the project data while retaining the old markup temporarily**

Replace the current `projects` constant in `src/components/PortfolioCarousel.tsx` with:

```ts
const projects = [
  {
    name: "Cakepops.pl",
    domain: "cakepops.pl",
    category: "Marka produktowa / gastronomia",
    image: "/assets/nowaweb/portfolio/cakepops.png",
    width: 1453,
    height: 796,
    url: "https://cakepops.pl/",
    copy: "Lekki, premium kierunek dla ręcznie tworzonych cakepopsów.",
  },
  {
    name: "New York Rolls",
    domain: "New York Rolls",
    category: "Landing produktowy / gastronomia",
    image: "/assets/nowaweb/portfolio/new-york-rolls.png",
    width: 1850,
    height: 876,
    copy: "Wyrazisty, miejski charakter z mocną hierarchią sprzedażową.",
  },
  {
    name: "Atmo‑Vision",
    domain: "atmo-vision.pl",
    category: "Technologia / monitoring inwestycji",
    image: "/assets/nowaweb/portfolio/atmo-vision.png",
    width: 1837,
    height: 880,
    url: "https://atmo-vision.pl/",
    copy: "Techniczna usługa pokazana przez prosty, wizualny storytelling.",
  },
];
```

The `copy` field is temporary compatibility with the old markup and is removed in Task 2.

- [ ] **Step 6: Run the validator and verify GREEN**

Run:

```powershell
npm run validate:portfolio
```

Expected: `Portfolio real project assets and content are present.`

- [ ] **Step 7: Commit the asset/content slice**

```powershell
git add package.json scripts/validate-portfolio-carousel.mjs src/components/PortfolioCarousel.tsx public/assets/nowaweb/portfolio/cakepops.png public/assets/nowaweb/portfolio/new-york-rolls.png public/assets/nowaweb/portfolio/atmo-vision.png
git commit -m "feat: add real portfolio projects"
```


---

### Task 2: Replace the old carousel markup with accessible layered interaction

**Files:**
- Modify: `scripts/validate-portfolio-carousel.mjs`
- Modify: `src/components/PortfolioCarousel.tsx:1-69`

**Interfaces:**
- Consumes: the stable project image paths and metadata from Task 1.
- Produces: `CardPosition`, `getCardPosition(index, active, total)`, a three-card state machine, semantic controls, and pointer/keyboard handlers consumed by Task 3 CSS and Task 4 browser checks.

- [ ] **Step 1: Extend the validator with failing interaction assertions**

Insert this block immediately before the final `console.log` in `scripts/validate-portfolio-carousel.mjs`:

```js
for (const pattern of [
  /type CardPosition = "left" \| "center" \| "right"/,
  /function getCardPosition/,
  /data-position=\{position\}/,
  /data-active=\{active\}/,
  /onPointerDown=\{handlePointerDown\}/,
  /onPointerUp=\{handlePointerUp\}/,
  /onKeyDown=\{handleKeyDown\}/,
  /Math\.abs\(deltaX\) < 48/,
  /className="portfolio-carousel__side-control"/,
  /className="portfolio-carousel__control portfolio-carousel__control--prev"/,
  /className="portfolio-carousel__control portfolio-carousel__control--next"/,
  /aria-live="polite"/,
  /target="_blank"/,
  /rel="noreferrer"/,
]) {
  assert.match(component, pattern, `missing carousel interaction contract: ${pattern}`);
}

assert.doesNotMatch(component, /setInterval|setTimeout\([^,]+,\s*[3-9]\d{3}/, "carousel must not autoplay");
```

- [ ] **Step 2: Run the validator and verify RED**

Run:

```powershell
npm run validate:portfolio
```

Expected: FAIL on `type CardPosition`, because the old stacked-card component is still present.

- [ ] **Step 3: Replace `PortfolioCarousel.tsx` with the complete interaction component**

Use this complete file content:

```tsx
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

type CardPosition = "left" | "center" | "right";

type PortfolioProject = {
  name: string;
  domain: string;
  category: string;
  image: string;
  width: number;
  height: number;
  url?: string;
};

const projects: PortfolioProject[] = [
  {
    name: "Cakepops.pl",
    domain: "cakepops.pl",
    category: "Marka produktowa / gastronomia",
    image: "/assets/nowaweb/portfolio/cakepops.png",
    width: 1453,
    height: 796,
    url: "https://cakepops.pl/",
  },
  {
    name: "New York Rolls",
    domain: "New York Rolls",
    category: "Landing produktowy / gastronomia",
    image: "/assets/nowaweb/portfolio/new-york-rolls.png",
    width: 1850,
    height: 876,
  },
  {
    name: "Atmo‑Vision",
    domain: "atmo-vision.pl",
    category: "Technologia / monitoring inwestycji",
    image: "/assets/nowaweb/portfolio/atmo-vision.png",
    width: 1837,
    height: 880,
    url: "https://atmo-vision.pl/",
  },
];

function wrapIndex(index: number, total: number) {
  return (index + total) % total;
}

function getCardPosition(index: number, active: number, total: number): CardPosition {
  const offset = wrapIndex(index - active, total);
  if (offset === 0) return "center";
  if (offset === 1) return "right";
  return "left";
}

export default function PortfolioCarousel() {
  const [active, setActive] = useState(1);
  const pointerStart = useRef<{ x: number; pointerId: number } | null>(null);
  const suppressClickUntil = useRef(0);

  const move = (direction: -1 | 1) => {
    setActive((current) => wrapIndex(current + direction, projects.length));
  };

  const activate = (index: number) => {
    if (performance.now() < suppressClickUntil.current) return;
    setActive(index);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, a")) return;
    pointerStart.current = { x: event.clientX, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;

    if (event.currentTarget.hasPointerCapture(start.pointerId)) {
      event.currentTarget.releasePointerCapture(start.pointerId);
    }

    const deltaX = event.clientX - start.x;
    if (Math.abs(deltaX) < 48) return;

    suppressClickUntil.current = performance.now() + 350;
    move(deltaX < 0 ? 1 : -1);
  };

  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (start && event.currentTarget.hasPointerCapture(start.pointerId)) {
      event.currentTarget.releasePointerCapture(start.pointerId);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  };

  return (
    <div className="portfolio-carousel" data-active={active}>
      <p className="portfolio-carousel__status" aria-live="polite">
        Aktywna realizacja: {projects[active].name}, {active + 1} z {projects.length}
      </p>

      <div
        className="portfolio-carousel__stage"
        aria-label="Karuzela realizacji. Użyj strzałek lub przeciągnij w bok."
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {projects.map((project, index) => {
          const position = getCardPosition(index, active, projects.length);
          const isActive = position === "center";
          const DirectionIcon = position === "left" ? ArrowLeft : ArrowRight;

          return (
            <article
              className="portfolio-carousel__card"
              data-position={position}
              data-project={project.name}
              aria-current={isActive ? "true" : undefined}
              key={project.name}
              onClick={() => !isActive && activate(index)}
            >
              <div className="portfolio-carousel__titlebar" aria-hidden="true">
                <span className="portfolio-carousel__lights"><i /><i /><i /></span>
                <span>{project.domain}</span>
                <span />
              </div>

              <div className="portfolio-carousel__screen">
                <img
                  src={project.image}
                  alt={`Pełny screenshot pierwszego ekranu strony ${project.name}`}
                  width={project.width}
                  height={project.height}
                  loading={isActive ? "eager" : "lazy"}
                  decoding="async"
                />
              </div>

              <div className="portfolio-carousel__meta">
                <span className="portfolio-carousel__number">{String(index + 1).padStart(2, "0")}</span>
                <span className="portfolio-carousel__identity">
                  <strong>{project.name}</strong>
                  <small>{project.category}</small>
                </span>
                {project.url ? (
                  <a
                    className="portfolio-carousel__external"
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Otwórz stronę ${project.name} w nowej karcie`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <ExternalLink aria-hidden="true" size={17} />
                  </a>
                ) : null}
              </div>

              {!isActive ? (
                <button
                  className="portfolio-carousel__side-control"
                  type="button"
                  aria-label={`Pokaż projekt ${project.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    activate(index);
                  }}
                >
                  <DirectionIcon aria-hidden="true" size={19} />
                </button>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="portfolio-carousel__controls" aria-label="Sterowanie realizacjami">
        <button
          className="portfolio-carousel__control portfolio-carousel__control--prev"
          type="button"
          onClick={() => move(-1)}
          aria-label="Poprzednia realizacja"
        >
          <ArrowLeft aria-hidden="true" size={20} />
        </button>
        <span className="portfolio-carousel__progress" aria-hidden="true">
          {projects.map((project, index) => (
            <i className={index === active ? "is-active" : ""} key={project.name} />
          ))}
        </span>
        <button
          className="portfolio-carousel__control portfolio-carousel__control--next"
          type="button"
          onClick={() => move(1)}
          aria-label="Następna realizacja"
        >
          <ArrowRight aria-hidden="true" size={20} />
        </button>
      </div>
      <p className="portfolio-carousel__hint">Kliknij bok, użyj strzałek albo przeciągnij.</p>
    </div>
  );
}
```

- [ ] **Step 4: Run the interaction validator and build**

Run:

```powershell
npm run validate:portfolio
npm run build
```

Expected: the validator prints its success message and Astro exits with code 0. The component is temporarily unstyled beyond surviving legacy global rules; visual work belongs to Task 3.

- [ ] **Step 5: Commit the component behavior**

```powershell
git add scripts/validate-portfolio-carousel.mjs src/components/PortfolioCarousel.tsx
git commit -m "feat: add layered portfolio carousel behavior"
```


---

### Task 3: Replace the portrait stack with the approved glass-and-depth layout

**Files:**
- Create: `src/components/PortfolioCarousel.css`
- Modify: `src/components/PortfolioCarousel.tsx:1-2`
- Modify: `src/pages/index.astro:333-342`
- Modify: `src/styles/global.css:2122-2134,2939-3066,3518-3571,4052-4066`
- Modify: `scripts/validate-portfolio-carousel.mjs`

**Interfaces:**
- Consumes: `.portfolio-carousel__*` markup and `data-position="left|center|right"` from Task 2.
- Produces: the approved center/side composition, visible 2.5 px glass, full-color side cards, responsive card geometry, focus styles, and reduced-motion behavior.

- [ ] **Step 1: Extend the validator with failing style and copy assertions**

Add these reads near the top of `scripts/validate-portfolio-carousel.mjs`:

```js
const page = await readFile(new URL("../src/pages/index.astro", import.meta.url), "utf8");
const componentStyles = await readFile(
  new URL("../src/components/PortfolioCarousel.css", import.meta.url),
  "utf8",
);
const globalStyles = await readFile(new URL("../src/styles/global.css", import.meta.url), "utf8");
```

Insert this block immediately before the final `console.log`:

```js
for (const copy of ["Wybrane realizacje", "Trzy marki", "Każda z własnym charakterem"]) {
  assert.ok(page.includes(copy), `missing approved portfolio heading copy: ${copy}`);
}

for (const pattern of [
  /\.portfolio-carousel__card\[data-position="center"\]/,
  /translate\(-50%, -50%\) scale\(1\)/,
  /\.portfolio-carousel__card\[data-position="left"\]/,
  /\.portfolio-carousel__card\[data-position="right"\]/,
  /scale\(0\.8\)/,
  /backdrop-filter:\s*blur\(2\.5px\) saturate\(112%\)/,
  /object-fit:\s*contain/,
  /--portfolio-spring:\s*820ms cubic-bezier\(0\.16, 1, 0\.3, 1\)/,
  /@supports not \(backdrop-filter: blur\(1px\)\)/,
  /@media \(prefers-reduced-motion: reduce\)/,
  /@media \(max-width: 860px\)/,
  /@media \(max-width: 560px\)/,
  /:focus-visible/,
]) {
  assert.match(componentStyles, pattern, `missing approved portfolio style contract: ${pattern}`);
}

assert.doesNotMatch(componentStyles, /grayscale\(|brightness\(0\.|saturate\(0\./, "side cards must stay full-color");
assert.doesNotMatch(globalStyles, /\.project-card\[data-position=/, "legacy portrait stack CSS must be removed");
```

- [ ] **Step 2: Run the validator and verify RED**

Run:

```powershell
npm run validate:portfolio
```

Expected: FAIL with `ENOENT` for `PortfolioCarousel.css`.

- [ ] **Step 3: Import the new component stylesheet**

Add this import after the Lucide import in `src/components/PortfolioCarousel.tsx`:

```ts
import "./PortfolioCarousel.css";
```

- [ ] **Step 4: Create the complete component stylesheet**

Create `src/components/PortfolioCarousel.css` with this complete content:

```css
.portfolio {
  position: relative;
  display: block;
  overflow: hidden;
}

.portfolio::before {
  position: absolute;
  inset: 10% -8% 0;
  background:
    radial-gradient(circle at 18% 52%, rgba(97, 166, 255, 0.16), transparent 25%),
    radial-gradient(circle at 82% 46%, rgba(173, 211, 255, 0.2), transparent 27%);
  content: "";
  pointer-events: none;
}

.portfolio-intro {
  position: relative;
  z-index: 4;
  max-width: 820px;
  margin: 0 auto clamp(12px, 2vw, 24px);
  text-align: center;
}

.portfolio-intro > p:last-child {
  max-width: 650px;
  margin-inline: auto;
}

.portfolio-carousel {
  --portfolio-spring: 820ms cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  min-height: clamp(560px, 49vw, 690px);
  font-family: var(--body);
}

.portfolio-carousel__status {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.portfolio-carousel__stage {
  position: relative;
  width: 100%;
  height: clamp(405px, 40vw, 540px);
  perspective: 1800px;
  touch-action: pan-y;
  user-select: none;
  outline: none;
}

.portfolio-carousel__stage:focus-visible {
  border-radius: 24px;
  box-shadow: 0 0 0 3px rgba(5, 87, 242, 0.24);
}

.portfolio-carousel__card {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(61vw, 835px);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.88);
  border-radius: 23px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 25px 66px rgba(25, 56, 99, 0.16);
  cursor: pointer;
  transform-origin: center;
  transition:
    transform var(--portfolio-spring),
    box-shadow var(--portfolio-spring);
  will-change: transform;
}

.portfolio-carousel__card::before {
  position: absolute;
  z-index: 9;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: inherit;
  background:
    linear-gradient(115deg, rgba(255, 255, 255, 0.42), transparent 25% 68%, rgba(255, 255, 255, 0.12)),
    rgba(255, 255, 255, 0.035);
  -webkit-backdrop-filter: blur(2.5px) saturate(112%);
  backdrop-filter: blur(2.5px) saturate(112%);
  content: "";
  opacity: 0;
  pointer-events: none;
  transition: opacity 440ms ease;
}

.portfolio-carousel__card::after {
  position: absolute;
  z-index: 10;
  top: -28%;
  bottom: -28%;
  left: -10%;
  width: 28%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.38), transparent);
  content: "";
  opacity: 0;
  pointer-events: none;
  transform: rotate(14deg);
  transition:
    opacity 420ms ease,
    left 900ms cubic-bezier(0.16, 1, 0.3, 1);
}

.portfolio-carousel__card[data-position="center"] {
  z-index: 5;
  cursor: default;
  transform: translate(-50%, -50%) scale(1) translateZ(32px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.98),
    0 40px 92px rgba(25, 56, 99, 0.22),
    0 9px 25px rgba(5, 87, 242, 0.08);
}

.portfolio-carousel__card[data-position="left"] {
  z-index: 2;
  transform: translate(-94%, -48%) scale(0.8) rotateY(3deg) rotateZ(-0.55deg) translateZ(-60px);
}

.portfolio-carousel__card[data-position="right"] {
  z-index: 2;
  transform: translate(-6%, -48%) scale(0.8) rotateY(-3deg) rotateZ(0.55deg) translateZ(-60px);
}

.portfolio-carousel__card[data-position="left"]::before,
.portfolio-carousel__card[data-position="right"]::before,
.portfolio-carousel__card[data-position="left"]::after,
.portfolio-carousel__card[data-position="right"]::after {
  opacity: 1;
}

.portfolio-carousel__titlebar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  height: 33px;
  align-items: center;
  padding: 0 14px;
  border-bottom: 1px solid rgba(6, 21, 50, 0.08);
  background: rgba(247, 249, 253, 0.83);
  -webkit-backdrop-filter: blur(16px) saturate(145%);
  backdrop-filter: blur(16px) saturate(145%);
}

.portfolio-carousel__titlebar > span:nth-child(2) {
  max-width: 180px;
  overflow: hidden;
  color: #7a8698;
  font-size: 0.63rem;
  font-weight: 560;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.portfolio-carousel__lights {
  display: flex;
  gap: 6px;
}

.portfolio-carousel__lights i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #c6ceda;
}

.portfolio-carousel__screen {
  display: grid;
  width: 100%;
  aspect-ratio: 1.82 / 1;
  overflow: hidden;
  place-items: center;
  border-bottom: 1px solid rgba(6, 21, 50, 0.08);
  background: #edf1f6;
}

.portfolio-carousel__screen img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.portfolio-carousel__meta {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 13px;
  align-items: center;
  padding: 14px 17px 16px;
  background: rgba(255, 255, 255, 0.86);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  backdrop-filter: blur(20px) saturate(140%);
}

.portfolio-carousel__number {
  display: grid;
  width: 31px;
  height: 31px;
  place-items: center;
  border: 1px solid rgba(5, 87, 242, 0.17);
  border-radius: 50%;
  background: rgba(5, 87, 242, 0.06);
  color: var(--blue);
  font-size: 0.64rem;
  font-weight: 850;
}

.portfolio-carousel__identity {
  min-width: 0;
}

.portfolio-carousel__identity strong,
.portfolio-carousel__identity small {
  display: block;
}

.portfolio-carousel__identity strong {
  margin-bottom: 3px;
  color: var(--ink);
  font-family: var(--display);
  font-size: clamp(1.02rem, 1.42vw, 1.3rem);
  line-height: 1;
}

.portfolio-carousel__identity small {
  overflow: hidden;
  color: var(--ink-soft);
  font-size: 0.67rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.portfolio-carousel__external,
.portfolio-carousel__side-control,
.portfolio-carousel__control {
  display: grid;
  place-items: center;
  border-radius: 50%;
  cursor: pointer;
}

.portfolio-carousel__external {
  width: 35px;
  height: 35px;
  background: var(--blue);
  box-shadow: 0 8px 18px rgba(5, 87, 242, 0.24);
  color: white;
}

.portfolio-carousel__side-control {
  position: absolute;
  z-index: 12;
  top: 50%;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.86);
  background: rgba(255, 255, 255, 0.68);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  backdrop-filter: blur(18px) saturate(160%);
  box-shadow: 0 12px 28px rgba(25, 56, 99, 0.15);
  color: var(--blue);
  transform: translateY(-50%);
}

.portfolio-carousel__card[data-position="left"] .portfolio-carousel__side-control {
  left: 24px;
}

.portfolio-carousel__card[data-position="right"] .portfolio-carousel__side-control {
  right: 24px;
}

.portfolio-carousel__controls {
  position: relative;
  z-index: 8;
  display: flex;
  width: fit-content;
  margin: 5px auto 0;
  align-items: center;
  gap: 7px;
  padding: 7px;
  border: 1px solid rgba(255, 255, 255, 0.86);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  -webkit-backdrop-filter: blur(24px) saturate(170%);
  backdrop-filter: blur(24px) saturate(170%);
  box-shadow: inset 0 1px 0 white, 0 15px 38px rgba(25, 56, 99, 0.12);
}

.portfolio-carousel__control {
  width: 42px;
  height: 42px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ink);
  transition:
    background 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.portfolio-carousel__progress {
  display: flex;
  min-width: 88px;
  justify-content: center;
  gap: 6px;
}

.portfolio-carousel__progress i {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(6, 21, 50, 0.17);
  transition:
    width 420ms cubic-bezier(0.16, 1, 0.3, 1),
    background 240ms ease;
}

.portfolio-carousel__progress i.is-active {
  width: 20px;
  background: var(--blue);
}

.portfolio-carousel__hint {
  position: relative;
  z-index: 8;
  margin: 13px auto 0;
  color: var(--ink-soft);
  text-align: center;
  font-size: 0.72rem;
}

.portfolio-carousel__external:focus-visible,
.portfolio-carousel__side-control:focus-visible,
.portfolio-carousel__control:focus-visible {
  outline: 3px solid rgba(5, 87, 242, 0.35);
  outline-offset: 3px;
}

@media (hover: hover) and (pointer: fine) {
  .portfolio-carousel__card[data-position="left"]:hover::before,
  .portfolio-carousel__card[data-position="right"]:hover::before {
    opacity: 0.58;
  }

  .portfolio-carousel__card[data-position="left"]:hover::after,
  .portfolio-carousel__card[data-position="right"]:hover::after {
    left: 72%;
  }

  .portfolio-carousel__control:hover {
    background: var(--blue);
    color: white;
    transform: scale(1.04);
  }
}

@supports not (backdrop-filter: blur(1px)) {
  .portfolio-carousel__card::before {
    background: rgba(255, 255, 255, 0.16);
  }

  .portfolio-carousel__titlebar,
  .portfolio-carousel__meta,
  .portfolio-carousel__side-control,
  .portfolio-carousel__controls {
    background: rgba(255, 255, 255, 0.92);
  }
}

@media (max-width: 860px) {
  .portfolio-carousel {
    min-height: 580px;
  }

  .portfolio-carousel__stage {
    height: clamp(340px, 68vw, 475px);
  }

  .portfolio-carousel__card {
    width: min(82vw, 690px);
  }

  .portfolio-carousel__card[data-position="left"] {
    transform: translate(-98%, -48%) scale(0.75) rotateY(2deg) translateZ(-60px);
  }

  .portfolio-carousel__card[data-position="right"] {
    transform: translate(-2%, -48%) scale(0.75) rotateY(-2deg) translateZ(-60px);
  }
}

@media (max-width: 560px) {
  .portfolio-intro {
    margin-bottom: 6px;
  }

  .portfolio-carousel {
    min-height: 500px;
  }

  .portfolio-carousel__stage {
    height: 325px;
  }

  .portfolio-carousel__card {
    width: 86vw;
    border-radius: 17px;
  }

  .portfolio-carousel__titlebar {
    height: 25px;
  }

  .portfolio-carousel__meta {
    padding: 10px 12px 12px;
  }

  .portfolio-carousel__identity small {
    display: none;
  }

  .portfolio-carousel__external {
    width: 30px;
    height: 30px;
  }

  .portfolio-carousel__side-control {
    width: 38px;
    height: 38px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .portfolio-carousel__card,
  .portfolio-carousel__card::before,
  .portfolio-carousel__card::after,
  .portfolio-carousel__progress i,
  .portfolio-carousel__control {
    transition-duration: 0.01ms !important;
  }

  .portfolio-carousel__card::after {
    display: none;
  }
}
```

- [ ] **Step 5: Replace the portfolio heading copy in `index.astro`**

Replace the existing `.portfolio-intro` block with:

```astro
<div class="portfolio-intro" data-reveal>
  <p class="eyebrow">Wybrane realizacje</p>
  <h2 id="portfolio-title">Trzy marki. <em>Każda z własnym charakterem.</em></h2>
  <p>
    Przesuń kolekcję i zobacz trzy różne odpowiedzi projektowe
    stworzone dla trzech różnych odbiorców.
  </p>
</div>
```

- [ ] **Step 6: Remove the obsolete global portfolio CSS**

Make these targeted deletions in `src/styles/global.css`:

1. Remove `.project-card` from the shared selector beginning with `.service-card, .support-grid article, .process-step` near line 2122.
2. Delete the complete legacy block from `.portfolio { display: grid; ... }` through `.portfolio-controls button:hover { ... }` near lines 2939–3066.
3. At `@media (max-width: 1160px)`, remove `.portfolio` from the `.hero, .comparison, .portfolio` grid selector, then delete the `.portfolio-island` and `.portfolio-controls` overrides.
4. In the phone media query near lines 4052–4066, delete `.portfolio-stage`, `.project-card`, and both numbered `data-position` overrides.

Do not remove the generic `.portfolio-intro > p` typography rule or the `.portfolio-intro` max-width grouping; the new component stylesheet intentionally refines those declarations.

- [ ] **Step 7: Run style validation and build**

Run:

```powershell
npm run validate:portfolio
npm run build
```

Expected: validator success, then Astro build exit code 0. The generated CSS must contain no legacy `.project-card[data-position=...]` rules.

- [ ] **Step 8: Commit the visual slice**

```powershell
git add scripts/validate-portfolio-carousel.mjs src/components/PortfolioCarousel.tsx src/components/PortfolioCarousel.css src/pages/index.astro src/styles/global.css
git commit -m "feat: style layered glass portfolio carousel"
```


---

### Task 4: Verify interaction, responsive geometry, glass visibility, and reduced motion in Chrome

**Files:**
- Create: `scripts/verify-portfolio-carousel.mjs`
- Modify: `package.json:6-13`
- Create for inspection only: `output/playwright/portfolio-glass-desktop.png`
- Create for inspection only: `output/playwright/portfolio-glass-mobile.png`

**Interfaces:**
- Consumes: the running Astro page at `http://127.0.0.1:4321/#projekty` and all selectors established in Tasks 2–3.
- Produces: an automated browser pass plus two visual artifacts proving the active screenshot, visible side cards, glass, desktop geometry, and mobile behavior.

- [ ] **Step 1: Create the complete Chrome verifier**

Create `scripts/verify-portfolio-carousel.mjs` with:

```js
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const pageUrl = "http://127.0.0.1:4321/#projekty";
const outputDir = resolve("output/playwright");
const port = 9700 + Math.floor(Math.random() * 200);
const profileDir = await mkdtemp(join(tmpdir(), "nowaweb-portfolio-"));
const delay = (ms) => new Promise((resolveDelay) => setTimeout(resolveDelay, ms));

async function fetchJson(url, retries = 80) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch (error) {
      lastError = error;
    }
    await delay(100);
  }
  throw lastError ?? new Error(`Cannot reach ${url}`);
}

function createCdpClient(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  const callbacks = new Map();
  const listeners = new Map();
  let id = 0;

  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    if (payload.id && callbacks.has(payload.id)) {
      const callback = callbacks.get(payload.id);
      callbacks.delete(payload.id);
      if (payload.error) callback.reject(new Error(payload.error.message));
      else callback.resolve(payload.result ?? {});
      return;
    }
    for (const listener of listeners.get(payload.method) ?? []) listener(payload.params);
  });

  return new Promise((resolveClient, rejectClient) => {
    socket.addEventListener("open", () => {
      resolveClient({
        send(method, params = {}) {
          id += 1;
          socket.send(JSON.stringify({ id, method, params }));
          return new Promise((resolveCall, rejectCall) => {
            callbacks.set(id, { resolve: resolveCall, reject: rejectCall });
          });
        },
        on(method, listener) {
          listeners.set(method, [...(listeners.get(method) ?? []), listener]);
        },
        close() {
          socket.close();
        },
      });
    });
    socket.addEventListener("error", rejectClient);
  });
}

async function evaluate(client, expression) {
  const response = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text);
  }
  return response.result.value;
}

async function navigateToPortfolio(client) {
  await client.send("Page.navigate", { url: pageUrl });
  await delay(1700);
  await evaluate(
    client,
    `(async () => {
      const section = document.querySelector('#projekty');
      section.scrollIntoView({ block: 'center', behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 500));
    })()`,
  );
}

async function capture(client, filename) {
  const screenshot = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await writeFile(join(outputDir, filename), Buffer.from(screenshot.data, "base64"));
}

const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    "--window-size=1440,1000",
    "about:blank",
  ],
  { stdio: "ignore" },
);

await mkdir(outputDir, { recursive: true });

try {
  await fetchJson(`http://127.0.0.1:${port}/json/version`);
  const pages = await fetchJson(`http://127.0.0.1:${port}/json/list`);
  const page = pages.find((candidate) => candidate.type === "page") ?? pages[0];
  const client = await createCdpClient(page.webSocketDebuggerUrl);
  const runtimeErrors = [];

  client.on("Runtime.exceptionThrown", ({ exceptionDetails }) => {
    runtimeErrors.push(exceptionDetails.exception?.description ?? exceptionDetails.text);
  });

  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await client.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await navigateToPortfolio(client);

  const desktop = await evaluate(
    client,
    `(() => {
      const root = document.querySelector('.portfolio-carousel');
      const cards = Array.from(document.querySelectorAll('.portfolio-carousel__card'));
      const sideCards = cards.filter((card) => card.dataset.position !== 'center');
      const center = cards.find((card) => card.dataset.position === 'center');
      const glass = getComputedStyle(sideCards[0], '::before');
      return {
        count: cards.length,
        active: Number(root.dataset.active),
        activeName: center.dataset.project,
        positions: cards.map((card) => card.dataset.position).sort(),
        objectFits: cards.map((card) => getComputedStyle(card.querySelector('img')).objectFit),
        sideFilters: sideCards.map((card) => getComputedStyle(card).filter),
        glassBackdrop: glass.backdropFilter || glass.webkitBackdropFilter,
        glassOpacity: Number(glass.opacity),
        visibleSideWidths: sideCards.map((card) => {
          const rect = card.getBoundingClientRect();
          return Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0));
        }),
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    })()`,
  );

  assert.equal(desktop.count, 3);
  assert.equal(desktop.active, 1);
  assert.equal(desktop.activeName, "New York Rolls");
  assert.deepEqual(desktop.positions, ["center", "left", "right"]);
  assert.deepEqual(desktop.objectFits, ["contain", "contain", "contain"]);
  assert.ok(desktop.sideFilters.every((filter) => filter === "none"));
  assert.match(desktop.glassBackdrop, /blur\(2\.5px\)/);
  assert.ok(desktop.glassOpacity > 0.9);
  assert.ok(desktop.visibleSideWidths.every((width) => width > 130));
  assert.equal(desktop.horizontalOverflow, false);
  await capture(client, "portfolio-glass-desktop.png");

  const clickSequence = await evaluate(
    client,
    `(async () => {
      const active = () => Number(document.querySelector('.portfolio-carousel').dataset.active);
      document.querySelector('[data-position="right"] .portfolio-carousel__side-control').click();
      await new Promise((resolve) => setTimeout(resolve, 900));
      const afterSide = active();
      document.querySelector('.portfolio-carousel__control--prev').click();
      await new Promise((resolve) => setTimeout(resolve, 900));
      const afterPrevious = active();
      const stage = document.querySelector('.portfolio-carousel__stage');
      stage.focus();
      stage.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 900));
      return { afterSide, afterPrevious, afterKeyboard: active() };
    })()`,
  );

  assert.deepEqual(clickSequence, { afterSide: 2, afterPrevious: 1, afterKeyboard: 0 });

  const stageRect = await evaluate(
    client,
    `(() => {
      const rect = document.querySelector('.portfolio-carousel__stage').getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`,
  );
  await client.send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: stageRect.x + 120,
    y: stageRect.y,
    button: "left",
    buttons: 1,
    clickCount: 1,
  });
  await client.send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: stageRect.x - 120,
    y: stageRect.y,
    button: "left",
    buttons: 1,
  });
  await client.send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: stageRect.x - 120,
    y: stageRect.y,
    button: "left",
    buttons: 0,
    clickCount: 1,
  });
  await delay(900);
  assert.equal(
    await evaluate(client, `Number(document.querySelector('.portfolio-carousel').dataset.active)`),
    1,
  );

  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await navigateToPortfolio(client);
  const mobile = await evaluate(
    client,
    `(() => {
      const cards = Array.from(document.querySelectorAll('.portfolio-carousel__card'));
      const center = cards.find((card) => card.dataset.position === 'center');
      return {
        centerWidthRatio: center.getBoundingClientRect().width / innerWidth,
        objectFits: cards.map((card) => getComputedStyle(card.querySelector('img')).objectFit),
        sideControls: cards.filter((card) => card.dataset.position !== 'center').map((card) => {
          const control = card.querySelector('.portfolio-carousel__side-control');
          return getComputedStyle(control).display !== 'none';
        }),
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    })()`,
  );
  assert.ok(mobile.centerWidthRatio > 0.82 && mobile.centerWidthRatio < 0.9);
  assert.deepEqual(mobile.objectFits, ["contain", "contain", "contain"]);
  assert.deepEqual(mobile.sideControls, [true, true]);
  assert.equal(mobile.horizontalOverflow, false);
  await capture(client, "portfolio-glass-mobile.png");

  await client.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await navigateToPortfolio(client);
  const reduced = await evaluate(
    client,
    `(() => {
      const card = document.querySelector('.portfolio-carousel__card[data-position="center"]');
      const seconds = getComputedStyle(card).transitionDuration
        .split(',')
        .map((value) => value.trim().endsWith('ms')
          ? Number.parseFloat(value) / 1000
          : Number.parseFloat(value));
      return { matches: matchMedia('(prefers-reduced-motion: reduce)').matches, seconds };
    })()`,
  );
  assert.equal(reduced.matches, true);
  assert.ok(reduced.seconds.every((seconds) => seconds < 0.001));
  assert.deepEqual(runtimeErrors, []);

  console.log("Portfolio carousel browser verification passed.");
  console.log(JSON.stringify({ desktop, clickSequence, mobile, reduced }, null, 2));
  client.close();
} finally {
  chrome.kill();
}
```

- [ ] **Step 2: Add the browser verification command**

Add this entry to the existing `scripts` object in `package.json`:

```json
"verify:portfolio": "node scripts/verify-portfolio-carousel.mjs"
```

- [ ] **Step 3: Start the local Astro server**

Run in a persistent terminal:

```powershell
npm run dev
```

Expected: Astro reports `http://127.0.0.1:4321/` and remains running.

- [ ] **Step 4: Run the real-browser verifier**

Run in a second terminal:

```powershell
npm run verify:portfolio
```

Expected:

```text
Portfolio carousel browser verification passed.
```

Expected output files:

```text
output/playwright/portfolio-glass-desktop.png
output/playwright/portfolio-glass-mobile.png
```

- [ ] **Step 5: Inspect both screenshots**

Confirm all of the following:

- the center screenshot is large and completely visible,
- at least 130 px of each side card is visible on desktop,
- side screenshots retain their original colors,
- the glass reads as a light reflective plane rather than gray dimming,
- the side arrow control sits inside the visible portion of each side card,
- no card, heading, or control is clipped,
- mobile shows a wide center card and recognizable side peeks,
- the section does not visually collide with the process or support sections.

If a check fails, adjust only `PortfolioCarousel.css`, rerun `npm run validate:portfolio`, `npm run build`, and `npm run verify:portfolio`, then inspect the regenerated screenshots.

- [ ] **Step 6: Run final regression commands**

Run:

```powershell
npm run validate:portfolio
npm run build
npm run verify:portfolio
```

Expected: all three commands exit with code 0.

- [ ] **Step 7: Commit the verifier and any final visual correction**

Do not stage generated screenshots unless the user explicitly requests them.

```powershell
git add package.json scripts/verify-portfolio-carousel.mjs src/components/PortfolioCarousel.css src/components/PortfolioCarousel.tsx src/pages/index.astro src/styles/global.css
git commit -m "test: verify portfolio carousel interactions"
```

