# NowaWeb

Strona NowaWeb zbudowana w Astro i React, z animacjami CSS i GSAP. Build generuje 17 statycznych stron. Konfiguracja hostingu i formularzy znajduje się w `netlify.toml`.

## Uruchomienie

Wymagany Node.js 22.19.0 lub nowszy oraz npm. Plik `package-lock.json` należy przechowywać w repozytorium.

```sh
npm ci
npm run dev
```

Produkcyjny podgląd lokalny:

```sh
npm run build
npm run preview -- --port 4322
```

## Weryfikacja

Testy korzystają z wygenerowanego katalogu `dist`. Testy przeglądarkowe wymagają zainstalowanego Google Chrome i używają portu 4322.

```sh
npm run build
npm test
npm run test:e2e
npm run validate:portfolio
npm run validate:process
npm run audit:assets
npm audit
```

Raporty i zrzuty testów trafiają do ignorowanego katalogu `output/playwright/`. Walidacja formularza przechwytuje żądanie lokalnie; nie wysyła wiadomości i nie potwierdza dostarczenia przez hosting.

## Treści i publikacja

- Dane firmy i kontakt: `src/data/site.ts`.
- Oferta i portfolio: `src/data/services.ts`, `src/data/projects.ts` oraz `src/pages/`.
- Końcowy audyt: [gotowość strony, 10.09.2026](docs/audits/2026-09-10-readiness.md).
- Fakty wymagające potwierdzenia właściciela: [materiały do potwierdzenia](docs/seo/materialy-do-potwierdzenia.md).

Netlify buduje stronę poleceniem `npm run build` i publikuje `dist`. Formularze korzystają z Netlify Forms; samo umieszczenie kodu w repozytorium GitHub nie uruchamia ich obsługi. Przed uruchomieniem publicznej witryny należy potwierdzić informacje o firmie i realizacjach oraz sprawdzić dostarczenie formularza na docelowym hostingu.

Do repozytorium nie dodajemy `.env`, `node_modules`, `dist`, lokalnych raportów ani cache. `.env.example` dokumentuje ustawienia bez sekretów.
