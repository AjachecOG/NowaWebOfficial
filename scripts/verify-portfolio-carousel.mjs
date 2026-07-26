import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const pageUrl = "http://127.0.0.1:4321/#projekty";
const outputDir = resolve("output/playwright");
const port = 9700 + Math.floor(Math.random() * 200);
const profileDir = await mkdtemp(join(tmpdir(), "nowaweb-portfolio-"));
const delay = (ms) => new Promise((resolveDelay) => setTimeout(resolveDelay, ms));

async function fetchJson(url, retries = 80) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch (error) {
      lastError = error;
    }
    await delay(100);
  }
  throw lastError ?? new Error(`Cannot reach ${url}`);
}

function createCdpClient(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  const callbacks = new Map();
  const listeners = new Map();
  let id = 0;

  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    if (payload.id && callbacks.has(payload.id)) {
      const callback = callbacks.get(payload.id);
      callbacks.delete(payload.id);
      if (payload.error) callback.reject(new Error(payload.error.message));
      else callback.resolve(payload.result ?? {});
      return;
    }
    for (const listener of listeners.get(payload.method) ?? []) listener(payload.params);
  });

  return new Promise((resolveClient, rejectClient) => {
    socket.addEventListener("open", () => {
      resolveClient({
        send(method, params = {}) {
          id += 1;
          socket.send(JSON.stringify({ id, method, params }));
          return new Promise((resolveCall, rejectCall) => {
            callbacks.set(id, { resolve: resolveCall, reject: rejectCall });
          });
        },
        on(method, listener) {
          listeners.set(method, [...(listeners.get(method) ?? []), listener]);
        },
        close() {
          socket.close();
        },
      });
    });
    socket.addEventListener("error", rejectClient);
  });
}

async function evaluate(client, expression) {
  const response = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text);
  }
  return response.result.value;
}

async function navigateToPortfolio(client) {
  await client.send("Page.navigate", { url: pageUrl });
  await delay(1700);
  await evaluate(
    client,
    `(async () => {
      const section = document.querySelector('#projekty');
      section.scrollIntoView({ block: 'center', behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 500));
    })()`,
  );
}

async function capture(client, filename) {
  const screenshot = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await writeFile(join(outputDir, filename), Buffer.from(screenshot.data, "base64"));
}

async function getSidePoint(client, position) {
  return evaluate(
    client,
    `(() => {
      const side = document.querySelector('[data-position="${position}"]');
      const center = document.querySelector('[data-position="center"]');
      const sideRect = side.getBoundingClientRect();
      const centerRect = center.getBoundingClientRect();
      const viewportRight = document.documentElement.clientWidth;
      const visibleLeft = '${position}' === 'right'
        ? Math.max(sideRect.left, centerRect.right, 0)
        : Math.max(sideRect.left, 0);
      const visibleRight = '${position}' === 'left'
        ? Math.min(sideRect.right, centerRect.left, viewportRight)
        : Math.min(sideRect.right, viewportRight);
      return {
        x: visibleLeft + (visibleRight - visibleLeft) / 2,
        y: sideRect.top + sideRect.height / 2,
      };
    })()`,
  );
}

async function physicalClickSide(client, position, jitter = 0) {
  const point = await getSidePoint(client, position);

  await client.send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: point.x,
    y: point.y,
    button: "left",
    buttons: 1,
    clickCount: 1,
  });
  await client.send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: point.x + jitter,
    y: point.y,
    button: "left",
    buttons: 1,
  });
  await client.send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: point.x + jitter,
    y: point.y,
    button: "left",
    buttons: 0,
    clickCount: 1,
  });
}

async function physicalTapSide(client, position) {
  const point = await getSidePoint(client, position);

  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ ...point, id: 1, radiusX: 1, radiusY: 1, force: 1 }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
}

const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    "--window-size=1440,1000",
    "about:blank",
  ],
  { stdio: "ignore" },
);

await mkdir(outputDir, { recursive: true });

