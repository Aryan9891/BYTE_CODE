import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation & Critical UI Accessibility', () => {
  test('Skip to content link is visible on first Tab and shifts focus to main content', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // First Tab press should focus skip link
    await page.keyboard.press('Tab');
    const focusedText = await page.evaluate(() => document.activeElement?.textContent);
    expect(focusedText?.toLowerCase()).toContain('skip to main content');

    // Press Enter to activate skip link
    await page.keyboard.press('Enter');
    const mainHasFocus = await page.evaluate(() => {
      const active = document.activeElement;
      return active?.id === 'main-content';
    });
    expect(mainHasFocus).toBe(true);
  });

  test('Persistent "Get help now" button is reachable in <= 3 Tab presses from page load', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    let reachedCrisis = false;
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
      const isCrisis = await page.evaluate(() => {
        const active = document.activeElement;
        return (
          active?.id === 'crisis-quick-access' ||
          active?.getAttribute('aria-label')?.includes('Get help now')
        );
      });
      if (isCrisis) {
        reachedCrisis = true;
        break;
      }
    }

    // Crisis button must be immediately accessible
    expect(reachedCrisis).toBe(true);
  });

  test('Captures screenshots of /, /crisis, and /design-system in light and dark mode', async ({
    page,
  }) => {
    const pages = [
      { path: '/', name: 'landing' },
      { path: '/crisis', name: 'crisis' },
      { path: '/design-system', name: 'design-system' },
    ];

    for (const p of pages) {
      // Light Mode
      await page.goto(p.path);
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => document.documentElement.classList.remove('dark'));
      await page.waitForTimeout(300);
      await page.screenshot({
        path: `tests/e2e/screenshots/${p.name}-light.png`,
        fullPage: true,
      });

      // Dark Mode
      await page.evaluate(() => document.documentElement.classList.add('dark'));
      await page.waitForTimeout(300);
      await page.screenshot({
        path: `tests/e2e/screenshots/${p.name}-dark.png`,
        fullPage: true,
      });
    }
  });
});
