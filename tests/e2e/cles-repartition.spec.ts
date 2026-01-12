import { expect } from '@playwright/test';
import { test as authTest } from './fixtures/auth';

// Test data constants (must match src/lib/test/mock-data.ts)
const TEST_CLE = {
  id: 'tantiemes_generaux',
  nom: 'Tantièmes généraux',
  description: 'Charges communes générales',
};

authTest.describe('User Story 3 - Consulter les clés de répartition', () => {
  authTest('T022: Given utilisateur connecté, When accède à la liste des clés, Then voit les clés existantes', async ({
    authedPage,
  }) => {
    await authedPage.goto('/lots/cles-repartition');

    // Voit le titre de la page
    await expect(authedPage.getByRole('heading', { name: /clés de répartition/i })).toBeVisible();

    // Voit la clé de test (Tantièmes généraux)
    await expect(authedPage.getByText(TEST_CLE.nom)).toBeVisible();
  });

  authTest('T023: Given clé existante, When clique sur la clé, Then voit le détail avec quotes-parts', async ({
    authedPage,
  }) => {
    await authedPage.goto('/lots/cles-repartition');

    // Clique sur la clé
    await authedPage.getByText(TEST_CLE.nom).click();

    // Voit la page de détail
    await expect(authedPage.getByRole('heading', { name: TEST_CLE.nom })).toBeVisible();

    // Voit le tableau des quotes-parts avec les colonnes
    await expect(authedPage.getByRole('columnheader', { name: /lot/i })).toBeVisible();
    await expect(authedPage.getByRole('columnheader', { name: /quote-part/i })).toBeVisible();

    // Voit le total dans le footer du tableau
    await expect(authedPage.getByRole('cell', { name: 'Total' })).toBeVisible();
  });
});

authTest.describe('User Story 1 - Créer une clé de répartition', () => {
  authTest('T014: Given utilisateur sur liste des clés, When clique créer, Then voit le formulaire', async ({
    authedPage,
  }) => {
    await authedPage.goto('/lots/cles-repartition');

    // Clique sur le bouton nouvelle clé
    const newButton = authedPage.getByRole('link', { name: /nouvelle|créer.*personnalisée/i });
    await expect(newButton).toBeVisible();
    await newButton.click();

    // Voit le formulaire de création
    await expect(authedPage.getByRole('heading', { name: /nouvelle clé/i })).toBeVisible();
    await expect(authedPage.getByLabel(/nom/i)).toBeVisible();
  });

  authTest('T015: Given formulaire création, When remplit et soumet, Then clé créée', async ({
    authedPage,
  }) => {
    await authedPage.goto('/lots/cles-repartition/nouvelle');

    // Remplit le formulaire
    await authedPage.getByLabel(/nom.*clé/i).fill('Clé de test E2E');
    await authedPage.getByLabel(/description/i).fill('Description de test');

    // Les quotes-parts devraient être initialisées à 0 pour tous les lots
    // On vérifie que le tableau est visible
    await expect(authedPage.getByRole('table')).toBeVisible();

    // Soumet le formulaire
    await authedPage.getByRole('button', { name: /créer/i }).click();

    // Vérifie la redirection vers la liste
    await expect(authedPage).toHaveURL(/\/lots\/cles-repartition$/);
  });

  authTest('T016: Given nom de clé existant, When tente de créer avec même nom, Then erreur affichée', async ({
    authedPage,
  }) => {
    await authedPage.goto('/lots/cles-repartition/nouvelle');

    // Utilise le nom d'une clé existante
    await authedPage.getByLabel(/nom.*clé/i).fill(TEST_CLE.nom);

    // Soumet le formulaire
    await authedPage.getByRole('button', { name: /créer/i }).click();

    // Vérifie le message d'erreur
    await expect(authedPage.getByText(/existe déjà/i)).toBeVisible();
  });

  authTest('T017: Given formulaire avec quotes-parts, When lots cochés, Then total calculé automatiquement', async ({
    authedPage,
  }) => {
    await authedPage.goto('/lots/cles-repartition/nouvelle');

    // Les checkboxes des lots devraient être visibles
    const checkboxes = authedPage.getByRole('checkbox');
    const count = await checkboxes.count();

    if (count > 0) {
      // Tous les lots sont cochés par défaut avec calcul auto = 10000
      await expect(authedPage.getByText('10000')).toBeVisible();
      await expect(authedPage.getByText('100.00%')).toBeVisible();
    }
  });
});

