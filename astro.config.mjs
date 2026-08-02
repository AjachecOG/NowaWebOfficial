import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://nowaweb.pl",
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes("/404") && !page.includes("/dziekujemy"),
      serialize(item) {
        const url = item.url;
        const isHome = url === "https://nowaweb.pl/" || url === "https://nowaweb.pl";
        const isKontakt = url.includes("/kontakt");
        const isMoneyPage =
          url.includes("/uslugi") ||
          url.includes("/cennik") ||
          url.includes("/projekty") ||
          url.includes("/blog");
        item.changefreq = isHome || isKontakt || isMoneyPage ? "weekly" : "monthly";
        item.priority = isHome ? 1.0 : isKontakt || url.includes("/uslugi") || url.includes("/cennik") ? 0.8 : isMoneyPage ? 0.7 : 0.4;
        item.lastmod = new Date();
        return item;
      },
    }),
  ],
  output: "static",
  vite: {
    optimizeDeps: {
      include: ["@gsap/react", "gsap", "gsap/ScrollTrigger"],
    },
  },
});
