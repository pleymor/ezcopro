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
  isMobile: boolean;
};

export const test = base.extend<AuthFixtures>({
  isMobile: [async ({ }, use, testInfo) => {
    // Check if test is running with a mobile project (mobile-chrome, etc.)
    const isMobile = testInfo.project.name.toLowerCase().includes('mobile');
    await use(isMobile);
  }, { scope: 'test' }],
  authedPage: async ({ page }, use) => {
    // Pre-configure localStorage before any page loads using addInitScript
    await page.addInitScript((copro) => {
      // Set copro selection
      localStorage.setItem('ezcopro_selected_copro_id', copro.id);
      localStorage.setItem('ezcopro_selected_copro', JSON.stringify(copro));
      // Ensure syndic role (default in test mode)
      localStorage.setItem('ezcopro_test_role', 'syndic');
    }, TEST_COPRO);

    // Navigate directly to dashboard - localStorage will be set before React hydrates
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');

    // Verify we're authenticated by checking we're not on login page
    const url = page.url();
    if (url.includes('/login')) {
      throw new Error('Test mode authentication failed - still on login page. Make sure NEXT_PUBLIC_TEST_MODE=true is set.');
    }

    await use(page);
  },
});

export { expect };
