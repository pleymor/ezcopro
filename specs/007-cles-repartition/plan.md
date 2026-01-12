# Implementation Plan: Gestion des clés de répartition

**Branch**: `007-cles-repartition` | **Date**: 2026-01-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-cles-repartition/spec.md`

## Summary

Implement a complete management system for "clés de répartition" (distribution keys) that allows property managers to define how charges are split among co-owners. Each key contains quotes-parts (shares in millièmes, base 10000) for each lot. The feature includes CRUD operations, automatic default key creation based on lot tantièmes, total validation with warnings, and protection against deletion of keys used in fund calls.

## Technical Context

**Language/Version**: TypeScript 5.6.0 (strict mode)
**Primary Dependencies**: Next.js 15.1.0, React 19.0.0, Tailwind CSS 3.4.0, Zod 3.23.0, React Hook Form 7.53.0, Lucide React
**Storage**: Firebase Firestore (via existing hooks pattern)
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Web PWA (responsive, mobile-first)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: List display < 2 seconds, form submission < 1 second
**Constraints**: Offline-capable (future), multi-tenant data isolation per copropriété
**Scale/Scope**: 3-30 lots per copropriété (typical), < 50 keys per copropriété

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | COMPLIANT | Tests will be written before implementation |
| II. Behavior-Driven Development | COMPLIANT | Spec contains Given/When/Then acceptance scenarios |
| III. Type Safety | COMPLIANT | Zod schemas for runtime validation, strict TypeScript |
| IV. Security First | COMPLIANT | Multi-tenant isolation via coproprieteId, auth required |
| V. API-First Design | COMPLIANT | Firebase services pattern with typed contracts |
| VI. Data Integrity | COMPLIANT | Validation warnings for millièmes total, deletion protection |
| VII. Simplicity | COMPLIANT | Following existing patterns (hooks, schemas, forms) |

**Gate Status**: PASS - All principles compliant

## Project Structure

### Documentation (this feature)

```text
specs/007-cles-repartition/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── firebase-services.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── schemas/
│   │   └── cle-repartition.ts      # Zod schemas (NEW - extend existing minimal schema)
│   ├── hooks/
│   │   └── useClesRepartition.ts   # CRUD hook (EXISTS - needs full implementation)
│   └── test/
│       └── mock-data.ts            # Test fixtures (UPDATE)
├── components/
│   ├── forms/
│   │   └── CleRepartitionForm.tsx  # Create/Edit form (NEW)
│   ├── cles-repartition/
│   │   ├── CleRepartitionList.tsx  # List view (NEW)
│   │   ├── CleRepartitionDetail.tsx # Detail view (NEW)
│   │   └── QuotesPartsEditor.tsx   # Quotes-parts grid (NEW)
│   └── layouts/
│       └── Navigation.tsx          # Add submenu (UPDATE)
└── app/(dashboard)/
    └── lots/
        └── cles-repartition/       # NEW route (submenu of Lots)
            ├── page.tsx            # List page
            ├── nouvelle/
            │   └── page.tsx        # Create page
            └── [id]/
                ├── page.tsx        # Detail page
                └── edit/
                    └── page.tsx    # Edit page

tests/
├── unit/
│   └── cle-repartition.test.ts     # Unit tests (NEW)
└── e2e/
    └── cles-repartition.spec.ts    # E2E tests (NEW)
```

**Structure Decision**: Following existing patterns - schemas in `lib/schemas/`, hooks in `lib/hooks/` (note: actually in `src/hooks/`), forms in `components/forms/`, pages in `app/(dashboard)/`. Navigation will be updated to add submenu under "Lots".

## Complexity Tracking

No violations detected - following existing patterns.
