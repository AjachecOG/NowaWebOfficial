import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const assetDir = path.join(root, "public/assets/nowaweb");
const seoDir = path.join(assetDir, "seo");
const cards = [
  { slug: null, category: "STUDIO STRON INTERNETOWYCH", lines: ["Twoja firma.", "Nowa strona."], subtitle: "Strony internetowe dla firm z całej Polski." },
  { slug: "strony-internetowe-dla-firm", category: "STRONY DLA FIRM", lines: ["Strony internetowe", "dla Twojej firmy."], subtitle: "Czytelna oferta. Dobry pierwszy kontakt." },
  { slug: "landing-page", category: "LANDING PAGE", lines: ["Jedna strona.", "Konkretny cel."], subtitle: "Przedstaw ofertę i ułatw klientom następny krok." },
  { slug: "modernizacja-stron", category: "MODERNIZACJA STRON", lines: ["Nowy rozdział", "Twojej strony."], subtitle: "Odświeżona forma. Przemyślana treść." },
  { slug: "opieka-nad-strona", category: "OPIEKA NAD STRONĄ", lines: ["Twoja strona", "w dobrych rękach."], subtitle: "Aktualizacje i wsparcie po publikacji." },
  { slug: "o-nas", category: "O NOWAWEB", lines: ["Poznaj sposób", "naszej pracy."], subtitle: "NowaWeb — studio stron internetowych." },
  { slug: "cennik", category: "CENNIK", lines: ["Ile kosztuje", "Twoja nowa strona?"], subtitle: "Poznaj zakres usług i wybierz dobry start." },
  { slug: "realizacje", category: "REALIZACJE", lines: ["Pomysły, które", "stały się stronami."], subtitle: "Zobacz wybrane projekty NowaWeb." },
  { slug: "cakepops", category: "REALIZACJA / CAKEPOPS", lines: ["CakePops.", "Słodka strona marki."], subtitle: "Projekt strony internetowej • NowaWeb" },
  { slug: "new-york-rolls", category: "REALIZACJA / NEW YORK ROLLS", lines: ["New York Rolls.", "Smak dobrego", "projektu."], subtitle: "Projekt strony internetowej • NowaWeb" },
  { slug: "atmo-vision", category: "REALIZACJA / ATMO VISION", lines: ["Atmo Vision.", "Nowa perspektywa."], subtitle: "Projekt strony internetowej • NowaWeb" },
];

const escapeXml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function renderCard(card) {
  const headingSize = 70;
  const firstBaseline = card.lines.length === 3 ? 259 : 302;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#fff7ea"/>
    <path d="M880 0H1200V630H880Z" fill="#0557f2"/>
    <circle cx="1205" cy="343" r="231" fill="none" stroke="#377bfa" stroke-width="1.5"/>
    <circle cx="1205" cy="343" r="177" fill="none" stroke="#377bfa" stroke-width="1.5"/>
    <path d="M947 400L1098 249M958 249H1098V389" fill="none" stroke="#fff7ea" stroke-width="28" stroke-linejoin="miter"/>
    <circle cx="1098" cy="249" r="22" fill="#ff5a1f"/>
    <text x="126" y="96" font-family="Georgia, serif" font-size="35" font-weight="700" fill="#061532">NowaWeb</text>
    <text x="64" y="169" font-family="Tahoma, sans-serif" font-size="16" letter-spacing="2" fill="#21365f">${escapeXml(card.category)}</text>
    ${card.lines.map((line, index) => `<text x="60" y="${firstBaseline + index * 81}" font-family="Georgia, serif" font-size="${headingSize}" font-weight="700" letter-spacing="-2" fill="#061532">${escapeXml(line)}</text>`).join("\n")}
    <text x="64" y="491" font-family="Tahoma, sans-serif" font-size="23" fill="#21365f">${escapeXml(card.subtitle)}</text>
    <path d="M64 545H816" stroke="#061532" stroke-opacity="0.18"/>
    <text x="64" y="587" font-family="Tahoma, sans-serif" font-size="20" fill="#061532">nowaweb.pl</text>
    <text x="1136" y="585" text-anchor="end" font-family="Tahoma, sans-serif" font-size="15" letter-spacing="3" fill="#fff7ea">NOWAWEB</text>
  </svg>`);
}

await fs.mkdir(seoDir, { recursive: true });
const logoPath = path.join(root, "public/favicon.svg");
await fs.copyFile(logoPath, path.join(seoDir, "logo.svg"));
const logo = await sharp(logoPath).resize(46, 46).png().toBuffer();

for (const card of cards) {
  const target = card.slug ? path.join(seoDir, `${card.slug}.jpg`) : path.join(assetDir, "og-default.jpg");
  await sharp(renderCard(card)).composite([{ input: logo, left: 64, top: 59 }]).jpeg({ quality: 90, mozjpeg: true }).toFile(target);
  const metadata = await sharp(target).metadata();
  if (metadata.width !== 1200 || metadata.height !== 630 || metadata.format !== "jpeg") {
    throw new Error(`Invalid social image: ${target}`);
  }
  const { size } = await fs.stat(target);
  console.log(`${path.relative(root, target)}: 1200×630 JPEG, ${(size / 1024).toFixed(1)} KB`);
}
