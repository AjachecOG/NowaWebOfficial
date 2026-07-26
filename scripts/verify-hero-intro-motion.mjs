import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const url = "http://127.0.0.1:4321/";
const port = 9800 + Math.floor(Math.random() * 150);
const profileDir = await mkdtemp(join(tmpdir(), "nowaweb-hero-motion-"));
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
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text ?? "Evaluation failed");
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
  const failures = [];

  await client.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await client.send("Page.navigate", { url });
  await delay(220);

  for (const width of [1440, 1280, 1161]) {
    await client.send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await delay(80);

    const clippedLines = await evaluate(
      client,
      `Array.from(document.querySelectorAll('.hero-title-line')).map((outer) => {
        const range = document.createRange();
        range.selectNodeContents(outer.querySelector('.hero-title-line-inner'));
        return {
          text: outer.textContent.trim(),
          available: outer.clientWidth,
          textWidth: range.getBoundingClientRect().width,
        };
      }).filter((line) => line.textWidth > line.available + 0.5)`,
    );

    if (clippedLines.length) {
      failures.push(`hero title clips at ${width}px: ${JSON.stringify(clippedLines)}`);
    }
  }

  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await client.send("Page.navigate", { url });
  await delay(2300);

  const mobile = await evaluate(
    client,
    `(() => {
      const rect = (selector) => {
        const box = document.querySelector(selector).getBoundingClientRect();
        return { left: box.left, right: box.right, width: box.width };
      };
      return {
        innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        copy: rect('.hero-copy'),
        title: rect('.hero-title'),
        lines: Array.from(document.querySelectorAll('.hero-title-line-inner')).map((item) => {
          const box = item.getBoundingClientRect();
          return { left: box.left, right: box.right, width: box.width };
        }),
        lead: rect('.hero .lead'),
        buttons: Array.from(document.querySelectorAll('.hero .button')).map((item) => {
          const box = item.getBoundingClientRect();
          return { left: box.left, right: box.right, width: box.width, href: item.getAttribute('href') };
        }),
        eyebrow: document.querySelector('[data-hero-eyebrow-text]').textContent,
        typingComplete: document.querySelector('.hero-eyebrow').dataset.typingComplete,
      };
    })()`,
  );

  const mobileScreenshot = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await writeFile(
    join("output", "playwright", "hero-motion-mobile.png"),
    Buffer.from(mobileScreenshot.data, "base64"),
  );

  const boxes = [mobile.copy, mobile.title, mobile.lead, ...mobile.lines, ...mobile.buttons];
  if (mobile.documentWidth > mobile.innerWidth) {
    failures.push(`mobile document overflows: ${mobile.documentWidth}px > ${mobile.innerWidth}px`);
  }
  if (boxes.some((box) => box.left < -0.5 || box.right > mobile.innerWidth + 0.5)) {
    failures.push(`mobile hero boxes leave viewport: ${JSON.stringify(boxes)}`);
  }
  if (mobile.eyebrow !== "NowaWeb - strony internetowe" || mobile.typingComplete !== "true") {
    failures.push("eyebrow did not finish its one-shot typing sequence");
  }
  if (mobile.buttons.map((button) => button.href).join(",") !== "#kontakt,#projekty") {
    failures.push("hero CTA anchor targets changed");
  }

  await delay(700);
  const stableEyebrow = await evaluate(
    client,
    `document.querySelector('[data-hero-eyebrow-text]').textContent`,
  );
  if (stableEyebrow !== "NowaWeb - strony internetowe") {
    failures.push("eyebrow erased or looped after completing");
  }

  let focusedPrimary = false;
  for (let attempt = 0; attempt < 8 && !focusedPrimary; attempt += 1) {
    await client.send("Input.dispatchKeyEvent", {
      type: "rawKeyDown",
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
    focusedPrimary = await evaluate(
      client,
      `document.activeElement?.matches('.hero .button.primary') ?? false`,
    );
  }

  const focusState = await evaluate(
    client,
    `(() => {
      const style = getComputedStyle(document.activeElement);
      return {
        href: document.activeElement?.getAttribute('href'),
        focusVisible: document.activeElement?.matches(':focus-visible'),
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
      };
    })()`,
  );
  if (focusState.outlineStyle !== "solid" || parseFloat(focusState.outlineWidth) < 3) {
    failures.push(`hero CTA focus ring is missing: ${JSON.stringify(focusState)}`);
  }

  const hashes = await evaluate(
    client,
    `(() => {
      document.querySelector('.hero .button.primary').click();
      const primary = location.hash;
      document.querySelector('.hero .button.secondary').click();
      return { primary, secondary: location.hash };
    })()`,
  );
  if (hashes.primary !== "#kontakt" || hashes.secondary !== "#projekty") {
    failures.push(`hero CTA navigation failed: ${JSON.stringify(hashes)}`);
  }

  await client.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await client.send("Page.reload", { ignoreCache: true });
  await delay(180);

  const reduced = await evaluate(
    client,
    `(() => ({
      staticText: document.querySelector('.hero-eyebrow-static').textContent,
      staticDisplay: getComputedStyle(document.querySelector('.hero-eyebrow-static')).display,
      animatedDisplay: getComputedStyle(document.querySelector('.hero-eyebrow-animated')).display,
      typedText: document.querySelector('[data-hero-eyebrow-text]').textContent,
      typingComplete: document.querySelector('.hero-eyebrow').dataset.typingComplete,
      titleAnimation: getComputedStyle(document.querySelector('.hero-title-line-inner')).animationName,
      leadAnimation: getComputedStyle(document.querySelector('.hero .lead')).animationName,
      buttonAnimation: getComputedStyle(document.querySelector('.hero .button')).animationName,
      buttonTransition: getComputedStyle(document.querySelector('.hero .button')).transitionDuration,
      shimmerDisplay: getComputedStyle(document.querySelector('.hero .button.primary'), '::before').display,
    }))()`,
  );

  if (
    reduced.staticText !== "NowaWeb - strony internetowe" ||
    reduced.staticDisplay !== "none" ||
    reduced.animatedDisplay === "none" ||
    reduced.typedText === "NowaWeb - strony internetowe" ||
    reduced.typingComplete !== "false"
  ) {
    failures.push(`reduced-motion typewriter did not begin: ${JSON.stringify(reduced)}`);
  }
  if (
    reduced.titleAnimation !== "hero-title-line-in" ||
    reduced.leadAnimation !== "hero-support-in" ||
    reduced.buttonAnimation !== "hero-support-in" ||
    reduced.buttonTransition !== "0s" ||
    reduced.shimmerDisplay !== "none"
  ) {
    failures.push(`reduced-motion entrance is not opacity-only: ${JSON.stringify(reduced)}`);
  }

  await delay(450);
  const reducedProgress = await evaluate(
    client,
    `document.querySelector('[data-hero-eyebrow-text]').textContent`,
  );
  if (
    reducedProgress.length === 0 ||
    reducedProgress === "NowaWeb - strony internetowe"
  ) {
    failures.push(`reduced-motion typewriter made no visible progress: ${reducedProgress}`);
  }

  await delay(900);
  const reducedFinal = await evaluate(
    client,
    `(() => ({
      text: document.querySelector('[data-hero-eyebrow-text]').textContent,
      complete: document.querySelector('.hero-eyebrow').dataset.typingComplete,
    }))()`,
  );
  if (
    reducedFinal.text !== "NowaWeb - strony internetowe" ||
    reducedFinal.complete !== "true"
  ) {
    failures.push(`reduced-motion typewriter did not finish: ${JSON.stringify(reducedFinal)}`);
  }

  if (failures.length) throw new Error(failures.join("; "));
  console.log("Hero runtime verification passed.");
  client.close();
} finally {
  chrome.kill();
}
