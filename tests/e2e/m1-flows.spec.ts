import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Milestone M1 E2E Flows: Onboarding, Consent, Privacy & Audit", () => {
  test("1. Onboarding Multi-Step Consent Flow", async ({ page }) => {
    await page.goto("/onboarding");

    // Step 1: Welcome & Pledge
    await expect(page.getByRole("heading", { name: "Welcome to Sahayak" })).toBeVisible();
    await page.getByRole("button", { name: /Next: Configure Signals/i }).click();

    // Step 2: Signals Selection
    await expect(page.getByRole("heading", { name: "Choose Your Data Signals" })).toBeVisible();
    // Toggle academic drift
    const academicSwitch = page.locator("#t-academic");
    await academicSwitch.click();
    await page.getByRole("button", { name: /Next: Safety Policy/i }).click();

    // Step 3: Safety Policy & Emergency Acknowledgment
    await expect(page.getByRole("heading", { name: "Emergency & Escalation Policy" })).toBeVisible();
    await page.getByRole("button", { name: /Next: Review & Confirm/i }).click();

    // Step 4: Review & Confirmation
    await expect(page.getByRole("heading", { name: "Review Your Privacy Configuration" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Complete Onboarding/i })).toBeVisible();
  });

  test("2. Privacy Center Toggles, Export, and Crypto-Shred Modal", async ({ page }) => {
    await page.goto("/settings/privacy");

    await expect(
      page.getByRole("heading", { name: "Granular Consent & Data Control Center" })
    ).toBeVisible();

    // Verify toggle interaction
    const surveysSwitch = page.locator("#consent-surveys");
    await expect(surveysSwitch).toBeVisible();
    await surveysSwitch.click();

    // Verify Download personal archive button
    const downloadLink = page.getByRole("link", { name: /Download JSON Archive/i });
    await expect(downloadLink).toBeVisible();
    await expect(downloadLink).toHaveAttribute("download");

    // Verify Crypto-shred confirmation dialog
    const shredBtn = page.getByRole("button", { name: /Delete My Data \(Crypto-Shred\)/i });
    await shredBtn.click();

    await expect(page.getByRole("heading", { name: "Confirm Cryptographic Shredding" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Permanently Shred My Keys/i })).toBeVisible();

    // Cancel modal
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("heading", { name: "Confirm Cryptographic Shredding" })).not.toBeVisible();
  });

  test("3. Admin Audit Log & Cryptographic Chain Verification", async ({ page }) => {
    await page.goto("/admin/audit");

    await expect(
      page.getByRole("heading", { name: "Tamper-Evident Security & Privacy Audit Trail" })
    ).toBeVisible();

    // Click "Verify Chain Integrity"
    const verifyBtn = page.getByRole("button", { name: /Verify Chain Integrity/i });
    await expect(verifyBtn).toBeVisible();
    await verifyBtn.click();

    // Status banner appears
    await expect(page.getByRole("status")).toBeVisible();
    await expect(page.getByText("Cryptographic Verification Passed")).toBeVisible();
  });

  test("4. Multi-level Accessibility (Axe-Core) on M1 Routes", async ({ page }) => {
    const routes = ["/onboarding", "/settings/privacy", "/admin/audit"];

    for (const route of routes) {
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const severe = results.violations.filter((v) => ["critical", "serious"].includes(v.impact || ""));
      expect(severe, `Accessibility violations on ${route}: ${JSON.stringify(severe, null, 2)}`).toHaveLength(0);
    }
  });
});