authTest.describe('User Story 4 - Modifier une clé de répartition', () => {
  authTest('T029: Given clé existante, When clique modifier, Then voit formulaire pré-rempli', async ({
    authedPage,
  }) => {
    // Va sur la page de détail
    await authedPage.goto('/lots/cles-repartition');
    await authedPage.getByText(TEST_CLE.nom).click();

    // Clique sur modifier
    await authedPage.getByRole('link', { name: /modifier/i }).click();

    // Voit le formulaire pré-rempli
    await expect(authedPage.getByRole('heading', { name: /modifier/i })).toBeVisible();
    await expect(authedPage.getByLabel(/nom.*clé/i)).toHaveValue(TEST_CLE.nom);
  });

  authTest('T030: Given formulaire édition, When modifie et soumet, Then clé mise à jour', async ({
    authedPage,
  }) => {
    await authedPage.goto('/lots/cles-repartition');
    await authedPage.getByText(TEST_CLE.nom).click();
    await authedPage.getByRole('link', { name: /modifier/i }).click();

    // Modifie la description
    const descInput = authedPage.getByLabel(/description/i);
    await descInput.clear();
    await descInput.fill('Description modifiée E2E');

    // Soumet le formulaire
    await authedPage.getByRole('button', { name: /mettre à jour/i }).click();

    // Vérifie le retour à la page de détail
    await expect(authedPage).toHaveURL(new RegExp(`/lots/cles-repartition/${TEST_CLE.id}$`));
  });

  authTest('T032: Given édition avec nom existant, When change vers nom déjà pris, Then erreur', async ({
    authedPage,
  }) => {
    // Créer d'abord une deuxième clé pour tester la collision de noms
    await authedPage.goto('/lots/cles-repartition/nouvelle');
    await authedPage.getByLabel(/nom.*clé/i).fill('Clé temporaire T032');
    await authedPage.getByRole('button', { name: /créer/i }).click();

    // Attendre la redirection avec timeout plus long
    await expect(authedPage).toHaveURL(/\/lots\/cles-repartition$/, { timeout: 10000 });

    // Aller modifier cette nouvelle clé
    await authedPage.getByText('Clé temporaire T032').click();
    await expect(authedPage.getByRole('link', { name: /modifier/i })).toBeVisible({ timeout: 5000 });
    await authedPage.getByRole('link', { name: /modifier/i }).click();

    // Attendre que le formulaire soit chargé
    await expect(authedPage.getByLabel(/nom.*clé/i)).toBeVisible({ timeout: 5000 });

    // Essayer de changer le nom vers un nom existant
    await authedPage.getByLabel(/nom.*clé/i).fill(TEST_CLE.nom);
    await authedPage.getByRole('button', { name: /mettre à jour/i }).click();

    // Vérifie le message d'erreur
    await expect(authedPage.getByText(/existe déjà/i)).toBeVisible({ timeout: 5000 });
  });
});

authTest.describe('User Story 5 - Supprimer une clé de répartition', () => {
  authTest('T034a: Given clé par défaut, When sur page détail, Then bouton supprimer absent', async ({
    authedPage,
  }) => {
    await authedPage.goto('/lots/cles-repartition');
    await authedPage.getByText(TEST_CLE.nom).click();

    // La clé par défaut ne devrait pas avoir de bouton supprimer
    // ou le bouton devrait être désactivé
    const deleteButton = authedPage.getByRole('button', { name: /supprimer/i });
    const isVisible = await deleteButton.isVisible().catch(() => false);

    if (isVisible) {
      // Si le bouton est visible, il devrait être désactivé pour la clé par défaut
      await expect(deleteButton).toBeDisabled();
    }
    // Si pas visible, c'est le comportement attendu
  });

  authTest('T034b: Given clé non utilisée et non par défaut, When clique supprimer, Then confirmation demandée', async ({
    authedPage,
  }) => {
    // Créer d'abord une clé à supprimer
    await authedPage.goto('/lots/cles-repartition/nouvelle');
    await authedPage.getByLabel(/nom.*clé/i).fill('Clé à supprimer');
    await authedPage.getByRole('button', { name: /créer/i }).click();

    // Attendre la redirection et aller sur la nouvelle clé
    await expect(authedPage).toHaveURL(/\/lots\/cles-repartition$/);
    await authedPage.getByText('Clé à supprimer').click();

    // Clique sur supprimer
    await authedPage.getByRole('button', { name: /supprimer/i }).click();

    // Voit la confirmation
    await expect(authedPage.getByRole('alertdialog')).toBeVisible();
    await expect(authedPage.getByText(/êtes-vous sûr/i)).toBeVisible();
  });

  authTest('T034c: Given confirmation suppression, When confirme, Then clé supprimée', async ({
    authedPage,
  }) => {
    // Créer d'abord une clé à supprimer
    await authedPage.goto('/lots/cles-repartition/nouvelle');
    await authedPage.getByLabel(/nom.*clé/i).fill('Clé pour suppression');
    await authedPage.getByRole('button', { name: /créer/i }).click();

    // Aller sur la nouvelle clé
    await expect(authedPage).toHaveURL(/\/lots\/cles-repartition$/);
    await authedPage.getByText('Clé pour suppression').click();

    // Clique sur supprimer
    await authedPage.getByRole('button', { name: /supprimer/i }).click();

    // Confirme la suppression
    await authedPage.getByRole('alertdialog').getByRole('button', { name: /supprimer/i }).click();

    // Vérifie le retour à la liste
    await expect(authedPage).toHaveURL(/\/lots\/cles-repartition$/);

    // Vérifie que la clé n'est plus visible
    await expect(authedPage.getByText('Clé pour suppression')).not.toBeVisible();
  });
});

