import { defineConfig, devices } from '@playwright/test';
import { STORAGE_STATE } from './e2e/fixtures/seed';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Seeds a user + items and captures an authenticated storageState. Runs
    // first as a dependency of the authenticated project.
    {
      name: 'setup',
      testMatch: ['**/auth.setup.ts'],
      use: { ...devices['Desktop Chrome'] },
    },
    // Specs that must run logged out (login/signup pages, invite gate,
    // unauthenticated redirects).
    {
      name: 'unauthenticated',
      testMatch: ['**/auth.spec.ts', '**/signup.spec.ts'],
      use: { ...devices['Desktop Chrome'] },
    },
    // Everything else runs with the captured authenticated session.
    {
      name: 'authenticated',
      testIgnore: ['**/auth.setup.ts', '**/auth.spec.ts', '**/signup.spec.ts'],
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: process.env.CI ? 'npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
