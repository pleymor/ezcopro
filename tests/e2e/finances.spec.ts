import { test, expect } from '@playwright/test';

// Ces tests nécessitent une authentification Firebase
// TODO: Implémenter un fixture d'authentification pour les activer
test.describe('Finances - Appels de fonds et Paiements', () => {
  test('Given utilisateur non connecté, When accède à /finances, Then redirigé vers login', async ({
    page,
  }) => {
    await page.goto('/finances');

    // Un utilisateur non connecté est redirigé vers login
    await page.waitForURL(/\/login/);
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
  });

  test.describe('Appels de fonds', () => {
    test.skip('affiche la liste des appels de fonds', async ({ page }) => {
      // Skip: Nécessite authentification
      await page.goto('/finances');
      await expect(page.getByRole('heading', { name: /finances/i })).toBeVisible();
    });

    test.skip('permet de créer un nouvel appel de fonds', async ({ page }) => {
      // Skip: Nécessite authentification
      await page.goto('/finances/appels/new');
      await page.getByLabel(/libellé/i).fill('Charges Q1 2024');
    });

    test.skip('affiche les détails d\'un appel avec répartitions', async ({ page }) => {
      // Skip: Nécessite authentification et données de test
      await page.goto('/finances/appels/test-appel-1');
      await expect(page.getByText(/charges/i)).toBeVisible();
    });

    test.skip('calcule correctement les répartitions au prorata des tantièmes', async ({ page }) => {
      // Skip: Nécessite authentification et données de test
      await page.goto('/finances/appels/new');
    });

    test.skip('permet de supprimer un appel de fonds', async ({ page }) => {
      // Skip: Nécessite authentification et données de test
      await page.goto('/finances/appels/test-appel-1');
    });
  });

  test.describe('Paiements', () => {
    test.skip('affiche la liste des paiements', async ({ page }) => {
      // Skip: Nécessite authentification
      await page.goto('/finances');
      await page.getByRole('tab', { name: /paiements/i }).click();
    });

    test.skip('permet d\'enregistrer un nouveau paiement', async ({ page }) => {
      // Skip: Nécessite authentification
      await page.goto('/finances/paiements/new');
    });

    test.skip('permet de modifier un paiement existant', async ({ page }) => {
      // Skip: Nécessite authentification et données de test
      await page.goto('/finances/paiements/test-paiement-1/edit');
    });

    test.skip('permet de supprimer un paiement', async ({ page }) => {
      // Skip: Nécessite authentification et données de test
      await page.goto('/finances/paiements/test-paiement-1/edit');
    });

    test.skip('affiche le solde du copropriétaire après paiement', async ({ page }) => {
      // Skip: Nécessite authentification
      await page.goto('/finances');
    });
  });

  test.describe('Validation des données', () => {
    test.skip('refuse un montant négatif pour un appel', async ({ page }) => {
      // Skip: Nécessite authentification
      await page.goto('/finances/appels/new');
    });

    test.skip('refuse un montant avec plus de 2 décimales', async ({ page }) => {
      // Skip: Nécessite authentification
      await page.goto('/finances/appels/new');
    });

    test.skip('refuse un paiement sans copropriétaire sélectionné', async ({ page }) => {
      // Skip: Nécessite authentification
      await page.goto('/finances/paiements/new');
    });
  });
});
