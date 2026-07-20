# Płynna animacja scroll sekcji „Proces” — projekt

## Cel

Zastąpić skokowe przełączanie etapów przez `IntersectionObserver` animacją, której stan jest bezpośrednio powiązany z pozycją scrolla. Wygląd, treść i układ sekcji pozostają bez zmian; poprawiamy wyłącznie rytm i płynność ruchu.

## Decyzja techniczna

Sekcja użyje GSAP z `ScrollTrigger`. Jedna oś czasu będzie sterować stosem kart, linią postępu, aktywnym punktem nawigacji i mikroanimacjami wnętrza. `scrub` zapewni łagodne podążanie animacji za scrollem, bez automatycznego snapowania.

Ten dokument zastępuje wcześniejsze założenie o użyciu `IntersectionObserver` i wyłącznie natywnych API w `2026-07-20-kinetic-process-section-design.md`.

## Zachowanie desktopowe

- Istniejący sticky layout i wysokość sekcji pozostają źródłem zakresu przewijania; GSAP nie dodaje drugiego pinowania.
- Postęp `0–1` jest ciągły, a nie ograniczony do czterech skokowych stanów.
- Oś czasu ma cztery czytelne etapy. Karta wchodząca płynnie przesuwa się, skaluje i zwiększa krycie, a poprzednia łagodnie przechodzi do warstwy tła.
- Linia procesu wypełnia się liniowo względem postępu.
- Aktywny numer i stan ARIA aktualizują się po przekroczeniu środka najbliższego etapu, ale nie sterują transformacją kart.
- Mikroanimacje zaczynają się wewnątrz odpowiedniego segmentu osi czasu i cofają się naturalnie przy scrollowaniu w górę.
- Nie stosujemy snapowania, automatycznego przewijania ani bezwładności ingerującej w natywny scroll strony.

## Interakcje ręczne

Kliknięcie lub fokus numeru/karty przewija stronę do odpowiadającego punktu osi czasu. Nawigacja klawiaturą, `aria-current` i `aria-pressed` pozostają zachowane.

## Responsywność i dostępność

- Powyżej 760 px działa prowadzona animacja scrollowa.
- Na mobile karty pozostają w naturalnym pionowym układzie bez ScrollTriggera i bez nakładania.
- Przy `prefers-reduced-motion: reduce` zachowujemy zmianę etapów i delikatny scrub, ale usuwamy rotacje, tilt oraz duże przesunięcia. Dzięki temu proces nadal jest zrozumiały i widoczny bez intensywnego ruchu.
- Każda instancja GSAP i ScrollTrigger jest usuwana przy demontażu komponentu.

## Granice zmiany

- Bez zmian treści, kolorów, rozmiarów kart i struktury sekcji.
- Bez zmian pozostałych sekcji strony.
- Jedyna nowa zależność produkcyjna to `gsap`.
- Nie tworzymy dodatkowego globalnego listenera scroll.

## Kryteria akceptacji

1. Transformacja kart zmienia się ciągle wraz ze scrollem i nie czeka na skok aktywnego indeksu.
2. Przejście działa płynnie w obu kierunkach i obejmuje wszystkie cztery etapy.
3. Linia postępu pozostaje zsynchronizowana z kartami.
4. Kliknięcie i fokus prowadzą do właściwego etapu.
5. Mobile 390 px pozostaje naturalną listą bez poziomego overflow.
6. Tryb ograniczonego ruchu zachowuje łagodną, czytelną animację bez rotacji.
7. Nie występują błędy konsoli, wycieki ScrollTriggerów ani regresje buildu Astro.

## Weryfikacja

- Walidator statyczny potwierdza użycie `gsap`, `ScrollTrigger`, `scrub`, cleanup i breakpoint mobilny.
- Test przeglądarkowy próbuje kilka blisko położonych pozycji scrolla i potwierdza ciągłą zmianę transformacji bez skoku indeksu.
- Test sprawdza kliknięcie, fokus, mobile i `prefers-reduced-motion`.
- `npm run build` musi zakończyć się poprawnie.
