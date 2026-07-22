# Process hydration and clean portfolio carousel

## Goal

Restore every animation in the Process section and simplify the Portfolio carousel to a clean, image-only coverflow controlled primarily by clicking the adjacent screenshots.

## Confirmed root cause

The Process React island remains server-rendered and never hydrates. Its late-loaded GSAP dependencies return HTTP 504 from Vite's stale optimized-dependency cache. As a result, `data-motion` and `data-story-visible` are never assigned, the active stage remains `0`, and all scene animations stay inactive.

## Process section fix

- Pre-bundle `@gsap/react`, `gsap`, and `gsap/ScrollTrigger` through Astro's Vite configuration.
- Restart the development server with forced dependency optimization after the configuration change.
- Preserve the existing four-stage story, copy, layout, GSAP timeline, scroll behavior, keyboard behavior, mobile fallback, and reduced-motion behavior.
- Do not replace or redesign the Process section.

## Portfolio carousel design

### Visual structure

- Each card contains only the real project screenshot.
- Remove the simulated browser title bar above the screenshot.
- Remove the metadata strip below the screenshot, including project number, project name, category, and external-link button.
- Remove side-card chevron buttons.
- Remove the bottom arrow and progress control.
- Remove the instruction below the carousel.
- Retain the current large center card, two layered side cards, rounded frame, depth, color, and subtle glass treatment.
- Remove gray filler bands around the screenshot so the image reaches the card frame cleanly.

### Interaction

- Clicking anywhere on a side screenshot makes that project active.
- The selected card moves to the center using the existing 820 ms spring-like transition.
- The previous center card moves behind to the opposite side during the same transition.
- Drag and swipe remain available without visible controls.
- Left and right keyboard arrows remain available when the carousel is focused.
- The active screenshot is not a link and uses a default cursor. Side screenshots use a pointer cursor.
- The visually hidden live region continues to announce the active project.

### Responsive behavior

- Desktop keeps a dominant center screenshot and clearly visible side screenshots.
- Mobile keeps a large center screenshot with narrow, clickable side previews.
- The carousel must not add horizontal page overflow.
- Reduced-motion mode keeps the same states and interaction but makes transitions effectively instant.

## Accessibility

- The carousel stage remains keyboard focusable with a visible focus style.
- Side cards expose button semantics and descriptive Polish accessible labels.
- The active card exposes `aria-current` and is not announced as an actionable control.
- Project screenshots retain descriptive alternative text.
- The active-project live region remains polite.

## Verification

### Process

- The structural Process validator passes.
- The browser verifier confirms hydration, all four stage animations, scroll progression, replay, mobile behavior, and reduced-motion behavior.
- The GSAP optimized dependency URLs return HTTP 200 instead of 504.

### Portfolio

- A structural validator confirms the removed title bar, metadata, link, side controls, bottom controls, and hint are absent.
- The browser verifier confirms all three images load and use `object-fit: contain`.
- Clicking the left and right screenshot surfaces changes the active index.
- The real pointer drag, keyboard arrows, mobile geometry, overflow protection, and reduced-motion behavior pass.
- Desktop and mobile screenshots are visually reviewed.

## Out of scope

- Changing project order, project screenshots, section heading, or body copy.
- Adding autoplay.
- Adding new dependencies or replacing GSAP.
- Redesigning the Process section.
