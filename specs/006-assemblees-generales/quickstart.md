# Quickstart: Assemblées Générales Implementation

## Prerequisites

1. **Branch**: `006-assemblees-generales`
2. **Dependencies**: All in package.json (no new installs needed)
3. **Existing data**: Copropriétaires and Lots must exist

## Step 1: Create Zod Schemas

Create `src/lib/schemas/assemblee-generale.ts`:

```typescript
import { z } from 'zod';
import { firestoreIdSchema, timestampSchema, tantiemesSchema } from './primitives';

// AG Status enum
export const agStatusSchema = z.enum(['brouillon', 'convoquee', 'en_cours', 'terminee']);
export type AGStatus = z.infer<typeof agStatusSchema>;

// AG Type enum
export const agTypeSchema = z.enum(['ordinaire', 'extraordinaire']);
export type AGType = z.infer<typeof agTypeSchema>;

// Majorité Type enum
export const majoriteTypeSchema = z.enum(['article_24', 'article_25', 'article_26', 'unanimite']);
export type MajoriteType = z.infer<typeof majoriteTypeSchema>;

// AssembleeGenerale schema
export const assembleeGeneraleSchema = z.object({
  id: firestoreIdSchema,
  date: timestampSchema,
  heure: z.string().regex(/^\d{2}:\d{2}$/),
  lieu: z.string().min(1).max(200),
  type: agTypeSchema,
  statut: agStatusSchema,
  dateConvocation: timestampSchema.nullable(),
  totalTantiemes: tantiemesSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// ... continue with Resolution, Presence, Vote schemas
```

## Step 2: Create Firebase Service

Create `src/lib/firebase/services/assemblee-generale.ts`:

Follow the pattern from `src/lib/firebase/services/coproprietaire.ts`:
- Support for `IS_TEST_MODE` with mock store
- Real-time subscriptions with `onSnapshot`
- Historique entries for audit trail

## Step 3: Create Type Exports

Create `src/types/assemblee-generale.ts`:

```typescript
export type {
  AssembleeGenerale,
  Resolution,
  Presence,
  Vote,
  // ... input types
} from '@/lib/schemas/assemblee-generale';
```

## Step 4: Create Custom Hooks

Create hooks in `src/hooks/`:
- `useAssembleeGenerale.ts`
- `useResolutions.ts`
- `usePresences.ts`
- `useVotes.ts`

## Step 5: Create Pages

Create pages in `src/app/(dashboard)/assemblees-generales/`:

```
assemblees-generales/
├── page.tsx                 # List of all AGs
├── nouvelle/page.tsx        # Create new AG
└── [agId]/
    ├── page.tsx             # AG detail/edit
    ├── ordre-du-jour/page.tsx
    ├── presence/page.tsx
    ├── votes/page.tsx
    ├── votes/[resolutionId]/page.tsx
    ├── convocation/page.tsx
    └── proces-verbal/page.tsx
```

## Step 6: Add Navigation Link

Update dashboard navigation to include "Assemblées générales" link.

## Testing Commands

```bash
# Run unit tests
npm test -- --grep "assemblee"

# Run E2E tests
npm run test:e2e -- assemblees-generales

# Run in test mode (mock data)
npm run dev:test
```

## Seed Data (Mock)

For test mode, add to `src/lib/test/mock-data.ts`:

```typescript
export const mockClesRepartition: CleRepartition[] = [
  { id: 'tantiemes_generaux', nom: 'Tantièmes généraux', description: 'Charges communes' },
];
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `specs/006-assemblees-generales/spec.md` | Feature specification |
| `specs/006-assemblees-generales/data-model.md` | Entity definitions |
| `specs/006-assemblees-generales/contracts/` | Service contracts |
| `src/lib/schemas/assemblee-generale.ts` | Zod schemas |
| `src/lib/firebase/services/assemblee-generale.ts` | Firebase CRUD |

## TDD Workflow

For each component:
1. Write failing test
2. Implement minimal code to pass
3. Refactor with tests green

Example test structure:
```typescript
// tests/unit/schemas/assemblee-generale.test.ts
describe('AssembleeGenerale Schema', () => {
  it('validates a valid AG', () => { ... });
  it('rejects invalid date format', () => { ... });
  it('rejects invalid status', () => { ... });
});
```

## Definition of Done

- [ ] All acceptance scenarios from spec.md have passing tests
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] E2E tests cover happy paths
- [ ] Works in both test mode and with Firebase
