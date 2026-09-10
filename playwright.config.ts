import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  outputDir: './output/playwright/results',
  timeout: 60000,
  workers: 1,
  reporter: [['list'], ['json', {outputFile: 'output/playwright/test-results.json'}]],
  use: { baseURL: 'http://127.0.0.1:4322', channel: 'chrome', headless: true, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'node node_modules/astro/bin/astro.mjs preview --host 127.0.0.1 --port 4322', url: 'http://127.0.0.1:4322', reuseExistingServer: true, timeout: 30000 },
});
