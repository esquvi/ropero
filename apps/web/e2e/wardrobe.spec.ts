import { test, expect } from '@playwright/test';
import { readSeedContext } from './fixtures/seed';

// Runs under the `authenticated` project (storageState from the setup project).
test.describe('Wardrobe (authenticated)', () => {
  test('renders the seeded wardrobe items', async ({ page }) => {
    const { items } = readSeedContext();
    await page.goto('/wardrobe');

    // The freshly seeded E2E user owns exactly these items, so each name should
    // render on its card.
    for (const item of items) {
      await expect(page.getByText(item.name).first()).toBeVisible();
    }
  });

  test('opens an item detail from the grid', async ({ page }) => {
    const { items } = readSeedContext();
    await page.goto(`/wardrobe/${items[0].id}`);
    await expect(page.getByRole('button', { name: 'Log Wear' })).toBeVisible();
    await expect(page.getByText(items[0].name).first()).toBeVisible();
  });
});
