import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ReactNode, type JSX } from 'react'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

// Mock matchMedia
const createMatchMediaMock = (matches: boolean) => {
  const listeners: Array<(e: MediaQueryListEvent) => void> = []
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
      if (event === 'change') listeners.push(listener)
    }),
    removeEventListener: vi.fn((_event: string, listener: (e: MediaQueryListEvent) => void) => {
      const index = listeners.indexOf(listener)
      if (index > -1) listeners.splice(index, 1)
    }),
    dispatchEvent: vi.fn((event: MediaQueryListEvent) => {
      listeners.forEach((listener) => listener(event))
      return true
    }),
    // Helper for tests
    _triggerChange: (newMatches: boolean) => {
      const event = { matches: newMatches } as MediaQueryListEvent
      listeners.forEach((listener) => listener(event))
    },
  }))
}

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('useTheme', () => {
  let ThemeProvider: ({ children }: { children: ReactNode }) => JSX.Element
  let useTheme: () => {
    theme: 'light' | 'dark' | 'system'
    resolvedTheme: 'light' | 'dark'
    setTheme: (theme: 'light' | 'dark' | 'system') => void
    isSystemTheme: boolean
  }

  beforeEach(() => {
    vi.resetModules()
    localStorageMock.clear()
    vi.clearAllMocks()
    document.documentElement.classList.remove('dark')
    window.matchMedia = createMatchMediaMock(false)
  })

  afterEach(() => {
    vi.resetModules()
  })

  const loadModule = async () => {
    const module = await import('@/lib/hooks/useTheme')
    ThemeProvider = module.ThemeProvider
    useTheme = module.useTheme
  }

  describe('initialization', () => {
    it('should default to system theme when localStorage is empty', async () => {
      await loadModule()

      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper })

      expect(result.current.theme).toBe('system')
      expect(result.current.isSystemTheme).toBe(true)
    })

    it('should load light theme from localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('light')
      await loadModule()

      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper })

      // Wait for useEffect to run
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(result.current.theme).toBe('light')
      expect(result.current.resolvedTheme).toBe('light')
    })

    it('should load dark theme from localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('dark')
      await loadModule()

      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(result.current.theme).toBe('dark')
      expect(result.current.resolvedTheme).toBe('dark')
    })

    it('should ignore invalid localStorage values and default to system', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-value')
      await loadModule()

      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper })

      expect(result.current.theme).toBe('system')
    })
  })

  describe('setTheme', () => {
    it('should update theme to dark and persist to localStorage', async () => {
      await loadModule()

      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper })

      act(() => {
        result.current.setTheme('dark')
      })

      expect(result.current.theme).toBe('dark')
      expect(result.current.resolvedTheme).toBe('dark')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('ezcopro-theme', 'dark')
    })

    it('should update theme to light and persist to localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('dark')
      await loadModule()

      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.setTheme('light')
      })

      expect(result.current.theme).toBe('light')
      expect(result.current.resolvedTheme).toBe('light')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('ezcopro-theme', 'light')
    })

    it('should update theme to system and persist to localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('dark')
      await loadModule()

      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper })

      act(() => {
        result.current.setTheme('system')
      })

      expect(result.current.theme).toBe('system')
      expect(result.current.isSystemTheme).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('ezcopro-theme', 'system')
    })
  })

  describe('system preference detection', () => {
    it('should resolve to dark when system prefers dark and theme is system', async () => {
      // Reset mocks before setting up new mock
      localStorageMock.getItem.mockReset()
      localStorageMock.getItem.mockReturnValue(null)
      window.matchMedia = createMatchMediaMock(true) // System prefers dark
      await loadModule()

      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(result.current.theme).toBe('system')
      expect(result.current.resolvedTheme).toBe('dark')
    })

    it('should resolve to light when system prefers light and theme is system', async () => {
      // Reset mocks before setting up new mock
      localStorageMock.getItem.mockReset()
      localStorageMock.getItem.mockReturnValue(null)
      window.matchMedia = createMatchMediaMock(false) // System prefers light
      await loadModule()

      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(result.current.theme).toBe('system')
      expect(result.current.resolvedTheme).toBe('light')
    })
  })

  describe('DOM class management', () => {
    it('should add dark class to documentElement when theme is dark', async () => {
      await loadModule()

      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper })

      act(() => {
        result.current.setTheme('dark')
      })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should remove dark class from documentElement when theme is light', async () => {
      document.documentElement.classList.add('dark')
      await loadModule()

      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper })

      act(() => {
        result.current.setTheme('light')
      })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should throw error when useTheme is used outside ThemeProvider', async () => {
      await loadModule()

      expect(() => {
        renderHook(() => useTheme())
      }).toThrow('useTheme must be used within a ThemeProvider')
    })
  })
})
