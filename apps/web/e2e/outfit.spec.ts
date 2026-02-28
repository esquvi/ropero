import { test, expect } from '@playwright/test';

test.describe('Outfits', () => {
  test('outfits page loads', async ({ page }) => {
    await page.goto('/outfits');
    // Either redirected to auth or outfits page loads
    const heading = page.getByRole('heading', { name: /outfit/i });
    const loginPage = page.getByText('Welcome back');

    const outfitsVisible = await heading.isVisible().catch(() => false);
    const loginVisible = await loginPage.isVisible().catch(() => false);
    expect(outfitsVisible || loginVisible).toBe(true);
  });
});
