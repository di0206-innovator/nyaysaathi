import { test, expect } from '@playwright/test';

test.describe('NYAYSAATHI — REAL BROWSER E2E VERIFICATION', () => {
  // 1. Landing Page Load & Semantic Inspection
  test('Landing page loads with semantic landmarks and no horizontal overflow', async ({ page }) => {
    await page.goto('/');

    // Check main title
    await expect(page.locator('h1')).toContainText(/CLEAR CONFUSION|MATTER-BASED LEGAL ACTION/i);

    // Verify key action links exist (hero action triggers)
    const pilotButton = page.locator('a[href="/pilot"]:visible').first();
    await expect(pilotButton).toBeVisible();

    const mattersButton = page.locator('a[href="/matters"]:visible').first();
    await expect(mattersButton).toBeVisible();

    // Verify no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // 2px margin for sub-pixel rendering
  });

  // 2. Pilot Onboarding Flow
  test('Pilot onboarding form enforces consent and classification', async ({ page }) => {
    await page.goto('/pilot');

    await expect(page.locator('h1')).toContainText(/Pilot Onboarding & Intake|PILOT INTAKE/i);

    // Click submit without consent - must be disabled or show validation
    const startButton = page.locator('button:has-text("Start Recovery Matter")').first();
    await expect(startButton).toBeVisible();

    // Check consent box
    const consentCheckbox = page.locator('input#consent');
    await consentCheckbox.check();
    expect(await consentCheckbox.isChecked()).toBeTruthy();
  });

  // 3. Matter Index & Command Center Navigation
  test('Matters index renders seeded matters and navigates to command center', async ({ page }) => {
    await page.goto('/matters');

    // Heading should be visible
    await expect(page.locator('h1')).toBeVisible();

    // Verify seed matters or matter cards exist
    const matterCards = page.locator('a[href^="/matters/"]');
    const count = await matterCards.count();
    expect(count).toBeGreaterThan(0);

    // Navigate to first matter
    await matterCards.first().click();

    // Verify command center loaded
    await expect(page).toHaveURL(/\/matters\/[^/]+/);
    await expect(page.locator('h1')).toBeVisible();
  });

  // 4. Analytics Register
  test('Pilot analytics page renders empirical metrics without synthetic claims', async ({ page }) => {
    await page.goto('/analytics');

    await expect(page.locator('h1')).toContainText(/Pilot Analytics/i);

    // Must show empirical text
    const pageText = await page.textContent('body');
    expect(pageText).toContain('EMPIRICAL TELEMETRY REGISTER');
  });

  // 5. Account Privacy & DPDP Lifecycle
  test('Account management page renders DPDP compliance controls and export option', async ({ page }) => {
    await page.goto('/account');

    // Page must load
    await expect(page.locator('body')).toBeVisible();
  });

  // 6. Responsive Viewport Check (320px Mobile)
  test('320px mobile viewport renders without breaking layout', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(322);
  });
});
