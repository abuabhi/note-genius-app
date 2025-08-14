import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Check if login form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check for sign up link
    await expect(page.locator('text=Sign up')).toBeVisible();
  });

  test('signup page loads correctly', async ({ page }) => {
    await page.goto('/signup');
    
    // Check if signup form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check for login link
    await expect(page.locator('text=Log in')).toBeVisible();
  });

  test('redirects to login when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('shows validation errors for invalid email', async ({ page }) => {
    await page.goto('/login');
    
    // Fill invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Check for validation error
    await expect(page.locator('text=Invalid email')).toBeVisible();
  });

  test('shows validation errors for short password', async ({ page }) => {
    await page.goto('/signup');
    
    // Fill short password
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');
    
    // Check for validation error
    await expect(page.locator('text=Password must be at least')).toBeVisible();
  });

  test('navigation between login and signup works', async ({ page }) => {
    await page.goto('/login');
    
    // Navigate to signup
    await page.click('text=Sign up');
    await expect(page).toHaveURL(/.*\/signup/);
    
    // Navigate back to login
    await page.click('text=Log in');
    await expect(page).toHaveURL(/.*\/login/);
  });
});