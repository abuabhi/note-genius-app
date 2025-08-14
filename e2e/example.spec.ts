import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  
  // Should redirect to login if not authenticated
  await expect(page).toHaveURL(/.*\/login/);
  
  // Check if login form is present
  await expect(page.locator('form')).toBeVisible();
});

test('navigation works when authenticated', async ({ page }) => {
  // This is a placeholder test - in real scenarios you'd mock authentication
  // or use a test user account
  await page.goto('/dashboard');
  
  // Should redirect to login if not authenticated
  await expect(page).toHaveURL(/.*\/login/);
});