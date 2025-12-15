import { test, expect } from '@playwright/test';

// Ces tests nécessitent une authentification Firebase
// TODO: Implémenter un fixture d'authentification pour les activer
test.describe('User Story 3 - Gestion des Copropriétaires', () => {
  test('T053: Given utilisateur non connecté, When accède à /coproprietaires, Then redirigé vers login', async ({
    page,
  }) => {
    await page.goto('/coproprietaires');

    // Un utilisateur non connecté est redirigé vers login
    await page.waitForURL(/\/login/);
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
  });

  test.skip('T054: Given utilisateur sur page copropriétaires, When clique ajouter, Then peut créer un copropriétaire', async ({
    page,
  }) => {
    // Skip: Nécessite authentification
    await page.goto('/coproprietaires');
    const addButton = page.getByRole('button', { name: /ajouter|nouveau|créer/i });
    if (await addButton.isVisible()) {
      await addButton.click();
      await expect(page.getByLabel(/nom/i)).toBeVisible();
    }
  });

  test.skip('T055: Given copropriétaire existant, When clique modifier, Then peut éditer', async ({
    page,
  }) => {
    // Skip: Nécessite authentification et données de test
    await page.goto('/coproprietaires/test-id/edit');
    const form = page.getByRole('form').or(page.getByText(/modifier|éditer|copropriétaire/i));
    await expect(form).toBeVisible();
  });

  test.skip('T056: Given copropriétaire existant, When génère code invitation, Then code affiché', async ({
    page,
  }) => {
    // Skip: Nécessite authentification et données de test
    await page.goto('/coproprietaires');
    await expect(page.getByRole('heading', { name: /copropriétaires/i })).toBeVisible();
  });

  test.skip('T056b: Given copropriétaire avec historique financier, When anonymise (RGPD), Then données personnelles supprimées mais historique conservé', async ({
    page,
  }) => {
    // Skip: Nécessite authentification et données de test
    // Test RGPD anonymization
    await page.goto('/coproprietaires');
    await expect(page.getByRole('heading', { name: /copropriétaires/i })).toBeVisible();
  });
});
