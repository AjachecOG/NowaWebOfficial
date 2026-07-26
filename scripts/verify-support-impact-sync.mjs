import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const pageUrl = `http://127.0.0.1:4321/?support-sync=${Date.now()}`;
const port = 9800 + Math.floor(Math.random() * 200);
const profileDir = await mkdtemp(join(tmpdir(), "nowaweb-support-"));
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
  let id = 0;

  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    if (payload.id && callbacks.has(payload.id)) {
      const callback = callbacks.get(payload.id);
      callbacks.delete(payload.id);
      if (payload.error) callback.reject(new Error(payload.error.message));
      else callback.resolve(payload.result ?? {});
    }
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

const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    "--window-size=1440,900",
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
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await client.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await client.send("Page.navigate", { url: pageUrl });
  await delay(1800);

  await evaluate(
    client,
    `(() => {
      const section = document.querySelector('[data-support-sequence]');
      section?.classList.remove('is-title-playing');
      section?.scrollIntoView({ block: 'center', behavior: 'instant' });
      return true;
    })()`,
  );
  await delay(250);
  await evaluate(client, `document.querySelector('[data-support-sequence]')?.classList.add('is-title-playing')`);

  const result = await evaluate(
    client,
    `(() => {
      const title = document.querySelector('#support-title');
      const run = document.querySelector('.support-run');
      const impact = document.querySelector('.support-impact');
      const styles = getComputedStyle(title);
      const impactDelayCss = styles.getPropertyValue('--support-impact-delay').trim();
      const runDurationCss = styles.getPropertyValue('--support-run-duration').trim();

      const runAnim = run.getAnimations().find((a) => a.animationName === 'support-run-in');
      const impactAnim = impact.getAnimations().find((a) => String(a.animationName).includes('support-impact-bounce'));
      if (!runAnim || !impactAnim) {
        return {
          missing: true,
          runNames: run.getAnimations().map((a) => a.animationName),
          impactNames: impact.getAnimations().map((a) => a.animationName),
        };
      }

      const hitMs = Number.parseFloat(impactDelayCss);
      const readX = (el) => {
        const transform = getComputedStyle(el).transform;
        return transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m41;
      };

      const sampleAt = (t) => {
        runAnim.currentTime = Math.max(0, t);
        impactAnim.currentTime = Math.max(0, t);
        runAnim.pause();
        impactAnim.pause();
        return { t, runX: readX(run), impactX: readX(impact) };
      };

      runAnim.currentTime = 220;
      runAnim.pause();
      const earlyRunX = readX(run);

      return {
        missing: false,
        runDurationCss,
        impactDelayCss,
        impactDelay: impactAnim.effect.getTiming().delay,
        earlyRunX,
        beforeHit: sampleAt(hitMs - 90),
        atHit: sampleAt(hitMs),
        afterHit: sampleAt(hitMs + 90),
      };
    })()`,
  );

  console.log(JSON.stringify(result, null, 2));
  assert.equal(result.missing, false, "support animations should be running");
  assert.ok(Number.parseFloat(result.runDurationCss) >= 900, "run should stay substantial");
  assert.ok(Number.parseFloat(result.runDurationCss) <= 1100, "run should feel snappy");
  assert.ok(result.earlyRunX < -120, `runner should start farther left (got ${result.earlyRunX})`);
  assert.ok(Math.abs(result.impactDelay - Number.parseFloat(result.impactDelayCss)) < 8);
  assert.ok(Math.abs(result.atHit.runX) < 80, `runner should be near rest at hit (runX=${result.atHit.runX})`);
  assert.ok(
    result.afterHit.impactX > result.atHit.impactX + 2,
    `impact should kick right after hit (${result.atHit.impactX} -> ${result.afterHit.impactX})`,
  );
  assert.ok(
    result.beforeHit.runX < result.atHit.runX - 20,
    "runner should still be accelerating into the hit",
  );

  console.log("Support impact sync verification passed.");
  client.close();
} finally {
  chrome.kill();
}
