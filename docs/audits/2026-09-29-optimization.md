# NowaWeb - audyt i optymalizacja, 29 września 2026

## Punkt odniesienia

Przejrzano historię lokalnego repozytorium `C:\Users\Adam\slodka-pasja`. Największy pakiet prac porównawczych to commit `4c7eb07` z 22 sierpnia 2026: optymalizacja i warianty obrazów, porządkowanie Astro/React, metadane, nagłówki Netlify, testy przeglądarkowe i raport rozmiaru `dist`. Metadane commita wskazują autora `Codex`, nie identyfikują modelu, który przygotował zmiany. W repozytorium Słodka-Pasja są obecnie niezapisane lokalne zmiany; nie były modyfikowane w tym audycie.

NowaWeb miał już przed tym audytem statyczne podstrony, obrazy WebP z `srcset`, odroczone wyspy React, sitemap, dane strukturalne, walidację formularzy i zestaw testów. Zmiany dobrano do problemów widocznych w kodzie i pomiarach.

## Ustalenia i zmiany

1. **Pobieranie obrazów monitora na starcie.** Dwa ukryte ekrany monitora były pobierane mimo `loading="lazy"`, bo wszystkie obrazy znajdowały się w obszarze pierwszego ekranu. Teraz ekran 2 i 3 dostają adres dopiero przed pokazaniem, a przejście czeka na dekodowanie obrazu. Gdy pobranie się nie powiedzie, widoczny ekran pozostaje na miejscu. W śladzie Lighthouse transfer ekranów monitora podczas pomiaru spadł z 163 282 do 109 800 B. To odroczenie 53 482 B, nie trwałe zmniejszenie całkowitego rozmiaru strony.
2. **Animacja karty marki.** Po aktywacji wyspy React pętla `requestAnimationFrame` działała stale, także po przewinięciu karty poza ekran. Teraz zatrzymuje się poza widokiem i w tle przeglądarki, a po powrocie wznawia obliczenia z nowym znacznikiem czasu. Test regresyjny najpierw wykazał ruch poza ekranem, potem potwierdził zatrzymanie i wznowienie.
3. **Ruch wskaźnika na dotyku.** Kontrolery hero i kart usług nie planują już klatek animacji dla gestów dotykowych lub urządzeń bez precyzyjnego wskaźnika. Interakcje myszką i klawiaturą zostały objęte testami przeglądarkowymi.
4. **Cache przeglądarki.** Dla plików `/_astro/*` o nazwach z hashem dodano `Cache-Control: public, max-age=31536000, immutable`. Reguła zachowuje dotychczasowe nagłówki bezpieczeństwa. Obrazy w `public/` mają stałe nazwy, więc nie dostały cache `immutable`. Netlify domyślnie przechowuje pliki statyczne na CDN, ale przeglądarce przekazuje `max-age=0`; ta zmiana dotyczy ponownych wizyt i nawigacji w przeglądarce. Źródło: [Netlify - caching overview](https://docs.netlify.com/build/caching/caching-overview/).
5. **Zależności.** `npm audit` wykrył jedną podatność moderate w pośrednim `devalue@5.8.1`, wprowadzanym przez Astro i `@astrojs/react`. Lockfile zaktualizowano tylko do `devalue@5.9.4`. Ponowny `npm audit`: 0 znanych podatności. Opis problemu i poprawki: [GHSA-9rgm-9g3h-6x36](https://github.com/advisories/GHSA-9rgm-9g3h-6x36).

## Pomiary

Lighthouse 12.8.2, lokalny produkcyjny podgląd, profil mobilny, jeden przebieg przed i jeden po zmianach. To pomiar laboratoryjny, nie gwarancja wyniku produkcyjnego. Surowe raporty są w ignorowanych katalogach `output/playwright/design-audit-2026-09-29-before/lighthouse/` i `output/playwright/design-audit-2026-09-29-after/lighthouse/`.

| Metryka głównej | Przed | Po |
| --- | ---: | ---: |
| Wydajność / dostępność / dobre praktyki / SEO | 89 / 100 / 100 / 100 | 90 / 100 / 100 / 100 |
| FCP | 1,8 s | 1,9 s |
| LCP | 3,5 s | 3,0 s |
| TBT | 120 ms | 210 ms |
| CLS | 0,009 | 0,009 |
| Transfer ekranów monitora w śladzie | 163 282 B | 109 800 B |

Wynik wydajności i LCP poprawiły się w tych pojedynczych przebiegach, ale TBT wzrósł. Nie przypisujemy zmiany punktowej wyłącznie tej optymalizacji. Lighthouse wskazuje animowany monitor jako element LCP; przed zmianą 87% czasu LCP stanowiło opóźnienie renderowania, nie czas pobierania obrazu. Skrócenie animacji byłoby osobną decyzją wizualną. Komunikaty o niewykorzystanym CSS obejmują również sekcje poniżej pierwszego ekranu, więc nie są podstawą do usuwania ich stylów.

Build generuje 17 statycznych stron i 91 plików o łącznym rozmiarze 3 230 869 B. Strona główna HTML ma 239 954 B; dziewięć plików JS łącznie 335 510 B. To rozmiary na dysku, bez kompresji transportowej i bez twierdzenia, że wszystkie pliki są pobierane przy otwarciu głównej.

## Weryfikacja

- Astro build na Node 24.19.0: 17 stron, poprawny. Systemowy Node 22.16.0 jest starszy od wymaganego przez projekt `>=22.19.0`.
- TypeScript `tsc --noEmit`: bez błędów.
- Testy Node po aktualizacji zależności: 11/11.
- Playwright po aktualizacji zależności: 20/20; dwa nowe testy najpierw wykazały brak optymalizacji, a potem przeszły po wdrożeniu.
- Audyt axe WCAG A/AA i układu po aktualizacji zależności: 34 widoki (17 tras x 390 i 1440 px), 0 wykrytych naruszeń, błędów JavaScriptu, brakujących obrazów i poziomego przepełnienia; każdy widok ma jeden H1. To kontrola automatyczna, nie certyfikat pełnej zgodności WCAG.
- `netlify.toml` parsuje się jako TOML; obie reguły zachowują CSP. `git diff --check`: bez błędów whitespace.

## Pozostałe ograniczenia

- Rzeczywiste nagłówki cache i dostarczenie formularza Netlify trzeba potwierdzić na docelowym hostingu. Test lokalny nie wysyła wiadomości do firmy.
- Nadal wymagają potwierdzenia fakty o firmie i realizacjach z `docs/seo/materialy-do-potwierdzenia.md`.
- CSP dopuszcza `unsafe-inline`, bo strona używa skryptów i stylów Astro inline. Usunięcie tego wymaga osobnego przebudowania sposobu osadzania tych zasobów i weryfikacji na hostingu.
- Główny koszt LCP pozostaje związany z animacją hero. Ten audyt zachował jej wygląd i tempo.
