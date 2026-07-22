# Redesign sekcji „Realizacje”: warstwowa karuzela ze szkłem

**Data:** 2026-07-22
**Status:** zatwierdzony kierunek wizualny, gotowy do planowania implementacji

## Kontekst

Obecna sekcja prezentuje trzy fikcyjne realizacje w pionowych, nakładających się kartach. Układ nie odpowiada proporcjom nowych materiałów, ponieważ wszystkie trzy dostarczone screenshoty są poziome i pokazują pełny pierwszy ekran strony. Sekcja ma zostać zastąpiona trzema prawdziwymi realizacjami:

1. Cakepops.pl
2. New York Rolls
3. Atmo‑Vision

Nowy układ ma eksponować pełne screenshoty, zachować warsztatowy charakter NowaWeb i jednocześnie wprowadzić czystsze, Apple‑inspirowane detale oraz webowy efekt szkła.

## Decyzja projektowa

Sekcja przyjmie formę warstwowej karuzeli z jedną dużą kartą na środku oraz dwiema kartami po bokach, częściowo schowanymi za aktywną realizacją.

- Aktywna karta jest największa, ostra i ma pełny kontrast.
- Karty boczne pozostają w pełnym kolorze.
- Wrażenie odsunięcia uzyskujemy przez skalę, pozycję, głębię i lekką taflę szkła, a nie szare przyciemnienie.
- Kliknięcie widocznej części bocznej karty płynnie przesuwa ją na środek.
- Screenshot w każdej karcie jest zawsze widoczny w całości i nie jest kadrowany.

## Cele

- Pokazać wszystkie trzy prawdziwe realizacje w jednym, rozpoznawalnym komponencie.
- Zapewnić największą możliwą czytelność aktywnego screenshotu.
- Zostawić wystarczająco dużo bocznej karty, aby użytkownik od razu rozumiał mechanikę karuzeli.
- Zachować kolory każdej realizacji także w kartach nieaktywnych.
- Zapewnić płynne, spokojne przejścia bez automatycznego przewijania.
- Obsłużyć mysz, dotyk, klawiaturę i ograniczenie animacji przez system.

## Poza zakresem

- Osobne podstrony case study.
- Automatyczne przewijanie karuzeli.
- Pobieranie zawartości stron klientów w czasie rzeczywistym.
- Zmiana globalnego systemu wizualnego pozostałych sekcji.
- Wymyślanie wyników biznesowych, statystyk lub opinii, których użytkownik nie dostarczył.

## Struktura sekcji

### Nagłówek

Nagłówek jest wyśrodkowany nad karuzelą i składa się z:

- etykiety „Wybrane realizacje”,
- tytułu „Trzy marki. Każda z własnym charakterem.”,
- krótkiego zdania wyjaśniającego, że projekty są różnymi odpowiedziami na potrzeby marek.

Typografia pozostaje zgodna z istniejącą stroną NowaWeb. Apple‑inspirowane cechy dotyczą rytmu, przestrzeni, szkła, promieni i jakości ruchu, a nie kopiowania obcego brandingu.

### Scena karuzeli

Scena zawiera dokładnie trzy karty pozycjonowane we wspólnej przestrzeni:

- `left`: karta po lewej, około 80% skali, wsunięta częściowo za środek,
- `center`: karta aktywna, 100% skali i najwyższy poziom głębi,
- `right`: karta po prawej, około 80% skali, wsunięta częściowo za środek.

Na szerokim ekranie aktywna karta zajmuje około 60–64% szerokości sceny, z limitem około 840–860 px. Boczne karty muszą pokazywać wystarczająco duży fragment obrazu i kontrolkę kierunku, aby były jednoznacznie klikalne.

### Budowa karty

Każda karta zawiera:

1. subtelny pasek przeglądarki z domeną,
2. pełny screenshot umieszczony w obszarze o proporcji około `1.82 / 1`,
3. dolny pasek z numerem, nazwą i kategorią realizacji,
4. opcjonalny link zewnętrzny, renderowany wyłącznie wtedy, gdy projekt ma potwierdzony adres URL.

Screenshot wykorzystuje `object-fit: contain`; nie wolno go przycinać przez `cover`.

## Dane i obrazy

Komponent korzysta z jednej tablicy danych zawierającej dla każdego projektu:

- `name`,
- `domain`,
- `category`,
- `image`,
- opcjonalne `url`,
- pełny tekst alternatywny.

Dostarczone obrazy zostaną skopiowane do katalogu publicznych assetów pod stabilnymi nazwami:

- `cakepops.png`,
- `new-york-rolls.png`,
- `atmo-vision.png`.

Brak potwierdzonego `url` nie tworzy martwego przycisku: link zewnętrzny nie jest wtedy renderowany. Sama karta nadal uczestniczy w karuzeli i pokazuje realizację.

## Efekt szkła

Efekt kart bocznych ma sugerować, że znajdują się za taflą szkła, ale nie może utrudniać rozpoznania strony.

- Brak `grayscale`, ciemnego filtra i redukcji nasycenia.
- Rozmycie warstwy szkła ograniczone do około 2–3 px.
- Bardzo jasne, półprzezroczyste tło warstwy.
- Delikatny refleks przesuwający się przy najechaniu.
- Jasna wewnętrzna krawędź i miękki cień dla odczucia głębi.
- Aktywna karta nie ma mlecznej warstwy nad screenshotem.

Jest to webowa interpretacja szkła z użyciem `backdrop-filter`, a nie oficjalna implementacja materiału Apple. Bez wsparcia `backdrop-filter` pozostają jasna krawędź i przezroczysty refleks.

