# Etap 2 procesu: warsztat z karteczkami

## Cel

Zastąpić statycznie wyglądający pojedynek A/B animowaną sceną warsztatową, która pokazuje, jak luźne informacje z rozmowy zmieniają się w uporządkowaną strategię i kierunek makiety.

Scena pozostaje częścią istniejącej karty „Strategia i makieta” i korzysta z obecnego języka wizualnego NowaWeb: papierowego tła, granatu, niebieskiego i pomarańczowego akcentu.

## Wybrany kierunek: Facylitator

Miniaturowa tablica warsztatowa wypełnia się kolorowymi karteczkami. Karteczki wpadają z kilku stron, po czym porządkują się w trzy grupy:

- Cele
- Treści
- Priorytety

Najważniejsze elementy zostają zakreślone pomarańczową linią. Następnie wybrane karteczki zmieniają pozycję i proporcje, tworząc uproszczony układ strony. Finał otrzymuje krótki podpis „Kierunek gotowy”.

## Przebieg animacji

### Pełny ruch

Sekwencja trwa około 4,8 sekundy i odtwarza się po aktywowaniu etapu 2:

1. Pojawia się nagłówek tablicy „Warsztat strategii”.
2. Sześć karteczek wpada kolejno z różnych kierunków, z niewielkim obrotem i sprężystym wyhamowaniem.
3. Karteczki przesuwają się do trzech opisanych grup: „Cele”, „Treści” i „Priorytety”.
4. Pomarańczowa linia zakreśla dwa priorytetowe wnioski.
5. Wybrane karteczki składają się w prostą makietę: nawigację, hero, dwa bloki treści i CTA.
6. Pojawia się etykieta „Kierunek gotowy”; scena pozostaje w tym stanie do zmiany etapu.

Powrót do etapu po nawigacji uruchamia sekwencję od początku, tak samo jak w animacji rozmowy z etapu 1.

### Ograniczony ruch

Tryb `prefers-reduced-motion: reduce` nadal pokazuje zmianę stanu, aby scena nie wyglądała jak pojedyncze zdjęcie. Sekwencja trwa około 2,2 sekundy:

1. Karteczki pojawiają się grupami przez zmianę krycia, bez lotu i obrotu.
2. Dwa priorytety otrzymują pomarańczowe obramowanie.
3. Warsztat przechodzi przez przenikanie do gotowego układu makiety i podpisu.

Nie ma ruchu ciągłego, pętli ani dużych przesunięć przestrzennych.

## Struktura komponentu

Scena pozostaje częścią `ProcessIsland.tsx` i używa zwykłego DOM oraz CSS. Nie wymaga obrazu, canvasu ani nowej biblioteki.

Elementy sceny:

- nagłówek tablicy;
- trzy etykiety grup;
- sześć karteczek z krótkimi hasłami;
- obrys priorytetów;
- finalna makieta zbudowana z tych samych elementów wizualnych;
- etykieta końcowa.

Klasa aktywnej karty steruje odtwarzaniem. Wszystkie animacje sceny są ograniczone selektorem etapu strategii, dzięki czemu nie wpływają na pozostałe etapy procesu.

## Zachowanie i dostępność

- Scena jest dekoracyjna i zachowuje `aria-hidden="true"`.
- Tekst karty obok sceny nadal wyjaśnia sens etapu.
- Animacja jest jednorazowa i nie zapętla się.
- Stan końcowy pozostaje czytelny bez animacji oraz po jej zakończeniu.
- Układ mieści się w aktualnym kontenerze na desktopie i mobile bez przewijania wewnętrznego.

## Odporność i degradacja

Jeżeli CSS animations nie są dostępne, podstawowym stanem sceny jest gotowy, uporządkowany warsztat z widocznym kierunkiem makiety. Logika procesu i nawigacja nie zależą od zakończenia animacji.

## Weryfikacja

Walidacja źródła sprawdzi:

- usunięcie elementów pojedynku A/B;
- obecność trzech grup i sześciu karteczek;
- obecność finału „Kierunek gotowy”;
- osobne reguły pełnego i ograniczonego ruchu.

Test przeglądarkowy sprawdzi początek, grupowanie i finał animacji, ponowne odtworzenie po powrocie do etapu, widoczną zmianę w trybie ograniczonego ruchu oraz brak przepełnienia na desktopie i mobile.
