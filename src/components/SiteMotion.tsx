import { useEffect } from "react";

export default function SiteMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const signalSections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-signal-sequence]"),
    );

    if (reduceMotion) {
      revealTargets.forEach((target) => target.classList.add("is-visible"));
      signalSections.forEach((section) => section.classList.add("is-sequence-visible"));
      document
        .querySelectorAll<HTMLElement>("[data-map-reveal]")
        .forEach((section) => section.classList.add("is-map-visible"));
      return;
    }

    const signalObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-sequence-visible");
          signalObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.22, rootMargin: "0px 0px -6% 0px" },
    );

    signalSections.forEach((section) => signalObserver.observe(section));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );

    revealTargets.forEach((target) => observer.observe(target));

    const handlePointer = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5).toFixed(3);
      const y = (event.clientY / window.innerHeight - 0.5).toFixed(3);
      root.style.setProperty("--pointer-x", x);
      root.style.setProperty("--pointer-y", y);
    };

    window.addEventListener("pointermove", handlePointer, { passive: true });

    return () => {
      observer.disconnect();
      signalObserver.disconnect();
      window.removeEventListener("pointermove", handlePointer);
    };
  }, []);

  return null;
}
