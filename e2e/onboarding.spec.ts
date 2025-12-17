import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('should load onboarding page', async ({ page }) => {
    await page.goto('/onboarding');

    // Page should load without server errors
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should display onboarding content', async ({ page }) => {
    await page.goto('/onboarding');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Check that page renders content (not blank)
    const content = await page.textContent('body');
    expect(content?.length).toBeGreaterThan(0);
  });

  test('should not have console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');

    // Filter out known non-critical errors (like extension errors)
    const criticalErrors = errors.filter(
      (e) => !e.includes('chrome-extension') && !e.includes('DevTools')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
