# Etap 2 procesu: duży, trwały warsztat z karteczkami

## Status

Ta rewizja zastępuje specyfikację `2026-07-21-process-strategy-sticky-note-workshop-design.md` w zakresie rozmiaru, czasu animacji i stanu końcowego.

## Cel zmiany

Warsztat ma być głównym, czytelnym elementem prawej części karty „Strategia i makieta”. Karteczki muszą być widoczne bez wysiłku, animacja powinna rozwijać się spokojniej, a po jej zakończeniu na ekranie ma pozostać kompletna tablica warsztatowa. Scena nie przechodzi już do wizualizacji makiety.

## Rozmiar

Na desktopie karta etapu 2 otrzymuje szerszą prawą kolumnę:

- lewa kolumna tekstowa: około 37%;
- prawa kolumna wizualna: około 63%;
- odstęp między kolumnami zostaje zmniejszony, aby wizualizacja nie wychodziła poza kartę;
- minimalna wysokość okna warsztatu wzrasta z 270 do około 315 px;
- tablica wykorzystuje niemal całe okno, z marginesem wewnętrznym 6–8 px zamiast 16 px.

Karteczki zwiększają się o około 30%:

- większa powierzchnia i padding;
- tekst około `0.55rem` zamiast `0.42rem`;
- mocniejszy cień i nieco większy odstęp między grupami;
- nazwy grup pozostają czytelne i nie są obcinane.

Na szerokościach poniżej 1020 px układ zachowuje obecne proporcje karty, ale tablica nadal wypełnia większą część okna. Na mobile warsztat pokazuje trwały stan końcowy bez przepełnienia.

## Pełna animacja

Sekwencja trwa około 7 sekund i uruchamia się po wejściu w etap 2:

1. Tablica pojawia się i pozostaje widoczna przez całą sekwencję.
2. Sześć karteczek wchodzi pojedynczo w odstępach około 0,6 sekundy.
3. Każda karteczka ma około 0,85–0,95 sekundy na spokojne wejście i wyhamowanie.
4. Po pojawieniu się wszystkich karteczek pomarańczowa linia zakreśla grupę „Priorytety”.
5. Pojawia się mała etykieta „kierunek wybrany”.
6. Animacja kończy się na kompletnej tablicy i utrzymuje ten stan do opuszczenia etapu.

Powrót do etapu odtwarza sekwencję od początku.

## Ograniczony ruch

Obecna przeglądarka korzysta z `prefers-reduced-motion: reduce`, dlatego również ta ścieżka musi być wyraźnie zauważalna. Sekwencja trwa około 5 sekund:

- tablica jest widoczna od początku;
- karteczki pojawiają się pojedynczo przez zmianę krycia, bez lotu i obrotu;
- odstępy między karteczkami wynoszą około 0,55–0,65 sekundy;
- priorytet pojawia się po ostatniej karteczce;
- finałem jest ta sama pełna tablica, bez przejścia do innego obrazu.

Nie ma pętli, dużych przesunięć ani ruchu ciągłego.

## Struktura komponentu

Z `ProcessIsland.tsx` zostaje usunięty element `.story-workshop-final` wraz z wizualizacją nawigacji, hero, siatki i CTA. Pozostają:

- `.story-workshop-board`;
- nagłówek „Warsztat strategii”;
- trzy grupy: „Cele”, „Treści”, „Priorytety”;
- sześć karteczek;
- `.story-workshop-priority` z etykietą końcową.

Stan końcowy jest naturalnym stanem tablicy, a nie osobną warstwą.

## Dostępność i degradacja

- Scena pozostaje dekoracyjna i zachowuje `aria-hidden="true"`.
- Bez animacji widoczna jest pełna tablica ze wszystkimi karteczkami i priorytetem.
- Animacja jest jednorazowa i nie zapętla się.
- Układ nie może powodować poziomego ani pionowego przepełnienia sceny.

## Weryfikacja

Testy źródłowe sprawdzą usunięcie `.story-workshop-final`, obecność sześciu karteczek i trwałego priorytetu. Test przeglądarkowy pobierze stan w trakcie wejścia oraz po ponad 7 sekundach i potwierdzi, że:

- karteczki pojawiają się stopniowo;
- tablica pozostaje widoczna po zakończeniu;
- wszystkie sześć karteczek oraz priorytet są widoczne w finale;
- nie istnieje warstwa wcześniejszej makiety;
- replay działa po powrocie do etapu;
- reduced-motion jest wolniejszy i zauważalny;
- desktop oraz mobile nie mają przepełnienia.
