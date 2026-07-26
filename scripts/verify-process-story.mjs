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
  const nativeReducedMotion = await evaluate(
    client,
    `matchMedia('(prefers-reduced-motion: reduce)').matches`,
  );
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
        motionEngine: story?.dataset.motion ?? null,
        axisDeviation: Math.max(...numberNodes.map((node) => {
          const rect = node.getBoundingClientRect();
          return Math.abs((rect.left + (rect.width / 2)) - railCenter);
        })),
      };
    })()`,
  );

  const scenePlayback = await evaluate(
    client,
    `(async () => {
      const story = document.querySelector('.process-story');
      const scenes = Array.from(document.querySelectorAll('[data-process-scene]'));
      const conversationCard = scenes[0].closest('.process-story__card');
      const clientExpected = 'Potrzebuję strony, która nie znudzi ciekawskich.';
      const questionExpected = 'Nowa strona?';
      const answerExpected = 'Już się robi!';
      const counts = () => scenes.map((scene) => scene.getAnimations({ subtree: true }).filter((animation) => animation.playState === 'running').length);
      const conversationFrame = () => {
        const clientText = scenes[0].querySelector('[data-conversation-client]')?.textContent ?? '';
        const questionText = scenes[0].querySelector('[data-conversation-studio-question]')?.textContent ?? '';
        const answerText = scenes[0].querySelector('[data-conversation-studio-answer]')?.textContent ?? '';
        const typingVisible = scenes[0].querySelector('[data-conversation-typing]')?.dataset.messageVisible === 'true';
        return {
          clientText,
          clientExpected,
          questionText,
          questionExpected,
          answerText,
          answerExpected,
          typingVisible,
          glyphLayerCount: scenes[0].querySelectorAll('.story-typed-char').length,
          runningAnimationCount: scenes[0].getAnimations({ subtree: true }).filter((animation) => animation.playState === 'running').length,
        };
      };
      const waitUntil = async (predicate, timeout = 7000) => {
        const startedAt = performance.now();
        while (!predicate() && performance.now() - startedAt < timeout) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      };
      window.scrollTo({ top: 0, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 150));
      const cardTop = conversationCard.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: cardTop - (window.innerHeight * 0.9), behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 150));
      const before = conversationFrame();
      window.scrollTo({ top: cardTop - (window.innerHeight * 0.72), behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 150));
      const started = conversationFrame();
      await new Promise((resolve) => setTimeout(resolve, 750));
      const typing = conversationFrame();
      const top = story.getBoundingClientRect().top + window.scrollY - 80;
      const range = story.offsetHeight - window.innerHeight + 80;
      const initial = { visible: story.dataset.storyVisible, active: story.dataset.active, running: counts(), ...conversationFrame() };
      window.scrollTo({ top: top + range / 3, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 900));
      const second = { active: story.dataset.active, running: counts() };
      window.scrollTo({ top: top + 4, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 900));
      const replay = { active: story.dataset.active, running: counts(), ...conversationFrame() };
      await waitUntil(() => conversationFrame().questionText === questionExpected);
      const question = conversationFrame();
      await waitUntil(() => conversationFrame().typingVisible);
      const indicator = conversationFrame();
      await waitUntil(() => conversationFrame().answerText === answerExpected);
      const complete = conversationFrame();
      return { before, started, typing, initial, second, replay, question, indicator, complete };
    })()`,
  );

  const strategyPlayback = await evaluate(
    client,
    `(async () => {
      const story = document.querySelector('.process-story');
      const scene = document.querySelector('[data-process-scene="strategy"]');
      const top = story.getBoundingClientRect().top + window.scrollY - 80;
      const range = story.offsetHeight - window.innerHeight + 80;
      const frame = () => ({
        noteCount: scene.querySelectorAll('.story-workshop-note').length,
        visibleNotes: Array.from(scene.querySelectorAll('.story-workshop-note'))
          .filter((note) => Number(getComputedStyle(note).opacity) > 0.7).length,
        boardOpacity: Number(getComputedStyle(scene.querySelector('.story-workshop-board')).opacity),
        priorityOpacity: Number(getComputedStyle(scene.querySelector('.story-workshop-priority')).opacity),
        finalLayerCount: scene.querySelectorAll('.story-workshop-final').length,
        visualHeight: scene.getBoundingClientRect().height,
        boardWidthRatio: scene.querySelector('.story-workshop-board').getBoundingClientRect().width / scene.getBoundingClientRect().width,
        noteFontSize: Number.parseFloat(getComputedStyle(scene.querySelector('.story-workshop-note')).fontSize),
        noteRotations: Array.from(scene.querySelectorAll('.story-workshop-note')).map((note) => {
          const transform = getComputedStyle(note).transform;
          if (transform === 'none') return 0;
          const matrix = new DOMMatrixReadOnly(transform);
          return Math.round((Math.atan2(matrix.b, matrix.a) * 180 / Math.PI) * 10) / 10;
        }),
        running: scene.getAnimations({ subtree: true }).filter((item) => item.playState === 'running').length,
      });
      window.scrollTo({ top: top + range / 3, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 1400));
      const reveal = frame();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const grouped = frame();
      await new Promise((resolve) => setTimeout(resolve, 2800));
      const complete = frame();
      return { reveal, grouped, complete };
    })()`,
  );

  const strategyReplay = await evaluate(
    client,
    `(async () => {
      const story = document.querySelector('.process-story');
      const scene = document.querySelector('[data-process-scene="strategy"]');
      const top = story.getBoundingClientRect().top + window.scrollY - 80;
      const range = story.offsetHeight - window.innerHeight + 80;
      window.scrollTo({ top: top + 4, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 900));
      window.scrollTo({ top: top + range / 3, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 450));
      return {
        active: Number(story.dataset.active),
        visibleNotes: Array.from(scene.querySelectorAll('.story-workshop-note'))
          .filter((note) => Number(getComputedStyle(note).opacity) > 0.7).length,
        running: scene.getAnimations({ subtree: true }).filter((item) => item.playState === 'running').length,
      };
    })()`,
  );

  const pencilMakeup = await evaluate(
    client,
    `(async () => {
      const story = document.querySelector('.process-story');
      const scene = document.querySelector('[data-process-scene="design"]');
      const top = story.getBoundingClientRect().top + window.scrollY - 80;
      const range = story.offsetHeight - window.innerHeight + 80;
      const frame = () => {
        const style = (selector) => getComputedStyle(scene.querySelector(selector));
        const mirrored = (selector) => new DOMMatrix(style(selector).transform).a < 0;
        const stroke = scene.querySelector('.story-sketch-svg path');
        return {
          active: Number(story.dataset.active),
          strokeProgress: Number(style('.story-sketch-svg path').strokeDashoffset),
          pencilOpacity: Number(style('.story-sketch-pencil').opacity),
          pencilTransform: style('.story-sketch-pencil').transform,
          pencilMirrored: mirrored('.story-sketch-pencil'),
          paletteOpacity: Number(style('.story-makeup-palette').opacity),
          paintOpacity: Number(style('.story-paint-brush').opacity),
          paintTransform: style('.story-paint-brush').transform,
          paintMirrored: mirrored('.story-paint-brush'),
          smudgeOpacity: Number(style('.story-pencil-smudge').opacity),
          daubOpacity: Number(style('.story-paint-daub').opacity),
          powderOpacity: Number(style('.story-powder-puff').opacity),
          sketchOpacity: Number(style('.story-sketch-svg').opacity),
          designedClipPath: style('.story-page-shell--designed').clipPath,
          running: scene.getAnimations({ subtree: true }).filter((item) => item.playState === 'running').length,
          overflow: scene.scrollWidth > scene.clientWidth || scene.scrollHeight > scene.clientHeight,
          pathCount: scene.querySelectorAll('.story-sketch-svg path').length,
          strokeExists: Boolean(stroke),
        };
      };
      window.scrollTo({ top: top + range / 3, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 700));
      window.scrollTo({ top: top + range * (2 / 3), behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      const drawing = frame();
      await new Promise((resolve) => setTimeout(resolve, 550));
      const pencilReverse = frame();
      await new Promise((resolve) => setTimeout(resolve, 1100));
      const makeup = frame();
      await new Promise((resolve) => setTimeout(resolve, 650));
      const paintReturn = frame();
      await new Promise((resolve) => setTimeout(resolve, 250));
      const powder = frame();
      await new Promise((resolve) => setTimeout(resolve, 1550));
      const complete = frame();
      window.scrollTo({ top: top + range / 3, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 700));
      window.scrollTo({ top: top + range * (2 / 3), behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      const replay = frame();
      return { drawing, pencilReverse, makeup, paintReturn, powder, complete, replay };
    })()`,
  );

  const launchPlayback = await evaluate(
    client,
    `(async () => {
      const story = document.querySelector('.process-story');
      const scene = document.querySelector('[data-process-scene="launch"]');
      const top = story.getBoundingClientRect().top + window.scrollY - 80;
      const range = story.offsetHeight - window.innerHeight + 80;
      window.scrollTo({ top: top + range, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 900));

      const upload = scene.querySelector('.story-upload-phase');
      const config = scene.querySelector('.story-config-phase');
      const fill = scene.querySelector('.story-config-progress__fill');
      const progress = scene.querySelector('.story-config-progress');
      const spinner = scene.querySelector('.story-upload-spinner__dots');
      const complete = scene.querySelector('.story-launch-complete');
      const statuses = Array.from(scene.querySelectorAll('.story-config-status'));
      if (!upload || !config || !fill || !progress || !spinner || !complete || statuses.length !== 3) {
        return { missing: true };
      }

      const animations = scene.getAnimations({ subtree: true });
      const sample = (time) => {
        animations.forEach((animation) => {
          animation.currentTime = time;
          animation.pause();
        });
        const transform = getComputedStyle(fill).transform;
        const spinnerTransform = getComputedStyle(spinner).transform;
        const spinnerMatrix = spinnerTransform === 'none' ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(spinnerTransform);
        const progressRect = progress.getBoundingClientRect();
        return {
          uploadOpacity: Number(getComputedStyle(upload).opacity),
          configOpacity: Number(getComputedStyle(config).opacity),
          completeOpacity: Number(getComputedStyle(complete).opacity),
          spinnerTransform,
          spinnerRotationSignal: Math.abs(spinnerMatrix.b) + Math.abs(spinnerMatrix.c),
          progressScale: transform === 'none' ? 1 : new DOMMatrixReadOnly(transform).a,
          statusOpacities: statuses.map((status) => Number(getComputedStyle(status).opacity)),
          statusFontSizes: statuses.map((status) => Number.parseFloat(getComputedStyle(status).fontSize)),
          statusBottoms: statuses.map((status) => status.getBoundingClientRect().bottom),
          visibleStatusCount: statuses.filter((status) => Number(getComputedStyle(status).opacity) > 0.8).length,
          progressTop: progressRect.top,
          overflow: scene.scrollWidth > scene.clientWidth || scene.scrollHeight > scene.clientHeight,
        };
      };

      const initial = sample(400);
      const lateSpinStart = sample(2400);
      const lateSpinEnd = sample(2600);
      const firstStop = sample(4000);
      const secondStop = sample(5500);
      const thirdStop = sample(6900);
      const completed = sample(9200);

      window.scrollTo({ top: top + range * (2 / 3), behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 750));
      window.scrollTo({ top: top + range, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 350));
      const replay = {
        uploadOpacity: Number(getComputedStyle(upload).opacity),
        completeOpacity: Number(getComputedStyle(complete).opacity),
        running: scene.getAnimations({ subtree: true }).filter((animation) => animation.playState === 'running').length,
      };

      return {
        missing: false,
        uploadCopy: scene.querySelector('.story-uploading-label')?.textContent?.trim() ?? '',
        uploadedCopy: scene.querySelector('.story-uploaded-label')?.textContent?.trim() ?? '',
        hasConfigurationHeading: Boolean(scene.querySelector('.story-config-phase > b')),
        markerCount: scene.querySelectorAll('.story-config-progress > i').length,
        initial,
        lateSpinStart,
        lateSpinEnd,
        firstStop,
        secondStop,
        thirdStop,
        completed,
        replay,
      };
    })()`,
  );

  const markerStates = [];
  for (let index = 0; index < 4; index += 1) {
    const state = await evaluate(
      client,
      `(async () => {
        const story = document.querySelector('.process-story');
        const top = story.getBoundingClientRect().top + window.scrollY - 80;
        const range = story.offsetHeight - window.innerHeight + 80;
        const targetY = top + range * (${index} / 3);
        window.scrollTo({ top: targetY, behavior: 'instant' });
        await new Promise((resolve) => setTimeout(resolve, 900));
        return Number(document.querySelector('.process-story').dataset.active);
      })()`,
    );
    markerStates.push(state);
  }

  const continuousMotion = await evaluate(
    client,
    `(async () => {
      const story = document.querySelector('.process-story');
      const cards = Array.from(document.querySelectorAll('.process-story__card'));
      const card = cards[1];
      const top = story.getBoundingClientRect().top + window.scrollY - 80;
      const range = story.offsetHeight - window.innerHeight + 80;
      const sample = async (progress) => {
        window.scrollTo({ top: top + range * progress, behavior: 'instant' });
        await new Promise((resolve) => setTimeout(resolve, 900));
        const activeCard = document.querySelector('.process-story__card.is-active');
        return {
          active: story.dataset.active,
          transform: getComputedStyle(card).transform,
          scale: Number.parseFloat(getComputedStyle(card).getPropertyValue('--card-scale')),
          opacity: Number.parseFloat(getComputedStyle(card).getPropertyValue('--card-opacity')),
          activeOpacity: Number(getComputedStyle(activeCard).opacity),
          activeTransform: getComputedStyle(activeCard).transform,
        };
      };
      return {
        first: await sample(0.08),
        second: await sample(0.14),
        midpoint: await sample(0.5),
      };
    })()`,
  );

  const clickNavigation = await evaluate(
    client,
    `(async () => {
      const story = document.querySelector('.process-story');
      const nav = document.querySelectorAll('.process-story__nav-item');
      const top = story.getBoundingClientRect().top + window.scrollY - 80;
      const range = story.offsetHeight - window.innerHeight + 80;
      window.scrollTo({ top, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 900));
      const before = window.scrollY;
      nav[2].click();
      await new Promise((resolve) => setTimeout(resolve, 1300));
      const cards = Array.from(document.querySelectorAll('.process-story__card'));
      const zIndexes = cards.map((card) => Number(getComputedStyle(card).zIndex));
      const activeIndex = Number(story.dataset.active);
      return {
        active: activeIndex,
        before,
        after: window.scrollY,
        target: top + range * (2 / 3),
        zIndexes,
        activeZ: zIndexes[activeIndex],
        maxInactiveZ: Math.max(...zIndexes.filter((_, index) => index !== activeIndex)),
      };
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
  await delay(1300);

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
  const manual = { clickActive: clickNavigation.active, clickNavigation, ...focusState };

  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 850,
    height: 478,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await client.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await client.send("Page.reload", { ignoreCache: true });
  await delay(1200);

  const compactDesktop = await evaluate(
    client,
    `(async () => {
      const story = document.querySelector('.process-story');
      const card = document.querySelector('.process-story__card');
      const frame = () => ({
        clientText: card.querySelector('[data-conversation-client]')?.textContent ?? '',
        questionText: card.querySelector('[data-conversation-studio-question]')?.textContent ?? '',
        answerText: card.querySelector('[data-conversation-studio-answer]')?.textContent ?? '',
      });
      window.scrollTo({ top: 0, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 150));
      const cardTop = card.getBoundingClientRect().top + window.scrollY;
      const beforeTarget = cardTop - (window.innerHeight * 0.9);
      window.scrollTo({ top: beforeTarget, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 150));
      const before = frame();
      const entryTarget = cardTop - (window.innerHeight * 0.72);
      window.scrollTo({ top: entryTarget, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 900));
      const typing = frame();
      return {
        viewport: [window.innerWidth, window.innerHeight],
        storyVisible: story.dataset.storyVisible ?? null,
        activeTransform: getComputedStyle(card).transform,
        geometry: {
          cardTop,
          beforeTarget,
          entryTarget,
          scrollY: window.scrollY,
          cardViewportTop: card.getBoundingClientRect().top,
          storyViewportTop: story.getBoundingClientRect().top,
          maxScroll: document.documentElement.scrollHeight - window.innerHeight,
        },
        before,
        typing,
      };
    })()`,
  );

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

  await evaluate(
    client,
    `(async () => {
      const card = document.querySelector('.process-story__card');
      const top = card.getBoundingClientRect().top + window.scrollY - (window.innerHeight * 0.24);
      window.scrollTo({ top, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 700));
    })()`,
  );

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
        sceneAnimationCounts: Array.from(document.querySelectorAll('[data-process-scene]'))
          .map((scene) => scene.getAnimations({ subtree: true }).filter((animation) => animation.playState === 'running').length),
        clientText: document.querySelector('[data-conversation-client]')?.textContent ?? '',
        questionText: document.querySelector('[data-conversation-studio-question]')?.textContent ?? '',
        answerText: document.querySelector('[data-conversation-studio-answer]')?.textContent ?? '',
      };
    })()`,
  );

  const mobileComplete = await evaluate(
    client,
    `(async () => {
      const scene = document.querySelector('[data-process-scene="conversation"]');
      const startedAt = performance.now();
      while (
        scene.querySelector('[data-conversation-studio-answer]')?.textContent !== 'Już się robi!' &&
        performance.now() - startedAt < 7000
      ) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      return {
        questionText: scene.querySelector('[data-conversation-studio-question]')?.textContent ?? '',
        answerText: scene.querySelector('[data-conversation-studio-answer]')?.textContent ?? '',
        verticalOverflow: scene.scrollHeight > scene.clientHeight,
      };
    })()`,
  );

  const strategyMobile = await evaluate(
    client,
    `(async () => {
      const scene = document.querySelector('[data-process-scene="strategy"]');
      const card = scene.closest('.process-story__card');
      const top = card.getBoundingClientRect().top + window.scrollY - (window.innerHeight * 0.24);
      window.scrollTo({ top, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 5200));
      const board = scene.querySelector('.story-workshop-board');
      const priority = scene.querySelector('.story-workshop-priority');
      return {
        noteCount: scene.querySelectorAll('.story-workshop-note').length,
        visibleNotes: Array.from(scene.querySelectorAll('.story-workshop-note'))
          .filter((note) => Number(getComputedStyle(note).opacity) > 0.7).length,
        horizontalOverflow: scene.scrollWidth > scene.clientWidth,
        verticalOverflow: scene.scrollHeight > scene.clientHeight,
        boardOpacity: board ? Number(getComputedStyle(board).opacity) : -1,
        priorityOpacity: priority ? Number(getComputedStyle(priority).opacity) : -1,
      };
    })()`,
  );

  const designMobile = await evaluate(
    client,
    `(async () => {
      const scene = document.querySelector('[data-process-scene="design"]');
      const card = scene.closest('.process-story__card');
      const top = card.getBoundingClientRect().top + window.scrollY - (window.innerHeight * 0.24);
      window.scrollTo({ top, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 200));
      card.click();
      await new Promise((resolve) => setTimeout(resolve, 4700));
      return {
        horizontalOverflow: scene.scrollWidth > scene.clientWidth,
        verticalOverflow: scene.scrollHeight > scene.clientHeight,
        designedOpacity: Number(getComputedStyle(scene.querySelector('.story-page-shell--designed')).opacity),
        designClipPath: getComputedStyle(scene.querySelector('.story-page-shell--designed')).clipPath,
      };
    })()`,
  );

  const launchMobileFallback = await evaluate(
    client,
    `(() => {
      const scene = document.querySelector('[data-process-scene="launch"]');
      const upload = scene.querySelector('.story-upload-phase');
      const config = scene.querySelector('.story-config-phase');
      const complete = scene.querySelector('.story-launch-complete');
      const progress = scene.querySelector('.story-config-progress');
      const statuses = Array.from(scene.querySelectorAll('.story-config-status'));
      return {
        uploadOpacity: Number(getComputedStyle(upload).opacity),
        configOpacity: Number(getComputedStyle(config).opacity),
        completeOpacity: Number(getComputedStyle(complete).opacity),
        completionTitle: complete.querySelector('b').textContent.trim(),
        completionBody: complete.querySelector('small').textContent.trim(),
        markerCount: scene.querySelectorAll('.story-config-progress > i').length,
        statusFontSizes: statuses.map((status) => Number.parseFloat(getComputedStyle(status).fontSize)),
        statusBottoms: statuses.map((status) => status.getBoundingClientRect().bottom),
        progressTop: progress.getBoundingClientRect().top,
        horizontalOverflow: scene.scrollWidth > scene.clientWidth,
        verticalOverflow: scene.scrollHeight > scene.clientHeight,
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

  const reducedConversation = await evaluate(
    client,
    `(async () => {
      const story = document.querySelector('.process-story');
      window.scrollTo({ top: 0, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 150));
      const storyTop = story.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: storyTop - (window.innerHeight * 0.72), behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 900));
      return {
        clientText: story.querySelector('[data-conversation-client]')?.textContent ?? '',
        questionText: story.querySelector('[data-conversation-studio-question]')?.textContent ?? '',
        answerText: story.querySelector('[data-conversation-studio-answer]')?.textContent ?? '',
        storyVisible: story.dataset.storyVisible ?? null,
      };
    })()`,
  );

  const reducedStrategy = await evaluate(
    client,
    `(async () => {
      const story = document.querySelector('.process-story');
      const scene = document.querySelector('[data-process-scene="strategy"]');
      const top = story.getBoundingClientRect().top + window.scrollY - 80;
      const range = story.offsetHeight - window.innerHeight + 80;
      const state = () => ({
        visibleNotes: Array.from(scene.querySelectorAll('.story-workshop-note'))
          .filter((note) => Number(getComputedStyle(note).opacity) > 0.7).length,
        boardOpacity: Number(getComputedStyle(scene.querySelector('.story-workshop-board')).opacity),
        priorityOpacity: Number(getComputedStyle(scene.querySelector('.story-workshop-priority')).opacity),
        running: scene.getAnimations({ subtree: true }).filter((item) => item.playState === 'running').length,
        overflow: scene.scrollWidth > scene.clientWidth || scene.scrollHeight > scene.clientHeight,
      });
      window.scrollTo({ top: top + range / 3, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 900));
      const reveal = state();
      await new Promise((resolve) => setTimeout(resolve, 4500));
      const complete = state();
      return { reveal, complete };
    })()`,
  );

  const reducedPencilMakeup = await evaluate(
    client,
    `(async () => {
      const story = document.querySelector('.process-story');
      const scene = document.querySelector('[data-process-scene="design"]');
      const top = story.getBoundingClientRect().top + window.scrollY - 80;
      const range = story.offsetHeight - window.innerHeight + 80;
      const frame = () => {
        const style = (selector) => getComputedStyle(scene.querySelector(selector));
        const mirrored = (selector) => new DOMMatrix(style(selector).transform).a < 0;
        const stroke = scene.querySelector('.story-sketch-svg path');
        return {
          active: Number(story.dataset.active),
          strokeProgress: Number(style('.story-sketch-svg path').strokeDashoffset),
          pencilOpacity: Number(style('.story-sketch-pencil').opacity),
          pencilTransform: style('.story-sketch-pencil').transform,
          pencilMirrored: mirrored('.story-sketch-pencil'),
          paletteOpacity: Number(style('.story-makeup-palette').opacity),
          paintOpacity: Number(style('.story-paint-brush').opacity),
          paintTransform: style('.story-paint-brush').transform,
          paintMirrored: mirrored('.story-paint-brush'),
          smudgeOpacity: Number(style('.story-pencil-smudge').opacity),
          daubOpacity: Number(style('.story-paint-daub').opacity),
          powderOpacity: Number(style('.story-powder-puff').opacity),
          sketchOpacity: Number(style('.story-sketch-svg').opacity),
          designedClipPath: style('.story-page-shell--designed').clipPath,
          running: scene.getAnimations({ subtree: true }).filter((item) => item.playState === 'running').length,
          overflow: scene.scrollWidth > scene.clientWidth || scene.scrollHeight > scene.clientHeight,
          pathCount: scene.querySelectorAll('.story-sketch-svg path').length,
          strokeExists: Boolean(stroke),
        };
      };
      window.scrollTo({ top: top + range * (2 / 3), behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      const drawing = frame();
      await new Promise((resolve) => setTimeout(resolve, 550));
      const pencilReverse = frame();
      await new Promise((resolve) => setTimeout(resolve, 1100));
      const makeup = frame();
      await new Promise((resolve) => setTimeout(resolve, 650));
      const paintReturn = frame();
      await new Promise((resolve) => setTimeout(resolve, 250));
      const powder = frame();
      await new Promise((resolve) => setTimeout(resolve, 1550));
      const complete = frame();
      window.scrollTo({ top: top + range / 3, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 700));
      window.scrollTo({ top: top + range * (2 / 3), behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      const replay = frame();
      return { drawing, pencilReverse, makeup, paintReturn, powder, complete, replay };
    })()`,
  );

  const reducedLaunch = await evaluate(
    client,
    `(async () => {
      const story = document.querySelector('.process-story');
      const scene = document.querySelector('[data-process-scene="launch"]');
      const top = story.getBoundingClientRect().top + window.scrollY - 80;
      const range = story.offsetHeight - window.innerHeight + 80;
      window.scrollTo({ top: top + range, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 900));
      const upload = scene.querySelector('.story-upload-phase');
      const config = scene.querySelector('.story-config-phase');
      const complete = scene.querySelector('.story-launch-complete');
      return {
        active: Number(story.dataset.active),
        uploadOpacity: Number(getComputedStyle(upload).opacity),
        configOpacity: Number(getComputedStyle(config).opacity),
        completeOpacity: Number(getComputedStyle(complete).opacity),
        completionTitle: complete.querySelector('b').textContent.trim(),
        completionBody: complete.querySelector('small').textContent.trim(),
        animationCount: scene.getAnimations({ subtree: true }).length,
        overflow: scene.scrollWidth > scene.clientWidth || scene.scrollHeight > scene.clientHeight,
      };
    })()`,
  );

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
        motionEngine: document.querySelector('.process-story')?.dataset.motion ?? null,
        stickyPosition: getComputedStyle(sticky).position,
        transitionDuration: getComputedStyle(card).transitionDuration,
        cardPositions: cards.map((item) => getComputedStyle(item).position),
        cardRotations: cards.map((item) => getComputedStyle(item).getPropertyValue('--card-rotate').trim()),
        cardY: cards.map((item) => Number.parseFloat(getComputedStyle(item).getPropertyValue('--card-y'))),
        timelineDisplay: getComputedStyle(timeline).display,
        markersDisplay: getComputedStyle(markers).display,
        launchSceneAnimationCount: Array.from(document.querySelectorAll('[data-process-scene="launch"]'))
          .flatMap((scene) => scene.getAnimations({ subtree: true })).length,
      };
    })()`,
  );

  const failures = [];
  const isPartial = (text, expected) => text.length > 0 && expected.startsWith(text) && text !== expected;
  const ownsPlayback = (sample, index) => (
    Number(sample.active) === index &&
    sample.running.filter((count) => count > 0).length === 1 &&
    sample.running[index] > 0
  );
  if (scenePlayback.before.clientText !== "" || scenePlayback.before.questionText !== "" || scenePlayback.before.answerText !== "") {
    failures.push("conversation final text is visible before its entry trigger");
  }
  if (scenePlayback.started.clientText !== "" || scenePlayback.started.questionText !== "" || scenePlayback.started.answerText !== "") {
    failures.push("conversation characters are visible before the typing delay");
  }
  if (
    !isPartial(scenePlayback.typing.clientText, scenePlayback.typing.clientExpected) ||
    scenePlayback.typing.questionText !== "" ||
    scenePlayback.typing.answerText !== ""
  ) {
    failures.push("conversation does not reveal the client message character by character");
  }
  if (scenePlayback.typing.glyphLayerCount !== 0 || scenePlayback.typing.runningAnimationCount > 2) {
    failures.push("conversation creates per-glyph compositor layers");
  }
  if (scenePlayback.initial.visible !== "true") failures.push("process scenes do not activate on entry");
  if (Number(scenePlayback.initial.active) !== 0 || !isPartial(scenePlayback.initial.clientText, scenePlayback.initial.clientExpected)) {
    failures.push("conversation does not own initial playback");
  }
  if (!ownsPlayback(scenePlayback.second, 1)) failures.push("strategy does not own second-stage playback");
  if (Number(scenePlayback.replay.active) !== 0 || !isPartial(scenePlayback.replay.clientText, scenePlayback.replay.clientExpected) || scenePlayback.replay.questionText !== "" || scenePlayback.replay.answerText !== "") {
    failures.push("conversation does not replay after reverse navigation");
  }
  if (
    scenePlayback.question.questionText !== scenePlayback.question.questionExpected ||
    scenePlayback.question.answerText !== ""
  ) {
    failures.push("conversation does not finish the first studio reply before the typing indicator");
  }
  if (
    !scenePlayback.indicator.typingVisible ||
    scenePlayback.indicator.questionText !== scenePlayback.indicator.questionExpected ||
    scenePlayback.indicator.answerText !== ""
  ) {
    failures.push("conversation does not show the typing indicator between studio replies");
  }
  if (
    scenePlayback.complete.clientText !== scenePlayback.complete.clientExpected ||
    scenePlayback.complete.questionText !== scenePlayback.complete.questionExpected ||
    scenePlayback.complete.answerText !== scenePlayback.complete.answerExpected ||
    scenePlayback.complete.typingVisible
  ) {
    failures.push("conversation does not replace the typing indicator with the final studio reply");
  }
  if (
    strategyPlayback.reveal.noteCount !== 6 ||
    strategyPlayback.reveal.visibleNotes < 1 ||
    strategyPlayback.reveal.visibleNotes >= 6 ||
    strategyPlayback.reveal.running < 1
  ) failures.push("strategy workshop does not stagger note entry");
  if (
    strategyPlayback.grouped.visibleNotes !== 6 ||
    strategyPlayback.grouped.boardOpacity < 0.9 ||
    strategyPlayback.grouped.priorityOpacity > 0.2
  ) failures.push("strategy workshop does not keep a slower grouping phase");
  if (
    strategyPlayback.complete.boardOpacity < 0.9 ||
    strategyPlayback.complete.visibleNotes !== 6 ||
    strategyPlayback.complete.priorityOpacity < 0.9 ||
    strategyPlayback.complete.finalLayerCount !== 0
  ) failures.push("strategy workshop does not hold on the completed board");
  if (
    strategyPlayback.complete.visualHeight < 390 ||
    strategyPlayback.complete.boardWidthRatio < 0.92 ||
    strategyPlayback.complete.noteFontSize < 12
  ) failures.push("strategy workshop window or notes are not large enough");
  if (
    new Set(strategyPlayback.complete.noteRotations).size !== 6 ||
    strategyPlayback.complete.noteRotations.some((angle) => Math.abs(angle) < 0.5 || Math.abs(angle) > 3)
  ) failures.push("strategy workshop notes do not settle at distinct slight angles");
  if (
    strategyReplay.active !== 1 ||
    strategyReplay.visibleNotes >= 6 ||
    strategyReplay.running < 1
  ) failures.push("strategy workshop does not replay after reverse navigation");
  if (
    pencilMakeup.drawing.active !== 2 ||
    pencilMakeup.drawing.pathCount < 8 ||
    !pencilMakeup.drawing.strokeExists ||
    pencilMakeup.drawing.pencilOpacity < 0.2 ||
    pencilMakeup.drawing.running < 3
  ) failures.push("pencil scene does not begin with an active drawing phase");
  if (
    pencilMakeup.drawing.pencilTransform === pencilMakeup.pencilReverse.pencilTransform ||
    pencilMakeup.drawing.pencilMirrored ||
    !pencilMakeup.pencilReverse.pencilMirrored ||
    pencilMakeup.pencilReverse.pencilOpacity < 0.2
  ) failures.push("pencil does not reverse orientation after its jump-cut");
  if (
    pencilMakeup.makeup.paintOpacity < 0.2 ||
    pencilMakeup.makeup.paletteOpacity < 0.2 ||
    pencilMakeup.makeup.designedClipPath === pencilMakeup.drawing.designedClipPath
  ) failures.push("makeup pass does not progressively color the sketched page");
  if (
    pencilMakeup.paintReturn.paintOpacity < 0.2 ||
    pencilMakeup.makeup.paintTransform === pencilMakeup.paintReturn.paintTransform ||
    pencilMakeup.makeup.paintMirrored ||
    !pencilMakeup.paintReturn.paintMirrored
  ) failures.push("classic paint brush does not return in the opposite orientation");
  if (pencilMakeup.powder.powderOpacity < 0.15) {
    failures.push("powder and precision phase is missing");
  }
  if (
    pencilMakeup.complete.sketchOpacity > 0.1 ||
    pencilMakeup.complete.pencilOpacity > 0.1 ||
    pencilMakeup.complete.paintOpacity > 0.1 ||
    pencilMakeup.complete.powderOpacity > 0.1 ||
    pencilMakeup.complete.overflow
  ) failures.push("pencil makeup scene does not settle on the completed design");
  if (pencilMakeup.replay.pencilOpacity < 0.2) {
    failures.push("pencil makeup scene does not replay after reverse navigation");
  }
  if (launchPlayback.missing) {
    failures.push("launch upload and configuration phases are missing");
  } else {
    if (
      launchPlayback.initial.uploadOpacity < 0.9 ||
      launchPlayback.initial.configOpacity > 0.1 ||
      launchPlayback.initial.completeOpacity > 0.1
    ) failures.push("launch scene does not begin with the upload phase");
    if (
      launchPlayback.uploadCopy !== "Publikowanie" ||
      launchPlayback.uploadedCopy !== "Opublikowano" ||
      launchPlayback.hasConfigurationHeading ||
      launchPlayback.markerCount !== 0
    ) failures.push("launch scene copy or progress chrome is not simplified and localized");
    if (
      launchPlayback.initial.spinnerRotationSignal < 0.1 ||
      launchPlayback.lateSpinStart.spinnerTransform === launchPlayback.lateSpinEnd.spinnerTransform
    ) {
      failures.push("launch spinner does not visibly rotate through the upload phase");
    }
    if (
      Math.abs(launchPlayback.firstStop.progressScale - 0.24) > 0.025 ||
      launchPlayback.firstStop.statusOpacities[0] < 0.8 ||
      launchPlayback.firstStop.visibleStatusCount !== 1 ||
      launchPlayback.firstStop.statusFontSizes[0] < 12 ||
      launchPlayback.firstStop.statusBottoms[0] > launchPlayback.firstStop.progressTop
    ) failures.push("launch configuration misses the 24 percent hold");
    if (
      Math.abs(launchPlayback.secondStop.progressScale - 0.67) > 0.025 ||
      launchPlayback.secondStop.statusOpacities[1] < 0.8 ||
      launchPlayback.secondStop.visibleStatusCount !== 1 ||
      launchPlayback.secondStop.statusFontSizes[1] < 12 ||
      launchPlayback.secondStop.statusBottoms[1] > launchPlayback.secondStop.progressTop
    ) failures.push("launch configuration misses the 67 percent hold");
    if (
      Math.abs(launchPlayback.thirdStop.progressScale - 0.88) > 0.025 ||
      launchPlayback.thirdStop.statusOpacities[2] < 0.8 ||
      launchPlayback.thirdStop.visibleStatusCount !== 1 ||
      launchPlayback.thirdStop.statusFontSizes[2] < 12 ||
      launchPlayback.thirdStop.statusBottoms[2] > launchPlayback.thirdStop.progressTop
    ) failures.push("launch configuration misses the 88 percent hold");
    if (
      Math.abs(launchPlayback.completed.progressScale - 1) > 0.01 ||
      launchPlayback.completed.completeOpacity < 0.9 ||
      launchPlayback.completed.overflow
    ) failures.push("launch scene does not persist on a complete, non-overflowing final state");
    if (
      launchPlayback.replay.uploadOpacity < 0.8 ||
      launchPlayback.replay.completeOpacity > 0.2 ||
      launchPlayback.replay.running < 1
    ) failures.push("launch scene does not replay after reverse navigation");
  }
  if (desktopInitial.cardCount !== 4) failures.push("desktop does not render four cards");
  if (desktopInitial.stickyPosition !== "sticky") failures.push("desktop scene is not sticky");
  if (desktopInitial.overflows) failures.push("desktop page overflows horizontally");
  if (desktopInitial.motionEngine !== "gsap") failures.push("desktop GSAP motion is not active");
  if (desktopInitial.numberLabels.join(",") !== "1,2,3,4") failures.push("timeline numbers have leading zeros");
  if (desktopInitial.axisDeviation > 0.5) failures.push(`timeline axis deviates by ${desktopInitial.axisDeviation}px`);
  if (markerStates.join(",") !== "0,1,2,3") failures.push(`marker sequence is ${markerStates.join(",")}`);
  if (continuousMotion.first.active !== continuousMotion.second.active) {
    failures.push("close scroll samples cross an active-stage boundary");
  }
  if (continuousMotion.first.transform === continuousMotion.second.transform) {
    failures.push("card transform does not follow scroll continuously");
  }
  if (
    continuousMotion.first.scale < 0.85 ||
    continuousMotion.second.scale < 0.85 ||
    continuousMotion.first.opacity < 0.4 ||
    continuousMotion.second.opacity < 0.4
  ) {
    failures.push("scrub interpolates card variables from zero instead of the previous pose");
  }
  if (continuousMotion.midpoint.activeOpacity < 0.98) {
    failures.push("active card remains translucent and reveals stacked copy underneath");
  }
  if (
    continuousMotion.first.activeTransform !== "none" ||
    continuousMotion.second.activeTransform !== "none" ||
    continuousMotion.midpoint.activeTransform !== "none"
  ) {
    failures.push("active card remains transformed and rasterizes its text");
  }
  if (
    Math.abs(clickNavigation.after - clickNavigation.before) < 200 ||
    Math.abs(clickNavigation.after - clickNavigation.target) > 140
  ) {
    failures.push("click does not navigate to its ScrollTrigger segment");
  }
  if (clickNavigation.activeZ <= clickNavigation.maxInactiveZ) {
    failures.push("active card is not the top layer of the stack");
  }
  if (manual.clickActive !== 2 || manual.focusActive !== 1 || manual.pressedCount !== 1) {
    failures.push("click or keyboard focus does not activate exactly one step");
  }
  if (
    compactDesktop.viewport.join(",") !== "850,478" ||
    compactDesktop.storyVisible !== "true" ||
    compactDesktop.before.clientText !== "" ||
    compactDesktop.before.questionText !== "" ||
    compactDesktop.before.answerText !== "" ||
    !isPartial(compactDesktop.typing.clientText, "Potrzebuję strony, która nie znudzi ciekawskich.") ||
    compactDesktop.typing.questionText !== "" ||
    compactDesktop.typing.answerText !== "" ||
    compactDesktop.activeTransform !== "none"
  ) {
    failures.push("conversation does not type progressively at the reported desktop viewport");
  }
  if (
    reducedConversation.storyVisible !== "true" ||
    !isPartial(reducedConversation.clientText, "Potrzebuję strony, która nie znudzi ciekawskich.") ||
    reducedConversation.questionText !== "" ||
    reducedConversation.answerText !== ""
  ) {
    failures.push("reduced-motion mode suppresses the requested low-motion typing reveal");
  }
  if (mobile.stickyPosition !== "static") failures.push("mobile scene remains sticky");
  if (mobile.cardPositions.some((position) => position !== "relative")) failures.push("mobile cards still overlap");
  if (mobile.cardOpacities.some((opacity) => opacity !== 1)) failures.push("mobile hides inactive cards");
  if (mobile.overflows) failures.push("mobile page overflows horizontally");
  if (
    !isPartial(mobile.clientText, "Potrzebuję strony, która nie znudzi ciekawskich.") ||
    mobile.questionText !== "" ||
    mobile.answerText !== "" ||
    mobile.sceneAnimationCounts.slice(1).some((count) => count > 0)
  ) {
    failures.push("mobile conversation does not play alone when its card enters the viewport");
  }
  if (
    mobileComplete.questionText !== "Nowa strona?" ||
    mobileComplete.answerText !== "Już się robi!" ||
    mobileComplete.verticalOverflow
  ) {
    failures.push("mobile conversation clips the complete split reply");
  }
  if (
    strategyMobile.noteCount !== 6 ||
    strategyMobile.visibleNotes !== 6 ||
    strategyMobile.horizontalOverflow ||
    strategyMobile.verticalOverflow ||
    strategyMobile.boardOpacity < 0.9 ||
    strategyMobile.priorityOpacity < 0.9
  ) {
    failures.push("mobile strategy workshop overflows or misses its final direction");
  }
  if (
    designMobile.horizontalOverflow ||
    designMobile.verticalOverflow ||
    designMobile.designedOpacity < 0.9
  ) {
    failures.push("mobile pencil makeup scene overflows or misses its final design state");
  }
  if (
    launchMobileFallback.uploadOpacity > 0.1 ||
    launchMobileFallback.configOpacity > 0.1 ||
    launchMobileFallback.completeOpacity < 0.9 ||
    launchMobileFallback.completionTitle !== "Gotowe." ||
    launchMobileFallback.completionBody !== "Twoja strona pracuje." ||
    launchMobileFallback.markerCount !== 0 ||
    launchMobileFallback.statusFontSizes.some((size) => size < 12) ||
    launchMobileFallback.statusBottoms.some((bottom) => bottom > launchMobileFallback.progressTop) ||
    launchMobileFallback.horizontalOverflow ||
    launchMobileFallback.verticalOverflow
  ) {
    failures.push("mobile launch card lacks a readable, non-overflowing fallback before activation");
  }
  if (
    !reduced.matches ||
    reduced.motionEngine !== "gsap" ||
    reduced.stickyPosition !== "sticky" ||
    reduced.transitionDuration === "0s" ||
    reduced.cardPositions.some((position) => position !== "absolute") ||
    reduced.cardRotations.some((rotation) => rotation !== "0deg") ||
    reduced.cardY.some((value) => Math.abs(value) > 50) ||
    reduced.timelineDisplay !== "grid" ||
    reduced.markersDisplay === "none"
  ) {
    failures.push("explicit process motion is disabled by the system preference");
  }
  if (
    reducedStrategy.reveal.running < 1 ||
    reducedStrategy.reveal.visibleNotes < 1 ||
    reducedStrategy.reveal.visibleNotes > 2 ||
    reducedStrategy.complete.boardOpacity < 0.9 ||
    reducedStrategy.complete.visibleNotes !== 6 ||
    reducedStrategy.complete.priorityOpacity < 0.9 ||
    reducedStrategy.complete.overflow
  ) {
    failures.push("reduced-motion strategy workshop is static, incomplete, or overflowing");
  }
  if (
    reducedPencilMakeup.drawing.active !== 2 ||
    reducedPencilMakeup.drawing.pathCount < 8 ||
    !reducedPencilMakeup.drawing.strokeExists ||
    reducedPencilMakeup.drawing.pencilOpacity < 0.2 ||
    reducedPencilMakeup.drawing.running < 3 ||
    reducedPencilMakeup.drawing.overflow
  ) failures.push("pencil scene does not draw under reduced-motion preference");
  if (
    reducedPencilMakeup.drawing.pencilTransform === reducedPencilMakeup.pencilReverse.pencilTransform ||
    reducedPencilMakeup.drawing.pencilMirrored ||
    !reducedPencilMakeup.pencilReverse.pencilMirrored ||
    reducedPencilMakeup.pencilReverse.pencilOpacity < 0.2
  ) failures.push("pencil does not reverse under reduced-motion preference");
  if (
    reducedPencilMakeup.makeup.paintOpacity < 0.2 ||
    reducedPencilMakeup.makeup.paletteOpacity < 0.2 ||
    reducedPencilMakeup.makeup.designedClipPath === reducedPencilMakeup.drawing.designedClipPath
  ) failures.push("makeup pass does not color the page under reduced-motion preference");
  if (
    reducedPencilMakeup.paintReturn.paintOpacity < 0.2 ||
    reducedPencilMakeup.makeup.paintTransform === reducedPencilMakeup.paintReturn.paintTransform ||
    reducedPencilMakeup.makeup.paintMirrored ||
    !reducedPencilMakeup.paintReturn.paintMirrored
  ) failures.push("paint brush does not reverse under reduced-motion preference");
  if (reducedPencilMakeup.powder.powderOpacity < 0.15) {
    failures.push("powder phase is missing under reduced-motion preference");
  }
  if (
    reducedPencilMakeup.complete.sketchOpacity > 0.1 ||
    reducedPencilMakeup.complete.pencilOpacity > 0.1 ||
    reducedPencilMakeup.complete.paintOpacity > 0.1 ||
    reducedPencilMakeup.complete.powderOpacity > 0.1 ||
    reducedPencilMakeup.complete.overflow
  ) failures.push("pencil makeup scene does not complete under reduced-motion preference");
  if (reducedPencilMakeup.replay.pencilOpacity < 0.2) {
    failures.push("pencil makeup scene does not replay under reduced-motion preference");
  }
  if (
    reducedLaunch.active !== 3 ||
    reducedLaunch.uploadOpacity < 0.8 ||
    reducedLaunch.configOpacity > 0.2 ||
    reducedLaunch.completeOpacity > 0.2 ||
    reducedLaunch.animationCount < 1 ||
    reducedLaunch.overflow ||
    reduced.launchSceneAnimationCount < 1
  ) failures.push("reduced-motion preference still suppresses the launch sequence");
  if (runtimeErrors.length) failures.push(`runtime errors: ${runtimeErrors.join("; ")}`);

  if (failures.length) {
    console.error(JSON.stringify({ nativeReducedMotion, scenePlayback, strategyPlayback, strategyReplay, pencilMakeup, launchPlayback, compactDesktop, mobile, mobileComplete, strategyMobile, designMobile, launchMobileFallback, reducedConversation, reducedStrategy, reducedPencilMakeup, reducedLaunch, reduced }, null, 2));
    throw new Error(failures.join("; "));
  }

  console.log("Process story browser verification passed.");
  console.log(JSON.stringify({ nativeReducedMotion, scenePlayback, strategyPlayback, strategyReplay, pencilMakeup, launchPlayback, markerStates, continuousMotion, manual, compactDesktop, mobile, mobileComplete, strategyMobile, designMobile, launchMobileFallback, reducedConversation, reducedStrategy, reducedPencilMakeup, reducedLaunch, reduced }, null, 2));
  client.close();
} finally {
  chrome.kill();
}
