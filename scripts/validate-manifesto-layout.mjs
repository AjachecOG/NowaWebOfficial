import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const url = "http://127.0.0.1:4321/";
const port = 9600 + Math.floor(Math.random() * 400);
const outputDir = join("output", "playwright");
const profileDir = join(outputDir, "manifesto-layout-profile");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(endpoint, retries = 80) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) return response.json();
    } catch {}
    await delay(100);
  }
  throw new Error(`Cannot reach ${endpoint}`);
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

await mkdir(outputDir, { recursive: true });

const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
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
  await delay(1800);
  await evaluate(
    client,
    `(() => {
      const section = document.querySelector('[data-map-reveal]');
      section.classList.add('is-map-visible');
      window.scrollTo(0, section.offsetTop);
    })()`,
  );
  await delay(900);

  const metrics = await evaluate(
    client,
    `(() => {
      const section = document.querySelector('.manifesto');
      const map = document.querySelector('.manifesto-map-silhouette');
      const copy = document.querySelector('.manifesto-copy');
      const title = document.querySelector('#why-title');
      const text = document.querySelector('[data-typewriter-text]');
      const line = document.querySelector('.typewriter-line');
      const box = document.querySelector('[data-typewriter]');

      const overlap = (a, b) => {
        if (!a || !b) return false;
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        return ar.right > br.left && ar.left < br.right && ar.bottom > br.top && ar.top < br.bottom;
      };

      const sectionRect = section.getBoundingClientRect();
      const mapRect = map.getBoundingClientRect();
      const mapCenterX = mapRect.left + mapRect.width / 2;
      const sectionCenterX = sectionRect.left + sectionRect.width / 2;
      const mapCenterOffset = mapCenterX - sectionCenterX;

      return {
        mapCenterOffset,
        mapWidth: mapRect.width,
        mapHeight: mapRect.height,
        titleOverlapsMap: overlap(title, map),
        copyOverlapsMap: overlap(copy, map),
        copyParagraphOverlapsMap: overlap(copy?.querySelector('p'), map),
        typewriterOverlapsMap: overlap(box, map),
        typewriterClipped: line ? line.scrollWidth > line.clientWidth + 1 : false,
        typewriterText: text?.textContent ?? '',
        typewriterRight: box?.getBoundingClientRect().right ?? 0,
        viewportWidth: document.documentElement.clientWidth,
        mapRight: mapRect.right,
        mapLeft: mapRect.left,
      };
    })()`,
  );

  const screenshot = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await writeFile(join(outputDir, "manifesto-layout.png"), Buffer.from(screenshot.data, "base64"));

  const failures = [];
  if (Math.abs(metrics.mapCenterOffset) > 80) {
    failures.push(`map is off-center by ${Math.round(metrics.mapCenterOffset)}px`);
  }
  if (metrics.copyParagraphOverlapsMap) failures.push("manifesto paragraph overlaps map");
  if (metrics.typewriterOverlapsMap) failures.push("typewriter overlaps map");
  if (metrics.typewriterClipped) failures.push("typewriter line is clipped");
  if (metrics.typewriterRight > metrics.viewportWidth) failures.push("typewriter overflows viewport");

  console.log(JSON.stringify({ metrics, screenshot: join(outputDir, "manifesto-layout.png") }, null, 2));
  if (failures.length) throw new Error(failures.join("; "));
  console.log("Manifesto layout validation passed.");
  client.close();
} finally {
  chrome.kill();
}
