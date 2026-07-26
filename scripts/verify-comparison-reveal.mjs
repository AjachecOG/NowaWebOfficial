import { spawn } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const url = "http://127.0.0.1:4321/";
const port = 9600 + Math.floor(Math.random() * 250);
const profileDir = await mkdtemp(join(tmpdir(), "nowaweb-comparison-"));
const outputDir = join("output", "playwright");
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

async function navigateToComparison(client, width, height, mobile) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
  });
  await client.send("Page.navigate", { url });
  await delay(900);
  await evaluate(
    client,
    `(() => {
      const root = document.querySelector('[data-comparison-reveal]');
      if (!root) throw new Error('Comparison reveal is missing');
      root.scrollIntoView({ block: 'center' });
    })()`,
  );
  await delay(900);
}

async function capture(client, filename) {
  const screenshot = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await writeFile(join(outputDir, filename), Buffer.from(screenshot.data, "base64"));
}

async function alignComparisonSection(client) {
  await evaluate(
    client,
    `(() => {
      document.querySelector('.comparison')?.scrollIntoView({ block: 'start' });
    })()`,
  );
  await delay(500);
}

async function setComparisonReveal(client, value) {
  await evaluate(
    client,
    `(() => {
      const slider = document.querySelector('[data-comparison-slider]');
      slider.value = '${value}';
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    })()`,
  );
  await delay(520);
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
  await mkdir(outputDir, { recursive: true });
  await fetchJson(`http://127.0.0.1:${port}/json/version`);
  const pages = await fetchJson(`http://127.0.0.1:${port}/json/list`);
  const page = pages.find((candidate) => candidate.type === "page") ?? pages[0];
  const client = await createCdpClient(page.webSocketDebuggerUrl);

  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });

  await navigateToComparison(client, 1440, 1000, false);

  const desktop = await evaluate(
    client,
    `(async () => {
      const root = document.querySelector('[data-comparison-reveal]');
      const stage = root.querySelector('.comparison-stage');
      const slider = root.querySelector('[data-comparison-slider]');
      const handle = root.querySelector('.comparison-handle');
      const divider = root.querySelector('.comparison-divider');
      const intro = document.querySelector('.comparison-intro');
      const eyebrow = intro.querySelector('.eyebrow');
      const heading = intro.querySelector('h2');
      const summary = intro.querySelector('.comparison-summary');
      const buttons = Array.from(root.querySelectorAll('[data-comparison-criterion]'));
      const failures = [];
      const expectedVerdicts = [
        ['Szybkość', 'Szybka strona trudniej traci uwagę.', 'Wolna strona gubi klienta.'],
        ['Koszty', 'Płacisz za ustalony zakres.', 'Tani start, potem stałe koszty.'],
        ['Bezpieczeństwo', 'Prostsza architektura, mniej awarii.', 'Każda wtyczka to kolejny punkt ryzyka.'],
        ['Wygląd', 'Wygląda jak Twoja firma, nie jak szablon.', 'Szablon wygląda jak tysiąc innych stron.'],
        ['Wsparcie', 'Jeden kontakt zna cały projekt.', 'Hosting zrzuca na motyw, motyw na wtyczkę.'],
      ];
      const renderedVerdicts = [];

      const setReveal = (value) => {
        slider.value = String(value);
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      };

      const readVerdicts = () => {
        const nowaweb = root.querySelector('[data-comparison-verdict="nowaweb"]');
        const wordpress = root.querySelector('[data-comparison-verdict="wordpress"]');
        const nowaRect = nowaweb.getBoundingClientRect();
        const wordpressRect = wordpress.getBoundingClientRect();
        const handleRect = handle.getBoundingClientRect();
        return {
          edge: root.getAttribute('data-comparison-edge'),
          nowaOpacity: Number(getComputedStyle(nowaweb).opacity),
          wordpressOpacity: Number(getComputedStyle(wordpress).opacity),
          nowaRight: nowaRect.right,
          wordpressLeft: wordpressRect.left,
          handleLeft: handleRect.left,
          handleRight: handleRect.right,
        };
      };

      const edgeState = (value) => {
        setReveal(value);
        const stageRect = stage.getBoundingClientRect();
        const handleRect = handle.getBoundingClientRect();
        return {
          reveal: root.style.getPropertyValue('--comparison-reveal'),
          handleInside:
            handleRect.left >= stageRect.left - 0.5 &&
            handleRect.right <= stageRect.right + 0.5,
        };
      };

      const left = edgeState(0);
      await new Promise((resolve) => setTimeout(resolve, 460));
      const wordpressVerdict = readVerdicts();
      const right = edgeState(100);
      await new Promise((resolve) => setTimeout(resolve, 460));
      const nowawebVerdict = readVerdicts();
      setReveal(52);
      await new Promise((resolve) => setTimeout(resolve, 460));
      const neutralVerdict = readVerdicts();

      for (let index = 0; index < buttons.length; index += 1) {
        buttons[index].click();
        await new Promise((resolve) => setTimeout(resolve, 560));
        renderedVerdicts.push([
          root.querySelector('[aria-selected="true"]')?.textContent?.trim(),
          root.querySelector('[data-comparison-verdict="nowaweb"] strong')?.textContent?.trim(),
          root.querySelector('[data-comparison-verdict="wordpress"] strong')?.textContent?.trim(),
        ]);
      }

      const active = root.querySelector('[aria-selected="true"]')?.textContent?.trim();
      const nowaTitle = root.querySelector('[data-comparison-layer="nowaweb"] h3')?.textContent?.trim();
      const wordpressTitle = root.querySelector('[data-comparison-layer="wordpress"] h3')?.textContent?.trim();
      const nowaPanelRect = root.querySelector('[data-comparison-layer="nowaweb"] .comparison-panel-copy').getBoundingClientRect();
      const wordpressPanelRect = root.querySelector('[data-comparison-layer="wordpress"] .comparison-panel-copy').getBoundingClientRect();
      const dividerRect = divider.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const eyebrowRect = eyebrow.getBoundingClientRect();
      const headingRect = heading.getBoundingClientRect();
      const summaryRect = summary.getBoundingClientRect();
      const text = root.textContent ?? '';
      const rootRect = root.getBoundingClientRect();

      if (buttons.length !== 5) failures.push('expected five criteria');
      if (left.reveal !== '0%' || right.reveal !== '100%') failures.push('slider does not reach both ends');
      if (!left.handleInside || !right.handleInside) failures.push('VS handle leaves the stage at an edge');
      if (wordpressVerdict.wordpressLeft < wordpressVerdict.handleRight + 16) {
        failures.push('WordPress verdict lacks safe space from the VS handle: ' + (wordpressVerdict.wordpressLeft - wordpressVerdict.handleRight));
      }
      if (nowawebVerdict.nowaRight > nowawebVerdict.handleLeft - 16) {
        failures.push('NowaWeb verdict lacks safe space from the VS handle: ' + (nowawebVerdict.handleLeft - nowawebVerdict.nowaRight));
      }
      for (const verdictState of [wordpressVerdict, nowawebVerdict, neutralVerdict]) {
        if (verdictState.edge !== null) failures.push('edge verdict visibility still uses a threshold state');
        if (verdictState.nowaOpacity < 0.95 || verdictState.wordpressOpacity < 0.95) {
          failures.push('edge verdict opacity changes instead of being revealed by the layer mask');
        }
      }
      if (active !== 'Wsparcie') failures.push('rapid criterion selection did not settle on Wsparcie');
      if (JSON.stringify(renderedVerdicts) !== JSON.stringify(expectedVerdicts)) {
        failures.push('edge verdicts do not follow all five criteria');
      }
      if (nowaTitle !== 'Jedna osoba zna całość.') failures.push('NowaWeb copy did not update');
      if (wordpressTitle !== 'Problem krąży między dostawcami.') failures.push('WordPress copy did not update');
      if (/[ÄÅĹĂ]/.test(text)) failures.push('rendered comparison contains mojibake');
      if (rootRect.left < -0.5 || rootRect.right > innerWidth + 0.5) failures.push('comparison leaves desktop viewport');
      if (eyebrowRect.bottom > headingRect.top + 1) failures.push('comparison eyebrow and heading are not vertically ordered');
      if (headingRect.bottom > summaryRect.top + 1) failures.push('comparison summary does not follow the heading');
      if (stageRect.height < 500 || stageRect.height > 630) failures.push('desktop comparison stage has incorrect proportions');
      if (nowaPanelRect.right > dividerRect.left - 8) failures.push('NowaWeb copy crosses the center divider');
      if (wordpressPanelRect.left < dividerRect.right + 8) failures.push('WordPress copy crosses the center divider');

      return {
        failures,
        active,
        nowaTitle,
        wordpressTitle,
        left,
        right,
        stageHeight: stageRect.height,
        panelGap: wordpressPanelRect.left - nowaPanelRect.right,
        wordpressVerdict,
        nowawebVerdict,
        neutralVerdict,
        renderedVerdicts,
      };
    })()`,
  );

  if (desktop.failures.length) throw new Error(desktop.failures.join("; "));
  await capture(client, "comparison-desktop.png");
  await setComparisonReveal(client, 0);
  await capture(client, "comparison-wordpress-edge-desktop.png");
  await setComparisonReveal(client, 28);
  await capture(client, "comparison-wordpress-reveal-desktop.png");
  await setComparisonReveal(client, 72);
  await capture(client, "comparison-nowaweb-reveal-desktop.png");
  await setComparisonReveal(client, 100);
  await capture(client, "comparison-nowaweb-edge-desktop.png");
  await setComparisonReveal(client, 52);
  await alignComparisonSection(client);
  await capture(client, "comparison-section-desktop.png");

  await navigateToComparison(client, 390, 1000, true);
  const mobile = await evaluate(
    client,
    `(async () => {
      const root = document.querySelector('[data-comparison-reveal]');
      const stage = root.querySelector('.comparison-stage');
      const slider = root.querySelector('[data-comparison-slider]');
      const handle = root.querySelector('.comparison-handle');
      const rootRect = root.getBoundingClientRect();
      const sliderRect = slider.getBoundingClientRect();
      const dividerRect = root.querySelector('.comparison-divider').getBoundingClientRect();
      const nowaPanelRect = root.querySelector('[data-comparison-layer="nowaweb"] .comparison-panel-copy').getBoundingClientRect();
      const wordpressPanelRect = root.querySelector('[data-comparison-layer="wordpress"] .comparison-panel-copy').getBoundingClientRect();
      const failures = [];

      if (rootRect.left < -0.5 || rootRect.right > innerWidth + 0.5) failures.push('comparison leaves mobile viewport');
      if (sliderRect.height < 44 || sliderRect.width < 44) failures.push('slider touch target is too small');
      if (stage.clientHeight < 500) failures.push('mobile comparison stage collapsed');
      if (/[ÄÅĹĂ]/.test(root.textContent ?? '')) failures.push('mobile comparison contains mojibake');
      if (nowaPanelRect.right > dividerRect.left - 4) failures.push('mobile NowaWeb copy crosses the divider');
      if (wordpressPanelRect.left < dividerRect.right + 4) failures.push('mobile WordPress copy crosses the divider');
      if (document.documentElement.scrollWidth > innerWidth + 1) failures.push('page has horizontal overflow on mobile');

      slider.value = '0';
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 460));
      const wordpressVerdictRect = root.querySelector('[data-comparison-verdict="wordpress"]').getBoundingClientRect();
      const wordpressHandleRect = handle.getBoundingClientRect();
      if (wordpressVerdictRect.bottom > wordpressHandleRect.top - 8) failures.push('mobile WordPress verdict collides with the edge handle');

      slider.value = '100';
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 460));
      const nowawebVerdictRect = root.querySelector('[data-comparison-verdict="nowaweb"]').getBoundingClientRect();
      const nowawebHandleRect = handle.getBoundingClientRect();
      if (nowawebVerdictRect.bottom > nowawebHandleRect.top - 8) failures.push('mobile NowaWeb verdict collides with the edge handle');

      slider.value = '52';
      slider.dispatchEvent(new Event('input', { bubbles: true }));

      return {
        failures,
        rootLeft: rootRect.left,
        rootRight: rootRect.right,
        viewportWidth: innerWidth,
        stageHeight: stage.clientHeight,
        wordpressVerdictGap: wordpressHandleRect.top - wordpressVerdictRect.bottom,
        nowawebVerdictGap: nowawebHandleRect.top - nowawebVerdictRect.bottom,
      };
    })()`,
  );

  if (mobile.failures.length) throw new Error(mobile.failures.join("; "));
  await capture(client, "comparison-mobile.png");
  await setComparisonReveal(client, 0);
  await capture(client, "comparison-wordpress-edge-mobile.png");
  await setComparisonReveal(client, 100);
  await capture(client, "comparison-nowaweb-edge-mobile.png");
  await setComparisonReveal(client, 52);
  await alignComparisonSection(client);
  await capture(client, "comparison-section-mobile.png");

  console.log(JSON.stringify({ desktop, mobile }, null, 2));
  console.log("Comparison reveal browser verification passed.");
  client.close();
} finally {
  chrome.kill();
}
