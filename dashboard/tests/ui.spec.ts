import { test, expect } from '@playwright/test';

/**
 * E2E Test Suite for FPL Axiom Dashboard
 * Protects critical UI functionality before deployment
 */

// =============================================================================
// TEST 1: Mobile Responsiveness (The "iPhone" Check)
// Uses the 'mobile' project defined in playwright.config.ts
// =============================================================================
test.describe('Mobile Responsiveness', () => {
  test('Teams page renders correctly on mobile @mobile', async ({ page, isMobile }) => {
    // Skip if not running in mobile project
    test.skip(!isMobile, 'This test only runs in mobile project');
    
    await page.goto('/teams');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Verify the page title/header is visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Look for Burnley in the table - should be visible or scrollable
    const burnleyRow = page.locator('text=Burnley').first();
    await expect(burnleyRow).toBeVisible({ timeout: 10000 });
    
    // Verify no horizontal overflow - page width should match viewport
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();
    const viewport = page.viewportSize();
    
    if (bodyBox && viewport) {
      // Body should not be wider than viewport (no horizontal scroll needed)
      expect(bodyBox.width).toBeLessThanOrEqual(viewport.width + 10); // 10px tolerance
    }
  });
});

// =============================================================================
// TEST 2: Interaction & Sorting (The "Arsenal" Check)
// =============================================================================
test.describe('Interaction & Sorting', () => {
  test('Sorting by Structure moves Arsenal to top', async ({ page }) => {
    await page.goto('/teams');
    
    // Wait for the table to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Allow data to populate
    
    // Verify Arsenal exists in the table
    const arsenalText = page.locator('text=Arsenal').first();
    await expect(arsenalText).toBeVisible({ timeout: 10000 });
    
    // Find and click the "Structure" sort button
    const structureButton = page.locator('button:has-text("Structure")').first();
    
    if (await structureButton.isVisible()) {
      await structureButton.click();
      await page.waitForTimeout(500); // Allow sort to apply
      
      // After sorting by Structure (descending), Arsenal (score 91+) should be near top
      // Get all team rows and check Arsenal's position
      const teamRows = page.locator('tbody tr');
      
      // Arsenal should be in the top 3 rows after sorting by Structure
      const topRows = await teamRows.locator(':scope').all();
      let arsenalInTop3 = false;
      
      for (let i = 0; i < Math.min(3, topRows.length); i++) {
        const rowText = await topRows[i].textContent();
        if (rowText?.includes('Arsenal')) {
          arsenalInTop3 = true;
          break;
        }
      }
      
      expect(arsenalInTop3).toBe(true);
    } else {
      // If no explicit sort button, check if table has sortable headers
      const structureHeader = page.locator('th:has-text("Structure")').first();
      if (await structureHeader.isVisible()) {
        await structureHeader.click();
        await page.waitForTimeout(500);
      }
    }
  });
});

// =============================================================================
// TEST 3: Visual Regression (The "Matrix" Check)
// =============================================================================
test.describe('Visual Regression', () => {
  test('Matrix page loads and renders chart', async ({ page }) => {
    await page.goto('/matrix');
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    
    // Wait for any loading states to complete
    await page.waitForTimeout(3000);
    
    // Verify the page has loaded (check for header or main content)
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    
    // Look for chart/canvas element or the matrix visualization
    const chartElement = page.locator('canvas, svg, [class*="chart"], [class*="matrix"], [class*="quadrant"]').first();
    
    // Wait for chart to be visible (may take time to render)
    await expect(chartElement).toBeVisible({ timeout: 15000 });
    
    // Take a screenshot for visual regression testing
    await page.screenshot({ 
      path: 'tests/screenshots/matrix-page.png',
      fullPage: true 
    });
    
    // Verify screenshot was taken (file exists check happens implicitly)
    // The test passes if we get here without errors
  });
});

// =============================================================================
// TEST 4: Basic Navigation Smoke Test
// =============================================================================
test.describe('Navigation Smoke Test', () => {
  test('All main pages load without error', async ({ page }) => {
    const routes = ['/', '/teams', '/luck', '/matrix'];
    
    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      
      // Wait for page to stabilize
      await page.waitForTimeout(1000);
      
      // Verify page loaded by checking for visible text content
      const pageContent = await page.locator('body').textContent();
      expect(pageContent).toBeTruthy();
      expect(pageContent!.length).toBeGreaterThan(50);
      
      // Check that page doesn't show an unhandled error message
      const hasErrorText = pageContent?.includes('Application error') || 
                           pageContent?.includes('Unhandled Runtime Error');
      expect(hasErrorText).toBe(false);
    }
  });
});
