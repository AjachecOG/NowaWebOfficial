import {
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import "./PortfolioCarousel.css";

type CardPosition = "left" | "center" | "right";

type PortfolioProject = {
  name: string;
  image: string;
  width: number;
  height: number;
};

const projects: PortfolioProject[] = [
  {
    name: "Cakepops.pl",
    image: "/assets/nowaweb/portfolio/cakepops.webp",
    width: 1400,
    height: 767,
  },
  {
    name: "New York Rolls",
    image: "/assets/nowaweb/portfolio/new-york-rolls.webp",
    width: 1400,
    height: 663,
  },
  {
    name: "Atmo - Vision",
    image: "/assets/nowaweb/portfolio/atmo-vision.webp",
    width: 1400,
    height: 671,
  },
];

const OFFSCREEN = {
  left: "translate(-145%, -48%) scale(0.72) rotateY(4deg) translateZ(-90px)",
  right: "translate(45%, -48%) scale(0.72) rotateY(-4deg) translateZ(-90px)",
} as const;

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
  const capturedPointer = useRef<number | null>(null);
  const suppressClickUntil = useRef(0);
  const directionRef = useRef<-1 | 1>(1);
  const prevActiveRef = useRef(active);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);

  const move = (direction: -1 | 1) => {
    directionRef.current = direction;
    setActive((current) => wrapIndex(current + direction, projects.length));
  };

  const activate = (index: number) => {
    if (performance.now() < suppressClickUntil.current) return;
    const position = getCardPosition(index, active, projects.length);
    directionRef.current = position === "right" ? 1 : -1;
    setActive(index);
  };

  useLayoutEffect(() => {
    const previous = prevActiveRef.current;
    if (previous === active) return;

    const direction = directionRef.current;
    const wrappingIndex =
      direction === 1
        ? wrapIndex(previous - 1, projects.length)
        : wrapIndex(previous + 1, projects.length);
    const card = cardRefs.current[wrappingIndex];
    prevActiveRef.current = active;

    if (!card) return;

    card.style.transition = "none";
    card.style.transform = direction === 1 ? OFFSCREEN.right : OFFSCREEN.left;
    void card.offsetWidth;
    card.style.transition = "";
    card.style.transform = "";
  }, [active]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStart.current = { x: event.clientX, pointerId: event.pointerId };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    if (!start || capturedPointer.current !== null || Math.abs(event.clientX - start.x) < 48) return;

    event.currentTarget.setPointerCapture(start.pointerId);
    capturedPointer.current = start.pointerId;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;

    if (event.currentTarget.hasPointerCapture(start.pointerId)) {
      event.currentTarget.releasePointerCapture(start.pointerId);
    }
    capturedPointer.current = null;

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
    capturedPointer.current = null;
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
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {projects.map((project, index) => {
          const position = getCardPosition(index, active, projects.length);
          const isActive = position === "center";

          return (
            <article
              aria-current={isActive ? "true" : undefined}
              aria-label={!isActive ? `Pokaż projekt ${project.name}` : undefined}
              className="portfolio-carousel__card"
              data-position={position}
              data-project={project.name}
              key={project.name}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              onClick={() => !isActive && activate(index)}
              onKeyDown={(event) => {
                if (!isActive && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  activate(index);
                }
              }}
              role={isActive ? undefined : "button"}
              tabIndex={isActive ? -1 : 0}
            >
              <div className="portfolio-carousel__screen">
                <img
                  src={project.image}
                  alt={`Pełny screenshot pierwszego ekranu strony ${project.name}`}
                  width={project.width}
                  height={project.height}
                  loading={isActive ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                />
              </div>
            </article>
          );
        })}
      </div>

      <div className="portfolio-carousel__project-name" aria-hidden="true">
        {projects.map((project, index) => (
          <span
            className="portfolio-carousel__project-name-item"
            data-active={index === active ? "true" : "false"}
            key={project.name}
          >
            {project.name}
          </span>
        ))}
      </div>
    </div>
  );
}
