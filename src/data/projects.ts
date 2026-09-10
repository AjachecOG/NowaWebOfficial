export const projects = [
  {
    slug: "cakepops", name: "Cakepops.pl",
    image: "/assets/nowaweb/portfolio/cakepops.webp", width: 1400, height: 767,
    summary: "Jasne tło, elegancka typografia i produkt w centrum uwagi.",
    category: "Prezentacja produktu", serviceHref: "/strony-internetowe-dla-firm/",
    alt: "Podgląd Cakepops.pl: jasna strona z dużym zdjęciem cakepopsa, nagłówkiem i przyciskami kontaktu oraz oferty.",
  },
  {
    slug: "new-york-rolls", name: "New York Rolls",
    image: "/assets/nowaweb/portfolio/new-york-rolls.webp", width: 1400, height: 663,
    summary: "Miejski kadr, mocny nagłówek i wyrazista prezentacja wypieków.",
    category: "Strona produktowa", serviceHref: "/landing-page/",
    alt: "Podgląd New York Rolls: nowojorska ulica w tle, duża typografia i przyciski zapytania o ofertę oraz wyboru smaków.",
  },
  {
    slug: "atmo-vision", name: "Atmo - Vision",
    image: "/assets/nowaweb/portfolio/atmo-vision.webp", width: 1400, height: 671,
    summary: "Techniczny charakter, architektura i czytelny przegląd usług.",
    category: "Prezentacja usług", serviceHref: "/strony-internetowe-dla-firm/",
    alt: "Podgląd Atmo - Vision: ilustracja budynku i drona, cztery kategorie usług oraz żółty przycisk oferty.",
  },
] as const;

export type Project = (typeof projects)[number];
