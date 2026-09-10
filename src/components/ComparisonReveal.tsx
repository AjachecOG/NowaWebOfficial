import { useEffect, useRef, useState } from "react";
import { BadgeCheck, TriangleAlert } from "lucide-react";

type Criterion = {
  label: string;
  nowawebTitle: string;
  nowawebDetail: string;
  nowawebVerdictTitle: string;
  nowawebVerdictDetail: string;
  wordpressTitle: string;
  wordpressDetail: string;
  wordpressVerdictTitle: string;
  wordpressVerdictDetail: string;
};

const criteria: Criterion[] = [
  {
    label: "Szybkość",
    nowawebTitle: "Tylko kod, którego potrzebujesz.",
    nowawebDetail: "Kodujemy tylko to, czego potrzebują marka i użytkownicy.",
    nowawebVerdictTitle: "Szybka strona trudniej traci uwagę.",
    nowawebVerdictDetail: "Mniej skryptów = szybsze ładowanie i większa szansa na zapytanie.",
    wordpressTitle: "Szybkość zależy od wdrożenia.",
    wordpressDetail: "Dobór motywu, wtyczek i hostingu wpływa na czas ładowania.",
    wordpressVerdictTitle: "Mierzmy działającą stronę.",
    wordpressVerdictDetail: "Dobrze zoptymalizowany WordPress również może działać szybko.",
  },
  {
    label: "Koszty",
    nowawebTitle: "Zakres ustalony przed startem.",
    nowawebDetail: "Zakres i koszty są jasne przed startem prac.",
    nowawebVerdictTitle: "Płacisz za ustalony zakres.",
    nowawebVerdictDetail: "Jasny zakres i brak stosu płatnych dodatków ułatwiają kontrolę budżetu.",
    wordpressTitle: "Koszt zależy od narzędzi.",
    wordpressDetail: "Część dodatków jest bezpłatna, inne wymagają odnawiania licencji.",
    wordpressVerdictTitle: "Porównuj pełny zakres.",
    wordpressVerdictDetail: "W obu podejściach uwzględnij hosting, rozwój i utrzymanie.",
  },
  {
    label: "Bezpieczeństwo",
    nowawebTitle: "Bez stosu wtyczek do łatania.",
    nowawebDetail: "Prostsza architektura ogranicza powierzchnię potencjalnego ataku.",
    nowawebVerdictTitle: "Prostsza architektura, mniej awarii.",
    nowawebVerdictDetail: "Prostsza architektura ogranicza powierzchnię ataku i liczbę pilnych aktualizacji.",
    wordpressTitle: "Aktualizacje są częścią opieki.",
    wordpressDetail: "Motywy i wtyczki wymagają stałych aktualizacji.",
    wordpressVerdictTitle: "Liczy się sposób utrzymania.",
    wordpressVerdictDetail: "Aktualizacje, kopie zapasowe i kontrola dostępów wymagają regularnej uwagi.",
  },
  {
    label: "Wygląd",
    nowawebTitle: "Marka prowadzi projekt.",
    nowawebDetail: "Każda decyzja wynika z charakteru i celu Twojej marki.",
    nowawebVerdictTitle: "Wygląda jak Twoja firma, nie jak szablon.",
    nowawebVerdictDetail: "Projekt powstaje dla Twojej firmy, więc nie wygląda jak kolejny gotowiec.",
    wordpressTitle: "Motyw lub projekt indywidualny.",
    wordpressDetail: "WordPress pozwala korzystać z motywów i tworzyć własne układy.",
    wordpressVerdictTitle: "Projekt zależy od zakresu.",
    wordpressVerdictDetail: "Indywidualny wygląd jest możliwy w obu technologiach.",
  },
  {
    label: "Wsparcie",
    nowawebTitle: "Jedna osoba zna całość.",
    nowawebDetail: "Rozmawiasz z osobą, która zna wszystkie decyzje projektu.",
    nowawebVerdictTitle: "Jeden kontakt zna cały projekt.",
    nowawebVerdictDetail: "Rozmawiasz bezpośrednio z osobą, która zna projekt od pierwszej decyzji.",
    wordpressTitle: "Panel ułatwia edycję treści.",
    wordpressDetail: "Możesz edytować treści w CMS; utrzymanie ustalasz z wykonawcą.",
    wordpressVerdictTitle: "Ustal odpowiedzialność.",
    wordpressVerdictDetail: "Jeden opiekun może obsługiwać również stronę na WordPressie.",
  },
];

export default function ComparisonReveal() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const transitionTimer = useRef<number | null>(null);
  const item = criteria[displayedIndex];

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

  useEffect(() => () => {
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
  }, []);

  const selectCriterion = (index: number) => {
    if (index === activeIndex) return;

    setActiveIndex(index);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayedIndex(index);
      rootRef.current?.removeAttribute("data-comparison-transitioning");
      return;
    }

    rootRef.current?.setAttribute("data-comparison-transitioning", "");
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
    transitionTimer.current = window.setTimeout(() => {
      setDisplayedIndex(index);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          rootRef.current?.removeAttribute("data-comparison-transitioning");
        });
      });
    }, 190);
  };

  const updateReveal = (value: string) => {
    const root = rootRef.current;
    if (!root) return;

    root.style.setProperty("--comparison-reveal", `${value}%`);
  };

  return (
    <div className="comparison-reveal" data-comparison-reveal ref={rootRef}>
      <div className="comparison-criteria" ref={selectorRef} role="tablist" aria-label="Kryteria porównania">
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
              onClick={() => selectCriterion(index)}
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
          <div className="comparison-panel-copy">
            <span className="comparison-side-label">Typowy WordPress</span>
            <h3>{item.wordpressTitle}</h3>
            <p>{item.wordpressDetail}</p>
          </div>
          <div
            aria-hidden="true"
            className="comparison-edge-verdict comparison-edge-verdict--wordpress"
            data-comparison-verdict="wordpress"
          >
            <TriangleAlert aria-hidden="true" size={46} strokeWidth={1.65} />
            <strong>{item.wordpressVerdictTitle}</strong>
            <p>{item.wordpressVerdictDetail}</p>
          </div>
        </article>

        <article className="comparison-layer comparison-layer--nowaweb" data-comparison-layer="nowaweb">
          <div className="comparison-panel-copy">
            <span className="comparison-side-label">NowaWeb</span>
            <h3>{item.nowawebTitle}</h3>
            <p>{item.nowawebDetail}</p>
          </div>
          <div
            aria-hidden="true"
            className="comparison-edge-verdict comparison-edge-verdict--nowaweb"
            data-comparison-verdict="nowaweb"
          >
            <BadgeCheck aria-hidden="true" size={46} strokeWidth={1.65} />
            <strong>{item.nowawebVerdictTitle}</strong>
            <p>{item.nowawebVerdictDetail}</p>
          </div>
        </article>

        <span className="comparison-divider" aria-hidden="true" />
        <span className="comparison-handle" aria-hidden="true">VS</span>
        <input
          aria-label="Przesuń, aby porównać NowaWeb i WordPress"
          className="comparison-slider"
          data-comparison-slider
          defaultValue="52"
          max="100"
          min="0"
          onInput={(event) => {
            updateReveal(event.currentTarget.value);
          }}
          type="range"
        />
      </div>

      <p className="comparison-instruction">Przesuń uchwyt, aby porównać.</p>
    </div>
  );
}
