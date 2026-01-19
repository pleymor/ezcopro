import { test, expect } from '../fixtures/extranet-auth';

test.describe('US2 - Historique des paiements (Extranet Copropriétaire)', () => {
  test.describe('Page historique paiements', () => {
    test('affiche la page historique des paiements', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/paiements');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Screenshot: Page paiements
      await takeScreenshot('01-page-paiements');

      // Vérifier le titre
      await expect(extranetPage.getByRole('heading', { name: /historique des paiements/i })).toBeVisible();
    });

    test('affiche le nombre total de paiements', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/paiements');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Vérifier la présence du compteur
      await expect(extranetPage.getByText(/nombre de paiements/i)).toBeVisible();

      await takeScreenshot('02-compteur-paiements');
    });

    test('affiche le total payé', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/paiements');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Vérifier la présence du total
      await expect(extranetPage.getByText(/total payé/i)).toBeVisible();

      await takeScreenshot('03-total-paye');
    });

    test('affiche la liste des paiements avec date et montant', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/paiements');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Vérifier la section détail
      await expect(extranetPage.getByText(/détail des paiements/i)).toBeVisible();

      await takeScreenshot('04-liste-paiements');
    });
  });

  test.describe('Filtrage par période', () => {
    test('affiche le sélecteur de période', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/paiements');
      await extranetPage.waitForLoadState('domcontentloaded');
      await extranetPage.waitForTimeout(1000);

      // Vérifier la présence du combobox de période
      await expect(extranetPage.getByRole('combobox')).toBeVisible({ timeout: 10000 });

      await takeScreenshot('05-selecteur-periode');
    });

    test('permet de sélectionner "Cette année"', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/paiements');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Ouvrir le sélecteur
      const selectTrigger = extranetPage.getByRole('combobox').first();
      await selectTrigger.click();

      await takeScreenshot('06-periode-ouverte');

      // Sélectionner "Cette année"
      const thisYearOption = extranetPage.getByRole('option', { name: /cette année/i });
      if (await thisYearOption.isVisible()) {
        await thisYearOption.click();
        await extranetPage.waitForLoadState('domcontentloaded');
        await takeScreenshot('07-periode-cette-annee');
      }
    });

    test('permet de sélectionner "Année précédente"', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/paiements');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Ouvrir le sélecteur
      const selectTrigger = extranetPage.getByRole('combobox').first();
      await selectTrigger.click();

      // Sélectionner "Année précédente"
      const lastYearOption = extranetPage.getByRole('option', { name: /année précédente/i });
      if (await lastYearOption.isVisible()) {
        await lastYearOption.click();
        await extranetPage.waitForLoadState('domcontentloaded');
        await takeScreenshot('08-periode-annee-precedente');
      }
    });

    test('permet de définir une période personnalisée', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/paiements');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Ouvrir le sélecteur
      const selectTrigger = extranetPage.getByRole('combobox').first();
      await selectTrigger.click();

      // Sélectionner "Période personnalisée"
      const customOption = extranetPage.getByRole('option', { name: /personnalisée/i });
      if (await customOption.isVisible()) {
        await customOption.click();
        await extranetPage.waitForLoadState('domcontentloaded');

        await takeScreenshot('09-periode-personnalisee');

        // Vérifier l'apparition des champs de date
        await expect(extranetPage.getByLabel(/date de début/i)).toBeVisible();
        await expect(extranetPage.getByLabel(/date de fin/i)).toBeVisible();

        await takeScreenshot('10-champs-dates-personnalisees');
      }
    });

    test('affiche le label de la période sélectionnée', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/paiements');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Sélectionner une période
      const selectTrigger = extranetPage.getByRole('combobox').first();
      await selectTrigger.click();

      const option = extranetPage.getByRole('option', { name: /6 derniers mois/i });
      if (await option.isVisible()) {
        await option.click();
        await extranetPage.waitForLoadState('domcontentloaded');

        // Vérifier que le label de période est affiché
        await expect(extranetPage.getByText(/depuis le/i)).toBeVisible();

        await takeScreenshot('11-label-periode-affiche');
      }
    });
  });

  test.describe('Export PDF / Justificatifs', () => {
    test('affiche le bouton exporter en PDF', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/paiements');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Vérifier la présence du bouton export
      const exportBtn = extranetPage.getByRole('button', { name: /exporter|pdf/i });
      await expect(exportBtn).toBeVisible();

      await takeScreenshot('12-bouton-export-pdf');
    });

    test('affiche le bouton justificatif pour chaque paiement', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/paiements');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Vérifier la présence des boutons justificatif
      const justificatifBtns = extranetPage.getByRole('button', { name: /justificatif/i });
      const count = await justificatifBtns.count();

      if (count > 0) {
        await expect(justificatifBtns.first()).toBeVisible();
        await takeScreenshot('13-boutons-justificatif');
      }
    });
  });

  test.describe('Navigation', () => {
    test('permet de retourner au dashboard', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/paiements');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Cliquer sur le bouton retour
      const backBtn = extranetPage.locator('a[href="/extranet"]').first();

      if (await backBtn.isVisible()) {
        await backBtn.click();
        await extranetPage.waitForLoadState('domcontentloaded');

        await expect(extranetPage).toHaveURL(/\/extranet$/);
        await takeScreenshot('14-retour-dashboard');
      }
    });

    test('permet de rafraîchir les données', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/paiements');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Cliquer sur actualiser
      const refreshBtn = extranetPage.getByRole('button', { name: /actualiser/i });
      if (await refreshBtn.isVisible()) {
        await refreshBtn.click();
        await extranetPage.waitForLoadState('domcontentloaded');

        await takeScreenshot('15-apres-refresh');
      }
    });
  });
});
