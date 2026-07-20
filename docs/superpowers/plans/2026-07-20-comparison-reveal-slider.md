# Comparison Reveal Slider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current comparison table with an accessible 0-100% reveal slider that compares NowaWeb and WordPress across five animated criteria.

**Architecture:** Keep the section heading in Astro and move all comparison data and interaction into one focused React island named `ComparisonReveal.tsx`. The range input updates a CSS custom property directly so pointer movement does not re-render React, while React state changes only when the active criterion changes. Global CSS integrates the island with the existing page theme, and focused Node/CDP scripts verify source contracts and real browser behavior.

**Tech Stack:** Astro, React, TypeScript, native range input, CSS custom properties, Node.js assertions, Chrome DevTools Protocol.

## Global Constraints

- Replace only the existing comparison section; keep page order, navigation, surrounding sections and copy voice unchanged.
- Keep exactly five criteria: `Szybkość`, `Koszty`, `Bezpieczeństwo`, `Wygląd`, `Wsparcie`.
- Use cobalt for NowaWeb, steel blue-gray for WordPress, broken white for controls, ink navy for text and orange only for the `VS` handle and active feedback.
- The reveal range is exactly `0-100%`; either layer can be fully shown while the visible handle remains inside the stage.
- Pointer, touch and keyboard input must work through a native `input[type="range"]`.
- Continuous slider movement must update a CSS custom property directly and must not update React state on every pointer frame.
- Criterion selection updates both layer messages from one shared criterion object.
- No scores, progress bars, checkmark lists or table rows.
- Do not add a third-party dependency.
- Reduced motion, WCAG AA contrast and visible keyboard focus are mandatory.
- The server-rendered near-center state must remain useful if hydration fails.
- Motion timing receives a visual refinement pass only after the functional component is integrated.

---

## File Structure

- Create `src/components/ComparisonReveal.tsx`: comparison data, range interaction, criterion state, accessible markup and transition lifecycle.
- Modify `src/pages/index.astro`: import and render the island, remove the old data array and table markup, retain the section heading and explanatory copy.
- Modify `src/styles/global.css`: stage composition, reveal clipping, slider handle, criterion selector, transitions, focus states and responsive rules.
- Create `scripts/validate-comparison-reveal.mjs`: fast source contract used before each browser run.
- Create `scripts/verify-comparison-reveal.mjs`: real Chrome verification for reveal endpoints, synchronized criteria, rapid changes, keyboard input and mobile bounds.

---

### Task 1: Define the component contract and static island

**Files:**
- Create: `scripts/validate-comparison-reveal.mjs`
- Create: `src/components/ComparisonReveal.tsx`

**Interfaces:**
- Consumes: no application props; all five approved criteria live in the component.
- Produces: default React component `ComparisonReveal`, root attribute `data-comparison-reveal`, range attribute `data-comparison-slider`, criterion buttons with `data-comparison-criterion`, and layer attributes `data-comparison-layer="nowaweb|wordpress"`.

- [ ] **Step 1: Write the failing static contract test**

Create `scripts/validate-comparison-reveal.mjs` with this content:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const component = await readFile(
  new URL("../src/components/ComparisonReveal.tsx", import.meta.url),
  "utf8",
).catch(() => "");

