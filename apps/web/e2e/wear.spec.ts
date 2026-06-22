import { test, expect } from '@playwright/test';
import { readSeedContext } from './fixtures/seed';

// Runs under the `authenticated` project.
test.describe('Wear logging (authenticated)', () => {
  test('logs a wear for a seeded item', async ({ page }) => {
    const { items } = readSeedContext();
    const item = items[0];

    await page.goto(`/wardrobe/${item.id}`);

    // Open the Log Wear popover (the only "Log Wear" button before it opens is
    // the trigger).
    await page.getByRole('button', { name: 'Log Wear' }).click();
    await expect(page.getByText('Record when you wore this item.')).toBeVisible();

    // The date defaults to today and occasion/notes are optional, so submitting
    // straight away records a wear. Both the trigger and the submit button are
    // named "Log Wear"; scope to the open Radix popover to hit the submit one
    // unambiguously (rather than relying on DOM order).
    await page
      .locator('[data-radix-popper-content-wrapper]')
      .getByRole('button', { name: 'Log Wear' })
      .click();

    // On success the popover closes, so its description disappears, and no
    // error alert is shown.
    await expect(page.getByText('Record when you wore this item.')).toBeHidden();
    await expect(page.getByRole('alert')).toHaveCount(0);
  });
});
