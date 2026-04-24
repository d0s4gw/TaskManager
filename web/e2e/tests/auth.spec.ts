import { test, expect } from '@playwright/test';

/**
 * Auth flow tests — verify the unauthenticated (landing page) experience.
 * These tests do NOT use the authenticatedPage fixture.
 */
test.describe('Authentication Flow', () => {
  test('shows landing page with CTA for unauthenticated users', async ({ page }) => {
    await page.goto('/');

    // Hero section
    await expect(page.getByRole('heading', { name: /Master your workflow/i })).toBeVisible();
    await expect(page.getByText('without the complexity.')).toBeVisible();

    // CTA buttons
    await expect(page.getByText('Get Started for Free')).toBeVisible();
    await expect(page.locator('#login-with-google')).toBeVisible();
  });

  test('does not show task dashboard when not logged in', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Your Tasks')).not.toBeVisible();
    await expect(page.getByPlaceholder('What needs to be done?')).not.toBeVisible();
  });

  test('shows the TaskManager branding in nav', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('nav').getByText('TaskManager')).toBeVisible();
  });
});
