# Pojedynek kierunków w etapie strategii — projekt

## Cel

Zastąpić obecną prostą mapę informacji w drugim etapie sekcji „Proces” krótką historią o porównaniu dwóch kierunków kreatywnych. Scena ma pokazać, że strategia prowadzi do świadomego wyboru, a nie do przypadkowego projektu, i zapewnić efekt „wow” podobny do sekwencji wiadomości w pierwszym etapie.

## Zakres

Zmiana obejmuje wyłącznie prawy panel wizualny drugiej karty oraz testy bezpośrednio opisujące tę scenę. Bez zmian pozostają:

- tytuł, opis i ikona drugiej karty,
- układ kart, sticky scroll i nawigacja etapów,
- rozmowa w etapie pierwszym,
- sceny designu, wdrożenia, publikacji i wsparcia,
- końcowa monochromatyczna makieta przekazywana do etapu trzeciego.

Scena zostanie zbudowana z HTML i CSS. Nie dodajemy obrazów ani nowych bibliotek.

## Storyboard i timing

Cała sekwencja trwa około 4,8 sekundy i zatrzymuje się na finalnej makiecie.

1. **0–450 ms — wejście briefu.** Z lewej strony pojawia się niebieska etykieta „Cel: zaciekawić”. Jej kolor i zaokrąglenie nawiązują do wiadomości klienta z pierwszego etapu.
2. **550–1050 ms — dwa kierunki.** Etykieta przesuwa się ku górze, a poniżej rozsuwają się dwie małe karty oznaczone „A” i „B”. Każda pokazuje inny uproszczony układ pierwszego ekranu strony.
3. **1150–2250 ms — ocena.** Pomarańczowy wskaźnik uwagi przechodzi od A do B. Kolejno pojawiają się trzy krótkie kryteria: „Uwaga”, „Czytelność”, „Decyzja”. Przy każdym kryterium pasek wariantu B rośnie wyżej niż pasek A.
4. **2350–3000 ms — rozstrzygnięcie.** Wariant A traci nasycenie, lekko się zmniejsza i odsuwa. Wariant B pozostaje ostry i przesuwa się do centrum.
5. **3100–3500 ms — wybór.** Na wariancie B pojawia się pomarańczowa pieczątka „Wybrany kierunek”. Pieczątka wykonuje pojedyncze, sprężyste wejście bez ciągłego pulsowania.
6. **3600–4800 ms — przekazanie do designu.** Kryteria oraz etykiety znikają. Wariant B powiększa się i zmienia w pełną monochromatyczną makietę identyczną z klatką początkową etapu trzeciego.

## Wygląd

Panel zachowuje papierowe tło, granatowy tekst, niebieskie linie i pomarańczowe akcenty istniejącej sekcji. Warianty A i B mają wyraźnie różne kompozycje, ale pozostają abstrakcyjnymi makietami, aby nie sugerować dwóch gotowych stron.

- Wariant A: centralny nagłówek i symetryczne bloki — poprawny, lecz zachowawczy.
- Wariant B: mocniejsza hierarchia, asymetryczny nagłówek i wyraźne CTA — odważniejszy kierunek zgodny z celem „zaciekawić”.
- Wyniki nie używają procentów. Różnica jest komunikowana długością prostych pasków, dzięki czemu scena nie udaje rzeczywistych danych analitycznych.
- Końcowa makieta wykorzystuje istniejący `story-page-shell--wireframe`, zapewniając ciągłość z etapem trzecim.

## Ruch i sterowanie

Sekwencja uruchamia się tylko wtedy, gdy druga karta jest aktywna i sekcja procesu znajduje się w obszarze odtwarzania. Zmiana etapu zatrzymuje animację. Powrót do etapu drugiego odtwarza pojedynek od początku.

Ruch wykorzystuje wyłącznie `opacity`, `transform` i skalę. Animowane paski wyników używają transformacji `scaleX`, nie zmiany szerokości. Niewidoczne elementy nie mogą pozostawiać aktywnych animacji po przejściu do kolejnego etapu.

## Responsywność i ograniczony ruch

- Desktop i tablet: warianty A oraz B są ustawione obok siebie.
- Mobile 390 px: warianty pozostają obok siebie w mniejszej skali; tekst ogranicza się do krótkich etykiet, a panel nie może przewijać się poziomo ani pionowo.
- `prefers-reduced-motion: reduce`: panel pokazuje od razu wariant B z pieczątką oraz finalną makietę, bez przesuwania wskaźnika, skalowania i animowania pasków.
- Brak JavaScriptu: widoczna jest kompletna makieta końcowa, zgodna z początkiem etapu trzeciego.

## Struktura sceny

Druga gałąź `ProcessVisual` zachowuje `data-process-scene="strategy"` i otrzymuje trzy wewnętrzne warstwy:

1. wejściową etykietę briefu,
2. obszar porównania z wariantami, kryteriami i pieczątką,
3. istniejącą końcową makietę `story-page-shell--wireframe`.

Każda warstwa ma osobny selektor, aby testy mogły sprawdzić klatki pośrednie bez zależności od kolejności anonimowych elementów.

## Weryfikacja

- Walidator źródłowy sprawdza dokładne teksty „Cel: zaciekawić”, „Uwaga”, „Czytelność”, „Decyzja” i „Wybrany kierunek”.
- Test przeglądarkowy sprawdza, że podczas aktywnej sceny widoczne są dwa warianty, B wygrywa, a finałem jest pełna makieta.
- Test odtwarzania potwierdza ponowny start po powrocie do etapu drugiego oraz brak animacji tej sceny po przejściu dalej.
- Test mobile potwierdza brak poziomego i pionowego przepełnienia przy szerokości 390 px.
- Test reduced motion potwierdza brak aktywnych animacji i obecność kompletnej klatki końcowej.
- `npm run validate:process`, `npm run verify:process` oraz `npm run build` muszą zakończyć się powodzeniem.

## Kryteria akceptacji

- Drugi etap opowiada czytelną historię: brief → porównanie → ocena → wybór → makieta.
- Wariant B jest jednoznacznym zwycięzcą, ale scena nie udaje prawdziwego testu statystycznego.
- Najważniejszy tekst pozostaje czytelny przy szerokości 390 px.
- Finalna klatka odpowiada początkowi etapu trzeciego.
- Pozostałe etapy i mechanika sekcji procesu nie ulegają zmianie.
