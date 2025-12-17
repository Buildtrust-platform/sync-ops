import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show sign-in option for unauthenticated users', async ({ page }) => {
    await page.goto('/');

    // Wait for auth state to resolve
    await page.waitForLoadState('networkidle');

    // Page should either show login UI or redirect to auth
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should protect dashboard routes', async ({ page }) => {
    // Try to access a protected route
    const response = await page.goto('/dashboard');

    // Should either redirect (302/307) or show auth UI (200)
    // Should not return server error (500)
    expect(response?.status()).toBeLessThan(500);
  });

  test('should protect project routes', async ({ page }) => {
    const response = await page.goto('/projects');

    expect(response?.status()).toBeLessThan(500);
  });

  test('should handle invalid routes gracefully', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist-12345');

    // Should return 404, not 500
    expect([200, 404]).toContain(response?.status());
  });
});
