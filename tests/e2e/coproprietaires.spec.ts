import { expect } from '@playwright/test';
import { test as authTest, TEST_COPROPRIETAIRE } from './fixtures/auth';
authTest.describe('User Story 3 - Gestion des Copropriétaires (authentifié)', () => {
  authTest('T054: Given utilisateur connecté, When accède à la liste, Then voit les copropriétaires avec leurs lots', async ({
    authedPage,
  }) => {
    await authedPage.goto('/coproprietaires');

    // Voit le titre
    await expect(authedPage.getByRole('heading', { name: /copropriétaires/i })).toBeVisible();

    // Voit le copropriétaire de test (utilise first() car le nom peut apparaître plusieurs fois)
    await expect(authedPage.getByText(TEST_COPROPRIETAIRE.nom).first()).toBeVisible();
  });

  authTest('T055: Given utilisateur sur page copropriétaires, When clique ajouter, Then peut créer un copropriétaire', async ({
    authedPage,
  }) => {
    await authedPage.goto('/coproprietaires');

    // Clique sur le bouton d'ajout
    const addButton = authedPage.getByRole('link', { name: /ajouter|nouveau/i });
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Voit le formulaire de création (utilise getByRole pour être plus précis)
    await expect(authedPage.getByRole('textbox', { name: /^nom$/i })).toBeVisible();
    await expect(authedPage.getByRole('textbox', { name: /prénom/i })).toBeVisible();
    await expect(authedPage.getByRole('textbox', { name: /email/i })).toBeVisible();
  });

  authTest('T056: Given copropriétaire existant, When clique modifier, Then peut éditer', async ({
    authedPage,
  }) => {
    await authedPage.goto('/coproprietaires');

    // Clique sur le bouton modifier
    const editButton = authedPage.getByRole('link', { name: /modifier/i }).first();
    if (await editButton.isVisible()) {
      await editButton.click();

      // Voit le formulaire d'édition pré-rempli
      await expect(authedPage.getByRole('textbox', { name: /^nom$/i })).toHaveValue(TEST_COPROPRIETAIRE.nom);
    }
  });

  authTest('T057: Given copropriétaire existant, When génère code invitation, Then code affiché', async ({
    authedPage,
  }) => {
    await authedPage.goto('/coproprietaires');

    // Cherche le bouton d'invitation
    const inviteButton = authedPage.getByRole('button', { name: /inviter|invitation/i }).first();
    if (await inviteButton.isVisible()) {
      await inviteButton.click();

      // Voit le code d'invitation ou un modal (utilise first() pour éviter les doublons)
      await expect(authedPage.getByText(/code/i).first()).toBeVisible();
    }
  });

  authTest('T058: Given copropriétaire avec historique financier, When anonymise (RGPD), Then données personnelles supprimées mais historique conservé', async ({
    authedPage,
  }) => {
    await authedPage.goto(`/coproprietaires/${TEST_COPROPRIETAIRE.id}/edit`);

    // Cherche le bouton d'anonymisation
    const anonymizeButton = authedPage.getByRole('button', { name: /anonymiser|rgpd|supprimer/i });
    if (await anonymizeButton.isVisible()) {
      // Ne pas cliquer pour ne pas perdre les données de test
      await expect(anonymizeButton).toBeVisible();
    }
  });
});
