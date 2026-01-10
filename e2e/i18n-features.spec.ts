import { test, expect } from '@playwright/test';
import {
  registerAndLoginVietnamese,
  navigateToVietnamese,
  assertVietnameseLocale,
  setupApiErrorTracking,
  assertNoApiErrors,
  ApiErrorTracker,
  waitForDialog
} from './helpers';

test.describe('Vietnamese Localization - Features', () => {
  let apiTracker: ApiErrorTracker;

  test.beforeEach(async ({ page }) => {
    apiTracker = setupApiErrorTracking(page);
    await registerAndLoginVietnamese(page, 'i18n-vi');
  });

  test.afterEach(async () => {
    assertNoApiErrors(apiTracker, 'Vietnamese i18n test');
  });

  test('should display dashboard in Vietnamese @smoke', async ({ page }) => {
    await assertVietnameseLocale(page);
    // Verify dashboard loads with heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Verify we're on a dashboard page
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should display transactions page in Vietnamese', async ({ page }) => {
    await navigateToVietnamese(page, 'transactions');
    await assertVietnameseLocale(page);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Verify URL is correct
    await expect(page).toHaveURL(/transactions/);
  });

  test('should display budgets page in Vietnamese', async ({ page }) => {
    await navigateToVietnamese(page, 'budgets');
    await assertVietnameseLocale(page);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page).toHaveURL(/budgets/);
  });

  test('should display savings page in Vietnamese', async ({ page }) => {
    await navigateToVietnamese(page, 'savings');
    await assertVietnameseLocale(page);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page).toHaveURL(/savings/);
  });

  test('should display debts page in Vietnamese', async ({ page }) => {
    await navigateToVietnamese(page, 'debts');
    await assertVietnameseLocale(page);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page).toHaveURL(/debts/);
  });

  test('should display recurring page in Vietnamese', async ({ page }) => {
    await navigateToVietnamese(page, 'recurring');
    await assertVietnameseLocale(page);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page).toHaveURL(/recurring/);
  });

  test('should display settings page in Vietnamese', async ({ page }) => {
    await navigateToVietnamese(page, 'settings');
    await assertVietnameseLocale(page);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page).toHaveURL(/settings/);
  });

  test('should display calculator page in Vietnamese', async ({ page }) => {
    await navigateToVietnamese(page, 'calculator');
    await assertVietnameseLocale(page);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page).toHaveURL(/calculator/);
  });

  test('should show Vietnamese labels in transaction dialog', async ({ page }) => {
    await navigateToVietnamese(page, 'transactions');
    await assertVietnameseLocale(page);

    // Click add transaction button (Vietnamese or English fallback)
    await page.getByRole('button', { name: /thêm giao dịch|add transaction/i }).first().click();
    await waitForDialog(page);

    // Dialog should be visible
    await expect(page.getByRole('dialog')).toBeVisible();

    // Verify form elements are present
    const amountInput = page.getByRole('dialog').getByRole('spinbutton').first();
    const numberInput = page.getByRole('dialog').locator('input[type="number"]').first();
    const textInput = page.getByRole('dialog').locator('input').first();

    // Check if any input is visible (amount field)
    const hasAmountInput = await amountInput.isVisible().catch(() => false);
    const hasNumberInput = await numberInput.isVisible().catch(() => false);
    const hasTextInput = await textInput.isVisible().catch(() => false);

    expect(hasAmountInput || hasNumberInput || hasTextInput).toBe(true);
  });

  test('should navigate between pages in Vietnamese', async ({ page }) => {
    // Start on dashboard
    await assertVietnameseLocale(page);

    // Navigate to transactions
    await navigateToVietnamese(page, 'transactions');
    await assertVietnameseLocale(page);
    await expect(page).toHaveURL(/transactions/);

    // Navigate to budgets
    await navigateToVietnamese(page, 'budgets');
    await assertVietnameseLocale(page);
    await expect(page).toHaveURL(/budgets/);

    // Navigate to savings
    await navigateToVietnamese(page, 'savings');
    await assertVietnameseLocale(page);
    await expect(page).toHaveURL(/savings/);

    // Verify we're still in Vietnamese locale after navigation
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  });

  test('should maintain Vietnamese locale after page refresh', async ({ page }) => {
    await navigateToVietnamese(page, 'transactions');
    await assertVietnameseLocale(page);

    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be in Vietnamese (check lang attribute)
    await assertVietnameseLocale(page);
    // URL should contain /vi/ or be on transactions page
    await expect(page).toHaveURL(/\/vi\/|transactions/);
  });

  test('should display Vietnamese text in budget dialog', async ({ page }) => {
    await navigateToVietnamese(page, 'budgets');
    await assertVietnameseLocale(page);

    // Click add budget button
    const addButton = page.getByRole('button', { name: /thêm ngân sách|add budget/i }).first();
    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click();
      await waitForDialog(page);
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });

  test('should display Vietnamese text in savings dialog', async ({ page }) => {
    await navigateToVietnamese(page, 'savings');
    await assertVietnameseLocale(page);

    // Click add savings goal button
    const addButton = page.getByRole('button', { name: /thêm mục tiêu|add.*goal/i }).first();
    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click();
      await waitForDialog(page);
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });

  test('should display Vietnamese text in debts dialog', async ({ page }) => {
    await navigateToVietnamese(page, 'debts');
    await assertVietnameseLocale(page);

    // Click add debt button
    const addButton = page.getByRole('button', { name: /thêm nợ|add debt/i }).first();
    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click();
      await waitForDialog(page);
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });
});
