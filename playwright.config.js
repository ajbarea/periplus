import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // In CI: annotations on the failing lines and one log line per test, plus the HTML report
  // and traces the workflow uploads when a run fails.
  reporter: process.env.CI
    ? [['github'], ['list'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: process.env.CI ? 'retain-on-failure' : 'off',
  },
  webServer: {
    command: 'python3 -m http.server 5173 --directory app',
    port: 5173,
    reuseExistingServer: true,
  },
});
