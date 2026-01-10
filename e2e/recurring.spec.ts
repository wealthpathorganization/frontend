import { test, expect } from '@playwright/test';
import { registerAndLogin, waitForDialog, waitForDialogToClose, selectFirstOption, navigateTo, setupApiErrorTracking, assertNoApiErrors, ApiErrorTracker } from './helpers';

test.describe('Recurring Transactions', () => {
  let apiTracker: ApiErrorTracker;

  test.beforeEach(async ({ page }) => {
    apiTracker = setupApiErrorTracking(page);
    await registerAndLogin(page, 'recurring');
    await navigateTo(page, 'recurring');
  });

  test.afterEach(async () => {
    // Verify no API errors occurred during the test
    assertNoApiErrors(apiTracker, 'Recurring transactions test encountered API errors');
  });

  test('should display recurring transactions page with title @smoke', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Recurring Transactions/i);
  });

  test('should load page and API endpoints without errors @smoke', async ({ page }) => {
    // Wait for all API calls to complete
    await page.waitForLoadState('networkidle');

    // Verify the page loaded successfully by checking for the Active section heading
    await expect(page.getByRole('heading', { name: /Active \(/i })).toBeVisible();

    // The apiTracker in afterEach will catch any 500 errors from:
    // - /api/recurring
    // - /api/recurring/upcoming (called on dashboard, tested here for consistency)
  });

  test('should open add recurring transaction dialog', async ({ page }) => {
    await page.getByRole('button', { name: /Add Recurring/i }).click();
    
    await waitForDialog(page);
    await expect(page.getByLabel(/Amount/i)).toBeVisible();
  });

  // TODO: CurrencyInput component doesn't accept Playwright input - needs fix in component
  test.skip('should create recurring expense successfully', async ({ page }) => {
    await page.getByRole('button', { name: /Add Recurring/i }).click();
    await waitForDialog(page);

    const dialog = page.getByRole('dialog');

    // Fill amount using pressSequentially to trigger onChange
    await dialog.getByRole('textbox', { name: /Amount/i }).click();
    await dialog.getByRole('textbox', { name: /Amount/i }).pressSequentially('15.99');

    // Select category
    await selectFirstOption(page);

    // Fill description
    await dialog.getByLabel(/Description/i).fill('Netflix Subscription');

    // Submit the form
    const submitButton = dialog.getByRole('button', { name: /Create Recurring Transaction/i });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();

    await waitForDialogToClose(page);
    await expect(page.getByText(/Netflix/i)).toBeVisible();
  });

  // TODO: CurrencyInput component doesn't accept Playwright input - needs fix in component
  test.skip('should create recurring income successfully', async ({ page }) => {
    await page.getByRole('button', { name: /Add Recurring/i }).click();
    await waitForDialog(page);

    const dialog = page.getByRole('dialog');

    // Switch to income type
    const incomeButton = dialog.getByRole('button', { name: /Income/i });
    await incomeButton.click();

    // Fill amount using pressSequentially to trigger onChange
    await dialog.getByRole('textbox', { name: /Amount/i }).click();
    await dialog.getByRole('textbox', { name: /Amount/i }).pressSequentially('5000');

    // Select category (income categories appear after switching type)
    await page.waitForTimeout(300); // Wait for category options to update
    await selectFirstOption(page);

    // Fill description
    await dialog.getByLabel(/Description/i).fill('Monthly Salary');

    const submitButton = dialog.getByRole('button', { name: /Create Recurring Transaction/i });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();

    await waitForDialogToClose(page);
  });

  test('should display summary cards', async ({ page }) => {
    await expect(page.getByText(/Monthly Income/i)).toBeVisible();
    await expect(page.getByText(/Monthly Expenses/i)).toBeVisible();
    await expect(page.getByText(/Net Monthly/i)).toBeVisible();
  });

  // TODO: CurrencyInput component doesn't accept Playwright input - needs fix in component
  test.skip('should delete recurring transaction', async ({ page }) => {
    // First create one
    await page.getByRole('button', { name: /Add Recurring/i }).click();
    await waitForDialog(page);
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox', { name: /Amount/i }).click();
    await dialog.getByRole('textbox', { name: /Amount/i }).pressSequentially('25');
    await selectFirstOption(page);
    await dialog.getByLabel(/Description/i).fill('Delete Test');
    const submitButton = dialog.getByRole('button', { name: /Create Recurring Transaction/i });
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

  // TODO: CurrencyInput component doesn't accept Playwright input - needs fix in component
  test.skip('should pause recurring transaction', async ({ page }) => {
    // First create one
    await page.getByRole('button', { name: /Add Recurring/i }).click();
    await waitForDialog(page);
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox', { name: /Amount/i }).click();
    await dialog.getByRole('textbox', { name: /Amount/i }).pressSequentially('100');
    await selectFirstOption(page);
    await dialog.getByLabel(/Description/i).fill('Pause Test');
    const submitButton = dialog.getByRole('button', { name: /Create Recurring Transaction/i });
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
