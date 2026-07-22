import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: 'line',
  outputDir: '.playwright-output',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    screenshot: 'off',
    video: 'off',
    trace: 'off',
    ...devices['Desktop Chrome']
  },
  webServer: {
    command: '..\\.venv\\Scripts\\python.exe ..\\tests\\support_review_server.py',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 120_000
  }
});
