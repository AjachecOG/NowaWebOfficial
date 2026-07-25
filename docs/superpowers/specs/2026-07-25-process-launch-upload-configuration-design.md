# Animacja publikacji i konfiguracji — etap 4 procesu

## Cel

Zastąpić obecną statyczną wizualizację „Start i wsparcie” jednorazową sekwencją publikacji i konfiguracji strony. Animacja ma czytelnie opowiadać o przejściu od wysłania gotowej strony do jej uruchomienia i zakończyć się trwałym komunikatem sukcesu.

## Zakres

- Zmiana obejmuje wyłącznie scenę `launch` w czwartym etapie komponentu `ProcessIsland` oraz jej testy.
- Istniejący układ kart, przewijanie GSAP, nawigacja etapów, tekst karty i zachowanie pozostałych trzech scen pozostają bez zmian.
- Nie dodajemy nowych zależności ani timerów React.

## Przebieg animacji

1. W ramce przeglądarki widoczna jest pusta, jasna strona.
2. Na środku pojawiają się napis „Uploading…” oraz obracający się pierścień. Obrót stopniowo zwalnia przed zakończeniem.
3. Pierścień zmienia się w znak potwierdzenia, a napis w „Uploaded”.
4. Stan wysyłania znika, a jego miejsce zajmuje panel „Konfiguracja” z poziomym paskiem postępu.
5. Pasek porusza się odcinkami i zatrzymuje się w trzech punktach:
   - 24% — „Odpędzamy negatywne opinie…”
   - 67% — „Przyciągamy właściwych klientów…”
   - 88% — „Dopinamy ostatnie szczegóły…”
6. Po dojściu do 100% pasek krótko się rozświetla, pojawia się znak potwierdzenia i komunikat „Gotowe. Twoja strona pracuje.”
7. Stan końcowy pozostaje widoczny. Animacja nie zapętla się.
8. Ponowne wejście w etap 4 uruchamia sekwencję od początku przez istniejący kontrakt aktywnej karty i `data-story-visible`.

## Czas i ruch

- Pełna sekwencja trwa około 9 sekund.
- Ruch jest realizowany CSS-em i uruchamiany tylko dla aktywnej sceny czwartego etapu.
- Tempo ma być spokojne i celowe: wyraźne pauzy przy 24%, 67% i 88%, bez gwałtownych skoków.
- Ruch komunikuje zmianę stanu; nie dodajemy konfetti ani dekoracyjnych efektów niezwiązanych z publikacją.

## Wygląd

- Scena zachowuje obecną niebiesko-białą paletę i formę uproszczonej przeglądarki.
- Puste tło strony pozostaje dyskretne, żeby centralne statusy były dominantą.
- Pasek postępu jest segmentowany wizualnie przez trzy semantyczne punkty zatrzymania.
- Finał używa zielonego akcentu sukcesu, ale pozostaje spójny z granatową typografią i niebieskim interfejsem sekcji.

## Dostępność i responsywność

- Scena pozostaje dekoracyjna (`aria-hidden="true"`); treść etapu jest nadal dostępna w tekście karty.
- Wszystkie komunikaty mieszczą się bez łamania struktury na desktopie i mobile.
- Przy `prefers-reduced-motion: reduce` pomijamy obrót i wieloetapowe przejścia, pokazując od razu czytelny stan końcowy.
- Animacja nie może powodować poziomego overflow ani przesunięć układu karty.

## Weryfikacja

- Walidator strukturalny sprawdza nowe elementy sceny, trzy wartości 24/67/88, teksty statusów, finał i brak starego interfejsu publikacji.
- Test przeglądarkowy potwierdza stan początkowy, przejście do konfiguracji, zatrzymania paska, trwały finał, restart po ponownym wejściu oraz reduced motion.
- Build Astro przechodzi bez błędów.
- Scena jest oglądana na desktopie i mobile pod kątem czytelności, proporcji oraz overflow.

## Poza zakresem

- Zmiana tekstu „Start i wsparcie” lub opisu etapu.
- Zmiana czasu przewijania sekcji procesu.
- Przebudowa innych scen procesu.
- Autoodtwarzanie całej sekcji lub zapętlanie animacji.
