import { test } from '@playwright/test';

// The invite gate is the security-relevant part of signup. The page surfaces
// validation outcomes via the URL query (it redirects to /signup?error=... or
// /signup?message=...; see app/(auth)/signup/page.tsx and its server action),
// so we assert on the resulting URL. Email confirmation / redemption is covered
// at the DB layer in packages/supabase invite-rls.test.ts, not here.
test.describe('Signup invite gate', () => {
  async function fillSignup(
    page: import('@playwright/test').Page,
    code: string,
    emailPrefix: string,
  ) {
    await page.goto('/signup');
    await page.getByLabel('Invite Code').fill(code);
    await page.getByLabel('Name').fill('E2E Tester');
    await page.getByLabel('Email').fill(`${emailPrefix}-${Date.now()}@test.local`);
    await page.getByLabel('Password').fill('e2e-password-123');
    await page.getByRole('button', { name: 'Create account' }).click();
  }

  test('rejects an invalid invite code', async ({ page }) => {
    await fillSignup(page, 'BADCODE9', 'e2e-bad');
    await page.waitForURL(/\/signup\?error=/);
  });

  test('accepts the founder code and asks the user to confirm email', async ({ page }) => {
    await fillSignup(page, 'ROPERO01', 'e2e-founder');
    await page.waitForURL(/\/signup\?message=/);
  });
});
