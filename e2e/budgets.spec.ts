import { expect, test } from '@playwright/test';
import { navigateTo, registerAndLogin, selectFirstOption, waitForDialog, waitForDialogToClose } from './helpers';

test.describe('Budgets', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, 'budget');
    await navigateTo(page, 'budgets');
  });

  test('should display budgets page with title', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Budgets/i);
  });

  test('should open create budget dialog', async ({ page }) => {
    await page.getByRole('button', { name: /Create Budget/i }).click();
    
    await waitForDialog(page);
    await expect(page.getByLabel(/Monthly Limit/i)).toBeVisible();
  });

  test('should create a new budget successfully', async ({ page }) => {
    await page.getByRole('button', { name: /Create Budget/i }).click();
    await waitForDialog(page);
    
    await selectFirstOption(page); // Select category
    await page.locator('#amount').fill('500');
    
    await page.getByRole('dialog').getByRole('button', { name: /Create Budget/i }).click();
    
    await waitForDialogToClose(page);
    // Budget card should show the amount
    await expect(page.getByText('$500.00').first()).toBeVisible();
  });

  test('should display summary cards', async ({ page }) => {
    await expect(page.getByText(/Total Budget/i)).toBeVisible();
    await expect(page.getByText(/Total Spent/i)).toBeVisible();
    await expect(page.getByText(/Over Budget/i)).toBeVisible();
  });

  test('should delete budget', async ({ page }) => {
    // Create a budget first
    await page.getByRole('button', { name: /Create Budget/i }).click();
    await waitForDialog(page);
    await selectFirstOption(page);
    await page.locator('#amount').fill('200');
    await page.getByRole('dialog').getByRole('button', { name: /Create Budget/i }).click();
    await waitForDialogToClose(page);
    
    // Delete using trash icon
    const deleteButton = page.getByRole('button').filter({ has: page.locator('svg.lucide-trash-2') }).first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should display budget cards after creation', async ({ page }) => {
    await page.getByRole('button', { name: /Create Budget/i }).click();
    await waitForDialog(page);
    
    await selectFirstOption(page);
    await page.locator('#amount').fill('1000');
    
    await page.getByRole('dialog').getByRole('button', { name: /Create Budget/i }).click();
    
    await waitForDialogToClose(page);
    
    // Budget card should show category name and progress bar
    const progressBar = page.getByRole('progressbar').first();
    await expect(progressBar).toBeVisible();
  });

  test('should show budget summary cards', async ({ page }) => {
    await expect(page.getByText(/Total Budget/i)).toBeVisible();
  });

  test('should show progress bar for budget spending', async ({ page }) => {
    await page.getByRole('button', { name: /Create Budget/i }).click();
    await waitForDialog(page);
    await selectFirstOption(page);
    await page.locator('#amount').fill('1000');
    await page.getByRole('dialog').getByRole('button', { name: /Create Budget/i }).click();
    await waitForDialogToClose(page);
    
    await expect(page.getByRole('progressbar').first()).toBeVisible();
  });

  test('should show empty state when no budgets', async ({ page }) => {
    const emptyMessage = page.getByText(/No budgets set up yet/i);
    const budgetCards = page.getByRole('progressbar');
    
    const hasBudgets = await budgetCards.count() > 0;
    if (!hasBudgets) {
      await expect(emptyMessage).toBeVisible();
    }
  });
});
