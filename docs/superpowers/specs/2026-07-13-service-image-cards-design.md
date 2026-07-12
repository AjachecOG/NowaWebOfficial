# Karty usług oparte na grafikach

## Cel

Zastąpić sześć obecnych komponentów w sekcji `#uslugi` sześcioma dostarczonymi grafikami. Grafiki zawierają kompletne tytuły, opisy i ilustracje, dlatego karta nie będzie powielać tekstu ani ikon w HTML.

## Mapowanie i kolejność

1. `ChatGPT Image 13 lip 2026, 00_49_01 (1).png` — Strony firmowe
2. `ChatGPT Image 13 lip 2026, 00_49_01 (2).png` — Landing page
3. `ChatGPT Image 13 lip 2026, 00_49_01 (3).png` — One page
4. `ChatGPT Image 13 lip 2026, 00_49_01 (4).png` — Odświeżenie strony
5. `ChatGPT Image 13 lip 2026, 00_49_01 (5).png` — UX + copywriting
6. `ChatGPT Image 13 lip 2026, 00_49_01 (6).png` — Opieka i rozwój

## Układ

- Desktop: trzy kolumny i dwa rzędy.
- Tablet: dwie kolumny.
- Telefon: jedna kolumna.
- Wszystkie grafiki zachowują proporcje, wypełniają szerokość karty i mają spójne odstępy.
- Zostaje subtelny efekt uniesienia przy najechaniu oraz istniejący efekt pojawienia podczas przewijania.

## Dostępność i wydajność

- Każdy obraz otrzyma opis `alt` odpowiadający nazwie usługi i treści karty.
- Obrazy będą ładowane leniwie i dekodowane asynchronicznie.
- Pliki zostaną skopiowane do `public/assets/nowaweb/services/` pod prostymi nazwami.

## Zakres zmian

- Uproszczenie danych i markupu usług w `src/pages/index.astro`.
- Usunięcie stylów dotyczących starej makiety pierwszej karty i zastąpienie ich stylami kart obrazkowych w `src/styles/global.css`.
- Bez zmian w nagłówku sekcji, pozostałych sekcjach i treści grafik.

## Weryfikacja

- `npm run build` kończy się powodzeniem.
- Kontrola widoku sekcji usług na desktopie 1440 px i telefonie 390 px.
- Brak rozciągniętych obrazów, uciętego tekstu i poziomego przewijania.
