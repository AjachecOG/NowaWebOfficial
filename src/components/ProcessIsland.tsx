import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LayoutTemplate, MessageCircle, PenTool, Rocket } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
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
  playConversation: boolean;
};

const CLIENT_MESSAGE = "Potrzebuję strony, która nie znudzi ciekawskich.";
const STUDIO_QUESTION = "Nowa strona?";
const STUDIO_ANSWER = "Już się robi!";
const CLIENT_KEY_DELAYS = [34, 38, 32, 36, 42] as const;
const STUDIO_KEY_DELAYS = [38, 34, 42, 36] as const;

function ConversationVisual({ playing }: { playing: boolean }) {
  const [clientText, setClientText] = useState("");
  const [studioQuestion, setStudioQuestion] = useState("");
  const [studioAnswer, setStudioAnswer] = useState("");
  const [questionVisible, setQuestionVisible] = useState(false);
  const [typingVisible, setTypingVisible] = useState(false);
  const [answerVisible, setAnswerVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timers = new Set<number>();

    const wait = (ms: number) => new Promise<void>((resolve) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        resolve();
      }, ms);
      timers.add(timer);
    });

    const type = async (
      message: string,
      update: (value: string) => void,
      delays: readonly number[],
    ) => {
      for (let index = 0; index < message.length && !cancelled; index += 1) {
        update(message.slice(0, index + 1));
        await wait(delays[index % delays.length]);
      }
    };

    setClientText("");
    setStudioQuestion("");
    setStudioAnswer("");
    setQuestionVisible(false);
    setTypingVisible(false);
    setAnswerVisible(false);

    if (playing) {
      const play = async () => {
        await wait(340);
        await type(CLIENT_MESSAGE, setClientText, CLIENT_KEY_DELAYS);
        await wait(520);
        if (cancelled) return;
        setQuestionVisible(true);
        await wait(180);
        await type(STUDIO_QUESTION, setStudioQuestion, STUDIO_KEY_DELAYS);
        await wait(260);
        if (cancelled) return;
        setTypingVisible(true);
        await wait(960);
        if (cancelled) return;
        setTypingVisible(false);
        await wait(120);
        if (cancelled) return;
        setAnswerVisible(true);
        await type(STUDIO_ANSWER, setStudioAnswer, STUDIO_KEY_DELAYS);
      };

      void play();
    }

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, [playing]);

  return (
    <div
      className="process-visual story-scene story-scene--conversation"
      data-conversation-playing={playing ? "true" : "false"}
      data-process-scene="conversation"
      aria-hidden="true"
    >
      <div className="story-chat">
        <span className="story-message story-message--client" data-message-visible={playing ? "true" : "false"}>
          <span data-conversation-client>{clientText}</span>
        </span>
        <span className="story-message story-message--studio" data-message-visible={questionVisible ? "true" : "false"}>
          <span data-conversation-studio-question>{studioQuestion}</span>
        </span>
        <span className="story-reply-slot">
          <span
            className="story-typing-indicator"
            data-conversation-typing
            data-message-visible={typingVisible ? "true" : "false"}
          >
            <i /><i /><i />
          </span>
          <span
            className="story-message story-message--studio story-message--answer"
            data-message-visible={answerVisible ? "true" : "false"}
          >
            <span data-conversation-studio-answer>{studioAnswer}</span>
          </span>
        </span>
      </div>
    </div>
  );
}

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

