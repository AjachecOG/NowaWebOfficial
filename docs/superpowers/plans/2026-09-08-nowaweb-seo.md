# NowaWeb — plan tworzenia treści, materiałów i wdrożenia SEO

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rozbudować NowaWeb w serwis, który jednoznacznie przedstawia markę, odpowiada na pytania klientów i ma osobne strony dla najważniejszych usług.

**Architecture:** Główny serwis na NOWAWEB.PL, NOVAWEB.PL jako dodatkowa domena z przekierowaniem. Zachować Astro, obecną identyfikację i animowany charakter strony głównej. Nowe podstrony oprzeć na wspólnych, lekkich układach z treścią dostępną w HTML.

**Tech Stack:** Istniejące Astro, React, CSS, GSAP, integracja sitemap i Netlify; bez planowanej migracji technologii ani dodawania CMS na tym etapie.

**Spec / podstawa:** [Audyt z 8 września 2026](../../../seo-audit-2026-09-08/POLEPSZENIA-SEO-NOWAWEB.md). Plan jest propozycją do realizacji, nie informacją o wykonanym wdrożeniu.

## Założenia i zakres

- Roboczy kod: `C:/Users/Adam/Desktop/NowaWebOfficial/nowaweb-seo-source/`; wszystkie ścieżki `src/`, `public/`, `tests/` poniżej odnoszą się do tego repozytorium. Katalog nadrzędny zawiera inny projekt i nie jest miejscem wdrażania zmian NowaWeb.
- Punktem odniesienia jest audyt commita `84155982478d37c1caa80aa639996416e05c539f`. Przed implementacją sprawdzić zdalne zmiany i lokalny stan, nie nadpisywać pracy użytkownika.
- Plan obejmuje stronę i materiały, konfigurację domen oraz pomiar. Czynności w panelach wymagają dostępnej sesji właściciela; nie przekazywać haseł w rozmowie.
- Nie generować fikcyjnych członków zespołu, klientów, opinii, cen ani wyników. Brak potwierdzonych danych wstrzymuje publikację danej treści, a nie pracę nad resztą serwisu.
- Liczba stron wynika z odrębnej treści i oferty. Nie tworzyć kopii pod różne pisownie marki ani masowych podstron miast.

## Wybór zakresu

| Wariant | Zawartość | Ocena |
|---|---|---|
| Minimum | Domeny, metadane, FAQ i kilka zmian na głównej | Szybki pierwszy etap, ale nie uzupełnia luk w ofercie |
| **Rekomendowany** | Fundament + 10 nowych podstron + przeredagowana główna i kontakt | Łączy identyfikację marki, ofertę i dowody wykonanych prac |
| Rozszerzony | Dodatkowo poradniki i uzasadnione strony branżowe/lokalne | Dopiero po pierwszej publikacji i zebraniu danych |

## Etap 1. Materiały i zasady oferty

**Wynik:** zatwierdzone źródło faktów, na którym można oprzeć teksty. Przygotować dokument `docs/seo/fakty-i-oferta.md` w repozytorium strony; przy każdym fakcie zapisać pochodzenie i status potwierdzenia.

| Materiał od właściciela | Do czego potrzebny | Co można robić bez niego |
|---|---|---|
| Kim są osoby realizujące projekty, ich role i doświadczenie | „O nas”, podpisy, wiarygodność marki | Zaprojektować układ i zredagować informacje już potwierdzone |
| Aktualność danych Revela i powiązanie z NowaWeb | Kontakt, stopka, schema | Zachować istniejące dane roboczo, oznaczyć je do sprawdzenia |
| Zakres każdej usługi, terminy, poprawki, edycja treści, zasady własności | Oferty i FAQ | Przygotować pytania, kolejność sekcji i szkielety robocze |
| Rzeczywiste ceny lub sposób kalkulacji; koszty utrzymania | Cennik | Przygotować stronę „Jak wyceniamy”, bez wymyślonych kwot |
| Rola NowaWeb w trzech projektach, daty, zgoda na pokazanie, wyniki | Case studies | Przygotować układ i wykorzystać istniejące podglądy jako materiał roboczy |
| Referencje i adresy własnych profili | Opinie, `sameAs`, wzmianki | Opublikować stronę bez sekcji opinii i bez niepotwierdzonych profili |
| Rejestrator NOVAWEB.PL, dostęp do Netlify i Search Console | Domeny i pomiar | Zbudować i sprawdzić lokalny podgląd |

