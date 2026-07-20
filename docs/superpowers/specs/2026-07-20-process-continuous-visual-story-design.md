# Ciągła historia wewnątrz kart procesu — projekt

## Cel

Zastąpić generyczne ilustracje z linii i prostokątów wewnątrz czterech istniejących kart sekcji „Proces” małymi scenami, które razem opowiadają jedną historię: od pierwszej wiadomości klienta do opublikowanej strony i dalszego wsparcia.

## Zakres

Zmiana obejmuje wyłącznie panele wizualne po prawej stronie istniejących kart. Zachowujemy bez zmian:

- układ i wymiary kart,
- tytuły, opisy oraz ikony po lewej stronie,
- mechanikę stosu kart, sticky scroll i nawigację etapów,
- paletę strony, promienie narożników i ogólny charakter sekcji,
- kolejność i treść pozostałych sekcji strony.

Nie dodajemy obrazów rastrowych ani nowej biblioteki. Sceny powstaną z semantycznego HTML, CSS oraz istniejącego GSAP.

## Zasada ciągłości

Każdy etap jest osobną sceną, ale jego końcowa klatka odpowiada początkowej klatce kolejnej sceny. Nie wykonujemy bezpośredniego morphingu pomiędzy dwiema kartami, ponieważ przy szybkim przewijaniu byłby niestabilny. Powtarzamy natomiast kluczowe kształty, pozycje i kolory, dzięki czemu zmiana aktywnej karty wygląda jak następne ujęcie tego samego filmu.

Wspólnym motywem jest niebieski dokument projektu. Zaczyna jako wiadomość klienta, zmienia się w punkty briefu, następnie w mapę i makietę, potem w gotową stronę, a na końcu trafia do okna przeglądarki.

## Storyboard

### 1. Rozmowa i brief

1. Pojawia się jasnoniebieski dymek klienta po lewej stronie z tekstem: „Potrzebuję strony, która nie znudzi ciekawskich.”
2. Po prawej pojawia się wskaźnik pisania z trzema animowanymi kropkami.
3. Wskaźnik zmienia się w pomarańczowy dymek NowaWeb: „Nowa strona już się robi.”
4. Dymki delikatnie przesuwają się do góry, a poniżej pojawiają się trzy zwięzłe punkty briefu: „Cel”, „Odbiorcy”, „Treści”.
5. Scena zatrzymuje się na punktach briefu. Nie zapętla się automatycznie.

### 2. Strategia i makieta

1. Scena zaczyna się od trzech punktów „Cel”, „Odbiorcy”, „Treści” w tych samych pozycjach, w których zakończył się etap pierwszy.
2. Punkty układają się w prostą mapę informacji: „Start”, „Oferta”, „Realizacje”, „Kontakt”.
3. Pomarańczowa linia wskazuje główną ścieżkę użytkownika od „Start” do „Kontakt”.
4. Mapa spłaszcza się do makiety strony: pasek nawigacji, blok hero, sekcja treści oraz CTA.
5. Scena zatrzymuje się na kompletnej, monochromatycznej makiecie.

### 3. Design i wdrożenie

1. Scena zaczyna się od makiety identycznej z finałem etapu drugiego.
2. Niebieski akcent wypełnia nawigację i główny przycisk, a pomarańczowy akcent zaznacza detal interakcji.
3. Szare pola zmieniają się w nagłówek, treść i miniaturę obrazu, pokazując przejście od wireframe'u do projektu.
4. Kursor dopasowuje ostatni element, po czym pojawiają się krótkie linie kodu i znacznik poprawnego wdrożenia.
5. Scena zatrzymuje się na gotowym widoku strony bez technicznego przeładowania detalami.

### 4. Start i wsparcie

1. Gotowy widok strony z etapu trzeciego znajduje się w uproszczonej ramce przeglądarki.
2. Pasek publikacji dochodzi od 0 do 100 procent.
3. Status zmienia się na „ONLINE”, a przy adresie pojawia się zielony znacznik dostępności.
4. Po krótkiej pauzie pojawia się subtelna wiadomość NowaWeb: „Jesteśmy obok.”
5. Delikatny pojedynczy puls sygnalizuje dalsze wsparcie. Scena pozostaje na stabilnej klatce końcowej.

## Ruch i sterowanie

