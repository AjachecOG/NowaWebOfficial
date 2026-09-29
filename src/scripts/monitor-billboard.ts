const HOLD_MS = 5800;
const HOLD_BEFORE_LAST_MS = HOLD_MS - 2000;
const FIRST_GLITCH_MS = 2000;
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
      const active = frameIndex === nextIndex;
      frame.classList.toggle("is-active", active);
      frame.hidden = !active;
    });
    index = nextIndex;
  };

  const loadFrame = async (frame: HTMLImageElement) => {
    if (!frame.getAttribute("src") && frame.dataset.src) {
      if (frame.dataset.srcset) frame.srcset = frame.dataset.srcset;
      frame.src = frame.dataset.src;
    }
    try {
      await frame.decode();
      return frame.naturalWidth > 0;
    } catch {
      return false;
    }
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
    void loadFrame(frames[(index + 1) % frames.length]).then((ready) => {
      if (cancelled) return;
      if (!ready) {
        schedule(cycle, HOLD_MS);
        return;
      }
      runGlitch(() => {
        if (cancelled) return;
        schedule(cycle, holdBeforeNextGlitch(index, frames.length));
      });
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
