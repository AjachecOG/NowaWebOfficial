# NowaWeb — audyt gotowości, 10 września 2026

## Werdykt

Audyt techniczny i wizualny zakończony. Kod i design są gotowe do zapisania w repozytorium. Nie wykonano commita, pusha ani wdrożenia.

Pełna gotowość merytoryczna do publicznej publikacji pozostaje warunkowa: w projekcie nadal znajduje się lista informacji o realizacjach i firmie wymagających potwierdzenia właściciela. Test lokalny nie potwierdza dostarczenia formularza przez docelowy hosting.

Nie uzyskano 100 punktów wydajności mobilnej na głównej. Wynik wynosi 88; pozostałe 14 indeksowanych stron osiąga 100 we wszystkich czterech kategoriach Lighthouse. Nie usuwano ani nie skracano animacji, żeby podwyższyć ocenę.

## Poprawki wyglądu i działania

- Kontakt otrzymał szeroki, responsywny układ z animowaną kopertą i listem. Grafika wypełnia prawą kolumnę, a bezpośredni kontakt i dane firmy znajdują się pod nią. Na telefonach treść układa się w jedną kolumnę.
- Uporządkowano hierarchię nagłówków, odstępy, rozmiary drobnych tekstów i kontrast. Poprawiono między innymi oznaczenie VS oraz nagłówek na granatowym tle usług.
- Formularze mają czytelne komunikaty przy polach, stany błędów i focus, sprawdzanie pustych znaków, e-maila i opcjonalnego numeru telefonu. Zachowano standardową wysyłkę Netlify Forms.
- Menu mobilne działa również bez JavaScriptu. Sprawdzono Escape, przywracanie focusu, przewijanie w poziomym widoku telefonu oraz obsługę klawiaturą.
- Poprawiono semantykę ilustracji i karuzeli, oznaczenie aktywnej strony, przejście do głównej treści i ponowne otwieranie ustawień cookies.

Ocena wizualna obejmowała spójność kolorów i typografii, czytelność oferty, kolejność treści, widoczność przycisków, układ formularza oraz zachowanie szerokości na telefonie i desktopie. Lighthouse nie ocenia estetyki; nie przypisujemy designowi fikcyjnego wyniku liczbowego.

## Optymalizacja i zależności