function ProcessVisual({ index, playConversation }: ProcessVisualProps) {
  if (index === 0) {
    return <ConversationVisual playing={playConversation} />;
  }

  if (index === 1) {
    const workshopGroups = [
      { label: "Cele", notes: ["Zaciekawić", "Pokazać efekt"] },
      { label: "Treści", notes: ["Prosta historia", "Mocny nagłówek"] },
      { label: "Priorytety", notes: ["Jeden kierunek", "Jasne CTA"] },
    ];

    return (
      <div
        className="process-visual story-scene story-scene--strategy"
        data-process-scene="strategy"
        aria-hidden="true"
      >
        <div className="story-workshop-board">
          <strong className="story-workshop-title"><i />Warsztat strategii</strong>
          <div className="story-workshop-groups">
            {workshopGroups.map((group) => (
              <section className="story-workshop-group" key={group.label}>
                <b>{group.label}</b>
                {group.notes.map((note) => (
                  <span className="story-workshop-note" key={note}>{note}</span>
                ))}
              </section>
            ))}
          </div>
          <span className="story-workshop-priority" />
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div
        className="process-visual story-scene story-scene--design"
        data-process-scene="design"
        aria-hidden="true"
      >
        <span className="story-sketch-paper" />
        <svg className="story-sketch-svg" viewBox="0 0 320 210" aria-hidden="true">
          <path pathLength="1" d="M28 24H292Q302 24 302 34V180Q302 190 292 190H28Q18 190 18 180V34Q18 24 28 24Z" />
          <path pathLength="1" d="M18 50H302" />
          <path pathLength="1" d="M34 38H58M66 38H90M98 38H122" />
          <path pathLength="1" d="M34 66H286V132H34Z" />
          <path pathLength="1" d="M92 88H228M112 104H208" />
          <path pathLength="1" d="M34 144H108V176H34Z" />
          <path pathLength="1" d="M123 144H197V176H123Z" />
          <path pathLength="1" d="M212 144H286V176H212Z" />
          <path className="story-sketch-accent-line" pathLength="1" d="M246 35H282" />
          <path className="story-sketch-construction" pathLength="1" d="M12 58C42 44 68 42 96 48M226 198C250 188 274 176 304 158" />
        </svg>
        <span className="story-sketch-pencil"><i /><b /></span>
        <span className="story-pencil-smudge"><i /><i /></span>
        <span className="story-makeup-palette"><i /><i /><i /><i /></span>
        <span className="story-paint-brush"><i /><b /></span>
        <span className="story-paint-daub"><i /></span>
        <div className="story-page-shell story-page-shell--designed story-scene__final">
          <span className="story-page-nav"><i /><i /><i /></span>
          <span className="story-page-hero"><b>To będzie Twoja strona.</b><i /></span>
          <span className="story-page-grid"><i /><i /><i /></span>
          <span className="story-page-cta" />
        </div>
        <span className="story-powder-puff"><i /><b /><b /><b /><b /></span>
        <span className="story-detail-brush"><i /></span>
        <span className="story-sketch-eraser" />
      </div>
    );
  }

  return (
    <div
      className="process-visual story-scene story-scene--launch"
      data-process-scene="launch"
      aria-hidden="true"
    >
      <div className="story-browser story-scene__final">
        <span className="story-browser__bar">
          <i /><i /><i /><b>nowa-strona.pl</b>
        </span>
        <div className="story-page-shell story-page-shell--live">
          <span className="story-page-nav"><i /><i /><i /></span>
          <span className="story-page-hero"><b>To jest Twoja strona.</b><i /></span>
          <span className="story-page-grid"><i /><i /><i /></span>
          <span className="story-page-cta" />
        </div>
      </div>
      <div className="story-publish"><span /><b>100%</b></div>
      <span className="story-online"><i /> ONLINE</span>
      <span className="story-support">Jesteśmy obok.</span>
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
  const [storyVisible, setStoryVisible] = useState(false);
  const storyRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  useGSAP(() => {
    const story = storyRef.current;
    if (!story) return;

    const mm = gsap.matchMedia();

    const showStory = () => {
      story.dataset.storyVisible = "true";
      setStoryVisible(true);
    };
    const hideStory = () => {
      delete story.dataset.storyVisible;
      setStoryVisible(false);
    };
    const storyEntryTrigger = ScrollTrigger.create({
      trigger: story,
      start: "top 82%",
      end: "bottom 18%",
      onEnter: showStory,
      onEnterBack: showStory,
      onLeave: hideStory,
      onLeaveBack: hideStory,
    });

    if (storyEntryTrigger.isActive) showStory();

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
        delete story.dataset.storyVisible;
        scrollTriggerRef.current = null;
      };
    });

    return () => {
      storyEntryTrigger?.kill();
      hideStory();
      mm.revert();
    };
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
                <ProcessVisual
                  index={index}
                  playConversation={index === 0 && active === 0 && storyVisible}
                />
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
