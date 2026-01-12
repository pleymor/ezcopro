# Data Model: Gestion des clés de répartition

**Date**: 2026-01-12
**Feature**: 007-cles-repartition

## Entities

### CleRepartition (Distribution Key)

A distribution key defines how charges are split among co-owners for a specific type of expense.

**Collection**: `coproprietes/{coproId}/clesRepartition`

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | string | Yes | Firestore auto-generated | Unique identifier |
| `nom` | string | Yes | 1-100 chars, unique per copropriété | Display name (e.g., "Charges générales") |
| `description` | string | No | 0-500 chars | Optional description |
| `quoteParts` | QuotePart[] | Yes | Array | Distribution shares per lot |
| `isDefault` | boolean | Yes | Default: false | True for auto-created "Tantièmes généraux" key |
| `createdAt` | Timestamp | Yes | Auto-set | Creation timestamp |
| `updatedAt` | Timestamp | Yes | Auto-set | Last update timestamp |

### QuotePart (Distribution Share)

Embedded within CleRepartition, defines the share for a single lot.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `lotId` | string | Yes | Valid lot ID | Reference to the lot |
| `valeur` | number | Yes | Integer 0-10000 | Share in millièmes |

## Relationships

```
┌─────────────────┐       ┌─────────────────┐
│   Copropriété   │       │       Lot       │
│                 │       │                 │
│  id             │       │  id             │
│  ...            │       │  tantiemes      │
└────────┬────────┘       │  ...            │
         │                └────────┬────────┘
         │ 1:N                     │
         │                         │ referenced by
         ▼                         │
┌─────────────────┐                │
│ CleRepartition  │                │
│                 │                │
│  id             │                │
│  nom            │                │
│  description    │                │
│  quoteParts[]───┼────────────────┘
│  isDefault      │
└────────┬────────┘
         │
         │ referenced by (future)
         ▼
┌─────────────────┐
│  AppelDeFonds   │
│                 │
│  cleRepartitionId
│  ...            │
└─────────────────┘
```

## Validation Rules

### CleRepartition

1. **Unique name**: `nom` must be unique within the copropriété
2. **Non-empty quotes-parts**: `quoteParts` array should contain entries (warning if empty)
3. **Millièmes total warning**: Sum of all `quoteParts[].valeur` should equal 10000 (warning, not blocking)

### QuotePart

1. **Valid lot reference**: `lotId` must exist in the copropriété's lots
2. **Value range**: `valeur` must be integer between 0 and 10000 inclusive
3. **No duplicate lots**: Each `lotId` can appear only once per key

## State Transitions

CleRepartition has no explicit status field. Implicit states:

```
┌─────────┐     create      ┌─────────┐
│ (none)  │ ───────────────► │  Active │
└─────────┘                  └────┬────┘
                                  │
                                  │ update
                                  │
                                  ▼
                            ┌─────────┐
                            │  Active │ (same state, updated data)
                            └────┬────┘
                                  │
                                  │ delete (if not used)
                                  ▼
                            ┌─────────┐
                            │ Deleted │ (hard delete)
                            └─────────┘
```

**Deletion constraint**: Cannot delete if `cleRepartitionId` is referenced by any AppelDeFonds document.

## Indexes Required

Firestore indexes (defined in `firestore.indexes.json`):

```json
{
  "indexes": [
    {
      "collectionGroup": "clesRepartition",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "nom", "order": "ASCENDING" }
      ]
    }
  ]
}
```

## Migration Notes

### Backward Compatibility

The existing `CleRepartition` type in `assemblee-generale.ts` is minimal:
```typescript
{
  id: string;
  nom: string;
  description: string;
}
```

The new schema adds:
- `quoteParts: QuotePart[]`
- `isDefault: boolean`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`

**Migration strategy**:
- New fields are optional in reads (provide defaults)
- AG module continues to work with existing minimal data
- Full schema used for new keys and when editing existing keys

## Zod Schemas

```typescript
// src/lib/schemas/cle-repartition.ts

import { z } from 'zod';
import { firestoreIdSchema, timestampSchema } from './primitives';

// Millièmes value (0-10000)
export const milliemesSchema = z.number().int().min(0).max(10000);

// Quote-part (embedded)
export const quotePartSchema = z.object({
  lotId: firestoreIdSchema,
  valeur: milliemesSchema,
});

export type QuotePart = z.infer<typeof quotePartSchema>;

// Full CleRepartition schema
export const cleRepartitionSchema = z.object({
  id: firestoreIdSchema,
  nom: z.string().min(1, 'Le nom est requis').max(100, 'Maximum 100 caractères'),
  description: z.string().max(500, 'Maximum 500 caractères').nullable(),
  quoteParts: z.array(quotePartSchema),
  isDefault: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type CleRepartition = z.infer<typeof cleRepartitionSchema>;

// Create input
export const createCleRepartitionInputSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(100, 'Maximum 100 caractères'),
  description: z.string().max(500).optional(),
  quoteParts: z.array(quotePartSchema),
});

export type CreateCleRepartitionInput = z.infer<typeof createCleRepartitionInputSchema>;

// Update input
export const updateCleRepartitionInputSchema = z.object({
  nom: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  quoteParts: z.array(quotePartSchema).optional(),
});

export type UpdateCleRepartitionInput = z.infer<typeof updateCleRepartitionInputSchema>;

// Form schema
export const cleRepartitionFormSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(100, 'Maximum 100 caractères'),
  description: z.string().max(500, 'Maximum 500 caractères').optional(),
  quoteParts: z.array(z.object({
    lotId: z.string().min(1),
    valeur: z.coerce.number().int().min(0).max(10000),
  })),
});

export type CleRepartitionFormData = z.infer<typeof cleRepartitionFormSchema>;

// Validation helper
export function validateQuotePartsTotal(quoteParts: QuotePart[]): {
  total: number;
  isValid: boolean;
  deviation: number;
} {
  const total = quoteParts.reduce((sum, qp) => sum + qp.valeur, 0);
  return {
    total,
    isValid: total === 10000,
    deviation: total - 10000,
  };
}
```
