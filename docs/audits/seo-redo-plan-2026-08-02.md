# Plan ponownego wdrożenia SEO — NowaWeb

**Data:** 2026-08-02  
**Status:** eksperyment **cofnięty** z gałęzi PR; draft zachowany tylko jako tag Git.  
**Cel tego dokumentu:** checklista „co było zrobione / co zrobić starannie później” — z Twoim copy, cenami i designem.

Powiązane:

- Audyt (diagnoza): [`seo-audit-2026-08-02.md`](./seo-audit-2026-08-02.md)
- Draft do podglądu lokalnego (tag): `experiment/seo-draft-2026-08-02` → commit `a7dbb4f`
- PR (tylko docs/plan): https://github.com/AjachecOG/NowaWebOfficial/pull/1

---

## 1. Jak zobaczyć eksperyment lokalnie (bez mergowania)

```bash
git fetch --tags
git checkout experiment/seo-draft-2026-08-02
npm ci
npm run build && npm run preview
# albo: npm run dev
```

Powrót na oficjalny kod:

```bash
git checkout master
```

**Nie merge’uj** tego taga / starych commitów SEO na `master` bez przeglądu. Widełki cenowe w drafcie były **szacunkowe** (`src/data/pricing.ts`) — do weryfikacji z Tobą.

---

## 2. Co było w eksperymencie (do starannego przerobienia)

### A. On-page / techniczne (niski ryzyko, warto wrócić wcześnie)

| Element | Gdzie w drafcie | Co zrobić starannie |
|--------|-----------------|---------------------|
| Tytuł / meta / OG / Twitter | `src/components/BaseHead.astro`, `src/layouts/BaseLayout.astro`, `src/pages/index.astro` | Doprecyzować copy z Tobą; uniknąć keyword stuffing |
| Canonical + trailing slash | `astro.config.mjs` (`trailingSlash: 'always'`), BaseHead | Spójność z Netlify / GSC |
| Skip-link a11y | `BaseLayout.astro` | OK do zachowania |
| FAQ + FAQPage schema | `index.astro` + JSON-LD | Pytania/odpowiedzi po Twojej konsultacji (prawdziwe widełki, proces, obszar) |
| Bogatsze JSON-LD | Organization, WebSite, Service, OfferCatalog, BreadcrumbList | Dopisać `sameAs` (IG/FB/LinkedIn) gdy będą |
| Breadcrumbs UI | `src/components/Breadcrumbs.astro` | Dostosować styl do brandu |
| Nav + footer: Usługi / Projekty / Cennik / Blog | `SiteHeader.astro`, `SiteFooter.astro` | Może mniej linków na start — decyzja produktowa |
| Linki wewnętrzne na home | sekcje usług + cennik + FAQ | Bez przeładowania sekcjami |

### B. Nowe strony treści (średnie/wysokie ryzyko copy + design)

| URL (draft) | Pliki | Uwagi do redo |
|-------------|-------|---------------|
| `/uslugi/` | `src/pages/uslugi/index.astro` | Hub usług |
| `/uslugi/strony-www/` | `.../strony-www.astro` | Copy + CTA |
| `/uslugi/sklepy-internetowe/` | `.../sklepy-internetowe.astro` | |
| `/uslugi/seo-lokalne/` | `.../seo-lokalne.astro` | |
| `/uslugi/opieka-www/` | `.../opieka-www.astro` | |
| `/uslugi/rebranding/` | `.../rebranding.astro` | |
| `/uslugi/wizytowka-google/` | `.../wizytowka-google.astro` | |
| `/projekty/` | `src/pages/projekty/index.astro` | Hub case |
| `/projekty/jaskolka/` | case study | **Treść marketingowa / anonimizacja** — potwierdź z klientem |
| `/projekty/domki-nad-zalewem/` | case study | j.w. |
| `/projekty/edukacja-online/` | case study | j.w. |
| `/cennik/` | `src/pages/cennik/index.astro` + `src/data/pricing.ts` | **Ceny do Twojej decyzji** — draft miał widełki orientacyjne |
| `/blog/` | `src/pages/blog/index.astro` | |
| `/blog/ile-kosztuje-strona-www-2026/` | post | Treść ekspercka — napisać od nowa / z Tobą |
| `/blog/seo-lokalne-dla-firm-uslugowych/` | post | j.w. |

Wspólne w drafcie: `src/styles/content-pages.css`, dane `src/data/services.ts`, `src/data/case-studies.ts`, `src/data/blog.ts`.

### C. IndexNow (niskie ryzyko, po GSC)

| Element | Gdzie |
|--------|--------|
| Klucz w `public/` | `public/nowaweb-indexnow-7f3c9a2e1b84.txt` |
| Skrypt ping | `scripts/ping-indexnow.mjs` |
| npm script | `"ping:indexnow": "node scripts/ping-indexnow.mjs"` |

Po wdrożeniu: `npm run ping:indexnow` (i ewentualnie w CI po deploy). Równolegle Bing Webmaster Tools.

### D. Czego **nie** było w kodzie (tylko Ty / ops)

1. **Google Search Console** — Domain property `nowaweb.pl` + DNS TXT + sitemap `https://nowaweb.pl/sitemap-index.xml` + Request indexing.
2. **Bing Webmaster** — verify + IndexNow.
3. **Google Business Profile** — nazwa **NowaWeb**, kategoria np. Web Designer, obszar Polska / lokalnie.
4. **Backlinki / wzmianki** — katalogi branżowe, partnerzy, social `sameAs`.
5. **Czas indeksacji** — domena młodziutka (~2026-07-28); bez GSC trudno cokolwiek „przyspieszyć”.

---

## 3. Sugerowana kolejność „z większym staraniem”

1. **Ops bez kodu:** GSC + Bing + (opcjonalnie) GBP — od razu, niezależnie od redesignu treści.  
2. **Mały PR techniczny:** meta/title, trailing slash, skip-link, poprawione JSON-LD, FAQ tylko jeśli copy jest gotowe.  
3. **Cennik:** najpierw ustalenie widełek z Tobą → potem `/cennik/` + OfferCatalog.  
4. **Usługi:** 1 hub + 2–3 kluczowe landingi (niekoniecznie od razu 6).  
5. **Projekty:** tylko case’y z zgodą / prawdziwymi liczbami; reszta jako „wybrane realizacje” bez nadmiernego SEO fluff.  
6. **Blog:** 1–2 solidne artykuły, nie „AI landing spam”.  
7. **IndexNow** + ping po deploy.  
8. Design: dopasować `content-pages.css` / layout do Twojego systemu (nie zostawiać „szybkiego” wyglądu z draftu bez passu wizualnego).

---

## 4. Kryteria akceptacji przy redo

- [ ] Copy i ceny zatwierdzone przez Ciebie  
- [ ] Case studies OK prawnie / wizerunkowo  
- [ ] Build `npm run build` zielony  
- [ ] Brak keyword stuffing w title/H1  
- [ ] Canonical + sitemap + robots spójne  
- [ ] GSC: property + sitemap submitted  
- [ ] Design pass (nie „tymczasowy” layout)  
- [ ] (Opcja) IndexNow skonfigurowany  

---

## 5. Co świadomie odrzucamy jako „oficjalną wersję”

Cały eksperymentalny kod SEO z commitów `c38367f` i `a7dbb4f` **nie** jest w `master` ani w aktualnej treści tej gałęzi PR — tylko w tagu `experiment/seo-draft-2026-08-02` do lokalnego podglądu i jako referencja przy redo.
