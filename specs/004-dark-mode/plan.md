# Implementation Plan: Dark Mode

**Branch**: `004-dark-mode` | **Date**: 2025-12-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-dark-mode/spec.md`

## Summary

Implement a dark mode feature with three theme options (Light, Dark, System) accessible via an icon button in the header/navigation bar. The implementation leverages Tailwind CSS's existing class-based dark mode support and the established CSS variable system. Theme preference will be stored in localStorage with FOUC prevention via early script injection.

## Technical Context

**Language/Version**: TypeScript 5.6.0 (strict mode enabled)
**Primary Dependencies**: Next.js 15.1.0, React 19.0.0, Tailwind CSS 3.4.0, Lucide React (icons)
**Storage**: localStorage (browser-side preference persistence)
**Testing**: Vitest (unit), Playwright (E2E), Storybook 8.4.0 (component)
**Target Platform**: Web (PWA-ready), responsive (mobile + desktop)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Theme toggle < 100ms response, zero FOUC
**Constraints**: WCAG AA compliance (4.5:1 contrast ratio), offline-capable preference storage
**Scale/Scope**: All existing UI components (~15 components in /src/components/ui/)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | ✅ PASS | Tests will be written before implementation per tasks.md |
| II. Behavior-Driven Development | ✅ PASS | BDD acceptance scenarios defined in spec.md |
| III. Type Safety | ✅ PASS | ThemePreference type will be strictly typed ('light' \| 'dark' \| 'system') |
| IV. Security First | ✅ PASS | No security implications (client-only localStorage, no sensitive data) |
| V. API-First Design | ⚪ N/A | No API endpoints required (client-side only feature) |
| VI. Data Integrity & Auditability | ⚪ N/A | No server-side data or financial data involved |
| VII. Simplicity & Pragmatism | ✅ PASS | Using existing Tailwind dark mode; no custom theme engine |

**Gate Result**: PASS - Proceed to Phase 0

### Post-Phase 1 Re-check

| Principle | Status | Verification |
|-----------|--------|--------------|
| I. Test-First Development | ✅ PASS | Test files planned in project structure |
| II. Behavior-Driven Development | ✅ PASS | E2E tests map to acceptance scenarios |
| III. Type Safety | ✅ PASS | Types defined in data-model.md: `ThemePreference`, `ResolvedTheme`, `ThemeContextValue` |
| VII. Simplicity & Pragmatism | ✅ PASS | No over-engineering: simple context, localStorage, CSS variables |

**Post-Design Gate**: PASS - Ready for `/speckit.tasks`

## Project Structure

### Documentation (this feature)

```text
specs/004-dark-mode/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (minimal for client-only feature)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── globals.css              # ADD: dark mode CSS variables
│   ├── layout.tsx               # MODIFY: add theme script for FOUC prevention
│   └── providers.tsx            # MODIFY: add ThemeProvider
├── components/
│   ├── layouts/
│   │   └── Navigation.tsx       # MODIFY: add theme toggle button
│   └── ui/
│       └── theme-toggle.tsx     # NEW: theme toggle component
├── lib/
│   └── hooks/
│       └── useTheme.ts          # NEW: theme context hook
└── types/
    └── theme.ts                 # NEW: theme type definitions

tests/
├── unit/
│   └── useTheme.test.ts         # NEW: theme hook unit tests
├── integration/
│   └── theme-toggle.test.ts     # NEW: component integration tests
└── e2e/
    └── dark-mode.spec.ts        # NEW: E2E acceptance tests
```

**Structure Decision**: Single Next.js web application. Dark mode is a frontend-only feature affecting the existing UI layer. No backend changes required.

## Complexity Tracking

> No violations to justify - implementation follows Constitution principles.

| Aspect | Approach | Justification |
|--------|----------|---------------|
| Theme state | React Context | Standard pattern, no external state library needed |
| Persistence | localStorage | Simple, offline-capable, no auth required |
| FOUC prevention | Inline script | Industry standard (next-themes pattern) |
| CSS approach | CSS variables | Already in use, no migration needed |
