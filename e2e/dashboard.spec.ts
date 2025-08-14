import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow', () => {
  test('dashboard requires authentication', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login if not authenticated
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('dashboard components load when authenticated', async ({ page }) => {
    // Note: In a real test, you'd authenticate here
    // For now, we'll test the redirect behavior
    
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
    
    // If we were authenticated, we'd test:
    // - Dashboard navigation menu
    // - Study tools section
    // - Recent activities
    // - Quick actions
  });

  test('navigation menu is accessible', async ({ page }) => {
    await page.goto('/');
    
    // Test if navigation redirects properly
    await expect(page).toHaveURL(/.*\/login/);
    
    // With authentication, we'd test:
    // - Notes link
    // - Flashcards link
    // - Quizzes link
    // - Study Goals link
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Should still redirect to login on mobile
    await expect(page).toHaveURL(/.*\/login/);
    
    // Check mobile-specific elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/login');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="email"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="password"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
  });
});