try {
  await fetchJson(`http://127.0.0.1:${port}/json/version`);
  const pages = await fetchJson(`http://127.0.0.1:${port}/json/list`);
  const page = pages.find((candidate) => candidate.type === "page") ?? pages[0];
  const client = await createCdpClient(page.webSocketDebuggerUrl);
  const runtimeErrors = [];

  client.on("Runtime.exceptionThrown", ({ exceptionDetails }) => {
    runtimeErrors.push(exceptionDetails.exception?.description ?? exceptionDetails.text);
  });

  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await client.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await navigateToPortfolio(client);

  const desktop = await evaluate(
    client,
    `(() => {
      const root = document.querySelector('.portfolio-carousel');
      const cards = Array.from(document.querySelectorAll('.portfolio-carousel__card'));
      const sideCards = cards.filter((card) => card.dataset.position !== 'center');
      const center = cards.find((card) => card.dataset.position === 'center');
      const glass = getComputedStyle(sideCards[0], '::before');
      const sectionRect = document.querySelector('#projekty').getBoundingClientRect();
      const projectNames = Array.from(document.querySelectorAll('.portfolio-carousel__project-name-item'));
      const activeProjectName = projectNames.find((name) => name.dataset.active === 'true');
      const documentWidthWithCarousel = document.documentElement.scrollWidth;
      root.style.display = 'none';
      const documentWidthWithoutCarousel = document.documentElement.scrollWidth;
      root.style.removeProperty('display');
      return {
        count: cards.length,
        active: Number(root.dataset.active),
        activeName: center.dataset.project,
        positions: cards.map((card) => card.dataset.position).sort(),
        objectFits: cards.map((card) => getComputedStyle(card.querySelector('img')).objectFit),
        imagesLoaded: cards.map((card) => {
          const image = card.querySelector('img');
          return image.complete && image.naturalWidth > 0;
        }),
        imagesFillFrames: cards.map((card) => {
          const screen = card.querySelector('.portfolio-carousel__screen').getBoundingClientRect();
          const image = card.querySelector('img').getBoundingClientRect();
          return Math.abs(screen.height - image.height) < 1 && Math.abs(screen.width - image.width) < 1;
        }),
        removedChromeCount: document.querySelectorAll(
          '.portfolio-carousel__titlebar, .portfolio-carousel__meta, .portfolio-carousel__external, .portfolio-carousel__side-control, .portfolio-carousel__controls, .portfolio-carousel__hint'
        ).length,
        sideRoles: sideCards.map((card) => card.getAttribute('role')),
        sideFilters: sideCards.map((card) => getComputedStyle(card).filter),
        transitionDurations: getComputedStyle(center).transitionDuration.split(',').map((value) => value.trim()),
        glassBackdrop: glass.backdropFilter || glass.webkitBackdropFilter,
        glassOpacity: Number(glass.opacity),
        sectionEdges: {
          left: sectionRect.left,
          right: sectionRect.right,
          viewportRight: document.documentElement.clientWidth,
        },
        stageMask: getComputedStyle(document.querySelector('.portfolio-carousel__stage')).maskImage,
        projectNameCount: projectNames.length,
        activeProjectName: activeProjectName?.textContent.trim(),
        projectNameOpacities: projectNames.map((name) => Number(getComputedStyle(name).opacity)),
        projectNameTransitionProperties: getComputedStyle(activeProjectName).transitionProperty
          .split(',')
          .map((value) => value.trim()),
        visibleSideWidths: sideCards.map((card) => {
          const rect = card.getBoundingClientRect();
          return Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0));
        }),
        addsHorizontalOverflow: documentWidthWithCarousel > documentWidthWithoutCarousel,
      };
    })()`,
  );

  assert.equal(desktop.count, 3);
  assert.equal(desktop.active, 1);
  assert.equal(desktop.activeName, "New York Rolls");
  assert.deepEqual(desktop.positions, ["center", "left", "right"]);
  assert.deepEqual(desktop.objectFits, ["contain", "contain", "contain"]);
  assert.ok(desktop.imagesLoaded.every(Boolean));
  assert.ok(desktop.imagesFillFrames.every(Boolean));
  assert.equal(desktop.removedChromeCount, 0);
  assert.deepEqual(desktop.sideRoles, ["button", "button"]);
  assert.ok(desktop.sideFilters.every((filter) => filter === "none"));
  assert.ok(desktop.transitionDurations.every((duration) => duration === "0.9s"));
  assert.match(desktop.glassBackdrop, /blur\(2\.5px\)/);
  assert.ok(desktop.glassOpacity > 0.9);
  assert.ok(desktop.sectionEdges.left <= 0.5);
  assert.ok(desktop.sectionEdges.right >= desktop.sectionEdges.viewportRight - 0.5);
  assert.match(desktop.stageMask, /linear-gradient/);
  assert.equal(desktop.projectNameCount, 3);
  assert.equal(desktop.activeProjectName, "New York Rolls");
  assert.equal(desktop.projectNameOpacities.filter((opacity) => opacity > 0.99).length, 1);
  assert.ok(desktop.projectNameTransitionProperties.includes("opacity"));
  assert.ok(desktop.projectNameTransitionProperties.includes("transform"));
  assert.ok(desktop.visibleSideWidths.every((width) => width > 130));
  assert.equal(desktop.addsHorizontalOverflow, false);
  await capture(client, "portfolio-glass-desktop.png");

  await physicalClickSide(client, "right", 12);
  await delay(120);
  const fadeDuringRight = await evaluate(
    client,
    `Array.from(document.querySelectorAll('.portfolio-carousel__project-name-item'))
      .map((name) => Number(getComputedStyle(name).opacity))`,
  );
  await delay(780);
  const afterRight = await evaluate(
    client,
    `Number(document.querySelector('.portfolio-carousel').dataset.active)`,
  );
  await physicalClickSide(client, "left");
  await delay(900);
  const afterLeft = await evaluate(
    client,
    `Number(document.querySelector('.portfolio-carousel').dataset.active)`,
  );
  const afterKeyboard = await evaluate(
    client,
    `(async () => {
      const stage = document.querySelector('.portfolio-carousel__stage');
      stage.focus();
      stage.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 900));
      return Number(document.querySelector('.portfolio-carousel').dataset.active);
    })()`,
  );
  const clickSequence = { afterRight, afterLeft, afterKeyboard };

  assert.deepEqual(clickSequence, { afterRight: 2, afterLeft: 1, afterKeyboard: 0 });
  assert.ok(fadeDuringRight[1] > 0.01 && fadeDuringRight[1] < 0.99);
  assert.ok(fadeDuringRight[2] > 0.01 && fadeDuringRight[2] < 0.99);

  const stageRect = await evaluate(
    client,
    `(() => {
      const rect = document.querySelector('.portfolio-carousel__stage').getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`,
  );
  await client.send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: stageRect.x + 120,
    y: stageRect.y,
    button: "left",
    buttons: 1,
    clickCount: 1,
  });
  await client.send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: stageRect.x - 120,
    y: stageRect.y,
    button: "left",
    buttons: 1,
  });
  await client.send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: stageRect.x - 120,
    y: stageRect.y,
    button: "left",
    buttons: 0,
    clickCount: 1,
  });
  await delay(900);
  assert.equal(
    await evaluate(client, `Number(document.querySelector('.portfolio-carousel').dataset.active)`),
    1,
  );

  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await navigateToPortfolio(client);
  const mobile = await evaluate(
    client,
    `(() => {
      const cards = Array.from(document.querySelectorAll('.portfolio-carousel__card'));
      const center = cards.find((card) => card.dataset.position === 'center');
      const sideCards = cards.filter((card) => card.dataset.position !== 'center');
      const root = center.closest('.portfolio-carousel');
      const centerRect = center.getBoundingClientRect();
      const documentWidthWithCarousel = document.documentElement.scrollWidth;
      root.style.display = 'none';
      const documentWidthWithoutCarousel = document.documentElement.scrollWidth;
      root.style.removeProperty('display');
      return {
        centerWidthRatio: center.getBoundingClientRect().width / innerWidth,
        objectFits: cards.map((card) => getComputedStyle(card.querySelector('img')).objectFit),
        sideRoles: sideCards.map((card) => card.getAttribute('role')),
        clickableSideWidths: sideCards.map((card) => {
          const rect = card.getBoundingClientRect();
          return Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0));
        }),
        visibleSideStrips: sideCards.map((card) => {
          const rect = card.getBoundingClientRect();
          return card.dataset.position === 'left'
            ? Math.max(0, Math.min(rect.right, centerRect.left) - Math.max(rect.left, 0))
            : Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, centerRect.right));
        }),
        addsHorizontalOverflow: documentWidthWithCarousel > documentWidthWithoutCarousel,
      };
    })()`,
  );
  assert.ok(mobile.centerWidthRatio > 0.82 && mobile.centerWidthRatio < 0.9);
  assert.deepEqual(mobile.objectFits, ["contain", "contain", "contain"]);
  assert.deepEqual(mobile.sideRoles, ["button", "button"]);
  assert.ok(mobile.clickableSideWidths.every((width) => width > 10));
  assert.ok(mobile.visibleSideStrips.every((width) => width >= 30));
  assert.equal(mobile.addsHorizontalOverflow, false);
  await capture(client, "portfolio-glass-mobile.png");
  await physicalTapSide(client, "right");
  await delay(900);
  const mobileAfterTap = await evaluate(
    client,
    `Number(document.querySelector('.portfolio-carousel').dataset.active)`,
  );
  assert.equal(mobileAfterTap, 2);

  await client.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await navigateToPortfolio(client);
  const reduced = await evaluate(
    client,
    `(() => {
      const card = document.querySelector('.portfolio-carousel__card[data-position="center"]');
      const seconds = getComputedStyle(card).transitionDuration
        .split(',')
        .map((value) => value.trim().endsWith('ms')
          ? Number.parseFloat(value) / 1000
          : Number.parseFloat(value));
      const nameSeconds = getComputedStyle(document.querySelector('.portfolio-carousel__project-name-item'))
        .transitionDuration
        .split(',')
        .map((value) => value.trim().endsWith('ms')
          ? Number.parseFloat(value) / 1000
          : Number.parseFloat(value));
      return { matches: matchMedia('(prefers-reduced-motion: reduce)').matches, seconds, nameSeconds };
    })()`,
  );
  assert.equal(reduced.matches, true);
  assert.ok(reduced.seconds.every((seconds) => seconds > 0.2 && seconds <= 0.4));
  assert.ok(reduced.nameSeconds.every((seconds) => seconds > 0.2 && seconds <= 0.4));
  assert.deepEqual(runtimeErrors, []);

  console.log("Portfolio carousel browser verification passed.");
  console.log(JSON.stringify({ desktop, fadeDuringRight, clickSequence, mobile, mobileAfterTap, reduced }, null, 2));
  client.close();
} finally {
  chrome.kill();
}
