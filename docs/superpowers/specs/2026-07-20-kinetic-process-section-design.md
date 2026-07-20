# Kinetyczna sekcja procesu — projekt

## Cel

Przebudować sekcję „Jak wygląda współpraca” z prostej siatki czterech kart w płynną, przestrzenną opowieść aktywowaną scrollem. Sekcja ma być mocniejszym momentem strony, ale pozostać zgodna z jej jasnym, spokojnym i premium charakterem.

## Zakres

Zmiana obejmuje wyłącznie sekcję procesu, jej React island oraz bezpośrednio powiązane style. Nie zmieniamy kolejności sekcji, treści pozostałych fragmentów strony ani globalnego systemu wizualnego.

## Kompozycja desktopowa

- Nagłówek pozostaje szeroki i centralny, z subtelnym wejściem typografii i dekoracyjną linią ruchu.
- Pod nagłówkiem powstaje scena procesu z pionową osią po lewej i stosem czterech kart po prawej.
- Podczas przewijania aktywują się kolejne etapy. Aktywna karta jest najczytelniejsza i znajduje się na wierzchu, a wcześniejsze pozostają częściowo widoczne jako warstwy.
- Linia procesu wypełnia się wraz z postępem, a aktywny punkt zmienia akcent z niebieskiego na pomarańczowy.
- Duże numery 01–04 działają jako element kompozycyjny, nie jako osobna etykieta sekcji.
- Tło otrzymuje subtelną siatkę techniczną i miękkie światło zależne od aktywnego etapu.

## Karty i mikrointerakcje

Każda karta zachowuje istniejący tytuł i opis, ale otrzymuje własną prostą wizualizację zbudowaną z HTML, CSS i ikon:

1. „Rozmowa i brief” — animowane linie rozmowy i pojawiające się punkty briefu.
2. „Strategia i makieta” — układ wireframe, którego bloki kolejno zajmują miejsce.
3. „Design i wdrożenie” — kursor projektowy, próbki koloru i ruch elementów interfejsu.
4. „Start i wsparcie” — sekwencja statusu publikacji oraz pulsujący sygnał gotowości.

Hover może dodawać lekki tilt oraz reakcję ikony, ale nie może konkurować z narracją scrollową. Kliknięcie lub fokus etapu ręcznie go aktywuje i pozostaje dostępne dla klawiatury.

## Zachowanie i implementacja

- Sekcja pozostaje małym React islandem w Astro.
- Aktywny etap jest wyznaczany przez pozycję sekcji podczas scrollowania z użyciem natywnych API przeglądarki i `requestAnimationFrame`.
- Sticky positioning tworzy wrażenie prowadzonej opowieści bez globalnego pinowania strony.
- Nie dodajemy nowej biblioteki animacyjnej, o ile natywne API zapewni wymagany efekt.
- Zdarzenia scroll są pasywne, a aktualizacje animacji są grupowane przez `requestAnimationFrame`.
- Komponent nie pobiera danych i nie wymaga osobnej obsługi błędów sieciowych.

## Responsywność

- Desktop: sticky scena i warstwowe karty.
- Tablet: uproszczone przesunięcia oraz mniejsza głębokość stosu.
- Mobile: pionowa oś i karty w naturalnym przepływie, bez sticky stackingu i bez nakładania treści.
- Tekst nie może być obcinany, a interaktywne obszary zachowują wygodny rozmiar dotykowy.

## Dostępność

- Karty pozostają elementami `button` z czytelnym stanem aktywnym i `aria-pressed`.
- Fokus klawiatury jest wyraźny i może aktywować dany etap.
- Dekoracyjne elementy są ukryte przed czytnikami ekranu.
- `prefers-reduced-motion: reduce` wyłącza sticky narrację, tilt i intensywne przejścia, pozostawiając statyczną, czytelną listę.

## Kryteria akceptacji

- Etapy zmieniają się płynnie podczas scrollowania na desktopie.
- Ręczne wskazanie, kliknięcie i fokus poprawnie aktywują etap.
- Mobile 390 px pokazuje wszystkie treści w poprawnej kolejności bez poziomego scrolla.
- Sekcja nie powoduje skoków layoutu ani błędów konsoli.
- Build Astro przechodzi bez błędów.
- Widok jest zweryfikowany wizualnie przy szerokościach 1440 px i 390 px.

## Weryfikacja

1. Uruchomić walidację kompilacji przez `npm run build`.
2. Otworzyć lokalny podgląd sekcji i przejść cały zakres scrollowania.
3. Wykonać zrzuty sekcji w widokach 1440 px oraz 390 px.
4. Sprawdzić obsługę klawiatury i tryb ograniczonego ruchu.

