import { test as base, expect, Page } from '@playwright/test';

// Test data constants (must match src/lib/test/mock-data.ts)
export const TEST_USER = {
  uid: 'test-user-123',
  email: 'test@ezcopro.local',
  displayName: 'Test User',
};

export const TEST_COPRO = {
  id: 'test-copro-123',
  nom: 'Résidence Test',
  adresse: '123 Rue du Test, 75001 Paris',
  members: [TEST_USER.uid],
};

export const TEST_LOT = {
  id: 'test-lot-1',
  numero: '101',
  type: 'appartement' as const,
  tantiemes: 250,
  etage: 1,
  superficie: 65,
  coproprietaireId: 'test-cp-1',
};

export const TEST_COPROPRIETAIRE = {
  id: 'test-cp-1',
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean.dupont@example.com',
  telephone: '0612345678',
};

// Authenticated test fixture
type AuthFixtures = {
  authedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authedPage: async ({ page }, use) => {
    // In test mode (NEXT_PUBLIC_TEST_MODE=true), the app automatically
    // uses mock data and bypasses Firebase authentication.
    // We just need to navigate to the app and let the test mode handle auth.

    // Go to the app - test mode will auto-login with TEST_USER
    await page.goto('/dashboard');

    // Wait for the page to load (test mode should auto-authenticate)
    await page.waitForLoadState('networkidle');

    // Verify we're authenticated by checking we're not on login page
    const url = page.url();
    if (url.includes('/login')) {
      throw new Error('Test mode authentication failed - still on login page. Make sure NEXT_PUBLIC_TEST_MODE=true is set.');
    }

    // Set the selected copro in localStorage (test mode still uses localStorage for copro selection)
    await page.evaluate(
      (copro) => {
        localStorage.setItem('ezcopro_selected_copro_id', copro.id);
        localStorage.setItem('ezcopro_selected_copro', JSON.stringify(copro));
      },
      TEST_COPRO
    );

    // Refresh to apply the copro selection
    await page.reload();
    await page.waitForLoadState('networkidle');

    await use(page);
  },
});

export { expect };
