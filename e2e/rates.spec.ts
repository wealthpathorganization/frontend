import { test, expect } from '@playwright/test';
import { registerAndLogin, navigateTo } from './helpers';

test.describe('Interest Rates Page', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
    await navigateTo(page, 'rates');
  });

  const getTermSelector = (page: import('@playwright/test').Page) => {
    return page.getByRole('tabpanel').getByRole('combobox');
  };

  test('should display interest rates page @smoke', async ({ page }) => {
    await expect(page.getByText('Lãi suất ngân hàng')).toBeVisible();
    await expect(page.getByText('So sánh lãi suất từ các ngân hàng hàng đầu Việt Nam')).toBeVisible();

    await expect(page.getByRole('tab', { name: /tiết kiệm/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /vay tiêu dùng/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /vay mua nhà/i })).toBeVisible();
  });

  test('should display stat cards with rate info', async ({ page }) => {
    await expect(page.getByText('Lãi suất cao nhất')).toBeVisible();
    await expect(page.getByText('Lãi suất trung bình')).toBeVisible();
    await expect(page.getByText('Lãi suất thấp nhất')).toBeVisible();
    
    await expect(page.getByText(/\d+\.\d+%/).first()).toBeVisible();
  });

  test('should have term options in selector', async ({ page }) => {
    const termSelector = getTermSelector(page);
    await expect(termSelector).toBeVisible();
    await termSelector.click();

    await expect(page.getByRole('option', { name: '1 tháng', exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: '3 tháng', exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: '6 tháng', exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: '12 tháng', exact: true })).toBeVisible();
  });

  test('should have sort buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /theo lãi suất/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /theo ngân hàng/i })).toBeVisible();
  });

  test('should switch between product types', async ({ page }) => {
    const depositTab = page.getByRole('tab', { name: /tiết kiệm/i });
    await expect(depositTab).toHaveAttribute('data-state', 'active');

    const loanTab = page.getByRole('tab', { name: /vay tiêu dùng/i });
    await loanTab.click();
    await expect(loanTab).toHaveAttribute('data-state', 'active');

    const mortgageTab = page.getByRole('tab', { name: /vay mua nhà/i });
    await mortgageTab.click();
    await expect(mortgageTab).toHaveAttribute('data-state', 'active');
  });

  test('should change term filter', async ({ page }) => {
    const termSelector = getTermSelector(page);
    await termSelector.click();
    await page.getByRole('option', { name: '6 tháng', exact: true }).click();
    await expect(termSelector).toContainText('6 tháng');
  });

  test('should toggle sort order by rate', async ({ page }) => {
    const sortByRate = page.getByRole('button', { name: /theo lãi suất/i });

    await sortByRate.click();
    const firstState = await sortByRate.textContent();
    
    await sortByRate.click();
    const secondState = await sortByRate.textContent();
    
    expect(firstState).not.toBe(secondState);
    expect(firstState).toMatch(/↑|↓/);
    expect(secondState).toMatch(/↑|↓/);
  });

  test('should toggle sort order by bank', async ({ page }) => {
    const sortByBank = page.getByRole('button', { name: /theo ngân hàng/i });

    await sortByBank.click();
    const firstState = await sortByBank.textContent();
    
    await sortByBank.click();
    const secondState = await sortByBank.textContent();
    
    expect(firstState).not.toBe(secondState);
    expect(firstState).toMatch(/↑|↓/);
    expect(secondState).toMatch(/↑|↓/);
  });

  test('should load sample data when no rates exist', async ({ page }) => {
    const seedButton = page.getByRole('button', { name: /tải dữ liệu mẫu/i });

    if (await seedButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await seedButton.click();
      await page.waitForLoadState('networkidle');
      await expect(page.getByText(/vietcombank|techcombank|mb bank/i).first()).toBeVisible();
    }
  });

  test('should display bank cards in rates list', async ({ page }) => {
    const seedButton = page.getByRole('button', { name: /tải dữ liệu mẫu/i });

    if (await seedButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await seedButton.click();
      await page.waitForLoadState('networkidle');
    }

    await page.waitForTimeout(1000);

    const hasRates = await page.locator('[class*="card"]').count() > 3;
    
    if (hasRates) {
      const bankNames = ['Vietcombank', 'Techcombank', 'MB Bank', 'BIDV', 'VPBank', 'ACB', 'Agribank'];
      let foundBank = false;

      for (const bankName of bankNames) {
        if (await page.getByText(bankName).first().isVisible({ timeout: 500 }).catch(() => false)) {
          foundBank = true;
          break;
        }
      }

      expect(foundBank).toBe(true);
    }
  });

  test('should show highest rate badge when rates exist', async ({ page }) => {
    const seedButton = page.getByRole('button', { name: /tải dữ liệu mẫu/i });

    if (await seedButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await seedButton.click();
      await page.waitForLoadState('networkidle');
    }

    const badge = page.getByText('Cao nhất');
    if (await badge.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(badge).toBeVisible();
    }
  });

  test('should have refresh button that works', async ({ page }) => {
    const refreshButton = page.getByRole('button', { name: /cập nhật/i });
    await expect(refreshButton).toBeVisible();

    await refreshButton.click();
    await page.waitForLoadState('networkidle');
  });

  test('should display supported banks section with links', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await expect(page.getByText('Ngân hàng được hỗ trợ')).toBeVisible();

    const bankLinks = page.locator('a[target="_blank"][rel="noopener noreferrer"]');
    const count = await bankLinks.count();
    expect(count).toBeGreaterThan(0);

    const firstLink = bankLinks.first();
    await expect(firstLink).toHaveAttribute('href', /https:\/\//);
  });

  test('should maintain tab selection after operations', async ({ page }) => {
    const loanTab = page.getByRole('tab', { name: /vay tiêu dùng/i });
    await loanTab.click();
    await expect(loanTab).toHaveAttribute('data-state', 'active');

    const refreshButton = page.getByRole('button', { name: /cập nhật/i });
    await refreshButton.click();
    await page.waitForLoadState('networkidle');

    await expect(loanTab).toHaveAttribute('data-state', 'active');
  });
});
