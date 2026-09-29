export const site = {
  brand: "NowaWeb",
  url: "https://nowaweb.pl",
  email: "kontakt@nowaweb.pl",
  phoneDisplay: "+48 794 346 581",
  phoneHref: "tel:+48794346581",
} as const;

export const legalLinks = [
  { href: "/kontakt/", label: "Kontakt" },
  { href: "/polityka-prywatnosci/", label: "Polityka prywatności" },
  { href: "/polityka-cookies/", label: "Polityka cookies" },
  { href: "/regulamin/", label: "Regulamin" },
] as const;

export type SiteConfig = typeof site;
