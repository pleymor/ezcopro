import { test, expect } from './fixtures/auth';

test.describe('Obligations légales page', () => {

  // T005 [US1]: Page accessible after login
  test('should be accessible after login', async ({ authedPage }) => {
    await authedPage.goto('/ressources/obligations-legales');
    await expect(authedPage).toHaveURL('/ressources/obligations-legales');
    await expect(authedPage.locator('h1')).toContainText('Obligations légales');
  });

  // T006 [US1]: All 5 categories displayed
  test('should display all 5 categories of obligations', async ({ authedPage }) => {
    await authedPage.goto('/ressources/obligations-legales');

    // Check all 5 categories are present
    await expect(authedPage.locator('text=Obligations comptables')).toBeVisible();
    await expect(authedPage.locator('text=Assemblées générales')).toBeVisible();
    await expect(authedPage.locator('text=Obligations d\'assurance')).toBeVisible();
    await expect(authedPage.locator('text=Obligations administratives')).toBeVisible();
    await expect(authedPage.locator('text=Conservation des documents')).toBeVisible();
  });

  // T012 [US2]: Table of contents displays all 5 sections
  test('should display table of contents with all sections', async ({ authedPage }) => {
    await authedPage.goto('/ressources/obligations-legales');

    const toc = authedPage.locator('[data-testid="table-of-contents"]');
    await expect(toc).toBeVisible();

    // Check all links in TOC
    await expect(toc.locator('a[href="#comptabilite"]')).toBeVisible();
    await expect(toc.locator('a[href="#assemblees"]')).toBeVisible();
    await expect(toc.locator('a[href="#assurance"]')).toBeVisible();
    await expect(toc.locator('a[href="#administratif"]')).toBeVisible();
    await expect(toc.locator('a[href="#documents"]')).toBeVisible();
  });

  // T013 [US2]: Clicking TOC link scrolls to section
  test('should scroll to section when clicking TOC link', async ({ authedPage }) => {
    await authedPage.goto('/ressources/obligations-legales');

    // Click on a TOC link
    await authedPage.click('a[href="#assemblees"]');

    // Wait for scroll
    await authedPage.waitForTimeout(500);

    // Verify the section is in viewport
    const section = authedPage.locator('#assemblees');
    await expect(section).toBeInViewport();
  });

  // T020 [US3]: Legal references displayed
  test('should display legal references for obligations', async ({ authedPage }) => {
    await authedPage.goto('/ressources/obligations-legales');

    // Check that legal references are visible
    await expect(authedPage.locator('text=Art. 14-3 loi 1965')).toBeVisible();
    await expect(authedPage.locator('text=Art. 18 loi 1965')).toBeVisible();
  });

  // T027: Dark mode toggle works
  test('should support dark mode', async ({ authedPage }) => {
    await authedPage.goto('/ressources/obligations-legales');

    // Find and click theme toggle
    const themeToggle = authedPage.locator('[data-testid="theme-toggle"]');
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      // Verify dark mode class is applied
      await expect(authedPage.locator('html')).toHaveClass(/dark/);
    }
  });
});
