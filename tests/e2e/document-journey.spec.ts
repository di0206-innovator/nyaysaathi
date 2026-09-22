import { test, expect } from '@playwright/test';

test.describe('DOCUMENT-FIRST END-TO-END JOURNEY', () => {
  test('Full document comparison & grounded Q&A journey', async ({ page }) => {
    // 1. HOME: Visit landing page
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();

    // Check no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 4);

    // 2. COMPARE: Navigate to /compare
    const compareLink = page.locator('a[href="/compare"]:visible').first();
    await compareLink.click();
    await expect(page).toHaveURL(/\/compare/);
    await expect(page.locator('h1')).toContainText(/Compare/i);
    await page.waitForLoadState('domcontentloaded');

    // 3. SAMPLE DOCUMENTS: Select rental demo set
    const rentalDemoBtn = page.locator('button:has-text("Rental Agreement")').first();
    await expect(rentalDemoBtn).toBeVisible();
    await rentalDemoBtn.click();

    // 4. RUN COMPARISON: Wait for summary stats to render
    await expect(page.locator('text=Comparison Summary')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Total Clauses')).toBeVisible();
    await expect(page.getByText('Modified', { exact: true }).first()).toBeVisible();

    // 5. VIEW MODIFIED CLAUSE: Check that modified clauses appear
    const modifiedCards = page.locator('[role="region"]:has-text("modified")');
    const count = await modifiedCards.count();
    expect(count).toBeGreaterThan(0);

    // 6. OPEN EXPLANATION: Toggle the first modified clause
    const firstModified = modifiedCards.first();
    const toggleBtn = firstModified.locator('button').first();
    await toggleBtn.click();

    // Check expanded explanation sections
    await expect(page.getByText('Plain Language', { exact: true }).first()).toBeVisible();
    await expect(page.locator('text=Why It May Matter')).toBeVisible();

    // 7. VIEW SOURCE: Check source citations
    await expect(page.getByText('Source', { exact: true }).first()).toBeVisible();

    // 8. ASK QUESTION: Submit question to document-grounded Q&A
    const questionInput = page.locator('input#qa-question');
    await questionInput.fill('Did the notice period change between versions?');
    const askBtn = page.locator('button[aria-label="Submit question"]');
    await askBtn.click();

    // 9. RECEIVE GROUNDED ANSWER: Check answer and sources
    await expect(page.locator('text=Sources').first()).toBeVisible({ timeout: 15000 });

    // 10. NEXT STEP: Verify navigation CTA exists and points to /matters/new or /understand
    const saveMatterBtn = page.locator('a:has-text("Save to Matter & Navigate Next Steps")');
    await expect(saveMatterBtn).toBeVisible();
    await expect(saveMatterBtn).toHaveAttribute('href', '/matters/new');
  });

  test('Understand single document journey', async ({ page }) => {
    await page.goto('/understand');
    await expect(page.locator('h1')).toContainText(/Understand/i);
    await page.waitForLoadState('domcontentloaded');

    // Test sample document
    const sampleBtn = page.locator('button:has-text("Rental Agreement v1")').first();
    await expect(sampleBtn).toBeVisible();
    await sampleBtn.click();

    // Verify document overview
    await expect(page.locator('text=Document Overview')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Document Type')).toBeVisible();
    await expect(page.locator('text=Residential Rental Agreement')).toBeVisible();

    // Verify key clauses
    await expect(page.locator('h2:has-text("Key Clauses")')).toBeVisible();
    await expect(page.locator('text=/Extraction:.*complete/i')).toBeVisible();
  });

  test('Responsive compare layout check without horizontal overflow', async ({ page }) => {
    await page.goto('/compare');
    await expect(page.locator('h1')).toBeVisible();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 4);
  });
});
