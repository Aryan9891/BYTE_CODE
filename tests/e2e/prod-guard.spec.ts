import { test, expect } from '@playwright/test';

test.describe('Production Route Guards & Showcase Security', () => {
  test('asserts that /design-system returns 404 Not Found in production builds', async ({ page }) => {
    const response = await page.goto('/design-system');
    expect(response).not.toBeNull();
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText('404');
  });
});

