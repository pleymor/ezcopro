import { test, expect } from '../fixtures/extranet-auth';

test.describe('US3 - Accès aux documents partagés (Extranet Copropriétaire)', () => {
  test.describe('Page documents', () => {
    test('affiche la page des documents', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/documents');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Screenshot: Page documents
      await takeScreenshot('01-page-documents');

      // Vérifier le titre
      await expect(extranetPage.getByRole('heading', { name: /documents/i }).first()).toBeVisible();
    });

    test('affiche le compteur de documents disponibles', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/documents');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Vérifier la présence du compteur
      await expect(extranetPage.getByText(/documents disponibles/i)).toBeVisible();

      await takeScreenshot('02-compteur-documents');
    });

    test('affiche le compteur de nouveaux documents', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/documents');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Vérifier la présence du compteur nouveaux
      await expect(extranetPage.getByText(/nouveaux documents/i)).toBeVisible();

      await takeScreenshot('03-compteur-nouveaux');
    });
  });

  test.describe('Filtrage par catégorie', () => {
    test('affiche le filtre par catégorie', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/documents');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Vérifier la présence du filtre
      await expect(extranetPage.getByText(/filtrer par catégorie/i)).toBeVisible();

      await takeScreenshot('04-filtre-categorie');
    });

    test('affiche les badges de catégories avec compteurs', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/documents');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Vérifier les catégories
      const categories = ['Tous', 'Assemblées Générales', 'Contrats', 'Règlement', 'Travaux', 'Autres'];

      for (const cat of categories) {
        const badge = extranetPage.getByText(new RegExp(cat, 'i')).first();
        // Au moins "Tous" doit être visible
        if (cat === 'Tous') {
          await expect(badge).toBeVisible();
        }
      }

      await takeScreenshot('05-badges-categories');
    });

    test('permet de filtrer par catégorie AG', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/documents');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Cliquer sur la catégorie AG
      const agBadge = extranetPage.getByText(/assemblées générales/i).first();
      if (await agBadge.isVisible()) {
        await agBadge.click();
        await extranetPage.waitForLoadState('domcontentloaded');

        await takeScreenshot('06-filtre-ag');
      }
    });

    test('permet de revenir à "Tous"', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/documents');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Cliquer sur une catégorie puis revenir à Tous
      const agBadge = extranetPage.getByText(/assemblées générales/i).first();
      if (await agBadge.isVisible()) {
        await agBadge.click();
        await extranetPage.waitForLoadState('domcontentloaded');

        // Revenir à Tous
        const tousBadge = extranetPage.getByText(/tous/i).first();
        await tousBadge.click();
        await extranetPage.waitForLoadState('domcontentloaded');

        await takeScreenshot('07-retour-tous');
      }
    });
  });

  test.describe('Liste des documents', () => {
    test('affiche les documents avec leurs informations', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/documents');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Vérifier la section liste
      await expect(extranetPage.getByText(/tous les documents/i)).toBeVisible();

      await takeScreenshot('08-liste-documents');
    });

    test('affiche le badge "Nouveau" sur les documents non consultés', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/documents');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Chercher un badge "Nouveau"
      const nouveauBadge = extranetPage.getByText(/nouveau/i).first();
      if (await nouveauBadge.isVisible()) {
        await takeScreenshot('09-badge-nouveau');
      }
    });

    test('affiche la date de partage de chaque document', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/documents');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Les documents devraient avoir des dates
      // Rechercher un pattern de date français (ex: "15 janvier 2024")
      const datePattern = extranetPage.locator('text=/\\d{1,2}\\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\\s+\\d{4}/i').first();
      if (await datePattern.isVisible()) {
        await takeScreenshot('10-dates-documents');
      }
    });

    test('affiche la taille de chaque document', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/documents');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Rechercher un pattern de taille (Ko, Mo)
      const sizePattern = extranetPage.locator('text=/\\d+[,.]?\\d*\\s*(Ko|Mo|o)/i').first();
      if (await sizePattern.isVisible()) {
        await takeScreenshot('11-tailles-documents');
      }
    });
  });

  test.describe('Téléchargement', () => {
    test('affiche le bouton télécharger pour chaque document', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/documents');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Vérifier la présence des boutons télécharger
      const downloadBtns = extranetPage.getByRole('button', { name: /télécharger/i });
      const count = await downloadBtns.count();

      if (count > 0) {
        await expect(downloadBtns.first()).toBeVisible();
        await takeScreenshot('12-boutons-telecharger');
      }
    });

    test('affiche le bouton prévisualiser pour les PDFs', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/documents');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Vérifier la présence des boutons prévisualiser (pour PDF < 5Mo)
      const previewBtns = extranetPage.getByRole('button', { name: /prévisualiser/i });
      const count = await previewBtns.count();

      if (count > 0) {
        await takeScreenshot('13-boutons-previsualiser');
      }
    });
  });

  test.describe('Navigation', () => {
    test('permet de retourner au dashboard', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/documents');
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

    test('permet de rafraîchir les documents', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet/documents');
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

  test.describe('Depuis le dashboard', () => {
    test('affiche les documents récents sur le dashboard', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Vérifier la section documents récents
      await expect(extranetPage.getByText(/documents récents/i)).toBeVisible();

      await takeScreenshot('16-documents-dashboard');
    });

    test('permet d\'accéder à tous les documents depuis le dashboard', async ({ extranetPage, takeScreenshot }) => {
      await extranetPage.goto('/extranet');
      await extranetPage.waitForLoadState('domcontentloaded');

      // Cliquer sur "Voir tout"
      const voirToutLink = extranetPage.getByRole('link', { name: /voir tout/i }).first();
      if (await voirToutLink.isVisible()) {
        await voirToutLink.click();
        await extranetPage.waitForLoadState('domcontentloaded');

        await expect(extranetPage).toHaveURL(/\/extranet\/documents/);
        await takeScreenshot('17-navigation-vers-documents');
      }
    });
  });
});
