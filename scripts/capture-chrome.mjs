import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outDir = resolve("D:/adasj/Documents/NowaWebOfficial/output/playwright");
const url = "http://127.0.0.1:4321/";

const targets = [
  { name: "home-desktop", width: 1440, height: 1200, fullPage: false },
  { name: "home-wide", width: 1818, height: 929, fullPage: false },
  { name: "home-mobile", width: 390, height: 1200, fullPage: false },
  { name: "home-mobile-long", width: 390, height: 10500, fullPage: false },
  { name: "home-full", width: 1440, height: 8600, fullPage: false },
];

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

async function fetchJson(endpoint, retries = 80) {
  let lastError;

  for (let index = 0; index < retries; index += 1) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      lastError = error;
    }

    await delay(150);
  }

  throw lastError ?? new Error(`Cannot fetch ${endpoint}`);
}

function createCdpClient(webSocketUrl) {
  const ws = new WebSocket(webSocketUrl);
  let id = 0;
  const callbacks = new Map();

  ws.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    if (payload.id && callbacks.has(payload.id)) {
      const { resolve: resolveCallback, reject } = callbacks.get(payload.id);
      callbacks.delete(payload.id);

      if (payload.error) {
        reject(new Error(payload.error.message));
      } else {
        resolveCallback(payload.result ?? {});
      }
    }
  });

  return new Promise((resolveClient, rejectClient) => {
    ws.addEventListener("open", () => {
      resolveClient({
        send(method, params = {}) {
          id += 1;
          ws.send(JSON.stringify({ id, method, params }));
          return new Promise((resolveCallback, reject) => {
            callbacks.set(id, { resolve: resolveCallback, reject });
          });
        },
        close() {
          ws.close();
        },
      });
    });
    ws.addEventListener("error", rejectClient);
  });
}

async function captureTarget(target) {
  const port = 9300 + Math.floor(Math.random() * 500);
  const profileDir = join(outDir, `chrome-cdp-${target.name}`);
  await mkdir(profileDir, { recursive: true });

  const chrome = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--hide-scrollbars",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    `--window-size=${target.width},${target.height}`,
    "about:blank",
  ], {
    stdio: "ignore",
  });

  try {
    await fetchJson(`http://127.0.0.1:${port}/json/version`);
    const pages = await fetchJson(`http://127.0.0.1:${port}/json/list`);
    const page = pages.find((targetPage) => targetPage.type === "page") ?? pages[0];
    const client = await createCdpClient(page.webSocketDebuggerUrl);

    await client.send("Page.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: target.width,
      height: target.height,
      deviceScaleFactor: 1,
      mobile: target.width < 700,
    });
    await client.send("Page.navigate", { url });
    await delay(1800);

    const screenshot = await client.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    });

    const filePath = join(outDir, `${target.name}.png`);
    await writeFile(filePath, Buffer.from(screenshot.data, "base64"));
    client.close();
    return filePath;
  } finally {
    chrome.kill();
  }
}

await mkdir(outDir, { recursive: true });
const files = [];

for (const target of targets) {
  files.push(await captureTarget(target));
}

console.log(files.join("\n"));
