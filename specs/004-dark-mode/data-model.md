# Data Model: Dark Mode

**Feature**: 004-dark-mode
**Date**: 2025-12-17

## Overview

Dark mode is a client-side only feature. There is no server-side data model or database entities. All state is managed locally in the browser.

---

## Client-Side Types

### ThemePreference

The user's explicit theme choice stored in localStorage.

```typescript
/**
 * User's theme preference selection
 * - 'light': Force light mode
 * - 'dark': Force dark mode
 * - 'system': Follow OS/browser preference
 */
type ThemePreference = 'light' | 'dark' | 'system'
```

**Storage**: `localStorage.getItem('ezcopro-theme')`
**Default**: `null` (not set) → treated as `'system'`

---

### ResolvedTheme

The actual theme being applied to the UI, derived from ThemePreference and system settings.

```typescript
/**
 * The actual theme applied to the document
 * Always resolves to either light or dark
 */
type ResolvedTheme = 'light' | 'dark'
```

**Derivation Logic**:
| ThemePreference | System Prefers Dark | ResolvedTheme |
|-----------------|---------------------|---------------|
| 'light' | any | 'light' |
| 'dark' | any | 'dark' |
| 'system' | true | 'dark' |
| 'system' | false | 'light' |
| null (not set) | true | 'dark' |
| null (not set) | false | 'light' |

---

### ThemeContext

React context value for theme state management.

```typescript
interface ThemeContextValue {
  /** User's stored preference */
  theme: ThemePreference

  /** Actual applied theme (light or dark) */
  resolvedTheme: ResolvedTheme

  /** Update theme preference */
  setTheme: (theme: ThemePreference) => void

  /** Whether system preference is being used */
  isSystemTheme: boolean
}
```

---

## State Transitions

```
┌─────────────────────────────────────────────────────────────┐
│                    Theme State Machine                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐    setTheme('dark')    ┌──────────┐          │
│  │  Light   │ ───────────────────────▶│   Dark   │          │
│  │  Mode    │◀─────────────────────── │   Mode   │          │
│  └────┬─────┘    setTheme('light')   └────┬─────┘          │
│       │                                     │                │
│       │ setTheme('system')   setTheme('system')             │
│       │                                     │                │
│       ▼                                     ▼                │
│  ┌──────────────────────────────────────────────┐           │
│  │              System Mode                      │           │
│  │  (resolves to light or dark based on OS)     │           │
│  └──────────────────────────────────────────────┘           │
│                         │                                    │
│                         │ OS preference changes              │
│                         ▼                                    │
│            ┌────────────────────────┐                       │
│            │ ResolvedTheme updates  │                       │
│            │ (light ↔ dark)         │                       │
│            └────────────────────────┘                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## localStorage Schema

### Key
```
ezcopro-theme
```

### Values
| Stored Value | Meaning |
|--------------|---------|
| `"light"` | User explicitly chose light mode |
| `"dark"` | User explicitly chose dark mode |
| `"system"` | User explicitly chose to follow system |
| (key absent) | No preference set, default to system behavior |

### Validation
```typescript
function isValidThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

function getStoredTheme(): ThemePreference {
  const stored = localStorage.getItem('ezcopro-theme')
  if (stored && isValidThemePreference(stored)) {
    return stored
  }
  return 'system' // Default for invalid or missing values
}
```

---

## CSS Variables (Dark Mode)

New CSS variables to add to `globals.css` under `.dark` selector:

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

---

## No Database Changes

This feature does not require:
- Database migrations
- Firestore collections/documents
- Server-side API endpoints
- User profile fields

All theme preference data is stored client-side in localStorage.
