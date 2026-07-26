import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://nowaweb.pl",
  integrations: [react(), sitemap()],
  output: "static",
  vite: {
    optimizeDeps: {
      include: ["@gsap/react", "gsap", "gsap/ScrollTrigger"],
    },
  },
});
