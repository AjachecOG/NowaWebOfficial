export type PortfolioCase = {
  slug: string;
  name: string;
  industry: string;
  image: string;
  width: number;
  height: number;
  metaTitle: string;
  metaDescription: string;
  summary: string;
  challenge: string;
  approach: string[];
  result: string;
};

export const projects: PortfolioCase[] = [
  {
    slug: "cakepops",
    name: "Cakepops.pl",
    industry: "Słodycze / e-commerce wizytówka",
    image: "/assets/nowaweb/portfolio/cakepops.webp",
    width: 1400,
    height: 767,
    metaTitle: "Case study: Cakepops.pl",
    metaDescription:
      "Case study NowaWeb: strona Cakepops.pl — oferta, klimat marki i czytelna ścieżka do kontaktu. Lekkie wdrożenie bez WordPressa.",
    summary:
      "Strona marki słodyczy, która ma sprzedawać klimat i ułatwiać kontakt / zamówienie, zamiast tonąć w szablonowym wyglądzie sklepu.",
    challenge:
      "Potrzebny był pierwszy ekran i układ, które od razu pokazują produkt i charakter marki — bez ciężkiego CMS i zbędnych zakładek.",
    approach: [
      "Hierarchia: produkt i atmosfera marki na pierwszym planie",
      "Sekcje prowadzące do decyzji (oferta → kontakt)",
      "Lekkie wdrożenie pod szybkie ładowanie na mobile",
    ],
    result:
      "Spójna wizytówka marki z czytelnym CTA. Realizacja w portfolio NowaWeb jako przykład strony produktowej poza typowym motywem WordPress.",
  },
  {
    slug: "new-york-rolls",
    name: "New York Rolls",
    industry: "Gastronomia",
    image: "/assets/nowaweb/portfolio/new-york-rolls.webp",
    width: 1400,
    height: 663,
    metaTitle: "Case study: New York Rolls",
    metaDescription:
      "Case study NowaWeb: strona New York Rolls — gastronomia, menu i kontakt w lekkim, czytelnym układzie.",
    summary:
      "Strona lokalu gastronomicznego: szybki odczyt oferty, klimat miejsca i prosta droga do kontaktu lub zamówienia.",
    challenge:
      "W gastronomii użytkownik scrolluje szybko. Trzeba było pokazać „co to jest” i „jak zamówić” bez przeładowania treścią.",
    approach: [
      "Mocny hero z charakterem marki",
      "Sekcje oferty ułożone pod skanowanie wzrokiem",
      "Kontakt i CTA zawsze w zasięgu",
    ],
    result:
      "Czytelna strona, która wygląda jak lokal, a nie jak szablon restauracji. Element portfolio pokazujący pracę pod branżę usługową.",
  },
  {
    slug: "atmo-vision",
    name: "Atmo - Vision",
    industry: "Usługi B2B / marka ekspercka",
    image: "/assets/nowaweb/portfolio/atmo-vision.webp",
    width: 1400,
    height: 671,
    metaTitle: "Case study: Atmo - Vision",
    metaDescription:
      "Case study NowaWeb: Atmo - Vision — strona firmowa z naciskiem na wiarygodność, ofertę i kontakt B2B.",
    summary:
      "Projekt pod markę ekspercką: spokojniejszy rytm, wiarygodność i oferta, która prowadzi do rozmowy biznesowej.",
    challenge:
      "Trzeba było uniknąć „korporacyjnego szumu” i jednocześnie wyglądać serio — szczególnie na mobile.",
    approach: [
      "Czysta typografia i hierarchia sekcji",
      "Oferta opisana językiem korzyści, nie haseł",
      "Formy kontaktu bez tarcia",
    ],
    result:
      "Strona, która buduje zaufanie przed rozmową. W portfolio jako przykład lekkiej strony firmowej B2B.",
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
