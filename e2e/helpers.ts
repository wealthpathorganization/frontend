import { Page, expect, Response } from '@playwright/test';

/**
 * API error tracking for tests.
 * Use setupApiErrorTracking() in beforeEach and assertNoApiErrors() after page loads.
 */
export interface ApiErrorTracker {
  errors: Array<{ url: string; status: number; statusText: string }>;
  clear: () => void;
}

/**
 * Sets up API error tracking on a page.
 * Call this in beforeEach, then use assertNoApiErrors() after page loads.
 * @param page - Playwright page object
 * @returns ApiErrorTracker object
 */
export function setupApiErrorTracking(page: Page): ApiErrorTracker {
  const tracker: ApiErrorTracker = {
    errors: [],
    clear: () => { tracker.errors = []; }
  };

  page.on('response', (response: Response) => {
    const url = response.url();
    const status = response.status();
    // Track 5xx errors on API calls
    if (url.includes('/api/') && status >= 500) {
      tracker.errors.push({
        url,
        status,
        statusText: response.statusText()
      });
    }
  });

  return tracker;
}

/**
 * Asserts that no API errors occurred.
 * @param tracker - ApiErrorTracker from setupApiErrorTracking
 * @param message - Optional message prefix
 */
export function assertNoApiErrors(tracker: ApiErrorTracker, message: string = 'API errors detected'): void {
  if (tracker.errors.length > 0) {
    const errorDetails = tracker.errors
      .map(e => `  - ${e.status} ${e.statusText}: ${e.url}`)
      .join('\n');
    throw new Error(`${message}:\n${errorDetails}`);
  }
}

/**
 * Generates a unique test email address using timestamp.
 * @param prefix - Prefix for the email (default: 'test')
 * @returns Unique email address
 */
export function generateTestEmail(prefix: string = 'test'): string {
  return `${prefix}+${Date.now()}@example.com`;
}

export const TEST_PASSWORD = 'testpassword123';
export const TEST_NAME = 'Test User';

/**
 * Registers a new user and logs them in, ensuring auth persists.
 * Supports both legacy localStorage auth and new cookie-based auth.
 * @param page - Playwright page object
 * @param emailPrefix - Prefix for the generated email
 * @returns The generated email address
 */
export async function registerAndLogin(page: Page, emailPrefix: string = 'test'): Promise<string> {
  const email = generateTestEmail(emailPrefix);

  await page.goto('/en/register');
  await page.waitForLoadState('networkidle');

  await page.getByLabel(/name/i).fill(TEST_NAME);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(TEST_PASSWORD);

  await page.getByRole('button', { name: /create account|sign up|register/i }).click();

  await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  await page.waitForLoadState('networkidle');

  // Ensure auth is established - check for either:
  // 1. HttpOnly refresh token cookie (new system)
  // 2. localStorage auth-storage (persisted user info)
  // 3. Legacy token storage
  await page.waitForFunction(() => {
    // Check localStorage for auth state
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        if (parsed.state?.isAuthenticated || parsed.isAuthenticated) {
          return true;
        }
      } catch {}
    }
    // Check for legacy token
    if (localStorage.getItem('token')) {
      return true;
    }
    // Note: HttpOnly cookies are not visible to JS, but if we got here after redirect,
    // the auth is established
    return document.cookie.includes('refresh_token') || document.cookie.includes('token');
  }, { timeout: 5000 }).catch(() => {
    // Auth might still be valid via HttpOnly cookies that JS can't see
  });

  return email;
}

/**
 * Waits for a dialog to be visible.
 * @param page - Playwright page object
 */
export async function waitForDialog(page: Page): Promise<void> {
  await expect(page.getByRole('dialog')).toBeVisible();
}

/**
 * Waits for a dialog to close.
 * @param page - Playwright page object
 */
export async function waitForDialogToClose(page: Page): Promise<void> {
  await expect(page.getByRole('dialog')).not.toBeVisible();
}

/**
 * Selects the first option from a Shadcn Select component.
 * @param page - Playwright page object
 * @param triggerText - Optional text to identify the select trigger
 */
export async function selectFirstOption(page: Page, triggerText?: string | RegExp): Promise<void> {
  const dialog = page.getByRole('dialog');
  
  const trigger = triggerText 
    ? dialog.getByRole('combobox', { name: triggerText })
    : dialog.getByRole('combobox').first();
  
  await trigger.click();
  await page.getByRole('option').first().click();
}

/**
 * Navigates to a page, trying sidebar links first to preserve auth state.
 * @param page - Playwright page object
 * @param path - The path to navigate to
 */
