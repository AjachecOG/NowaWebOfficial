# Kinetic Process Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four-card process grid with an accessible scroll-driven story that layers four animated process cards on desktop and becomes a natural vertical timeline on mobile.

**Architecture:** Keep the feature inside the existing React island. `ProcessIsland.tsx` owns active-step state and a requestAnimationFrame-throttled scroll calculation; a new co-located stylesheet owns the scene, card micro-visuals, responsive fallback, and reduced-motion behavior. A source validator guards the structural, accessibility, and motion contracts before the production build and browser QA.

**Tech Stack:** Astro, React, TypeScript, native browser scroll APIs, CSS sticky positioning, CSS transitions and keyframes, lucide-react, Node.js validation script.

## Global Constraints

- Change only the process island and directly related styles/tests.
- Do not add a new animation dependency.
- Preserve all four existing titles and descriptions.
- Desktop uses a sticky layered scene; mobile 390 px uses a natural vertical flow without overlap.
- `prefers-reduced-motion: reduce` removes sticky storytelling, tilt, and intensive transitions.
- Buttons retain `aria-pressed`, keyboard focus, and a minimum comfortable touch target.
- Do not modify the already-dirty `src/styles/global.css`; place all new styles in a co-located stylesheet.

---

### Task 1: Add the process-story validation contract

**Files:**
- Create: `scripts/validate-process-story.mjs`
- Modify: `package.json`
- Test: `scripts/validate-process-story.mjs`

**Interfaces:**
- Consumes: source text from `src/components/ProcessIsland.tsx` and `src/components/ProcessIsland.css`.
- Produces: npm script `validate:process` that exits with status 0 only when the required structure, accessibility, scroll behavior, mobile fallback, and reduced-motion fallback exist.

- [ ] **Step 1: Write the failing validator**

```js
import fs from "node:fs";

const component = fs.readFileSync("src/components/ProcessIsland.tsx", "utf8");
const styles = fs.readFileSync("src/components/ProcessIsland.css", "utf8");

const checks = [
  ["four process stages", (component.match(/id: "0[1-4]"/g) ?? []).length === 4],
  ["scroll progress state", component.includes("setProgress")],
  ["requestAnimationFrame throttling", component.includes("requestAnimationFrame")],
  ["accessible pressed state", component.includes("aria-pressed={isActive}")],
  ["keyboard focus activation", component.includes("onFocus={() => setManualActive(index)}")],
  ["micro visual per stage", component.includes("ProcessVisual")],
  ["desktop sticky scene", styles.includes("position: sticky")],
  ["mobile natural flow", styles.includes(".process-story__card-stack") && styles.includes("position: static")],
  ["reduced motion fallback", styles.includes("prefers-reduced-motion: reduce")],
];

const failures = checks.filter(([, passed]) => !passed);
if (failures.length) {
  for (const [label] of failures) console.error(`FAIL: ${label}`);
  process.exit(1);
}

for (const [label] of checks) console.log(`PASS: ${label}`);
```

- [ ] **Step 2: Register and run the validator to verify it fails**

Add this script to `package.json`:

```json
"validate:process": "node scripts/validate-process-story.mjs"
```

Run: `npm run validate:process`

Expected: exit code 1 with missing `ProcessIsland.css`, scroll progress, and micro-visual contracts.

- [ ] **Step 3: Commit the failing contract**

```powershell
git add -- scripts/validate-process-story.mjs package.json
git commit -m "test: define kinetic process story contract"
```

---

### Task 2: Build the scroll-driven React story

**Files:**
- Modify: `src/components/ProcessIsland.tsx`
- Create: `src/components/ProcessIsland.css`
- Test: `scripts/validate-process-story.mjs`

**Interfaces:**
- Consumes: the unchanged four-step content and lucide-react icons.
- Produces: `ProcessIsland(): JSX.Element`, internal `ProcessVisual({ index }: { index: number }): JSX.Element`, CSS variables `--process-progress`, `--step-progress`, `--stack-index`, and `--pointer-x`.

- [ ] **Step 1: Import the stylesheet and add scroll state**

Use `useEffect`, `useRef`, and `useState`. Add a root ref and compute normalized progress while the story crosses the viewport:

```tsx
const storyRef = useRef<HTMLDivElement>(null);
const [active, setActive] = useState(0);
const [manualActive, setManualActive] = useState<number | null>(null);
const [progress, setProgress] = useState(0);

useEffect(() => {
  const node = storyRef.current;
  if (!node) return;
  let frame = 0;
  const update = () => {
    frame = 0;
    const rect = node.getBoundingClientRect();
    const travel = Math.max(1, rect.height - window.innerHeight);
    const next = Math.min(1, Math.max(0, -rect.top / travel));
    setProgress(next);
    if (manualActive === null) setActive(Math.min(3, Math.floor(next * 4)));
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    if (frame) cancelAnimationFrame(frame);
  };
}, [manualActive]);
```

