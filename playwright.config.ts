import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://localhost:3100', channel: process.env.CI ? undefined : 'chrome' },
  webServer: { command: 'npx next start -p 3100', url: 'http://localhost:3100', reuseExistingServer: true },
});
