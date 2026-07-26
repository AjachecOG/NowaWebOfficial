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



    const resetElement = (element: HTMLElement) => {

      element.style.setProperty("--hero-follow-x", "0px");

      element.style.setProperty("--hero-follow-y", "0px");

      element.style.setProperty("--hero-hover-y", "0px");

      element.style.setProperty("--hero-hover-scale", "1");

    };



    const releaseEntryAnimation = (element: HTMLElement) => {

      element.style.animation = "none";

      element.classList.add("hero-motion-live");

    };



    targets.forEach((element) => {

      element.addEventListener("animationend", () => releaseEntryAnimation(element), { once: true });

    });



    const handlePointer = (event: PointerEvent) => {

      const { clientX, clientY } = event;



      targets.forEach((element) => {

        const rect = element.getBoundingClientRect();

        const centerX = rect.left + rect.width / 2;

        const centerY = rect.top + rect.height / 2;

        const dx = clientX - centerX;

        const dy = clientY - centerY;

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



    const handlePointerLeave = () => {

      targets.forEach((element) => resetElement(element));

    };



    window.addEventListener("pointermove", handlePointer, { passive: true });

    window.addEventListener("pointerleave", handlePointerLeave);



    return () => {

      window.removeEventListener("pointermove", handlePointer);

      window.removeEventListener("pointerleave", handlePointerLeave);

    };

  }, []);



  return null;

}

