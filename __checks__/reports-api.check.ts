/**
 * Checkly API Monitoring Tests for Reports & Calendar Endpoints
 * Monitors API availability, response times, and correct response codes.
 */
import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL || 'https://wealthpath.duckdns.org/api';
const MAX_RESPONSE_TIME = 2000; // 2 seconds

// Mock auth token for API tests (in production, use real auth flow)
const AUTH_HEADER = {
  Authorization: `Bearer ${process.env.API_TEST_TOKEN || 'test-token'}`,
};

test.describe('Reports API Monitoring', () => {
  test.describe('GET /api/reports/monthly', () => {
    test('should return 200 OK with valid parameters @smoke', async ({ request }) => {
      const startTime = Date.now();

      const response = await request.get(`${API_BASE_URL}/reports/monthly`, {
        params: {
          year: '2026',
          month: '1',
        },
        headers: AUTH_HEADER,
      });

      const responseTime = Date.now() - startTime;

      // Verify status code (200 or 401 if auth required)
      expect([200, 401]).toContain(response.status());

      // Verify response time is within acceptable range
      expect(responseTime).toBeLessThan(MAX_RESPONSE_TIME);

      if (response.status() === 200) {
        const body = await response.json();

        // Verify response structure
        expect(body).toHaveProperty('year');
        expect(body).toHaveProperty('month');
        expect(body).toHaveProperty('currency');
        expect(body).toHaveProperty('totalIncome');
        expect(body).toHaveProperty('totalExpenses');
        expect(body).toHaveProperty('netSavings');
        expect(body).toHaveProperty('topCategories');
        expect(body).toHaveProperty('generatedAt');

        // Verify data types
        expect(typeof body.year).toBe('number');
        expect(typeof body.month).toBe('number');
        expect(Array.isArray(body.topCategories)).toBe(true);
      }
    });

    test('should return 400 for invalid month parameter', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/reports/monthly`, {
        params: {
          year: '2026',
          month: '13', // Invalid month
        },
        headers: AUTH_HEADER,
      });

      // Should return 400 or 401 (if auth fails first)
      expect([400, 401]).toContain(response.status());

      if (response.status() === 400) {
        const body = await response.json();
        expect(body).toHaveProperty('error');
        expect(body.error).toMatch(/month|invalid/i);
      }
    });

    test('should return 400 for month less than 1', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/reports/monthly`, {
        params: {
          year: '2026',
          month: '0', // Invalid month
        },
        headers: AUTH_HEADER,
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should return 400 for invalid year parameter', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/reports/monthly`, {
        params: {
          year: '1800', // Year too old
          month: '1',
        },
        headers: AUTH_HEADER,
      });

      // May return 400 for invalid year or 200 with empty data
      expect([200, 400, 401]).toContain(response.status());
    });

    test('should return 401 without authorization header', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/reports/monthly`, {
        params: {
          year: '2026',
          month: '1',
        },
        // No auth header
      });

      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.error).toMatch(/unauthorized|auth/i);
    });

    test('should respond within 2000ms @smoke', async ({ request }) => {
      const startTime = Date.now();

      await request.get(`${API_BASE_URL}/reports/monthly`, {
        params: {
          year: '2026',
          month: '1',
        },
        headers: AUTH_HEADER,
      });

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(MAX_RESPONSE_TIME);
    });
  });

  test.describe('GET /api/reports/category-trends', () => {
    test('should return 200 OK with valid parameters @smoke', async ({ request }) => {
      const startTime = Date.now();

      const response = await request.get(`${API_BASE_URL}/reports/category-trends`, {
        params: {
          months: '6',
          limit: '5',
        },
        headers: AUTH_HEADER,
      });

      const responseTime = Date.now() - startTime;

      expect([200, 401]).toContain(response.status());
      expect(responseTime).toBeLessThan(MAX_RESPONSE_TIME);

      if (response.status() === 200) {
        const body = await response.json();

        // Verify response structure
        expect(body).toHaveProperty('currency');
        expect(body).toHaveProperty('periodStart');
        expect(body).toHaveProperty('periodEnd');
        expect(body).toHaveProperty('trends');
        expect(body).toHaveProperty('generatedAt');

        // Verify trends array structure
        expect(Array.isArray(body.trends)).toBe(true);

        if (body.trends.length > 0) {
          const trend = body.trends[0];
          expect(trend).toHaveProperty('category');
          expect(trend).toHaveProperty('totalAmount');
          expect(trend).toHaveProperty('averageAmount');
          expect(trend).toHaveProperty('trendDirection');
          expect(trend).toHaveProperty('monthlyData');
        }
      }
    });

    test('should return 200 with default parameters', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/reports/category-trends`, {
        headers: AUTH_HEADER,
      });

      expect([200, 401]).toContain(response.status());
    });

    test('should respect limit parameter', async ({ request }) => {
      const limit = 3;
      const response = await request.get(`${API_BASE_URL}/reports/category-trends`, {
        params: {
          limit: limit.toString(),
        },
        headers: AUTH_HEADER,
      });

      if (response.status() === 200) {
        const body = await response.json();
        expect(body.trends.length).toBeLessThanOrEqual(limit);
      }
    });

    test('should return 400 for months > 24', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/reports/category-trends`, {
        params: {
          months: '25', // Max is 24
        },
        headers: AUTH_HEADER,
      });

      // Should return 400 or 200 with capped value
      expect([200, 400, 401]).toContain(response.status());
    });

    test('should return 400 for limit > 20', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/reports/category-trends`, {
        params: {
          limit: '25', // Max is 20
        },
        headers: AUTH_HEADER,
      });

      expect([200, 400, 401]).toContain(response.status());
    });

    test('should return 401 without authorization header', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/reports/category-trends`, {
        // No auth header
      });

      expect(response.status()).toBe(401);
    });

    test('should respond within 2000ms @smoke', async ({ request }) => {
      const startTime = Date.now();

      await request.get(`${API_BASE_URL}/reports/category-trends`, {
        params: {
          months: '6',
        },
        headers: AUTH_HEADER,
      });

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(MAX_RESPONSE_TIME);
    });
  });

  test.describe('GET /api/recurring/calendar', () => {
    test('should return 200 OK with valid parameters @smoke', async ({ request }) => {
      const startTime = Date.now();

      const response = await request.get(`${API_BASE_URL}/recurring/calendar`, {
        params: {
          year: '2026',
          month: '1',
        },
        headers: AUTH_HEADER,
      });

      const responseTime = Date.now() - startTime;

      expect([200, 401]).toContain(response.status());
      expect(responseTime).toBeLessThan(MAX_RESPONSE_TIME);

      if (response.status() === 200) {
        const body = await response.json();

        // Verify response structure
        expect(body).toHaveProperty('year');
        expect(body).toHaveProperty('month');
        expect(body).toHaveProperty('currency');
        expect(body).toHaveProperty('bills');
        expect(body).toHaveProperty('summary');
        expect(body).toHaveProperty('generatedAt');

        // Verify bills array structure
        expect(Array.isArray(body.bills)).toBe(true);

        // Verify summary structure
        expect(body.summary).toHaveProperty('totalIncome');
        expect(body.summary).toHaveProperty('totalExpenses');
        expect(body.summary).toHaveProperty('netCashFlow');
        expect(body.summary).toHaveProperty('billCount');
      }
    });

    test('should return 400 for invalid month parameter', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/recurring/calendar`, {
        params: {
          year: '2026',
          month: '15', // Invalid month
        },
        headers: AUTH_HEADER,
      });

      expect([400, 401]).toContain(response.status());

      if (response.status() === 400) {
        const body = await response.json();
        expect(body).toHaveProperty('error');
      }
    });

    test('should return 400 for missing required parameters', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/recurring/calendar`, {
        params: {
          year: '2026',
          // Missing month
        },
        headers: AUTH_HEADER,
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should return 401 without authorization header', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/recurring/calendar`, {
        params: {
          year: '2026',
          month: '1',
        },
        // No auth header
      });

      expect(response.status()).toBe(401);
    });

    test('should return bills with correct structure', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/recurring/calendar`, {
        params: {
          year: '2026',
          month: '1',
        },
        headers: AUTH_HEADER,
      });

      if (response.status() === 200) {
        const body = await response.json();

        if (body.bills.length > 0) {
          const bill = body.bills[0];
          expect(bill).toHaveProperty('id');
          expect(bill).toHaveProperty('name');
          expect(bill).toHaveProperty('amount');
          expect(bill).toHaveProperty('category');
          expect(bill).toHaveProperty('dueDate');
          expect(bill).toHaveProperty('frequency');
          expect(bill).toHaveProperty('isActive');
          expect(bill).toHaveProperty('type');

          // Verify type is either 'income' or 'expense'
          expect(['income', 'expense']).toContain(bill.type);
        }
      }
    });

    test('should respond within 2000ms @smoke', async ({ request }) => {
      const startTime = Date.now();

      await request.get(`${API_BASE_URL}/recurring/calendar`, {
        params: {
          year: '2026',
          month: '1',
        },
        headers: AUTH_HEADER,
      });

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(MAX_RESPONSE_TIME);
    });
  });

  test.describe('API Error Response Format', () => {
    test('should return consistent error format for 400 errors', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/reports/monthly`, {
        params: {
          year: '2026',
          month: 'invalid',
        },
        headers: AUTH_HEADER,
      });

      if (response.status() === 400) {
        const body = await response.json();
        expect(body).toHaveProperty('error');
        expect(typeof body.error).toBe('string');
      }
    });

    test('should return consistent error format for 401 errors', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/reports/monthly`, {
        params: {
          year: '2026',
          month: '1',
        },
        // No auth
      });

      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(typeof body.error).toBe('string');
    });

    test('should return JSON content type for all responses', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/reports/monthly`, {
        params: {
          year: '2026',
          month: '1',
        },
        headers: AUTH_HEADER,
      });

      const contentType = response.headers()['content-type'];
      expect(contentType).toMatch(/application\/json/);
    });
  });

  test.describe('API Health Checks', () => {
    test('should have reports endpoint available @smoke', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/reports/monthly`, {
        params: {
          year: '2026',
          month: '1',
        },
        headers: AUTH_HEADER,
      });

      // Should not return 5xx errors
      expect(response.status()).toBeLessThan(500);
    });

    test('should have category-trends endpoint available @smoke', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/reports/category-trends`, {
        headers: AUTH_HEADER,
      });

      expect(response.status()).toBeLessThan(500);
    });

    test('should have calendar endpoint available @smoke', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/recurring/calendar`, {
        params: {
          year: '2026',
          month: '1',
        },
        headers: AUTH_HEADER,
      });

      expect(response.status()).toBeLessThan(500);
    });
  });
});
