import { test, expect } from '@playwright/test';
import {
  registerAndLogin,
  navigateTo,
  waitForDialog,
  setupApiErrorTracking,
  assertNoApiErrors,
  ApiErrorTracker,
  TEST_PASSWORD,
  generateTestEmail
} from './helpers';

test.describe('Form Validation', () => {
  let apiTracker: ApiErrorTracker;

  // Auth validation tests (no login needed)
  test.describe('Auth Validation', () => {
    test('should show error for invalid email format on login', async ({ page }) => {
      await page.goto('/en/login');
      await page.getByLabel(/email/i).fill('invalid-email');
      await page.getByLabel(/password/i).fill(TEST_PASSWORD);
      await page.getByRole('button', { name: /sign in|log in/i }).click();
      // Check for validation error
      await expect(page.getByText(/invalid|email/i)).toBeVisible({ timeout: 3000 });
    });

    test('should show error for short password on register', async ({ page }) => {
      await page.goto('/en/register');
      await page.getByLabel(/name/i).fill('Test User');
      await page.getByLabel(/email/i).fill(generateTestEmail('short-pw'));
      await page.getByLabel(/password/i).fill('123'); // Too short
      await page.getByRole('button', { name: /create account|sign up|register/i }).click();
      await expect(page.getByText(/password|short|minimum/i)).toBeVisible({ timeout: 3000 });
    });

    test('should show error for empty required fields on register', async ({ page }) => {
      await page.goto('/en/register');
      await page.getByRole('button', { name: /create account|sign up|register/i }).click();
      // Should stay on register page or show errors
      await expect(page).toHaveURL(/register/);
    });
  });

  // Feature validation tests (login required)
  test.describe('Transaction Validation', () => {
    test.beforeEach(async ({ page }) => {
      apiTracker = setupApiErrorTracking(page);
      await registerAndLogin(page, 'validation-tx');
      await navigateTo(page, 'transactions');
    });

    test.afterEach(async () => {
      assertNoApiErrors(apiTracker, 'Transaction validation test');
    });

    test('should require category for transaction', async ({ page }) => {
      await page.getByRole('button', { name: /add transaction|add/i }).first().click();
      await waitForDialog(page);

      // Fill amount but not category
      await page.getByLabel(/amount/i).fill('100');

      // Try to submit - should fail or button should be disabled
      const submitButton = page.getByRole('dialog').getByRole('button', { name: /add|create|save|submit/i });
      const isDisabled = await submitButton.isDisabled();
      if (!isDisabled) {
        await submitButton.click();
        // Should show error or stay in dialog
        await expect(page.getByRole('dialog')).toBeVisible();
      }
    });
  });

  test.describe('Budget Validation', () => {
    test.beforeEach(async ({ page }) => {
      apiTracker = setupApiErrorTracking(page);
      await registerAndLogin(page, 'validation-budget');
      await navigateTo(page, 'budgets');
    });

    test.afterEach(async () => {
      assertNoApiErrors(apiTracker, 'Budget validation test');
    });

    test('should require category for budget', async ({ page }) => {
      await page.getByRole('button', { name: /Create Budget/i }).click();
      await waitForDialog(page);

      // Fill amount but not category
      await page.locator('#amount').fill('500');

      const submitButton = page.getByRole('dialog').getByRole('button', { name: /Create Budget/i });
      // Button should be disabled or clicking should not close dialog
      const isDisabled = await submitButton.isDisabled().catch(() => false);
      if (!isDisabled) {
        await submitButton.click();
        // Dialog should still be visible (form didn't submit)
        await expect(page.getByRole('dialog')).toBeVisible();
      }
    });
  });

  test.describe('Savings Validation', () => {
    test.beforeEach(async ({ page }) => {
      apiTracker = setupApiErrorTracking(page);
      await registerAndLogin(page, 'validation-savings');
      await navigateTo(page, 'savings');
    });

    test.afterEach(async () => {
      assertNoApiErrors(apiTracker, 'Savings validation test');
    });

    test('should require goal name for savings', async ({ page }) => {
      await page.getByRole('button', { name: /New Goal/i }).click();
      await waitForDialog(page);

      // Fill amount but not name using quick amount button
      const dialog = page.getByRole('dialog');
      await dialog.getByRole('button', { name: /\+100/i }).click();

      const submitButton = dialog.getByRole('button', { name: /Create Goal/i });
      // Button should be disabled or clicking should not close dialog
      const isDisabled = await submitButton.isDisabled().catch(() => false);
      if (!isDisabled) {
        await submitButton.click();
        // Dialog should still be visible (form didn't submit)
        await expect(page.getByRole('dialog')).toBeVisible();
      }
    });
  });

  test.describe('Debt Validation', () => {
    test.beforeEach(async ({ page }) => {
      apiTracker = setupApiErrorTracking(page);
      await registerAndLogin(page, 'validation-debt');
      await navigateTo(page, 'debts');
    });

    test.afterEach(async () => {
      assertNoApiErrors(apiTracker, 'Debt validation test');
    });

    test('should require debt name', async ({ page }) => {
      await page.getByRole('button', { name: /Add Debt/i }).click();
      await waitForDialog(page);

      // Don't fill name, try to submit
      const submitButton = page.getByRole('dialog').getByRole('button', { name: /Add Debt/i });
      // Button should be disabled or clicking should not close dialog
      const isDisabled = await submitButton.isDisabled().catch(() => false);
      if (!isDisabled) {
        await submitButton.click();
        // Dialog should still be visible (form didn't submit)
        await expect(page.getByRole('dialog')).toBeVisible();
      }
    });
  });
});
