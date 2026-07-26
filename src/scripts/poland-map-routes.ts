import { polandMapCities, polandMapRoutes } from "../data/poland-map";

function cityById(id: string) {
  return polandMapCities.find((city) => city.id === id);
}

function easeOutQuart(t: number) {
  return 1 - (1 - t) ** 4;
}

let routesStarted = false;

export function initPolandMapRoutes() {
  if (routesStarted) return;
  routesStarted = true;

  const section = document.querySelector<HTMLElement>("[data-map-reveal]");
  const routeLine = document.querySelector<SVGLineElement>("#manifesto-map-route");

  if (!section || !routeLine) return;

  let gapTimeout = 0;
  let frameId = 0;

  const setActiveCities = (fromId: string | null, toId: string | null) => {
    section.querySelectorAll<SVGGElement>(".manifesto-city").forEach((city) => {
      const id = city.dataset.cityId;
      city.classList.toggle("is-route-start", id === fromId);
      city.classList.toggle("is-route-end", id === toId);
    });
  };

  const hideRoute = () => {
    const length = routeLine.getTotalLength();
    routeLine.style.opacity = "0";
    // Keep dash pattern collapsed — clearing dasharray draws the full line for one frame
    if (length > 0) {
      routeLine.style.strokeDasharray = `${length}`;
      routeLine.style.strokeDashoffset = `${length}`;
    }
  };

  const playRoute = (index: number) => {
    const route = polandMapRoutes[index];
    const from = cityById(route.from);
    const to = cityById(route.to);
    if (!from || !to) return;

    window.cancelAnimationFrame(frameId);
    window.clearTimeout(gapTimeout);

    routeLine.setAttribute("x1", String(from.x));
    routeLine.setAttribute("y1", String(from.y));
    routeLine.setAttribute("x2", String(to.x));
    routeLine.setAttribute("y2", String(to.y));

    const length = routeLine.getTotalLength();
    if (!length) {
      gapTimeout = window.setTimeout(() => {
        playRoute((index + 1) % polandMapRoutes.length);
      }, route.gapMs);
      return;
    }

    const shotLength = Math.min(Math.max(length * 0.13, 38), 82);
    // Keep the repeated dash outside the path so a single shot can cross the
    // whole route without wrapping back to its origin mid-animation.
    routeLine.style.strokeDasharray = `${shotLength} ${length + shotLength}`;
    routeLine.style.strokeDashoffset = `${shotLength}`;
    routeLine.style.opacity = "0";

    setActiveCities(route.from, route.to);

    const originFlashMs = 70;
    const shootStart = performance.now() + originFlashMs;

    const animate = (now: number) => {
      if (now < shootStart) {
        routeLine.style.opacity = "0.3";
        frameId = window.requestAnimationFrame(animate);
        return;
      }

      const elapsed = now - shootStart;
      const shootProgress = Math.min(elapsed / route.drawMs, 1);

      if (shootProgress < 1) {
        const eased = easeOutQuart(shootProgress);
        routeLine.style.strokeDashoffset = `${shotLength - length * eased}`;
        const peak = shootProgress < 0.12 ? 0.45 + shootProgress * 4.5 : 1;
        routeLine.style.opacity = `${Math.min(peak, 1)}`;
        frameId = window.requestAnimationFrame(animate);
        return;
      }

      // Shot reached destination — hold it there, then fade.
      routeLine.style.strokeDashoffset = `${shotLength - length}`;
      const fadeStart = performance.now();
      const startOpacity = 0.9;

      const fadeFrame = (fadeNow: number) => {
        const fadeProgress = Math.min((fadeNow - fadeStart) / route.fadeMs, 1);
        routeLine.style.opacity = `${startOpacity * (1 - fadeProgress)}`;

        if (fadeProgress < 1) {
          frameId = window.requestAnimationFrame(fadeFrame);
          return;
        }

        hideRoute();
        setActiveCities(null, null);

        gapTimeout = window.setTimeout(() => {
          playRoute((index + 1) % polandMapRoutes.length);
        }, route.gapMs);
      };

      frameId = window.requestAnimationFrame(fadeFrame);
    };

    frameId = window.requestAnimationFrame(animate);
  };

  hideRoute();
  playRoute(0);
}
