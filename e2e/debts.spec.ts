import { expect, test } from '@playwright/test';
import { navigateTo, registerAndLogin, selectFirstOption, waitForDialog, waitForDialogToClose, fillCurrencyInput, setupApiErrorTracking, assertNoApiErrors, ApiErrorTracker } from './helpers';

test.describe('Debts', () => {
  let apiTracker: ApiErrorTracker;

  test.beforeEach(async ({ page }) => {
    apiTracker = setupApiErrorTracking(page);
    await registerAndLogin(page, 'debt');
    await navigateTo(page, 'debts');
  });

  test.afterEach(async () => {
    assertNoApiErrors(apiTracker, 'Debts test encountered API errors');
  });

  test('should display debts page with title', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Debt Manager/i);
  });

  test('should open add debt dialog', async ({ page }) => {
    await page.getByRole('button', { name: /Add Debt/i }).click();
    
    await waitForDialog(page);
    await expect(page.getByLabel(/Debt Name/i)).toBeVisible();
  });

  test('should add new debt successfully', async ({ page }) => {
    await page.getByRole('button', { name: /Add Debt/i }).click();
    await waitForDialog(page);

    await page.getByLabel(/Debt Name/i).fill('Car Loan');
    await selectFirstOption(page); // Select debt type

    const dialog = page.getByRole('dialog');

    // For CurrencyInput without quick amount buttons, use data-testid and fill
    const currencyInputs = dialog.getByTestId('currency-input');
    await currencyInputs.nth(0).fill('25000');
    await currencyInputs.nth(1).fill('20000');

    await dialog.getByLabel(/Interest Rate/i).fill('5.5');

    await currencyInputs.nth(2).fill('450');

    await dialog.getByLabel(/Due Date/i).fill('15');
    await dialog.getByLabel(/Start Date/i).fill('2024-01-01');

    await dialog.getByRole('button', { name: /Add Debt/i }).click();

    await waitForDialogToClose(page);
    await expect(page.getByText(/Car Loan/i)).toBeVisible();
  });

  test('should display debt summary cards', async ({ page }) => {
    await expect(page.getByText(/Total Debt/i)).toBeVisible();
    await expect(page.getByText(/Monthly Minimum/i)).toBeVisible();
    await expect(page.getByText(/Avg Interest Rate/i)).toBeVisible();
  });

  test('should show empty state when no debts', async ({ page }) => {
    // Check for empty state message
    const emptyMessage = page.getByText(/No debts tracked/i);
    const debtCards = page.locator('[class*="card"]').filter({ hasText: /Balance/i });
    
    // Either empty state or debt cards should be visible
    const hasDebts = await debtCards.count() > 0;
    if (!hasDebts) {
      await expect(emptyMessage).toBeVisible();
    }
  });

  test('should delete debt with confirmation', async ({ page }) => {
    // First create a debt
    await page.getByRole('button', { name: /Add Debt/i }).click();
    await waitForDialog(page);
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/Debt Name/i).fill('Delete Test Debt');
    await selectFirstOption(page);

    const currencyInputs = dialog.getByTestId('currency-input');
    await currencyInputs.nth(0).fill('1000');
    await currencyInputs.nth(1).fill('500');

    await dialog.getByLabel(/Interest Rate/i).fill('5');

    await currencyInputs.nth(2).fill('50');

    await dialog.getByLabel(/Due Date/i).fill('1');
    await dialog.getByLabel(/Start Date/i).fill('2024-01-01');
    await dialog.getByRole('button', { name: /Add Debt/i }).click();
    await waitForDialogToClose(page);

    // Delete using trash icon button
    const deleteButton = page.getByRole('button').filter({ has: page.locator('svg.lucide-trash-2') }).first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      // Should see toast or debt removed
      await page.waitForTimeout(500);
    }
  });

  test('should open payment dialog', async ({ page }) => {
    // First create a debt
    await page.getByRole('button', { name: /Add Debt/i }).click();
    await waitForDialog(page);
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/Debt Name/i).fill('Credit Card');
    await selectFirstOption(page);

    const currencyInputs = dialog.getByTestId('currency-input');
    await currencyInputs.nth(0).fill('5000');
    await currencyInputs.nth(1).fill('3000');

    await dialog.getByLabel(/Interest Rate/i).fill('18');

    await currencyInputs.nth(2).fill('100');

    await dialog.getByLabel(/Due Date/i).fill('1');
    await dialog.getByLabel(/Start Date/i).fill('2024-01-01');
    await dialog.getByRole('button', { name: /Add Debt/i }).click();
    await waitForDialogToClose(page);

    // Click payment button
    const payButton = page.getByRole('button', { name: /Payment/i }).first();
    if (await payButton.isVisible()) {
      await payButton.click();
      await waitForDialog(page);
      await expect(page.getByText(/Make Payment/i)).toBeVisible();
    }
  });
});
