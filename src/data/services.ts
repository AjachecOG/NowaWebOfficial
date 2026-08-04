export type ServiceOffer = {
  slug: string;
  title: string;
  image: string;
  benefit: string;
  points: string[];
  metaTitle: string;
  metaDescription: string;
  intro: string;
  forWhom: string[];
  scope: string[];
  workflow: string[];
  beforeStart: string;
};

export const services: ServiceOffer[] = [
  {
    slug: "strony-firmowe",
    title: "Strony firmowe",
    image: "/assets/nowaweb/services/corporate-websites.webp",
    benefit: "Oferta, realizacje i kontakt ułożone w czytelną całość.",
    points: ["Architektura informacji", "Projekt dopasowany do marki", "Wdrożenie w Astro"],
    metaTitle: "Strony firmowe dla firm",
    metaDescription:
      "Projektujemy i wdrażamy szybkie strony firmowe bez WordPressa: struktura oferty, indywidualny design i opieka po publikacji. Wrocław i cała Polska.",
    intro:
      "Strona firmowa powinna w kilka chwil wyjaśnić, czym zajmuje się firma, dlaczego warto jej zaufać i jak rozpocząć rozmowę. Projektujemy cały ten proces: od struktury informacji i tekstów po gotowe wdrożenie.",
    forWhom: [
      "firm, których obecna strona nie pokazuje już aktualnej oferty",
      "marek usługowych potrzebujących wiarygodnego miejsca do kierowania klientów",
      "zespołów, które chcą rozwijać serwis o kolejne usługi i kampanie",
    ],
    scope: [
      "rozmowa o celach, odbiorcach i najważniejszych usługach",
      "mapa podstron i kolejność informacji na każdej z nich",
      "projekt interfejsu dopasowany do identyfikacji marki",
      "responsywne wdrożenie, formularz kontaktowy i techniczne SEO",
      "publikacja oraz ustalony zakres opieki po starcie",
    ],
    workflow: [
      "Najpierw ustalamy, z jakim pytaniem przychodzi klient i jakiej odpowiedzi potrzebuje przed wysłaniem zapytania. Na tej podstawie powstaje struktura, a nie odwrotnie.",
      "Po zaakceptowaniu kierunku projektujemy widoki i wdrażamy je w lekkim, statycznym stacku. Treść znajduje się w HTML, więc jest dostępna dla użytkowników i wyszukiwarek bez czekania na JavaScript.",
      "Przed publikacją sprawdzamy wersję mobilną, formularze, przekierowania, metadane, sitemapę i podstawowe zabezpieczenia.",
    ],
    beforeStart:
      "Przed wyceną ustalamy liczbę podstron, stan materiałów, zakres copywritingu, potrzebne integracje i sposób późniejszych aktualizacji. Dzięki temu oferta opisuje konkretny rezultat, a nie anonimowy pakiet.",
  },
  {
    slug: "landing-page",
    title: "Landing page",
    image: "/assets/nowaweb/services/landing-page.webp",
    benefit: "Jedna kampania, jedna oferta i jedno główne działanie.",
    points: ["Układ pod konwersję", "Copy prowadzące do kontaktu", "Pomiar kluczowych działań"],
    metaTitle: "Landing page dla kampanii",
    metaDescription:
      "Landing page dla kampanii reklamowej lub konkretnej usługi: strategia, copy, indywidualny projekt i szybkie wdrożenie bez WordPressa.",
    intro:
      "Landing page skupia uwagę na jednej ofercie. Zamiast przenosić cały serwis firmowy na osobny adres, układamy krótką drogę od obietnicy przez dowody i odpowiedzi na obiekcje do jednego działania.",
    forWhom: [
      "kampanii Google Ads, social media lub mailingowych",
      "premiery nowej usługi, produktu albo zapisów na wydarzenie",
      "firm, które chcą przetestować ofertę przed rozbudową całej strony",
    ],
    scope: [
      "ustalenie odbiorcy, źródła ruchu i głównego celu strony",
      "struktura sekcji oraz teksty przy nagłówkach, dowodach i CTA",
      "indywidualny projekt desktop i mobile",
      "formularz lub inne uzgodnione działanie konwersyjne",
      "wdrożenie, metadane i przygotowanie do pomiaru zdarzeń",
    ],
    workflow: [
      "Zaczynamy od konkretnej kampanii: inny układ potrzebny jest osobie z reklamy porównującej oferty, a inny odbiorcy, który już zna markę.",
      "Projekt nie ukrywa brakujących informacji za efektami wizualnymi. Najpierw porządkujemy argumenty, potem nadajemy im hierarchię i charakter marki.",
      "Po wdrożeniu możemy rozwijać warianty treści lub kolejne landingi bez przebudowy całej strony firmowej.",
    ],
    beforeStart:
      "Potrzebujemy opisu oferty, informacji o odbiorcy, celu kampanii oraz materiałów, które potwierdzają obietnicę: realizacji, procesu, danych produktu albo zasad współpracy.",
  },
  {
    slug: "one-page",
    title: "Strony one page",
    image: "/assets/nowaweb/services/one-page.webp",
    benefit: "Najważniejsze informacje i kontakt na jednej stronie.",
    points: ["Zwarta struktura", "Płynna narracja", "Kontakt zawsze pod ręką"],
    metaTitle: "Strony one page dla firm",
    metaDescription:
      "Projektujemy strony one page dla małych firm i marek osobistych: oferta, proces, realizacje i kontakt w lekkim wdrożeniu bez WordPressa.",
    intro:
      "One page jest dobrym rozwiązaniem, gdy oferta jest skupiona, a użytkownik nie potrzebuje rozbudowanego katalogu podstron. Wszystkie ważne informacje układamy w jedną, logiczną historię zakończoną kontaktem.",
    forWhom: [
      "nowych firm i marek osobistych z jedną główną ofertą",
      "lokalnych usług, dla których liczy się szybkie znalezienie informacji",
      "projektów potrzebujących solidnej strony startowej z możliwością rozbudowy",
    ],
    scope: [
      "hierarchia oferty i wybór informacji, które naprawdę są potrzebne",
      "projekt kolejnych sekcji oraz spójne przejścia między nimi",
      "wersja mobilna projektowana razem z desktopem",
      "formularz, dane firmy, podstawowe SEO i analityka po uzgodnieniu zgód",
      "publikacja na domenie i przygotowanie do dalszej rozbudowy",
    ],
    workflow: [
      "Ograniczenie do jednej strony nie oznacza skrótowego traktowania treści. Każda sekcja ma odpowiadać na konkretne pytanie użytkownika i prowadzić do następnej.",
      "Budujemy komponenty tak, aby w przyszłości można było przenieść usługę, realizacje lub FAQ na osobny adres bez zaczynania projektu od zera.",
    ],
    beforeStart:
      "Wspólnie sprawdzamy, czy one page rzeczywiście pasuje do liczby usług i celów firmy. Jeżeli osobne podstrony będą potrzebne do zrozumienia oferty lub SEO, powiemy to przed rozpoczęciem projektu.",
  },
  {
    slug: "odswiezenie-strony",
    title: "Odświeżenie strony internetowej",
    image: "/assets/nowaweb/services/website-refresh.webp",
    benefit: "Nowa struktura i wygląd z poszanowaniem tego, co już działa.",
    points: ["Audyt obecnej strony", "Nowa hierarchia", "Lepsza wersja mobilna"],
    metaTitle: "Odświeżenie strony internetowej",
    metaDescription:
      "Audytujemy i odświeżamy istniejące strony internetowe: struktura oferty, design, mobile, wydajność i bezpieczna migracja ważnych adresów URL.",
    intro:
      "Redesign nie powinien polegać tylko na zmianie kolorów. Sprawdzamy, które treści i adresy pracują na widoczność firmy, co utrudnia kontakt oraz gdzie technologia ogranicza rozwój strony.",
    forWhom: [
      "firm, których oferta zmieniła się od ostatniego wdrożenia",
      "stron trudnych w obsłudze lub słabych na urządzeniach mobilnych",
      "marek planujących odejście od ciężkiego motywu i wielu wtyczek",
    ],
    scope: [
      "audyt treści, nawigacji, kluczowych adresów i wersji mobilnej",
      "lista elementów do zachowania, poprawy i usunięcia",
      "nowa architektura informacji oraz kierunek wizualny",
      "wdrożenie z mapą przekierowań dla zmienianych adresów",
      "kontrola formularzy, metadanych i plików indeksacyjnych po publikacji",
    ],
    workflow: [
      "Nie kasujemy starego serwisu bez mapy. Najpierw spisujemy istniejące adresy i sprawdzamy, które z nich powinny zostać bez zmian, a które wymagają przekierowania 301.",
      "Projektujemy nową wersję na podstawie aktualnej oferty, nie tylko wyglądu poprzedniej strony. Dzięki temu redesign porządkuje komunikację, zamiast przenosić dawny chaos do nowszego szablonu.",
    ],
    beforeStart:
      "Potrzebujemy dostępu do obecnej strony, listy ważnych materiałów oraz informacji, co działa dziś w sprzedaży. Dane z Search Console lub analityki są pomocne, jeśli firma je posiada.",
  },
  {
    slug: "ux-copywriting",
    title: "UX i copywriting stron",
    image: "/assets/nowaweb/services/ux-copywriting.webp",
    benefit: "Teksty i układ oparte na pytaniach prawdziwych klientów.",
    points: ["Propozycja wartości", "Struktura sekcji", "Mikrocopy i CTA"],
    metaTitle: "UX i copywriting stron",
    metaDescription:
      "Porządkujemy strukturę i teksty stron firmowych oraz landing page: propozycja wartości, argumenty, mikrocopy, formularze i jasne CTA.",
    intro:
      "Dobry tekst na stronie nie brzmi jak katalog obietnic. Wyjaśnia ofertę językiem odbiorcy, pokazuje różnice i odpowiada na obawy, które pojawiają się przed kontaktem.",
    forWhom: [
      "firm z dobrą usługą, ale ogólnikowym opisem oferty",
      "projektów, w których design powstaje, a treści nadal są tymczasowe",
      "istniejących stron wymagających uporządkowania bez pełnego redesignu",
    ],
    scope: [
      "rozmowa o klientach, ofercie, obiekcjach i procesie sprzedaży",
      "propozycja wartości oraz kolejność informacji na stronie",
      "nagłówki, treści sekcji, CTA i komunikaty przy formularzach",
      "uwagi UX do nawigacji, długości sekcji i wersji mobilnej",
      "materiał gotowy do projektu lub wdrożenia na istniejącej stronie",
    ],
    workflow: [
      "Zamiast dopisywać synonimy słowa „profesjonalny”, szukamy faktów: zakresu odpowiedzialności, sposobu pracy, ograniczeń i dowodów, które klient może sam ocenić.",
      "Treść testujemy pod kątem skanowania. Najważniejsze informacje muszą być zrozumiałe także wtedy, gdy użytkownik czyta nagłówki i krótkie akapity, a nie każde zdanie.",
    ],
    beforeStart:
      "Najbardziej pomagają materiały używane już w sprzedaży: oferty, wiadomości od klientów, pytania z rozmów i przykłady realizacji. Nie wymagamy gotowego briefu marketingowego.",
  },
  {
    slug: "opieka-i-rozwoj",
    title: "Opieka i rozwój strony",
    image: "/assets/nowaweb/services/care-growth.webp",
    benefit: "Aktualizacje, poprawki i nowe sekcje po publikacji.",
    points: ["Aktualizacje treści", "Rozwój podstron", "Wsparcie techniczne"],
    metaTitle: "Opieka nad stroną internetową",
    metaDescription:
      "Zapewniamy opiekę po wdrożeniu strony: aktualizacje treści, poprawki techniczne, nowe sekcje i landingi oraz kontrolę działania serwisu.",
    intro:
      "Publikacja nie zamyka pracy nad stroną. Oferta firmy się zmienia, pojawiają się nowe realizacje i kampanie, a formularze oraz kluczowe ścieżki trzeba regularnie sprawdzać.",
    forWhom: [
      "klientów NowaWeb potrzebujących stałego kontaktu po wdrożeniu",
      "firm bez wewnętrznej osoby do zmian technicznych i publikacji treści",
      "marek rozwijających kolejne usługi, realizacje i kampanie",
    ],
    scope: [
      "aktualizacje opisów, danych kontaktowych, zdjęć i realizacji",
      "poprawki usterek oraz kontrola formularzy i kluczowych linków",
      "nowe sekcje, podstrony usługowe i landingi kampanii",
      "przegląd wydajności, metadanych i informacji dla wyszukiwarek",
      "ustalony kanał kontaktu i kolejność zgłoszeń",
    ],
    workflow: [
      "Zakres opieki dopasowujemy do częstotliwości zmian. Firma, która aktualizuje ofertę raz na kwartał, nie potrzebuje tego samego modelu co zespół prowadzący kilka kampanii miesięcznie.",
      "Przy większych zmianach najpierw opisujemy zadanie i jego wpływ na istniejącą stronę. Dzięki temu drobna aktualizacja nie zamienia się niespodziewanie w przebudowę całego serwisu.",
    ],
    beforeStart:
      "Ustalamy technologię strony, dostęp do hostingu lub repozytorium, oczekiwany czas reakcji i typowe rodzaje zmian. W przypadku cudzych wdrożeń zaczynamy od krótkiego audytu technicznego.",
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}
