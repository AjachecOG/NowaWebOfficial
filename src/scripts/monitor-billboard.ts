const HOLD_MS = 5800;
const HOLD_BEFORE_LAST_MS = HOLD_MS - 2000;
// Keep the first contentful window quiet. The billboard still cycles, but it
// no longer forces layout and swaps the LCP image while the page is settling.
const FIRST_GLITCH_MS = 6000;
const GLITCH_MS = 240;
const GLITCH_SWAP_AT = 150;

function holdBeforeNextGlitch(currentIndex: number, frameCount: number) {
  return currentIndex === frameCount - 2 ? HOLD_BEFORE_LAST_MS : HOLD_MS;
}

function initMonitorBillboard() {
  const rig = document.querySelector<HTMLElement>("[data-monitor-billboard]");
  if (!rig || rig.dataset.billboardReady === "true") return;

  const frames = Array.from(rig.querySelectorAll<HTMLImageElement>(".monitor-state"));
  if (!frames.length) return;

  rig.dataset.billboardReady = "true";

  let index = frames.findIndex((frame) => frame.classList.contains("is-active"));
  if (index < 0) index = 0;

  const show = (nextIndex: number) => {
    frames.forEach((frame, frameIndex) => {
      frame.classList.toggle("is-active", frameIndex === nextIndex);
    });
    index = nextIndex;
  };

  show(index);

  // Brand billboard glitch always runs — core homepage motion, not optional polish.
  let cancelled = false;
  const timeouts: number[] = [];

  const schedule = (fn: () => void, ms: number) => {
    timeouts.push(window.setTimeout(fn, ms));
  };

  const runGlitch = (onDone: () => void) => {
    rig.classList.remove("is-glitching");
    void rig.offsetWidth;
    rig.classList.add("is-glitching");

    schedule(() => {
      show((index + 1) % frames.length);
    }, GLITCH_SWAP_AT);

    schedule(() => {
      rig.classList.remove("is-glitching");
      onDone();
    }, GLITCH_MS);
  };

  const cycle = () => {
    if (cancelled) return;
    runGlitch(() => {
      if (cancelled) return;
      schedule(cycle, holdBeforeNextGlitch(index, frames.length));
    });
  };

  schedule(cycle, FIRST_GLITCH_MS);

  return () => {
    cancelled = true;
    timeouts.forEach((timeout) => window.clearTimeout(timeout));
    rig.classList.remove("is-glitching");
    delete rig.dataset.billboardReady;
  };
}

initMonitorBillboard();
document.addEventListener("astro:page-load", initMonitorBillboard);
