# Contracts: Dark Mode

**Feature**: 004-dark-mode
**Date**: 2025-12-17

## No API Contracts Required

Dark mode is a **client-side only feature**. There are no:

- REST API endpoints
- GraphQL queries/mutations
- Server-side data contracts
- External service integrations

All theme management happens in the browser using:
- React Context for state
- localStorage for persistence
- CSS variables for styling

---

## TypeScript Contracts

The only contracts for this feature are TypeScript types defined in the data model:

```typescript
// src/types/theme.ts

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeContextValue {
  theme: ThemePreference
  resolvedTheme: ResolvedTheme
  setTheme: (theme: ThemePreference) => void
  isSystemTheme: boolean
}
```

---

## localStorage Contract

| Key | Type | Valid Values |
|-----|------|--------------|
| `ezcopro-theme` | `string \| null` | `'light'`, `'dark'`, `'system'`, or absent |

---

## CSS Contract

Theme is applied via the `dark` class on the `<html>` element:

```html
<!-- Light mode -->
<html lang="fr">

<!-- Dark mode -->
<html lang="fr" class="dark">
```

Components use CSS variables that change based on this class:
- `hsl(var(--background))`
- `hsl(var(--foreground))`
- etc.
