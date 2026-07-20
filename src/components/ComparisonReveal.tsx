import { useEffect, useRef, useState } from "react";

type Criterion = {
  label: string;
  nowawebTitle: string;
  nowawebDetail: string;
  wordpressTitle: string;
  wordpressDetail: string;
};

const criteria: Criterion[] = [
  {
    label: "SzybkoĹ›Ä‡",
    nowawebTitle: "Lekka od pierwszej linii.",
    nowawebDetail: "Budujemy tylko to, czego potrzebuje marka i jej uĹĽytkownicy.",
    wordpressTitle: "WiÄ™cej warstw. Mniej tempa.",
    wordpressDetail: "Motyw, pluginy i dodatkowe skrypty zwiÄ™kszajÄ… ciÄ™ĹĽar strony.",
  },
  {
    label: "Koszty",
    nowawebTitle: "Zakres, ktĂłry da siÄ™ przewidzieÄ‡.",
    nowawebDetail: "Wiesz, za co pĹ‚acisz na starcie i podczas dalszego rozwoju.",
    wordpressTitle: "Dodatki mnoĹĽÄ… kolejne koszty.",
    wordpressDetail: "Licencje, hosting i poprawki potrafiÄ… rosnÄ…Ä‡ razem ze stronÄ….",
  },
  {
    label: "BezpieczeĹ„stwo",
    nowawebTitle: "Mniej punktĂłw wejĹ›cia.",
    nowawebDetail: "Prostsza architektura ogranicza powierzchniÄ™ potencjalnego ataku.",
    wordpressTitle: "Popularny cel automatycznych atakĂłw.",
    wordpressDetail: "Motywy i wtyczki wymagajÄ… ciÄ…gĹ‚ego pilnowania aktualizacji.",
  },
  {
    label: "WyglÄ…d",
    nowawebTitle: "Marka prowadzi projekt.",
    nowawebDetail: "UkĹ‚ad, rytm i detale wynikajÄ… z Twojej firmy, nie z gotowego motywu.",
    wordpressTitle: "Szablon prowadzi markÄ™.",
    wordpressDetail: "Gotowy motyw ogranicza kompozycjÄ™ i czÄ™sto upodabnia stronÄ™ do innych.",
  },
  {
    label: "Wsparcie",
    nowawebTitle: "Jedna osoba zna caĹ‚oĹ›Ä‡.",
    nowawebDetail: "Masz jasny kontakt z kimĹ›, kto rozumie wszystkie decyzje projektu.",
    wordpressTitle: "Problem krÄ…ĹĽy miÄ™dzy dostawcami.",
    wordpressDetail: "ĹąrĂłdĹ‚em bĹ‚Ä™du moĹĽe byÄ‡ motyw, plugin, hosting albo ich poĹ‚Ä…czenie.",
  },
];

export default function ComparisonReveal() {
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const item = criteria[activeIndex];

  const updateIndicator = (index: number) => {
    const root = rootRef.current;
    const button = buttonRefs.current[index];
    if (!root || !button) return;
    root.style.setProperty("--comparison-tab-x", `${button.offsetLeft}px`);
    root.style.setProperty("--comparison-tab-width", `${button.offsetWidth}px`);
  };

  useEffect(() => {
    updateIndicator(activeIndex);
    const selector = selectorRef.current;
    if (!selector || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => updateIndicator(activeIndex));
    observer.observe(selector);
    return () => observer.disconnect();
  }, [activeIndex]);

  return (
    <div className="comparison-reveal" data-comparison-reveal ref={rootRef}>
      <div className="comparison-criteria" ref={selectorRef} role="tablist" aria-label="Kryteria porĂłwnania">
        <span className="comparison-tab-indicator" aria-hidden="true" />
        {criteria.map((criterion, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              aria-controls="comparison-stage"
              aria-selected={isActive}
              className={isActive ? "is-active" : ""}
              data-comparison-criterion
              key={criterion.label}
              onClick={() => setActiveIndex(index)}
              ref={(node) => { buttonRefs.current[index] = node; }}
              role="tab"
              type="button"
            >
              {criterion.label}
            </button>
          );
        })}
      </div>

      <div aria-live="polite" className="comparison-stage" id="comparison-stage" role="tabpanel">
        <article className="comparison-layer comparison-layer--wordpress" data-comparison-layer="wordpress">
          <div className="comparison-layer-copy">
            <span className="comparison-side-label">Typowy WordPress</span>
            <h3>{item.wordpressTitle}</h3>
          </div>
          <p>{item.wordpressDetail}</p>
        </article>

        <article className="comparison-layer comparison-layer--nowaweb" data-comparison-layer="nowaweb">
          <div className="comparison-layer-copy">
            <span className="comparison-side-label">NowaWeb</span>
            <h3>{item.nowawebTitle}</h3>
          </div>
          <p>{item.nowawebDetail}</p>
        </article>

        <span className="comparison-divider" aria-hidden="true" />
        <span className="comparison-handle" aria-hidden="true">VS</span>
        <input
          aria-label="PrzesuĹ„, aby porĂłwnaÄ‡ NowaWeb i WordPress"
          className="comparison-slider"
          data-comparison-slider
          defaultValue="52"
          max="100"
          min="0"
          onInput={(event) => {
            rootRef.current?.style.setProperty("--comparison-reveal", `${event.currentTarget.value}%`);
          }}
          type="range"
        />
      </div>

      <p className="comparison-instruction">PrzeciÄ…gnij VS, aby odsĹ‚oniÄ‡ warstwÄ™ NowaWeb.</p>
    </div>
  );
}
