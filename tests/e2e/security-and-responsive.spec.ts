import { test, expect } from '@playwright/test';

const CORE_ROUTES = ['/', '/crisis', '/support', '/settings/privacy'];
const ALL_APP_ROUTES = [
  '/',
  '/crisis',
  '/support',
  '/settings/privacy',
  '/onboarding',
  '/student',
  '/student/check-in',
  '/student/journal',
  '/counselor',
  '/admin/analytics',
];

test.describe('Section A3: Network Isolation & Console Cleanliness', () => {
  for (const route of CORE_ROUTES) {
    test(`asserts zero external network requests on route: ${route}`, async ({ page }) => {
      const externalRequests: string[] = [];
      page.on('request', (req) => {
        const url = req.url();
        if (!url.startsWith('http://localhost:3000') && !url.startsWith('data:')) {
          externalRequests.push(url);
        }
      });

      await page.goto(route);
      await page.waitForLoadState('networkidle');

      expect(externalRequests).toEqual([]);
    });

    test(`asserts zero console errors or warnings on route: ${route}`, async ({ page }) => {
      const consoleIssues: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
          consoleIssues.push(`[${msg.type()}] ${msg.text()}`);
        }
      });
      page.on('pageerror', (err) => {
        consoleIssues.push(`[exception] ${err.message}`);
      });

      await page.goto(route);
      await page.waitForLoadState('networkidle');

      expect(consoleIssues).toEqual([]);
    });

    test(`asserts production CSP header contains no unsafe-eval on route: ${route}`, async ({
      page,
    }) => {
      const response = await page.goto(route);
      const csp = response?.headers()['content-security-policy'] || '';
      expect(csp).toBeTruthy();
      expect(csp).not.toContain('unsafe-eval');
      expect(csp).toContain("default-src 'self'");
    });
  }
});

test.describe('Section A3: Mobile Emergency Dock & Responsive Non-Overlap', () => {
  const VIEWPORTS = [
    { name: '360x640 (Compact Android)', width: 360, height: 640 },
    { name: '390x844 (Standard iPhone)', width: 390, height: 844 },
  ];

  for (const vp of VIEWPORTS) {
    for (const route of CORE_ROUTES) {
      test(`asserts single crisis control and zero element overlap on ${route} at ${vp.name}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route);
        await page.waitForLoadState('networkidle');

        // (c.1) Assert exactly one primary crisis button exists and is visible
        const crisisButtons = page.locator('#crisis-quick-access');
        await expect(crisisButtons).toHaveCount(1);
        await expect(crisisButtons).toBeVisible();

        const crisisBox = await crisisButtons.boundingBox();
        expect(crisisBox).not.toBeNull();
        if (!crisisBox) return;

        // (c.2) Check all visible interactive elements (buttons, links, inputs) and headings/body text
        // Ensure none overlap the crisis dock bounding box
        const nonOverlapViolations = await page.evaluate(
          ({ dock, vpHeight }) => {
            function doesIntersect(r1: DOMRect, r2: { x: number; y: number; width: number; height: number }) {
              return !(
                r1.right <= r2.x ||
                r1.left >= r2.x + r2.width ||
                r1.bottom <= r2.y ||
                r1.top >= r2.y + r2.height
              );
            }

            const violations: string[] = [];
            const crisisElem = document.getElementById('crisis-quick-access');
            const dockElem = document.getElementById('mobile-emergency-dock');

            // Select interactive elements and text paragraphs/headings
            const candidates = document.querySelectorAll(
              'button, a, input, select, textarea, [role="button"], [role="switch"], [role="checkbox"], p, h1, h2, h3'
            );

            for (const elem of Array.from(candidates)) {
              if (
                elem === crisisElem ||
                crisisElem?.contains(elem) ||
                elem.contains(crisisElem) ||
                elem === dockElem ||
                dockElem?.contains(elem) ||
                elem.contains(dockElem)
              ) {
                continue;
              }

              const rect = elem.getBoundingClientRect();

              // Only test elements currently visible in the active viewport
              const isInViewport =
                rect.width > 0 &&
                rect.height > 0 &&
                rect.top < vpHeight &&
                rect.bottom > 0;

              if (isInViewport && doesIntersect(rect, dock)) {
                violations.push(
                  `<${elem.tagName.toLowerCase()}> "${(elem.textContent || '').trim().slice(0, 40)}" ` +
                    `at [x:${Math.round(rect.left)}, y:${Math.round(rect.top)}, w:${Math.round(rect.width)}, h:${Math.round(rect.height)}] ` +
                    `collides with dock [x:${Math.round(dock.x)}, y:${Math.round(dock.y)}, w:${Math.round(dock.width)}, h:${Math.round(dock.height)}]`
                );
              }
            }

            return violations;
          },
          { dock: crisisBox, vpHeight: vp.height }
        );

        expect(nonOverlapViolations).toEqual([]);
      });
    }
  }
});

test.describe('Section A3: Rapid Keyboard Tab Navigation (<= 3 Tabs to Crisis)', () => {
  for (const route of ALL_APP_ROUTES) {
    test(`asserts "Get help now" reachable within 3 Tab presses on ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      let reachedCrisis = false;
      for (let press = 1; press <= 3; press++) {
        await page.keyboard.press('Tab');
        const isCrisisActive = await page.evaluate(() => {
          const active = document.activeElement;
          return active?.id === 'crisis-quick-access';
        });
        if (isCrisisActive) {
          reachedCrisis = true;
          break;
        }
      }

      expect(
        reachedCrisis,
        `Route ${route} must allow reaching "Get help now" within 3 Tab presses.`
      ).toBe(true);
    });
  }
});

