import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Section A8: Server-Side i18n & Indic Script Rendering', () => {
  const artifactDir = path.resolve(
    'C:/Users/AryanSachin/.gemini/antigravity/brain/ef9a1052-5397-46c3-9b8e-3cca60504984'
  );

  test('asserts server-side Hindi rendering, <html lang="hi">, and Devanagari glyphs', async ({
    context,
    page,
  }) => {
    // Set cookie on the domain prior to navigation to test pure SSR
    await context.addCookies([
      {
        name: 'sahayak_locale',
        value: 'hi',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 1. Verify <html lang="hi"> emitted on server
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('hi');

    // 2. Verify Devanagari app title and hero content
    const brandText = await page.locator('header').textContent();
    expect(brandText).toContain('सहायक');

    const heroTitle = await page.locator('h1').textContent();
    expect(heroTitle).toMatch(/[\u0900-\u097F]/); // Devanagari regex

    // 3. Navigate to /crisis and verify crisis copy in Hindi
    await page.goto('/crisis');
    await page.waitForLoadState('networkidle');

    const crisisTitle = await page.locator('h1').textContent();
    expect(crisisTitle).toMatch(/[\u0900-\u097F]/);

    // 4. Capture screenshot artifact for visual verification
    await page.screenshot({
      path: path.join(artifactDir, 'crisis-hindi.png'),
      fullPage: false,
    });
  });

  test('asserts server-side Bengali rendering, <html lang="bn">, and Bengali glyphs', async ({
    context,
    page,
  }) => {
    await context.addCookies([
      {
        name: 'sahayak_locale',
        value: 'bn',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 1. Verify <html lang="bn"> emitted on server
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('bn');

    // 2. Verify Bengali app title and content
    const brandText = await page.locator('header').textContent();
    expect(brandText).toContain('সহায়ক');

    const heroTitle = await page.locator('h1').textContent();
    expect(heroTitle).toMatch(/[\u0980-\u09FF]/); // Bengali regex

    // 3. Navigate to /crisis and verify crisis copy in Bengali
    await page.goto('/crisis');
    await page.waitForLoadState('networkidle');

    const crisisTitle = await page.locator('h1').textContent();
    expect(crisisTitle).toMatch(/[\u0980-\u09FF]/);

    // 4. Capture screenshot artifact for visual verification
    await page.screenshot({
      path: path.join(artifactDir, 'crisis-bengali.png'),
      fullPage: false,
    });
  });
});

