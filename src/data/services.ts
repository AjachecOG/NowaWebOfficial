export type ServiceOffer = {
  slug: string;
  title: string;
  shortTitle: string;
  image: string;
  benefit: string;
  points: string[];
  metaTitle: string;
  metaDescription: string;
  intro: string;
  body: string[];
  outcomes: string[];
  priceFrom: string;
};

export const services: ServiceOffer[] = [
  {
    slug: "strony-firmowe",
    title: "Strony firmowe",
    shortTitle: "Strona firmowa",
    image: "/assets/nowaweb/services/corporate-websites.webp",
    benefit: "Strona firmowa: oferta, referencje i jasny kontakt.",
    points: ["Architektura informacji", "Projekt dopasowany do marki", "Szybkie wdrożenie w Astro"],
    metaTitle: "Strony firmowe bez WordPressa",
    metaDescription:
      "Projektujemy i wdrażamy strony firmowe bez WordPressa: czytelna oferta, szybkie ładowanie i kontakt, który zbiera zapytania. NowaWeb — zdalnie w całej Polsce.",
    intro:
      "Strona firmowa ma prowadzić od oferty do rozmowy. Budujemy ją pod Twoją markę: strukturę, teksty i wdrożenie bez motywu WordPress oraz bez zbędnych wtyczek.",
    body: [
      "Zaczynamy od briefu: kto ma zostawić kontakt, jakie usługi pokazujemy najpierw i czego klient boi się przed decyzją. Na tej podstawie powstaje mapa sekcji i szkic copy.",
      "Projekt i kod robimy w lekkim stacku (Astro). Dzięki temu strona firmowa ładuje się szybko, a późniejsze zmiany nie wymagają walki z motywem i aktualizacjami wtyczek.",
      "Po starcie zostajemy przy opiece: poprawki, treści i rozwój kolejnych podstron, gdy oferta firmy się zmienia.",
    ],
    outcomes: [
      "Jedna spójna narracja oferty zamiast przypadkowych zakładek",
      "Wyraźne CTA i formularz / kontakt na kluczowych ekranach",
      "Wdrożenie gotowe pod rozwój (kolejne usługi, landingi, kampanie)",
    ],
    priceFrom: "od 4 500 zł",
  },
  {
    slug: "landing-page",
    title: "Landing page",
    shortTitle: "Landing page",
    image: "/assets/nowaweb/services/landing-page.webp",
    benefit: "Landing pod jedną kampanię i jedno CTA.",
    points: ["Układ pod konwersję", "Copy prowadzące do kontaktu", "Pomiar kluczowych zdarzeń"],
    metaTitle: "Landing page pod konwersję",
    metaDescription:
      "Landing page pod jedną kampanię i jedno CTA: układ, copy i wdrożenie bez WordPressa. NowaWeb projektuje strony, które zbierają leady.",
    intro:
      "Landing page ma jeden job: doprowadzić do zapytania, rozmowy albo zapisu. Projektujemy go wokół oferty kampanii, nie wokół całego katalogu firmy.",
    body: [
      "Układamy hierarchię: obietnica, dowód, szczegóły, obiekcje, CTA. Teksty piszemy tak, żeby odpowiadały na pytania, które i tak pojawią się przy decyzji.",
      "Technicznie to lekka, szybka strona — często one-screen flow lub krótka sekwencja sekcji — gotowa pod Ads / social / mailing.",
      "Na życzenie podpinamy zdarzenia konwersji (bez zbędnego śledzenia „na zapas”).",
    ],
    outcomes: [
      "Jedno główne CTA zamiast rozproszonej nawigacji",
      "Sekcje pod obiekcje i dowód (realizacje, proces, kontakt)",
      "Szybkie wdrożenie pod start kampanii",
    ],
    priceFrom: "od 2 500 zł",
  },
  {
    slug: "one-page",
    title: "One page",
    shortTitle: "One page",
    image: "/assets/nowaweb/services/one-page.webp",
    benefit: "Jedna strona z najważniejszymi informacjami i kontaktem.",
    points: ["Najważniejsze informacje", "Płynna narracja", "Kontakt zawsze pod ręką"],
    metaTitle: "One page — strona wizytówka",
    metaDescription:
      "One page dla firm i marek osobistych: oferta, proces i kontakt na jednej stronie. Szybkie wdrożenie bez WordPressa — NowaWeb.",
    intro:
      "One page sprawdza się, gdy firma potrzebuje czytelnej wizytówki online: kim jesteście, co robicie, jak zacząć współpracę.",
    body: [
      "Składamy jedną płynną narrację zamiast rozbudowanego menu. Każda sekcja ma jedno zadanie i prowadzi do kontaktu.",
      "To dobry start dla nowych marek i usług lokalnych: mniej utrzymania, więcej jasności, łatwy rozwój w stronę pełnej strony firmowej później.",
    ],
    outcomes: [
      "Komplet informacji na jednej stronie",
      "Mniej decyzji dla użytkownika — więcej zapytań",
      "Baza pod rozbudowę o kolejne podstrony",
    ],
    priceFrom: "od 3 000 zł",
  },
  {
    slug: "odswiezenie-strony",
    title: "Odświeżenie strony",
    shortTitle: "Odświeżenie",
    image: "/assets/nowaweb/services/website-refresh.webp",
    benefit: "Odświeżamy wygląd i strukturę na bazie obecnej strony.",
    points: ["Audyt obecnej strony", "Nowy rytm i hierarchia", "Lepsza czytelność na mobile"],
    metaTitle: "Odświeżenie strony internetowej",
    metaDescription:
      "Odświeżenie istniejącej strony: audyt, nowa struktura, czytelniejszy design i lżejsze wdrożenie. NowaWeb — bez konieczności trzymania się starego WordPressa.",
    intro:
      "Masz stronę, która „jakoś działa”, ale nie zbiera zapytań? Robimy audyt, porządkujemy ofertę i budujemy nową wersję pod decyzję klienta.",
    body: [
      "Sprawdzamy, co warto zachować (treści, SEO URL, portfolio), a co blokuje konwersję: chaos w menu, wolne ładowanie, niejasne CTA.",
      "Często najlepszym ruchem jest odejście od ciężkiego WordPressa na rzecz lekkiego wdrożenia — z przekierowaniami 301, żeby nie tracić wypracowanych adresów.",
    ],
    outcomes: [
      "Czytelniejsza hierarchia oferty",
      "Lepsze mobile i szybkość",
      "Plan migracji bez zbędnego ryzyka SEO",
    ],
    priceFrom: "od 3 500 zł",
  },
  {
    slug: "ux-copywriting",
    title: "UX + copywriting",
    shortTitle: "UX i copy",
    image: "/assets/nowaweb/services/ux-copywriting.webp",
    benefit: "Teksty i układ pod pytania, które klient i tak zada.",
    points: ["Jasna propozycja wartości", "Mikrocopy i CTA", "Struktura wspierająca decyzję"],
    metaTitle: "UX i copywriting stron firmowych",
    metaDescription:
      "UX i copywriting pod strony firmowe oraz landingi: propozycja wartości, struktura sekcji i CTA, które prowadzą do kontaktu. NowaWeb.",
    intro:
      "Nawet dobry design nie sprzeda, jeśli teksty są ogólnikowe. Układamy treść pod realne pytania klienta B2B i mikrocopy przy formularzach.",
    body: [
      "Pracujemy na briefie i rozmowie: język branży, obiekcje, różnica względem konkurencji. Potem powstaje struktura sekcji i wersja robocza copy.",
      "Możemy wejść na etapie makiety albo poprawić istniejącą stronę bez pełnego redesignu.",
    ],
    outcomes: [
      "Wyraźna propozycja wartości powyżej pierwszego ekranu",
      "Spójne CTA i mniej „pustych” sekcji",
      "Teksty gotowe do wdrożenia",
    ],
    priceFrom: "od 1 800 zł",
  },
  {
    slug: "opieka-i-rozwoj",
    title: "Opieka i rozwój",
    shortTitle: "Opieka",
    image: "/assets/nowaweb/services/care-growth.webp",
    benefit: "Opieka po starcie: treści, poprawki i kolejne sekcje.",
    points: ["Aktualizacje treści", "Rozwój kolejnych sekcji", "Wsparcie techniczne"],
    metaTitle: "Opieka i rozwój strony internetowej",
    metaDescription:
      "Opieka po wdrożeniu strony: aktualizacje treści, poprawki, nowe sekcje i wsparcie techniczne. NowaWeb nie znika po starcie.",
    intro:
      "Strona żyje razem z firmą. Po wdrożeniu zostajemy przy kontakcie: treści, drobne poprawki i rozwój oferty online.",
    body: [
      "Ustalamy pakiet godzin lub stałą opiekę — zależnie od tempa zmian w biznesie. Priorytetem jest szybka reakcja i brak chaosu w kolejce zadań.",
      "Rozwijamy też kolejne landingi i podstrony usług, gdy startuje nowa oferta lub kampania.",
    ],
    outcomes: [
      "Stały kontakt po starcie",
      "Aktualna oferta na stronie",
      "Kontrola wydajności i drobnych usterek",
    ],
    priceFrom: "od 400 zł / mc",
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}