assert.match(component, /export default function ComparisonReveal/, "comparison island is missing");
assert.equal(
  (component.match(/label:\s*"/g) ?? []).length,
  5,
  "comparison must contain exactly five criteria",
);
for (const label of ["Szybkość", "Koszty", "Bezpieczeństwo", "Wygląd", "Wsparcie"]) {
  assert.ok(component.includes(label), `missing criterion: ${label}`);
}
assert.match(component, /data-comparison-reveal/, "comparison root hook is missing");
assert.match(component, /data-comparison-slider/, "native slider hook is missing");
assert.match(component, /type="range"/, "comparison must use a native range input");
assert.match(component, /min="0"/, "range minimum must be zero");
assert.match(component, /max="100"/, "range maximum must be one hundred");
assert.match(component, /defaultValue="52"/, "range must start near the center");
assert.match(
  component,
  /style\.setProperty\("--comparison-reveal"/,
  "slider input must update the reveal CSS property directly",
);
assert.doesNotMatch(
  component,
  /setReveal|useState\([^)]*52/,
  "continuous reveal must not use React state",
);
assert.match(component, /aria-label="Przesuń, aby porównać/, "range needs a Polish label");
assert.match(component, /aria-selected=\{isActive\}/, "criteria need selected semantics");
assert.match(component, /aria-live="polite"/, "criterion copy needs a polite live region");
assert.match(component, /data-comparison-layer="nowaweb"/, "NowaWeb layer is missing");
assert.match(component, /data-comparison-layer="wordpress"/, "WordPress layer is missing");

console.log("Comparison reveal component contract is present.");
```

- [ ] **Step 2: Run the contract test and confirm the expected failure**

Run:

```powershell
node scripts/validate-comparison-reveal.mjs
```

Expected: FAIL with `AssertionError: comparison island is missing`.

- [ ] **Step 3: Create the static, server-renderable island**

Create `src/components/ComparisonReveal.tsx`. Use this data shape and component structure:

```tsx
import { useEffect, useRef, useState } from "react";

type Criterion = {
  label: string;
  nowawebTitle: string;
  nowawebDetail: string;
  wordpressTitle: string;
  wordpressDetail: string;
};

const criteria: Criterion[] = [
  {
    label: "Szybkość",
    nowawebTitle: "Lekka od pierwszej linii.",
    nowawebDetail: "Budujemy tylko to, czego potrzebuje marka i jej użytkownicy.",
    wordpressTitle: "Więcej warstw. Mniej tempa.",
    wordpressDetail: "Motyw, pluginy i dodatkowe skrypty zwiększają ciężar strony.",
  },
  {
    label: "Koszty",
    nowawebTitle: "Zakres, który da się przewidzieć.",
    nowawebDetail: "Wiesz, za co płacisz na starcie i podczas dalszego rozwoju.",
    wordpressTitle: "Dodatki mnożą kolejne koszty.",
    wordpressDetail: "Licencje, hosting i poprawki potrafią rosnąć razem ze stroną.",
  },
  {
    label: "Bezpieczeństwo",
    nowawebTitle: "Mniej punktów wejścia.",
    nowawebDetail: "Prostsza architektura ogranicza powierzchnię potencjalnego ataku.",
    wordpressTitle: "Popularny cel automatycznych ataków.",
    wordpressDetail: "Motywy i wtyczki wymagają ciągłego pilnowania aktualizacji.",
  },
  {
    label: "Wygląd",
    nowawebTitle: "Marka prowadzi projekt.",
    nowawebDetail: "Układ, rytm i detale wynikają z Twojej firmy, nie z gotowego motywu.",
    wordpressTitle: "Szablon prowadzi markę.",
    wordpressDetail: "Gotowy motyw ogranicza kompozycję i często upodabnia stronę do innych.",
  },
  {
    label: "Wsparcie",
    nowawebTitle: "Jedna osoba zna całość.",
    nowawebDetail: "Masz jasny kontakt z kimś, kto rozumie wszystkie decyzje projektu.",
    wordpressTitle: "Problem krąży między dostawcami.",
    wordpressDetail: "Źródłem błędu może być motyw, plugin, hosting albo ich połączenie.",
  },
];

export default function ComparisonReveal() {
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const item = criteria[activeIndex];

  const updateIndicator = (index: number) => {
    const root = rootRef.current;
    const button = buttonRefs.current[index];
    if (!root || !button) return;
    root.style.setProperty("--comparison-tab-x", `${button.offsetLeft}px`);
    root.style.setProperty("--comparison-tab-width", `${button.offsetWidth}px`);
  };

  useEffect(() => {
    updateIndicator(activeIndex);
    const selector = selectorRef.current;
    if (!selector || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => updateIndicator(activeIndex));
    observer.observe(selector);
    return () => observer.disconnect();
  }, [activeIndex]);

  return (
    <div className="comparison-reveal" data-comparison-reveal ref={rootRef}>
      <div className="comparison-criteria" ref={selectorRef} role="tablist" aria-label="Kryteria porównania">
        <span className="comparison-tab-indicator" aria-hidden="true" />
        {criteria.map((criterion, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              aria-controls="comparison-stage"
              aria-selected={isActive}
              className={isActive ? "is-active" : ""}
              data-comparison-criterion
              key={criterion.label}
              onClick={() => setActiveIndex(index)}
              ref={(node) => { buttonRefs.current[index] = node; }}
              role="tab"
              type="button"
            >
              {criterion.label}
            </button>
          );
        })}
      </div>

      <div aria-live="polite" className="comparison-stage" id="comparison-stage" role="tabpanel">
        <article className="comparison-layer comparison-layer--wordpress" data-comparison-layer="wordpress">
          <div className="comparison-layer-copy">
            <span className="comparison-side-label">Typowy WordPress</span>
            <h3>{item.wordpressTitle}</h3>
          </div>
          <p>{item.wordpressDetail}</p>
        </article>

        <article className="comparison-layer comparison-layer--nowaweb" data-comparison-layer="nowaweb">
          <div className="comparison-layer-copy">
            <span className="comparison-side-label">NowaWeb</span>
            <h3>{item.nowawebTitle}</h3>
          </div>
          <p>{item.nowawebDetail}</p>
        </article>

        <span className="comparison-divider" aria-hidden="true" />
        <span className="comparison-handle" aria-hidden="true">VS</span>
        <input
          aria-label="Przesuń, aby porównać NowaWeb i WordPress"
          className="comparison-slider"
          data-comparison-slider
          defaultValue="52"
          max="100"
          min="0"
          onInput={(event) => {
            rootRef.current?.style.setProperty(
              "--comparison-reveal",
              `${event.currentTarget.value}%`,
            );
          }}
          type="range"
        />
      </div>

      <p className="comparison-instruction">Przeciągnij VS, aby odsłonić warstwę NowaWeb.</p>
    </div>
  );
}
```

- [ ] **Step 4: Run the static contract test**

Run:

```powershell
node scripts/validate-comparison-reveal.mjs
```

Expected: `Comparison reveal component contract is present.`

- [ ] **Step 5: Commit the isolated component**

```powershell
git add scripts/validate-comparison-reveal.mjs src/components/ComparisonReveal.tsx
git commit -m "feat: add comparison reveal island"
```

---

### Task 2: Integrate the island and replace the table styling

**Files:**
- Modify: `scripts/validate-comparison-reveal.mjs`
- Modify: `src/pages/index.astro:1-82,317-340`
- Modify: `src/styles/global.css:2448-2521,3181,3314`

**Interfaces:**
- Consumes: default `ComparisonReveal` component and all `data-comparison-*` hooks from Task 1.
- Produces: hydrated `client:visible` section, responsive comparison styling and stable section heading with `id="comparison-title"`.

- [ ] **Step 1: Extend the validator with page and CSS requirements**

Append this code before the final `console.log` in `scripts/validate-comparison-reveal.mjs`:

```js
const page = await readFile(new URL("../src/pages/index.astro", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/styles/global.css", import.meta.url), "utf8");

assert.match(page, /import ComparisonReveal/, "comparison island is not imported");
assert.match(page, /<ComparisonReveal client:visible\s*\/>/, "comparison island is not hydrated lazily");
assert.doesNotMatch(page, /const comparisonRows/, "legacy comparison data remains in Astro");
assert.doesNotMatch(page, /comparison-table|table-head|table-row/, "legacy table markup remains");
assert.match(styles, /\.comparison-reveal\s*\{/, "comparison root styles are missing");
assert.match(styles, /--comparison-reveal:\s*52%;/, "default reveal position is missing");
assert.match(styles, /clip-path:\s*inset\(0 calc\(100% - var\(--comparison-reveal\)\) 0 0\)/, "NowaWeb layer is not clipped by reveal");
assert.match(styles, /left:\s*clamp\(/, "visible handle must remain inside both edges");
assert.match(styles, /:has\(\.comparison-slider:focus-visible\) \.comparison-handle/, "visible range focus treatment is missing");
assert.match(styles, /touch-action:\s*pan-y;/, "slider must preserve vertical touch scrolling");
assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.comparison-reveal/, "comparison reduced-motion override is missing");
```

- [ ] **Step 2: Run the validator and confirm integration fails**

Run:

```powershell
node scripts/validate-comparison-reveal.mjs
```

Expected: FAIL with `comparison island is not imported`.

- [ ] **Step 3: Replace the Astro table with the island**

In `src/pages/index.astro`:

1. Add this import next to the other component imports:

```astro
import ComparisonReveal from "../components/ComparisonReveal";
```

2. Delete the complete `comparisonRows` constant.

3. Replace the existing comparison section with:

```astro
<section class="studio-section comparison" aria-labelledby="comparison-title">
  <div class="comparison-intro" data-reveal>
    <p class="eyebrow orange">Porównanie</p>
    <h2 id="comparison-title">NowaWeb <em>vs</em> WordPress</h2>
    <p>
      WordPress bywa dobry. My wybieramy lżejszą ścieżkę dla firm, które chcą
      strony szybkiej, prostej w utrzymaniu i projektowanej pod markę.
    </p>
  </div>
  <ComparisonReveal client:visible />
</section>
```

- [ ] **Step 4: Replace the legacy comparison CSS**

Delete `.comparison-table`, `.table-head`, `.table-row` and their child rules. Replace the `.comparison` block with these implementation rules, preserving existing global tokens:

```css
.comparison {
  display: block;
}

.comparison-intro {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 420px);
  align-items: end;
  gap: clamp(32px, 6vw, 88px);
  max-width: none;
  margin-bottom: clamp(34px, 5vw, 64px);
}

.comparison-intro h2 {
  max-width: 820px;
  margin-bottom: 0;
}

.comparison-intro h2 em {
  color: var(--orange);
}

.comparison-intro > p:last-child {
  max-width: 40ch;
  margin: 0;
}

.comparison-reveal {
  --comparison-reveal: 52%;
  --comparison-tab-x: 5px;
  --comparison-tab-width: 92px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(6, 21, 50, 0.14);
  border-radius: 16px;
  background: #dbe2ec;
  box-shadow: 0 34px 100px rgba(6, 21, 50, 0.18);
  isolation: isolate;
}

.comparison-criteria {
  position: absolute;
  inset: 22px 22px auto;
  z-index: 8;
  display: flex;
  gap: 5px;
  width: max-content;
  max-width: calc(100% - 44px);
  padding: 5px;
  overflow-x: auto;
  border: 1px solid rgba(6, 21, 50, 0.13);
  border-radius: 999px;
  background: rgba(255, 253, 247, 0.84);
  backdrop-filter: blur(18px);
  box-shadow: 0 12px 28px rgba(6, 21, 50, 0.08);
  scrollbar-width: none;
  isolation: isolate;
}

.comparison-criteria::-webkit-scrollbar {
  display: none;
}

.comparison-criteria button {
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
  padding: 10px 15px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--ink-soft);
  font-size: 0.75rem;
  font-weight: 850;
  cursor: pointer;
  transition: color 360ms cubic-bezier(0.22, 1, 0.36, 1), transform 180ms ease;
}

.comparison-criteria button.is-active {
  color: var(--paper-clean);
}

.comparison-criteria button:active {
  transform: scale(0.97);
}

.comparison-criteria button:focus-visible {
  outline: 3px solid var(--orange);
  outline-offset: 3px;
}

.comparison-reveal:has(.comparison-slider:focus-visible) .comparison-handle {
  outline: 3px solid var(--ink);
  outline-offset: 4px;
}

.comparison-tab-indicator {
  position: absolute;
  z-index: 1;
  left: 0;
  top: 5px;
  width: var(--comparison-tab-width);
  height: calc(100% - 10px);
  border-radius: 999px;
  background: var(--ink);
  box-shadow: 0 5px 14px rgba(6, 21, 50, 0.16);
  transform: translateX(var(--comparison-tab-x));
  transition: width 480ms cubic-bezier(0.22, 1, 0.36, 1), transform 480ms cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.comparison-stage {
  position: relative;
  min-height: clamp(600px, 45vw, 680px);
  overflow: hidden;
}

.comparison-layer {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 0.7fr);
  align-items: end;
  padding: 112px clamp(34px, 6vw, 88px) clamp(38px, 6vw, 76px);
}

.comparison-layer::after {
  position: absolute;
  right: -2vw;
  bottom: -12vw;
  font-size: clamp(19rem, 36vw, 38rem);
  font-weight: 950;
  line-height: 0.78;
  letter-spacing: -0.1em;
  pointer-events: none;
}

.comparison-layer--wordpress {
  color: var(--ink);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.22), transparent 43%), #dbe2ec;
}

.comparison-layer--wordpress::after {
  content: "WP";
  color: rgba(6, 21, 50, 0.07);
}

.comparison-layer--nowaweb {
  z-index: 2;
  color: white;
  background: radial-gradient(circle at 16% 15%, rgba(255, 255, 255, 0.16), transparent 26%), linear-gradient(132deg, #0b50d8 0 58%, #073a9b 100%);
  clip-path: inset(0 calc(100% - var(--comparison-reveal)) 0 0);
}

.comparison-layer--nowaweb::after {
  content: "NW";
  color: rgba(255, 255, 255, 0.07);
}

.comparison-layer-copy,
.comparison-layer > p {
  position: relative;
  z-index: 2;
}

.comparison-side-label {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  margin-bottom: 26px;
  padding: 0 12px;
  border: 1px solid currentColor;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.comparison-layer h3 {
  max-width: 760px;
  margin: 0;
  font-family: var(--display);
  font-size: clamp(3.2rem, 7vw, 7.8rem);
  line-height: 0.83;
  letter-spacing: -0.075em;
}

.comparison-layer > p {
  align-self: end;
  max-width: 31ch;
  margin: 0 0 4px auto;
  padding-left: 32px;
  font-size: 1rem;
  line-height: 1.5;
}

.comparison-layer > p::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 18px;
  height: 2px;
  background: currentColor;
}

.comparison-layer--wordpress > p {
  color: var(--ink-soft);
}

.comparison-layer--nowaweb > p {
  color: rgba(255, 255, 255, 0.82);
}

.comparison-divider {
  position: absolute;
  z-index: 5;
  left: var(--comparison-reveal);
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 0 0 1px rgba(6, 21, 50, 0.2);
  transform: translateX(-1px);
  pointer-events: none;
}

.comparison-handle {
  position: absolute;
  z-index: 6;
  left: clamp(36px, var(--comparison-reveal), calc(100% - 36px));
  top: 50%;
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border: 6px solid rgba(255, 253, 247, 0.94);
  border-radius: 50%;
  background: var(--orange);
  color: white;
  box-shadow: 0 18px 42px rgba(6, 21, 50, 0.28);
  font-size: 0.77rem;
  font-weight: 950;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.comparison-slider {
  position: absolute;
  z-index: 7;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: ew-resize;
  touch-action: pan-y;
}

.comparison-instruction {
  position: relative;
  z-index: 9;
  margin: 0;
  padding: 17px 22px;
  border-top: 1px solid rgba(6, 21, 50, 0.12);
  background: rgba(255, 253, 247, 0.9);
  color: var(--ink-soft);
  font-size: 0.78rem;
  font-weight: 750;
}
```

Add the following responsive rules inside the existing media queries:

```css
@media (max-width: 1160px) {
  .comparison-intro {
    grid-template-columns: 1fr;
    gap: 22px;
  }

  .comparison-layer {
    grid-template-columns: 1fr;
    align-content: end;
    gap: 36px;
  }

  .comparison-layer > p {
    margin-left: 0;
  }
}

@media (max-width: 760px) {
  .comparison-intro {
    margin-bottom: 28px;
  }

  .comparison-reveal {
    border-radius: 12px;
  }

  .comparison-criteria {
    inset: 12px 12px auto;
    max-width: calc(100% - 24px);
  }

  .comparison-criteria button {
    padding: 9px 12px;
  }

  .comparison-stage {
    min-height: 560px;
  }

  .comparison-layer {
    padding: 94px 24px 34px;
  }

  .comparison-layer h3 {
    font-size: clamp(3rem, 15vw, 5.2rem);
  }

  .comparison-layer > p {
    padding-left: 24px;
    font-size: 0.86rem;
  }

  .comparison-handle {
    left: clamp(30px, var(--comparison-reveal), calc(100% - 30px));
    width: 60px;
    height: 60px;
    border-width: 5px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .comparison-reveal *,
  .comparison-reveal *::before,
  .comparison-reveal *::after {
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 5: Run source validation and production build**

Run:

```powershell
node scripts/validate-comparison-reveal.mjs
npm run build
```

Expected:

- `Comparison reveal component contract is present.`
- Astro build exits with code `0`.

- [ ] **Step 6: Commit the integrated base**

```powershell
git add scripts/validate-comparison-reveal.mjs src/pages/index.astro src/styles/global.css
git commit -m "feat: replace comparison table with reveal slider"
```

---

### Task 3: Add transition lifecycle and real-browser behavior verification

**Files:**
- Modify: `src/components/ComparisonReveal.tsx`
- Modify: `src/styles/global.css`
- Create: `scripts/verify-comparison-reveal.mjs`

**Interfaces:**
- Consumes: the integrated comparison at `http://127.0.0.1:4321/` and Task 1 data hooks.
- Produces: `data-comparison-transitioning` state, rapid-click-safe content changes and a focused Chrome verification command.

- [ ] **Step 1: Write the browser verification script**

Create `scripts/verify-comparison-reveal.mjs`. Reuse the project's dependency-free CDP pattern and include these exact behavioral assertions:

```js
import { spawn } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const url = "http://127.0.0.1:4321/";
const port = 9600 + Math.floor(Math.random() * 200);
const profileDir = await mkdtemp(join(tmpdir(), "nowaweb-comparison-"));
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(endpoint, retries = 80) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) return response.json();
    } catch (error) {
      lastError = error;
    }
    await delay(100);
  }
  throw lastError ?? new Error(`Cannot reach ${endpoint}`);
}

function createCdpClient(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  const callbacks = new Map();
  let id = 0;
  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    if (!payload.id || !callbacks.has(payload.id)) return;
    const callback = callbacks.get(payload.id);
    callbacks.delete(payload.id);
    if (payload.error) callback.reject(new Error(payload.error.message));
    else callback.resolve(payload.result ?? {});
  });
  return new Promise((resolve, reject) => {
    socket.addEventListener("open", () => resolve({
      send(method, params = {}) {
        id += 1;
        socket.send(JSON.stringify({ id, method, params }));
        return new Promise((resolveCall, rejectCall) => {
          callbacks.set(id, { resolve: resolveCall, reject: rejectCall });
        });
      },
      close() { socket.close(); },
    }));
    socket.addEventListener("error", reject);
  });
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text ?? "Browser evaluation failed");
  return result.result.value;
}

const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profileDir}`,
  "--window-size=1440,1000",
  "about:blank",
], { stdio: "ignore" });

try {
  await fetchJson(`http://127.0.0.1:${port}/json/version`);
  const pages = await fetchJson(`http://127.0.0.1:${port}/json/list`);
  const page = pages.find((candidate) => candidate.type === "page") ?? pages[0];
  const client = await createCdpClient(page.webSocketDebuggerUrl);
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Page.navigate", { url });
  await delay(1800);

  const state = await evaluate(client, `(async () => {
    const root = document.querySelector('[data-comparison-reveal]');
    const slider = document.querySelector('[data-comparison-slider]');
    const tabs = Array.from(document.querySelectorAll('[data-comparison-criterion]'));
    const nowaweb = document.querySelector('[data-comparison-layer="nowaweb"]');
    const wordpress = document.querySelector('[data-comparison-layer="wordpress"]');
    if (!root || !slider || tabs.length !== 5 || !nowaweb || !wordpress) return { missing: true };

    slider.value = '0';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    const atZero = getComputedStyle(root).getPropertyValue('--comparison-reveal').trim();
    slider.value = '100';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    const atHundred = getComputedStyle(root).getPropertyValue('--comparison-reveal').trim();

    tabs[1].click();
    const transitioningAfterClick = root.hasAttribute('data-comparison-transitioning');
    tabs[4].click();
    await new Promise((resolve) => setTimeout(resolve, 520));

    const active = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true');
    const stageRect = root.querySelector('.comparison-stage').getBoundingClientRect();
    const handleRect = root.querySelector('.comparison-handle').getBoundingClientRect();
    return {
      missing: false,
      atZero,
      atHundred,
      transitioningAfterClick,
      activeText: active?.textContent?.trim(),
      nowawebTitle: nowaweb.querySelector('h3')?.textContent?.trim(),
      wordpressTitle: wordpress.querySelector('h3')?.textContent?.trim(),
      handleInside: handleRect.left >= stageRect.left && handleRect.right <= stageRect.right,
      pageOverflows: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  })()`);

  await evaluate(client, `(() => {
    const slider = document.querySelector('[data-comparison-slider]');
    slider.value = '52';
    slider.focus();
  })()`);
  await client.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Home", code: "Home", nativeVirtualKeyCode: 36 });
  await client.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Home", code: "Home", nativeVirtualKeyCode: 36 });
  state.keyboardHome = await evaluate(client, `document.querySelector('[data-comparison-slider]').value`);
  await client.send("Input.dispatchKeyEvent", { type: "keyDown", key: "End", code: "End", nativeVirtualKeyCode: 35 });
  await client.send("Input.dispatchKeyEvent", { type: "keyUp", key: "End", code: "End", nativeVirtualKeyCode: 35 });
  state.keyboardEnd = await evaluate(client, `document.querySelector('[data-comparison-slider]').value`);

  const failures = [];
  if (state.missing) failures.push("comparison DOM is missing");
  if (state.atZero !== "0%" || state.atHundred !== "100%") failures.push("slider does not reach both endpoints");
  if (state.keyboardHome !== "0" || state.keyboardEnd !== "100") failures.push("range Home and End keys do not reach both endpoints");
  if (!state.handleInside) failures.push("visible handle escapes the stage at an endpoint");
  if (!state.transitioningAfterClick) failures.push("criterion transition lifecycle is missing");
  if (state.activeText !== "Wsparcie") failures.push("rapid criterion changes leave stale active state");
  if (state.nowawebTitle !== "Jedna osoba zna całość.") failures.push("NowaWeb copy is stale");
  if (state.wordpressTitle !== "Problem krąży między dostawcami.") failures.push("WordPress copy is stale");
  if (state.pageOverflows) failures.push("comparison causes horizontal page overflow");

  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 856,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await client.send("Page.reload", { ignoreCache: true });
  await delay(1200);
  const mobileGeometry = await evaluate(client, `(() => {
    const root = document.querySelector('[data-comparison-reveal]');
    const rect = root.getBoundingClientRect();
    const sliderRect = root.querySelector('[data-comparison-slider]').getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      viewport: document.documentElement.clientWidth,
      sliderHeight: sliderRect.height,
      sliderLeft: sliderRect.left,
      sliderRight: sliderRect.right,
      sliderY: sliderRect.top + sliderRect.height / 2,
    };
  })()`);
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: mobileGeometry.sliderLeft + 8, y: mobileGeometry.sliderY }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: mobileGeometry.sliderRight - 8, y: mobileGeometry.sliderY }],
  });
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await delay(120);
  const mobileReveal = await evaluate(client, `getComputedStyle(document.querySelector('[data-comparison-reveal]')).getPropertyValue('--comparison-reveal').trim()`);
  if (mobileGeometry.left < 0 || mobileGeometry.right > mobileGeometry.viewport) failures.push("comparison overflows mobile viewport");
  if (mobileGeometry.sliderHeight < 44) failures.push("mobile range target is too small");
  if (parseFloat(mobileReveal) < 90) failures.push("touch drag does not reach the far side");

  if (failures.length) throw new Error(failures.join("; "));
  console.log("Comparison reveal browser verification passed.");
  client.close();
} finally {
  chrome.kill();
}
```

- [ ] **Step 2: Run the verifier and confirm the transition lifecycle fails**

With the Astro dev server running at `127.0.0.1:4321`, run:

```powershell
node scripts/verify-comparison-reveal.mjs
```

Expected: FAIL with `criterion transition lifecycle is missing`.

- [ ] **Step 3: Add rapid-click-safe transition state**

In `ComparisonReveal.tsx`:

1. Add refs and state inside the component:

```tsx
const [displayedIndex, setDisplayedIndex] = useState(0);
const transitionTimer = useRef<number | null>(null);
const item = criteria[displayedIndex];
```

2. Add cleanup:

```tsx
useEffect(() => () => {
  if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
}, []);
```

3. Replace direct criterion state changes with:

```tsx
const selectCriterion = (index: number) => {
  if (index === activeIndex) return;
  setActiveIndex(index);
  rootRef.current?.setAttribute("data-comparison-transitioning", "");
  if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
  transitionTimer.current = window.setTimeout(() => {
    setDisplayedIndex(index);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        rootRef.current?.removeAttribute("data-comparison-transitioning");
      });
    });
  }, 190);
};
```

4. Change each button to `onClick={() => selectCriterion(index)}`.

5. Use `displayedIndex` for content and `activeIndex` for selected button and indicator state.

- [ ] **Step 4: Add restrained transition and drag feedback styles**

Append these rules next to the comparison styles:

```css
.comparison-layer-copy,
.comparison-layer > p {
  transition: opacity 340ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1), filter 340ms ease;
}

