# Firebase Services Contract: Clés de Répartition

**Date**: 2026-01-12
**Feature**: 007-cles-repartition

## Service Interface

```typescript
// src/lib/firebase/cles-repartition.ts

import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import type {
  CleRepartition,
  CreateCleRepartitionInput,
  UpdateCleRepartitionInput,
  QuotePart
} from '@/lib/schemas/cle-repartition';

// Collection reference helper
function getClesRef(coproId: string) {
  return collection(db, 'coproprietes', coproId, 'clesRepartition');
}

// Document reference helper
function getCleRef(coproId: string, cleId: string) {
  return doc(db, 'coproprietes', coproId, 'clesRepartition', cleId);
}
```

## Operations

### 1. List Clés de Répartition

**Purpose**: Get all distribution keys for a copropriété

```typescript
async function getClesRepartition(coproId: string): Promise<CleRepartition[]>
```

**Firestore Query**:
```typescript
query(getClesRef(coproId), orderBy('nom', 'asc'))
```

**Returns**: Array of CleRepartition, sorted by name

**Error Cases**:
- `PERMISSION_DENIED`: User not authorized for this copropriété
- `NOT_FOUND`: Copropriété does not exist

---

### 2. Get Single Clé de Répartition

**Purpose**: Get a specific distribution key by ID

```typescript
async function getCleRepartition(coproId: string, cleId: string): Promise<CleRepartition | null>
```

**Firestore Query**:
```typescript
getDoc(getCleRef(coproId, cleId))
```

**Returns**: CleRepartition or null if not found

**Error Cases**:
- `PERMISSION_DENIED`: User not authorized
- `NOT_FOUND`: Clé does not exist

---

### 3. Create Clé de Répartition

**Purpose**: Create a new distribution key

```typescript
async function createCleRepartition(
  coproId: string,
  input: CreateCleRepartitionInput
): Promise<string>
```

**Firestore Operation**:
```typescript
addDoc(getClesRef(coproId), {
  ...input,
  description: input.description ?? null,
  isDefault: false,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
})
```

**Validation**:
1. Check name uniqueness: `query(getClesRef(coproId), where('nom', '==', input.nom), limit(1))`
2. Validate lot IDs exist (optional, can be done client-side)

**Returns**: Created document ID

**Error Cases**:
- `PERMISSION_DENIED`: User not authorized
- `ALREADY_EXISTS`: Name already used (custom error)
- `INVALID_ARGUMENT`: Validation failed

---

### 4. Update Clé de Répartition

**Purpose**: Update an existing distribution key

```typescript
async function updateCleRepartition(
  coproId: string,
  cleId: string,
  input: UpdateCleRepartitionInput
): Promise<void>
```

**Firestore Operation**:
```typescript
updateDoc(getCleRef(coproId, cleId), {
  ...input,
  updatedAt: serverTimestamp(),
})
```

**Validation**:
1. If `nom` changed, check uniqueness (excluding current document)
2. Cannot update `isDefault` to false for default key (optional protection)

**Returns**: void

**Error Cases**:
- `PERMISSION_DENIED`: User not authorized
- `NOT_FOUND`: Clé does not exist
- `ALREADY_EXISTS`: New name already used

---

### 5. Delete Clé de Répartition

**Purpose**: Delete a distribution key (if not in use)

```typescript
async function deleteCleRepartition(coproId: string, cleId: string): Promise<void>
```

**Pre-deletion Check**:
```typescript
// Check if used in any appel de fonds
const appelsRef = collection(db, 'coproprietes', coproId, 'appels');
const usageQuery = query(appelsRef, where('cleRepartitionId', '==', cleId), limit(1));
const usage = await getDocs(usageQuery);

if (!usage.empty) {
  throw new CleRepartitionError(
    'CLE_IN_USE',
    'Cette clé est utilisée dans un ou plusieurs appels de fonds et ne peut pas être supprimée'
  );
}
```

**Firestore Operation**:
```typescript
deleteDoc(getCleRef(coproId, cleId))
```

**Returns**: void

**Error Cases**:
- `PERMISSION_DENIED`: User not authorized
- `NOT_FOUND`: Clé does not exist
- `CLE_IN_USE`: Key is referenced by appel de fonds (custom error)
- `CLE_IS_DEFAULT`: Cannot delete default key (optional protection)

---

### 6. Create Default Key

**Purpose**: Auto-create "Tantièmes généraux" key from lot data

```typescript
async function createDefaultCleRepartition(
  coproId: string,
  lots: Array<{ id: string; tantiemes: number }>
): Promise<string>
```

**Logic**:
```typescript
// Calculate total tantièmes
const totalTantiemes = lots.reduce((sum, lot) => sum + lot.tantiemes, 0);

// Convert to millièmes (base 10000)
const quoteParts: QuotePart[] = lots.map(lot => ({
  lotId: lot.id,
  valeur: Math.round((lot.tantiemes / totalTantiemes) * 10000),
}));

// Adjust rounding to ensure total = 10000
const total = quoteParts.reduce((sum, qp) => sum + qp.valeur, 0);
if (total !== 10000 && quoteParts.length > 0) {
  quoteParts[0].valeur += (10000 - total);
}

return createCleRepartitionInternal(coproId, {
  nom: 'Tantièmes généraux',
  description: 'Clé par défaut basée sur les tantièmes des lots',
  quoteParts,
  isDefault: true,
});
```

**Returns**: Created document ID

---

### 7. Subscribe to Changes (Real-time)

**Purpose**: Real-time updates for the list

```typescript
function subscribeToClesRepartition(
  coproId: string,
  callback: (cles: CleRepartition[]) => void
): () => void
```

**Firestore Operation**:
```typescript
const q = query(getClesRef(coproId), orderBy('nom', 'asc'));
return onSnapshot(q, (snapshot) => {
  const cles = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as CleRepartition));
  callback(cles);
});
```

**Returns**: Unsubscribe function

---

## Error Types

```typescript
export type CleRepartitionErrorCode =
  | 'CLE_NOT_FOUND'
  | 'CLE_NAME_EXISTS'
  | 'CLE_IN_USE'
  | 'CLE_IS_DEFAULT'
  | 'INVALID_QUOTA_PARTS';

export class CleRepartitionError extends Error {
  constructor(
    public code: CleRepartitionErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'CleRepartitionError';
  }
}
```

---

## React Hook Contract

```typescript
// src/hooks/useClesRepartition.ts

interface UseClesRepartitionResult {
  cles: CleRepartition[];
  loading: boolean;
  error: Error | null;

  // CRUD operations
  createCle: (input: CreateCleRepartitionInput) => Promise<string>;
  updateCle: (cleId: string, input: UpdateCleRepartitionInput) => Promise<void>;
  deleteCle: (cleId: string) => Promise<void>;

  // Helpers
  createDefaultCle: () => Promise<string>;
  getCleById: (cleId: string) => CleRepartition | undefined;
  validateTotal: (quoteParts: QuotePart[]) => { total: number; isValid: boolean; deviation: number };
}

function useClesRepartition(coproId: string | null): UseClesRepartitionResult
```

---

## Firestore Security Rules

```javascript
// firestore.rules (add to existing rules)

match /coproprietes/{coproId}/clesRepartition/{cleId} {
  // Allow read if user is member of copropriété
  allow read: if isAuthenticated() && isMemberOfCopropriete(coproId);

  // Allow write if user is admin/syndic of copropriété
  allow create, update: if isAuthenticated() && isSyndicOfCopropriete(coproId);

  // Allow delete with additional check (in-use validation done in app)
  allow delete: if isAuthenticated() && isSyndicOfCopropriete(coproId);
}
```