- Wspólne style wydzielono z arkusza głównej, dzięki czemu proste podstrony nie otrzymują całego zestawu stylów animowanych sekcji.
- Kontrolery DOM, menu, ustawienia cookies i napis hero działają jako skrypty Astro. Wyspy React pozostają przy komponentach, które ich potrzebują, i ładują się blisko widocznego obszaru.
- Dodano mniejsze warianty obrazów usług, portfolio i monitora, `srcset`, dopasowane rozmiary oraz preload głównego obrazu. Oryginały pozostają dostępne.
- Usunięto nieużywane selektory dawnych układów, zachowując używane animacje, ich czas i interakcje.
- Astro zaktualizowano z 7.0.7 do 7.3.2, sharp z 0.35.3 do 0.35.4 i poprawiono zależności pośrednie. Końcowy pełny `npm audit`: **0 znanych podatności**. Powodem aktualizacji były rzeczywiste zgłoszenia, w tym [komunikat autorów Astro dotyczący przetwarzania AVIF](https://github.com/withastro/astro/security/advisories/GHSA-26w7-cxv4-gfx2).
- Wymagany Node.js **22.19.0 lub nowszy**. Końcowy build i testy sprawdzono bezpośrednio na 22.19.0 z lokalnego runtime; nie zmieniano systemowej instalacji Node. W repozytorium zapisano wymaganie `engines`, `.nvmrc` i README.

## Wyniki Lighthouse

Lighthouse 12.8.2, Chrome, produkcyjny build obsługiwany lokalnie pod `http://127.0.0.1:4322`. Profil mobilny: 412 × 823, DPR 1.75, symulowane spowolnienie CPU ×4 i sieci. Wyniki dotyczą tego pomiaru laboratoryjnego; nie są pomiarem ruchu użytkowników ani gwarancją wyniku po wdrożeniu. Lokalny podgląd przekazuje HTML bez kompresji transportowej.

| Adres | Wydajność | Dostępność | Dobre praktyki | SEO |
| --- | ---: | ---: | ---: | ---: |
| `/` | 88 | 100 | 100 | 100 |
| `/kontakt/` | 100 | 100 | 100 | 100 |
| `/strony-internetowe-dla-firm/` | 100 | 100 | 100 | 100 |
| `/landing-page/` | 100 | 100 | 100 | 100 |
| `/modernizacja-stron/` | 100 | 100 | 100 | 100 |
| `/opieka-nad-strona/` | 100 | 100 | 100 | 100 |
| `/o-nas/` | 100 | 100 | 100 | 100 |
| `/cennik/` | 100 | 100 | 100 | 100 |
| `/realizacje/` | 100 | 100 | 100 | 100 |
| `/realizacje/cakepops/` | 100 | 100 | 100 | 100 |
| `/realizacje/new-york-rolls/` | 100 | 100 | 100 | 100 |
| `/realizacje/atmo-vision/` | 100 | 100 | 100 | 100 |
| `/polityka-cookies/` | 100 | 100 | 100 | 100 |
| `/polityka-prywatnosci/` | 100 | 100 | 100 | 100 |
| `/regulamin/` | 100 | 100 | 100 | 100 |

Główna: FCP 1,8 s, LCP 3,5 s, TBT 130 ms, CLS 0,009. Kontakt: FCP 0,9 s, LCP 1,2 s, TBT 70 ms, CLS 0.

Dodatkowy pomiar głównej w standardowym profilu desktop: **100/100/100/100**, FCP 0,4 s, LCP 0,7 s, TBT 0 ms, CLS 0. Eksperymentalna reguła wykazała zbędne etykiety przycisków etapów procesu, różniące się interpunkcją od widocznego tekstu. Usunięto nadpisujące `aria-label`, pozostawiając natywną nazwę wynikającą z treści przycisku.

Początkowy pomiar głównej wynosił 76/93/100/100, a kontaktu 93 punkty wydajności. Końcowa główna nadal ma rezerwę w renderowaniu największego obrazu i kosztach początkowej sceny. Raport wskazuje również obrazy możliwe do dalszego dopasowania oraz CSS używany poza pierwszym ekranem. Sam komunikat „unused CSS” z pierwszego ekranu nie uprawnia do usunięcia stylów dalszych sekcji i animacji.

## Weryfikacja

- Build Astro 7.3.2: **17 stron, poprawny**.
- Testy Node: **11/11** — formularze, ograniczenia pól, konfiguracja CSP, bezpieczny JSON, canonical, metadane, sitemap, linki, FAQ w HTML i dane firmy.
- Playwright po aktualizacji zależności: **18/18**, bez pominiętych, niestabilnych i nieoczekiwanie błędnych testów. Kontrola wszystkich publicznych podstron przy 390 i 1440 px, dodatkowe wąskie ekrany i tablety, karuzela, menu, formularze, animacja procesu i hero.
- Axe WCAG A/AA i kontrola układu: **34 widoki (17 adresów × 2 szerokości)**, bez wykrytych naruszeń, błędów JavaScriptu, brakujących obrazów i poziomego przepełnienia. Każdy widok zawiera jeden H1. To zakres automatycznych reguł, a nie certyfikat zgodności całej witryny.
- Walidatory struktury hero, obracanych kart, portfolio i wszystkich etapów procesu: poprawne.
- Audyt zasobów publicznych: **USED 55, UNUSED 0**.
- `git diff --check`: bez błędów whitespace. Pliki środowiska i katalogi wynikowe są ignorowane; śledzony jest tylko `.env.example`. Skan popularnych sygnatur tokenów i kluczy prywatnych nie znalazł dopasowań. Nie znaleziono plików o wielkości co najmniej 50 MB. Usunięto śledzony cache Pythona i dodano reguły ignorowania.

W tym środowisku Windows worker Playwright pozostał aktywny po zaliczeniu wszystkich scenariuszy. Zamknięto wyłącznie zidentyfikowany własny worker; runner zapisał raport **18 passed** i zakończył się kodem 0. Narzędzia audytowe również wymagały zamknięcia po zapisaniu wyników. Nie ukryto niezaliczonych testów.

Surowe raporty i zrzuty pozostają lokalnie w ignorowanym `output/playwright/design-final/`, a raport desktop w `output/playwright/design-desktop/`. Pełny przebieg 18 testów zakończył się poprawnie po aktualizacji zależności; po ostatniej korekcie etykiet powtórzono 2 odpowiednie scenariusze klawiatury, również poprawne. `output/playwright/test-results.json` zawiera ten ostatni, ukierunkowany przebieg. Narzędzia Lighthouse i axe zainstalowano tylko pod `output/`, poza zależnościami strony.

## Gotowość treści i uruchomienia

Treści oferty, procesu, wyceny, FAQ i kontaktu są redakcyjnie spójne. Wycena jest przedstawiona jako indywidualna, bez dopisanych cen i gwarancji. Opisy portfolio odnoszą się do widocznych projektów, bez wymyślonych wyników biznesowych.

Nadal obowiązuje [lista materiałów do potwierdzenia](../seo/materialy-do-potwierdzenia.md):

1. **Portfolio:** status Cakepops, New York Rolls i Atmo - Vision, rzeczywisty udział NowaWeb oraz prawo do publikacji nazw i podglądów. Nie można potwierdzić tych faktów na podstawie samego kodu i obrazów.
2. **Firma:** aktualność danych Revela Sp. z o.o. i formalna relacja marki NowaWeb ze spółką.
3. **Hosting:** rzeczywiste dostarczenie formularzy, docelowe przekierowania i działanie domen. Żądania formularza w testach były przechwytywane lokalnie; nie wysyłano wiadomości.

Wniosek: można przygotować commit i push kodu. Pełna publiczna publikacja wymaga domknięcia powyższych faktów i próby formularza na docelowym hostingu.
