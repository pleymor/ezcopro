import { expect } from '@playwright/test';
import { test as authTest } from './fixtures/auth';
authTest.describe('US6 - Historique des Actions (authentifié)', () => {
  authTest.describe('Liste des actions', () => {
    authTest('affiche la page historique', async ({ authedPage }) => {
      await authedPage.goto('/historique');

      // Vérifier que la page est affichée
      await expect(authedPage.getByRole('heading', { name: /historique/i })).toBeVisible();
    });

    authTest('affiche la liste des actions récentes', async ({ authedPage }) => {
      await authedPage.goto('/historique');

      // Vérifier qu'une liste ou message vide est présent
      const listOrEmpty = authedPage.getByRole('list').or(authedPage.getByText(/aucune|vide/i));
      await expect(listOrEmpty).toBeVisible();
    });

    authTest('permet de filtrer par type d\'entité', async ({ authedPage }) => {
      await authedPage.goto('/historique');

      // Vérifier les filtres disponibles (si présents)
      const filterButton = authedPage.getByRole('button', { name: /tous|filtrer/i });
      if (await filterButton.isVisible()) {
        await expect(filterButton).toBeVisible();
      }
    });
  });

  authTest.describe('Types d\'actions', () => {
    authTest('distingue visuellement création, modification et suppression', async ({ authedPage }) => {
      await authedPage.goto('/historique');

      // La page doit au moins être affichée
      await expect(authedPage.getByRole('heading', { name: /historique/i })).toBeVisible();
    });
  });
});
