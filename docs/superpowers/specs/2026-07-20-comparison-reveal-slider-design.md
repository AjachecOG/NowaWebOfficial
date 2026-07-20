# NowaWeb Comparison Reveal Slider Design

Date: 2026-07-20

## Goal

Replace the current three-column comparison table with a distinctive, interactive section that compares NowaWeb with a typical WordPress implementation. The new block must remain easy to understand while matching the site's premium, tactile and editorial character.

The accepted direction is an edge-to-edge reveal slider. Dragging the `VS` handle reveals the NowaWeb layer and covers the WordPress layer. A compact criterion selector changes the comparison message.

## Design read

This is a preserve-brand redesign of an agency landing page for Polish business owners. The visual language is premium, editorial and interactive, with an Awwwards-inspired presentation built from native layout and motion rather than a conventional data table.

Design dials:

- Design variance: 9/10
- Motion intensity for the first implementation: 6/10
- Target motion intensity after polish: 7/10
- Visual density: 4/10

## Scope

The work replaces only the existing comparison section in `src/pages/index.astro` and its related styles. Page order, navigation, section anchors, surrounding copy voice and other sections remain unchanged.

The existing comparison content remains grouped into five criteria:

- Szybkość
- Koszty
- Bezpieczeństwo
- Wygląd
- Wsparcie

The wording can be tightened for the new presentation, but the meaning and claims must remain consistent with the current page.

## Visual direction

### Section introduction

The existing `NowaWeb vs WordPress` headline remains above the interactive stage. It uses the current large display typography, with `vs` as the single orange emphasis. The supporting paragraph explains the strategic difference without repeating all five criteria.

### Color system

The section uses a cooler variation of the existing brand palette:

- NowaWeb layer: clean cobalt shifting subtly into deep blue
- WordPress layer: neutral steel blue-gray
- Page and controls: broken white consistent with the current paper background
- Main text: existing ink navy
- Interaction accent: orange used only for the `VS` handle and active feedback

The section remains part of the page's light theme. The colored comparison stage is an interactive object inside that theme, not a full theme inversion.

### Comparison stage

The comparison is a single large rounded stage rather than a table or grid of cards. Both layers occupy the same full area and share the same content geometry.

The WordPress layer sits underneath. The NowaWeb layer is clipped horizontally according to the slider position. This makes the comparison spatial and direct: one side is literally revealed while the other is covered.

Each layer contains:

- a small semantic label naming the side,
- one large criterion-specific statement,
- one short supporting sentence,
- a restrained oversized `NW` or `WP` typographic watermark.

There are no scores, progress bars, checkmark lists or table rows.

### Slider

The `VS` circle is the visible drag handle. A thin vertical divider follows the exact reveal boundary.

Required behavior:

- range covers the complete 0-100% reveal,
- either layer can be fully shown,
- the visible handle stays inside the stage at both edges,
- pointer drag, touch drag and keyboard input are supported,
- the native range input remains the accessible interaction surface,
- the control has a Polish accessible label.

The initial position is near the center so both layers are visible when the section enters the viewport.

### Criterion selector

A compact horizontal selector sits inside the top edge of the stage. It contains the five criteria and scrolls horizontally on narrow screens.

The active state uses a single moving dark indicator. Selecting another criterion changes both sides of the comparison together. Buttons retain correct pressed or selected semantics and visible keyboard focus.

## Interaction and motion

The first implementation prioritizes correct behavior, responsive geometry and accessible state. Motion polish follows after the component works in the real page.

Initial motion includes:

- direct reveal movement while dragging,
- subtle handle scale feedback during active drag,
- a smooth moving indicator between criterion buttons,
- short exit and entrance transitions for criterion copy using opacity, vertical translation and restrained blur.

Motion must animate only transform, opacity, filter and clip-path. It must not update React state on every pointer frame. Continuous slider movement writes a CSS custom property directly from the range input event.

When `prefers-reduced-motion: reduce` is active, criterion changes become immediate or near-immediate, blur is removed and dragging remains fully functional.

## Component architecture

Create one focused React island named `ComparisonReveal.tsx`, rendered by Astro with `client:visible`.

Responsibilities:

- own the comparison dataset,
- render both synchronized layers,
- manage the selected criterion,
- update the reveal CSS variable,
- expose accessible range and tab/button semantics,
- isolate all interaction and motion from the static Astro page.

The Astro page remains responsible for the section container, heading and supporting paragraph. The old `comparisonRows` array and table markup are removed once the new island owns the comparison data.

No new third-party dependency is required. The project already uses React islands, and the interaction can be implemented with React plus native browser APIs and CSS.

## Data flow

1. The component starts with `Szybkość` selected and the reveal near the center.
2. Moving the range control updates a CSS custom property representing reveal percentage.
3. CSS clips the NowaWeb layer using that property and positions the divider at the same boundary.
4. The visible handle position is clamped inside its own radius while the reveal boundary still reaches 0% and 100%.
5. Selecting a criterion updates the active index.
6. Both layer messages read from the same criterion object, preventing mismatched comparisons.

## Responsive behavior

### Desktop

- The stage is wide and cinematic, using `min-height: clamp(600px, 45vw, 680px)`.
- Criterion navigation stays on one line when space allows.
- Each layer uses an asymmetric text layout with the headline and supporting copy separated spatially.

### Tablet

- The layer layout becomes a single-column composition.
- Supporting copy moves below the main statement.
- The stage keeps enough height for the reveal to remain legible.

### Mobile

- The section becomes full-width within the site's standard 12px mobile gutter.
- The selector scrolls horizontally without wrapping.
- Headlines scale down and supporting copy remains visible.
- The handle remains at least 44px in both dimensions.
- Touch dragging must not block normal vertical scrolling outside the active horizontal gesture.
- Both complete 0% and 100% states remain reachable.

## Accessibility and failure handling

- Use a native `input[type="range"]` with min `0`, max `100` and a descriptive Polish label.
- Criterion controls must be reachable by keyboard and expose their selected state.
- Maintain WCAG AA contrast on both colored layers and controls.
- Provide visible `:focus-visible` treatment for the range control and criterion buttons.
- Server-rendered markup shows a useful static near-center comparison if JavaScript fails.
- Long or unexpected copy must wrap without escaping the stage.
- Reduced motion support is mandatory.

## Verification

Verify the implementation with:

- `npm run build`,
- desktop viewport at 1440px,
- tablet viewport near 900px,
- mobile viewport at 390px,
- pointer drag to 0%, 50% and 100%,
- touch emulation drag,
- keyboard range changes including Home and End,
- keyboard selection of every criterion,
- rapid criterion changes without stale or mismatched copy,
- reduced-motion emulation,
- contrast and focus-state review,
- no horizontal page overflow.

Motion timing and easing will receive a second visual pass after the working component is integrated into the page.

## Acceptance criteria

- The old visual table is gone.
- `VS` acts as the reveal handle.
- The reveal reaches full 0% and 100% states.
- NowaWeb is revealed while WordPress is covered, and vice versa.
- All five criteria update both layers correctly.
- The presentation reads as a premium interactive section, not a styled table.
- The color treatment uses cobalt, steel, broken white and restrained orange consistently.
- Desktop and mobile layouts remain readable and usable.
- Keyboard and reduced-motion behavior work.
- The production build passes.
