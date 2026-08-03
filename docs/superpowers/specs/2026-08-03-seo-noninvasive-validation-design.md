# SEO Non-Invasive Validation Design

## Purpose

Create an isolated, reversible implementation that improves the verified
technical SEO and mobile performance gaps without changing the page's visual
direction, offer, copy, URL architecture, or the `master` branch.

## Scope

This version contains only the accepted Variant A:

1. Make sitemap dates truthful by omitting generated `lastmod` values.
2. Point internal links to their existing trailing-slash canonical URLs.
3. Reduce avoidable mobile work by using responsive image markup and delaying
   interactive islands that are below the initial viewport.
4. Add focused automated regression checks for the generated sitemap and
   canonical internal links.
5. Validate the branch with the production build, static checks, redirect
   checks, Lighthouse mobile and desktop runs, and visual review.

## Explicit exclusions

- No merge, push, deploy, or modification of `master`.
- No new service pages, SEO copy, schema expansion, or local-market claims.
- No changes to forms, analytics, security headers, or contact flows.
- No removal or restyling of existing visual elements.
- No Google Search Console actions, because they require owner access.
- Accessibility fixes remain a separate branch so they do not obscure the
  performance validation.

## Design decisions

### Sitemap

`astro.config.mjs` currently assigns `new Date()` to every URL at build time.
The implementation removes that assignment. The existing route filter,
priority and change-frequency hints remain unchanged. This prevents a deploy
from incorrectly declaring every page materially updated.

### Canonical internal links

Astro generates directory URLs with a trailing slash, while navigation and
legal-link data use slashless paths. The implementation updates only internal
root-relative paths that resolve to pages to use their current canonical form:
`/kontakt/`, `/polityka-prywatnosci/`, `/polityka-cookies/` and `/regulamin/`.
Hash navigation remains `/#section` because the canonical home URL is `/`.

### Mobile loading

The initial hero monitor remains the eager, high-priority image because it is
the audited LCP candidate. Below-fold React islands (`ProcessIsland` and
`PortfolioCarousel`) change from `client:load` to `client:visible`; their UI
still hydrates before interaction after it enters the viewport. Hero behavior,
header navigation, form flow and visual styles remain unchanged.

Images that Lighthouse identified as oversized receive responsive source sets
using existing image assets only when alternate, suitable files can be
generated without altering their visual crop. If an asset has no safe variant,
the branch leaves it unchanged rather than degrading the design. Generated
derivatives are committed under the existing public asset hierarchy and their
source dimensions are explicitly declared.

## Files expected to change

- `astro.config.mjs` — remove generated sitemap `lastmod`.
- `src/data/site.ts`, `src/components/SiteHeader.astro`,
  `src/components/MobileNav.tsx`, and existing legal/footer link sites — use
  canonical trailing-slash paths.
- `src/pages/index.astro` — adjust only hydration directives and responsive
  image markup that passes visual validation.
- `public/assets/nowaweb/...` — only generated responsive image derivatives,
  if needed after image inspection.
- `tests/seo-noninvasive-validation.test.mjs` — new static regression checks.

## Acceptance criteria

1. The generated sitemap contains no artificial build-time `lastmod` values.
2. Generated indexable HTML has no slashless internal links to canonical page
   URLs.
3. The site builds successfully and the existing security test still passes.
4. Mobile Lighthouse improves materially from the recorded 68 performance / 5.9
   second LCP baseline without desktop regression; validation reports exact
   before-and-after results rather than assuming a target was met.
5. Desktop and mobile screenshots show no intentional visual change to the
   hero, process, portfolio, navigation, or contact section.
6. Branch remains unmerged and can be removed with its worktree if rejected.

## Rollback

No production system is changed during this work. If the version is rejected,
remove the local worktree and delete `codex/seo-noninvasive-validation`. If it
is accepted later, merge only the reviewed commits after a final build and
Lighthouse comparison.
