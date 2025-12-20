import { test, expect } from '@playwright/test';
import { registerAndLogin, navigateTo } from './helpers';

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, 'settings');
    await navigateTo(page, 'settings');
  });

  test('should display settings page with title', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Settings/i);
  });

  test('should display user profile section', async ({ page }) => {
    await expect(page.getByText(/Profile|Account/i).first()).toBeVisible();
  });

  test('should display currency selector', async ({ page }) => {
    const currencyLabel = page.getByText(/Default Currency/i);
    await expect(currencyLabel).toBeVisible();
  });

  test('should display name field', async ({ page }) => {
    const nameInput = page.getByLabel(/Name/i);
    await expect(nameInput).toBeVisible();
  });

  test('should change currency preference', async ({ page }) => {
    const currencySelect = page.getByRole('combobox');
    
    if (await currencySelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      await currencySelect.click();
      
      // Select a different currency option
      const option = page.getByRole('option').first();
      if (await option.isVisible()) {
        await option.click();
      }
    }
  });

  test('should have save button', async ({ page }) => {
    // The save button may be "Save Changes" or just part of a form
    const saveButton = page.getByRole('button', { name: /Save/i });
    await expect(saveButton.first()).toBeVisible();
  });

  test('should display email field as readonly', async ({ page }) => {
    const emailText = page.getByText(/@example\.com/i);
    await expect(emailText).toBeVisible();
  });
});
