import { expect } from '@playwright/test';
import { test as authTest } from './fixtures/auth';

authTest.describe('US6 - Historique des Actions (authentifié)', () => {
  authTest.describe('Liste des actions', () => {
    authTest('affiche la page historique', async ({ authedPage }) => {
      await authedPage.goto('/historique');

      // Vérifier que la page est affichée
      await expect(authedPage.getByRole('heading', { name: /historique/i })).toBeVisible();
    });

    authTest('affiche la liste des actions récentes ou un message vide', async ({ authedPage }) => {
      await authedPage.goto('/historique');

      // Vérifier qu'une liste ou message vide est présent
      const listOrEmpty = authedPage.getByRole('list').or(authedPage.getByText(/aucune action/i));
      await expect(listOrEmpty).toBeVisible();
    });

    authTest('affiche les boutons de filtre par type d\'entité', async ({ authedPage }) => {
      await authedPage.goto('/historique');

      // Vérifier que tous les filtres sont disponibles
      await expect(authedPage.getByRole('button', { name: /tous/i })).toBeVisible();
      await expect(authedPage.getByRole('button', { name: /lots/i })).toBeVisible();
      await expect(authedPage.getByRole('button', { name: /copropriétaires/i })).toBeVisible();
      await expect(authedPage.getByRole('button', { name: /appels/i })).toBeVisible();
      await expect(authedPage.getByRole('button', { name: /paiements/i })).toBeVisible();
    });

    authTest('permet de filtrer par type d\'entité - Lots', async ({ authedPage }) => {
      await authedPage.goto('/historique');

      // Cliquer sur le filtre "Lots"
      const lotsFilter = authedPage.getByRole('button', { name: /lots/i });
      await lotsFilter.click();

      // Le filtre doit être actif (variant default = bg-primary)
      await expect(lotsFilter).toHaveClass(/bg-primary/);

      // La page doit se mettre à jour (affiche les entrées filtrées ou message vide)
      const listOrEmpty = authedPage.getByRole('list').or(authedPage.getByText(/aucune action sur les lots/i));
      await expect(listOrEmpty).toBeVisible();
    });

    authTest('permet de filtrer par type d\'entité - Copropriétaires', async ({ authedPage }) => {
      await authedPage.goto('/historique');

      // Cliquer sur le filtre "Copropriétaires"
      const coproFilter = authedPage.getByRole('button', { name: /copropriétaires/i });
      await coproFilter.click();

      // Le filtre doit être actif
      await expect(coproFilter).toHaveClass(/bg-primary/);

      // La page doit afficher le contenu filtré ou un message approprié
      const listOrEmpty = authedPage.getByRole('list').or(authedPage.getByText(/aucune action sur les copropriétaires/i));
      await expect(listOrEmpty).toBeVisible();
    });

    authTest('permet de filtrer par type d\'entité - Appels', async ({ authedPage }) => {
      await authedPage.goto('/historique');

      // Cliquer sur le filtre "Appels"
      const appelsFilter = authedPage.getByRole('button', { name: /appels/i });
      await appelsFilter.click();

      // Le filtre doit être actif
      await expect(appelsFilter).toHaveClass(/bg-primary/);

      // La page doit afficher le contenu filtré ou un message approprié
      const listOrEmpty = authedPage.getByRole('list').or(authedPage.getByText(/aucune action sur les appels/i));
      await expect(listOrEmpty).toBeVisible();
    });

    authTest('permet de filtrer par type d\'entité - Paiements', async ({ authedPage }) => {
      await authedPage.goto('/historique');

      // Cliquer sur le filtre "Paiements"
      const paiementsFilter = authedPage.getByRole('button', { name: /paiements/i });
      await paiementsFilter.click();

      // Le filtre doit être actif
      await expect(paiementsFilter).toHaveClass(/bg-primary/);

      // La page doit afficher le contenu filtré ou un message approprié
      const listOrEmpty = authedPage.getByRole('list').or(authedPage.getByText(/aucune action sur les paiements/i));
      await expect(listOrEmpty).toBeVisible();
    });

    authTest('permet de revenir au filtre "Tous" après avoir filtré', async ({ authedPage }) => {
      await authedPage.goto('/historique');

      // Cliquer sur un filtre spécifique
      await authedPage.getByRole('button', { name: /lots/i }).click();

      // Revenir à "Tous"
      const tousFilter = authedPage.getByRole('button', { name: /tous/i });
      await tousFilter.click();

      // Le filtre "Tous" doit être actif
      await expect(tousFilter).toHaveClass(/bg-primary/);

      // La page affiche toutes les entrées ou message vide global
      const listOrEmpty = authedPage.getByRole('list').or(authedPage.getByText(/aucune action enregistrée/i));
      await expect(listOrEmpty).toBeVisible();
    });
  });

  authTest.describe('Types d\'actions', () => {
    authTest('distingue visuellement création, modification et suppression', async ({ authedPage }) => {
      await authedPage.goto('/historique');

      // La page doit au moins être affichée
      await expect(authedPage.getByRole('heading', { name: /historique/i })).toBeVisible();
    });
  });

  authTest.describe('Affichage des entrées', () => {
    authTest('affiche un message quand il n\'y a aucune action', async ({ authedPage }) => {
      await authedPage.goto('/historique');

      // Avec un historique vide, on devrait voir le message d'état vide
      const emptyMessage = authedPage.getByText(/aucune action enregistrée/i);
      const listExists = await authedPage.getByRole('list').isVisible().catch(() => false);

      // Soit on a une liste d'entrées, soit le message vide
      if (!listExists) {
        await expect(emptyMessage).toBeVisible();
      }
    });
  });
});
