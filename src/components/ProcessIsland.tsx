import { LayoutTemplate, MessageCircle, PenTool, Rocket } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import "./ProcessIsland.css";

const steps = [
  {
    id: "1",
    title: "Rozmowa i brief",
    text: "Poznajemy Twoją markę, cele i najważniejsze wymagania projektu.",
    icon: MessageCircle,
  },
  {
    id: "2",
    title: "Strategia i makieta",
    text: "Układamy strukturę, architekturę treści i kierunek wizualny.",
    icon: LayoutTemplate,
  },
  {
    id: "3",
    title: "Design i wdrożenie",
    text: "Tworzymy dopracowany wygląd oraz szybką, stabilną stronę.",
    icon: PenTool,
  },
  {
    id: "4",
    title: "Start i wsparcie",
    text: "Publikujemy stronę, dbamy o opiekę i dalszy rozwój.",
    icon: Rocket,
  },
];

type ProcessVisualProps = {
  index: number;
};

type ProcessStyle = CSSProperties & {
  "--process-progress"?: number;
  "--card-y"?: string;
  "--card-scale"?: number;
  "--card-rotate"?: string;
  "--card-opacity"?: number;
};

function ProcessVisual({ index }: ProcessVisualProps) {
  if (index === 0) {
    return (
      <div className="process-visual process-visual--brief" aria-hidden="true">
        <span className="brief-bubble brief-bubble--primary">
          <i />
          <i />
          <i />
        </span>
        <span className="brief-bubble brief-bubble--reply">
          <i />
          <i />
        </span>
        <span className="brief-checks">
          <b />
          <b />
          <b />
        </span>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="process-visual process-visual--wireframe" aria-hidden="true">
        <span className="wireframe-toolbar"><i /><i /><i /></span>
        <span className="wireframe-hero"><b /><i /></span>
        <span className="wireframe-grid"><i /><i /><i /></span>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="process-visual process-visual--design" aria-hidden="true">
        <span className="design-canvas"><i /><b /></span>
        <span className="design-swatches"><i /><i /><i /></span>
        <span className="design-cursor" />
      </div>
    );
  }

  return (
    <div className="process-visual process-visual--launch" aria-hidden="true">
      <span className="launch-orbit"><i /><i /><i /></span>
      <span className="launch-core"><Rocket size={30} strokeWidth={1.7} /></span>
      <span className="launch-status"><i /> ONLINE</span>
    </div>
  );
}

function getCardStyle(index: number, active: number): ProcessStyle {
  const depth = index - active;
  const distance = Math.abs(depth);

  if (depth === 0) {
    return {
      "--card-y": "0px",
      "--card-scale": 1,
      "--card-rotate": "0deg",
      "--card-opacity": 1,
      zIndex: 20,
    };
  }

  if (depth < 0) {
    return {
      "--card-y": `${distance * -24}px`,
      "--card-scale": Math.max(0.88, 1 - distance * 0.035),
      "--card-rotate": `${distance * -0.35}deg`,
      "--card-opacity": Math.max(0.44, 0.72 - distance * 0.08),
      zIndex: 14 - distance,
    };
  }

  return {
    "--card-y": `${depth * 62}px`,
    "--card-scale": Math.max(0.88, 0.97 - depth * 0.018),
    "--card-rotate": `${depth * 0.45}deg`,
    "--card-opacity": Math.max(0.26, 0.48 - (depth - 1) * 0.08),
    zIndex: 8 - depth,
  };
}

export default function ProcessIsland() {
  const [active, setActive] = useState(0);
  const storyRef = useRef<HTMLDivElement>(null);
  const manualActivationRef = useRef(false);
  const activationTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const story = storyRef.current;
    if (!story) return;

    const markers = story.querySelectorAll<HTMLElement>("[data-process-marker]");
    const observer = new IntersectionObserver(
      (entries) => {
        if (manualActivationRef.current) return;

        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (current) setActive(Number((current.target as HTMLElement).dataset.processMarker));
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: [0, 0.25, 0.75, 1] },
    );

    markers.forEach((marker) => observer.observe(marker));
    return () => {
      observer.disconnect();
      if (activationTimerRef.current !== null) window.clearTimeout(activationTimerRef.current);
    };
  }, []);

  const activateStep = (index: number) => {
    manualActivationRef.current = true;
    setActive(index);
    if (activationTimerRef.current !== null) window.clearTimeout(activationTimerRef.current);
    activationTimerRef.current = window.setTimeout(() => {
      manualActivationRef.current = false;
      activationTimerRef.current = null;
    }, 700);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (
      event.pointerType === "touch" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--tilt-x", `${x * 4}deg`);
    event.currentTarget.style.setProperty("--tilt-y", `${y * -4}deg`);
  };

  const resetPointer = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.style.removeProperty("--tilt-x");
    event.currentTarget.style.removeProperty("--tilt-y");
  };

  const storyStyle: ProcessStyle = {
    "--process-progress": active / (steps.length - 1),
  };

  return (
    <div
      className="process-story"
      data-active={active}
      ref={storyRef}
      style={storyStyle}
    >
      <div className="process-story__sticky">
        <div className="process-story__ambient" aria-hidden="true" />

        <nav className="process-story__timeline" aria-label="Etapy współpracy">
          <div className="process-story__rail" aria-hidden="true">
            <span />
          </div>
          {steps.map((step, index) => {
            const isActive = index === active;
            return (
              <button
                aria-current={isActive ? "step" : undefined}
                aria-label={`${step.id}. ${step.title}`}
                className={`process-story__nav-item ${isActive ? "is-active" : ""}`}
                key={step.id}
                onClick={() => activateStep(index)}
                onFocus={() => activateStep(index)}
                type="button"
              >
                <span>{step.id}</span>
                <strong>{step.title}</strong>
              </button>
            );
          })}
        </nav>

        <div className="process-story__card-stack">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === active;
            const state = index < active ? "past" : index > active ? "future" : "active";

            return (
              <button
                aria-pressed={isActive}
                className={`process-story__card ${isActive ? "is-active" : ""}`}
                data-state={state}
                key={step.id}
                onClick={() => activateStep(index)}
                onFocus={() => activateStep(index)}
                onPointerLeave={resetPointer}
                onPointerMove={handlePointerMove}
                style={getCardStyle(index, active)}
                type="button"
              >
                <span className="process-story__card-number" aria-hidden="true">{step.id}</span>
                <span className="process-story__card-copy">
                  <span className="process-story__icon" aria-hidden="true">
                    <Icon size={30} strokeWidth={1.7} />
                  </span>
                  <strong>{step.title}</strong>
                  <span>{step.text}</span>
                </span>
                <ProcessVisual index={index} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="process-story__markers" aria-hidden="true">
        {steps.map((step, index) => (
          <span data-process-marker={index} key={step.id} />
        ))}
      </div>
    </div>
  );
}
