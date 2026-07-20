import { spawn } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const url = "http://127.0.0.1:4321/";
const port = 9800 + Math.floor(Math.random() * 150);
const profileDir = await mkdtemp(join(tmpdir(), "nowaweb-process-"));
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(endpoint, retries = 80) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) return response.json();
    } catch (error) {
      lastError = error;
    }
    await delay(100);
  }
  throw lastError ?? new Error(`Cannot reach ${endpoint}`);
}

function createCdpClient(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  const callbacks = new Map();
  const events = new Map();
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
    const listeners = events.get(payload.method) ?? [];
    listeners.forEach((listener) => listener(payload.params));
  });

  return new Promise((resolve, reject) => {
    socket.addEventListener("open", () => {
      resolve({
        send(method, params = {}) {
          id += 1;
          socket.send(JSON.stringify({ id, method, params }));
          return new Promise((resolveCall, rejectCall) => {
            callbacks.set(id, { resolve: resolveCall, reject: rejectCall });
          });
        },
        on(method, listener) {
          events.set(method, [...(events.get(method) ?? []), listener]);
        },
        close() {
          socket.close();
        },
      });
    });
    socket.addEventListener("error", reject);
  });
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text ?? "Browser evaluation failed");
  return result.result.value;
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

try {
  await fetchJson(`http://127.0.0.1:${port}/json/version`);
  const pages = await fetchJson(`http://127.0.0.1:${port}/json/list`);
  const page = pages.find((candidate) => candidate.type === "page") ?? pages[0];
  const client = await createCdpClient(page.webSocketDebuggerUrl);
  const runtimeErrors = [];

  await client.send("Page.enable");
  await client.send("Runtime.enable");
  client.on("Runtime.exceptionThrown", ({ exceptionDetails }) => {
    runtimeErrors.push(exceptionDetails.text ?? "Runtime exception");
  });

  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await client.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await client.send("Page.navigate", { url });
  await delay(1600);

  await evaluate(
    client,
    `(async () => {
      const story = document.querySelector('.process-story');
      window.scrollTo({ top: story.getBoundingClientRect().top + window.scrollY - 120, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 900));
    })()`,
  );

  const desktopInitial = await evaluate(
    client,
    `(() => {
      const story = document.querySelector('.process-story');
      const cards = Array.from(document.querySelectorAll('.process-story__card'));
      const sticky = document.querySelector('.process-story__sticky');
      const railRect = document.querySelector('.process-story__rail').getBoundingClientRect();
      const numberNodes = Array.from(document.querySelectorAll('.process-story__nav-item > span'));
      const railCenter = railRect.left + (railRect.width / 2);
      return {
        cardCount: cards.length,
        active: Number(story?.dataset.active),
        reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
        stickyPosition: getComputedStyle(sticky).position,
        overflows: story.scrollWidth > story.clientWidth,
        numberLabels: numberNodes.map((node) => node.textContent.trim()),
        axisDeviation: Math.max(...numberNodes.map((node) => {
          const rect = node.getBoundingClientRect();
          return Math.abs((rect.left + (rect.width / 2)) - railCenter);
        })),
        briefAnimation: getComputedStyle(document.querySelector('.brief-bubble--primary')).animationName,
      };
    })()`,
  );

  const markerStates = [];
  for (let index = 0; index < 4; index += 1) {
    const state = await evaluate(
      client,
      `(async () => {
        const marker = document.querySelector('[data-process-marker="${index}"]');
        const targetY = marker.getBoundingClientRect().top + window.scrollY - (window.innerHeight / 2);
        window.scrollTo({ top: targetY, behavior: 'instant' });
        await new Promise((resolve) => setTimeout(resolve, 260));
        return Number(document.querySelector('.process-story').dataset.active);
      })()`,
    );
    markerStates.push(state);
  }

  const clickActive = await evaluate(
    client,
    `(async () => {
      const nav = document.querySelectorAll('.process-story__nav-item');
      nav[2].click();
      await new Promise((resolve) => setTimeout(resolve, 80));
      return Number(document.querySelector('.process-story').dataset.active);
    })()`,
  );

  await evaluate(
    client,
    `document.querySelectorAll('.process-story__card')[0].focus()`,
  );
  await client.send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Tab",
    code: "Tab",
    windowsVirtualKeyCode: 9,
  });
  await client.send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Tab",
    code: "Tab",
    windowsVirtualKeyCode: 9,
  });
  await delay(100);

  const focusState = await evaluate(
    client,
    `(() => {
      const cards = document.querySelectorAll('.process-story__card');
      return {
        focusActive: Number(document.querySelector('.process-story').dataset.active),
        focusedCard: Array.from(cards).indexOf(document.activeElement),
        activeElement: document.activeElement?.className ?? null,
        pressedCount: document.querySelectorAll('.process-story__card[aria-pressed="true"]').length,
      };
    })()`,
  );
  const manual = { clickActive, ...focusState };

  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 1200,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await client.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await client.send("Page.reload", { ignoreCache: true });
  await delay(1200);

  const mobile = await evaluate(
    client,
    `(() => {
      const sticky = document.querySelector('.process-story__sticky');
      const cards = Array.from(document.querySelectorAll('.process-story__card'));
      return {
        stickyPosition: getComputedStyle(sticky).position,
        cardPositions: cards.map((card) => getComputedStyle(card).position),
        cardOpacities: cards.map((card) => Number(getComputedStyle(card).opacity)),
        overflows: document.querySelector('.process-story').scrollWidth > document.querySelector('.process-story').clientWidth,
      };
    })()`,
  );

  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await client.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await client.send("Page.reload", { ignoreCache: true });
  await delay(900);

  const reduced = await evaluate(
    client,
    `(() => {
      const sticky = document.querySelector('.process-story__sticky');
      const card = document.querySelector('.process-story__card');
      const cards = Array.from(document.querySelectorAll('.process-story__card'));
      const timeline = document.querySelector('.process-story__timeline');
      const markers = document.querySelector('.process-story__markers');
      return {
        matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
        stickyPosition: getComputedStyle(sticky).position,
        transitionDuration: getComputedStyle(card).transitionDuration,
        cardPositions: cards.map((item) => getComputedStyle(item).position),
        timelineDisplay: getComputedStyle(timeline).display,
        markersDisplay: getComputedStyle(markers).display,
        briefAnimation: getComputedStyle(document.querySelector('.brief-bubble--primary')).animationName,
      };
    })()`,
  );

  const failures = [];
  if (desktopInitial.cardCount !== 4) failures.push("desktop does not render four cards");
  if (desktopInitial.stickyPosition !== "sticky") failures.push("desktop scene is not sticky");
  if (desktopInitial.overflows) failures.push("desktop page overflows horizontally");
  if (desktopInitial.numberLabels.join(",") !== "1,2,3,4") failures.push("timeline numbers have leading zeros");
  if (desktopInitial.axisDeviation > 0.5) failures.push(`timeline axis deviates by ${desktopInitial.axisDeviation}px`);
  if (desktopInitial.briefAnimation === "none") failures.push("card micro visuals are not animated");
  if (markerStates.join(",") !== "0,1,2,3") failures.push(`marker sequence is ${markerStates.join(",")}`);
  if (manual.clickActive !== 2 || manual.focusActive !== 1 || manual.pressedCount !== 1) {
    failures.push("click or keyboard focus does not activate exactly one step");
  }
  if (mobile.stickyPosition !== "static") failures.push("mobile scene remains sticky");
  if (mobile.cardPositions.some((position) => position !== "relative")) failures.push("mobile cards still overlap");
  if (mobile.cardOpacities.some((opacity) => opacity !== 1)) failures.push("mobile hides inactive cards");
  if (mobile.overflows) failures.push("mobile page overflows horizontally");
  if (
    !reduced.matches ||
    reduced.stickyPosition !== "sticky" ||
    reduced.transitionDuration === "0s" ||
    reduced.cardPositions.some((position) => position !== "absolute") ||
    reduced.timelineDisplay !== "grid" ||
    reduced.markersDisplay === "none" ||
    reduced.briefAnimation === "none"
  ) {
    failures.push("explicit process motion is disabled by the system preference");
  }
  if (runtimeErrors.length) failures.push(`runtime errors: ${runtimeErrors.join("; ")}`);

  if (failures.length) throw new Error(failures.join("; "));

  console.log("Process story browser verification passed.");
  console.log(JSON.stringify({ markerStates, manual, mobile, reduced }, null, 2));
  client.close();
} finally {
  chrome.kill();
}
