/**
 * Theme type definitions for dark mode feature
 * @see specs/004-dark-mode/data-model.md
 */

/**
 * User's theme preference selection
 * - 'light': Force light mode
 * - 'dark': Force dark mode
 * - 'system': Follow OS/browser preference
 */
export type ThemePreference = 'light' | 'dark' | 'system'

/**
 * The actual theme applied to the document
 * Always resolves to either light or dark
 */
export type ResolvedTheme = 'light' | 'dark'

/**
 * React context value for theme state management
 */
export interface ThemeContextValue {
  /** User's stored preference */
  theme: ThemePreference

  /** Actual applied theme (light or dark) */
  resolvedTheme: ResolvedTheme

  /** Update theme preference */
  setTheme: (theme: ThemePreference) => void

  /** Whether system preference is being used */
  isSystemTheme: boolean
}

/** localStorage key for theme preference */
export const THEME_STORAGE_KEY = 'ezcopro-theme'
