# Process Design Reactor — Design Specification

<design_plan>
seed = len("zróbmy wariant 1") = 16
motion = random.choice(["impact wave", "layer stitch"]) -> "impact wave"
components = random.sample(["strategy token", "reactor ring", "design reveal", "status trail"], 3) -> ["strategy token", "reactor ring", "status trail"]

This change preserves the existing page-wide AIDA structure, navigation, hero typography, bento density, labels, and button contrast. The user selected a specific motion direction, so page-level layout and typography randomization are intentionally out of scope.
</design_plan>

## Goal

Replace the current generic wireframe-to-design animation in the third process step with a connected “Design Reactor” story. The selected strategy becomes a physical token, triggers the transformation from wireframe to finished design, and resolves into the existing “wdrożone” status without borrowing the publication moment from step four.

## Choreography

1. The wireframe is visible immediately when the design card becomes active.
2. A compact orange strategy token labeled `kierunek` enters from the upper-left edge and arcs toward the center of the browser mockup.
3. On impact, concentric reactor rings and a short flash expand from the contact point.
4. A left-to-right reveal wave exposes the finished design while retaining a readable wireframe edge during the transformation.
5. The token collapses into a bright trail that travels toward the lower-right status area.
6. The trail resolves into a green check dot and the existing `wdrożone` label. The final browser performs one restrained settle motion.

## Implementation Boundaries

- Keep `ProcessVisual` and the existing CSS-driven scene lifecycle.
- Add only semantic decorative spans inside the design scene; all remain under `aria-hidden="true"`.
- Use transforms, opacity, clip-path, and gradients; do not add images, canvas, WebGL, or dependencies.
- Do not change steps one, two, or four.
- Do not change copy outside the visual. The visible final status remains `wdrożone`.

## Motion Timing

- Token entry: 0–900 ms.
- Impact and rings: 760–1500 ms.
- Design reveal: 980–2300 ms.
- Trail to status: 2050–3100 ms.
- Status and settle: 2950–3700 ms.

All motion restarts when the third card re-enters the active state, using the current `data-story-visible="true" .process-story__card.is-active` contract.

## Responsive and Motion Preference

- Desktop and compact desktop use the full sequence.
- Mobile keeps the same narrative with smaller travel distances and no perspective tilt.
- The full Design Reactor sequence plays for both `no-preference` and `prefers-reduced-motion: reduce`, as explicitly requested. Other process scenes keep their existing motion-preference behavior.

## Verification

- Source validation asserts the reactor elements, active-scene selectors, reveal keyframes, and reduced-motion final state.
- Runtime verification confirms the active design scene starts as a wireframe, progresses through impact/reveal, and ends fully designed with the status visible under both motion preferences. It also confirms no horizontal overflow on mobile.
- `npm run build` must complete successfully.
