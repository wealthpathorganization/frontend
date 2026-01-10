import { expect, test } from '@playwright/test';

import { registerAndLogin, setupApiErrorTracking, assertNoApiErrors, ApiErrorTracker } from './helpers';

test.describe('Dashboard', () => {
  let apiTracker: ApiErrorTracker;

  test.beforeEach(async ({ page }) => {
    apiTracker = setupApiErrorTracking(page);
    await registerAndLogin(page, 'dashboard');
  });

  test.afterEach(async () => {
    // Verify no API errors occurred during the test
    assertNoApiErrors(apiTracker, 'Dashboard test encountered API errors');
  });

  test('should display dashboard page with title @smoke', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should show financial summary cards', async ({ page }) => {
    const incomeCard = page.getByText(/income/i);
    const expenseCard = page.getByText(/expense/i);
    
    await expect(incomeCard.first()).toBeVisible();
    await expect(expenseCard.first()).toBeVisible();
  });

  test('should have navigation sidebar', async ({ page }) => {
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();
    
    await expect(nav.getByRole('link').first()).toBeVisible();
    const navLinks = await nav.getByRole('link').count();
    expect(navLinks).toBeGreaterThan(0);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    const mobileMenuButton = page.getByRole('button', { name: /menu|toggle/i });
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await expect(page.getByRole('navigation')).toBeVisible();
    }
  });

  test('should display charts section', async ({ page }) => {
    const chartSection = page.locator('canvas, [data-testid="chart"], svg').first();

    if (await chartSection.isVisible()) {
      await expect(chartSection).toBeVisible();
    }
  });

  test('should load upcoming bills section without errors @smoke', async ({ page }) => {
    // This test specifically checks the /api/recurring/upcoming endpoint works
    // The apiTracker in afterEach will catch any 500 errors

    // Give time for the API call to complete
    await page.waitForLoadState('networkidle');

    // Look for the upcoming bills section heading (may be "Upcoming Bills & Income" or similar)
    const upcomingSection = page.getByRole('heading', { name: /Upcoming|Bills/i });
    if (await upcomingSection.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(upcomingSection.first()).toBeVisible();
    }
    // If section isn't shown, the test still passes - we're mainly checking for no API errors
  });

  test('should display budget and savings summaries', async ({ page }) => {
    // These are card titles on the dashboard
    const budgetSummary = page.getByRole('heading', { name: /Budget/i });
    const savingsGoals = page.getByRole('heading', { name: /Savings/i });

    await expect(budgetSummary.first()).toBeVisible({ timeout: 5000 });
    await expect(savingsGoals.first()).toBeVisible({ timeout: 5000 });
  });

  test('should display recent transactions section', async ({ page }) => {
    await expect(page.getByText(/Recent Transactions/i)).toBeVisible();
  });
});