- [ ] Zebrać fakty w jednym dokumencie i wskazać, które blokują poszczególne strony.
- [ ] Ustalić nazwy usług, rzeczywisty zakres i sposób wyceny.
- [ ] Przygotować listę realizacji z rozróżnieniem wdrożenia, koncepcji i zakresu udziału.

**Odbiór:** żadna publikowana obietnica nie jest zgadywana. Nie potrzeba całego kompletu materiałów do rozpoczęcia projektu podstron.

## Etap 2. Dwie domeny i punkt wyjścia

**Wynik:** oba adresy prowadzą do właściwej marki, a skuteczność można mierzyć.

- [ ] Sprawdzić aktywność i delegację NOVAWEB.PL u rejestratora, aktualny DNS i konfigurację domen Netlify. Oprzeć rekordy na rzeczywistych danych panelu, nie na zgadywanych adresach IP.
- [ ] Podłączyć NOVAWEB.PL i www, wystawić certyfikaty, ustawić NOWAWEB.PL jako adres główny.
- [ ] Przygotować stałe przekierowanie 301/308 z zachowaniem ścieżki; sprawdzić główną, kontakt i nieistniejący adres. Reguły mogą być w panelu albo `netlify.toml`, zależnie od zastanej konfiguracji.
- [ ] Zweryfikować obie domeny w Search Console, odczytać indeksację i canonical. Zapisać wyniki bazowe dla fraz marki i usług, Polski i urządzeń mobilnych.
- [ ] Zapisać instrukcję konfiguracji i dowody odpowiedzi HTTP w `docs/seo/domeny-i-pomiar.md`.

**Odbiór:** HTTPS działa dla wariantów obu domen, przekierowania nie tworzą pętli, kontakt docelowy odpowiada 200, nieistniejący adres kończy się 404. Brak danych w Search Console zapisujemy jako brak danych, nie jako zerową widoczność.

Etap może toczyć się równolegle z przygotowaniem treści; DNS nie blokuje budowy podglądu.

## Etap 3. Struktura i teksty — 10 nowych podstron

**Wynik:** komplet konkretnych tekstów do nowej struktury. Najpierw konspekt każdej strony, potem pełna treść i metadane. Bez sztywnego celu liczby słów.

| Nowa strona | Co stworzyć | Układ |
|---|---|---|
| `/strony-internetowe-dla-firm/` | Odbiorca, korzyści, zakres, edycja treści, proces, zasady wyceny, 5–7 odpowiedzi | Szablon usługi |
| `/landing-page/` | Cel kampanii, jedna akcja klienta, zakres treści i pomiaru, przykłady, FAQ | Szablon usługi |
| `/modernizacja-stron/` | Kiedy przebudować, co zbadać, migracja treści i adresów, zakres, FAQ | Szablon usługi |
| `/opieka-nad-strona/` | Aktualizacje, wsparcie, rozwój, limity, czas reakcji, wyłączenia, FAQ | Szablon usługi |
| `/o-nas/` | Ludzie, sposób pracy, doświadczenie, relacja z firmą, oficjalne adresy | Układ informacyjny |
| `/cennik/` | Rzeczywiste zakresy/kwoty albo czytelne zasady indywidualnej wyceny, koszty cykliczne | Układ informacyjny |
| `/realizacje/` | Trzy projekty, krótki problem i zakres każdego, linki do opisów | Lista realizacji |
| `/realizacje/cakepops/` | Cel, udział NowaWeb, rozwiązanie, podglądy, potwierdzony efekt | Szablon realizacji |
| `/realizacje/new-york-rolls/` | Cel, udział NowaWeb, rozwiązanie, podglądy, potwierdzony efekt | Szablon realizacji |
| `/realizacje/atmo-vision/` | Cel, udział NowaWeb, rozwiązanie, podglądy, potwierdzony efekt | Szablon realizacji |

