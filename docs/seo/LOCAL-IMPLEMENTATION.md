# Lokalna realizacja planu SEO

Plan: ../docs/superpowers/plans/2026-09-08-nowaweb-seo.md w katalogu nadrzędnym repozytorium.

Wymóg właściciela: żadnych commitów, pushów, publikacji i zmian paneli produkcyjnych. Kod pozostaje lokalnie w pobranej oddzielnej kopii, na gałęzi codex/seo-local. Początkowy HEAD: 84155982478d37c1caa80aa639996416e05c539f.

Decyzje: istniejąca kopia audytowa jest izolowana od zastanego projektu nadrzędnego. Nie tworzymy kolejnej kopii. DNS, Search Console i wzmianki zewnętrzne pozostają instrukcją do przyszłego uruchomienia. Ceny, portrety, opinie i wyniki nie są generowane. Case studies są prezentacjami widocznych projektów do potwierdzenia przed publikacją.

Podział prac: usługi — własne dane, strony i layout; portfolio/informacje — własne strony i layout; integracja — wspólny head, FAQ, menu, główna, style wspólne i testy. Wspólne interfejsy Breadcrumbs(items), Faq(items,id,heading), BaseLayout(ogImagePath). Dane services: slug,title,description,image. Dane projects: slug,name,image,width,height,summary,serviceHref. Budowanie i weryfikacja integracyjna wykonywane centralnie, bez równoległych buildów.

Stan bazowy: build 7 stron, 7/7 istniejących testów przechodzi; validate:portfolio przechodzi, audit:assets USED 23 / UNUSED 0.

## Stan końcowy — 8 września 2026

Lokalna implementacja ukończona i sprawdzona. Dodano 10 podstron: cztery usługi, O nas, wycenę, katalog realizacji i trzy opisy projektów. Build generuje 17 stron, w tym 15 publicznych stron przeznaczonych do indeksowania (bez 404 i podziękowania).

Dodano FAQ dostępne również bez JavaScriptu, breadcrumbs, linkowanie usług i portfolio, spójne dane marki, unikalne metadane i obrazy udostępniania. Rozbudowano menu i stopkę. Zachowano dotychczasowe ilustracje i interaktywne sekcje głównej. Poprawiono obcięte podpisy kart, kontrast sekcji CTA, przewijanie menu i przepełnienia na telefonach.

### Weryfikacja

- `npm run build`: 17 stron, wynik poprawny.
- `npm test`: 11/11 testów poprawnych — bezpieczeństwo formularzy, metadane, canonical, sitemap, odnośniki, FAQ i dane strukturalne.
- `npm run test:e2e`: 12/12 testów w Chrome; wszystkie 15 publicznych stron przy 390 i 1440 px, dodatkowo nowe układy przy 320, 768 i 1024 px, menu w poziomie, klawiatura, karuzela, FAQ bez JS oraz formularz. Po zgłoszeniu właściciela dodano test granic ilustracji hero przy 1280/1440/1920 px i test widoczności przyklejanej sceny przez cztery etapy przewijania.
- `npm run validate:portfolio` i `npm run validate:process`: poprawne.
- `npm run audit:assets`: USED 34, UNUSED 0.
- `git diff --check`: brak błędów whitespace (Git informuje o normalizacji LF/CRLF).
- Obejrzano zrzuty lokalnych podstron i sekcji usług. Zrzuty oraz raport przeglądarki znajdują się w `output/playwright/`.

Test wysyłania formularza przechwytuje żądanie lokalnie. Potwierdza walidację i dane żądania; nie potwierdza dostarczenia wiadomości przez produkcyjny Netlify Forms. Nie wysłano testowych wiadomości.

W ostatnim pełnym przebiegu worker Playwright pozostał aktywny po zaliczeniu wszystkich 12 scenariuszy i zamknięciu Chrome. Zakończono wyłącznie ten zidentyfikowany proces roboczy; runner następnie zapisał raport 12 passed i zakończył się poprawnie. Kolejne testy Node zakończyły się 11/11. Serwer podglądu pozostał uruchomiony.

Korekta hero po przeglądzie właściciela: usunięto przycinanie całej sekcji, przesunięto scenę desktopową o 40 px w lewo i ograniczono dekoracyjne przepełnienie na poziomie viewportu. `overflow-x: clip` na html i body zapobiega utworzeniu dodatkowego kontenera przewijania, który zakłócałby sticky. Pomiar potwierdził reakcję obiektów na wskaźnik i pozostawanie sceny procesu na ekranie podczas zmiany etapów. Właściciel potwierdził również działanie animacji w swoim podglądzie.

### Podgląd i dalsza praca lokalna

Podgląd: http://127.0.0.1:4322/ . Jeśli proces zostanie zakończony, uruchomić w tym repozytorium:

```powershell
npm run build
npm run preview -- --port 4322
```

Do edycji na żywo: `npm run dev`. Przed ponownymi testami zbudować aktualne pliki. `npm run test:e2e` korzysta z Chrome i lokalnego portu 4322.

### Czynności przed przyszłą publikacją

1. Potwierdzić informacje wskazane w `materialy-do-potwierdzenia.md`, zwłaszcza zakres realizacji i dane firmy. Kwoty, wyniki i zespół wymagają autentycznych materiałów właściciela.
2. Skonfigurować novaweb.pl jako dodatkową domenę kierującą stałym przekierowaniem do https://nowaweb.pl, zachowując ścieżki; sprawdzić DNS, TLS oraz warianty www. W tej sesji nie zmieniono konfiguracji domen.
3. Po publikacji zweryfikować obie domeny w Search Console, zgłosić sitemap głównej domeny i sprawdzić wybrane adresy narzędziem inspekcji URL.
4. Sprawdzić rzeczywistą obsługę formularza na hostingu oraz obserwować indeksowanie i zapytania marki. Wysoka pozycja nie jest gwarantowanym wynikiem zmian w kodzie.

Nie wykonano commitów, pushów, deployów ani zmian w panelach zewnętrznych. HEAD pozostaje `84155982478d37c1caa80aa639996416e05c539f`; zmiany są niezacommitowane na lokalnej gałęzi `codex/seo-local`.
