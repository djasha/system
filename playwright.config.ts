import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  use: {
    baseURL: 'http://localhost:4323',
    trace: 'on-first-retry',
  },
  webServer: {
    // astro preview 404s all routes under the @astrojs/vercel adapter, so
    // serve the built static client output directly.
    command: 'npx http-server dist/client -p 4323 -c-1 --silent',
    url: 'http://localhost:4323',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
