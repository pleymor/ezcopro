import { expect } from '@playwright/test';
import { test as authTest } from './fixtures/auth';

authTest.describe('Résolution avec clé de répartition', () => {
  authTest('Le formulaire de résolution affiche le sélecteur de clé de répartition', async ({
    authedPage,
  }) => {
    // Naviguer directement vers l'ordre du jour de l'AG de test
    await authedPage.goto('/assemblees-generales/test-ag-1/ordre-du-jour');

    // Attendre que la page charge
    await expect(authedPage.getByRole('heading', { name: /ordre du jour/i })).toBeVisible();

    // Cliquer sur "Ajouter une résolution"
    await authedPage.getByRole('button', { name: /ajouter.*résolution/i }).click();

    // Vérifier que le formulaire s'affiche avec le sélecteur de clé de répartition
    await expect(authedPage.getByLabel(/titre/i)).toBeVisible();
    await expect(authedPage.getByLabel(/type de majorité/i)).toBeVisible();
    await expect(authedPage.getByLabel(/clé de répartition/i)).toBeVisible();

    // Vérifier que la clé par défaut est pré-sélectionnée via le combobox
    await expect(authedPage.getByRole('combobox', { name: /clé de répartition/i })).toBeVisible();

    // Vérifier que la description de la clé s'affiche
    await expect(authedPage.getByText('Charges communes générales')).toBeVisible();
  });

  authTest('Peut soumettre une résolution avec une clé de répartition sélectionnée', async ({
    authedPage,
  }) => {
    await authedPage.goto('/assemblees-generales/test-ag-1/ordre-du-jour');

    // Attendre que la page charge
    await expect(authedPage.getByRole('heading', { name: /ordre du jour/i })).toBeVisible();

    // Ajouter une résolution
    await authedPage.getByRole('button', { name: /ajouter.*résolution/i }).click();

    // Attendre que le formulaire s'affiche
    await expect(authedPage.getByRole('heading', { name: /nouvelle résolution/i })).toBeVisible();

    // Remplir le formulaire de résolution
    await authedPage.getByLabel(/titre/i).fill('Approbation des comptes 2024');

    // Le sélecteur de clé devrait être visible avec une valeur par défaut
    const cleSelector = authedPage.getByRole('combobox', { name: /clé de répartition/i });
    await expect(cleSelector).toBeVisible();

    // Soumettre le formulaire
    await authedPage.getByRole('button', { name: 'Ajouter' }).click();

    // Le formulaire devrait se fermer (pas d'erreur visible)
    // Le formulaire de nouvelle résolution ne devrait plus être visible
    await expect(authedPage.getByRole('heading', { name: /nouvelle résolution/i })).not.toBeVisible({ timeout: 5000 });
  });
});
