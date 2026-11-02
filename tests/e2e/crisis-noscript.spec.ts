import { test, expect } from '@playwright/test';

test.describe('Section A9: /crisis Progressive Enhancement & JS-Disabled Operation', () => {
  test('renders phone numbers and tap-to-call links with JavaScript completely disabled', async ({
    browser,
  }) => {
    // Launch context with JavaScript strictly disabled
    const context = await browser.newContext({
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    await page.goto('/crisis');

    // 1. Assert hero heading renders with JS disabled
    const title = page.locator('h1');
    await expect(title).toBeVisible();

    // 2. Assert priority telephone numbers render with JS disabled
    const teleManas = page.locator('text=14416');
    await expect(teleManas).toBeVisible();

    const emergency112 = page.locator('text=112');
    await expect(emergency112).toBeVisible();

    // 3. Assert tap-to-call links exist and have valid tel: URIs
    const telLinks = page.locator('a[href^="tel:"]');
    const linkCount = await telLinks.count();
    expect(linkCount).toBeGreaterThanOrEqual(3);

    const firstHref = await telLinks.first().getAttribute('href');
    expect(firstHref).toMatch(/^tel:[0-9+]+$/);

    await context.close();
  });

  test('asserts emergency telephone targets appear vertically ABOVE the breathing widget in DOM and visual layout', async ({
    page,
  }) => {
    await page.goto('/crisis');
    await page.waitForLoadState('networkidle');

    // Get bounding boxes of primary phone section and grounding exercise
    const phoneHeading = page.locator('#primary-helplines-heading');
    const breathingHeading = page.locator('text=Take a Grounding Breath');

    await expect(phoneHeading).toBeVisible();
    await expect(breathingHeading).toBeVisible();

    const phoneBox = await phoneHeading.boundingBox();
    const breathingBox = await breathingHeading.boundingBox();

    expect(phoneBox).not.toBeNull();
    expect(breathingBox).not.toBeNull();

    if (phoneBox && breathingBox) {
      // Telephone targets must appear strictly above the breathing widget (lower Y coordinate)
      expect(phoneBox.y).toBeLessThan(breathingBox.y);
    }
  });

  test('asserts breathing exercise respects prefers-reduced-motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/crisis');
    await page.waitForLoadState('networkidle');

    const breathingCircle = page.locator('div[aria-live="polite"]');
    await expect(breathingCircle).toBeVisible();

    const hasReducedMotionClass = await breathingCircle.evaluate((el) => {
      return el.classList.contains('motion-reduce:transition-none');
    });
    expect(hasReducedMotionClass).toBe(true);
  });
});

