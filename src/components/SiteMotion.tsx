import { useEffect } from "react";

export default function SiteMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const timers: number[] = [];

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });

    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const signalSections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-signal-sequence]"),
    );
    const supportSection = document.querySelector<HTMLElement>("[data-support-sequence]");
    const kontaktPanel = document.querySelector<HTMLElement>("[data-kontakt-sequence]");

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

    let supportObserver: IntersectionObserver | null = null;
    let kontaktObserver: IntersectionObserver | null = null;

    if (supportSection) {
      const eyebrow = supportSection.querySelector<HTMLElement>(".eyebrow[data-support-step]");
      const bodyCopy = supportSection.querySelector<HTMLElement>(
        ".support-copy > p[data-support-step]:not(.eyebrow)",
      );
      const cards = Array.from(
        supportSection.querySelectorAll<HTMLElement>(".support-grid [data-support-step]"),
      );
      // Keep in sync with --support-tempo in global.css (1 = original, 2/3 = ~1/3 faster).
      const SUPPORT_TEMPO = 2 / 3;
      const supportWait = (ms: number) => wait(Math.round(ms * SUPPORT_TEMPO));

      supportObserver = new IntersectionObserver(
        async ([entry]) => {
          if (!entry?.isIntersecting) return;
          supportObserver?.unobserve(supportSection);

          // 1. Wsparcie
          eyebrow?.classList.add("is-visible");
          await supportWait(420);

          // 2. Po wdrożeniu nie znikamy
          supportSection.classList.add("is-title-playing");
          await supportWait(1550);

          // 3. Tekst pod tytułem
          bodyCopy?.classList.add("is-visible");
          await supportWait(380);

          // 4. Karty: Kontakt → Aktualizacje → Dalszy rozwój
          for (const card of cards) {
            card.classList.add("is-visible");
            await supportWait(240);
          }
        },
        { threshold: 0.22, rootMargin: "0px 0px -10% 0px" },
      );

      supportObserver.observe(supportSection);
    }

    if (kontaktPanel) {
      const steps = Array.from(
        kontaktPanel.querySelectorAll<HTMLElement>("[data-kontakt-step]"),
      );
      const formPanel = kontaktPanel.querySelector<HTMLElement>("[data-contact-form-panel]");

      const openContactForm = (options?: { scroll?: boolean }) => {
        if (!formPanel) return;
        formPanel.classList.add("is-open");
        kontaktPanel
          .querySelectorAll<HTMLElement>("[data-open-contact-form]")
          .forEach((trigger) => trigger.setAttribute("aria-expanded", "true"));
        if (options?.scroll === false) return;
        formPanel.scrollIntoView({ block: "nearest", behavior: "smooth" });
      };

      document.querySelectorAll<HTMLElement>("[data-open-contact-form]").forEach((trigger) => {
        trigger.addEventListener("click", (event) => {
          const href = trigger.getAttribute("href");
          if (href?.startsWith("#")) {
            // In-page hash scroll is handled by the nav slide animation.
            openContactForm({ scroll: false });
            return;
          }
          event.preventDefault();
          openContactForm();
        });
      });

      kontaktObserver = new IntersectionObserver(
        async ([entry]) => {
          if (!entry?.isIntersecting) return;
          kontaktObserver?.unobserve(kontaktPanel);

          // Top → bottom: Kontakt → headline → copy → buttons
          // Midway (after headline): orange stripe draws bottom → top
          for (let index = 0; index < steps.length; index += 1) {
            steps[index]?.classList.add("is-visible");

            if (index === 1) {
              await wait(280);
              kontaktPanel.classList.add("is-stripe-drawn");
              await wait(420);
            } else {
              await wait(260);
            }
          }
        },
        { threshold: 0.28, rootMargin: "0px 0px -8% 0px" },
      );

      kontaktObserver.observe(kontaktPanel);
    }

    const scrollCue = document.querySelector<HTMLElement>(".scroll-cue");
    const scrollCueRing = scrollCue?.querySelector<HTMLElement>(".scroll-cue__ring") ?? null;
    let cueObserver: IntersectionObserver | null = null;
    let cueFrame = 0;
    let cueVisible = false;
    const cueStartedAt = performance.now();

    const stopCueBounce = () => {
      if (cueFrame) {
        cancelAnimationFrame(cueFrame);
        cueFrame = 0;
      }
      if (scrollCueRing) {
        scrollCueRing.style.top = "0px";
      }
    };

    const tickCueBounce = (now: number) => {
      if (!scrollCueRing || !cueVisible) {
        cueFrame = 0;
        return;
      }

      const cycle = ((now - cueStartedAt) % 1200) / 1200;
      const y = Math.sin(cycle * Math.PI * 2) * 14;
      scrollCueRing.style.top = `${y.toFixed(2)}px`;
      cueFrame = requestAnimationFrame(tickCueBounce);
    };

    const startCueBounce = () => {
      if (!scrollCueRing || cueFrame) return;
      cueFrame = requestAnimationFrame(tickCueBounce);
    };

    if (scrollCue) {
      cueObserver = new IntersectionObserver(
        ([entry]) => {
          cueVisible = Boolean(entry?.isIntersecting);
          scrollCue.classList.toggle("is-hidden", !cueVisible);

          if (cueVisible) startCueBounce();
          else stopCueBounce();
        },
        { threshold: 0.35 },
      );
      cueObserver.observe(scrollCue);
    }

    const handlePointer = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5).toFixed(3);
      const y = (event.clientY / window.innerHeight - 0.5).toFixed(3);
      root.style.setProperty("--pointer-x", x);
      root.style.setProperty("--pointer-y", y);
    };

    let navScrollFrame = 0;

    const getNavScrollOffset = () => {
      const header = document.querySelector<HTMLElement>(".site-header");
      if (!header) return 24;
      const styles = getComputedStyle(header);
      const top = Number.parseFloat(styles.top) || 0;
      return Math.ceil(header.getBoundingClientRect().height + top + 12);
    };

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const slideToHash = (hash: string) => {
      const id = decodeURIComponent(hash.replace(/^#/, ""));
      if (!id) return false;
      const target = document.getElementById(id);
      if (!target) return false;

      const offset = getNavScrollOffset();
      const destination = Math.max(
        0,
        target.getBoundingClientRect().top + window.scrollY - offset,
      );

      if (navScrollFrame) cancelAnimationFrame(navScrollFrame);

      const startY = window.scrollY;
      const distance = destination - startY;
      if (Math.abs(distance) < 2) {
        history.pushState(null, "", `#${id}`);
        return true;
      }

      // Always animate user-initiated nav jumps. Native CSS smooth scroll is
      // disabled under prefers-reduced-motion, which made clicks feel like teleports.
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const duration = reduceMotion
        ? Math.min(520, Math.max(280, Math.abs(distance) * 0.22))
        : Math.min(1100, Math.max(520, Math.abs(distance) * 0.45));
      const startedAt = performance.now();

      const step = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        window.scrollTo(0, startY + distance * easeInOutCubic(progress));
        if (progress < 1) {
          navScrollFrame = requestAnimationFrame(step);
          return;
        }
        navScrollFrame = 0;
        history.pushState(null, "", `#${id}`);
      };

      navScrollFrame = requestAnimationFrame(step);
      return true;
    };

    const handleNavClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      let hash = "";
      if (href.startsWith("#")) {
        hash = href;
      } else if (
        href.startsWith("/#") &&
        (window.location.pathname === "/" || window.location.pathname === "")
      ) {
        hash = href.slice(1);
      } else {
        return;
      }

      if (slideToHash(hash)) {
        event.preventDefault();
      }
    };

    window.addEventListener("pointermove", handlePointer, { passive: true });
    document.addEventListener("click", handleNavClick);

    return () => {
      observer.disconnect();
      signalObserver.disconnect();
      supportObserver?.disconnect();
      kontaktObserver?.disconnect();
      cueObserver?.disconnect();
      stopCueBounce();
      if (navScrollFrame) cancelAnimationFrame(navScrollFrame);
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("pointermove", handlePointer);
      document.removeEventListener("click", handleNavClick);
    };
  }, []);

  return null;
}
