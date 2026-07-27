import { useEffect } from "react";

const HERO_TARGETS_SELECTOR = [
  ".paper-logo",
  ".paper-poster",
  ".paper-poland",
  ".tool-rail-piece",
  ".product-notebook",
  ".product-cup",
  ".desk-paper-a",
  ".desk-paper-b",
].join(",");

const PROXIMITY_RADIUS = 280;
const FOLLOW_RADIUS = 135;
const MAX_HOVER_LIFT = 26;
const MAX_HOVER_SCALE = 1.04;
const FOLLOW_STRENGTH = 0.26;

export default function HeroSceneMotion() {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>(HERO_TARGETS_SELECTOR));
    if (!targets.length) return;

    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    const resetElement = (element: HTMLElement) => {
      element.style.setProperty("--hero-follow-x", "0px");
      element.style.setProperty("--hero-follow-y", "0px");
      element.style.setProperty("--hero-hover-y", "0px");
      element.style.setProperty("--hero-hover-scale", "1");
    };

    const resetAll = () => {
      targets.forEach((element) => resetElement(element));
    };

    const releaseEntryAnimation = (element: HTMLElement) => {
      element.style.animation = "none";
      element.classList.add("hero-motion-live");
    };

    targets.forEach((element) => {
      element.addEventListener("animationend", () => releaseEntryAnimation(element), { once: true });
    });

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let hasPointer = false;

    const render = () => {
      frame = 0;

      if (!hasPointer || !hoverQuery.matches) {
        resetAll();
        return;
      }

      targets.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = pointerX - centerX;
        const dy = pointerY - centerY;
        const distance = Math.hypot(dx, dy);

        if (distance >= PROXIMITY_RADIUS) {
          resetElement(element);
          return;
        }

        const proximity = 1 - distance / PROXIMITY_RADIUS;
        const liftFactor = proximity * (0.35 + 0.65 * proximity);
        const hoverY = -MAX_HOVER_LIFT * liftFactor;
        const hoverScale = 1 + (MAX_HOVER_SCALE - 1) * liftFactor;

        let followX = 0;
        let followY = 0;

        if (distance > 0 && distance < FOLLOW_RADIUS) {
          const strength = (1 - distance / FOLLOW_RADIUS) * FOLLOW_STRENGTH;
          followX = dx * strength;
          followY = dy * strength;
        }

        element.style.setProperty("--hero-hover-y", `${hoverY.toFixed(2)}px`);
        element.style.setProperty("--hero-hover-scale", hoverScale.toFixed(4));
        element.style.setProperty("--hero-follow-x", `${followX.toFixed(2)}px`);
        element.style.setProperty("--hero-follow-y", `${followY.toFixed(2)}px`);
      });
    };

    const schedule = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      hasPointer = true;
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const handlePointerLeave = () => {
      hasPointer = false;
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      resetAll();
    };

    const handleHoverChange = () => {
      handlePointerLeave();
    };

    window.addEventListener("pointermove", schedule, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    hoverQuery.addEventListener("change", handleHoverChange);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", schedule);
      window.removeEventListener("pointerleave", handlePointerLeave);
      hoverQuery.removeEventListener("change", handleHoverChange);
      resetAll();
    };
  }, []);

  return null;
}
