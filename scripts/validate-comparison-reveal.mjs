import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const component = await readFile(
  new URL("../src/components/ComparisonReveal.tsx", import.meta.url),
  "utf8",
).catch(() => "");

assert.doesNotMatch(
  component,
  /[ÄÅĹĂ]/,
  "comparison copy contains mojibake instead of UTF-8 Polish characters",
);

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
assert.match(
  component,
  /data-comparison-verdict="nowaweb"/,
  "NowaWeb needs a positive edge verdict",
);
assert.match(
  component,
  /data-comparison-verdict="wordpress"/,
  "WordPress needs a cautionary edge verdict",
);
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
assert.doesNotMatch(
  component,
  /data-comparison-edge|numericValue\s*(?:<=|>=)/,
  "verdicts must be revealed by the slider mask instead of threshold state",
);
assert.equal(
  (component.match(/className="comparison-panel-copy"/g) ?? []).length,
  2,
  "each comparison side needs its own complete editorial copy block",
);
assert.match(
  component,
  /data-comparison-transitioning/,
  "criterion changes need a transition lifecycle",
);
assert.match(component, /window\.setTimeout/, "criterion transition needs a bounded timer");

const page = await readFile(new URL("../src/pages/index.astro", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/styles/global.css", import.meta.url), "utf8");

assert.match(page, /import ComparisonReveal/, "comparison island is not imported");
assert.match(page, /<ComparisonReveal client:visible\s*\/>/, "comparison island is not hydrated lazily");
assert.match(
  page,
  /class="comparison-title-line comparison-title-line--primary"/,
  "comparison heading needs a controlled primary line",
);
assert.match(
  page,
  /class="comparison-title-line comparison-title-line--secondary"/,
  "comparison heading needs a controlled secondary line",
);
assert.doesNotMatch(page, /const comparisonRows/, "legacy comparison data remains in Astro");
assert.doesNotMatch(page, /comparison-table|table-head|table-row/, "legacy table markup remains");
assert.match(styles, /\.comparison-reveal\s*\{/, "comparison root styles are missing");
assert.match(
  styles,
  /\.comparison-intro\s*\{[^}]*display:\s*block;/s,
  "comparison intro must use a compact vertical editorial flow",
);
assert.match(
  styles,
  /\.comparison-layer--nowaweb\s+\.comparison-panel-copy\s*\{/,
  "NowaWeb copy needs an independently positioned panel",
);
assert.match(
  styles,
  /\.comparison-layer--wordpress\s+\.comparison-panel-copy\s*\{/,
  "WordPress copy needs an independently positioned panel",
);
assert.match(
  styles,
  /\.comparison-layer--nowaweb\s+\.comparison-panel-copy\s+h3\s*\{/,
  "NowaWeb needs its own display typography",
);
assert.match(
  styles,
  /\.comparison-layer--wordpress\s+\.comparison-panel-copy\s+h3\s*\{/,
  "WordPress needs its own system typography",
);
assert.match(
  styles,
  /\.comparison-layer--wordpress\s*\{[^}]*#cfd5de/s,
  "WordPress layer needs its own cooler steel surface",
);
assert.match(
  styles,
  /\.comparison-layer--wordpress\s*\{[^}]*z-index:\s*1;/s,
  "WordPress content must stay below the clipped NowaWeb layer while it is covered",
);
assert.match(styles, /\.comparison-edge-verdict\s*\{/, "edge verdict styles are missing");
assert.match(
  styles,
  /\.comparison-edge-verdict\s*\{[^}]*opacity:\s*1;/s,
  "edge verdicts must stay painted so the layer clip can reveal them continuously",
);
assert.doesNotMatch(
  styles,
  /\[data-comparison-edge=/,
  "edge verdict visibility must not depend on a threshold selector",
);
assert.match(styles, /--comparison-reveal:\s*52%;/, "default reveal position is missing");
assert.match(styles, /clip-path:\s*inset\(0 calc\(100% - var\(--comparison-reveal\)\) 0 0\)/, "NowaWeb layer is not clipped by reveal");
assert.match(styles, /left:\s*clamp\(/, "visible handle must remain inside both edges");
assert.match(styles, /:has\(\.comparison-slider:focus-visible\) \.comparison-handle/, "visible range focus treatment is missing");
assert.match(styles, /touch-action:\s*pan-y;/, "slider must preserve vertical touch scrolling");
assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.comparison-reveal/, "comparison reduced-motion override is missing");
assert.match(
  styles,
  /\[data-comparison-transitioning\]/,
  "criterion copy transition styles are missing",
);
assert.match(
  styles,
  /\[data-comparison-transitioning\]\s+\.comparison-panel-copy,\s*\.comparison-reveal\[data-comparison-transitioning\]\s+\.comparison-edge-verdict/,
  "criterion transitions must update panel copy and edge verdicts together",
);
assert.match(
  styles,
  /:has\(\.comparison-slider:active\) \.comparison-handle/,
  "active drag feedback is missing",
);

console.log("Comparison reveal component contract is present.");
