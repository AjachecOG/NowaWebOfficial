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

expect(
  page,
  'import HeroEyebrowTypewriter from "../components/HeroEyebrowTypewriter";',
  "hero eyebrow component is not imported",
);
expect(page, "<HeroEyebrowTypewriter client:load />", "hero eyebrow is not hydrated on load");
expect(page, 'class="hero-title"', "hero title sequence class is missing");
expect(page, 'class="hero-title-line"', "hero title lines are missing");
expect(page, 'class="hero-title-line-inner"', "hero title line inner masks are missing");
expect(
  component,
  'const FULL_TEXT = "NowaWeb - strony internetowe";',
  "full eyebrow copy is not fixed",
);
expect(component, "prefers-reduced-motion: reduce", "component has no reduced-motion fallback");
expect(component, "data-hero-eyebrow-text", "typed eyebrow target is missing");
expect(component, "hero-eyebrow-static", "static reduced-motion copy is missing");
expect(css, "@keyframes hero-title-line-in", "headline reveal keyframes are missing");
expect(css, "@keyframes hero-support-in", "lead/button support entrance is missing");
expect(
  css,
  ".hero-title-line:nth-child(1) .hero-title-line-inner {\n  animation-delay: 540ms;\n}",
  "first headline line does not have the delayed entrance",
);
expect(
  css,
  ".hero-title-line:nth-child(2) .hero-title-line-inner {\n  animation-delay: 720ms;\n}",
  "second headline line does not have the delayed entrance",
);
expect(
  css,
  ".hero-title-line:nth-child(3) .hero-title-line-inner {\n  animation-delay: 900ms;\n}",
  "third headline line does not have the delayed entrance",
);
expect(
  css,
  "1.14s forwards;",
  "supporting hero copy does not follow the delayed headline sequence",
);
expect(
  css,
  ".hero .action-row .button:nth-child(1) {\n  animation-delay: 1300ms;\n}",
  "primary CTA does not follow the delayed copy",
);
expect(
  css,
  ".hero .action-row .button:nth-child(2) {\n  animation-delay: 1420ms;\n}",
  "secondary CTA does not follow the delayed copy",
);
expect(css, "@media (prefers-reduced-motion: reduce)", "reduced-motion CSS is missing");
expect(page, "<span>Umów konsultację</span>", "primary CTA label wrapper is missing");
expect(page, "<span>Zobacz realizacje</span>", "secondary CTA label wrapper is missing");
expect(css, ".button.primary::before", "primary CTA shimmer is missing");
expect(css, ".button.secondary::before", "secondary CTA fill sweep is missing");
expect(css, ".button:focus-visible", "keyboard focus treatment is missing");
expect(css, ".button:active", "CTA press feedback is missing");
expect(css, ".button.primary:hover svg", "primary arrow motion is missing");
expect(css, ".button.secondary:hover svg", "secondary arrow motion is missing");
expect(
  css,
  ".hero-copy {\n  position: relative;\n  z-index: 3;\n  min-width: 0;",
  "hero grid item can still force mobile overflow",
);
expect(
  css,
  "font-size: clamp(2.2rem, 9.5vw, 3.2rem);",
  "mobile hero title is still too wide for controlled lines",
);

const lineCount = (page.match(/class="hero-title-line"/g) ?? []).length;
if (lineCount !== 3) failures.push(`expected 3 controlled headline lines, found ${lineCount}`);

if (failures.length) {
  throw new Error(failures.join("; "));
}

console.log("Hero intro motion structure is present.");
