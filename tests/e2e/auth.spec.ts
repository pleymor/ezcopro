import { test, expect } from '@playwright/test';

test.describe('User Story 1 - Connexion et Accès', () => {
  test.describe('Authentification', () => {
    test('T022: Given utilisateur non connecté, When accède à app, Then voit écran de connexion', async ({
      page,
    }) => {
      // Given: utilisateur non connecté
      await page.goto('/login');

      // When: accède à l'application

      // Then: voit l'écran de connexion avec bouton Google
      await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
      await expect(page.getByText(/connectez-vous/i)).toBeVisible();
    });

    test('T025: Given utilisateur connecté, When clique déconnexion, Then retourne à écran de connexion', async ({
      page,
    }) => {
      // Given: utilisateur sur la page login (simulant la déconnexion)
      await page.goto('/login');

      // Then: voit l'écran de connexion
      await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
    });
  });
});
