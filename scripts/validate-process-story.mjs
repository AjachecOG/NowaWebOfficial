import fs from "node:fs";

const read = (path) => (fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "");
const component = read("src/components/ProcessIsland.tsx");
const styles = read("src/components/ProcessIsland.css");

const checks = [
  ["four process stages", (component.match(/id: "[1-4]"/g) ?? []).length === 4],
  ["plain numeric labels", !component.includes('id: "01"')],
  ["intersection observer activation", component.includes("IntersectionObserver")],
  ["observer cleanup", component.includes("observer.disconnect()")],
  ["accessible pressed state", component.includes("aria-pressed={isActive}")],
  ["keyboard focus activation", component.includes("onFocus={() => activateStep(index)}")],
  ["micro visual per stage", component.includes("ProcessVisual")],
  ["animated micro visuals", styles.includes("@keyframes process-brief-in")],
  ["shared timeline axis", styles.includes("--process-nav-pad")],
  ["no global scroll listener", !component.includes('addEventListener("scroll"')],
  ["desktop sticky scene", styles.includes("position: sticky")],
  ["mobile breakpoint", styles.includes("@media (max-width: 760px)")],
  ["mobile natural flow", styles.includes("position: static")],
  ["visible keyboard focus", styles.includes(":focus-visible")],
  ["comfortable touch target", styles.includes("min-height: 44px")],
  ["reduced motion fallback", styles.includes("prefers-reduced-motion: reduce")],
];

const failures = checks.filter(([, passed]) => !passed);

if (failures.length) {
  for (const [label] of failures) console.error(`FAIL: ${label}`);
  process.exit(1);
}

for (const [label] of checks) console.log(`PASS: ${label}`);