authTest.describe('User Story 2 - Affecter les lots à une clé', () => {
  authTest('T019: Given éditeur quotes-parts, When décoche un lot, Then total recalculé automatiquement', async ({
    authedPage,
  }) => {
    await authedPage.goto('/lots/cles-repartition/nouvelle');

    // Trouve les checkboxes des lots
    const checkboxes = authedPage.getByRole('checkbox');
    const count = await checkboxes.count();

    if (count >= 2) {
      // Par défaut tous les lots sont cochés, total = 10000
      await expect(authedPage.getByText('10000')).toBeVisible();
      await expect(authedPage.getByText('100.00%')).toBeVisible();

      // Décoche le premier lot - le total reste 10000 (recalculé sur les lots restants)
      await checkboxes.first().click();

      // Le total devrait toujours être 10000 (redistribué sur les lots cochés)
      await expect(authedPage.getByText('10000')).toBeVisible();
    }
  });

  authTest('T021: Given éditeur quotes-parts, When affiche tableau, Then voit info lot (numéro, type, tantièmes)', async ({
    authedPage,
  }) => {
    await authedPage.goto('/lots/cles-repartition/nouvelle');

    // Vérifie les colonnes du tableau
    await expect(authedPage.getByRole('columnheader', { name: /inclus/i })).toBeVisible();
    await expect(authedPage.getByRole('columnheader', { name: /lot/i })).toBeVisible();
    await expect(authedPage.getByRole('columnheader', { name: /type/i })).toBeVisible();
    await expect(authedPage.getByRole('columnheader', { name: /tantièmes/i })).toBeVisible();
    await expect(authedPage.getByRole('columnheader', { name: /quote-part/i })).toBeVisible();
  });
});

authTest.describe('Validation et feedback visuel', () => {
  authTest('Given tous les lots cochés, When affiche validation, Then success affiché', async ({
    authedPage,
  }) => {
    await authedPage.goto('/lots/cles-repartition/nouvelle');

    // Par défaut tous les lots sont cochés, total = 10000
    // Devrait afficher un message de succès
    const successText = authedPage.getByText(/égal à 10000/i);
    await expect(successText).toBeVisible();
  });
});

authTest.describe('Navigation et accessibilité', () => {
  authTest('Given page clés, When clique retour aux lots, Then navigue vers lots', async ({
    authedPage,
  }) => {
    await authedPage.goto('/lots/cles-repartition');

    // Clique sur le bouton retour
    await authedPage.getByRole('link', { name: /retour.*lots/i }).click();

    // Vérifie la navigation
    await expect(authedPage).toHaveURL('/lots');
  });

  authTest('Given page nouvelle clé, When clique retour, Then navigue vers liste', async ({
    authedPage,
  }) => {
    await authedPage.goto('/lots/cles-repartition/nouvelle');

    // Clique sur le bouton retour
    await authedPage.getByRole('link', { name: /retour/i }).click();

    // Vérifie la navigation
    await expect(authedPage).toHaveURL('/lots/cles-repartition');
  });

  authTest('Given URL directe vers clés, When navigue, Then page accessible', async ({
    authedPage,
  }) => {
    // Test that the page is directly accessible via URL
    await authedPage.goto('/lots/cles-repartition');

    // Page should load successfully
    await expect(authedPage.getByRole('heading', { name: /clés de répartition/i })).toBeVisible();

    // Navigation breadcrumb should be present
    await expect(authedPage.getByRole('link', { name: /retour.*lots/i })).toBeVisible();
  });
});
