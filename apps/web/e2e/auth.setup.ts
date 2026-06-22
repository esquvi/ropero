import { test as setup } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import {
  AUTH_DIR,
  SEED_FILE,
  STORAGE_STATE,
  createAdminClient,
  createTestUser,
  seedItems,
  type SeedContext,
} from './fixtures/seed';

// Runs once as a dependency of the `authenticated` project. Because this is a
// normal Playwright test, the dev/prod web server configured in
// playwright.config.ts is already up, so the real login form can be driven and
// the genuine SSR auth cookies captured. Token injection would not reproduce
// the @supabase/ssr cookie shape the middleware reads, so we log in for real.
setup('seed data and authenticate', async ({ page }) => {
  const admin = createAdminClient();
  const user = await createTestUser(admin);
  const items = await seedItems(admin, user.id);

  mkdirSync(AUTH_DIR, { recursive: true });
  const context: SeedContext = { user, items };
  writeFileSync(SEED_FILE, JSON.stringify(context, null, 2));

  await page.goto('/login');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Login redirects to the dashboard on success (see app/(auth)/login/page.tsx).
  await page.waitForURL('**/dashboard');
  await page.context().storageState({ path: STORAGE_STATE });
});
