import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";

const projects = [
  {
    name: "Atelier Mira",
    category: "Wnętrza i lifestyle",
    image: "/assets/nowaweb/portfolio/atelier.png",
    copy: "Przestrzenie, które inspirują. Delikatny layout z dużym naciskiem na obraz i spokojne tempo czytania.",
  },
  {
    name: "Kancelaria Północ",
    category: "Usługi eksperckie",
    image: "/assets/nowaweb/portfolio/law.png",
    copy: "Prawo w dobrym kierunku. Serwis z mocną hierarchią, kontrastem i zaufaniem od pierwszego ekranu.",
  },
  {
    name: "Nord Clinic",
    category: "Medycyna estetyczna",
    image: "/assets/nowaweb/portfolio/clinic.png",
    copy: "Nowoczesna medycyna i naturalny efekt. Jasna kompozycja z eleganckim ruchem i czytelną ścieżką kontaktu.",
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
