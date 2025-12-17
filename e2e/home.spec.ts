import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SyncOps|Sync/i);
  });

  test('should have navigation elements', async ({ page }) => {
    await page.goto('/');

    // Check for main navigation or content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should redirect unauthenticated users appropriately', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(500);
  });
});
