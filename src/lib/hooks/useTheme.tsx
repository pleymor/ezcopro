'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { ThemePreference, ResolvedTheme, ThemeContextValue } from '@/types/theme'
import { THEME_STORAGE_KEY } from '@/types/theme'

const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * Get the system's preferred color scheme
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Get stored theme preference from localStorage
 * Returns 'system' if not set or invalid
 */
function getStoredTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'system'
}

/**
 * Apply theme class to document element
 */
function applyTheme(theme: ResolvedTheme): void {
  if (typeof document === 'undefined') return
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

interface ThemeProviderProps {
  children: ReactNode
}

/**
 * Theme provider component that manages dark mode state
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemePreference>('system')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = getStoredTheme()
    setThemeState(stored)
  }, [])

  // Update resolved theme and apply class when theme changes
  useEffect(() => {
    const resolved: ResolvedTheme = theme === 'system' ? getSystemTheme() : theme
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [theme])

  // Listen for system preference changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handler = (e: MediaQueryListEvent) => {
      const newTheme: ResolvedTheme = e.matches ? 'dark' : 'light'
      setResolvedTheme(newTheme)
      applyTheme(newTheme)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  /**
   * Update theme preference and persist to localStorage
   */
  const setTheme = (newTheme: ThemePreference) => {
    setThemeState(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        isSystemTheme: theme === 'system',
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to access theme context
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
