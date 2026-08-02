export type PricingTier = {
  name: string;
  price: string;
  blurb: string;
  includes: string[];
  href: string;
  featured?: boolean;
};

export const pricingTiers: PricingTier[] = [
  {
    name: "Landing / one page",
    price: "od 2 500 zł",
    blurb: "Jedna strona pod kampanię albo wizytówkę firmy.",
    includes: ["Układ pod jedno CTA", "Copy bazowe sekcji", "Wdrożenie lekkie, bez WordPressa"],
    href: "/uslugi/landing-page/",
  },
  {
    name: "Strona firmowa",
    price: "od 4 500 zł",
    blurb: "Oferta, proces, realizacje i kontakt — pod zbieranie zapytań.",
    includes: ["Architektura informacji", "Projekt + wdrożenie", "Formularz i opieka startowa"],
    href: "/uslugi/strony-firmowe/",
    featured: true,
  },
  {
    name: "Odświeżenie / opieka",
    price: "od 3 500 zł / od 400 zł mc",
    blurb: "Nowa wersja istniejącej strony albo stały rozwój po starcie.",
    includes: ["Audyt obecnej strony", "Migracja lub redesign", "Aktualizacje i kolejne sekcje"],
    href: "/uslugi/odswiezenie-strony/",
  },
];
