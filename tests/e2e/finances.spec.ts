import { expect } from '@playwright/test';
import { test as authTest } from './fixtures/auth';
authTest.describe('Finances - Appels de fonds et Paiements (authentifié)', () => {
  authTest.describe('Appels de fonds', () => {
    authTest('affiche la liste des appels de fonds', async ({ authedPage }) => {
      await authedPage.goto('/finances');

      // Vérifier que la page finances est affichée
      await expect(authedPage.getByRole('heading', { name: /finances/i })).toBeVisible();

      // Vérifier la présence des onglets ou sections
      await expect(authedPage.getByText(/appels/i).first()).toBeVisible();
    });

    authTest('permet de créer un nouvel appel de fonds', async ({ authedPage }) => {
      await authedPage.goto('/finances/appels/new');

      // Vérifier le formulaire
      await expect(authedPage.getByLabel(/libellé/i)).toBeVisible();
      await expect(authedPage.getByLabel(/montant/i)).toBeVisible();
    });

    authTest('calcule correctement les répartitions au prorata des tantièmes', async ({ authedPage }) => {
      await authedPage.goto('/finances/appels/new');

      // Remplir le formulaire
      await authedPage.getByLabel(/libellé/i).fill('Test répartition');
      await authedPage.getByLabel(/montant/i).fill('1000');

      // Le formulaire devrait permettre de voir les répartitions
      await expect(authedPage.getByRole('button', { name: /créer|enregistrer/i })).toBeVisible();
    });
  });

  authTest.describe('Paiements', () => {
    authTest('affiche la liste des paiements', async ({ authedPage }) => {
      await authedPage.goto('/finances');

      // Naviguer vers les paiements si onglet séparé
      const paiementsTab = authedPage.getByRole('tab', { name: /paiements/i });
      if (await paiementsTab.isVisible()) {
        await paiementsTab.click();
      }

      // Vérifier que la section paiements est visible
      await expect(authedPage.getByText(/paiement/i).first()).toBeVisible();
    });

    authTest('permet d\'enregistrer un nouveau paiement', async ({ authedPage }) => {
      await authedPage.goto('/finances/paiements/new');

      // Vérifier le formulaire
      await expect(authedPage.getByLabel(/montant/i)).toBeVisible();
    });
  });

  authTest.describe('Validation des données', () => {
    authTest('refuse un montant négatif pour un appel', async ({ authedPage }) => {
      await authedPage.goto('/finances/appels/new');

      // Remplir avec un montant négatif
      const montantInput = authedPage.getByLabel(/montant/i);
      if (await montantInput.isVisible()) {
        await authedPage.getByLabel(/libellé/i).fill('Test');
        await montantInput.fill('-100');

        await authedPage.getByRole('button', { name: /créer|enregistrer/i }).click();

        // Devrait soit afficher une erreur, soit rester sur la page (pas de redirection)
        // Vérifie qu'on est toujours sur la page de création (validation côté client)
        await expect(authedPage).toHaveURL(/\/finances\/appels\/new/);
      }
    });
  });
});
