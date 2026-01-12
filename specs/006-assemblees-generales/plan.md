# Implementation Plan: Gestion des Assemblées Générales

**Feature Branch**: `006-assemblees-generales`
**Created**: 2025-01-12
**Status**: Planning

## Technical Context

### Existing Stack (from codebase analysis)
- **Framework**: Next.js 15.1.0 (App Router) + React 19.0.0
- **Language**: TypeScript 5.6.0 (strict mode)
- **Database**: Firebase Firestore (subcollections under `coproprietes/{coproId}/`)
- **Validation**: Zod schemas for all entities
- **State Management**: React hooks + Firebase real-time subscriptions
- **UI**: Tailwind CSS + Radix UI + Lucide icons
- **Testing**: Vitest (unit) + Playwright (E2E) + Testing Library
- **Forms**: react-hook-form + @hookform/resolvers

### Existing Entities (dependencies)
- `Coproprietaire`: id, nom, prenom, email, telephone, userId
- `Lot`: id, numero, type, tantiemes, coproprietaireId, description
- `Copropriete`: id, nom, adresse, etc.

### New Entities Required
- `AssembleeGenerale`
- `Resolution`
- `Presence`
- `Vote`
- `CleRepartition` (mock/seed data only)

## Constitution Check

### Principle Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First (TDD) | WILL COMPLY | Tests written before implementation for each story |
| II. BDD Scenarios | COMPLIANT | 23 acceptance scenarios defined in spec |
| III. Type Safety | WILL COMPLY | Zod schemas + strict TypeScript |
| IV. Security First | WILL COMPLY | Multi-tenant isolation via coproId in paths |
| V. API-First | WILL COMPLY | Firestore services follow existing patterns |
| VI. Data Integrity | WILL COMPLY | Firestore transactions for votes, audit trail via historique |
| VII. Simplicity | WILL COMPLY | Browser print for documents (no external PDF lib) |

### Gate Violations
None identified. All requirements align with constitution principles.

## Phase 0: Research Complete

### Technical Decisions

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Firestore subcollections | Consistent with existing architecture | Separate root collection (rejected: breaks isolation) |
| Browser print for documents | Simplicity principle, no new dependencies | jsPDF (rejected: complexity), server PDF (rejected: cost) |
| Sequential vote screens | Better UX for AG flow, reduces errors | Global table (rejected: complex UI) |
| Tantièmes per clé de répartition | Legal compliance, future-proof | Single tantièmes (rejected: not legally accurate) |

### Patterns to Follow (from existing code)
- Zod schemas in `src/lib/schemas/`
- Firebase services in `src/lib/firebase/services/`
- Types re-exported from `src/types/`
- Test mode with mock store (`IS_TEST_MODE`)
- Historique entries for audit trail

## Phase 1: Data Model

See [data-model.md](./data-model.md) for complete entity definitions.

### Entity Relationships

```
Copropriete
├── AssembleeGenerale (1:N)
│   ├── Resolution (1:N)
│   │   └── Vote (1:N, per présent/représenté)
│   └── Presence (1:N, per copropriétaire)
├── Coproprietaire (existing)
└── Lot (existing)
    └── tantiemes per CleRepartition (mock data)
```

### State Machine: AG Status

```
[Brouillon] ---(Générer convocation)---> [Convoquée]
[Convoquée] ---(Démarrer AG)---> [EnCours]
[EnCours] ---(Générer PV)---> [Terminée]

Allowed transitions only. No backward transitions.
```

## Phase 2: Implementation Phases

### P1 - Core AG Management (MVP)

#### Task Group 1: Data Layer
1. Create Zod schemas for AG entities
2. Create Firebase services (CRUD + subscriptions)
3. Create custom hooks for data access
4. Write unit tests for services and hooks

#### Task Group 2: AG Creation & List
5. Create AG list page with status badges
6. Create AG creation form (date, heure, lieu, type)
7. Implement 21-day warning
8. Write component tests

#### Task Group 3: Ordre du Jour
9. Create resolution management UI
10. Implement drag-and-drop reordering
11. Auto-numbering logic
12. Majority type selector
13. Write component tests

#### Task Group 4: Feuille de Présence
14. Create attendance sheet UI
15. Implement présent/représenté/absent toggle
16. Representation selector with 3-person limit
17. Tantièmes calculation display
18. Write component tests

#### Task Group 5: Votes
19. Create vote screen per resolution
20. Implement vote recording (pour/contre/abstention)
21. Majority calculation logic (Art. 24, 25, 26, Unanimité)
22. Result display (adopté/rejeté)
23. Navigation between resolutions
24. Write component tests

### P2 - Document Generation

#### Task Group 6: Convocation
25. Create convocation print template
26. CSS print styles
27. Pouvoir form template
28. Status transition to "Convoquée"
29. Write E2E tests

#### Task Group 7: Procès-Verbal
30. Create PV print template
31. Include attendance sheet
32. Include vote results
33. Opposants/défaillants list
34. Status transition to "Terminée"
35. Write E2E tests

### P3 - History & Polish

#### Task Group 8: Historique
36. AG history list page
37. AG detail view (read-only)
38. Write E2E tests

## File Structure

```
src/
├── lib/
│   ├── schemas/
│   │   └── assemblee-generale.ts   # Zod schemas for AG, Resolution, Presence, Vote
│   └── firebase/
│       └── services/
│           └── assemblee-generale.ts   # CRUD + subscriptions
├── types/
│   └── assemblee-generale.ts   # Type exports
├── hooks/
│   ├── useAssembleeGenerale.ts
│   ├── useResolutions.ts
│   ├── usePresences.ts
│   └── useVotes.ts
├── app/
│   └── (dashboard)/
│       └── assemblees-generales/
│           ├── page.tsx                 # List
│           ├── nouvelle/page.tsx        # Create form
│           └── [agId]/
│               ├── page.tsx             # Detail/Edit
│               ├── ordre-du-jour/page.tsx
│               ├── presence/page.tsx
│               ├── votes/page.tsx
│               ├── votes/[resolutionId]/page.tsx
│               ├── convocation/page.tsx
│               └── proces-verbal/page.tsx
└── components/
    └── assemblees-generales/
        ├── AGList.tsx
        ├── AGForm.tsx
        ├── AGStatusBadge.tsx
        ├── ResolutionList.tsx
        ├── ResolutionForm.tsx
        ├── PresenceSheet.tsx
        ├── VoteScreen.tsx
        ├── MajorityCalculator.tsx
        ├── ConvocationDocument.tsx
        └── PVDocument.tsx

tests/
├── unit/
│   ├── schemas/assemblee-generale.test.ts
│   ├── services/assemblee-generale.test.ts
│   └── hooks/useAssembleeGenerale.test.ts
└── e2e/
    └── assemblees-generales.spec.ts
```

## Dependencies

### External (none new)
All dependencies already in package.json.

### Internal
- Existing `Coproprietaire` service for fetching owners
- Existing `Lot` service for fetching tantièmes
- Existing `historique` service for audit trail

### Mock Data Required
- `CleRepartition` seed data with at least "tantièmes généraux"
- Sample tantièmes per lot per clé

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Majority calculation errors | Medium | High | Extensive unit tests with legal edge cases |
| Complex UI state in vote flow | Medium | Medium | Clear state machine, per-resolution screens |
| Performance with many votes | Low | Medium | Firestore pagination, optimistic updates |
| Print CSS cross-browser issues | Medium | Low | Test on major browsers, use print-specific CSS |

## Next Steps

1. Run `/speckit.tasks` to generate task list
2. Implement in priority order (P1 → P2 → P3)
3. TDD: Write tests before each implementation
