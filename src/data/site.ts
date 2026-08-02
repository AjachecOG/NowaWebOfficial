export const site = {
  brand: "NowaWeb",
  url: "https://nowaweb.pl",
  email: "kontakt@nowaweb.pl",
  phoneDisplay: "+48 794 346 581",
  phoneHref: "tel:+48794346581",
  company: {
    legalName: "Revela Sp. z o.o.",
    addressLine: "ul. Muchoborska 18",
    postalCode: "54-424",
    city: "Wrocław",
    country: "Polska",
    nip: "8971850142",
    krs: "0000711172",
    regon: "369088470",
    court:
      "Sąd Rejonowy dla Wrocławia-Fabrycznej we Wrocławiu, VI Wydział Gospodarczy KRS",
  },
} as const;

export const legalLinks = [
  { href: "/kontakt/", label: "Kontakt" },
  { href: "/polityka-prywatnosci/", label: "Polityka prywatności" },
  { href: "/polityka-cookies/", label: "Polityka cookies" },
  { href: "/regulamin/", label: "Regulamin" },
] as const;

export type SiteConfig = typeof site;
