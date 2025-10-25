import { test, expect } from '@playwright/test';

test.describe('Cards Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as business user
    await page.goto('/login');
    await page.fill('input[type="email"]', 'business@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
  });

  test('should display cards page', async ({ page }) => {
    await page.goto('/cards');
    await expect(page.locator('h1')).toContainText('Cartes');
    await expect(page.locator('[data-testid="card-grid"]')).toBeVisible();
  });

  test('should filter cards by category', async ({ page }) => {
    await page.goto('/cards');
    await page.click('button:has-text("Design")');
    await expect(page.locator('[data-testid="active-filter"]')).toContainText('Design');
  });

  test('should search for cards', async ({ page }) => {
    await page.goto('/cards');
    await page.fill('input[placeholder*="Rechercher"]', 'test');
    await page.waitForTimeout(500); // Wait for debounce
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('should toggle view mode', async ({ page }) => {
    await page.goto('/cards');
    await page.click('button[aria-label="Afficher en liste"]');
    await expect(page.locator('[data-testid="list-view"]')).toBeVisible();
    
    await page.click('button[aria-label="Afficher en grille"]');
    await expect(page.locator('[data-testid="grid-view"]')).toBeVisible();
  });

  test('should sort cards', async ({ page }) => {
    await page.goto('/cards');
    await page.selectOption('select[title="Trier les cartes"]', 'oldest');
    await expect(page.locator('select[title="Trier les cartes"]')).toHaveValue('oldest');
  });

  test('should like a card', async ({ page }) => {
    await page.goto('/cards');
    const firstCard = page.locator('[data-testid="card"]').first();
    const likeButton = firstCard.locator('button[aria-label*="Like"]');
    
    await likeButton.click();
    await expect(page.locator('.toast-success')).toBeVisible();
  });

  test('should create a new card', async ({ page }) => {
    await page.goto('/create-card');
    
    // Fill form
    await page.fill('input[name="title"]', 'Test Business Card');
    await page.fill('input[name="subtitle"]', 'Test Subtitle');
    await page.fill('textarea[name="description"]', 'This is a test business card');
    await page.fill('input[name="phone"]', '0612345678');
    await page.fill('input[name="email"]', 'test@business.com');
    await page.fill('input[name="web"]', 'https://example.com');
    
    // Address
    await page.fill('input[name="address.country"]', 'France');
    await page.fill('input[name="address.city"]', 'Paris');
    await page.fill('input[name="address.street"]', '123 Business St');
    await page.fill('input[name="address.houseNumber"]', '10');
    await page.fill('input[name="address.zip"]', '75008');
    
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/my-cards');
    await expect(page.locator('.toast-success')).toBeVisible();
  });

  test('should edit a card', async ({ page }) => {
    await page.goto('/my-cards');
    const firstCard = page.locator('[data-testid="card"]').first();
    await firstCard.locator('button[aria-label="Éditer"]').click();
    
    await page.fill('input[name="title"]', 'Updated Card Title');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(firstCard).toContainText('Updated Card Title');
  });

  test('should delete a card', async ({ page }) => {
    await page.goto('/my-cards');
    const cardCount = await page.locator('[data-testid="card"]').count();
    
    const firstCard = page.locator('[data-testid="card"]').first();
    await firstCard.locator('button[aria-label="Supprimer"]').click();
    
    // Confirm deletion
    await page.click('button:has-text("Confirmer")');
    
    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(page.locator('[data-testid="card"]')).toHaveCount(cardCount - 1);
  });
});
