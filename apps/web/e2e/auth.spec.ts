import { test, expect } from '@playwright/test';

// Runs under the `unauthenticated` project (no storageState).
test.describe('Authentication (unauthenticated)', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Welcome back')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('signup page loads', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByText('Create an account')).toBeVisible();
    await expect(page.getByLabel('Invite Code')).toBeVisible();
  });

  test('login and signup pages cross-link', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
    await page.goto('/signup');
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });

  test('Google OAuth button is present on login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /Google/i })).toBeVisible();
  });

  for (const path of ['/dashboard', '/wardrobe', '/outfits', '/trips']) {
    test(`unauthenticated ${path} redirects to login`, async ({ page }) => {
      await page.goto(path);
      await page.waitForURL('**/login**');
      await expect(page.getByText('Welcome back')).toBeVisible();
    });
  }
});
