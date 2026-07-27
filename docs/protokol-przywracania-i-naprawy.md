# Protokół przywracania i naprawy — regresja hero (2026-07-26)

## Objawy

- Brak tekstu w hero (tytuł, lead, CTA) — widać tylko kursor/caret lub pusty lewy panel.
- Animacje wejścia wyglądają na „martwe” lub obcięte.
- Grafika hero (monitor, karty) zwykle nadal widoczna.

## Root cause (potwierdzony)

Audyt optymalizacji rozszerzył blok `@media (prefers-reduced-motion: reduce)` o `animation: none !important` na elementach hero/tytułów.

Te elementy mają w CSS bazowym `opacity: 0` i polegają na animacji (`forwards` / `both`), żeby dojść do `opacity: 1`.

Gdy OS / przeglądarka ma włączone **reduced motion** (Windows: Ustawienia → Ułatwienia dostępu → Efekty wizualne → Animacje), animacja jest zabijana, a treść zostaje na `opacity: 0`.

Sprawdzenie w DevTools:

```js
matchMedia('(prefers-reduced-motion: reduce)').matches
getComputedStyle(document.querySelector('.hero-title-line-inner')).opacity
```

Przy błędzie: `matches === true` oraz `opacity === "0"`.

## Naprawa (wdrożona)

1. **Nie zabijać** kluczowych animacji wejścia w `@media (prefers-reduced-motion)` (`animation: none` na hero = niewidoczny tekst).
2. **Glitch monitora zawsze włączony** w `monitor-billboard.ts` (bez early-return na reduced motion).
3. Hero / service proximity / brand flip / trasy mapy — z powrotem aktywne mimo OS reduced-motion (świadoma decyzja brandowa).

## Protokół awaryjny (jeśli znowu się zepsuje)

### A. Szybka weryfikacja (2 min)

1. Otwórz `http://127.0.0.1:4321/`.
2. Hard refresh (Ctrl+Shift+R).
3. W konsoli uruchom skrypt z sekcji Root cause.
4. Sprawdź, czy Windows ma wyłączone animacje systemowe.

### B. Rollback tylko CSS motion (bezpieczny)

```powershell
git checkout HEAD -- src/styles/global.css
npm run dev
```

Potem ręcznie przywróć tylko poprawki obrazów (`object-fit` / wymiary), jeśli potrzebne.

### C. Rollback całego audytu motion/SEO (twardszy)

Przywróć pliki sprzed sesji multitask (bez utraty ikon/Netlify, jeśli chcesz je zostawić):

```powershell
git checkout HEAD -- `
  src/styles/global.css `
  src/components/SiteMotion.tsx `
  src/components/HeroSceneMotion.tsx `
  src/components/BrandFlipCard.tsx `
  src/scripts/monitor-billboard.ts `
  src/scripts/poland-map-routes.ts
```

Następnie ponownie zastosuj regułę: **nigdy `animation: none` na elementach startujących z `opacity: 0` bez jawnego `opacity: 1`.**

### D. Pełny reset working tree (ostatnia deska)

Tylko jeśli akceptujesz utratę wszystkich niezcommitowanych zmian z listy pre-publish:

```powershell
git status
git restore --source=HEAD --worktree --staged .
```

**Uwaga:** usuwa też poprawki ikon, SEO, formularzy, zdjęć — nie używaj bez backupu / commita.

## Checklista po naprawie

- [ ] Hero: tytuł + lead + 2 CTA widoczne przy `prefers-reduced-motion: reduce`
- [ ] Hero: eyebrow czytelny (statyczny lub typewriter)
- [ ] Hero: grafiki na miejscu
- [ ] Signal strip / „Dlaczego NowaWeb” — teksty widoczne po scrollu
- [ ] `npm run build` przechodzi
- [ ] Test w normalnym Chrome (nie tylko Cursor Simple Browser)

## Reguła zapobiegawcza

Przy każdej zmianie a11y / performance:

> Jeśli wyłączasz animację (`animation: none`), ustaw od razu **docelowy stan wizualny** (`opacity`, `transform`, `filter`).  
> Preferuj test z Emulation → `prefers-reduced-motion: reduce` w Chrome DevTools.

## Powiązane zmiany z sesji (poza tym bugiem)

Zachowane i nadal pożądane (nie cofać bez powodu):

- Poprawki wymiarów WebP hero
- SEO head / JSON-LD / sitemap
- Netlify forms → `/dziekujemy/`
- Favicon + manifest
