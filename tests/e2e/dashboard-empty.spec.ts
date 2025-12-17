import { test, expect } from '@playwright/test';

test.describe('Dashboard - État vide', () => {
  test.describe('User Story 1 - Affichage état vide', () => {
    test.beforeEach(async ({ page }) => {
      // Nettoyer le localStorage pour simuler un nouvel utilisateur
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.removeItem('ezcopro_selected_copro_id');
        localStorage.removeItem('ezcopro_selected_copro');
        // Activer le mode test "empty" (sans copropriété)
        localStorage.setItem('ezcopro_test_empty_mode', 'true');
      });
    });

    test('T001: Given utilisateur sans copropriété, When accède au dashboard, Then voit état vide avec message d\'accueil', async ({
      page,
    }) => {
      // Given: utilisateur connecté sans copropriété
      await page.goto('/dashboard');

      // Then: voit un message d'accueil invitant à créer une copropriété
      await expect(page.getByRole('heading', { name: /bienvenue/i })).toBeVisible();
      await expect(page.getByText(/première copropriété/i).first()).toBeVisible();
    });

    test('T002: Given utilisateur sans copropriété, When accède au dashboard, Then voit bouton création vers onboarding', async ({
      page,
    }) => {
      // Given: utilisateur connecté sans copropriété
      await page.goto('/dashboard');

      // Then: voit un bouton clairement visible pour créer une copropriété
      const createButton = page.getByRole('link', { name: /créer.*copropriété/i });
      await expect(createButton).toBeVisible();
      await expect(createButton).toHaveAttribute('href', '/onboarding');
    });

    test('T003: Given utilisateur sans copropriété, When clique sur bouton création, Then redirigé vers onboarding', async ({
      page,
    }) => {
      // Given: utilisateur connecté sans copropriété sur le dashboard
      await page.goto('/dashboard');

      // When: clique sur le bouton de création
      await page.getByRole('link', { name: /créer.*copropriété/i }).click();

      // Then: est redirigé vers la page d'onboarding
      await expect(page).toHaveURL('/onboarding');
    });
  });

  test.describe('User Story 2 - Transition vers dashboard normal', () => {
    test('T008: Given utilisateur avec copropriété, When accède au dashboard, Then voit dashboard normal', async ({
      page,
    }) => {
      // Given: utilisateur avec au moins une copropriété (mode test par défaut)
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.removeItem('ezcopro_test_empty_mode');
      });

      // When: accède au dashboard
      await page.goto('/dashboard');

      // Then: voit le dashboard normal avec les liens rapides (utiliser les cartes)
      await expect(page.getByRole('heading', { name: 'Lots' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Copropriétaires' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Finances' })).toBeVisible();
    });
  });

  test.describe('Edge Cases - Gestion des erreurs', () => {
    test('T012: Given erreur de chargement, When accède au dashboard, Then voit message d\'erreur avec bouton réessayer', async ({
      page,
    }) => {
      // Given: simuler une erreur de chargement
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('ezcopro_test_error_mode', 'true');
      });

      // When: accède au dashboard
      await page.goto('/dashboard');

      // Then: voit un message d'erreur avec option de réessayer
      await expect(page.getByRole('heading', { name: /erreur/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /réessayer/i })).toBeVisible();
    });
  });
});
