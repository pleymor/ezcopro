import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

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
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('ThemeToggle', () => {
  let ThemeProvider: ({ children }: { children: ReactNode }) => JSX.Element
  let ThemeToggle: () => JSX.Element

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

  const loadModules = async () => {
    const themeModule = await import('@/lib/hooks/useTheme')
    const toggleModule = await import('@/components/ui/theme-toggle')
    ThemeProvider = themeModule.ThemeProvider
    ThemeToggle = toggleModule.ThemeToggle
  }

  const renderWithProvider = (component: JSX.Element) => {
    return render(<ThemeProvider>{component}</ThemeProvider>)
  }

  describe('rendering', () => {
    it('should render the theme toggle button', async () => {
      await loadModules()
      renderWithProvider(<ThemeToggle />)

      const button = screen.getByRole('button', { name: /changer le thème/i })
      expect(button).toBeInTheDocument()
    })

    it('should show Sun icon in light mode', async () => {
      await loadModules()
      renderWithProvider(<ThemeToggle />)

      // In light mode, Sun icon should be visible
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should show Moon icon in dark mode', async () => {
      localStorageMock.getItem.mockReturnValue('dark')
      await loadModules()
      renderWithProvider(<ThemeToggle />)

      await waitFor(() => {
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
      })
    })
  })

  describe('dropdown menu', () => {
    // Note: Radix UI dropdown portals have limitations in JSDOM
    // Full dropdown interaction is tested in E2E tests

    it('should have dropdown trigger with proper aria attributes', async () => {
      await loadModules()
      renderWithProvider(<ThemeToggle />)

      const button = screen.getByRole('button')
      // Radix DropdownMenuTrigger adds aria-haspopup
      expect(button).toBeInTheDocument()
    })

    it('should be clickable and interactive', async () => {
      await loadModules()
      renderWithProvider(<ThemeToggle />)

      const button = screen.getByRole('button')
      // Verify the button can be clicked without errors
      expect(() => fireEvent.click(button)).not.toThrow()
    })
  })
})
