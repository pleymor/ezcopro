import { test, expect } from '@playwright/test'

test.describe('Dark Mode Feature', () => {
  test.describe('User Story 1 - Manual Theme Toggle', () => {
    test.beforeEach(async ({ page }) => {
      // Clear localStorage before each test
      await page.goto('/login')
      await page.evaluate(() => localStorage.clear())
    })

    test('Scenario 1: Given light mode, When click toggle and select dark, Then interface switches to dark mode', async ({
      page,
    }) => {
      // Given: app is in light mode (default)
      await page.goto('/login')

      // Verify initially in light mode (no dark class)
      const htmlClass = await page.evaluate(() =>
        document.documentElement.classList.contains('dark')
      )
      expect(htmlClass).toBe(false)

      // When: click theme toggle and select dark
      await page.getByRole('button', { name: /changer le thème/i }).click()
      await page.getByText('Sombre').click()

      // Then: interface switches to dark mode
      const isDark = await page.evaluate(() =>
        document.documentElement.classList.contains('dark')
      )
      expect(isDark).toBe(true)
    })

    test('Scenario 2: Given dark mode, When click toggle and select light, Then interface switches to light mode', async ({
      page,
    }) => {
      // Given: app is in dark mode
      await page.goto('/login')
      await page.evaluate(() => localStorage.setItem('ezcopro-theme', 'dark'))
      await page.reload()

      // Verify in dark mode
      const initialDark = await page.evaluate(() =>
        document.documentElement.classList.contains('dark')
      )
      expect(initialDark).toBe(true)

      // When: click theme toggle and select light
      await page.getByRole('button', { name: /changer le thème/i }).click()
      await page.getByText('Clair').click()

      // Then: interface switches to light mode
      const isDark = await page.evaluate(() =>
        document.documentElement.classList.contains('dark')
      )
      expect(isDark).toBe(false)
    })

    test('Scenario 3: Given theme toggled, When navigate to another page, Then theme persists', async ({
      page,
    }) => {
      // Given: user has toggled to dark theme
      await page.goto('/login')
      await page.getByRole('button', { name: /changer le thème/i }).click()
      await page.getByText('Sombre').click()

      // Verify dark mode is applied
      const initialDark = await page.evaluate(() =>
        document.documentElement.classList.contains('dark')
      )
      expect(initialDark).toBe(true)

      // When: navigate to another page (reload simulates navigation)
      await page.reload()

      // Then: theme persists
      const persistedDark = await page.evaluate(() =>
        document.documentElement.classList.contains('dark')
      )
      expect(persistedDark).toBe(true)
    })

    test('Scenario 4: Given theme toggled, When close and reopen app, Then theme is preserved', async ({
      page,
      context,
    }) => {
      // Given: user has toggled to dark theme
      await page.goto('/login')
      await page.getByRole('button', { name: /changer le thème/i }).click()
      await page.getByText('Sombre').click()

      // When: close and reopen app (new page in same context preserves localStorage)
      const newPage = await context.newPage()
      await newPage.goto('/login')

      // Then: theme is preserved
      const persistedDark = await newPage.evaluate(() =>
        document.documentElement.classList.contains('dark')
      )
      expect(persistedDark).toBe(true)

      await newPage.close()
    })
  })

  test.describe('User Story 2 - System Preference Detection', () => {
    test('Scenario 5: Given new user with system dark mode, When open app first time, Then app displays dark', async ({
      page,
    }) => {
      // Given: new user with system dark mode enabled
      await page.emulateMedia({ colorScheme: 'dark' })

      // Navigate first, then clear localStorage (can't access localStorage on about:blank)
      await page.goto('/login')
      await page.evaluate(() => localStorage.removeItem('ezcopro-theme'))

      // When: open app for the first time (reload to apply system preference)
      await page.reload()

      // Then: app displays in dark mode
      const isDark = await page.evaluate(() =>
        document.documentElement.classList.contains('dark')
      )
      expect(isDark).toBe(true)
    })

    test('Scenario 6: Given new user with system light mode, When open app first time, Then app displays light', async ({
      page,
    }) => {
      // Given: new user with system light mode enabled
      await page.emulateMedia({ colorScheme: 'light' })

      // Navigate first, then clear localStorage (can't access localStorage on about:blank)
      await page.goto('/login')
      await page.evaluate(() => localStorage.removeItem('ezcopro-theme'))

      // When: open app for the first time (reload to apply system preference)
      await page.reload()

      // Then: app displays in light mode
      const isDark = await page.evaluate(() =>
        document.documentElement.classList.contains('dark')
      )
      expect(isDark).toBe(false)
    })

    test('Scenario 7: Given user has manually selected theme, When system preference changes, Then app maintains user selection', async ({
      page,
    }) => {
      // Given: user has manually selected light theme
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto('/login')
      await page.getByRole('button', { name: /changer le thème/i }).click()
      await page.getByText('Clair').click()

      // Verify light mode is applied despite system dark
      const isLight = await page.evaluate(() =>
        !document.documentElement.classList.contains('dark')
      )
      expect(isLight).toBe(true)

      // When: system preference changes (we can't truly change it, but we can verify localStorage takes precedence)
      await page.reload()

      // Then: app maintains user's manual selection (light)
      const stillLight = await page.evaluate(() =>
        !document.documentElement.classList.contains('dark')
      )
      expect(stillLight).toBe(true)
    })
  })

  test.describe('User Story 3 - Theme with System Option', () => {
    test('Scenario 8: Given user selects System, When system is dark, Then app shows dark', async ({
      page,
    }) => {
      // Given: user selects System option with dark system preference
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto('/login')
      await page.evaluate(() => localStorage.setItem('ezcopro-theme', 'light'))
      await page.reload()

      // Select System option
      await page.getByRole('button', { name: /changer le thème/i }).click()
      await page.getByText('Système').click()

      // Then: app shows dark (following system)
      const isDark = await page.evaluate(() =>
        document.documentElement.classList.contains('dark')
      )
      expect(isDark).toBe(true)
    })

    test('Scenario 9: Given user selects System, When system is light, Then app shows light', async ({
      page,
    }) => {
      // Given: user selects System option with light system preference
      await page.emulateMedia({ colorScheme: 'light' })
      await page.goto('/login')
      await page.evaluate(() => localStorage.setItem('ezcopro-theme', 'dark'))
      await page.reload()

      // Select System option
      await page.getByRole('button', { name: /changer le thème/i }).click()
      await page.getByText('Système').click()

      // Then: app shows light (following system)
      const isDark = await page.evaluate(() =>
        document.documentElement.classList.contains('dark')
      )
      expect(isDark).toBe(false)
    })
  })
})
