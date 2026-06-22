import { test, expect } from '@playwright/test';

// Runs under the `authenticated` project.
//
// The full create flow uses calendar-popover date pickers, whose day-cell
// interaction is brittle across date boundaries; driving it end to end is left
// as a follow-up. These specs cover the authenticated trips surface and that
// the planning dialog opens with its form, which is already far beyond the
// previous load-or-login no-op.
test.describe('Trips (authenticated)', () => {
  test('trips page loads with the plan-trip action and tabs', async ({ page }) => {
    await page.goto('/trips');
    // exact: true so the page title h1 isn't ambiguous with empty-state
    // headings like "No upcoming trips" (accessible-name matching is substring).
    await expect(page.getByRole('heading', { name: 'Trips', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Plan Trip' })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Upcoming/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Past/ })).toBeVisible();
  });

  test('opens the plan-trip dialog with its form fields', async ({ page }) => {
    await page.goto('/trips');
    await page.getByRole('button', { name: 'Plan Trip' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Plan a New Trip')).toBeVisible();
    await expect(page.getByPlaceholder('Summer Vacation 2026')).toBeVisible();
    await expect(page.getByPlaceholder('Paris, France')).toBeVisible();
  });
});
