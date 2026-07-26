import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const url = "http://127.0.0.1:4321/";
const port = 9400 + Math.floor(Math.random() * 400);
const profileDir = await mkdtemp(join(tmpdir(), "nowaweb-motion-"));
const verifyFlipOnly = process.env.VERIFY_FLIP_ONLY === "1";

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
  let id = 0;

  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    if (!payload.id || !callbacks.has(payload.id)) return;

    const callback = callbacks.get(payload.id);
    callbacks.delete(payload.id);
    if (payload.error) callback.reject(new Error(payload.error.message));
    else callback.resolve(payload.result ?? {});
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

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text ?? "Browser evaluation failed");
  }

  return result.result.value;
}

const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--force-prefers-reduced-motion=reduce",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    "--window-size=1146,856",
    "about:blank",
  ],
  { stdio: "ignore" },
);

try {
  await fetchJson(`http://127.0.0.1:${port}/json/version`);
  const pages = await fetchJson(`http://127.0.0.1:${port}/json/list`);
  const page = pages.find((candidate) => candidate.type === "page") ?? pages[0];
  const client = await createCdpClient(page.webSocketDebuggerUrl);

  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1146,
    height: 856,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await client.send("Page.navigate", { url });
  await delay(1600);

  const initial = await evaluate(
    client,
    `(() => {
      const target = document.querySelector('.paper-logo');
      const rect = target.getBoundingClientRect();
      return {
        reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    })()`,
  );

  if (!initial.reduced) throw new Error("Chrome did not enter forced reduced-motion mode.");

  await client.send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: initial.x,
    y: initial.y,
  });
  await delay(300);

  await evaluate(
    client,
    `(() => {
      const section = document.querySelector('[data-map-reveal]');
      window.scrollTo(0, section.offsetTop);
    })()`,
  );
  await delay(700);

  const state = await evaluate(
    client,
    `(async () => {
      const target = document.querySelector('.paper-logo');
      const route = document.querySelector('#manifesto-map-route');
      const service = document.querySelector('.service-card');
      const frames = Array.from(document.querySelectorAll('.monitor-state'));
      const titleRect = document.querySelector('#why-title').getBoundingClientRect();
      const mapShapeRect = document.querySelector('.manifesto-map-silhouette').getBoundingClientRect();
      let routeDash = route.style.strokeDasharray;
      let activeCities = document.querySelectorAll('.manifesto-city.is-route-start, .manifesto-city.is-route-end').length;
      for (let attempt = 0; attempt < 24 && (!routeDash.includes(' ') || activeCities !== 2); attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        routeDash = route.style.strokeDasharray;
        activeCities = document.querySelectorAll('.manifesto-city.is-route-start, .manifesto-city.is-route-end').length;
      }
      return {
        hoverY: target.style.getPropertyValue('--hero-hover-y'),
        hoverScale: target.style.getPropertyValue('--hero-hover-scale'),
        routeDash,
        activeCities,
        serviceTransitionSeconds: parseFloat(getComputedStyle(service).transitionDuration),
        activeMonitorIndex: frames.findIndex((frame) => frame.classList.contains('is-active')),
        titleMapOverlap: titleRect.bottom > mapShapeRect.top && titleRect.right > mapShapeRect.left,
      };
    })()`,
  );

  const flipInitial = await evaluate(
    client,
    `(() => {
      const stage = document.querySelector('[data-brand-flip]');
      const card = document.querySelector('[data-brand-flip-card]');
      const faces = Array.from(document.querySelectorAll('[data-brand-flip-face]'));
      if (!stage || !card) return { missing: true };
      const rect = stage.getBoundingClientRect();
      return {
        missing: false,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        faceCount: faces.length,
        faceSources: faces.map((face) => face.querySelector('img')?.getAttribute('src')),
        backfaceVisibility: faces.map((face) => getComputedStyle(face).backfaceVisibility),
        glintOpacity: parseFloat(getComputedStyle(document.querySelector('.brand-flip-glint')).opacity),
        legacyDominoPresent: Boolean(document.querySelector('[data-brand-domino]')),
      };
    })()`,
  );

  let flipRight = null;
  let flipLeft = null;
  let flipSettled = null;
  let flipSlow = null;
  if (!flipInitial.missing) {
    await client.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: flipInitial.x,
      y: flipInitial.y,
    });
    await delay(20);
    await client.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: flipInitial.x + 160,
      y: flipInitial.y,
    });

    flipRight = await evaluate(
      client,
      `(async () => {
        const stage = document.querySelector('[data-brand-flip]');
        const card = document.querySelector('[data-brand-flip-card]');
        const read = () => ({
          rotation: Number(stage.dataset.rotationY),
          velocity: Number(stage.dataset.velocityY),
        });
        const samples = [];
        for (const wait of [80, 260, 420]) {
          await new Promise((resolve) => setTimeout(resolve, wait));
          samples.push(read());
        }
        return {
          direction: stage.dataset.flipDirection,
          samples,
          transform: getComputedStyle(card).transform,
        };
      })()`,
    );

    await client.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: flipInitial.x - 160,
      y: flipInitial.y,
    });
    await delay(140);
    flipLeft = await evaluate(
      client,
      `(() => {
        const stage = document.querySelector('[data-brand-flip]');
        return {
          direction: stage.dataset.flipDirection,
          rotation: Number(stage.dataset.rotationY),
          velocity: Number(stage.dataset.velocityY),
        };
      })()`,
    );

    await delay(3600);
    flipSettled = await evaluate(
      client,
      `(() => {
        const stage = document.querySelector('[data-brand-flip]');
        return {
          rotation: Number(stage.dataset.rotationY),
          velocity: Number(stage.dataset.velocityY),
        };
      })()`,
    );

    await client.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: 0,
      y: 0,
    });
    await delay(40);
    await client.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: flipInitial.x,
      y: flipInitial.y,
    });
    await delay(80);
    const slowStartRotation = await evaluate(
      client,
      `Number(document.querySelector('[data-brand-flip]').dataset.rotationY)`,
    );

    for (let step = 1; step <= 6; step += 1) {
      await client.send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: flipInitial.x + step * 5,
        y: flipInitial.y,
      });
      await delay(80);
    }

    flipSlow = await evaluate(
      client,
      `(() => {
        const stage = document.querySelector('[data-brand-flip]');
        return {
          direction: stage.dataset.flipDirection,
          rotation: Number(stage.dataset.rotationY),
          velocity: Number(stage.dataset.velocityY),
        };
      })()`,
    );
    flipSlow.travel = flipSlow.rotation - slowStartRotation;
  }

  const typewriter = await evaluate(
    client,
    `(async () => {
      const text = document.querySelector('[data-typewriter-text]');
      const cursor = document.querySelector('[data-typewriter-cursor]');
      if (!text || !cursor) return { missing: true };

      const samples = [{ value: text.textContent ?? '', at: performance.now() }];
      const observer = new MutationObserver(() => {
        samples.push({ value: text.textContent ?? '', at: performance.now() });
      });
      observer.observe(text, { childList: true, characterData: true, subtree: true });
      await new Promise((resolve) => setTimeout(resolve, 7600));
      observer.disconnect();

      return {
        missing: false,
        samples,
        cursorAnimation: getComputedStyle(cursor).animationName,
        legacyCardPresent: Boolean(document.querySelector('.map-card')),
      };
    })()`,
  );

  if (process.env.CAPTURE_FLIP === "1") {
    const screenshot = await client.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    });
    await writeFile(
      join("output", "playwright", "brand-flip.png"),
      Buffer.from(screenshot.data, "base64"),
    );
  }

  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 856,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await client.send("Page.reload", { ignoreCache: true });
  await delay(1500);
  await evaluate(
    client,
    `(() => {
      const section = document.querySelector('[data-map-reveal]');
      window.scrollTo(0, section.offsetTop);
    })()`,
  );
  await delay(500);

  const mobile = await evaluate(
    client,
    `(() => {
      const box = document.querySelector('[data-typewriter]');
      const line = document.querySelector('.typewriter-line');
      const rect = box.getBoundingClientRect();
      const flipStage = document.querySelector('[data-brand-flip]');
      const flipRect = flipStage?.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        viewportWidth: document.documentElement.clientWidth,
        lineOverflows: line.scrollWidth > line.clientWidth,
        flipLeft: flipRect?.left ?? null,
        flipRight: flipRect?.right ?? null,
      };
    })()`,
  );

  if (process.env.CAPTURE_FLIP === "1") {
    const screenshot = await client.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    });
    await writeFile(
      join("output", "playwright", "brand-flip-mobile.png"),
      Buffer.from(screenshot.data, "base64"),
    );
  }

  const failures = [];
  if (!state.hoverY || state.hoverY === "0px") failures.push("hero hover variables did not change");
  if (!state.hoverScale || state.hoverScale === "1") failures.push("hero hover scale did not change");
  if (!state.routeDash.includes(" ")) failures.push("map route animation did not start");
  if (state.activeCities !== 2) failures.push("map route cities are not active");
  if (state.serviceTransitionSeconds < 0.1) failures.push("CSS transitions are still reduced");
  if (state.activeMonitorIndex === 0) failures.push("monitor billboard did not advance");
  if (state.titleMapOverlap) failures.push("manifesto title overlaps the Poland map");
  if (mobile.left < 0 || mobile.right > mobile.viewportWidth || mobile.lineOverflows) {
    failures.push("typewriter box overflows on mobile");
  }
  if (
    mobile.flipLeft === null ||
    mobile.flipRight === null ||
    mobile.flipLeft < 0 ||
    mobile.flipRight > mobile.viewportWidth
  ) {
    failures.push("3D brand card overflows on mobile");
  }
  if (flipInitial.missing || flipInitial.faceCount !== 2 || flipInitial.legacyDominoPresent) {
    failures.push("two-sided 3D brand card is missing");
  } else {
    if (flipInitial.backfaceVisibility.some((value) => value !== "hidden")) {
      failures.push("3D card faces do not hide their reverse sides");
    }
    if (
      !flipInitial.faceSources.includes("/assets/nowaweb/hero/logo-card-cutout.png") ||
      !flipInitial.faceSources.includes("/assets/nowaweb/hero/poster-cutout.png")
    ) {
      failures.push("3D card does not use the two approved brand assets");
    }
    const rightSamples = flipRight?.samples ?? [];
    const rightMotionIsFinite = rightSamples.every(
      (sample) => Number.isFinite(sample.rotation) && Number.isFinite(sample.velocity),
    );
    const [rightEarly, rightMiddle, rightLate] = rightSamples;

    if (
      flipRight?.direction !== "right" ||
      rightSamples.length !== 3 ||
      !rightMotionIsFinite ||
      flipRight.transform === "none"
    ) {
      failures.push("right pointer impulse does not expose a valid motion trace");
    } else {
      if (
        !(
          rightEarly.velocity > rightMiddle.velocity &&
          rightMiddle.velocity > rightLate.velocity &&
          rightLate.velocity > 0
        )
      ) {
        failures.push("rightward momentum does not decay smoothly while preserving direction");
      }
      if (
        !(
          rightEarly.rotation < rightMiddle.rotation &&
          rightMiddle.rotation < rightLate.rotation &&
          rightLate.rotation - rightEarly.rotation > 55
        )
      ) {
        failures.push("brand card does not continue coasting after the pointer impulse");
      }
    }
    if (flipLeft?.direction !== "left" || !(flipLeft.velocity < 0)) {
      failures.push("left pointer impulse does not reverse the card momentum");
    }
    const settledRemainder = Math.abs(
      (((flipSettled?.rotation ?? Number.NaN) % 180) + 180) % 180,
    );
    const settledFaceError = Math.min(settledRemainder, 180 - settledRemainder);
    if (
      !Number.isFinite(flipSettled?.rotation) ||
      !Number.isFinite(flipSettled?.velocity) ||
      settledFaceError > 0.3 ||
      Math.abs(flipSettled.velocity) > 1
    ) {
      failures.push("brand card does not settle cleanly on a readable face");
    }
    if (
      flipSlow?.direction !== "right" ||
      !(flipSlow.travel > 9) ||
      !(flipSlow.velocity > 15 && flipSlow.velocity < 100)
    ) {
      failures.push("slow pointer movement does not rotate the brand card responsively");
    }
    if (flipInitial.glintOpacity > 0.4) failures.push("3D card glint is too intense");
  }
  if (!verifyFlipOnly && typewriter.missing) {
    failures.push("typewriter statement is missing");
  } else if (!verifyFlipOnly) {
    const values = typewriter.samples.map((sample) => sample.value);
    const typoIndex = values.indexOf("Pracujemy zdalnie z firn");
    const correctionIndex = values.findIndex(
      (value, index) => index > typoIndex && value === "Pracujemy zdalnie z fir",
    );
    const fullIndex = values.indexOf("Pracujemy zdalnie z firmami z całej Polski.");

    if (typewriter.legacyCardPresent) failures.push("legacy map card is still present");
    if (!typewriter.cursorAnimation.includes("typewriter-caret")) {
      failures.push("typewriter cursor is not animated");
    }
    if (typoIndex < 0) failures.push("human typo was not rendered");
    if (correctionIndex <= typoIndex) failures.push("typo was not corrected with backspace");
    if (fullIndex <= correctionIndex) failures.push("correct sentence was not completed");

    const deletionSamples = typewriter.samples
      .slice(fullIndex)
      .filter((sample, index, list) => index > 0 && sample.value.length < list[index - 1].value.length);
    const deletionIntervals = deletionSamples
      .slice(1)
      .map((sample, index) => sample.at - deletionSamples[index].at);
    const earlyAverage = deletionIntervals.slice(0, 3).reduce((sum, ms) => sum + ms, 0) / 3;
    const fastAverage = deletionIntervals.slice(-6).reduce((sum, ms) => sum + ms, 0) / 6;

    if (deletionIntervals.length < 10 || !(fastAverage < earlyAverage * 0.65)) {
      failures.push("backspace deletion does not accelerate");
    }

  }

  if (failures.length) throw new Error(failures.join("; "));

  console.log(verifyFlipOnly ? "Brand flip motion verification passed." : "Motion verification passed.");
  client.close();
} finally {
  chrome.kill();
}
