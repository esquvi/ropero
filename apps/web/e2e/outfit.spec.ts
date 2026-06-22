import { test, expect } from '@playwright/test';
import { readSeedContext } from './fixtures/seed';

// Runs under the `authenticated` project.
test.describe('Outfits (authenticated)', () => {
  test('outfits page loads', async ({ page }) => {
    await page.goto('/outfits');
    await expect(page.getByRole('heading', { name: 'Outfits' })).toBeVisible();
  });

  test('creates an outfit from seeded items', async ({ page }) => {
    const { items } = readSeedContext();
    const outfitName = `E2E Outfit ${Date.now()}`;

    await page.goto('/outfits/builder');
    await expect(page.getByRole('heading', { name: 'Create Outfit' })).toBeVisible();

    // Each selectable item is a button whose accessible name includes the item
    // name (image alt + caption). Select two seeded items.
    await page.getByRole('button', { name: new RegExp(items[0].name) }).click();
    await page.getByRole('button', { name: new RegExp(items[1].name) }).click();

    await page.getByPlaceholder('Summer Casual Look').fill(outfitName);
    await page.getByRole('button', { name: 'Save Outfit' }).click();

    // createOutfit redirects to /outfits, where the new outfit should appear.
    await page.waitForURL('**/outfits');
    await expect(page.getByText(outfitName)).toBeVisible();
  });
});
