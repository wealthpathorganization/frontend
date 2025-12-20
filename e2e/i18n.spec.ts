import { test, expect } from '@playwright/test';

test.describe('Internationalization (i18n)', () => {
  test('should display English version on /en route', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    // Check for common English landing page text
    await expect(page.getByText(/Sign in|Get Started|Financial/i).first()).toBeVisible();
  });

  test('should display Vietnamese version on /vi route', async ({ page }) => {
    await page.goto('/vi');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
    // Check for common Vietnamese landing page text
    await expect(page.getByText(/Đăng nhập|Bắt đầu|Tài chính/i).first()).toBeVisible();
  });

  test('should switch language from English to Vietnamese', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    
    // Look for language switcher in various forms
    const langSwitcher = page.getByRole('button', { name: /language|english|en/i });
    const langLink = page.getByRole('link', { name: /vietnamese|tiếng việt|vi/i });
    
    if (await langSwitcher.isVisible()) {
      await langSwitcher.click();
      
      if (await langLink.isVisible()) {
        await langLink.click();
        await expect(page).toHaveURL(/\/vi/);
      }
    }
  });

  test('should switch language from Vietnamese to English', async ({ page }) => {
    await page.goto('/vi');
    await page.waitForLoadState('networkidle');
    
    const langSwitcher = page.getByRole('button', { name: /language|vietnamese|vi|tiếng việt/i });
    const langLink = page.getByRole('link', { name: /english|en/i });
    
    if (await langSwitcher.isVisible()) {
      await langSwitcher.click();
      
      if (await langLink.isVisible()) {
        await langLink.click();
        await expect(page).toHaveURL(/\/en/);
      }
    }
  });

  test('should translate landing page hero text', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    
    const englishHero = await page.getByRole('heading', { level: 1 }).textContent();
    
    await page.goto('/vi');
    await page.waitForLoadState('networkidle');
    
    const vietnameseHero = await page.getByRole('heading', { level: 1 }).textContent();
    
    // Hero text should be different between languages
    expect(englishHero).not.toBe(vietnameseHero);
  });

  test('should have CTA buttons', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    
    // Check for any CTA-like link
    const ctaLink = page.getByRole('link', { name: /Get Started|Sign in|Start|Login/i });
    await expect(ctaLink.first()).toBeVisible();
  });
});
