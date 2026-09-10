export type Service = {
  slug: string;
  title: string;
  description: string;
  image: string;
  accent: string;
  intro: string;
  audience: string;
  scope: { title: string; text: string }[];
  projectNote: string;
  preparation: string;
  process: { title: string; text: string }[];
  pricing: string;
  pricingFactors: string[];
  faq: { question: string; answer: string }[];
  cta: string;
};

export const services: Service[] = [
  {
    slug: "strony-internetowe-dla-firm",
    title: "Strony internetowe dla firm",
    description: "Strony firmowe w Astro: czytelna oferta, projekt dopasowany do marki i łatwy kontakt. Poznaj zakres, przebieg współpracy i zasady wyceny NowaWeb.",
    image: "/assets/nowaweb/services/corporate-websites.webp",
    accent: "Twoja oferta. Jasno przedstawiona.",
    intro: "Projektujemy strony, które pomagają zrozumieć, czym zajmuje się Twoja firma, dla kogo pracuje i jak rozpocząć współpracę. Od pierwszego nagłówka po kontakt.",
    audience: "Dla firm, które potrzebują własnego miejsca w sieci: z uporządkowanymi usługami, informacjami o marce i przestrzenią na pokazanie prawdziwych realizacji.",
    scope: [
      { title: "Struktura oferty", text: "Porządkujemy informacje wokół pytań klienta. Ustalamy, co powinno znaleźć się na głównej, a co zasługuje na osobną podstronę." },
      { title: "Projekt pod markę", text: "Łączymy typografię, kolory i materiały firmy w spójny układ. Dbamy o hierarchię treści oraz czytelność na telefonie i komputerze." },
      { title: "Wdrożenie w Astro", text: "Budujemy lekką stronę bez gotowego motywu WordPress. Liczba podstron, formularze i dodatkowe funkcje wynikają z ustalonego zakresu." },
      { title: "Treść i kontakt", text: "Układ i teksty prowadzą od propozycji wartości do kolejnego kroku. Wspólnie ustalamy materiały, opisy usług i miejsca kontaktu." },
    ],
    projectNote: "Zobacz, jak różne marki można przedstawić przez układ, typografię i podglądy oferty. Nasze portfolio pomoże Ci opisać kierunek wizualny własnej strony.",
    preparation: "Przygotuj opis oferty, logo i dostępne zdjęcia. Wskaż najważniejszych odbiorców oraz pytania, które powtarzają się w rozmowach. Jeśli brakuje materiałów, zaznacz to w zapytaniu — zakres ich opracowania wymaga ustalenia.",
    process: [
      { title: "Cel i zawartość", text: "Rozmawiamy o firmie, odbiorcach i oczekiwanej roli strony. Ustalamy listę podstron oraz potrzebne materiały." },
      { title: "Struktura i projekt", text: "Układamy kolejność informacji i kierunek wizualny. Zasady zgłaszania uwag oraz zakres poprawek doprecyzowujemy przed rozpoczęciem prac." },
      { title: "Wdrożenie i start", text: "Przenosimy projekt do kodu. Termin publikacji i sposób przekazania strony ustalamy w ramach konkretnej oferty." },
    ],
    pricing: "Stronę firmową wyceniamy na podstawie jej zawartości i funkcji. Prosta prezentacja jednej usługi i rozbudowana oferta z wieloma podstronami to różne zakresy pracy.",
    pricingFactors: ["Liczba i zróżnicowanie podstron", "Gotowość tekstów, zdjęć i identyfikacji", "Formularze, integracje i funkcje dodatkowe", "Zakres aktualizacji po publikacji"],
    faq: [
      { question: "Czy strona firmowa musi mieć wiele podstron?", answer: "Nie. Przy zwartej ofercie może wystarczyć one page. Osobne podstrony mają sens, gdy poszczególne usługi potrzebują własnego opisu. Strukturę dobieramy do treści i odbiorców." },
      { question: "Czy będę samodzielnie edytować treści?", answer: "Sposób edycji ustalamy przed rozpoczęciem projektu. Wdrożenie w Astro nie oznacza automatycznie panelu CMS. Możemy omówić potrzeby edycji lub aktualizacje treści w ramach opieki." },
      { question: "Czy przygotowujecie teksty na stronę?", answer: "UX i copywriting należą do naszej oferty. Zakres opracowania tekstów ustalamy indywidualnie. Informacje o firmie, produktach i potwierdzonych realizacjach muszą pochodzić od Ciebie." },
      { question: "Czy nowa strona zapewni wysokie pozycje w Google?", answer: "Sama publikacja strony nie gwarantuje pozycji ani ruchu. Strukturę treści i wymagania techniczne związane z wyszukiwarkami warto uwzględnić w briefie. Dalsze działania SEO wymagają odrębnego ustalenia zakresu." },
      { question: "Ile trwa przygotowanie strony firmowej?", answer: "Termin zależy od liczby podstron, funkcji, dostępności materiałów i przebiegu akceptacji. Harmonogram ustalamy po poznaniu zakresu, zamiast podawać jeden termin dla wszystkich projektów." },
    ],
    cta: "Opowiedz nam o swojej firmie",
  },
  {
    slug: "landing-page",
    title: "Landing page",
    description: "Landing page pod jedną kampanię i jedno CTA. NowaWeb łączy układ, copywriting i pomiar kluczowych zdarzeń. Sprawdź zakres i przygotowanie do projektu.",
    image: "/assets/nowaweb/services/landing-page.webp",
    accent: "Jedna oferta. Wyraźny następny krok.",
    intro: "Tworzymy strony docelowe pod konkretną kampanię. Układ i tekst prowadzą odbiorcę do jednej głównej akcji: kontaktu, zapytania lub innego uzgodnionego celu.",
    audience: "Dla firm promujących wybraną usługę, produkt lub wydarzenie. Szczególnie wtedy, gdy ogólna strona firmowa nie odpowiada dokładnie na obietnicę z reklamy.",
    scope: [
      { title: "Cel kampanii", text: "Zaczynamy od odbiorcy, źródła wejścia i jednej głównej akcji. Dzięki temu każda sekcja ma jasną rolę w opowieści o ofercie." },
      { title: "Układ pod decyzję", text: "Porządkujemy korzyści, szczegóły i odpowiedzi na wątpliwości. CTA pojawia się w kontekście, który pomaga zrozumieć kolejny krok." },
      { title: "Copywriting", text: "Dopasowujemy nagłówki, opisy i komunikaty przy kontakcie do oferty. Używamy potwierdzonych informacji zamiast nieudokumentowanych obietnic." },
      { title: "Pomiar zdarzeń", text: "Ustalamy, które działania mają być mierzone, na przykład wysłanie formularza. Narzędzia, dostęp do kont i konfiguracja wymagają uzgodnienia." },
    ],
    projectNote: "W portfolio znajdziesz różne sposoby pokazania oferty. Wybierz bliski Ci styl i sposób prowadzenia treści — wykorzystamy ten punkt odniesienia w rozmowie o Twojej kampanii.",
    preparation: "Prześlij opis promowanej oferty, odbiorcę reklamy i oczekiwaną akcję. Dodaj treść lub kierunek kampanii, dostępne materiały oraz informację o używanych narzędziach pomiarowych.",
    process: [
      { title: "Brief kampanii", text: "Określamy, skąd przyjdzie odbiorca i czego oczekuje po kliknięciu. Ustalamy cel strony oraz zakres treści." },
      { title: "Narracja i projekt", text: "Budujemy kolejność argumentów, odpowiedzi i CTA. Dopasowujemy kierunek wizualny do marki oraz komunikatu kampanii." },
      { title: "Wdrożenie i pomiar", text: "Wdrażamy stronę i uzgodnione zdarzenia. Przed uruchomieniem ustalamy sposób sprawdzenia akcji docelowej i dostępów do pomiaru." },
    ],
    pricing: "O wycenie landing page decyduje nie tylko długość strony, lecz także potrzebne teksty, elementy wizualne i sposób obsługi akcji docelowej.",
    pricingFactors: ["Liczba sekcji i gotowość treści", "Formularz lub inna akcja docelowa", "Narzędzia analityczne i integracje", "Warianty strony i późniejsze zmiany"],
    faq: [
      { question: "Czym landing page różni się od strony firmowej?", answer: "Landing page skupia się na jednej kampanii i głównej akcji. Strona firmowa przedstawia markę oraz szerszą ofertę. Wybór zależy od tego, z jaką intencją trafia do Ciebie odbiorca." },
      { question: "Czy możecie przygotować landing do reklamy?", answer: "Tak, tworzymy landing page pod kampanię i jej CTA. Potrzebujemy informacji o reklamowanej ofercie, odbiorcy i przekazie reklamy. Zakup reklam oraz prowadzenie kampanii nie wynikają automatycznie z zamówienia strony." },
      { question: "Jak sprawdzimy, czy odbiorcy wykonują wybraną akcję?", answer: "W ramach uzgodnionego pomiaru określamy kluczowe zdarzenia i narzędzie analityczne. Możliwość wdrożenia zależy także od dostępów i konfiguracji. Sama liczba wejść nie mówi jeszcze, ile osób wysłało zapytanie." },
      { question: "Czy gwarantujecie określoną liczbę zapytań?", answer: "Nie deklarujemy liczby zapytań ani współczynnika konwersji. Wpływają na nie między innymi oferta, ruch, reklamy i grupa odbiorców. Projekt strony może wspierać decyzję, ale nie kontroluje wszystkich tych czynników." },
      { question: "Czy po starcie można zmienić tekst lub dodać sekcję?", answer: "Takie zmiany możemy omówić w ramach opieki i rozwoju. Zakres, wycenę i termin ustalamy osobno. Testy różnych wariantów strony również wymagają ustalenia, nie są domyślnym elementem każdego projektu." },
    ],
    cta: "Opisz cel swojej kampanii",
  },
  {
    slug: "modernizacja-stron",
    title: "Modernizacja stron internetowych",
    description: "Odświeżenie strony z NowaWeb: audyt obecnej witryny, czytelna struktura, nowy kierunek wizualny i lepsza czytelność na mobile. Poznaj zasady współpracy.",
    image: "/assets/nowaweb/services/website-refresh.webp",
    accent: "Nowy porządek dla obecnej strony.",
    intro: "Odświeżamy wygląd i strukturę na bazie obecnej witryny. Zaczynamy od sprawdzenia, co już działa, co utrudnia odbiór oferty i co wymaga przebudowy.",
    audience: "Dla firm, których strona nie nadąża za ofertą, ma nieczytelny układ na telefonie lub wymaga uporządkowania treści. Zakres zmian wynika z przeglądu, nie z samego wieku strony.",
    scope: [
      { title: "Audyt obecnej strony", text: "Przyglądamy się strukturze, prezentacji oferty i ścieżce do kontaktu. Wskazujemy obszary, od których warto zacząć prace." },
      { title: "Hierarchia informacji", text: "Porządkujemy menu, nagłówki i kolejność sekcji. Aktualne materiały mogą być punktem wyjścia, jeśli odpowiadają dzisiejszej ofercie." },
      { title: "Nowy kierunek wizualny", text: "Odświeżamy układ i sposób prezentacji marki. Ustalamy, które elementy identyfikacji zachować, a które wymagają zmian." },
      { title: "Czytelność na mobile", text: "Sprawdzamy, jak treści, nawigacja i kontakt układają się na małym ekranie. Projektujemy je z myślą o wygodnym czytaniu i obsłudze." },
    ],
    projectNote: "Zobacz, jak różne układy i sposoby prezentacji oferty budują charakter strony. Wspólnie ustalimy, jaki kierunek modernizacji odpowiada Twojej marce.",
    preparation: "Wyślij adres obecnej strony i krótko opisz problemy. Wskaż ważne podstrony, treści do zachowania oraz funkcje, które muszą pozostać. Nie przesyłaj haseł w formularzu kontaktowym.",
    process: [
      { title: "Przegląd i priorytety", text: "Oglądamy obecną witrynę i omawiamy problemy. Rozdzielamy potrzebne korekty od zmian, które wymagają szerszej przebudowy." },
      { title: "Treści i adresy", text: "Przed zmianą struktury trzeba ustalić, które treści i adresy zachować. Przy migracji zakres przenoszenia, przekierowań i kontroli po starcie wymaga osobnego uzgodnienia." },
      { title: "Projekt i wdrożenie", text: "Przygotowujemy nowy układ w ustalonym zakresie. Sposób publikacji, wymagane dostępy i termin przełączenia omawiamy dla konkretnej witryny." },
    ],
    pricing: "Wycena zależy od stanu obecnej strony i głębokości zmian. Korekta wybranych sekcji, nowa struktura i przeniesienie całej witryny wymagają innego nakładu pracy.",
    pricingFactors: ["Stan techniczny i liczba podstron", "Zakres zmian w treści i projekcie", "Funkcje oraz integracje do zachowania", "Ewentualne przenoszenie treści i adresów"],
    faq: [
      { question: "Czy trzeba budować stronę od początku?", answer: "Nie zawsze. Najpierw warto ocenić obecną strukturę i technologię. Dopiero po przeglądzie można określić, czy wystarczy odświeżenie wybranych elementów, czy potrzebna będzie przebudowa." },
      { question: "Czy można zachować obecną domenę?", answer: "Modernizacja sama w sobie nie wymaga zmiany domeny. Sposób publikacji i potrzebne dostępy zależą od obecnej konfiguracji. Ustalamy je przed wdrożeniem." },
      { question: "Co stanie się ze starymi adresami podstron?", answer: "Przy zmianie adresów trzeba przygotować mapę dotychczasowych i nowych URL oraz uzgodnić przekierowania. Zachowanie ważnych adresów jest punktem do sprawdzenia przed migracją. Nie zakładamy automatycznie, że każda modernizacja obejmuje pełną migrację." },
      { question: "Czy modernizacja może wpłynąć na widoczność w Google?", answer: "Tak, zmiany treści, adresów i struktury mogą wpłynąć na indeksację oraz ruch. Dlatego trzeba uwzględnić istniejące podstrony i pomiar przed zmianami. Nie gwarantujemy zachowania ani wzrostu pozycji." },
      { question: "Czy przejmujecie każdą stronę do modernizacji?", answer: "Możliwości zależą od technologii, stanu witryny i dostępów. Prześlij jej adres oraz opis potrzeb. Dopiero po rozpoznaniu możemy określić możliwy zakres prac." },
    ],
    cta: "Pokaż nam obecną stronę",
  },
  {
    slug: "opieka-nad-strona",
    title: "Opieka nad stroną internetową",
    description: "Opieka i rozwój strony z NowaWeb: aktualizacje treści, nowe sekcje i wsparcie techniczne. Sprawdź, jak ustalamy zakres, priorytety i zasady współpracy.",
    image: "/assets/nowaweb/services/care-growth.webp",
    accent: "Strona zmienia się razem z firmą.",
    intro: "Po publikacji oferta nie stoi w miejscu. Pomagamy aktualizować treści, poprawiać działanie strony i rozwijać ją o kolejne sekcje, gdy pojawia się taka potrzeba.",
    audience: "Dla firm, które potrzebują kontaktu technicznego po starcie i chcą utrzymywać aktualną prezentację swojej oferty. Zasady opieki dobieramy do konkretnej witryny.",
    scope: [
      { title: "Aktualizacje treści", text: "Zmiany opisów usług, zdjęć i informacji o firmie pomagają utrzymać zgodność strony z aktualną ofertą. Materiały i priorytety ustalamy przed pracą." },
      { title: "Kolejne sekcje", text: "Rozwijamy stronę, kiedy pojawia się nowa usługa lub kampania. Większe zmiany wymagają określenia zakresu oraz odrębnej wyceny." },
      { title: "Wsparcie techniczne", text: "Pomagamy w sprawach związanych z działaniem strony. Możliwy zakres wsparcia zależy od technologii, dostępów i ustalonych zasad współpracy." },
      { title: "Stabilność i wydajność", text: "W ramach ustalonej opieki zajmujemy się aktualizacjami i działaniem witryny. Częstotliwość kontroli oraz odpowiedzialność za poszczególne elementy wymagają doprecyzowania." },
    ],
    projectNote: "Zobacz projekty w naszym portfolio i sposoby prezentowania firmowej oferty. Mogą podsunąć Ci pomysł na kolejną sekcję lub rozwinięcie opisu własnych usług.",
    preparation: "Podaj adres strony, technologię — jeśli ją znasz — oraz przykłady potrzebnych zmian. Napisz, jak często aktualizujesz ofertę i czy masz pilny problem techniczny. Nie dołączaj haseł.",
    process: [
      { title: "Rozpoznanie strony", text: "Poznajemy witrynę, jej konfigurację oraz potrzeby. Ustalamy, które elementy możemy objąć wsparciem." },
      { title: "Zasady i zgłoszenia", text: "Przed rozpoczęciem opieki trzeba określić sposób zgłaszania zmian, limity prac, priorytety i czas reakcji. Nie zakładamy jednego pakietu dla każdej strony." },
      { title: "Zmiany i rozwój", text: "Realizujemy uzgodnione aktualizacje. Jeśli zgłoszenie wykracza poza przyjęty zakres, najpierw ustalamy dodatkową pracę i jej koszt." },
    ],
    pricing: "Koszt opieki wynika z potrzeb i uzgodnionej odpowiedzialności. Regularne zmiany treści i większa rozbudowa to różne zadania, dlatego zakres powinien być opisany przed rozpoczęciem współpracy.",
    pricingFactors: ["Technologia i stan istniejącej strony", "Częstotliwość oraz wielkość zmian", "Zakres wsparcia i uzgodniony czas reakcji", "Prace rozwojowe poza bieżącą opieką"],
    faq: [
      { question: "Czy opieka obejmuje nieograniczoną liczbę zmian?", answer: "Nie należy tego zakładać. Liczbę lub wymiar prac, sposób rozliczenia i zasady dodatkowych zleceń trzeba ustalić w ofercie. Większa przebudowa nie jest automatycznie częścią bieżącej aktualizacji treści." },
      { question: "Jaki jest czas reakcji na zgłoszenie?", answer: "Czas reakcji i obsługiwane godziny wymagają indywidualnego uzgodnienia. Kontakt po starcie nie oznacza domyślnie całodobowego dyżuru. Przy pilnym problemie opisz jego objawy i wpływ na działanie strony." },
      { question: "Czy opieka zawiera hosting i odnowienie domeny?", answer: "Nie należy traktować ich jako automatycznej części usługi. Domena, hosting i zewnętrzne narzędzia mogą mieć osobne opłaty i właścicieli kont. Ich obsługę oraz koszty trzeba wyraźnie ustalić." },
      { question: "Czy mogę zgłosić stronę wykonaną przez kogoś innego?", answer: "Możesz przesłać jej adres do wstępnego rozpoznania. Możliwość objęcia opieką zależy od technologii, dokumentacji i dostępów. Nie potwierdzamy zakresu przed sprawdzeniem tych informacji." },
      { question: "Czy opieka obejmuje nowe podstrony i kampanie?", answer: "Rozwój kolejnych sekcji i kampanii należy do naszej oferty. To, czy dana zmiana mieści się w bieżącej opiece, zależy od uzgodnionego zakresu. Nowe funkcje i większe podstrony mogą wymagać osobnej wyceny." },
    ],
    cta: "Napisz, czego potrzebuje Twoja strona",
  },
];
