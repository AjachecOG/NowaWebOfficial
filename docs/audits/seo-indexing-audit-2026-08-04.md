# Audyt indeksacji i plan naprawczy NowaWeb

Data: 2026-08-04  
Domena: `https://nowaweb.pl/`

## Werdykt

Produkcja nie ma technicznej blokady Googlebota. Brak widoczności wynika przede wszystkim
z bardzo krótkiej historii domeny, braku potwierdzonego zgłoszenia w Google Search Console,
braku zewnętrznych linków oraz dotychczasowej architektury, w której prawie cała oferta była
zamknięta na jednej stronie.

Nie ma dowodu, że Google odrzuca stronę z powodu Astro, Netlify, JavaScriptu albo `noindex`.

## Potwierdzone testy produkcji

- `https://nowaweb.pl/` odpowiada `200` także dla user-agenta Googlebot.
- `http://nowaweb.pl/` przekierowuje `301` do HTTPS.
- `https://www.nowaweb.pl/` przekierowuje `301` do wersji bez `www`.
- `robots.txt` odpowiada `200`, zezwala na crawl i wskazuje sitemapę.
- `sitemap-index.xml` i `sitemap-0.xml` odpowiadają `200`.
- strona główna ma self-canonical, `index, follow`, jeden `H1` i treść w statycznym HTML.
- przeglądarka Playwright renderuje całą treść; konsola: 0 błędów, 0 ostrzeżeń.
- wyszukanie `site:nowaweb.pl` nie zwracało wyników w dostępnych testach indeksu.

Stan produkcyjnej sitemapy przed wdrożeniem tej zmiany: 5 adresów, z czego trzy są stronami
prawnymi, jeden kontaktem, a tylko jeden opisuje ofertę.

## Co zmienia ta iteracja

- title i `H1` strony głównej wprost opisują usługę: tworzenie stron internetowych dla firm;
- powstaje `/uslugi/` oraz sześć osobnych, statycznych stron usługowych;
- powstaje `/o-nas/` z prawdziwymi danymi operatora marki;
- powstaje `/realizacje/` bez wymyślonych wyników, statystyk i opinii;
- strona główna otrzymuje FAQ oparte na faktycznym procesie;
- nawigacja i stopka prowadzą do indeksowalnych adresów zamiast wyłącznie do kotwic;
- JSON-LD rozróżnia organizację, stronę WWW, typ bieżącej strony i konkretne usługi;
- logo organizacji wskazuje osobny kwadratowy plik zamiast grafiki Open Graph;
- można ustawić token URL-prefix Search Console przez `PUBLIC_GOOGLE_SITE_VERIFICATION`;
- sitemapę rozszerza Astro automatycznie, nadal bez stron 404 i podziękowania;
- zależności z trzema zgłoszonymi podatnościami zostały zaktualizowane bez `--force`.

Nie przywrócono eksperymentalnego cennika ani dwóch generycznych wpisów blogowych z historii
Git. Ich ceny i treści wymagają zatwierdzenia biznesowego, a publikowanie ich tylko dla liczby
podstron byłoby sprzeczne z celem audytu.

## Czynności po wdrożeniu — wymagają właściciela domeny

1. W Google Search Console dodać właściwość domenową `nowaweb.pl`.
2. Zweryfikować ją rekordem DNS TXT u operatora DNS.
3. W raporcie Sitemaps zgłosić `https://nowaweb.pl/sitemap-index.xml`.
4. W URL Inspection uruchomić test live dla:
   - `https://nowaweb.pl/`
   - `https://nowaweb.pl/uslugi/`
   - `https://nowaweb.pl/uslugi/strony-firmowe/`
5. Dla tych kluczowych adresów użyć Request indexing. Pozostałe Google powinno odkryć z
   linków wewnętrznych i sitemapy.
6. Sprawdzić raporty Manual actions oraz Security issues.
7. Po co najmniej tygodniu sprawdzić Page indexing. Szczególnie rozróżnić statusy:
   `URL is unknown to Google`, `Discovered - currently not indexed` i
   `Crawled - currently not indexed`.
8. Utworzyć lub uzupełnić Google Business Profile jako firma usługowa. Dane nazwy firmy,
   telefonu, adresu/obszaru działania i domeny muszą być zgodne z witryną.

## Sygnały poza kodem

Sama sitemap i schema nie budują autorytetu. Najbardziej wartościowe kolejne sygnały to:

- link do NowaWeb z oficjalnego profilu spółki lub profilu firmowego LinkedIn;
- linki z realnych realizacji, jeśli klienci wyrażą zgodę;
- kompletna wizytówka Google Business Profile;
- prawdziwe case studies po zebraniu zakresu, procesu i mierzalnych efektów;
- merytoryczne odpowiedzi na pytania klientów, publikowane dopiero wtedy, gdy wnoszą
  doświadczenie z faktycznych projektów.

Nie kupować paczek linków, katalogów automatycznych ani masowo generowanych artykułów.

## Oficjalne źródła Google

- URL Inspection: https://support.google.com/webmasters/answer/9012289
- Dlaczego strony brakuje w Google: https://support.google.com/webmasters/answer/7474347
- Raport sitemap: https://support.google.com/webmasters/answer/7451001
- Helpful, reliable, people-first content:
  https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Informacje o firmie w Google:
  https://developers.google.com/search/docs/appearance/establish-business-details