- Sekwencja aktywnej karty odtwarza się jeden raz i zatrzymuje na końcowej klatce.
- Zmiana aktywnego etapu zatrzymuje poprzednią sekwencję oraz uruchamia nową od początku.
- Powrót do wcześniejszego etapu ponownie odtwarza jego scenę.
- Pierwsza scena nie startuje podczas ładowania strony poza ekranem. Uruchamia się dopiero, gdy sekcja procesu osiągnie aktywny obszar sticky.
- Czas pojedynczej sceny wynosi około 4,5–5,5 sekundy. Najważniejsze informacje pojawiają się w pierwszych 3 sekundach.
- Ruch opiera się na opacity, transform i zmianach skali. Nie animujemy właściwości powodujących kosztowne przeliczenia układu.
- Animacje są spokojne, z krótkimi pauzami między zdarzeniami. Nie używamy konfetti, ciągłego pulsowania ani nieskończonych pętli.

## Struktura komponentu

Istniejący `ProcessVisual` pozostaje punktem wejścia i otrzymuje stan aktywności. Każdy indeks renderuje osobną, małą scenę:

- rozmowa i punkty briefu,
- mapa informacji i makieta,
- przejście od wireframe'u do projektu,
- publikacja i wsparcie.

Znaczniki scen będą dekoracyjne i ukryte przed czytnikami ekranu, ponieważ tytuły i opisy kart już przekazują znaczenie etapów. Widoczny tekst w animacjach pozostanie prawdziwym tekstem HTML, nie obrazem.

Sterowanie odtwarzaniem zostanie dołączone do istniejącego stanu aktywnej karty oraz aktualnego ScrollTriggera. Animacje wewnętrzne będą odizolowane od scrubowanej transformacji całych kart, aby oba poziomy ruchu nie nadpisywały swoich stylów.

## Responsywność i ograniczony ruch

- Desktop: aktywna scena odtwarza pełną sekwencję i zatrzymuje się na finale.
- Tablet: zachowujemy pełną historię, lecz zmniejszamy przesunięcia i rozmiary tekstu.
- Mobile: zachowujemy istniejący pionowy układ kart, a panele pokazują czytelne klatki końcowe. Nie uruchamiamy czterech filmów jednocześnie poza ekranem.
- `prefers-reduced-motion: reduce`: każda scena pokazuje statyczną klatkę końcową bez wskaźnika pisania, pulsowania i przejść.
- Tekst rozmowy może zawijać się, ale nie może wyjść poza dymek ani zostać obcięty przy szerokości 390 px.

## Stany brzegowe

- Szybkie przewinięcie może pominąć część animacji, ale nowa karta zawsze zaczyna od kompletnej i zrozumiałej klatki początkowej.
- Wielokrotna zmiana kierunku scrollowania nie może pozostawić dwóch uruchomionych scen.
- Kliknięcie etapu na osi nadal przewija do właściwej karty i uruchamia odpowiednią scenę.
- Brak JavaScriptu pozostawia statyczne klatki końcowe, więc wszystkie wizualizacje są nadal czytelne.

## Kryteria akceptacji

- Zmienione są wyłącznie wnętrza czterech paneli wizualnych oraz kod bezpośrednio sterujący ich odtwarzaniem.
- Pierwsza karta pokazuje pełną rozmowę z prawdziwym tekstem, wskaźnikiem pisania i odpowiedzią.
- Każdy kolejny etap zaczyna się motywem odpowiadającym finałowi poprzedniego etapu.
- Na desktopie tylko aktywna scena jest odtwarzana, bez ciągłych pętli.
- Na mobile przy 390 px nie występuje poziomy scroll, obcięty tekst ani nakładanie scen na treść karty.
- Tryb ograniczonego ruchu pokazuje kompletne statyczne klatki.
- Istniejąca mechanika scrollowania, nawigacji i stosu kart nie ulega regresji.
- `npm run validate:process`, `npm run verify:process` oraz `npm run build` kończą się powodzeniem.
- Widoki desktop 1440 px i mobile 390 px są sprawdzone wizualnie.

## Weryfikacja

1. Rozszerzyć statyczny walidator o prawdziwe teksty rozmowy, cztery sceny i brak starych atrap z kreskami.
2. Rozszerzyć test przeglądarkowy o start, zatrzymanie i ponowne odtworzenie aktywnej sceny.
3. Sprawdzić szybkie przewijanie w obu kierunkach oraz nawigację kliknięciem i klawiaturą.
4. Sprawdzić statyczne klatki w trybie ograniczonego ruchu.
5. Zbudować stronę produkcyjnie i wykonać zrzuty sekcji w szerokościach 1440 px oraz 390 px.
