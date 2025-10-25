import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.click('text=Connexion');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h1')).toContainText('Connexion');
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.click('text=Connexion');
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/cards');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.click('text=Connexion');
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.toast-error')).toBeVisible();
  });

  test('should register new user', async ({ page }) => {
    await page.click('text=Inscription');
    await page.fill('input[name="name.first"]', 'John');
    await page.fill('input[name="name.last"]', 'Doe');
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="phone"]', '0612345678');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    
    // Address
    await page.fill('input[name="address.country"]', 'France');
    await page.fill('input[name="address.city"]', 'Paris');
    await page.fill('input[name="address.street"]', '123 Main St');
    await page.fill('input[name="address.houseNumber"]', '42');
    await page.fill('input[name="address.zip"]', '75001');
    
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/login');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.click('text=Connexion');
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Déconnexion');
    await expect(page).toHaveURL('/');
  });
});
