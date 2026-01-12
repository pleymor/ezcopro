# Quickstart: Gestion des clés de répartition

**Date**: 2026-01-12
**Feature**: 007-cles-repartition

## Prerequisites

- Node.js 24+
- Firebase emulators (optional, for local development)
- Existing copropriété with lots

## Setup

```bash
# Install dependencies (already done)
npm install

# Start development server
npm run dev

# Or with Firebase emulators
npm run dev:emulators
```

## Key Files to Create/Modify

### 1. Schema (New)

Create `src/lib/schemas/cle-repartition.ts`:

```typescript
import { z } from 'zod';
import { firestoreIdSchema, timestampSchema } from './primitives';

export const milliemesSchema = z.number().int().min(0).max(10000);

export const quotePartSchema = z.object({
  lotId: firestoreIdSchema,
  valeur: milliemesSchema,
});

export type QuotePart = z.infer<typeof quotePartSchema>;

export const cleRepartitionSchema = z.object({
  id: firestoreIdSchema,
  nom: z.string().min(1).max(100),
  description: z.string().max(500).nullable(),
  quoteParts: z.array(quotePartSchema),
  isDefault: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type CleRepartition = z.infer<typeof cleRepartitionSchema>;

// Form schema
export const cleRepartitionFormSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(100),
  description: z.string().max(500).optional(),
  quoteParts: z.array(z.object({
    lotId: z.string().min(1),
    valeur: z.coerce.number().int().min(0).max(10000),
  })),
});

export type CleRepartitionFormData = z.infer<typeof cleRepartitionFormSchema>;

export function validateQuotePartsTotal(quoteParts: QuotePart[]) {
  const total = quoteParts.reduce((sum, qp) => sum + qp.valeur, 0);
  return { total, isValid: total === 10000, deviation: total - 10000 };
}
```

### 2. Hook (Update existing)

Update `src/hooks/useClesRepartition.ts` with full CRUD:

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CleRepartition, CreateCleRepartitionInput } from '@/lib/schemas/cle-repartition';

export function useClesRepartition(coproId: string | null) {
  const [cles, setCles] = useState<CleRepartition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch clés on mount
  useEffect(() => {
    if (!coproId) return;
    // Subscribe to Firestore collection
    // ...
  }, [coproId]);

  const createCle = useCallback(async (input: CreateCleRepartitionInput) => {
    // Create in Firestore
  }, [coproId]);

  const updateCle = useCallback(async (cleId: string, input: Partial<CreateCleRepartitionInput>) => {
    // Update in Firestore
  }, [coproId]);

  const deleteCle = useCallback(async (cleId: string) => {
    // Delete from Firestore (with usage check)
  }, [coproId]);

  return { cles, loading, error, createCle, updateCle, deleteCle };
}
```

### 3. Navigation (Update)

Add submenu in `src/components/layouts/Navigation.tsx`:

```typescript
const navItems = [
  // ... existing items
  {
    href: '/lots',
    label: 'Lots',
    icon: Building2,
    requiresCopro: true,
    subItems: [
      { href: '/lots/cles-repartition', label: 'Clés de répartition' },
    ],
  },
  // ...
];
```

### 4. Pages (New)

Create route structure:
```
src/app/(dashboard)/lots/cles-repartition/
├── page.tsx              # List page
├── nouvelle/page.tsx     # Create page
└── [id]/
    ├── page.tsx          # Detail page
    └── edit/page.tsx     # Edit page
```

## Testing

### Unit Tests

```bash
npm test -- cle-repartition
```

### E2E Tests

```bash
npm run test:e2e -- cles-repartition
```

## Development Flow (TDD)

1. Write failing test for schema validation
2. Implement schema
3. Write failing test for hook
4. Implement hook
5. Write failing test for components
6. Implement components
7. Write E2E tests
8. Verify all tests pass

## URLs

| Page | URL |
|------|-----|
| List | `/lots/cles-repartition` |
| Create | `/lots/cles-repartition/nouvelle` |
| Detail | `/lots/cles-repartition/[id]` |
| Edit | `/lots/cles-repartition/[id]/edit` |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Pages                                 │
│  /lots/cles-repartition/*                                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     Components                               │
│  CleRepartitionList, CleRepartitionForm, QuotesPartsEditor  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                        Hook                                  │
│  useClesRepartition (CRUD + validation)                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Firebase Services                          │
│  Firestore: coproprietes/{id}/clesRepartition               │
└─────────────────────────────────────────────────────────────┘
```
