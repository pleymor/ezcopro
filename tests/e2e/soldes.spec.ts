import { test, expect } from '@playwright/test';

// Ces tests nécessitent une authentification Firebase
// TODO: Implémenter un fixture d'authentification pour les activer
test.describe('US5 - Consultation des Soldes', () => {
  test('Given utilisateur non connecté, When accède à /soldes, Then redirigé vers login', async ({
    page,
  }) => {
    await page.goto('/soldes');

    // Un utilisateur non connecté est redirigé vers login
    await page.waitForURL(/\/login/);
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
  });

  test.describe('Vue d\'ensemble des soldes', () => {
    test.skip('affiche la page des soldes', async ({ page }) => {
      // Skip: Nécessite authentification
      await page.goto('/soldes');
      await expect(page.getByRole('heading', { name: /soldes/i })).toBeVisible();
    });

    test.skip('affiche le solde global de la copropriété', async ({ page }) => {
      // Skip: Nécessite authentification
      await page.goto('/soldes');
    });

    test.skip('affiche la liste des copropriétaires avec leurs soldes', async ({ page }) => {
      // Skip: Nécessite authentification et données de test
      await page.goto('/soldes');
    });

    test.skip('met en évidence les soldes débiteurs (en retard)', async ({ page }) => {
      // Skip: Nécessite authentification et données de test
      await page.goto('/soldes');
    });

    test.skip('permet de filtrer par état (tous, à jour, en retard)', async ({ page }) => {
      // Skip: Nécessite authentification
      await page.goto('/soldes');
    });

    test.skip('cliquer sur un filtre actualise la liste', async ({ page }) => {
      // Skip: Nécessite authentification
      await page.goto('/soldes');
    });
  });

  test.describe('Détail du solde par copropriétaire', () => {
    test.skip('affiche le détail en cliquant sur un copropriétaire', async ({ page }) => {
      // Skip: Nécessite authentification et données de test
      await page.goto('/soldes');
    });

    test.skip('affiche le récapitulatif des appels et paiements', async ({ page }) => {
      // Skip: Nécessite authentification et données de test
      await page.goto('/soldes/test-coproprietaire-1');
    });

    test.skip('calcule correctement le solde (dû - payé)', async ({ page }) => {
      // Skip: Nécessite authentification et données de test
      await page.goto('/soldes/test-coproprietaire-1');
    });
  });

  test.describe('Calculs des soldes', () => {
    test.skip('prend en compte tous les lots du copropriétaire', async ({ page }) => {
      // Skip: Nécessite authentification et données de test
      await page.goto('/soldes/test-coproprietaire-multi-lots');
    });

    test.skip('exclut les copropriétaires anonymisés des statistiques', async ({ page }) => {
      // Skip: Nécessite authentification et données de test
      await page.goto('/soldes');
    });
  });
});
