import { test as base, expect, Page } from '@playwright/test';

// Test data constants for extranet (copropriétaire side)
// Must match src/lib/test/mock-data-extranet.ts
export const TEST_COPROPRIETAIRE_USER = {
  uid: 'test-coproprietaire-user-123',
  email: 'jean.dupont@example.com',
  displayName: 'Jean Dupont',
};

export const TEST_COPRO = {
  id: 'test-copro-123',
  nom: 'Résidence Test',
  adresse: '123 Rue du Test, 75001 Paris',
};

export const TEST_COPROPRIETAIRE = {
  id: 'test-cp-1',
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean.dupont@example.com',
};

// Screenshots directory for review
const SCREENSHOTS_DIR = 'tests/e2e/screenshots/extranet';

// Authenticated test fixture for extranet (copropriétaire)
type ExtranetAuthFixtures = {
  extranetPage: Page;
  isMobile: boolean;
  takeScreenshot: (name: string) => Promise<void>;
};

export const test = base.extend<ExtranetAuthFixtures>({
  isMobile: [async ({}, use, testInfo) => {
    const isMobile = testInfo.project.name.toLowerCase().includes('mobile');
    await use(isMobile);
  }, { scope: 'test' }],

  extranetPage: async ({ page }, use) => {
    // Pre-configure localStorage before any page loads using addInitScript
    await page.addInitScript(({ copro, coproprietaire }) => {
      // Set copro selection
      localStorage.setItem('ezcopro_selected_copro_id', copro.id);
      localStorage.setItem('ezcopro_selected_copro', JSON.stringify(copro));
      // Set copropriétaire role indicator for test mode
      localStorage.setItem('ezcopro_test_role', 'coproprietaire');
      localStorage.setItem('ezcopro_test_coproprietaire_id', coproprietaire.id);
    }, { copro: TEST_COPRO, coproprietaire: TEST_COPROPRIETAIRE });

    // Navigate directly to extranet - localStorage will be set before React hydrates
    await page.goto('/extranet', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');

    // Verify we're on extranet
    const url = page.url();
    if (url.includes('/login')) {
      throw new Error('Test mode authentication failed - redirected to login page.');
    }

    await use(page);
  },

  takeScreenshot: async ({ page }, use, testInfo) => {
    const screenshotFn = async (name: string) => {
      const screenshotPath = `${SCREENSHOTS_DIR}/${testInfo.title.replace(/[^a-zA-Z0-9]/g, '-')}-${name}.png`;
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      console.log(`Screenshot saved: ${screenshotPath}`);
    };
    await use(screenshotFn);
  },
});

export { expect };
