# Dynamic Comparison Verdicts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make both edge verdicts change with every comparison criterion while preserving continuous slider-mask reveal.

**Architecture:** Extend the existing `Criterion` data object with four verdict fields and render both edge cards from the already synchronized `item = criteria[displayedIndex]`. Reuse the current criterion transition lifecycle for copy changes, while keeping all slider-position behavior driven only by `--comparison-reveal` and `clip-path`.

**Tech Stack:** Astro, React, TypeScript, CSS, Node assertion scripts, Chromium DevTools Protocol verification.

## Global Constraints

- Copy must use the exact Polish wording approved in `docs/superpowers/specs/2026-07-20-comparison-dynamic-verdicts-design.md`.
- The slider position must not reset when criteria change.
- Slider movement must not toggle an edge state or change verdict opacity.
- Existing icons, layout, proportions and `aria-hidden` treatment remain unchanged.
- No new runtime dependencies.

---

### Task 1: Criterion-owned verdict content

**Files:**
- Modify: `scripts/validate-comparison-reveal.mjs:43-75`
- Modify: `scripts/verify-comparison-reveal.mjs:150-245`
- Modify: `src/components/ComparisonReveal.tsx:4-175`

**Interfaces:**
- Consumes: existing `displayedIndex: number` and `item = criteria[displayedIndex]`.
- Produces: `Criterion.nowawebVerdictTitle`, `Criterion.nowawebVerdictDetail`, `Criterion.wordpressVerdictTitle`, and `Criterion.wordpressVerdictDetail`, all typed as `string`.

- [ ] **Step 1: Add failing contract assertions**

Append these checks after the existing verdict hook assertions in `scripts/validate-comparison-reveal.mjs`:

```js
for (const field of [
  "nowawebVerdictTitle",
  "nowawebVerdictDetail",
  "wordpressVerdictTitle",
  "wordpressVerdictDetail",
]) {
  assert.equal(
    (component.match(new RegExp(`${field}:\\s*"`, "g")) ?? []).length,
    5,
    `${field} must be defined for every comparison criterion`,
  );
  assert.match(
    component,
    new RegExp(`\\{item\\.${field}\\}`),
    `${field} must be rendered from the displayed criterion`,
  );
}
```

- [ ] **Step 2: Add failing browser expectations for every tab**

Inside the desktop `evaluate` callback in `scripts/verify-comparison-reveal.mjs`, add the exact expectation table and collect the rendered verdict titles after each criterion settles:

```js
const expectedVerdicts = [
  ["Szybkość", "Szybkość, która sprzedaje.", "Klient nie będzie czekał."],
  ["Koszty", "Płacisz za efekt, nie poprawki.", "Tani start. Drogie utrzymanie."],
  ["Bezpieczeństwo", "Mniej luk. Więcej spokoju.", "Każdy dodatek to kolejne ryzyko."],
  ["Wygląd", "Marka, której nie da się pomylić.", "Szablon nie buduje przewagi."],
  ["Wsparcie", "Jedna odpowiedzialność. Szybka decyzja.", "Problem krąży. Rachunek zostaje."],
];
const renderedVerdicts = [];

for (let index = 0; index < buttons.length; index += 1) {
  buttons[index].click();
  await new Promise((resolve) => setTimeout(resolve, 560));
  renderedVerdicts.push([
    root.querySelector('[aria-selected="true"]')?.textContent?.trim(),
    root.querySelector('[data-comparison-verdict="nowaweb"] strong')?.textContent?.trim(),
    root.querySelector('[data-comparison-verdict="wordpress"] strong')?.textContent?.trim(),
  ]);
}