**Stała kolejność sekcji usługi:** okruszki nawigacji → nagłówek i opis odbiorcy → zakres → dopasowana realizacja → przebieg i zasady współpracy → wycena → FAQ → kontakt.

**Stała kolejność realizacji:** nazwa i krótki zakres → problem klienta → wykonane prace → rzeczywiste podglądy → wynik z metodą pomiaru lub opis dostarczonego rozwiązania → powiązana usługa → kontakt.

- [ ] Napisać teksty czterech usług, „O nas”, cennika, listy i trzech realizacji.
- [ ] Przygotować unikalne title, description i H1 dla każdej strony; główną traktować jako stronę marki i przegląd, usługowe jako szczegółowe oferty.
- [ ] Przygotować 6 pytań na główną: cena, termin, edycja, utrzymanie, przygotowanie pod SEO, kontakt po starcie. Dla usług dobrać 5–7 pytań specyficznych dla oferty.
- [ ] Powiązać każdą stronę z usługą/realizacją/kontaktem przez rzeczywiste linki; usunąć z wersji publikowanej szkielety bez danych.

Osobna strona FAQ nie jest potrzebna na start. One page i UX/copywriting opisać w istniejących zakresach, chyba że powstanie odrębna, pełna oferta.

**Odbiór:** każda strona ma własny cel, zakres i argumenty. Odpowiedzi nie obiecują niepotwierdzonych cen, terminów lub efektów SEO.

## Etap 4. Co zaprojektować i wygenerować

**Kierunek:** kontynuować papierowe tła, kolory i typografię NowaWeb. Nowe podstrony mają być czytelne i pasować do głównej. Najpierw przygotować podgląd jednej usługi i jednej realizacji na desktopie i telefonie; dopiero potem powielać układ.

| Materiał | Liczba | Sposób przygotowania |
|---|---:|---|
| Układ strony usługi | 1 | Projekt w HTML/CSS na bazie istniejącego stylu; wspólny dla czterech usług |
| Układ case study | 1 | Projekt w HTML/CSS; duże prawdziwe podglądy i krótkie opisy decyzji |
| Układ informacyjny oraz lista projektów | 2 | Wspólne nagłówki, odstępy i CTA z resztą serwisu |
| Grafiki usług | 4 | W pierwszej kolejności kadrowanie istniejących zasobów. Nowe ilustracje AI tylko gdy brakuje odpowiednich materiałów |
| Podglądy realizacji | 6–9 | Dla każdego projektu desktop, mobile i opcjonalnie detal; prawdziwe zrzuty ekranów, nie generowane projekty udające realizacje |
| Grafiki do udostępniania | 11 | Wspólny szablon 1200×630: główna + 10 nowych stron; logo, tytuł, ewentualnie prawdziwy podgląd |
| Logo do danych firmy | 1 zestaw | Użyć istniejącego znaku, przygotować poprawny plik do schema i warianty eksportu; bez wymiany logo marki |
| Zdjęcia osób | Według zespołu | Rzeczywiste zdjęcia dostarczone przez właściciela; sekcja może powstać bez zdjęć |

AI może przygotować propozycje tekstów, dekoracyjne ilustracje i warianty kompozycji. Nazwy, ceny, doświadczenie, opinie i wyniki pochodzą z rzeczywistych danych. Napisy, ceny i przyciski pozostają tekstem HTML, nie częścią wygenerowanej grafiki.

- [ ] Przygotować dwie reprezentatywne podstrony do oceny wyglądu.
- [ ] Wybrać i skadrować obecne ilustracje; dopiero po sprawdzeniu braków zlecić generowanie nowych.
- [ ] Przygotować zrzuty projektów i wspólny szablon OG.
- [ ] Wyeksportować responsywne obrazy z wymiarami, opisami alt dla treści i pustym alt dla dekoracji.

**Odbiór:** spójność z NowaWeb, czytelność na telefonie, brak obrazów udających prawdziwych klientów/realizacje, rozsądna waga plików.

## Etap 5. Zmiany obecnej strony i mapa plików