- [ ] **Step 2: Add the four isolated micro-visuals**

Implement `ProcessVisual` as a switch that returns semantic-free decorative markup with stable classes:

```tsx
function ProcessVisual({ index }: { index: number }) {
  if (index === 0) return <div className="process-visual process-visual--brief"><i /><i /><i /><b /><b /></div>;
  if (index === 1) return <div className="process-visual process-visual--wireframe"><i /><i /><i /><i /></div>;
  if (index === 2) return <div className="process-visual process-visual--design"><i /><i /><i /><b /></div>;
  return <div className="process-visual process-visual--launch"><i /><span>LIVE</span><b /><b /><b /></div>;
}
```

Wrap each visual with `aria-hidden="true"` in the card.

- [ ] **Step 3: Replace the grid markup with timeline and layered cards**

The root must expose progress and active stage through classes, data attributes, and CSS variables. Each timeline control and card button calls `setManualActive(index)`, `setActive(index)`, and retains `aria-pressed={isActive}`. Add `onFocus={() => setManualActive(index)}` and clear the manual override when the pointer leaves the story.

Required structure:

```tsx
<div ref={storyRef} className="process-story" data-active={active} style={{ "--process-progress": progress } as React.CSSProperties}>
  <div className="process-story__sticky">
    <div className="process-story__ambient" aria-hidden="true" />
    <nav className="process-story__timeline" aria-label="Etapy współpracy">…</nav>
    <div className="process-story__card-stack">…</div>
  </div>
</div>
```

- [ ] **Step 4: Implement pointer tilt without React rerenders**

On each card's pointer move, set `--pointer-x` and `--pointer-y` directly on `event.currentTarget.style`; on pointer leave, remove both properties. Do not store pointer coordinates in state.

- [ ] **Step 5: Run the contract validator**

Run: `npm run validate:process`

Expected: all checks print `PASS` and the command exits 0.

- [ ] **Step 6: Commit the React structure**

```powershell
git add -- src/components/ProcessIsland.tsx src/components/ProcessIsland.css
git commit -m "feat: build kinetic process story"
```

---

### Task 3: Finish responsive visual design and verify production behavior

**Files:**
- Modify: `src/components/ProcessIsland.css`
- Modify: `scripts/validate-process-story.mjs`
- Test: `scripts/validate-process-story.mjs`
- Test: production Astro build
- Test: browser screenshots at 1440x1000 and 390x1200

**Interfaces:**
- Consumes: the markup, CSS variables, and active-state attributes produced by Task 2.
- Produces: final desktop sticky stack, tablet simplification, mobile timeline, focus styles, and reduced-motion rendering.

- [ ] **Step 1: Implement the desktop scene**

Add a tall `.process-story`, a viewport-bound `.process-story__sticky`, a left timeline, and an absolute card stack. Use the active data attribute to animate card opacity, translate, scale, rotation, z-index, border, and shadow. The active card remains fully readable; earlier cards keep a visible top edge; future cards sit lower and softer.

- [ ] **Step 2: Animate the visual language**

Use CSS-only staggered transitions for conversation lines, wireframe blocks, design cursor/swatches, and launch status. Animate only `transform`, `opacity`, background-position, and box-shadow. The ambient grid and glow remain pointer-events none.

- [ ] **Step 3: Add tablet, mobile, focus, and reduced-motion contracts**

At `max-width: 760px`, set the story height to auto, sticky wrapper and card stack to `position: static`, switch to one-column natural flow, remove card transforms, and show every card at full opacity. Add `:focus-visible` outlines. In `@media (prefers-reduced-motion: reduce)`, disable smooth transitions, keyframes, sticky positioning, and card overlap.

- [ ] **Step 4: Strengthen the validator**

Add assertions for `@media (max-width: 760px)`, `:focus-visible`, `min-height: 44px`, and absence of GSAP/package changes. Run:

```powershell
npm run validate:process
```

Expected: all checks print `PASS`.

- [ ] **Step 5: Run the production build**

Run: `npm run build`

Expected: Astro completes with exit code 0 and emits the static site to `dist`.

- [ ] **Step 6: Verify in a real browser**

Start `npm run dev`, navigate to `http://127.0.0.1:4321/#proces`, scroll through the full section, and capture:

```powershell
npx playwright screenshot --browser=chromium --viewport-size="1440,1000" http://127.0.0.1:4321/#proces output/playwright/nowaweb-process-kinetic.png
npx playwright screenshot --browser=chromium --full-page --viewport-size="390,1200" http://127.0.0.1:4321 output/playwright/nowaweb-process-kinetic-mobile.png
```

Expected: no horizontal scrollbar, no clipped text, desktop active cards layer cleanly, mobile cards follow document flow, and the browser console has no runtime error.

- [ ] **Step 7: Commit the completed visual behavior**

```powershell
git add -- src/components/ProcessIsland.css scripts/validate-process-story.mjs
git commit -m "feat: polish kinetic process motion"
```

