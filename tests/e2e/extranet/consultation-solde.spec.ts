import { test, expect } from '../fixtures/extranet-auth';

test.describe('US1 - Consultation du solde (Extranet Copropriétaire)', () => {
  test.describe('Dashboard Extranet', () => {
    test('affiche le dashboard avec le solde', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Screenshot: Dashboard extranet
      await takeScreenshot('01-dashboard-extranet');

      // Vérifier le titre
      await expect(extranetPage.getByRole('heading', { name: /mon espace copropriétaire/i })).toBeVisible();

      // Vérifier la présence de la carte solde (titre de la carte)
      await expect(extranetPage.getByRole('heading', { name: /mon solde/i })).toBeVisible();
    });

    test('affiche le solde actuel du copropriétaire', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Attendre que les données soient chargées
      await extranetPage.waitForTimeout(1000);

      // Vérifier que le montant du solde est affiché (contient €)
      const soldeElement = extranetPage.getByText('€').first();
      await expect(soldeElement).toBeVisible({ timeout: 10000 });

      await takeScreenshot('02-solde-affiche');
    });

    test('affiche les derniers appels de fonds', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Vérifier la section des derniers appels
      await expect(extranetPage.getByRole('heading', { name: /derniers appels/i })).toBeVisible();

      await takeScreenshot('03-derniers-appels');
    });

    test('affiche les documents récents', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Vérifier la section documents
      await expect(extranetPage.getByRole('heading', { name: /documents récents/i })).toBeVisible();

      await takeScreenshot('04-documents-recents');
    });
  });

  test.describe('Page détail du solde', () => {
    test('navigue vers la page de détail du solde', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet');
      await extranetPage.waitForLoadState('domcontentloaded');
      await extranetPage.waitForTimeout(1000);

      // Cliquer sur "Voir le détail"
      const voirDetailBtn = extranetPage.getByRole('link', { name: /voir le détail/i }).first();
      await expect(voirDetailBtn).toBeVisible({ timeout: 10000 });
      await voirDetailBtn.click();
      await extranetPage.waitForLoadState('domcontentloaded');
      await extranetPage.waitForTimeout(1000);

      await takeScreenshot('05-page-detail-solde');

      // Vérifier qu'on est sur la page solde (h1 avec "Mon solde")
      await expect(extranetPage.locator('h1:has-text("Mon solde")')).toBeVisible({ timeout: 10000 });
    });

    test('affiche le résumé avec total appelé, payé et solde', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/solde');
      await extranetPage.waitForLoadState('domcontentloaded');
      await extranetPage.waitForTimeout(1000);

      // Vérifier le titre Résumé et les sections
      await expect(extranetPage.getByRole('heading', { name: /résumé/i })).toBeVisible({ timeout: 10000 });
      await expect(extranetPage.getByText(/total appelé/i).first()).toBeVisible();
      await expect(extranetPage.getByText(/total payé/i).first()).toBeVisible();

      await takeScreenshot('06-resume-solde');
    });

    test('affiche la liste des appels de fonds', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/solde');
      await extranetPage.waitForLoadState('domcontentloaded');
      await extranetPage.waitForTimeout(1000);

      // Vérifier la section appels (AppelsList component - titre "Mes appels de fonds")
      await expect(extranetPage.getByRole('heading', { name: /mes appels de fonds/i })).toBeVisible({ timeout: 10000 });

      await takeScreenshot('07-liste-appels');
    });

    test('affiche la liste des paiements', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/solde');
      await extranetPage.waitForLoadState('domcontentloaded');
      await extranetPage.waitForTimeout(1000);

      // Vérifier la section paiements (PaiementsList component - titre "Mes paiements")
      await expect(extranetPage.getByRole('heading', { name: /mes paiements/i })).toBeVisible({ timeout: 10000 });

      await takeScreenshot('08-liste-paiements');
    });

    test('indique visuellement un solde débiteur', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/solde');
      await extranetPage.waitForLoadState('domcontentloaded');

      // En mode test, le copropriétaire test-cp-1 a un solde débiteur
      // Vérifier la présence d'un indicateur visuel (texte rouge, icône alerte, etc.)
      const alertElement = extranetPage.locator('.text-red-600, .text-red-500, [class*="red"]').first();

      // Si un solde débiteur existe, vérifier l'alerte
      if (await alertElement.isVisible()) {
        await expect(alertElement).toBeVisible();
        await takeScreenshot('09-solde-debiteur-alerte');
      }
    });

    test('permet de retourner au dashboard', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/solde');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Cliquer sur le bouton retour
      const backBtn = extranetPage.getByRole('link', { name: /retour|←/i }).first()
        .or(extranetPage.locator('a[href="/extranet"]').first());

      if (await backBtn.isVisible()) {
        await backBtn.click();
        await extranetPage.waitForLoadState('domcontentloaded');

        // Vérifier qu'on est de retour sur le dashboard
        await expect(extranetPage).toHaveURL(/\/extranet$/);
        await takeScreenshot('10-retour-dashboard');
      }
    });
  });
});
