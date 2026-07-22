import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

type CardPosition = "left" | "center" | "right";

type PortfolioProject = {
  name: string;
  domain: string;
  category: string;
  image: string;
  width: number;
  height: number;
  url?: string;
};

const projects: PortfolioProject[] = [
  {
    name: "Cakepops.pl",
    domain: "cakepops.pl",
    category: "Marka produktowa / gastronomia",
    image: "/assets/nowaweb/portfolio/cakepops.png",
    width: 1453,
    height: 796,
    url: "https://cakepops.pl/",
  },
  {
    name: "New York Rolls",
    domain: "New York Rolls",
    category: "Landing produktowy / gastronomia",
    image: "/assets/nowaweb/portfolio/new-york-rolls.png",
    width: 1850,
    height: 876,
  },
  {
    name: "Atmo‑Vision",
    domain: "atmo-vision.pl",
    category: "Technologia / monitoring inwestycji",
    image: "/assets/nowaweb/portfolio/atmo-vision.png",
    width: 1837,
    height: 880,
    url: "https://atmo-vision.pl/",
  },
];

function wrapIndex(index: number, total: number) {
  return (index + total) % total;
}

function getCardPosition(index: number, active: number, total: number): CardPosition {
  const offset = wrapIndex(index - active, total);
  if (offset === 0) return "center";
  if (offset === 1) return "right";
  return "left";
}

export default function PortfolioCarousel() {
  const [active, setActive] = useState(1);
  const pointerStart = useRef<{ x: number; pointerId: number } | null>(null);
  const suppressClickUntil = useRef(0);

  const move = (direction: -1 | 1) => {
    setActive((current) => wrapIndex(current + direction, projects.length));
  };

  const activate = (index: number) => {
    if (performance.now() < suppressClickUntil.current) return;
    setActive(index);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, a")) return;
    pointerStart.current = { x: event.clientX, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;

    if (event.currentTarget.hasPointerCapture(start.pointerId)) {
      event.currentTarget.releasePointerCapture(start.pointerId);
    }

    const deltaX = event.clientX - start.x;
    if (Math.abs(deltaX) < 48) return;

    suppressClickUntil.current = performance.now() + 350;
    move(deltaX < 0 ? 1 : -1);
  };

  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (start && event.currentTarget.hasPointerCapture(start.pointerId)) {
      event.currentTarget.releasePointerCapture(start.pointerId);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  };

  return (
    <div className="portfolio-carousel" data-active={active}>
      <p className="portfolio-carousel__status" aria-live="polite">
        Aktywna realizacja: {projects[active].name}, {active + 1} z {projects.length}
      </p>

      <div
        className="portfolio-carousel__stage"
        aria-label="Karuzela realizacji. Użyj strzałek lub przeciągnij w bok."
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {projects.map((project, index) => {
          const position = getCardPosition(index, active, projects.length);
          const isActive = position === "center";
          const DirectionIcon = position === "left" ? ArrowLeft : ArrowRight;

          return (
            <article
              className="portfolio-carousel__card"
              data-position={position}
              data-project={project.name}
              aria-current={isActive ? "true" : undefined}
              key={project.name}
              onClick={() => !isActive && activate(index)}
            >
              <div className="portfolio-carousel__titlebar" aria-hidden="true">
                <span className="portfolio-carousel__lights"><i /><i /><i /></span>
                <span>{project.domain}</span>
                <span />
              </div>

              <div className="portfolio-carousel__screen">
                <img
                  src={project.image}
                  alt={`Pełny screenshot pierwszego ekranu strony ${project.name}`}
                  width={project.width}
                  height={project.height}
                  loading={isActive ? "eager" : "lazy"}
                  decoding="async"
                />
              </div>

              <div className="portfolio-carousel__meta">
                <span className="portfolio-carousel__number">{String(index + 1).padStart(2, "0")}</span>
                <span className="portfolio-carousel__identity">
                  <strong>{project.name}</strong>
                  <small>{project.category}</small>
                </span>
                {project.url ? (
                  <a
                    className="portfolio-carousel__external"
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Otwórz stronę ${project.name} w nowej karcie`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <ExternalLink aria-hidden="true" size={17} />
                  </a>
                ) : null}
              </div>

              {!isActive ? (
                <button
                  className="portfolio-carousel__side-control"
                  type="button"
                  aria-label={`Pokaż projekt ${project.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    activate(index);
                  }}
                >
                  <DirectionIcon aria-hidden="true" size={19} />
                </button>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="portfolio-carousel__controls" aria-label="Sterowanie realizacjami">
        <button
          className="portfolio-carousel__control portfolio-carousel__control--prev"
          type="button"
          onClick={() => move(-1)}
          aria-label="Poprzednia realizacja"
        >
          <ArrowLeft aria-hidden="true" size={20} />
        </button>
        <span className="portfolio-carousel__progress" aria-hidden="true">
          {projects.map((project, index) => (
            <i className={index === active ? "is-active" : ""} key={project.name} />
          ))}
        </span>
        <button
          className="portfolio-carousel__control portfolio-carousel__control--next"
          type="button"
          onClick={() => move(1)}
          aria-label="Następna realizacja"
        >
          <ArrowRight aria-hidden="true" size={20} />
        </button>
      </div>
      <p className="portfolio-carousel__hint">Kliknij bok, użyj strzałek albo przeciągnij.</p>
    </div>
  );
}
