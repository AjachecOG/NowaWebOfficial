import { LayoutTemplate, MessageCircle, PenTool, Rocket } from "lucide-react";
import { useState } from "react";

const steps = [
  {
    id: "01",
    title: "Rozmowa i brief",
    text: "Poznajemy Twoją markę, cele i najważniejsze wymagania projektu.",
    icon: MessageCircle,
  },
  {
    id: "02",
    title: "Strategia i makieta",
    text: "Układamy strukturę, architekturę treści i kierunek wizualny.",
    icon: LayoutTemplate,
  },
  {
    id: "03",
    title: "Design i wdrożenie",
    text: "Tworzymy dopracowany wygląd oraz szybką, stabilną stronę.",
    icon: PenTool,
  },
  {
    id: "04",
    title: "Start i wsparcie",
    text: "Publikujemy stronę, dbamy o opiekę i dalszy rozwój.",
    icon: Rocket,
  },
];

export default function ProcessIsland() {
  const [active, setActive] = useState(0);

  return (
    <div className="process-island" aria-label="Proces współpracy">
      <div className="process-line" aria-hidden="true">
        <span style={{ width: `${((active + 1) / steps.length) * 100}%` }} />
      </div>
      <div className="process-grid">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === active;

          return (
            <button
              className={`process-step ${isActive ? "is-active" : ""}`}
              aria-pressed={isActive}
              key={step.id}
              onClick={() => setActive(index)}
              onMouseEnter={() => setActive(index)}
              type="button"
            >
              <span className="step-index">{step.id}</span>
              <Icon aria-hidden="true" size={38} strokeWidth={1.7} />
              <strong>{step.title}</strong>
              <span>{step.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
