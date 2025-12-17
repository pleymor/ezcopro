# Research: Dark Mode Implementation

**Feature**: 004-dark-mode
**Date**: 2025-12-17

## Research Summary

This document consolidates research findings for implementing dark mode in the EzCopro application. No NEEDS CLARIFICATION items were identified in the technical context - the existing codebase is well-prepared for this feature.

---

## 1. Tailwind CSS Dark Mode Strategy

### Decision: Class-based dark mode with CSS variables

### Rationale
- Tailwind config already has `darkMode: ['class']` enabled
- Existing CSS variable system in globals.css uses HSL format
- All UI components already use `hsl(var(--color-name))` pattern
- Class-based approach allows programmatic control (vs media query)

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Media query dark mode | Cannot override system preference; no user control |
| CSS-in-JS theme | Would require rewriting all components |
| Separate dark stylesheets | Maintenance burden, potential FOUC |

---

## 2. Theme State Management

### Decision: Custom React Context + localStorage

### Rationale
- Simple, no additional dependencies
- Full control over initialization timing (FOUC prevention)
- Matches existing provider pattern in the codebase (AuthProvider, CoproprieteProvider)
- localStorage is synchronous, enabling immediate theme application

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| next-themes library | Adds dependency; custom solution is simple enough |
| Zustand/Jotai | Overkill for single boolean-like state |
| Cookie-based storage | Requires server-side handling, adds complexity |

### Implementation Pattern
```typescript
type ThemePreference = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

// Context provides:
// - theme: ThemePreference (user's stored choice)
// - resolvedTheme: ResolvedTheme (actual applied theme)
// - setTheme: (theme: ThemePreference) => void
```

---

## 3. FOUC Prevention Strategy

### Decision: Inline blocking script in `<head>`

### Rationale
- Script runs before React hydration
- Reads localStorage synchronously
- Applies `dark` class to `<html>` immediately
- Root layout already has `suppressHydrationWarning` prop

### Implementation Pattern
```javascript
// Inline script (blocking, in <head>)
(function() {
  const stored = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = stored === 'dark' || (stored === 'system' && prefersDark) || (!stored && prefersDark)
  if (theme) document.documentElement.classList.add('dark')
})()
```

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| useLayoutEffect | Runs after paint, causes flash |
| Server-side rendering | Requires cookies, adds complexity |
| CSS media query fallback | Conflicts with class-based approach |

---

## 4. Dark Color Palette

### Decision: Inverted semantic colors maintaining WCAG AA contrast

### Rationale
- Must maintain 4.5:1 contrast ratio (Success Criteria SC-004)
- Follow same HSL variable pattern as light mode
- Keep semantic meaning (primary, destructive, success colors stay recognizable)

### Color Mapping Strategy
| Variable | Light Mode | Dark Mode | Notes |
|----------|------------|-----------|-------|
| --background | 0 0% 100% (white) | 222 84% 5% (dark blue) | Inverted |
| --foreground | 222 84% 5% | 210 40% 98% | Inverted |
| --card | 0 0% 100% | 222 84% 8% | Slightly lighter than bg |
| --primary | 221 83% 53% | 217 91% 60% | Slightly brighter |
| --muted | 210 40% 96% | 217 33% 17% | Dark gray |
| --border | 214 32% 91% | 217 33% 17% | Matches muted |

### Contrast Validation Required
- All text on background: minimum 4.5:1
- Interactive elements: visible focus states
- Icons: sufficient contrast in both themes

---

## 5. Component Audit

### Decision: CSS variables handle all components automatically

### Rationale
- All UI components use `hsl(var(--color))` pattern
- No hardcoded colors found in component files
- Tailwind utility classes use CSS variable references
- One orphaned `dark:` class found (alert.tsx) - will work once dark vars defined

### Components Using Theme Variables
All components in `/src/components/ui/`:
- button.tsx ✅
- card.tsx ✅
- select.tsx ✅
- input.tsx ✅
- dialog.tsx ✅
- alert.tsx ✅
- badge.tsx ✅
- dropdown-menu.tsx ✅
- (and others)

### No Migration Needed
Components already support theming via CSS variables. Adding dark mode variables in globals.css will automatically apply.

---

## 6. Theme Toggle UI

### Decision: Icon button with dropdown menu (3 options)

### Rationale
- FR-002 requires three options: Light, Dark, System
- Simple toggle would only support 2 states
- Dropdown provides clear UX for 3-state selection
- Matches existing dropdown-menu component pattern

### UI Pattern
```
[Sun icon ▼] → Dropdown:
  ○ Light
  ○ Dark
  ○ System
```

### Icon Selection (Lucide React)
- Light mode: `Sun` icon
- Dark mode: `Moon` icon
- System mode: `Monitor` icon (or show resolved theme icon)

---

## 7. System Preference Detection

### Decision: MediaQueryList with change listener

### Rationale
- `prefers-color-scheme` media query is widely supported
- MediaQueryList.addEventListener enables real-time updates
- Fallback to light mode for unsupported browsers (Edge case in spec)

### Implementation Pattern
```typescript
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

// Initial check
const systemPrefersDark = mediaQuery.matches

// Listen for changes (when theme === 'system')
mediaQuery.addEventListener('change', (e) => {
  if (theme === 'system') {
    setResolvedTheme(e.matches ? 'dark' : 'light')
  }
})
```

---

## 8. localStorage Key and Schema

### Decision: Single key with string value

### Rationale
- Simple, matches common patterns
- No need for complex object storage
- Easy to inspect/debug in browser devtools

### Schema
```typescript
// Key: 'ezcopro-theme'
// Values: 'light' | 'dark' | 'system' | null (not set)

// Read
const stored = localStorage.getItem('ezcopro-theme') as ThemePreference | null

// Write
localStorage.setItem('ezcopro-theme', theme)
```

---

## 9. Testing Strategy

### Decision: Unit + Integration + E2E coverage

### Unit Tests (Vitest)
- useTheme hook: state transitions, localStorage sync
- Theme resolution logic: system preference handling
- Edge cases: invalid localStorage values, missing APIs

### Integration Tests (Vitest + React Testing Library)
- ThemeToggle component: renders, responds to clicks
- ThemeProvider: provides context correctly
- Theme persistence across mount/unmount

### E2E Tests (Playwright)
- Full user journey: toggle theme, verify visual change
- Persistence: reload page, verify theme preserved
- System preference: mock media query, verify response

---

## 10. Browser Support

### Decision: Modern browsers with graceful degradation

### Supported
- Chrome 76+ (prefers-color-scheme)
- Firefox 67+
- Safari 12.1+
- Edge 79+

### Fallback Behavior
- No localStorage: defaults to system, then light
- No prefers-color-scheme: defaults to light
- No JavaScript: light mode (CSS default)

---

## Conclusion

No unresolved NEEDS CLARIFICATION items. The codebase is well-prepared for dark mode implementation:

1. **Infrastructure ready**: Tailwind dark mode configured, CSS variables in place
2. **Pattern established**: Provider pattern, component library using variables
3. **Clear approach**: Class-based dark mode + localStorage + FOUC prevention script
4. **Testing strategy**: Comprehensive coverage across all test levels

Proceed to Phase 1: Design & Contracts.