**Do zmiany na głównej:** bardziej konkretny opis usługi w pierwszym ekranie, czytelne opisy i linki kart, linki z karuzeli do realizacji, skrót informacji o firmie, krótsze porównanie z WordPressem, FAQ przed kontaktem. Obecne hasło można zachować jako element kompozycji. W kontakcie doprecyzować tożsamość marki i po uruchomieniu domeny opisać dodatkowy adres.

**Menu:** Usługi, Realizacje, O nas, Cennik, Kontakt. Usługi jako dostępna lista linków także na telefonie. Sekcję „Proces” zachować na głównej, bez obowiązku tworzenia kolejnej strony.

| Pliki | Operacja i odpowiedzialność |
|---|---|
| `src/pages/index.astro` | Zmiana głównej: treść, linkowanie, FAQ |
| `src/pages/kontakt.astro` | Uzupełnienie identyfikacji marki |
| `src/components/SiteHeader.astro`, `MobileNav.tsx` | Wspólna nowa nawigacja, obsługa klawiatury i menu mobilnego |
| `src/layouts/BaseLayout.astro` | Wspólny układ, stopka i przekazywanie metadanych |
| `src/components/SiteHead.astro`, `src/data/site.ts` | Spójna organizacja, poprawne logo, własne profile, nazwa serwisu, indywidualne metadane/OG |
| `src/components/PortfolioCarousel.tsx` | Linki do opisów; oddzielić zmianę slajdu od przejścia do projektu |
| `src/components/ComparisonReveal.tsx` | Skrócenie i uściślenie tekstów porównania |
| `src/components/Faq.astro` — nowy | Wspólny komponent pytań `details/summary`, przyjmuje listę pytań i odpowiedzi |
| `src/components/Breadcrumbs.astro` — nowy | Widoczna ścieżka nawigacji i zgodne z nią BreadcrumbList |
| `src/layouts/ServiceLayout.astro` — nowy | Układ usług z sekcjami treści przekazanymi przez stronę |
| `src/layouts/CaseStudyLayout.astro` — nowy | Układ opisów realizacji |
| `src/pages/strony-internetowe-dla-firm.astro`, `landing-page.astro`, `modernizacja-stron.astro`, `opieka-nad-strona.astro` — nowe | Cztery konkretne oferty |
| `src/pages/o-nas.astro`, `cennik.astro` — nowe | Informacje o marce i wycenie |
| `src/pages/realizacje/index.astro`, `cakepops.astro`, `new-york-rolls.astro`, `atmo-vision.astro` — nowe | Lista i trzy realizacje |
| `src/styles/global.css` | Style wspólnych sekcji; bez przebudowy niezwiązanych animacji |
| `public/assets/nowaweb/seo/` — nowy | Przygotowane grafiki i eksporty |
| `astro.config.mjs`, `public/robots.txt` | Sprawdzenie wynikowej mapy i zasad indeksacji; zmiana tylko jeśli potrzebna |
| `scripts/generate-og.mjs` | Rozszerzenie istniejącego generatora o zatwierdzone strony |

- [ ] Wdrożyć wspólne układy, FAQ i nawigację, następnie wstawić zatwierdzone teksty.
- [ ] Dodać właściwe canonical i unikalne metadane. Rozbudować już istniejące schema, nie powielać organizacji.
- [ ] Zachować istniejące kontakty, kotwice i obsługę formularzy. Nowe CTA kierować do działającego kontaktu.
- [ ] Sprawdzić czy rozwijanie kart, FAQ i menu nie wymaga nieoczywistego gestu oraz działa klawiaturą.

**Odbiór:** nowe strony można znaleźć z menu, usług i realizacji; żadna opublikowana karta nie prowadzi do niegotowej strony.

## Etap 6. Kontrola, podgląd i publikacja

W repozytorium strony uruchomić istniejące sprawdzenia po instalacji zależności z lockfile:

```powershell
npm ci
npm run build
node --test tests/seo-noninvasive-validation.test.mjs tests/security-hardening.test.mjs
npm run validate:portfolio
npm run audit:assets
```

