import { test, expect } from '@playwright/test';

// Runs under the `authenticated` project.
test.describe('Dashboard (authenticated)', () => {
  test('loads the authenticated dashboard without redirecting to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
