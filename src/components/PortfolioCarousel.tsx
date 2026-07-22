import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";

const projects = [
  {
    name: "Cakepops.pl",
    domain: "cakepops.pl",
    category: "Marka produktowa / gastronomia",
    image: "/assets/nowaweb/portfolio/cakepops.png",
    width: 1453,
    height: 796,
    url: "https://cakepops.pl/",
    copy: "Lekki, premium kierunek dla ręcznie tworzonych cakepopsów.",
  },
  {
    name: "New York Rolls",
    domain: "New York Rolls",
    category: "Landing produktowy / gastronomia",
    image: "/assets/nowaweb/portfolio/new-york-rolls.png",
    width: 1850,
    height: 876,
    copy: "Wyrazisty, miejski charakter z mocną hierarchią sprzedażową.",
  },
  {
    name: "Atmo‑Vision",
    domain: "atmo-vision.pl",
    category: "Technologia / monitoring inwestycji",
    image: "/assets/nowaweb/portfolio/atmo-vision.png",
    width: 1837,
    height: 880,
    url: "https://atmo-vision.pl/",
    copy: "Techniczna usługa pokazana przez prosty, wizualny storytelling.",
  },
];

export default function PortfolioCarousel() {
  const [active, setActive] = useState(0);
  const current = projects[active];
  const next = () => setActive((value) => (value + 1) % projects.length);
  const prev = () => setActive((value) => (value - 1 + projects.length) % projects.length);

  const ordered = useMemo(
    () => [...projects.slice(active), ...projects.slice(0, active)],
    [active],
  );

  return (
    <div className="portfolio-island" aria-label="Wybrane realizacje">
      <div className="portfolio-copy">
        <span className="counter">0{active + 1} / 0{projects.length}</span>
        <h3>{current.name}</h3>
        <p>{current.copy}</p>
        <a className="text-link" href="#kontakt">
          Zobacz kierunek <ExternalLink aria-hidden="true" size={18} />
        </a>
      </div>

      <div className="portfolio-stage">
        {ordered.map((project, index) => (
          <article className="project-card" data-position={index} key={project.name}>
            <img src={project.image} alt={`Projekt ${project.name}`} loading={index === 0 ? "eager" : "lazy"} />
            <div>
              <span>{project.category}</span>
              <strong>{project.name}</strong>
            </div>
          </article>
        ))}
      </div>

      <div className="portfolio-controls" aria-label="Sterowanie realizacjami">
        <button type="button" onClick={prev} aria-label="Poprzednia realizacja">
          <ArrowLeft aria-hidden="true" size={22} />
        </button>
        <button type="button" onClick={next} aria-label="Następna realizacja">
          <ArrowRight aria-hidden="true" size={22} />
        </button>
      </div>
    </div>
  );
}
