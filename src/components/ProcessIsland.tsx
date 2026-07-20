import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LayoutTemplate, MessageCircle, PenTool, Rocket } from "lucide-react";
import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import "./ProcessIsland.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

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
  "--card-y"?: string;
  "--card-scale"?: number;
  "--card-rotate"?: string;
  "--card-opacity"?: number;
};

type ProcessPose = {
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
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

function getScrollPose(index: number, stage: number, reduced: boolean): ProcessPose {
  const depth = index - stage;
  const distance = Math.abs(depth);

  if (depth === 0) {
    return {
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
    };
  }

  if (depth < 0) {
    return {
      y: distance * (reduced ? -8 : -24),
      scale: Math.max(reduced ? 0.96 : 0.88, 1 - distance * (reduced ? 0.012 : 0.035)),
      rotation: reduced ? 0 : distance * -0.35,
      opacity: Math.max(0.44, 0.72 - distance * 0.08),
    };
  }

  return {
    y: depth * (reduced ? 22 : 62),
    scale: Math.max(reduced ? 0.96 : 0.88, 0.97 - depth * (reduced ? 0.008 : 0.018)),
    rotation: reduced ? 0 : depth * 0.45,
    opacity: Math.max(0.26, 0.48 - (depth - 1) * 0.08),
  };
}

function toCardVars(pose: ProcessPose) {
  return {
    "--card-y": `${pose.y}px`,
    "--card-scale": pose.scale,
    "--card-rotate": `${pose.rotation}deg`,
    "--card-opacity": pose.opacity,
  };
}

function getInitialCardStyle(index: number): ProcessStyle {
  const pose = getScrollPose(index, 0, false);
  return toCardVars(pose);
}

export default function ProcessIsland() {
  const [active, setActive] = useState(0);
  const storyRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  useGSAP(() => {
    const story = storyRef.current;
    if (!story) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 761px)", () => {
      story.dataset.motion = "gsap";

      const cards = gsap.utils.toArray<HTMLElement>(".process-story__card", story);
      const railFill = story.querySelector<HTMLElement>(".process-story__rail span");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const timeline = gsap.timeline({ defaults: { ease: "none" } });

      cards.forEach((card, index) => {
        gsap.set(card, toCardVars(getScrollPose(index, 0, reduced)));
      });

      for (let stage = 1; stage < steps.length; stage += 1) {
        cards.forEach((card, index) => {
          timeline.fromTo(
            card,
            toCardVars(getScrollPose(index, stage - 1, reduced)),
            {
              ...toCardVars(getScrollPose(index, stage, reduced)),
              duration: 1,
              immediateRender: false,
            },
            stage - 1,
          );
        });
      }

      if (railFill) {
        timeline.fromTo(railFill, { scaleY: 0 }, { scaleY: 1, duration: steps.length - 1 }, 0);
      }

      const microSelectors = [
        ".brief-bubble, .brief-checks b",
        ".wireframe-hero, .wireframe-grid i",
        ".design-canvas i, .design-canvas b, .design-swatches i, .design-cursor",
        ".launch-orbit, .launch-core, .launch-status",
      ];

      const firstMicro = gsap.utils.toArray<HTMLElement>(microSelectors[0], cards[0]);
      gsap.set(firstMicro, { autoAlpha: 1, y: 0 });

      for (let stage = 1; stage < steps.length; stage += 1) {
        const targets = gsap.utils.toArray<HTMLElement>(microSelectors[stage], cards[stage]);
        timeline.fromTo(
          targets,
          { autoAlpha: 0.25, y: reduced ? 4 : 14 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.035,
            ease: "power2.out",
          },
          stage - 0.28,
        );
      }

      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: story,
        start: "top top+=80",
        end: "bottom bottom",
        animation: timeline,
        scrub: reduced ? 0.35 : 0.7,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const nextActive = Math.round(self.progress * (steps.length - 1));
          if (nextActive === activeRef.current) return;
          activeRef.current = nextActive;
          setActive(nextActive);
        },
      });

      return () => {
        delete story.dataset.motion;
        scrollTriggerRef.current = null;
      };
    });

    return () => mm.revert();
  }, { scope: storyRef });

  const activateStep = (index: number) => {
    const trigger = scrollTriggerRef.current;
    if (!trigger || window.innerWidth <= 760) {
      activeRef.current = index;
      setActive(index);
      return;
    }

    const progress = index / (steps.length - 1);
    const top = gsap.utils.interpolate(trigger.start, trigger.end, progress);
    window.scrollTo({ top, behavior: "smooth" });
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

  return (
    <div
      className="process-story"
      data-active={active}
      ref={storyRef}
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
                style={getInitialCardStyle(index)}
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
