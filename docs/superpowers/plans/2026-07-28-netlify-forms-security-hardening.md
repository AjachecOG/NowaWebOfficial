# Netlify Forms Security Hardening Implementation Plan

> **For agentic workers:** Execute inline in the current workspace. Do not commit, push, deploy, install packages, or overwrite unrelated user changes.

**Goal:** Zastąpić niekompletną integrację Turnstile prostym i spójnym Netlify Forms oraz wdrożyć bezpieczne poprawki z audytu.

**Architecture:** Dwa statyczne formularze pozostają obsługiwane przez Netlify Forms. Kod nie ładuje usług antybotowych; ochronę zapewniają Netlify Akismet i honeypot. Regresje są sprawdzane testem Node uruchamianym na rzeczywistym artefakcie Astro oraz funkcji serializującej JSON.

**Tech Stack:** Astro 7, React 19, Netlify Forms, Node.js 22.

## Global Constraints

- Nie commitować, nie pushować i nie deployować.
- Nie instalować ani nie aktualizować zależności.
- Zachować istniejące zmiany użytkownika, zwłaszcza `inert` i `aria-hidden` w formularzu homepage.
- Nie wykonywać POST do produkcji ani nie zmieniać paneli usług.

---

### Task 1: Regresyjny test bezpieczeństwa

**Files:**
- Create: `tests/security-hardening.test.mjs`
- Modify: `package.json`

**Produces:** Polecenie `npm run validate:security`, które buduje stronę i kończy się kodem 1, gdy Turnstile pozostaje w artefakcie, CSP nie jest egzekwowana, brakuje limitów lub JSON-LD nie jest bezpiecznie serializowany.

- [ ] Dodać test Node odczytujący wygenerowany HTML/JS i `netlify.toml` oraz importujący `safeJsonForHtml`.
- [ ] Dodać skrypt npm `validate:security`.
- [ ] Uruchomić test przed implementacją i potwierdzić porażkę wynikającą z istniejącego Turnstile/CSP.

### Task 2: Uproszczenie formularza

**Files:**
- Modify: `src/components/ContactForm.astro`
- Modify: `src/components/SiteMotion.tsx`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`

**Produces:** Dwa formularze Netlify bez klientowego Turnstile, z limitami pól i informacją prywatności.

- [ ] Usunąć prop `lazyChallenge`, env site key, kontenery widgetu i skrypt Cloudflare.
- [ ] Usunąć loader Turnstile z `SiteMotion.tsx`, zachowując odblokowanie `inert` i aktualizację `aria-hidden`.
- [ ] Usunąć `lazyChallenge` z wywołania formularza na homepage.
- [ ] Dodać `maxlength`: 120/254/32/4000.
- [ ] Zastąpić checkbox zgody zwykłą informacją z linkiem do polityki.
- [ ] Usunąć osierocone style checkboxa, zachowując wygląd tekstu informacji.

### Task 3: Egzekwowana CSP i bezpieczny JSON-LD

**Files:**
- Modify: `netlify.toml`
- Modify: `src/components/SiteHead.astro`
- Create: `src/utils/safe-json.mjs`

**Produces:** Aktywny nagłówek CSP bez domeny Cloudflare i JSON-LD odporny na zamknięcie tagu `script`.

- [ ] Zamienić `Content-Security-Policy-Report-Only` na `Content-Security-Policy`.
- [ ] Ustawić `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-src 'none'`.
- [ ] Utworzyć `safeJsonLd` przez zamianę `<` na `\\u003c` w zserializowanym JSON.
- [ ] Przekazać `safeJsonLd` do `set:html`.

### Task 4: Dokumentacja prywatności i konfiguracji

**Files:**
- Modify: `src/pages/polityka-prywatnosci.astro`
- Modify: `.env.example`
- Modify: `netlify.toml`
- Modify: `TODO.txt`

**Produces:** Dokumentacja odpowiadająca rzeczywistej architekturze bez Turnstile.

- [ ] Usunąć Turnstile i jego sekret z komentarzy/configuration notes.
- [ ] Usunąć Turnstile z polityki prywatności oraz doprecyzować podstawę odpowiedzi na zapytanie jako art. 6 ust. 1 lit. b/f.
- [ ] Oznaczyć w TODO, że Form detection zostało włączone przez użytkownika, a redeploy i testy pozostają do wykonania.
- [ ] Pozostawić `.env.example` bez klucza Turnstile i z komentarzem, że runtime env nie są wymagane.

### Task 5: Weryfikacja końcowa

**Files:**
- Verify only: all modified files and `dist`

- [ ] Uruchomić `npm run validate:security` i potwierdzić PASS.
- [ ] Uruchomić `npm run build` i potwierdzić 7 wygenerowanych stron.
- [ ] Sprawdzić `dist`, że nie zawiera `turnstile`, `challenges.cloudflare.com` ani sourcemap.
- [ ] Uruchomić `npm audit --json` i potwierdzić 0 znanych podatności.
- [ ] Przejrzeć `git diff --check`, `git diff --stat` i `git status`; nie commitować.
