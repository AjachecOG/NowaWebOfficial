# Rozdzielona odpowiedź w scenie rozmowy

## Cel

Uczytelnić i ożywić pierwszą scenę sekcji „Proces” przez rozdzielenie jednej odpowiedzi NowaWeb na dwie wiadomości z krótkim wskaźnikiem pisania pomiędzy nimi.

## Zakres

Zmiana dotyczy wyłącznie `ConversationVisual` w `src/components/ProcessIsland.tsx`, jego lokalnych styli w `src/components/ProcessIsland.css` oraz istniejących testów procesu. Pozostałe sceny, przewijanie sekcji i nawigacja etapów pozostają bez zmian.

## Sekwencja

1. Klient wpisuje: „Potrzebuję strony, która nie znudzi ciekawskich.”
2. Po prawej pojawia się pierwsza odpowiedź NowaWeb: „Nowa strona?”.
3. Poniżej pojawia się prawostronny dymek z trzema animowanymi kropkami.
4. Dymek z kropkami znika i w tym samym miejscu pojawia się druga odpowiedź: „Już się robi!”.

Każde ponowne wejście do pierwszej sceny odtwarza sekwencję od początku. Wyjście ze sceny czyści oczekujące timery, aby stara animacja nie dopisywała wiadomości po zmianie etapu.

## Wygląd i ruch

Obie odpowiedzi zachowują obecny pomarańczowy styl i wyrównanie do prawej. Pierwszy dymek pozostaje widoczny podczas pisania i po pojawieniu się drugiego. Wskaźnik pisania używa trzech kropek pulsujących kolejno; jego rozmiar jest dopasowany do treści, a nie do pełnej szerokości wiadomości. Druga wiadomość zastępuje wskaźnik bez skoku całego układu.

Przy `prefers-reduced-motion: reduce` treść nadal przechodzi przez tę samą logiczną sekwencję, lecz kropki nie pulsują.

## Dostępność

Scena pozostaje dekoracyjna (`aria-hidden="true"`), zgodnie z istniejącą implementacją. Atrybuty `data-*` rozdzielają obie odpowiedzi i wskaźnik, aby testy mogły sprawdzić kolejność bez uzależniania się od szczegółów CSS.

## Weryfikacja

- Test źródłowy potwierdzi dokładne teksty obu nowych odpowiedzi i obecność osobnego wskaźnika pisania.
- Test przeglądarkowy sprawdzi stany pośrednie: pierwszą odpowiedź, widoczne kropki, zastąpienie kropek drugą odpowiedzią i odtworzenie po powrocie do sceny.
- Pełny build oraz istniejące testy sekcji „Proces” muszą przejść bez regresji.
- Widok desktopowy i mobilny zostaną sprawdzone w przeglądarce pod kątem przepełnienia oraz skoków układu.