To planowane komendy; ich wyniki nie zostały uzyskane w ramach tworzenia planu. Testy zależne od HTML uruchamiać po buildzie. Jeżeli istniejący test opiera się na celowo zmienionej treści/strukturze, zaktualizować go pod nowe wymaganie, zachowując sprawdzenie rzeczywistego zachowania.

- [ ] Sprawdzić wynikową sitemapę: przy pełnym zakresie 15 stron indeksowalnych (obecne 5 + nowe 10), bez podziękowania i 404. Przy mniejszej publikacji oczekiwać wyłącznie stron gotowych.
- [ ] Sprawdzić adresy, canonical, title, description, H1, dane strukturalne i linki na wszystkich nowych stronach. Wykryć duplikaty metadanych i linki do nieistniejących celów.
- [ ] Przejść główną, ofertę, realizację i kontakt na telefonie oraz desktopie, przetestować klawiaturę, formularz w środowisku testowym i ograniczenie ruchu.
- [ ] Zmierzyć wydajność głównej i reprezentatywnej usługi; poprawiać stwierdzone problemy, zachować wyniki przed/po.
- [ ] Przygotować podgląd do przeglądu; chronić wersję roboczą przed indeksacją. Sprawdzić osobno, że blokada nie przechodzi na produkcję.
- [ ] Przed publikacją zapisać identyfikator obecnego wdrożenia Netlify i sposób powrotu. Zachować stare adresy, a celowo zmienione mapować na właściwe następne strony.
- [ ] Po publikacji sprawdzić produkcyjne HTTP, domeny, formularz, sitemapę i robots. Testowa wiadomość nie może udawać zapytania od prawdziwego klienta.
- [ ] W Search Console przesłać sitemapę i sprawdzić najważniejsze URL. Zapisać datę publikacji do porównywania wyników.

**Odbiór:** komplet gotowych treści, brak przypadkowego noindex, działający kontakt, poprawne przekierowania, brak regresji kluczowych funkcji.

## Etap 7. Po publikacji

- [ ] Uzupełnić własne profile rzeczywistymi danymi, identyczną nazwą i adresem głównym; przygotować teksty do publikacji.
- [ ] Przygotować krótką wiadomość z prośbą o referencję dla dotychczasowych klientów. Wysłanie jest osobnym działaniem wymagającym zlecenia właściciela.
- [ ] Po około 28 dniach porównać zapytania o markę i usługi, indeksację oraz wejścia na nowe podstrony. Małą próbkę opisać, nie wyciągać z niej pewnych wniosków.
- [ ] Na podstawie pytań klientów wybrać trzy pierwsze poradniki: wybór rodzaju strony, przygotowanie materiałów, utrzymanie po wdrożeniu. Każdy powiązać z konkretną ofertą i sprawdzić, czy nie powtarza cennika lub FAQ.

Nie planujemy na start masowej publikacji artykułów ani automatycznych zgłoszeń konkurencji. Celem jest rozpoznawalność własnej marki i pozyskiwanie wartościowych zapytań.

## Harmonogram i pierwszy pakiet

| Okres orientacyjny | Wynik |
|---|---|
| Dni 1–2 | Fakty, struktura, konfiguracja domen i punkt wyjścia w Search Console, jeśli są dostępy |
| Dni 3–5 | Teksty pierwszych usług, głównej i FAQ; podgląd szablonu usługi oraz realizacji |
| Dni 6–10 | Pozostałe podstrony, materiały, nawigacja i metadane |
| Dni 11–15 | Kontrola, poprawki, podgląd całości i publikacja gotowego zakresu |
| Po publikacji | Wzmianki, referencje i poprawki na podstawie danych |

To kolejność i szacunek kalendarzowy przy dostępnych materiałach, a nie gwarancja terminu lub wzrostu pozycji. W pierwszej publikacji można uruchomić główną, FAQ i gotowe oferty, a case studies dołączyć po potwierdzeniu danych. Nie publikować pustych stron i nie linkować do nich wcześniej.

**Najbliższy konkretny rezultat:** dokument faktów i oferty, gotowy tekst głównej oraz pierwszej usługi, sześć odpowiedzi FAQ i podgląd dwóch szablonów. Następnie powstają pozostałe treści według tego samego standardu.
