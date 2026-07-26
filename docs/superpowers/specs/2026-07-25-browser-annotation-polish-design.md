# Browser Annotation Polish Design

## Scope

Implement the three approved browser annotations without changing the surrounding page structure or interaction model.

## Process Scene Copy

- The stage 3 message is exactly `To będzie Twoja strona ;)`.
- Only the stage 3 message is italic and slightly larger.
- Its line height and bottom clearance protect the italic `j` descender.

## Launch Scene Motion

- The existing launch sequence remains the source of truth for normal motion.
- Under `prefers-reduced-motion: reduce`, the launch scene still communicates publication with a short fade, progress fill, online-status reveal, and support-message reveal.
- Reduced-motion variants avoid translation and scaling except for the horizontal progress fill.
- All motion is finite and restarts when the launch card becomes active again.

## Portfolio Blend

- The centered project stays crisp and fully opaque.
- The stage itself has no mask, so the centered card shadow can fade naturally beyond its former hard boundary.
- A radial mask softens the outer and lower edges of the two side cards.
- The centered card uses a shorter, neutral-tinted shadow that reaches the page background before the project name.

## Verification

- Static validators protect the approved copy, stage-specific typography, reduced launch-motion contract, and side-card fade.
- The production build must succeed.
- Browser verification covers the stage 3 computed typography, visible reduced launch animation, and the portfolio transition at desktop width.
