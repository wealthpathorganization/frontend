import { test, expect } from '@playwright/test';
import { registerAndLogin, navigateTo } from './helpers';

test.describe('Financial Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, 'calculator');
    await navigateTo(page, 'calculator');
  });

  test('should display calculator page with title', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/calculator/i);
  });

  test('should display calculator input fields', async ({ page }) => {
    // Loan tab is active by default - check for specific inputs
    await expect(page.getByLabel('Loan Amount')).toBeVisible();
    await expect(page.getByLabel('Annual Interest Rate (%)')).toBeVisible();
    await expect(page.getByLabel('Loan Term (months)')).toBeVisible();
  });

  test('should calculate loan payment', async ({ page }) => {
    // Fill all required fields to enable Calculate button
    await page.getByLabel('Loan Amount').fill('100000');
    await page.getByLabel('Annual Interest Rate (%)').fill('5');
    await page.getByLabel('Loan Term (months)').fill('60');
    
    // Wait for button to be enabled and click
    const calculateButton = page.getByRole('button', { name: 'Calculate' });
    await expect(calculateButton).toBeEnabled();
    await calculateButton.click();
    
    // Check for results
    await expect(page.getByText('Monthly Payment')).toBeVisible();
    await expect(page.getByText('Total Payment')).toBeVisible();
    await expect(page.getByText('Total Interest', { exact: true })).toBeVisible();
  });

  test('should calculate compound interest', async ({ page }) => {
    // Switch to savings tab
    await page.getByRole('tab', { name: 'Savings Calculator' }).click();
    
    // Fill savings calculator fields
    await page.getByLabel('Initial Amount').fill('10000');
    await page.getByLabel('Monthly Contribution').fill('500');
    await page.getByLabel('Annual Interest Rate (%)').fill('7');
    await page.getByLabel('Time Period (years)').fill('10');
    
    // Calculate
    const calculateButton = page.getByRole('button', { name: 'Calculate' });
    await expect(calculateButton).toBeEnabled();
    await calculateButton.click();
    
    // Check for results
    await expect(page.getByText('Future Value')).toBeVisible();
    await expect(page.getByText('Your Contributions')).toBeVisible();
    await expect(page.getByText('Interest Earned')).toBeVisible();
  });

  test('should display calculation results', async ({ page }) => {
    // Results section shows after calculation
    await page.getByLabel('Loan Amount').fill('25000');
    await page.getByLabel('Annual Interest Rate (%)').fill('5.5');
    await page.getByLabel('Loan Term (months)').fill('60');
    
    await page.getByRole('button', { name: 'Calculate' }).click();
    
    await expect(page.getByText('Loan Summary')).toBeVisible();
  });

  test('should switch between calculator tabs', async ({ page }) => {
    // Default tab is loan
    await expect(page.getByRole('tab', { name: 'Loan Calculator' })).toHaveAttribute('data-state', 'active');
    
    // Switch to savings
    await page.getByRole('tab', { name: 'Savings Calculator' }).click();
    await expect(page.getByRole('tab', { name: 'Savings Calculator' })).toHaveAttribute('data-state', 'active');
    
    // Verify savings fields appear
    await expect(page.getByLabel('Initial Amount')).toBeVisible();
  });
});
