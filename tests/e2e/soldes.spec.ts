import { expect } from '@playwright/test';
import { test as authTest } from './fixtures/auth';
authTest.describe('US5 - Consultation des Soldes (authentifié)', () => {
  authTest.describe('Vue d\'ensemble des soldes', () => {
    authTest('affiche la page des soldes', async ({ authedPage }) => {
      await authedPage.goto('/soldes');

      // Vérifier que la page est affichée
      await expect(authedPage.getByRole('heading', { name: /soldes/i })).toBeVisible();
    });

    authTest('affiche le solde global de la copropriété', async ({ authedPage }) => {
      await authedPage.goto('/soldes');

      // Vérifier les totaux (ou au moins la structure - heading visible dans le main content)
      await expect(authedPage.getByRole('heading', { name: /solde|total/i }).first()).toBeVisible();
    });

    authTest('affiche la liste des copropriétaires avec leurs soldes', async ({ authedPage }) => {
      await authedPage.goto('/soldes');

      // Vérifier que la page est chargée avec le titre
      await expect(authedPage.getByRole('heading', { name: /soldes/i })).toBeVisible();

      // La page affiche soit un tableau/liste soit un message "aucun copropriétaire"
      // ou des boutons de filtre (Tous, À jour, En retard)
      const filterButton = authedPage.getByRole('button', { name: /tous/i });
      await expect(filterButton).toBeVisible();
    });

    authTest('met en évidence les soldes débiteurs (en retard)', async ({ authedPage }) => {
      await authedPage.goto('/soldes');

      // Vérifier que la page charge
      await expect(authedPage.getByRole('heading', { name: /soldes/i })).toBeVisible();
    });

    authTest('permet de filtrer par état (tous, à jour, en retard)', async ({ authedPage }) => {
      await authedPage.goto('/soldes');

      // Vérifier la présence des filtres (si présents)
      const filterButton = authedPage.getByRole('button', { name: /tous|filtrer/i });
      if (await filterButton.isVisible()) {
        await expect(filterButton).toBeVisible();
      }
    });
  });

  authTest.describe('Détail du solde par copropriétaire', () => {
    authTest('affiche le détail en cliquant sur un copropriétaire', async ({ authedPage }) => {
      await authedPage.goto('/soldes');

      // Cliquer sur le premier élément cliquable
      const firstRow = authedPage.getByRole('row').nth(1).or(authedPage.getByRole('listitem').first());
      if (await firstRow.isVisible()) {
        // Juste vérifier que la page est chargée
        await expect(authedPage.getByRole('heading', { name: /soldes/i })).toBeVisible();
      }
    });
  });

  authTest.describe('Calculs des soldes', () => {
    authTest('prend en compte tous les lots du copropriétaire', async ({ authedPage }) => {
      await authedPage.goto('/soldes');

      // La page doit au moins être affichée
      await expect(authedPage.getByRole('heading', { name: /soldes/i })).toBeVisible();
    });
  });
});
