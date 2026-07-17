# Animowana sekwencja hero — projekt

## Cel

Wzmocnić pierwsze wrażenie sekcji hero przez skoordynowane wejście typografii i przycisków, zachowując profesjonalny, czytelny charakter strony NowaWeb. Animacja ma prowadzić wzrok od podpisu marki, przez główne hasło, do dwóch działań, bez konkurowania z kompozycją produktową po prawej stronie.

## Zakres

Zmiana obejmuje wyłącznie lewą część sekcji hero:

- podpis „NowaWeb - strony internetowe”;
- nagłówek „Profesjonalny design nie jest luksusem”;
- tekst wprowadzający;
- przyciski „Umów konsultację” i „Zobacz realizacje”.

Istniejąca scena produktowa hero, jej animacje oraz efekt pisania pod mapą pozostają bez zmian.

## Choreografia otwarcia

Sekwencja uruchamia się automatycznie tylko raz po załadowaniu strony i trwa około 1,8 sekundy.

1. Po krótkim opóźnieniu podpis marki zaczyna być pisany litera po literze. Obok tekstu widoczny jest niebieski, migający kursor nawiązujący do istniejącego efektu pod mapą.
2. Podczas pisania podpisu kolejne, kontrolowane wiersze nagłówka odsłaniają się spod pionowej maski. Każdy wiersz przesuwa się lekko z dołu, przechodząc równocześnie od delikatnego rozmycia do pełnej ostrości.
3. Wiersze startują w odstępach około 160–200 ms. Fraza „nie jest” zachowuje kursywę i pomarańczowy akcent.
4. Po wejściu ostatniego wiersza pojawia się opis, a następnie oba przyciski z niewielkim przesunięciem czasowym między nimi.
5. Po zakończeniu pisania kursor mruga trzy razy i wygasa; tekst nie jest kasowany ani zapętlany.

Treść pozostaje obecna w HTML od początku, aby zachować semantykę, indeksowanie i dostępność. Warstwa animacyjna nie może powodować przesunięć układu.

## Mikrointerakcje przycisków

### „Umów konsultację”

Przycisk główny zachowuje niebieskie wypełnienie. Przy najechaniu unosi się o kilka pikseli, przez powierzchnię przechodzi krótki świetlny refleks, a strzałka przesuwa się w prawo i wraca do stabilnej pozycji. Kliknięcie wywołuje krótki efekt dociśnięcia.

### „Zobacz realizacje”

Przycisk obrysowy otrzymuje przy najechaniu niebieskie wypełnienie przesuwające się od lewej do prawej. Tekst i ikona przechodzą na kolor biały, a strzałka wykonuje subtelny ruch po łuku. Kliknięcie używa tego samego, krótkiego efektu dociśnięcia.

Obie interakcje mają działać także przy fokusie klawiatury (`:focus-visible`) i nie mogą zmieniać wymiarów przycisków.

## Responsywność i dostępność

- Na małych ekranach podział nagłówka zostanie dopasowany tak, aby żaden wiersz nie wychodził poza viewport.
- Sekwencja zachowa tę samą kolejność na desktopie i mobile, lecz odległości ruchu będą mniejsze na telefonach.
- Podpis marki pozostanie dostępny dla czytników ekranu jako pełna fraza; animowane litery będą ukryte przed technologiami asystującymi.
- Przy włączonym `prefers-reduced-motion: reduce` pełna treść będzie widoczna natychmiast, bez pisania, masek, przesunięć i dekoracyjnych ruchów przycisków.
- Linki, ich etykiety i cele pozostają bez zmian.

## Implementacja

Animacja podpisu zostanie zamknięta w małym komponencie React ładowanym wraz z hero. Pozostała choreografia i mikrointerakcje będą realizowane głównie w CSS przez klasy i zmienne opóźnień. Dzięki temu JavaScript odpowiada jedynie za efekt pisania, a układ i animacje wejścia pozostają lekkie.

Zmiany będą punktowe i zachowają obecne, niezacommitowane modyfikacje projektu. Nie przewiduje się nowych zależności.

## Weryfikacja

Wdrożenie jest poprawne, jeśli:

- podpis wpisuje się jednokrotnie i kończy pełnym tekstem;
- nagłówek pojawia się wyraźnie wiersz po wierszu bez skoku układu;
- opis i przyciski zachowują ustaloną kolejność wejścia;
- oba przyciski mają różne, działające reakcje na hover, fokus i kliknięcie;
- na szerokości desktopowej i mobilnej tekst nie jest obcięty ani przepełniony;
- nawigacja do `#kontakt` i `#projekty` nadal działa;
- wariant ograniczonego ruchu pokazuje pełną treść bez animacji;
- projekt przechodzi komendę `npm run build`.
