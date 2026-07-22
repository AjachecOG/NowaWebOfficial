# Process Scene Copy Design

## Goal

Replace the repeated generic headline across the final two process scenes with a short, personal progression from preview to launch.

## Approved copy

- Stage 3, “Design i wdrożenie”: `To będzie Twoja strona.`
- Stage 4, “Start i wsparcie”: `To jest Twoja strona.`

The capitalized `Twoja` is intentional and emphasizes the client-facing message.

## Badge removal

Remove the `wdrożone` badge from stage 3 completely. Delete its markup and any CSS rules or animation that become unused; do not merely hide it.

## Scope

Keep the existing pencil-and-paint animation, page mockup, launch status, timing, layout, and all other process copy unchanged.

## Verification

- Source validation checks both exact headlines.
- Source validation confirms that `story-code-check` and `wdrożone` are absent from the design scene implementation.
- The process browser verification and production build remain green.
