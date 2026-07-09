# NowaWebOfficial - notatki do kontynuacji

Ten plik opisuje, co zostało zrobione w projekcie, dlaczego tak, gdzie znajdują się najważniejsze pliki oraz jak kontynuować dalsze prace bez utraty kontekstu.

## Cel projektu

Powstała strona landing page dla NowaWeb w stacku Astro + React islands. Strona ma być szybka, profesjonalna, mniej generyczna i bardziej dopracowana wizualnie niż typowa strona-template. Kierunek wizualny po ostatnich iteracjach: czyste, premium, spokojne hero w stylu produktowym / Apple-like, z wykorzystaniem assetów z dostarczonych folderów jako materiału pomocniczego, ale bez wrażenia wklejonego kolażu.

## Aktualny stack

- Astro jako główny framework strony statycznej.
- React islands dla interaktywnych elementów.
- `lucide-react` dla ikon.
- Globalny CSS w jednym głównym pliku.
- Lokalny helper Chrome do screenshotów i walidacji UI.
- Python + Pillow do przygotowania przezroczystych assetów hero.

## Najważniejsze pliki

- `src/pages/index.astro` - główny markup strony.
- `src/styles/global.css` - cała warstwa wizualna i responsywność.
- `src/components/ProcessIsland.tsx` - interaktywna sekcja procesu.
- `src/components/PortfolioCarousel.tsx` - karuzela realizacji.
- `src/components/SiteMotion.tsx` - zachowania ruchu / reveal / pointer motion.
- `scripts/capture-chrome.mjs` - lokalny helper do wykonywania screenshotów przez Chrome/CDP.
- `scripts/create-hero-cutouts.py` - skrypt do usuwania jasnego tła z assetów hero.
- `public/assets/nowaweb/hero/` - assety używane w hero.

## Co zostało zrobione

1. Zbudowano stronę jako spójny landing page, a nie prostą kopię screenów referencyjnych.
2. Sekcje zostały zblendowane w jedną całość przez wspólne tło, rytm typografii, ograniczoną paletę i powtarzalne detale.
3. Pierwsze hero było przerabiane kilka razy, bo wcześniejsze wersje miały za dużo “kartek”, ciemny panel i klimat dashboardu/labu.
4. Usunięto widoczny tekst i koncept `NowaWeb build lab`, bo nie pasował do oczekiwanego czystego, profesjonalnego stylu.
5. Hero zostało uproszczone do jasnej sceny produktowej:
   - duży monitor jako główny obiekt,
   - zeszyt i kubek jako subtelne elementy wspierające,
   - mała notka `NowaWeb.` jako delikatny detal brandowy,
   - bez ciemnej ramy, metryk, timeline'u i technicznego nagłówka.
6. Użyto elementów z folderu `strona 1 elementy`, ale potraktowano je jako materiał do kompozycji, nie jako dosłowne wklejki.
7. Ponieważ oryginalne PNG miały jasne tła bez kanału alfa, przygotowano wersje z przezroczystością.
8. Usunięto dodatkową jasną planszę CSS za obiektami hero, żeby nie wyglądało to jak biały prostokąt pod assetami.

## Assety hero

Oryginalne pliki pozostają w:

- `public/assets/nowaweb/hero/monitor.png`
- `public/assets/nowaweb/hero/notebook.png`
- `public/assets/nowaweb/hero/cup.png`

Nowe wersje z wyciętym tłem:

- `public/assets/nowaweb/hero/monitor-cutout.png`
- `public/assets/nowaweb/hero/notebook-cutout.png`
- `public/assets/nowaweb/hero/cup-cutout.png`

Strona używa obecnie wersji `*-cutout.png`.

## Jak działają cutouty

Skrypt `scripts/create-hero-cutouts.py`:

- bierze oryginalne PNG z folderu hero,
- rozpoznaje jasne tło na podstawie koloru z krawędzi obrazu,
- robi flood-fill od krawędzi, więc usuwa głównie tło połączone z brzegiem, a nie jasne elementy wewnątrz monitora,
- dodaje miękką alfę na krawędziach,
- zapisuje nowe pliki obok oryginałów.

Regeneracja:

```powershell
& 'C:\Users\adasj\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' 'D:\adasj\Documents\NowaWebOfficial\scripts\create-hero-cutouts.py'
```

## Aktualny stan hero

Hero znajduje się w `src/pages/index.astro` jako:

- `.hero-studio.product-showcase`
- `.product-stage`
- `.product-monitor`
- `.product-notebook`
- `.product-cup`
- `.product-note`

Style są w `src/styles/global.css`, w sekcji klas zaczynających się od `.product-`.

Kierunek: mniej “makieta w ramce”, więcej czysta scena produktowa. Tło strony ma przechodzić przez hero i kolejne sekcje, bez wrażenia osobnej karty.

## Walidacja, która była wykonywana

Build Astro:

```powershell
npm.cmd --prefix 'D:\adasj\Documents\NowaWebOfficial' run build
```

Screenshoty z lokalnego Chrome:

```powershell
node 'D:\adasj\Documents\NowaWebOfficial\scripts\capture-chrome.mjs'
```

Wygenerowane screenshoty:

- `output/playwright/home-desktop.png`
- `output/playwright/home-mobile.png`
- `output/playwright/home-mobile-long.png`
- `output/playwright/home-full.png`

Check HTTP:

```powershell
Invoke-WebRequest -Uri 'http://127.0.0.1:4321/' -UseBasicParsing
```

Ostatnio sprawdzone:

- `astro build` przechodzi.
- Strona lokalna zwraca `200`.
- Desktop i mobile wyglądają stabilnie.
- Po usunięciu tła assety nie mają już wyraźnych prostokątnych ramek.

## Ważne decyzje projektowe

- Nie kopiować screenów 1:1. Mają być inspiracją i źródłem assetów, nie docelową makietą.
- Nie iść w generyczne gradientowe hero ani dekoracyjne “orby”.
- Utrzymać czytelny, premium layout z dużym światłem i dobrym rytmem.
- Nie dodawać ciężkich ramek/kart w hero, jeśli elementy mogą swobodnie siedzieć na tle.
- Assety powinny wyglądać jak część sceny, nie jak osobne zdjęcia wklejone do layoutu.
- Zachować wydajność: Astro + małe React islands, bez nadmiaru JS.

## Potencjalne dalsze kroki

- Jeszcze delikatniej dopracować krawędzie cutoutów, jeśli na innych monitorach widać jasne halo.
- Rozważyć zmniejszenie lub wyciszenie `.product-note`, jeśli hero ma być jeszcze bardziej minimalistyczne.
- Przejrzeć całą stronę na desktopie 1440px, mobile 390px i długim mobile, po każdej większej zmianie.
- Oczyścić stare, nieużywane klasy CSS po wcześniejszych wersjach hero, np. stare `.lab-*`, jeśli nie będą już potrzebne.
- Przejść sekcja po sekcji i wyrównać poziom “premium” do aktualnego hero.

## Uwaga techniczna

Repo wygląda na całe nieśledzone w `git status`, więc przy kolejnych zmianach nie zakładać, że `git diff` pokaże pełen obraz. Najlepiej sprawdzać konkretne pliki i screenshoty.

Na Windowsie komendy `npm` oraz helper Chrome mogą wymagać uruchomienia poza sandboxem, bo wcześniej pojawiały się problemy typu `EPERM` przy dostępie do ścieżki `D:\adasj\Documents`.
