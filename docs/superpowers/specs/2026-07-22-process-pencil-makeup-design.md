# Pencil & Make-up Process Scene — Design Specification

## Goal

Replace the third process step's abstract Design Reactor with a tactile miniature design performance. A pencil constructs the page as a loose graphite sketch, then a stylized make-up pass applies color, typography, light, and final polish. The scene should feel bold and playful while remaining recognizably about professional web design.

## Creative Direction

The chosen direction combines an abstract design atelier with a few literal cosmetic gestures. The pencil, classic paint brush, compact palette, powder puff, and fine detail brush are recognizable, but they behave as interface-design tools rather than decorative stickers. The visual language stays compatible with NowaWeb's cream paper, deep navy, electric blue, and orange accent palette.

The memorable motion signature is a sequence of deliberate sketchbook jump-cuts. Each tool briefly disappears at a direction change and returns on the opposite side with its working tip leading the next stroke.

## Choreography

The complete sequence lasts approximately 4.5 seconds and restarts whenever the third card becomes active.

1. **Paper and first mark — 0–450 ms**
   - A lightly textured paper field is visible inside the scene.
   - A pencil enters on a curved path and makes a short graphite contact mark.

2. **Page sketch — 350–1,850 ms**
   - The pencil draws the browser outline, navigation line, hero block, CTA, and three lower cards in a readable order.
   - Lines reveal through SVG stroke animation so the drawing tip remains connected to the currently appearing stroke.
   - The pencil uses three distinct shots. Between shots it disappears for 60–80 ms inside a short graphite smudge, then reappears on the opposite side with its tip facing the next stroke.
   - The first shot moves left-to-right, the second returns right-to-left with a mirrored orientation, and the third enters from the left for the lower grid.
   - Loose construction marks, a small arrow, and restrained graphite dust sell the hand-drawn quality without obscuring the mockup.

3. **Palette and broad make-up pass — 1,700–3,150 ms**
   - A compact color palette briefly opens near the edge of the composition.
   - A classic flat paint brush replaces the make-up brush. It has an orange wooden handle, a metal ferrule, and squared bristles stained with blue and coral paint.
   - The paint brush performs two deliberate sweeps across the page.
   - The first sweep applies the blue browser chrome and structural color.
   - At the direction change it disappears for 60–80 ms inside a compact paint daub, then returns from the right with a 180-degree mirrored orientation.
   - The second right-to-left sweep reveals the pastel hero treatment, dark typography, orange accent, and card fills.
   - The finished interface is exposed with an irregular brush-shaped mask rather than a perfectly mechanical wipe.

4. **Powder and precision pass — 2,900–3,900 ms**
   - A small powder puff creates one contained `puf` cloud with a few particles.
   - A fine brush traces the CTA underline like eyeliner and adds the final orange detail.
   - A short eraser motion removes the remaining construction marks as the interface becomes fully crisp.

5. **Final state — 3,850–4,500 ms**
   - The tools leave the composition.
   - The completed page settles once with a restrained scale motion.
   - The existing green-dot status and `wdrożone` label appear last.

## Components

- `story-sketch-paper`: atmospheric paper and graphite texture.
- `story-sketch-svg`: browser and interface construction strokes.
- `story-sketch-pencil`: CSS-built pencil using three directional jump-cut shots.
- `story-pencil-smudge`: short graphite transition mark covering each pencil orientation cut.
- `story-makeup-palette`: compact palette with NowaWeb colors.
- `story-paint-brush`: classic flat paint brush responsible for both color sweeps.
- `story-paint-daub`: compact paint transition covering the brush direction cut.
- `story-makeup-mask`: irregular reveal edge over the finished interface.
- `story-powder-puff` and particles: one short finishing burst.
- `story-detail-brush`: final CTA and accent pass.
- Existing designed page shell and `story-code-check`: final result and status.

All new elements remain decorative inside the existing `aria-hidden="true"` design scene.

## Implementation Boundaries

- Keep `ProcessVisual`, the current card lifecycle, and active-scene CSS selector contract.
- Use inline decorative SVG, CSS gradients, transforms, opacity, clip paths, masks, and stroke-dash animation.
- Do not add raster assets, canvas, WebGL, animation dependencies, or new runtime state.
- Replace the reactor-specific markup and styles rather than layering the new sequence on top of them.
- Do not change the copy, layout, or animation of process steps one, two, and four.
- Keep the final `Strona, która ciekawi.` mockup and `wdrożone` status.
- Avoid filter-heavy continuous animation; particle count remains small and bounded.

## Responsive Behavior

- Desktop and compact desktop show the full choreography.
- Mobile preserves the same narrative, with shorter tool travel, fewer dust particles, and a simplified powder cloud.
- The scene must not introduce horizontal or vertical overflow in any supported process viewport.

## Motion Preference

As explicitly requested for this process step, the complete sketch-and-make-up sequence plays under both `no-preference` and `prefers-reduced-motion: reduce`. Other process scenes retain their existing motion-preference behavior.

## Verification

- Source validation must fail until the pencil, SVG drawing, make-up tools, brush reveal, and active-scene animation selectors replace the reactor contract.
- Browser verification samples at least four meaningful states: initial paper, active drawing, color application, and completed design.
- Runtime checks compare the pencil and paint-brush transforms on both sides of their cuts, confirming that their working ends reverse orientation rather than merely translating.
- Runtime checks confirm the sketch strokes progress, the final design reveal changes over time, tools leave the scene, `wdrożone` appears last, and the animation replays after leaving and returning to step three.
- The same runtime sequence is verified with reduced-motion emulation enabled.
- Mobile checks confirm the final interface is readable and neither axis overflows.
- `npm run validate:process`, `npm run verify:process`, and `npm run build` must pass.
