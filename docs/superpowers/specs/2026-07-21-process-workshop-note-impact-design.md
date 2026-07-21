# Warsztat strategii: uderzane karteczki

## Cel

Zastąpić zwykłe pojawianie się karteczek ruchem przypominającym szybkie przyklejenie ich do stołu lub tablicy. Każda kartka ma wyraźny moment kontaktu, krótkie odbicie oraz własny lekki kąt końcowy.

Ta specyfikacja zmienia wyłącznie sposób wejścia karteczek. Zachowuje duże okno, duże kartki, obecną kolejność, wolne tempo i trwały finał tablicy.

## Wybrany ruch: stempel

Każda karteczka przechodzi przez cztery fazy:

1. Przygotowanie — kartka jest niewidoczna, około 14 px nad miejscem docelowym, powiększona do `1.16` i obrócona nieco mocniej niż w finale.
2. Kontakt — szybko opada, spłaszcza się w pionie do około `0.93`, rozszerza w poziomie do około `1.04`, a cień staje się krótki i mocny.
3. Odbicie — wraca do około `1.035`, unosi się o 1–2 px i odzyskuje miękki cień.
4. Osadzenie — kończy w skali `1`, bez przesunięcia, z własnym lekkim obrotem.

Pełne uderzenie jednej kartki trwa około 850–950 ms. Dotychczasowe odstępy między kartkami pozostają bez zmian, dzięki czemu cała opowieść nadal rozwija się powoli.

## Końcowe kąty

Kąty są z góry ustalone, aby wyglądały losowo, ale nie zmieniały się między renderami i nie powodowały drgania układu:

- „Zaciekawić”: `-2.2deg`;
- „Pokazać efekt”: `1.4deg`;
- „Prosta historia”: `2.1deg`;
- „Mocny nagłówek”: `-1.3deg`;
- „Jeden kierunek”: `-1.8deg`;
- „Jasne CTA”: `1.9deg`.

## Cień i kontakt

W trakcie kontaktu cień zmienia się z rozmytego, unoszącego kartkę na krótki cień bezpośrednio pod nią. Po osadzeniu każda kartka zachowuje obecny miękki cień. Efekt nie używa filtra CSS; animowane są `transform`, `opacity` oraz `box-shadow`.

## Ograniczony ruch

W `prefers-reduced-motion: reduce` nie ma opadania z 14 px. Kartka:

- pojawia się w miejscu docelowym;
- przechodzi przez krótkie spłaszczenie `scale(1.03, 0.96)`;
- lekko odbija do `scale(1.015)`;
- osiada pod przypisanym kątem.

Timing i kolejność pozostają takie jak w aktualnej pięciosekundowej sekwencji. Efekt jest widoczny w obecnej przeglądarce, ale nie zawiera dużego przesunięcia.

## Stan końcowy

Po zakończeniu wszystkie sześć karteczek pozostaje widocznych i lekko obróconych. Tablica oraz obrys „kierunek wybrany” pozostają bez zmian. Nie powraca żadna warstwa makiety.

## Implementacja

Każda kartka otrzyma zmienną CSS `--note-rest-r`. Istniejący `@keyframes workshop-note-in` zostanie zastąpiony animacją uderzenia, która kończy się na `rotate(var(--note-rest-r))`. Reduced-motion otrzyma osobny wariant tego samego efektu bez większego przesunięcia.

## Weryfikacja

Test źródłowy sprawdzi sześć różnych wartości `--note-rest-r` oraz obecność fazy kontaktu. Test przeglądarkowy pobierze transformacje i cienie w trakcie oraz po animacji, potwierdzając różne kąty końcowe, trwałość tablicy, replay i brak przepełnienia.
