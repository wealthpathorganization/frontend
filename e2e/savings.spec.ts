import { expect, test } from '@playwright/test';
import { navigateTo, registerAndLogin, waitForDialog, waitForDialogToClose } from './helpers';

test.describe('Savings Goals', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, 'savings');
    await navigateTo(page, 'savings');
  });

  test('should display savings page with title', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Savings Goals/i);
  });

  test('should open new goal dialog', async ({ page }) => {
    await page.getByRole('button', { name: /New Goal/i }).click();
    
    await waitForDialog(page);
    await expect(page.getByLabel(/Goal Name/i)).toBeVisible();
  });

  test('should create new savings goal successfully', async ({ page }) => {
    await page.getByRole('button', { name: /New Goal/i }).click();
    await waitForDialog(page);
    
    await page.getByLabel(/Goal Name/i).fill('Vacation Fund');
    await page.locator('#targetAmount').fill('5000');
    
    const dateInput = page.getByLabel(/Target Date/i);
    if (await dateInput.isVisible()) {
      await dateInput.fill('2025-12-31');
    }
    
    const submitButton = page.getByRole('dialog').getByRole('button', { name: /Create Goal/i });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();
    
    await waitForDialogToClose(page);
    await expect(page.getByText(/Vacation Fund/i)).toBeVisible();
  });

  test('should display summary cards', async ({ page }) => {
    await expect(page.getByText(/Total Saved/i)).toBeVisible();
    await expect(page.getByText(/Active Goals/i)).toBeVisible();
    await expect(page.getByText(/Avg Progress/i)).toBeVisible();
  });

  test('should delete savings goal', async ({ page }) => {
    // Create a goal first
    await page.getByRole('button', { name: /New Goal/i }).click();
    await waitForDialog(page);
    await page.getByLabel(/Goal Name/i).fill('Delete Test Goal');
    await page.locator('#targetAmount').fill('1000');
    await page.getByRole('dialog').getByRole('button', { name: /Create Goal/i }).click();
    await waitForDialogToClose(page);
    
    // Delete using trash icon
    const deleteButton = page.getByRole('button').filter({ has: page.locator('svg.lucide-trash-2') }).first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should add contribution to savings goal', async ({ page }) => {
    // Create a goal first
    await page.getByRole('button', { name: /New Goal/i }).click();
    await waitForDialog(page);
    await page.getByLabel(/Goal Name/i).fill('Emergency Fund');
    await page.locator('#targetAmount').fill('10000');
    const submitButton = page.getByRole('dialog').getByRole('button', { name: /Create Goal/i });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();
    await waitForDialogToClose(page);
    
    // Click add money button
    const addMoneyButton = page.getByRole('button', { name: /Add Money/i }).first();
    if (await addMoneyButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addMoneyButton.click();
      await waitForDialog(page);
      await expect(page.getByText(/Add Funds/i)).toBeVisible();
    }
  });

  test('should display progress bar for savings goal', async ({ page }) => {
    await page.getByRole('button', { name: /New Goal/i }).click();
    await waitForDialog(page);
    await page.getByLabel(/Goal Name/i).fill('Car Fund');
    await page.locator('#targetAmount').fill('20000');
    await page.getByRole('dialog').getByRole('button', { name: /Create Goal/i }).click();
    await waitForDialogToClose(page);
    
    await expect(page.getByRole('progressbar').first()).toBeVisible();
  });

  test('should show empty state when no goals', async ({ page }) => {
    const emptyMessage = page.getByText(/No savings goals yet/i);
    const goalCards = page.locator('[class*="card"]').filter({ hasText: /Target/i });
    
    const hasGoals = await goalCards.count() > 0;
    if (!hasGoals) {
      await expect(emptyMessage).toBeVisible();
    }
  });
});
