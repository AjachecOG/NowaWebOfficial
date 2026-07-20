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
for (const label of ["SzybkoĹ›Ä‡", "Koszty", "BezpieczeĹ„stwo", "WyglÄ…d", "Wsparcie"]) {
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
assert.match(component, /aria-label="PrzesuĹ„, aby porĂłwnaÄ‡/, "range needs a Polish label");
assert.match(component, /aria-selected=\{isActive\}/, "criteria need selected semantics");
assert.match(component, /aria-live="polite"/, "criterion copy needs a polite live region");
assert.match(component, /data-comparison-layer="nowaweb"/, "NowaWeb layer is missing");
assert.match(component, /data-comparison-layer="wordpress"/, "WordPress layer is missing");

console.log("Comparison reveal component contract is present.");
