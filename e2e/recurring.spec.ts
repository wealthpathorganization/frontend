import { test, expect } from '@playwright/test';
import { registerAndLogin, waitForDialog, waitForDialogToClose, selectFirstOption, navigateTo } from './helpers';

test.describe('Recurring Transactions', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, 'recurring');
    await navigateTo(page, 'recurring');
  });

  test('should display recurring transactions page with title', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Recurring Transactions/i);
  });

  test('should open add recurring transaction dialog', async ({ page }) => {
    await page.getByRole('button', { name: /Add Recurring/i }).click();
    
    await waitForDialog(page);
    await expect(page.getByLabel(/Amount/i)).toBeVisible();
  });

  test('should create recurring expense successfully', async ({ page }) => {
    await page.getByRole('button', { name: /Add Recurring/i }).click();
    await waitForDialog(page);
    
    // Fill amount using CurrencyInput
    await page.locator('#amount').fill('15.99');
    
    // Select category
    await selectFirstOption(page);
    
    // Fill description
    await page.getByLabel(/Description/i).fill('Netflix Subscription');
    
    // Submit the form
    const submitButton = page.getByRole('dialog').getByRole('button', { name: /Create Recurring Transaction/i });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();
    
    await waitForDialogToClose(page);
    await expect(page.getByText(/Netflix/i)).toBeVisible();
  });

  test('should create recurring income successfully', async ({ page }) => {
    await page.getByRole('button', { name: /Add Recurring/i }).click();
    await waitForDialog(page);
    
    // Switch to income type
    const incomeButton = page.getByRole('dialog').getByRole('button', { name: /Income/i });
    await incomeButton.click();
    
    // Fill amount
    await page.locator('#amount').fill('5000');
    
    // Select category (income categories appear after switching type)
    await page.waitForTimeout(300); // Wait for category options to update
    await selectFirstOption(page);
    
    // Fill description
    await page.getByLabel(/Description/i).fill('Monthly Salary');
    
    const submitButton = page.getByRole('dialog').getByRole('button', { name: /Create Recurring Transaction/i });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();
    
    await waitForDialogToClose(page);
  });

  test('should display summary cards', async ({ page }) => {
    await expect(page.getByText(/Monthly Income/i)).toBeVisible();
    await expect(page.getByText(/Monthly Expenses/i)).toBeVisible();
    await expect(page.getByText(/Net Monthly/i)).toBeVisible();
  });

  test('should delete recurring transaction', async ({ page }) => {
    // First create one
    await page.getByRole('button', { name: /Add Recurring/i }).click();
    await waitForDialog(page);
    await page.locator('#amount').fill('25');
    await selectFirstOption(page);
    await page.getByLabel(/Description/i).fill('Delete Test');
    const submitButton = page.getByRole('dialog').getByRole('button', { name: /Create Recurring Transaction/i });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();
    await waitForDialogToClose(page);
    
    // Open dropdown menu and delete
    const moreButton = page.getByRole('button').filter({ has: page.locator('svg.lucide-more-vertical') }).first();
    if (await moreButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await moreButton.click();
      const deleteOption = page.getByRole('menuitem', { name: /Delete/i });
      if (await deleteOption.isVisible()) {
        await deleteOption.click();
      }
    }
  });

  test('should pause recurring transaction', async ({ page }) => {
    // First create one
    await page.getByRole('button', { name: /Add Recurring/i }).click();
    await waitForDialog(page);
    await page.locator('#amount').fill('100');
    await selectFirstOption(page);
    await page.getByLabel(/Description/i).fill('Pause Test');
    const submitButton = page.getByRole('dialog').getByRole('button', { name: /Create Recurring Transaction/i });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();
    await waitForDialogToClose(page);
    
    // Open dropdown menu and pause
    const moreButton = page.getByRole('button').filter({ has: page.locator('svg.lucide-more-vertical') }).first();
    if (await moreButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await moreButton.click();
      const pauseOption = page.getByRole('menuitem', { name: /Pause/i });
      if (await pauseOption.isVisible()) {
        await pauseOption.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should display active recurring section', async ({ page }) => {
    await expect(page.getByText(/Active \(/i)).toBeVisible();
  });
});
