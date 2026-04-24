import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for TaskManager web.
 *
 * Runs the Next.js dev server automatically and tests against it.
 * The Task API is mocked at the network layer — no backend server needed.
 *
 * Usage:
 *   npx playwright test            # headless
 *   npx playwright test --ui       # interactive UI mode
 *   npx playwright test --debug    # step-through debugger
 */
export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
