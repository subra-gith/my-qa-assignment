import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const isCI = !!process.env.CI;

/**
 * Video is off unless asked for, so normal runs stay light.
 *   VIDEO=on      npx playwright test   → record every UI test
 *   VIDEO=failed  npx playwright test   → keep the recording only when a test fails
 */
const videoMode = {
  on: 'on',
  failed: 'retain-on-failure',
  off: 'off',
} as const;

type VideoKey = keyof typeof videoMode;

const requested = (process.env.VIDEO ?? 'off') as VideoKey;
const video = videoMode[requested] ?? videoMode.off;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    // retain-on-failure rather than on-first-retry: retries are 0 locally, so
    // on-first-retry would only ever produce artifacts on CI.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video,
    actionTimeout: 10_000,
  },

  expect: { timeout: 7_000 },

  projects: [
    {
      name: 'ui',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
        // The app ships data-test attributes rather than Playwright's default
        // data-testid, so point getByTestId at the right one.
        testIdAttribute: 'data-test',
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: process.env.API_BASE_URL ?? 'https://reqres.in',
        // reqres currently serves the free endpoints without a key, but it
        // documents this header and has enforced it before — cheap insurance.
        extraHTTPHeaders: {
          'x-api-key': 'reqres-free-v1',
          Accept: 'application/json',
        },
      },
    },
  ],
});
