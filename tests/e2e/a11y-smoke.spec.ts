import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTES_TO_AUDIT = [
  '/',
  '/crisis',
  '/support',
  '/settings/privacy',
  '/onboarding',
  '/student',
  '/counselor',
  '/admin/analytics',
];

test.describe('WCAG 2.2 AA Accessibility Audits Across All Impact Levels (Axe-Core)', () => {
  for (const route of ROUTES_TO_AUDIT) {
    test(`Comprehensive multi-level axe audit for route: ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const scanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      const criticalViolations = scanResults.violations.filter((v) => v.impact === 'critical');
      const seriousViolations = scanResults.violations.filter((v) => v.impact === 'serious');
      const moderateViolations = scanResults.violations.filter((v) => v.impact === 'moderate');
      const minorViolations = scanResults.violations.filter((v) => v.impact === 'minor');

      if (scanResults.violations.length > 0) {
        console.log(`\n=== AXE AUDIT REPORT: ${route} ===`);
        for (const v of scanResults.violations) {
          console.log(`[${v.impact?.toUpperCase()}] ${v.id}: ${v.description} (${v.nodes.length} occurrences)`);
          for (const node of v.nodes) {
            console.log(`   Target: ${node.target.join(' ')}`);
            console.log(`   Failure summary: ${node.failureSummary}`);
          }
        }
      }

      // Assert zero critical and zero serious violations
      expect(criticalViolations, `Critical violations on ${route}`).toEqual([]);
      expect(seriousViolations, `Serious violations on ${route}`).toEqual([]);
      // Enforce zero moderate or minor violations
      expect(moderateViolations, `Moderate violations on ${route}`).toEqual([]);
      expect(minorViolations, `Minor violations on ${route}`).toEqual([]);
    });
  }
});
