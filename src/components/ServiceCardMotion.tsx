import { useEffect } from "react";

const CARD_SELECTOR = "[data-service-card]";
const PROXIMITY_RADIUS = 96;

function setCardOpen(card: HTMLElement, open: boolean) {
  const trigger = card.querySelector<HTMLButtonElement>("[data-service-card-trigger]");
  const back = card.querySelector<HTMLElement>("[data-service-card-back]");

  card.classList.toggle("service-card--flipped", open);
  card.dataset.flipState = open ? "back" : "front";
  trigger?.setAttribute("aria-expanded", String(open));
  back?.setAttribute("aria-hidden", String(!open));

  if (back) back.inert = !open;
}

function resetProximity(card: HTMLElement) {
  card.style.setProperty("--service-near-lift", "0px");
  card.style.setProperty("--service-near-scale", "1");
  card.style.setProperty("--service-near-rotate-x", "0deg");
  card.style.setProperty("--service-near-rotate-y", "0deg");
}

export default function ServiceCardMotion() {
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>(CARD_SELECTOR));

    if (!cards.length) return;

    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cleanups: Array<() => void> = [];
    let animationFrame = 0;
    let pointerX: number | null = null;
    let pointerY: number | null = null;
    let lastInput: "keyboard" | "pointer" = "pointer";
    let lastPointerType = "mouse";

    const closeOtherCards = (activeCard: HTMLElement) => {
      cards.forEach((card) => {
        if (card !== activeCard) setCardOpen(card, false);
      });
    };

    const openCard = (card: HTMLElement) => {
      closeOtherCards(card);
      setCardOpen(card, true);
    };

    const renderProximity = () => {
      animationFrame = 0;

      if (
        pointerX === null ||
        pointerY === null ||
        !hoverQuery.matches ||
        reducedMotionQuery.matches
      ) {
        cards.forEach(resetProximity);
        return;
      }

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const distanceX = Math.max(rect.left - pointerX!, 0, pointerX! - rect.right);
        const distanceY = Math.max(rect.top - pointerY!, 0, pointerY! - rect.bottom);
        const distance = Math.hypot(distanceX, distanceY);

        if (distance >= PROXIMITY_RADIUS) {
          resetProximity(card);
          return;
        }

        const proximity = 1 - distance / PROXIMITY_RADIUS;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const relativeX = Math.max(-1, Math.min(1, (pointerX! - centerX) / (rect.width / 2)));
        const relativeY = Math.max(-1, Math.min(1, (pointerY! - centerY) / (rect.height / 2)));

        card.style.setProperty("--service-near-lift", `${(-2 * proximity).toFixed(2)}px`);
        card.style.setProperty("--service-near-scale", (1 + 0.008 * proximity).toFixed(4));
        card.style.setProperty(
          "--service-near-rotate-x",
          `${(-relativeY * 1.4 * proximity).toFixed(2)}deg`,
        );
        card.style.setProperty(
          "--service-near-rotate-y",
          `${(relativeX * 1.8 * proximity).toFixed(2)}deg`,
        );
      });
    };

    const scheduleProximity = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;

      if (!animationFrame) animationFrame = window.requestAnimationFrame(renderProximity);
    };

    const clearProximity = () => {
      pointerX = null;
      pointerY = null;

      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      cards.forEach(resetProximity);
    };

    const handleKeyboardInput = () => {
      lastInput = "keyboard";
    };

    const handlePointerInput = (event: PointerEvent) => {
      lastInput = "pointer";
      lastPointerType = event.pointerType;
    };

    cards.forEach((card) => {
      const trigger = card.querySelector<HTMLButtonElement>("[data-service-card-trigger]");
      const closeButton = card.querySelector<HTMLButtonElement>("[data-service-card-close]");

      if (!trigger || !closeButton) return;

      let openBeforePointerDown = false;
      setCardOpen(card, false);

      const handlePointerEnter = (event: PointerEvent) => {
        lastPointerType = event.pointerType;
        if (hoverQuery.matches && event.pointerType !== "touch") openCard(card);
      };

      const handlePointerLeave = () => {
        if (hoverQuery.matches && lastInput !== "keyboard") setCardOpen(card, false);
      };

      const handleTriggerPointerDown = (event: PointerEvent) => {
        openBeforePointerDown = card.classList.contains("service-card--flipped");
        lastPointerType = event.pointerType;
      };

      const handleTriggerFocus = () => {
        if (lastInput === "keyboard" || !hoverQuery.matches) openCard(card);
      };

      const handleTriggerClick = (event: MouseEvent) => {
        if (event.detail === 0) {
          if (!card.classList.contains("service-card--flipped")) openCard(card);
          return;
        }

        if (!hoverQuery.matches || lastPointerType === "touch") {
          closeOtherCards(card);
          setCardOpen(card, !openBeforePointerDown);
        }
      };

      const handleFocusOut = (event: FocusEvent) => {
        const nextTarget = event.relatedTarget;
        if (nextTarget instanceof Node && card.contains(nextTarget)) return;
        if (hoverQuery.matches) setCardOpen(card, false);
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          setCardOpen(card, false);
          trigger.focus();
        }
      };

      const handleClose = () => {
        setCardOpen(card, false);
        trigger.focus({ preventScroll: true });
      };

      card.addEventListener("pointerenter", handlePointerEnter);
      card.addEventListener("pointerleave", handlePointerLeave);
      card.addEventListener("focusout", handleFocusOut);
      card.addEventListener("keydown", handleKeyDown);
      trigger.addEventListener("pointerdown", handleTriggerPointerDown);
      trigger.addEventListener("focus", handleTriggerFocus);
      trigger.addEventListener("click", handleTriggerClick);
      closeButton.addEventListener("click", handleClose);

      cleanups.push(() => {
        card.removeEventListener("pointerenter", handlePointerEnter);
        card.removeEventListener("pointerleave", handlePointerLeave);
        card.removeEventListener("focusout", handleFocusOut);
        card.removeEventListener("keydown", handleKeyDown);
        trigger.removeEventListener("pointerdown", handleTriggerPointerDown);
        trigger.removeEventListener("focus", handleTriggerFocus);
        trigger.removeEventListener("click", handleTriggerClick);
        closeButton.removeEventListener("click", handleClose);
      });
    });

    const handlePreferenceChange = () => {
      clearProximity();
      if (!hoverQuery.matches) cards.forEach((card) => setCardOpen(card, false));
    };

    window.addEventListener("keydown", handleKeyboardInput, { capture: true });
    window.addEventListener("pointerdown", handlePointerInput, { capture: true });
    window.addEventListener("pointermove", scheduleProximity, { passive: true });
    window.addEventListener("pointerleave", clearProximity);
    hoverQuery.addEventListener("change", handlePreferenceChange);
    reducedMotionQuery.addEventListener("change", handlePreferenceChange);

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      cleanups.forEach((cleanup) => cleanup());
      window.removeEventListener("keydown", handleKeyboardInput, { capture: true });
      window.removeEventListener("pointerdown", handlePointerInput, { capture: true });
      window.removeEventListener("pointermove", scheduleProximity);
      window.removeEventListener("pointerleave", clearProximity);
      hoverQuery.removeEventListener("change", handlePreferenceChange);
      reducedMotionQuery.removeEventListener("change", handlePreferenceChange);
    };
  }, []);

  return null;
}
