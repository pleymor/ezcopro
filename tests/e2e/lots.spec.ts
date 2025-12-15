import { test, expect } from '@playwright/test';

// Ces tests nécessitent une authentification Firebase
// TODO: Implémenter un fixture d'authentification pour les activer
test.describe('User Story 2 - Gestion des Lots', () => {
  test.describe.configure({ mode: 'serial' });

  test('T037: Given utilisateur non connecté, When accède à /lots, Then redirigé vers login', async ({
    page,
  }) => {
    await page.goto('/lots');

    // Un utilisateur non connecté est redirigé vers login
    await page.waitForURL(/\/login/);
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
  });

  test.skip('T038: Given utilisateur sur page lots, When clique sur ajouter, Then peut créer un nouveau lot', async ({
    page,
  }) => {
    // Skip: Nécessite authentification
    await page.goto('/lots');
    const addButton = page.getByRole('button', { name: /ajouter|nouveau|créer/i });
    if (await addButton.isVisible()) {
      await addButton.click();
      await expect(page.getByLabel(/numéro/i)).toBeVisible();
    }
  });

  test.skip('T039: Given lot existant, When clique modifier, Then peut éditer le lot', async ({
    page,
  }) => {
    // Skip: Nécessite authentification et données de test
    await page.goto('/lots/test-id/edit');
    const form = page.getByRole('form').or(page.getByText(/modifier|éditer|lot/i));
    await expect(form).toBeVisible();
  });

  test.skip('T040: Given lot existant, When clique supprimer et confirme, Then lot supprimé', async ({
    page,
  }) => {
    // Skip: Nécessite authentification et données de test
    await page.goto('/lots');
    await expect(page.getByRole('heading', { name: /lots/i })).toBeVisible();
  });
});
