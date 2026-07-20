# Dynamiczne werdykty w porównaniu NowaWeb / WordPress

## Cel

Skrajne komunikaty odsłaniane sliderem mają zmieniać się razem z aktywnym kryterium: Szybkość, Koszty, Bezpieczeństwo, Wygląd i Wsparcie. Copy ma być bezpośrednie i sprzedażowe, ale zachować profesjonalny ton strony.

## Model danych

Każdy element istniejącej tablicy `criteria` otrzyma cztery pola:

- `nowawebVerdictTitle`
- `nowawebVerdictDetail`
- `wordpressVerdictTitle`
- `wordpressVerdictDetail`

Werdykty będą renderowane z tego samego `item`, który jest wybierany przez `displayedIndex`. Dzięki temu główna treść i oba werdykty zmieniają się atomowo w istniejącym cyklu przejścia zakładki.

## Zatwierdzone treści

### Szybkość

- NowaWeb: **Szybkość, która sprzedaje.** Lekki kod pomaga zamienić uwagę w kontakt, zanim klient zdąży odejść.
- WordPress: **Klient nie będzie czekał.** Motyw, skrypty i dodatki potrafią spowolnić nawet prostą stronę.

### Koszty

- NowaWeb: **Płacisz za efekt, nie poprawki.** Jasny zakres i brak stosu płatnych dodatków ułatwiają kontrolę budżetu.
- WordPress: **Tani start. Drogie utrzymanie.** Licencje, aktualizacje i kolejne poprawki regularnie wracają do budżetu.

### Bezpieczeństwo

- NowaWeb: **Mniej luk. Więcej spokoju.** Prostsza architektura ogranicza powierzchnię ataku i liczbę pilnych aktualizacji.
- WordPress: **Każdy dodatek to kolejne ryzyko.** Motyw i wtyczki tworzą następne elementy, które trzeba stale kontrolować.

### Wygląd

- NowaWeb: **Marka, której nie da się pomylić.** Projekt powstaje dla Twojej firmy, więc nie wygląda jak kolejny gotowiec.
- WordPress: **Szablon nie buduje przewagi.** Gotowy motyw zamyka Twoją markę w tych samych ramach co tysiące firm.

### Wsparcie

- NowaWeb: **Jedna odpowiedzialność. Szybka decyzja.** Rozmawiasz bezpośrednio z osobą, która zna projekt od pierwszej decyzji.
- WordPress: **Problem krąży. Rachunek zostaje.** Hosting, motyw i wtyczki mogą odsyłać odpowiedzialność między dostawcami.

## Zachowanie i prezentacja

- Zmiana zakładki podmienia główną treść oraz oba werdykty w tym samym momencie.
- Istniejące przejście `data-comparison-transitioning` obejmie również werdykty, aby stare i nowe copy nie nakładały się podczas zmiany.
- Pozycja slidera nie zostanie zresetowana.
- Werdykty nadal pozostają stale namalowane i są odsłaniane wyłącznie przez maskę warstwy; nie wróci logika progowa ani animacja `opacity` zależna od położenia slidera.
- Układ, ikony i proporcje sekcji pozostają bez zmian.

## Dostępność

Werdykty pozostaną `aria-hidden`, ponieważ są wizualnym, marketingowym rozszerzeniem tej samej informacji. Główna treść w istniejącym regionie `aria-live="polite"` nadal komunikuje zmianę kryterium bez podwójnego odczytu.

## Weryfikacja

- Test kontraktowy sprawdzi obecność czterech pól werdyktu w każdym z pięciu kryteriów oraz renderowanie ich z aktywnego `item`.
- Test przeglądarkowy kliknie każde kryterium i sprawdzi odpowiadające mu werdykty po zakończeniu przejścia.
- Kontrola slidera potwierdzi, że oba werdykty zachowują stałe `opacity: 1` i nadal są odsłaniane przez `clip-path`.
- Końcowy build Astro musi zakończyć się bez błędów.

## Poza zakresem

Zmiana nie obejmuje przebudowy layoutu, nowych ikon, zmiany mechaniki slidera ani edycji głównych opisów kryteriów.
