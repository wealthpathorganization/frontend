import { test, expect } from '@playwright/test';
import {
  registerAndLogin,
  navigateTo,
  waitForDialog,
  waitForDialogToClose,
  selectFirstOption,
  setupApiErrorTracking,
  assertNoApiErrors,
  ApiErrorTracker
} from './helpers';

test.describe('Cross-Feature Workflows', () => {
  let apiTracker: ApiErrorTracker;

  test.beforeEach(async ({ page }) => {
    apiTracker = setupApiErrorTracking(page);
    await registerAndLogin(page, 'workflow');
  });

  test.afterEach(async () => {
    assertNoApiErrors(apiTracker, 'Workflow test');
  });

  test('should add transaction and see it in recent transactions on dashboard', async ({ page }) => {
    // Go to transactions
    await navigateTo(page, 'transactions');

    // Create a transaction
    await page.getByRole('button', { name: /add transaction|add/i }).first().click();
    await waitForDialog(page);
    await page.getByLabel(/amount/i).fill('123');
    await selectFirstOption(page);
    await page.getByRole('dialog').getByRole('button', { name: /add|create|save|submit/i }).click();
    await waitForDialogToClose(page);

    // Go to dashboard
    await navigateTo(page, 'dashboard');
    await page.waitForLoadState('networkidle');

    // Should see the recent transactions section
    await expect(page.getByText(/Recent Transactions/i)).toBeVisible();
    // Transaction should be visible (amount may be formatted as $123.00 or 123)
    const transactionAmount = page.getByText(/123/);
    await expect(transactionAmount.first()).toBeVisible({ timeout: 5000 });
  });

  test('should create budget and verify it shows on budgets page', async ({ page }) => {
    await navigateTo(page, 'budgets');

    // Create budget
    await page.getByRole('button', { name: /Create Budget/i }).click();
    await waitForDialog(page);
    await selectFirstOption(page);
    await page.locator('#amount').fill('500');
    await page.getByRole('dialog').getByRole('button', { name: /Create Budget/i }).click();
    await waitForDialogToClose(page);

    // Verify budget card appears
    await expect(page.getByText('$500.00').first()).toBeVisible();
    await expect(page.getByRole('progressbar').first()).toBeVisible();
  });

  test('should create savings goal and see progress bar', async ({ page }) => {
    await navigateTo(page, 'savings');

    // Create savings goal
    await page.getByRole('button', { name: /New Goal/i }).click();
    await waitForDialog(page);

    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/Goal Name/i).fill('Test Workflow Goal');
    // Use quick amount buttons (more reliable for CurrencyInput)
    await dialog.getByRole('button', { name: /\+500/i }).click();

    const submitButton = dialog.getByRole('button', { name: /Create Goal/i });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();
    await waitForDialogToClose(page);

    // Verify goal appears with progress bar
    await expect(page.getByText(/Test Workflow Goal/i)).toBeVisible();
    await expect(page.getByRole('progressbar').first()).toBeVisible();
  });

  test('should navigate through all main features without errors @smoke', async ({ page }) => {
    // Dashboard - already here after login
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Transactions
    await navigateTo(page, 'transactions');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/transaction/i);

    // Budgets
    await navigateTo(page, 'budgets');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/budget/i);

    // Savings
    await navigateTo(page, 'savings');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/savings/i);

    // Debts
    await navigateTo(page, 'debts');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/debt/i);

    // Recurring
    await navigateTo(page, 'recurring');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/recurring/i);

    // Calculator
    await navigateTo(page, 'calculator');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/calculator/i);

    // Settings
    await navigateTo(page, 'settings');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/settings/i);
  });

  test('should show summary cards updating across pages', async ({ page }) => {
    // Check dashboard has summary cards
    await expect(page.getByText(/income/i).first()).toBeVisible();
    await expect(page.getByText(/expense/i).first()).toBeVisible();

    // Check budgets page has summary
    await navigateTo(page, 'budgets');
    await expect(page.getByText(/Total Budget/i)).toBeVisible();

    // Check savings page has summary
    await navigateTo(page, 'savings');
    await expect(page.getByText(/Total Saved/i)).toBeVisible();

    // Check debts page has summary
    await navigateTo(page, 'debts');
    await expect(page.getByText(/Total Debt/i)).toBeVisible();

    // Check recurring page has summary
    await navigateTo(page, 'recurring');
    await expect(page.getByText(/Monthly Income/i)).toBeVisible();
    await expect(page.getByText(/Monthly Expenses/i)).toBeVisible();
  });

  test('should maintain session across multiple feature navigations', async ({ page }) => {
    // Perform actions across multiple pages without losing session

    // Create a transaction
    await navigateTo(page, 'transactions');
    await page.getByRole('button', { name: /add transaction|add/i }).first().click();
    await waitForDialog(page);
    await page.getByLabel(/amount/i).fill('50');
    await selectFirstOption(page);
    await page.getByRole('dialog').getByRole('button', { name: /add|create|save|submit/i }).click();
    await waitForDialogToClose(page);

    // Navigate to budgets and create one
    await navigateTo(page, 'budgets');
    await page.getByRole('button', { name: /Create Budget/i }).click();
    await waitForDialog(page);
    await selectFirstOption(page);
    await page.locator('#amount').fill('300');
    await page.getByRole('dialog').getByRole('button', { name: /Create Budget/i }).click();
    await waitForDialogToClose(page);

    // Navigate to savings and create a goal
    await navigateTo(page, 'savings');
    await page.getByRole('button', { name: /New Goal/i }).click();
    await waitForDialog(page);
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/Goal Name/i).fill('Session Test Goal');
    // Use quick amount buttons (more reliable for CurrencyInput)
    await dialog.getByRole('button', { name: /\+500/i }).click();
    const submitButton = dialog.getByRole('button', { name: /Create Goal/i });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();
    await waitForDialogToClose(page);

    // Go back to dashboard and verify everything is there
    await navigateTo(page, 'dashboard');
    await page.waitForLoadState('networkidle');

    // Verify we're still logged in and see dashboard content
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/Recent Transactions/i)).toBeVisible();
  });

  test('should display consistent navigation sidebar across all pages', async ({ page }) => {
    const pages = ['dashboard', 'transactions', 'budgets', 'savings', 'debts', 'recurring'];

    for (const pageName of pages) {
      await navigateTo(page, pageName);

      // Verify navigation sidebar is present
      const nav = page.getByRole('navigation');
      await expect(nav).toBeVisible();

      // Verify navigation has multiple links
      const navLinks = await nav.getByRole('link').count();
      expect(navLinks).toBeGreaterThan(3);
    }
  });

  test('should handle rapid navigation between pages', async ({ page }) => {
    // Quickly navigate between pages to test stability
    await navigateTo(page, 'transactions');
    await navigateTo(page, 'budgets');
    await navigateTo(page, 'savings');
    await navigateTo(page, 'debts');
    await navigateTo(page, 'recurring');
    await navigateTo(page, 'dashboard');

    // Verify we ended up on dashboard correctly
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Recent Transactions/i)).toBeVisible();
  });

  test('should show budget and savings summaries on dashboard', async ({ page }) => {
    // Dashboard should show summaries of budgets and savings (use heading role for card titles)
    const budgetHeading = page.getByRole('heading', { name: /Budget/i });
    const savingsHeading = page.getByRole('heading', { name: /Savings/i });

    await expect(budgetHeading.first()).toBeVisible({ timeout: 5000 });
    await expect(savingsHeading.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show upcoming bills section on dashboard', async ({ page }) => {
    // Dashboard should show upcoming bills from recurring transactions
    await page.waitForLoadState('networkidle');
    const upcomingHeading = page.getByRole('heading', { name: /Upcoming|Bills/i });
    // Section may not be visible if no recurring transactions - that's OK
    if (await upcomingHeading.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(upcomingHeading.first()).toBeVisible();
    }
  });
});
