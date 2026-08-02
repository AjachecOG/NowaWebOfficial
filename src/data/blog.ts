export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingMinutes: number;
  sections: { heading: string; paragraphs: string[] }[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "strona-firmowa-bez-wordpressa",
    title: "Strona firmowa bez WordPressa — kiedy ma sens?",
    description:
      "Kiedy warto zejść z WordPressa przy stronie firmowej: szybkość, utrzymanie, bezpieczeństwo i realny wpływ na zapytania.",
    date: "2026-08-02",
    readingMinutes: 6,
    sections: [
      {
        heading: "WordPress nie jest zły — bywa nieproporcjonalny",
        paragraphs: [
          "WordPress sprawdza się przy blogach, sklepach i stronach, które redaguje wielu osób. Przy typowej stronie firmowej (oferta + realizacje + kontakt) często ciągnie za sobą motyw, wtyczki i aktualizacje, których biznes wcale nie potrzebuje.",
          "Efekt: wolniejsze ładowanie, więcej punktów awarii i budżet zjadany przez utrzymanie zamiast przez rozwój oferty.",
        ],
      },
      {
        heading: "Kiedy lekka strona wygrywa",
        paragraphs: [
          "Jeśli celem jest zbieranie zapytań, a treści zmieniają się rzadko, lepszy bywa statyczny / lekki stack: mniej JS, jasna struktura, szybki mobile.",
          "NowaWeb buduje takie strony m.in. na Astro — z formularzem, SEO technicznym i opieką po starcie, bez zmuszania Cię do panelu pełnego wtyczek.",
        ],
      },
      {
        heading: "Na co uważać przy zmianie",
        paragraphs: [
          "Przy odświeżeniu strony pilnujemy adresów URL i przekierowań 301, żeby nie gubić wypracowanych wyników. Zostawiamy to, co działa (treści, portfolio), i wycinamy to, co tylko obciąża.",
        ],
      },
    ],
  },
  {
    slug: "ile-kosztuje-strona-firmowa",
    title: "Ile kosztuje strona firmowa w 2026?",
    description:
      "Widełki cen strony firmowej, landingu i one page: od czego zależy wycena i czego unikać w „tanich pakietach”.",
    date: "2026-08-02",
    readingMinutes: 5,
    sections: [
      {
        heading: "Od czego zależy cena",
        paragraphs: [
          "Na wycenę wpływają: liczba sekcji / podstron, czy piszemy copy od zera, ile jest unikalnych layoutów, czy migrujemy starą stronę oraz czy po starcie potrzebna jest opieka.",
          "U NowaWeb landingi i one page zaczynają się zwykle od ok. 2 500 zł, a strony firmowe od ok. 4 500 zł — po briefie podajemy konkret, nie „od do” bez zakresu.",
        ],
      },
      {
        heading: "Dlaczego „strona za 800 zł” bywa droga",
        paragraphs: [
          "Niska cena często oznacza motyw, stockowe teksty i brak odpowiedzialności za konwersję. Potem płacisz za poprawki, wtyczki i pozycjonowanie protezy.",
          "Lepiej kupić mniejszy, ale dopięty zakres: jedną stronę, która zbiera zapytania, i rozwijać ją, gdy biznes tego potrzebuje.",
        ],
      },
    ],
  },
];

export function getPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
