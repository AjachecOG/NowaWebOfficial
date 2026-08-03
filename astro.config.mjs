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
        const isHome = item.url === "https://nowaweb.pl/" || item.url === "https://nowaweb.pl";
        const isKontakt = item.url.includes("/kontakt");
        item.changefreq = isHome || isKontakt ? "weekly" : "monthly";
        item.priority = isHome ? 1.0 : isKontakt ? 0.8 : 0.4;
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
