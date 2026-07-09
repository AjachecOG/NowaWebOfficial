import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(
  join(__dirname, "..", "public", "assets", "nowaweb", "poland-outline.svg"),
  "utf8",
);

const paths = [...svg.matchAll(/<path d="([^"]+)"/g)].map((match) => match[1]);

function project(lat, lon) {
  const minLon = 14.07;
  const maxLon = 24.15;
  const minLat = 49;
  const maxLat = 54.84;
  return {
    x: +(((lon - minLon) / (maxLon - minLon)) * 1000).toFixed(1),
    y: +(((maxLat - lat) / (maxLat - minLat)) * 947).toFixed(1),
  };
}

const cities = [
  { id: "warsaw", label: "Warszawa", ...project(52.2297, 21.0122) },
  { id: "krakow", label: "Kraków", ...project(50.0647, 19.945) },
  { id: "wroclaw", label: "Wrocław", ...project(51.1079, 17.0385) },
  { id: "poznan", label: "Poznań", ...project(52.4064, 16.9252) },
  { id: "gdansk", label: "Gdańsk", ...project(54.352, 18.6466) },
  { id: "lodz", label: "Łódź", ...project(51.7592, 19.456) },
  { id: "katowice", label: "Katowice", ...project(50.2649, 19.0238) },
  { id: "lublin", label: "Lublin", ...project(51.2465, 22.5684) },
];

const links = [
  ["warsaw", "gdansk"],
  ["warsaw", "krakow"],
  ["warsaw", "poznan"],
  ["warsaw", "lublin"],
  ["poznan", "wroclaw"],
  ["krakow", "katowice"],
  ["gdansk", "poznan"],
  ["lodz", "wroclaw"],
];

writeFileSync(
  join(__dirname, "..", "src", "data", "poland-map.ts"),
  `export const POLAND_MAP_VIEWBOX = "0 0 1000 947" as const;

export const polandMapPaths = ${JSON.stringify(paths)} as const;

export const polandMapCities = ${JSON.stringify(cities, null, 2)} as const;

export const polandMapLinks = ${JSON.stringify(links)} as const;
`,
);

console.log(`Wrote ${paths.length} paths and ${cities.length} cities`);