if (JSON.stringify(renderedVerdicts) !== JSON.stringify(expectedVerdicts)) {
  failures.push('edge verdicts do not follow all five criteria');
}
```

Return `renderedVerdicts` in the desktop result so a failure report exposes the mismatched copy.

- [ ] **Step 3: Run both tests and verify the feature is absent**

Run:

```powershell
node scripts/validate-comparison-reveal.mjs
node scripts/verify-comparison-reveal.mjs
```

Expected: the contract test fails because `nowawebVerdictTitle` is not defined; the browser test fails because all tabs still render the same two verdict titles.

- [ ] **Step 4: Extend the criterion type**

Add these fields to `type Criterion` in `src/components/ComparisonReveal.tsx`:

```ts
nowawebVerdictTitle: string;
nowawebVerdictDetail: string;
wordpressVerdictTitle: string;
wordpressVerdictDetail: string;
```

- [ ] **Step 5: Add the approved verdict copy to all five criteria**

Add the following properties to the matching criterion objects:

```ts
// Szybkość
nowawebVerdictTitle: "Szybkość, która sprzedaje.",
nowawebVerdictDetail: "Lekki kod pomaga zamienić uwagę w kontakt, zanim klient zdąży odejść.",
wordpressVerdictTitle: "Klient nie będzie czekał.",
wordpressVerdictDetail: "Motyw, skrypty i dodatki potrafią spowolnić nawet prostą stronę.",

// Koszty
nowawebVerdictTitle: "Płacisz za efekt, nie poprawki.",
nowawebVerdictDetail: "Jasny zakres i brak stosu płatnych dodatków ułatwiają kontrolę budżetu.",
wordpressVerdictTitle: "Tani start. Drogie utrzymanie.",
wordpressVerdictDetail: "Licencje, aktualizacje i kolejne poprawki regularnie wracają do budżetu.",

// Bezpieczeństwo
nowawebVerdictTitle: "Mniej luk. Więcej spokoju.",
nowawebVerdictDetail: "Prostsza architektura ogranicza powierzchnię ataku i liczbę pilnych aktualizacji.",
wordpressVerdictTitle: "Każdy dodatek to kolejne ryzyko.",
wordpressVerdictDetail: "Motyw i wtyczki tworzą następne elementy, które trzeba stale kontrolować.",

// Wygląd
nowawebVerdictTitle: "Marka, której nie da się pomylić.",
nowawebVerdictDetail: "Projekt powstaje dla Twojej firmy, więc nie wygląda jak kolejny gotowiec.",
wordpressVerdictTitle: "Szablon nie buduje przewagi.",
wordpressVerdictDetail: "Gotowy motyw zamyka Twoją markę w tych samych ramach co tysiące firm.",