## Interakcje i animacja

### Nawigacja

Użytkownik może zmienić aktywny projekt przez:

- kliknięcie lewej lub prawej karty,
- przyciski poprzedni/następny,
- przeciągnięcie kursorem,
- swipe na ekranie dotykowym,
- klawisze strzałek, gdy scena ma fokus.

Karuzela działa w zamkniętej pętli trzech elementów. Nie ma autoplay.

### Ruch

- Ruch opiera się na animowaniu `transform`, nie właściwości powodujących kosztowny reflow.
- Czas przejścia wynosi około 700–850 ms.
- Krzywa ma spokojny, sprężynowy charakter, z szybkim początkiem i długim wyhamowaniem.
- Jednocześnie zmieniają się przesunięcie, skala, głębia, cień i widoczność tafli szkła.
- Kliknięcie podczas przejścia nie może pozostawić kart w stanie pośrednim.
- Gest przesunięcia aktywuje zmianę dopiero po przekroczeniu progu około 45–50 px.

Przy `prefers-reduced-motion: reduce` zmiana pozostaje natychmiastowa lub używa bardzo krótkiego przenikania bez przestrzennego przesuwania.

## Responsywność

### Desktop

- Aktywna karta: około 60–64% szerokości sceny, maksymalnie około 860 px.
- Boczne karty: około 80% skali.
- Widoczne fragmenty kart bocznych zawierają część screenshotu oraz kontrolkę kierunku.

### Tablet

- Aktywna karta: około 82% szerokości viewportu.
- Boczne karty są bardziej odsunięte, ale nadal widoczne.
- Sterowanie kliknięciem, gestem i przyciskami pozostaje dostępne.

### Telefon

- Aktywna karta: około 86–88% szerokości viewportu.
- Boczne karty wystają po obu stronach jako czytelne podpowiedzi następnego elementu.
- Drugorzędny opis kategorii może zostać ukryty, lecz nazwa i numer pozostają widoczne.
- Swipe jest podstawowym gestem, a przyciski nadal zapewniają alternatywę.

## Dostępność

- Sekcja ma nazwę przez `aria-labelledby`.
- Przyciski poprzedni/następny są prawdziwymi elementami `button` z jednoznacznymi etykietami.
- Boczne kontrolki są dostępne jako przyciski, a nie wyłącznie jako kliknięcie kontenera.
- Aktywna realizacja jest komunikowana przez stan komponentu i czytelny licznik lub wskaźnik.
- Każdy screenshot ma opis alternatywny zawierający nazwę projektu.
- Fokus klawiatury jest widoczny na wszystkich kontrolkach.
- Link zewnętrzny ma nazwę „Otwórz stronę [nazwa]” i informuje o otwarciu nowej karty, jeżeli używa `target="_blank"`.
- Animacja respektuje `prefers-reduced-motion`.

## Architektura komponentu

Istniejący `PortfolioCarousel.tsx` zostanie przebudowany, ale pozostanie odizolowaną wyspą React ładowaną przez Astro.

Komponent będzie odpowiedzialny za:

- tablicę trzech projektów,
- indeks aktywnej realizacji,
- wyliczenie pozycji `left`, `center`, `right`,
- obsługę przycisków, kliknięć, gestu i klawiatury,
- ustawienie klas lub atrybutów `data-position`.

CSS sekcji pozostanie w istniejącym `global.css`, zgodnie z obecną strukturą projektu. Nie dodajemy nowej biblioteki animacji do tej sekcji; płynne przejścia realizuje CSS, a React zmienia jedynie stan pozycji.

## Wydajność i stabilność

- Obrazy kart bocznych są ładowane leniwie, ale aktywny obraz może mieć wyższy priorytet po wejściu sekcji w viewport.
- Wszystkie trzy obrazy mają jawne proporcje, aby uniknąć CLS.
- Animowane są głównie `transform` i `opacity` warstw dekoracyjnych.
- Nasłuchiwanie gestu jest ograniczone do sceny i czyszczone wraz z komponentem.
- Brak globalnego nasłuchiwania zdarzenia `scroll`.
- Warstwa szkła ma czytelny fallback bez `backdrop-filter`.

## Walidacja

Implementacja wymaga:

1. zbudowania projektu przez `npm run build`,
2. testu desktopowego karuzeli: kliknięcie obu boków i obu strzałek,
3. testu gestu przeciągnięcia i swipe,
4. testu klawiatury i widocznego fokusu,
5. sprawdzenia `prefers-reduced-motion`,
6. screenshotów desktop i mobile,
7. sprawdzenia, że żaden z trzech screenshotów nie jest przycięty,
8. sprawdzenia, że boczne karty zachowują pełne kolory pod lekką taflą szkła.

## Kryteria akceptacji

- Sekcja pokazuje Cakepops.pl, New York Rolls i Atmo‑Vision z dostarczonych plików.
- Jedna karta jest duża i centralna; dwie pozostałe są częściowo za nią.
- Boczne realizacje są czytelne i pełnokolorowe.
- Tafla szkła jest subtelna i nie ukrywa screenshotu.
- Kliknięcie bocznej karty płynnie przenosi ją na środek.
- Działają przyciski, drag/swipe oraz klawiatura.
- Karuzela nie przewija się automatycznie.
- Screenshoty są pokazane w całości na desktopie i urządzeniach mobilnych.
- Tryb ograniczonego ruchu usuwa przestrzenną animację.
- Projekt buduje się bez błędów i nie powoduje regresji sąsiednich sekcji.
