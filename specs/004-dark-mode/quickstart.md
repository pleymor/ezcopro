# Quickstart: Dark Mode Implementation

**Feature**: 004-dark-mode
**Date**: 2025-12-17

## Prerequisites

- Node.js 24+
- Project dependencies installed (`npm install`)
- Feature branch checked out (`git checkout 004-dark-mode`)

---

## Quick Implementation Guide

### Step 1: Add Dark Mode CSS Variables

**File**: `src/app/globals.css`

Add after the `:root` block:

```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 6%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 6%;
  --popover-foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 84% 4.9%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 50.6%;
  --destructive-foreground: 210 40% 98%;
  --success: 142 71% 45%;
  --success-foreground: 210 40% 98%;
  --warning: 38 92% 50%;
  --warning-foreground: 222.2 84% 4.9%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 48%;
}
```

### Step 2: Create Theme Types

**File**: `src/types/theme.ts`

```typescript
export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeContextValue {
  theme: ThemePreference
  resolvedTheme: ResolvedTheme
  setTheme: (theme: ThemePreference) => void
  isSystemTheme: boolean
}
```

### Step 3: Create Theme Hook

**File**: `src/lib/hooks/useTheme.tsx`

```typescript
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { ThemePreference, ResolvedTheme, ThemeContextValue } from '@/types/theme'

const STORAGE_KEY = 'ezcopro-theme'

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'system'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>('system')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')

  // Initialize from localStorage
  useEffect(() => {
    setThemeState(getStoredTheme())
  }, [])

  // Update resolved theme and apply class
  useEffect(() => {
    const resolved = theme === 'system' ? getSystemTheme() : theme
    setResolvedTheme(resolved)

    if (resolved === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Listen for system preference changes
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light'
      setResolvedTheme(newTheme)
      document.documentElement.classList.toggle('dark', e.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  const setTheme = (newTheme: ThemePreference) => {
    setThemeState(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      resolvedTheme,
      setTheme,
      isSystemTheme: theme === 'system'
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
```

### Step 4: Add FOUC Prevention Script

**File**: `src/app/layout.tsx`

Add this script inside `<head>` (before body):

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        try {
          var stored = localStorage.getItem('ezcopro-theme');
          var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          var isDark = stored === 'dark' || ((stored === 'system' || !stored) && prefersDark);
          if (isDark) document.documentElement.classList.add('dark');
        } catch (e) {}
      })();
    `,
  }}
/>
```

### Step 5: Add ThemeProvider to Providers

**File**: `src/app/providers.tsx`

```typescript
import { ThemeProvider } from '@/lib/hooks/useTheme'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CoproprieteProvider>
          {children}
        </CoproprieteProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
```

### Step 6: Create Theme Toggle Component

**File**: `src/components/ui/theme-toggle.tsx`

```typescript
'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/lib/hooks/useTheme'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {resolvedTheme === 'dark' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          <span className="sr-only">Changer le thème</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          Clair
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          Sombre
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          Système
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Step 7: Add Toggle to Navigation

**File**: `src/components/layouts/Navigation.tsx`

Import and add the ThemeToggle component to the header:

```typescript
import { ThemeToggle } from '@/components/ui/theme-toggle'

// In the desktop sidebar, add before the user email section:
<ThemeToggle />

// In the mobile header, add the toggle button:
<ThemeToggle />
```

---

## Testing Commands

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run Storybook for visual testing
npm run storybook
```

---

## Verification Checklist

- [ ] Toggle button appears in navigation header
- [ ] Clicking toggle opens dropdown with 3 options
- [ ] Selecting "Sombre" applies dark mode immediately
- [ ] Selecting "Clair" applies light mode immediately
- [ ] Selecting "Système" follows OS preference
- [ ] Theme persists after page reload
- [ ] No flash of wrong theme on initial load
- [ ] All text remains readable in both themes
