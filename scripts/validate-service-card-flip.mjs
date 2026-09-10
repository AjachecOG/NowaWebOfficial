import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../src/pages/index.astro", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/styles/global.css", import.meta.url), "utf8");
const controller = await readFile(
  new URL("../src/components/ServiceCardMotion.astro", import.meta.url),
  "utf8",
).catch(() => "");

assert.match(page, /import ServiceCardMotion/, "service flip controller is not imported");
assert.match(page, /<ServiceCardMotion\s*\/>/, "service flip controller is missing");
assert.equal(
  (page.match(/benefit:\s*"/g) ?? []).length,
  6,
  "each service needs concise back-face benefit copy",
);
assert.equal(
  (page.match(/points:\s*\[/g) ?? []).length,
  6,
  "each service needs three back-face points",
);
assert.match(page, /data-service-card/, "service card interaction root is missing");
assert.match(page, /data-service-card-trigger/, "service card front trigger is missing");
assert.match(page, /class="service-card-stage"/, "proximity stage is missing");
assert.match(page, /class="service-card-flipper"/, "3D flipper is missing");
assert.match(page, /service-card-face service-card-front/, "front face is missing");
assert.match(page, /service-card-face service-card-back/, "back face is missing");
assert.match(
  page,
  /const serviceNumber = String\(index \+ 1\)\.padStart\(2, "0"\);/,
  "each back face needs a stable two-digit service number",
);
assert.match(page, /class="service-card-back-meta"/, "back face metadata row is missing");
assert.match(page, /class="service-card-back-index"/, "back face service number is missing");
assert.match(page, /class="service-card-back-label"/, "back face scope label is missing");
assert.match(page, /Zakres usługi/, "back face needs the approved scope label");
assert.match(page, /class="service-card-back-copy"/, "back face intro grouping is missing");
assert.match(page, /aria-expanded="false"/, "front trigger must expose its state");
assert.match(page, /aria-controls=\{backId\}/, "front trigger must control its back face");
assert.match(page, /href="#kontakt"/, "back face CTA should lead to contact");

assert.match(controller, /requestAnimationFrame/, "proximity updates must be frame-throttled");
assert.match(
  controller,
  /\(hover:\s*hover\) and \(pointer:\s*fine\)/,
  "proximity and pointer hover must be limited to a fine hover-capable pointer",
);
assert.match(
  styles,
  /prefers-reduced-motion:\s*reduce/,
  "service styles must retain the reduced-motion treatment",
);
assert.match(controller, /pointerenter/, "fine-pointer hover must reveal a card");
assert.match(controller, /pointerleave/, "pointer leave must restore the front");
assert.match(controller, /event\.key === "Escape"/, "Escape must close a revealed card");
assert.match(controller, /aria-expanded/, "controller must synchronize disclosure state");
assert.match(controller, /aria-hidden/, "controller must synchronize face visibility");
assert.match(
  controller,
  /const openCard = \(card: HTMLElement\) => \{[\s\S]*?closeOtherCards\(card\);[\s\S]*?setCardOpen\(card, true\);/,
  "openCard must reveal the selected service",
);
assert.match(
  controller,
  /let openBeforePointerDown = false;[\s\S]*?setCardOpen\(card, false\);/,
  "service cards must initialize on their front face",
);

assert.match(
  styles,
  /\.service-card-stage\s*\{[\s\S]*?perspective:\s*1100px;[\s\S]*?transition:\s*transform 240ms cubic-bezier\(0\.22, 1, 0\.36, 1\);/,
  "service card stage needs a restrained perspective and smooth proximity response",
);
assert.match(
  styles,
  /\.service-card-flipper\s*\{[\s\S]*?transform-style:\s*preserve-3d;[\s\S]*?transition:\s*transform 440ms cubic-bezier\(0\.22, 1, 0\.36, 1\);/,
  "service flip should use the approved smooth 440ms easing",
);
assert.match(
  styles,
  /\.service-card-face\s*\{[\s\S]*?backface-visibility:\s*hidden;/,
  "both card faces must hide their reverse side",
);
assert.match(
  styles,
  /\.service-card-back\s*\{[\s\S]*?transform:\s*rotateY\(180deg\);/,
  "back face must start reversed",
);

const backRule = styles.match(/\.service-card-back\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
assert.match(backRule, /linear-gradient/, "back face needs a restrained paper grid");
assert.match(backRule, /var\(--paper-clean\)/, "back face must retain the existing paper color");
assert.match(backRule, /color:\s*var\(--ink\);/, "back face needs dark ink text");
assert.match(
  styles,
  /\.service-card-back-meta\s*\{[\s\S]*?display:\s*flex;[\s\S]*?border-bottom:/,
  "metadata needs a compact divided header",
);
assert.match(
  styles,
  /\.service-card-back-index\s*\{[\s\S]*?color:\s*var\(--blue\);/,
  "service number needs the existing blue accent",
);
assert.match(
  styles,
  /\.service-card-back-label\s*\{[\s\S]*?text-transform:\s*uppercase;/,
  "scope label needs an editorial uppercase treatment",
);
const backLinkRule = styles.match(/\.service-card-back-actions a\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
const backActionControlsRule =
  styles.match(
    /\.service-card-back-actions a,\s*\n\.service-card-back-actions button\s*\{([\s\S]*?)\n\}/,
  )?.[1] ?? "";
const backHeadingRule = styles.match(/\.service-card-back h3\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
const backParagraphRule = styles.match(/\.service-card-back p\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
const backListItemRule = styles.match(/\.service-card-back li\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
const backActionsRule = styles.match(/\.service-card-back-actions\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
assert.match(backHeadingRule, /text-align:\s*left;/, "service title should use a professional left alignment");
assert.match(backParagraphRule, /font-weight:\s*500;/, "description should retain a lighter hierarchy");
assert.match(backListItemRule, /border-top:/, "scope points should read as divided rows");
assert.match(backActionsRule, /margin-top:\s*auto;/, "minimal actions should stay aligned to the card baseline");
assert.match(backActionsRule, /border-top:/, "actions need a clearly separated footer");
assert.match(backLinkRule, /color:\s*var\(--blue\);/, "primary CTA needs the existing blue accent");
assert.match(
  backActionControlsRule,
  /font-family:\s*var\(--body\);/,
  "back-face CTAs must use the site's body typeface",
);
assert.match(
  styles,
  /\.service-card-back h3\s*\{[\s\S]*?color:\s*var\(--ink\);/,
  "back-face headings need explicit dark-ink contrast",
);
assert.match(
  styles,
  /\.service-card-back-actions button\s*\{[\s\S]*?color:\s*rgba\(6, 21, 50, 0\.62\);/,
  "return action needs restrained dark-ink contrast",
);
assert.match(
  styles,
  /\.service-card--flipped \.service-card-flipper\s*\{[\s\S]*?transform:\s*rotateY\(180deg\);/,
  "flipped state must reveal the back face",
);
assert.match(
  styles,
  /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.service-card-flipper[\s\S]*?transition-duration:\s*120ms;/,
  "reduced motion should replace rotation with a short transition",
);
assert.match(
  styles,
  /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.service-card--flipped \.service-card-flipper\s*\{[\s\S]*?transform:\s*none;/,
  "reduced motion must override the more specific flipped rotation",
);

console.log("Service card flip structure is present.");