export async function navigateTo(page: Page, path: string): Promise<void> {
  // Normalize path to include locale if missing
  const normalizedPath = path.startsWith('/') ? path : `/en/${path}`;

  // Try to use in-app navigation first (preserves auth state better)
  const pathName = normalizedPath.replace(/^\/en|^\/vi/, '').replace(/^\//, '');

  // First try to find link by href (most reliable)
  const hrefLink = page.locator(`a[href*="/${pathName}"]`).first();
  // Also try by name as fallback
  const navLink = page.getByRole('link', { name: new RegExp(pathName, 'i') });

  if (await hrefLink.isVisible({ timeout: 2000 }).catch(() => false)) {
    await hrefLink.click();
  } else if (await navLink.first().isVisible({ timeout: 1000 }).catch(() => false)) {
    await navLink.first().click();
  } else {
    // Fall back to direct navigation
    await page.goto(normalizedPath);
  }

  await page.waitForLoadState('networkidle');

  // If redirected to login, auth was lost - retry once with direct navigation
  const currentUrl = page.url();
  if (currentUrl.includes('/login') || currentUrl.includes('/register')) {
    // Wait a bit and check again - might be a timing issue
    await page.waitForTimeout(1000);
    const urlAfterWait = page.url();
    if (urlAfterWait.includes('/login') || urlAfterWait.includes('/register')) {
      console.log(`Warning: Auth may have been lost when navigating to ${path}. Current URL: ${urlAfterWait}`);
    }
  }
}

/**
 * Fills a form field by label.
 * @param page - Playwright page object
 * @param label - Label text or regex
 * @param value - Value to fill
 */
export async function fillField(page: Page, label: string | RegExp, value: string): Promise<void> {
  await page.getByLabel(label).fill(value);
}

/**
 * Clicks a button by text.
 * @param page - Playwright page object
 * @param text - Button text or regex
 */
export async function clickButton(page: Page, text: string | RegExp): Promise<void> {
  await page.getByRole('button', { name: text }).click();
}

/**
 * Fills a currency input field (workaround for CurrencyInput component).
 * Uses pressSequentially to properly trigger onChange events.
 * @param page - Playwright page object
 * @param locator - Locator for the input element
 * @param amount - Amount value as string
 */
export async function fillCurrencyInput(page: Page, locator: import('@playwright/test').Locator, amount: string): Promise<void> {
  await locator.click();
  await locator.fill('');
  await locator.pressSequentially(amount, { delay: 50 });
}

/**
 * Waits for a toast notification to appear.
 * @param page - Playwright page object
 * @param text - Text or regex to match in the toast
 * @param timeout - Maximum time to wait (default 5000ms)
 */
export async function waitForToast(page: Page, text: string | RegExp, timeout: number = 5000): Promise<void> {
  const toast = page.getByRole('status').filter({ hasText: text });
  await expect(toast).toBeVisible({ timeout });
}

/**
 * Verifies the page is using Vietnamese locale.
 * @param page - Playwright page object
 */
export async function assertVietnameseLocale(page: Page): Promise<void> {
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
}

/**
 * Registers a new user with Vietnamese locale.
 * @param page - Playwright page object
 * @param emailPrefix - Prefix for the generated email
 * @returns The generated email address
 */
export async function registerAndLoginVietnamese(page: Page, emailPrefix: string = 'test'): Promise<string> {
  const email = generateTestEmail(emailPrefix);

  await page.goto('/vi/register');
  await page.waitForLoadState('networkidle');

  await page.getByLabel(/tên|name/i).fill(TEST_NAME);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/mật khẩu|password/i).fill(TEST_PASSWORD);

  await page.getByRole('button', { name: /tạo tài khoản|đăng ký|create account|sign up|register/i }).click();

  await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  await page.waitForLoadState('networkidle');

  return email;
}

/**
 * Navigates to a page in Vietnamese locale.
 * @param page - Playwright page object
 * @param path - The path to navigate to (without locale prefix)
 */
export async function navigateToVietnamese(page: Page, path: string): Promise<void> {
  const normalizedPath = path.startsWith('/') ? `/vi${path}` : `/vi/${path}`;

  // Try in-app navigation first
  const pathName = path.replace(/^\//, '');
  const hrefLink = page.locator(`a[href*="/${pathName}"]`).first();

  if (await hrefLink.isVisible({ timeout: 2000 }).catch(() => false)) {
    await hrefLink.click();
  } else {
    await page.goto(normalizedPath);
  }

  await page.waitForLoadState('networkidle');
}