.comparison-reveal[data-comparison-transitioning] .comparison-layer-copy {
  opacity: 0;
  filter: blur(8px);
  transform: translateY(22px) scale(0.985);
}

.comparison-reveal[data-comparison-transitioning] .comparison-layer > p {
  opacity: 0;
  filter: blur(6px);
  transform: translateY(14px);
}

.comparison-handle {
  transition: left 50ms linear, transform 320ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 320ms ease;
}

.comparison-reveal:has(.comparison-slider:active) .comparison-handle {
  transform: translate(-50%, -50%) scale(1.09);
  box-shadow: 0 22px 54px rgba(6, 21, 50, 0.34);
}

@media (prefers-reduced-motion: reduce) {
  .comparison-reveal[data-comparison-transitioning] .comparison-layer-copy,
  .comparison-reveal[data-comparison-transitioning] .comparison-layer > p {
    opacity: 1;
    filter: none;
    transform: none;
  }
}
```

- [ ] **Step 5: Run the complete validation set**

Run:

```powershell
node scripts/validate-comparison-reveal.mjs
node scripts/verify-comparison-reveal.mjs
npm run build
```

Expected:

- static contract passes,
- `Comparison reveal browser verification passed.`,
- Astro build exits with code `0`.

- [ ] **Step 6: Commit verified interaction behavior**

```powershell
git add src/components/ComparisonReveal.tsx src/styles/global.css scripts/verify-comparison-reveal.mjs
git commit -m "feat: animate comparison criteria"
```

---

### Task 4: Visual QA and final motion adjustment

**Files:**
- Inspect: `src/styles/global.css`
- Inspect: `src/components/ComparisonReveal.tsx`

**Interfaces:**
- Consumes: completed component, static validator and browser verifier.
- Produces: visually approved desktop and mobile section with no regressions.

- [ ] **Step 1: Capture the integrated section at desktop and mobile sizes**

Run the site at `127.0.0.1:4321`, then capture:

```powershell
npx playwright screenshot --browser=chromium --viewport-size="1440,1000" http://127.0.0.1:4321/ output/playwright/comparison-desktop.png
npx playwright screenshot --browser=chromium --full-page --viewport-size="390,1200" http://127.0.0.1:4321/ output/playwright/comparison-mobile.png
```

Expected: both PNG files are created without browser errors.

- [ ] **Step 2: Inspect visual acceptance points**

Confirm all of the following in the screenshots and live page:

- the section reads as one cinematic object rather than a table,
- the `VS` handle is visually central at the initial position,
- orange appears only on `vs`, the handle and focus feedback,
- the WordPress steel layer has enough contrast without appearing disabled,
- both long security headlines wrap without clipping,
- the selector is usable at 390px and does not widen the page,
- the next process section begins with intentional spacing,
- no existing page section changed layout unexpectedly.

- [ ] **Step 3: Apply only measured polish changes**

If QA identifies a defect, change only the responsible token or selector. Allowed adjustments in this pass:

```css
/* Example bounded tuning values */
.comparison-stage { min-height: clamp(580px, 45vw, 680px); }
.comparison-layer h3 { font-size: clamp(3rem, 6.6vw, 7.4rem); }
.comparison-layer { padding-bottom: clamp(38px, 5.5vw, 72px); }
```

Do not add new decorative elements, dependencies or interaction modes during polish.

- [ ] **Step 4: Re-run verification after any visual adjustment**

Run:

```powershell
node scripts/validate-comparison-reveal.mjs
node scripts/verify-comparison-reveal.mjs
npm run build
```

Expected: all commands pass.

- [ ] **Step 5: Commit final polish only if files changed**

```powershell
git add src/components/ComparisonReveal.tsx src/styles/global.css
git commit -m "style: polish comparison reveal"
```

If QA requires no file changes, skip this commit.
