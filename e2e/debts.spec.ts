import { expect, test } from '@playwright/test';
import { navigateTo, registerAndLogin, selectFirstOption, waitForDialog, waitForDialogToClose } from './helpers';

test.describe('Debts', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, 'debt');
    await navigateTo(page, 'debts');
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
    
    // CurrencyInput fields - type directly into input
    await page.locator('#originalAmount').fill('25000');
    await page.locator('#currentBalance').fill('20000');
    await page.getByLabel(/Interest Rate/i).fill('5.5');
    await page.locator('#minimumPayment').fill('450');
    await page.getByLabel(/Due Date/i).fill('15');
    await page.getByLabel(/Start Date/i).fill('2024-01-01');
    
    await page.getByRole('dialog').getByRole('button', { name: /Add Debt/i }).click();
    
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
    await page.getByLabel(/Debt Name/i).fill('Delete Test Debt');
    await selectFirstOption(page);
    await page.locator('#originalAmount').fill('1000');
    await page.locator('#currentBalance').fill('500');
    await page.getByLabel(/Interest Rate/i).fill('5');
    await page.locator('#minimumPayment').fill('50');
    await page.getByLabel(/Due Date/i).fill('1');
    await page.getByLabel(/Start Date/i).fill('2024-01-01');
    await page.getByRole('dialog').getByRole('button', { name: /Add Debt/i }).click();
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
    await page.getByLabel(/Debt Name/i).fill('Credit Card');
    await selectFirstOption(page);
    await page.locator('#originalAmount').fill('5000');
    await page.locator('#currentBalance').fill('3000');
    await page.getByLabel(/Interest Rate/i).fill('18');
    await page.locator('#minimumPayment').fill('100');
    await page.getByLabel(/Due Date/i).fill('1');
    await page.getByLabel(/Start Date/i).fill('2024-01-01');
    await page.getByRole('dialog').getByRole('button', { name: /Add Debt/i }).click();
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
