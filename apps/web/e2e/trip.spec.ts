import { test, expect } from '@playwright/test';

test.describe('Trips', () => {
  test('trips page loads', async ({ page }) => {
    await page.goto('/trips');
    // Either redirected to auth or trips page loads
    const heading = page.getByRole('heading', { name: /trip/i });
    const loginPage = page.getByText('Welcome back');

    const tripsVisible = await heading.isVisible().catch(() => false);
    const loginVisible = await loginPage.isVisible().catch(() => false);
    expect(tripsVisible || loginVisible).toBe(true);
  });
});