// Wsparcie
nowawebVerdictTitle: "Jedna odpowiedzialność. Szybka decyzja.",
nowawebVerdictDetail: "Rozmawiasz bezpośrednio z osobą, która zna projekt od pierwszej decyzji.",
wordpressVerdictTitle: "Problem krąży. Rachunek zostaje.",
wordpressVerdictDetail: "Hosting, motyw i wtyczki mogą odsyłać odpowiedzialność między dostawcami.",
```

- [ ] **Step 6: Render verdicts from the displayed criterion**

Replace the four hard-coded verdict nodes with:

```tsx
<strong>{item.wordpressVerdictTitle}</strong>
<p>{item.wordpressVerdictDetail}</p>
```

and:

```tsx
<strong>{item.nowawebVerdictTitle}</strong>
<p>{item.nowawebVerdictDetail}</p>
```

- [ ] **Step 7: Run the contract and browser tests**

Run:

```powershell
node scripts/validate-comparison-reveal.mjs
node scripts/verify-comparison-reveal.mjs
```

Expected: both commands exit `0`; the browser report contains all five expected title triplets and no failures.

- [ ] **Step 8: Commit the dynamic content change**

```powershell
git add scripts/validate-comparison-reveal.mjs scripts/verify-comparison-reveal.mjs src/components/ComparisonReveal.tsx
git commit -m "feat: sync comparison verdicts with criteria"
```

### Task 2: Criterion-only verdict transition

**Files:**
- Modify: `scripts/validate-comparison-reveal.mjs:138-150`
- Modify: `src/styles/global.css:2658-2663`

**Interfaces:**
- Consumes: existing root attribute `data-comparison-transitioning` set only by `selectCriterion`.
- Produces: one CSS transition state shared by `.comparison-panel-copy` and `.comparison-edge-verdict`; no slider-position state is added.

- [ ] **Step 1: Add a failing transition contract**

Add this assertion to `scripts/validate-comparison-reveal.mjs`:

```js
assert.match(
  styles,
  /\[data-comparison-transitioning\]\s+\.comparison-panel-copy,\s*\.comparison-reveal\[data-comparison-transitioning\]\s+\.comparison-edge-verdict/,
  "criterion transitions must update panel copy and edge verdicts together",
);
```

- [ ] **Step 2: Run the contract test and verify it fails**

Run: `node scripts/validate-comparison-reveal.mjs`

Expected: FAIL with `criterion transitions must update panel copy and edge verdicts together`.

- [ ] **Step 3: Share the transition lifecycle without changing slider reveal behavior**

Replace the current selector in `src/styles/global.css` with:

```css
.comparison-reveal[data-comparison-transitioning] .comparison-panel-copy,
.comparison-reveal[data-comparison-transitioning] .comparison-edge-verdict {
  opacity: 0;
  filter: blur(8px);
  transform: translateY(22px) scale(0.985);
}
```

Add criterion-change transitions to `.comparison-edge-verdict` while keeping its resting opacity at `1`:

```css
transition:
  opacity 340ms cubic-bezier(0.22, 1, 0.36, 1),
  transform 520ms cubic-bezier(0.22, 1, 0.36, 1),
  filter 340ms ease;
```

This transition is activated only by tab selection; moving the slider continues to update only `--comparison-reveal`.

- [ ] **Step 4: Run both comparison tests**

Run:

```powershell
node scripts/validate-comparison-reveal.mjs
node scripts/verify-comparison-reveal.mjs
```

Expected: both commands exit `0`; stable slider states report `nowaOpacity: 1`, `wordpressOpacity: 1`, and `edge: null`.

- [ ] **Step 5: Commit the transition change**

```powershell
git add scripts/validate-comparison-reveal.mjs src/styles/global.css
git commit -m "style: transition comparison verdict copy"
```

### Task 3: Final responsive and build verification

**Files:**
- Verify: `src/components/ComparisonReveal.tsx`
- Verify: `src/styles/global.css`
- Verify: `scripts/validate-comparison-reveal.mjs`
- Verify: `scripts/verify-comparison-reveal.mjs`

**Interfaces:**
- Consumes: completed dynamic verdict fields and criterion transition behavior.
- Produces: fresh verification evidence for desktop, mobile, and the production Astro build.

- [ ] **Step 1: Run the complete comparison contract**

Run: `node scripts/validate-comparison-reveal.mjs`

Expected: `Comparison reveal component contract is present.`

- [ ] **Step 2: Run real-browser verification**

Run: `node scripts/verify-comparison-reveal.mjs`

Expected: desktop and mobile `failures` arrays are empty; all five criterion verdicts match; `Comparison reveal browser verification passed.` is printed.

- [ ] **Step 3: Build the production site**

Run: `npm run build`

Expected: Astro reports `1 page(s) built` and exits `0`.

- [ ] **Step 4: Check patch integrity**

Run: `git diff --check`

Expected: exit `0` with no whitespace errors. Existing line-ending warnings may be reported by Git and do not indicate a patch error.

- [ ] **Step 5: Inspect the generated comparison screenshots**

Open these files and confirm that long headlines fit without colliding with the handle or criteria navigation:

```text
output/playwright/comparison-wordpress-edge-desktop.png
output/playwright/comparison-nowaweb-edge-desktop.png
output/playwright/comparison-wordpress-edge-mobile.png
output/playwright/comparison-nowaweb-edge-mobile.png
```

Expected: both edge verdicts remain inside the stage at desktop and mobile sizes, and partially revealed text is clipped exactly at the slider boundary.
