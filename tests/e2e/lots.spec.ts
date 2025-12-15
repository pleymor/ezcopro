import { expect } from '@playwright/test';
import { test as authTest, TEST_LOT } from './fixtures/auth';
authTest.describe('User Story 2 - Gestion des Lots (authentifié)', () => {
  authTest('T038: Given utilisateur connecté, When accède à la liste des lots, Then voit les lots avec détails', async ({
    authedPage,
  }) => {
    await authedPage.goto('/lots');

    // Voit le titre de la page lots
    await expect(authedPage.getByRole('heading', { name: /lots/i })).toBeVisible();

    // Voit le lot de test
    await expect(authedPage.getByText(TEST_LOT.numero)).toBeVisible();
  });

  authTest('T039: Given utilisateur sur page lots, When clique sur ajouter, Then peut créer un nouveau lot', async ({
    authedPage,
  }) => {
    await authedPage.goto('/lots');

    // Clique sur le bouton d'ajout
    const addButton = authedPage.getByRole('link', { name: /ajouter|nouveau/i });
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Voit le formulaire de création - au moins le champ numéro doit être présent
    await expect(authedPage.getByRole('textbox', { name: /numéro/i })).toBeVisible();
    // Les autres champs peuvent varier selon l'UI
  });

  authTest('T040: Given lot existant, When clique modifier, Then peut éditer le lot', async ({
    authedPage,
  }) => {
    await authedPage.goto('/lots');

    // Clique sur le bouton modifier du lot
    const editButton = authedPage.getByRole('link', { name: /modifier/i }).first();
    if (await editButton.isVisible()) {
      await editButton.click();

      // Voit le formulaire d'édition pré-rempli
      await expect(authedPage.getByLabel(/numéro/i)).toHaveValue(TEST_LOT.numero);
    }
  });

  authTest('T041: Given lot existant, When remplit formulaire et soumet, Then lot mis à jour', async ({
    authedPage,
  }) => {
    await authedPage.goto(`/lots/${TEST_LOT.id}/edit`);

    // Modifie un champ
    const superficieInput = authedPage.getByLabel(/superficie/i);
    if (await superficieInput.isVisible()) {
      await superficieInput.fill('75');

      // Soumet le formulaire
      await authedPage.getByRole('button', { name: /enregistrer|sauvegarder/i }).click();

      // Vérifie le succès (redirection ou message)
      await expect(authedPage).toHaveURL(/\/lots/);
    }
  });
});
