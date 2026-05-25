import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://localhost:5173' },
  webServer: {
    command: 'python3 -m http.server 5173',
    port: 5173,
    reuseExistingServer: true,
  },
});
