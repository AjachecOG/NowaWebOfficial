# Process Workshop Clarity Design

## Goal

Make the strategy workshop immediately readable and visually crisp at desktop sizes without changing its content, animation sequence, persistent final state, or mobile behavior.

## Design direction

This is a targeted evolution of the existing light, playful agency landing page. The workshop remains a physical sticky-note board, but it receives more visual space and a lower information density. Design settings: `DESIGN_VARIANCE: 8`, `MOTION_INTENSITY: 7`, `VISUAL_DENSITY: 3`.

## Desktop layout

- Increase the strategy scene height from 315px to 400px.
- Give the strategy card a wider visual column and a narrower copy column at widths above 1020px.
- Keep the board close to the scene edges so the extra space benefits its content instead of creating another empty frame.
- Preserve the existing overall process card and left-hand narrative.

## Workshop typography and spacing

- Sticky-note copy must render at a minimum of 12px on the verified desktop viewport.
- Group labels should render at approximately 10px to 11px.
- The workshop title should render at approximately 12px.
- Increase group gaps, note padding, and line height to remove the compressed thumbnail appearance.
- Strengthen fine borders slightly so they remain crisp, while preserving the existing blue, yellow, and coral palette.

## Motion and behavior

- Keep the existing six-note impact animation, delays, deterministic final angles, priority ring, replay behavior, and persistent final board.
- Do not animate font size, width, or height.
- Keep the reduced-motion impact variant and the static mobile final state.

## Responsive behavior

- Desktop above 1020px uses the enlarged 400px scene.
- Tablet keeps the existing two-column card but uses a readable intermediate scale.
- Mobile below 760px remains static and overflow-free, with typography adjusted only as needed to fit.

## Verification

- Extend the process contract test to require the enlarged scene and readable desktop note typography.
- Extend browser verification to require a strategy scene height of at least 390px and note text of at least 12px.
- Confirm all six final note angles, persistent priority state, replay, reduced motion, mobile overflow, console errors, and production build.

