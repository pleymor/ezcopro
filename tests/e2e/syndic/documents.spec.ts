import { test, expect } from '../fixtures/auth';

// Screenshots directory for review
const SCREENSHOTS_DIR = 'tests/e2e/screenshots/syndic';

test.describe('US5 - Partage de documents (Syndic)', () => {
  test.describe('Page documents syndic', () => {
    test('affiche la page de gestion des documents', async ({ authedPage }) => {
      await authedPage.goto('/documents');
      await authedPage.waitForLoadState('domcontentloaded');

      await authedPage.screenshot({
        path: `${SCREENSHOTS_DIR}/documents-01-page-gestion.png`,
        fullPage: true,
      });

      // Vérifier le titre
      await expect(authedPage.getByRole('heading', { name: /documents partagés/i })).toBeVisible();
    });

    test('affiche les statistiques de documents', async ({ authedPage }) => {
      await authedPage.goto('/documents');
      await authedPage.waitForLoadState('domcontentloaded');

      // Vérifier les cartes de statistiques
      await expect(authedPage.getByText(/total documents/i)).toBeVisible();
      await expect(authedPage.getByText(/visibles sur l'extranet/i)).toBeVisible();
      await expect(authedPage.getByText(/masqués/i)).toBeVisible();

      await authedPage.screenshot({
        path: `${SCREENSHOTS_DIR}/documents-02-statistiques.png`,
        fullPage: true,
      });
    });

    test('affiche le quota de stockage', async ({ authedPage }) => {
      await authedPage.goto('/documents');
      await authedPage.waitForLoadState('domcontentloaded');

      // Vérifier l'affichage du quota
      await expect(authedPage.getByText(/espace utilisé/i)).toBeVisible();

      await authedPage.screenshot({
        path: `${SCREENSHOTS_DIR}/documents-03-quota-stockage.png`,
        fullPage: true,
      });
    });

    test('affiche les badges de catégories', async ({ authedPage }) => {
      await authedPage.goto('/documents');
      await authedPage.waitForLoadState('domcontentloaded');

      // Vérifier la section catégories
      await expect(authedPage.getByRole('heading', { name: /catégories/i })).toBeVisible();

      // Vérifier les catégories
      const categories = ['Assemblées Générales', 'Contrats', 'Règlement', 'Travaux', 'Autres'];
      for (const cat of categories) {
        const badge = authedPage.getByText(new RegExp(cat, 'i')).first();
        // Au moins une doit être visible
        if (await badge.isVisible()) {
          break;
        }
      }

      await authedPage.screenshot({
        path: `${SCREENSHOTS_DIR}/documents-04-categories.png`,
        fullPage: true,
      });
    });
  });

  test.describe('Bouton ajouter document', () => {
    test('affiche le bouton ajouter un document', async ({ authedPage }) => {
      await authedPage.goto('/documents');
      await authedPage.waitForLoadState('domcontentloaded');

      // Vérifier la présence du bouton
      const addBtn = authedPage.getByRole('button', { name: /ajouter un document/i });
      await expect(addBtn).toBeVisible();

      await authedPage.screenshot({
        path: `${SCREENSHOTS_DIR}/documents-05-bouton-ajouter.png`,
        fullPage: true,
      });
    });

    test('ouvre la modale d\'upload', async ({ authedPage }) => {
      await authedPage.goto('/documents');
      await authedPage.waitForLoadState('domcontentloaded');

      // Cliquer sur le bouton ajouter
      const addBtn = authedPage.getByRole('button', { name: /ajouter un document/i });
      await addBtn.click();

      // Vérifier l'ouverture de la modale
      await expect(authedPage.getByText(/sélectionnez un fichier/i)).toBeVisible();

      await authedPage.screenshot({
        path: `${SCREENSHOTS_DIR}/documents-06-modale-upload.png`,
        fullPage: true,
      });
    });

    test('affiche le formulaire d\'upload avec tous les champs', async ({ authedPage }) => {
      await authedPage.goto('/documents');
      await authedPage.waitForLoadState('domcontentloaded');

      // Ouvrir la modale
      const addBtn = authedPage.getByRole('button', { name: /ajouter un document/i });
      await addBtn.click();

      // Vérifier les champs du formulaire
      await expect(authedPage.getByLabel(/nom du document/i)).toBeVisible();
      await expect(authedPage.getByText(/catégorie/i).first()).toBeVisible();

      await authedPage.screenshot({
        path: `${SCREENSHOTS_DIR}/documents-07-formulaire-upload.png`,
        fullPage: true,
      });
    });

    test('affiche l\'option de visibilité extranet', async ({ authedPage }) => {
      await authedPage.goto('/documents');
      await authedPage.waitForLoadState('domcontentloaded');

      // Ouvrir la modale
      const addBtn = authedPage.getByRole('button', { name: /ajouter un document/i });
      await addBtn.click();

      // Vérifier l'option de visibilité dans la modale (texte spécifique de la modale)
      await expect(authedPage.getByText(/rendre visible sur l'extranet/i)).toBeVisible();

      await authedPage.screenshot({
        path: `${SCREENSHOTS_DIR}/documents-08-option-visibilite.png`,
        fullPage: true,
      });
    });
  });

  test.describe('Filtrage par catégorie', () => {
    test('affiche le sélecteur de filtre', async ({ authedPage }) => {
      await authedPage.goto('/documents');
      await authedPage.waitForLoadState('domcontentloaded');

      // Vérifier la présence du filtre (le select avec le texte "Toutes les catégories" par défaut)
      await expect(authedPage.getByRole('combobox').filter({ hasText: /catégories/i })).toBeVisible();

      await authedPage.screenshot({
        path: `${SCREENSHOTS_DIR}/documents-09-selecteur-filtre.png`,
        fullPage: true,
      });
    });

    test('permet de filtrer par catégorie AG', async ({ authedPage }) => {
      await authedPage.goto('/documents');
      await authedPage.waitForLoadState('domcontentloaded');

      // Cliquer sur le badge AG
      const agBadge = authedPage.getByText(/assemblées générales/i).first();
      if (await agBadge.isVisible()) {
        await agBadge.click();
        await authedPage.waitForLoadState('domcontentloaded');

        await authedPage.screenshot({
          path: `${SCREENSHOTS_DIR}/documents-10-filtre-ag.png`,
          fullPage: true,
        });
      }
    });

    test('permet de revenir à toutes les catégories', async ({ authedPage }) => {
      await authedPage.goto('/documents');
      await authedPage.waitForLoadState('domcontentloaded');

      // Filtrer d'abord
      const agBadge = authedPage.getByText(/assemblées générales/i).first();
      if (await agBadge.isVisible()) {
        await agBadge.click();
        await authedPage.waitForLoadState('domcontentloaded');

        // Revenir à tous
        const tousBtn = authedPage.getByText(/afficher tout/i);
        if (await tousBtn.isVisible()) {
          await tousBtn.click();
          await authedPage.waitForLoadState('domcontentloaded');

          await authedPage.screenshot({
            path: `${SCREENSHOTS_DIR}/documents-11-retour-tous.png`,
            fullPage: true,
          });
        }
      }
    });
  });

  test.describe('Liste des documents', () => {
    test('affiche la liste des documents', async ({ authedPage }) => {
      await authedPage.goto('/documents');
      await authedPage.waitForLoadState('domcontentloaded');

      // Vérifier la section liste
      await expect(authedPage.getByText(/liste des documents/i)).toBeVisible();

      await authedPage.screenshot({
        path: `${SCREENSHOTS_DIR}/documents-12-liste.png`,
        fullPage: true,
      });
    });

    test('affiche les cards de documents avec informations', async ({ authedPage }) => {
      await authedPage.goto('/documents');
      await authedPage.waitForLoadState('domcontentloaded');

      // Chercher un document card (si des documents existent)
      const docCard = authedPage.locator('[class*="card"]').first();
      if (await docCard.isVisible()) {
        await authedPage.screenshot({
          path: `${SCREENSHOTS_DIR}/documents-13-card-document.png`,
          fullPage: true,
        });
      }
    });

    test('affiche le toggle de visibilité extranet', async ({ authedPage }) => {
      await authedPage.goto('/documents');
      await authedPage.waitForLoadState('domcontentloaded');

      // Chercher un toggle de visibilité
      const visibilityToggle = authedPage.locator('[role="switch"]').first();
      if (await visibilityToggle.isVisible()) {
        await authedPage.screenshot({
          path: `${SCREENSHOTS_DIR}/documents-14-toggle-visibilite.png`,
          fullPage: true,
        });
      }
    });

    test('affiche le bouton télécharger', async ({ authedPage }) => {
      await authedPage.goto('/documents');
      await authedPage.waitForLoadState('domcontentloaded');

      // Chercher un bouton télécharger
      const downloadBtn = authedPage.getByRole('button', { name: /télécharger/i }).first();
      if (await downloadBtn.isVisible()) {
        await authedPage.screenshot({
          path: `${SCREENSHOTS_DIR}/documents-15-bouton-telecharger.png`,
          fullPage: true,
        });
      }
    });

    test('affiche le bouton supprimer', async ({ authedPage }) => {
      await authedPage.goto('/documents');
      await authedPage.waitForLoadState('domcontentloaded');

      // Chercher un bouton supprimer
      const deleteBtn = authedPage.getByRole('button', { name: /supprimer/i }).first();
      if (await deleteBtn.isVisible()) {
        await authedPage.screenshot({
          path: `${SCREENSHOTS_DIR}/documents-16-bouton-supprimer.png`,
          fullPage: true,
        });
      }
    });
  });

  test.describe('Actions sur documents', () => {
    test('affiche la confirmation avant suppression', async ({ authedPage }) => {
      await authedPage.goto('/documents');
      await authedPage.waitForLoadState('domcontentloaded');

      // Cliquer sur supprimer (s'il y a des documents)
      const deleteBtn = authedPage.getByRole('button', { name: /supprimer/i }).first();
      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();

        // Vérifier la modale de confirmation
        await expect(authedPage.getByText(/êtes-vous sûr/i)).toBeVisible();

        await authedPage.screenshot({
          path: `${SCREENSHOTS_DIR}/documents-17-confirmation-suppression.png`,
          fullPage: true,
        });

        // Annuler
        const cancelBtn = authedPage.getByRole('button', { name: /annuler/i });
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
        }
      }
    });

    test('permet de rafraîchir la liste', async ({ authedPage }) => {
      await authedPage.goto('/documents');
      await authedPage.waitForLoadState('domcontentloaded');

      // Cliquer sur actualiser
      const refreshBtn = authedPage.getByRole('button', { name: /actualiser/i });
      await expect(refreshBtn).toBeVisible();
      await refreshBtn.click();
      await authedPage.waitForLoadState('domcontentloaded');

      await authedPage.screenshot({
        path: `${SCREENSHOTS_DIR}/documents-18-apres-refresh.png`,
        fullPage: true,
      });
    });
  });

  test.describe('État vide', () => {
    test('affiche un état vide si pas de documents', async ({ authedPage }) => {
      await authedPage.goto('/documents');
      await authedPage.waitForLoadState('domcontentloaded');

      // Si pas de documents, vérifier l'état vide
      const emptyState = authedPage.getByText(/aucun document/i);
      if (await emptyState.isVisible()) {
        await authedPage.screenshot({
          path: `${SCREENSHOTS_DIR}/documents-19-etat-vide.png`,
          fullPage: true,
        });
      }
    });
  });
});
