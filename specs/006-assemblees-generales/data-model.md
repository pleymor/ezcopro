# Data Model: Assemblées Générales

## Entity Definitions

### AssembleeGenerale

Represents a general assembly meeting.

```typescript
interface AssembleeGenerale {
  id: string;                          // Firestore document ID
  date: Timestamp;                     // Date of the AG
  heure: string;                       // Time (HH:mm format)
  lieu: string;                        // Location
  type: 'ordinaire' | 'extraordinaire';
  statut: 'brouillon' | 'convoquee' | 'en_cours' | 'terminee';
  dateConvocation: Timestamp | null;   // Date when convocation was sent
  totalTantiemes: number;              // Total tantièmes in copropriété (snapshot)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Firestore Path**: `coproprietes/{coproId}/assemblees-generales/{agId}`

**Validation Rules**:
- `date`: Required, must be valid date
- `heure`: Required, format HH:mm
- `lieu`: Required, max 200 characters
- `type`: Required, enum value
- `statut`: Default 'brouillon', follows state machine

**State Transitions**:
```
brouillon → convoquee (via "Générer convocation")
convoquee → en_cours (via "Démarrer l'AG")
en_cours → terminee (via "Générer le PV")
```

---

### Resolution

Represents an agenda item to be voted on.

```typescript
interface Resolution {
  id: string;                          // Firestore document ID
  numero: number;                      // Auto-incremented order number
  titre: string;                       // Title of the resolution
  description: string;                 // Detailed description
  typeMajorite: 'article_24' | 'article_25' | 'article_26' | 'unanimite';
  cleRepartitionId: string;            // Reference to distribution key
  resultat: 'adopte' | 'rejete' | 'non_vote';
  votePour: number;                    // Tantièmes "pour" (calculated)
  voteContre: number;                  // Tantièmes "contre" (calculated)
  voteAbstention: number;              // Tantièmes "abstention" (calculated)
  ordre: number;                       // Display order (for drag-drop)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Firestore Path**: `coproprietes/{coproId}/assemblees-generales/{agId}/resolutions/{resolutionId}`

**Validation Rules**:
- `titre`: Required, max 200 characters
- `description`: Optional, max 2000 characters
- `typeMajorite`: Required, enum value
- `cleRepartitionId`: Required, defaults to "tantiemes_generaux"
- `resultat`: Default 'non_vote'
- `ordre`: Auto-assigned based on creation order

---

### Presence

Represents attendance of a co-owner at the AG.

```typescript
interface Presence {
  id: string;                          // Firestore document ID (= coproprietaireId)
  coproprietaireId: string;            // Reference to copropriétaire
  nom: string;                         // Snapshot of name (for history)
  prenom: string;                      // Snapshot of first name
  statut: 'present' | 'represente' | 'absent';
  representeParId: string | null;      // If represented, ID of representative
  tantiemes: number;                   // Total tantièmes for this owner (by clé générale)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Firestore Path**: `coproprietes/{coproId}/assemblees-generales/{agId}/presences/{presenceId}`

**Validation Rules**:
- `statut`: Default 'absent'
- `representeParId`: Required if statut = 'represente', must be a present copropriétaire
- `tantiemes`: Calculated as sum of lots' tantièmes for this owner

**Business Rules**:
- A copropriétaire cannot represent more than 3 others (legal limit, except spouse)
- Only copropriétaires with lots appear in the presence sheet
- representeParId must reference a 'present' copropriétaire

---

### Vote

Represents a vote cast by a participant on a resolution.

```typescript
interface Vote {
  id: string;                          // Firestore document ID
  resolutionId: string;                // Reference to resolution
  coproprietaireId: string;            // Reference to voting copropriétaire
  choix: 'pour' | 'contre' | 'abstention';
  tantiemes: number;                   // Tantièmes for this vote (by resolution's clé)
  representantId: string | null;       // If voted by representative
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Firestore Path**: `coproprietes/{coproId}/assemblees-generales/{agId}/resolutions/{resolutionId}/votes/{voteId}`

**Validation Rules**:
- `choix`: Required, enum value
- `tantiemes`: Calculated based on resolution's cleRepartitionId
- Only present or represented copropriétaires can vote

---

### CleRepartition (Mock/Seed Data)

Distribution keys for calculating tantièmes.

```typescript
interface CleRepartition {
  id: string;                          // 'tantiemes_generaux', 'ascenseur', etc.
  nom: string;                         // Display name
  description: string;                 // Description
}
```

**Firestore Path**: `coproprietes/{coproId}/cles-repartition/{cleId}`

**Seed Data**:
```json
[
  { "id": "tantiemes_generaux", "nom": "Tantièmes généraux", "description": "Charges communes générales" },
  { "id": "ascenseur", "nom": "Ascenseur", "description": "Charges d'ascenseur (étages concernés)" },
  { "id": "chauffage", "nom": "Chauffage collectif", "description": "Charges de chauffage" }
]
```

**Note**: For MVP, tantièmes per clé will use the lot's standard tantièmes. Future feature will allow per-clé tantièmes.

---

## Computed Values

### Tantièmes Calculations

```typescript
// Total tantièmes présents/représentés
function getTantiemesPresentsRepresentes(presences: Presence[]): number {
  return presences
    .filter(p => p.statut === 'present' || p.statut === 'represente')
    .reduce((sum, p) => sum + p.tantiemes, 0);
}

// Majority calculation by type
function isResolutionAdopted(
  resolution: Resolution,
  votes: Vote[],
  totalTantiemes: number,
  tantiemesPresents: number
): boolean {
  const pourTantiemes = votes
    .filter(v => v.choix === 'pour')
    .reduce((sum, v) => sum + v.tantiemes, 0);

  const voixExprimees = votes
    .filter(v => v.choix !== 'abstention')
    .reduce((sum, v) => sum + v.tantiemes, 0);

  switch (resolution.typeMajorite) {
    case 'article_24':
      // Majorité des voix exprimées des présents/représentés
      return pourTantiemes > voixExprimees / 2;

    case 'article_25':
      // Majorité absolue de tous les tantièmes (>50%)
      return pourTantiemes > totalTantiemes / 2;

    case 'article_26':
      // Majorité des membres représentant 2/3 des tantièmes
      return pourTantiemes >= (totalTantiemes * 2) / 3;

    case 'unanimite':
      // 100% des tantièmes
      return pourTantiemes === totalTantiemes;
  }
}
```

---

## Indexes Required

Firestore composite indexes:

```
# AG list sorted by date
coproprietes/{coproId}/assemblees-generales: date DESC, statut ASC

# Resolutions sorted by order
coproprietes/{coproId}/assemblees-generales/{agId}/resolutions: ordre ASC

# Presences sorted by name
coproprietes/{coproId}/assemblees-generales/{agId}/presences: nom ASC
```

---

## Data Migration

No migration required - new feature with new collections.

---

## Firestore Security Rules (additions)

```javascript
// Assemblées Générales
match /coproprietes/{coproId}/assemblees-generales/{agId} {
  allow read: if isMemberOfCopro(coproId);
  allow create, update, delete: if isAdminOfCopro(coproId);

  // Resolutions
  match /resolutions/{resolutionId} {
    allow read: if isMemberOfCopro(coproId);
    allow create, update, delete: if isAdminOfCopro(coproId);

    // Votes
    match /votes/{voteId} {
      allow read: if isMemberOfCopro(coproId);
      allow create, update, delete: if isAdminOfCopro(coproId);
    }
  }

  // Presences
  match /presences/{presenceId} {
    allow read: if isMemberOfCopro(coproId);
    allow create, update, delete: if isAdminOfCopro(coproId);
  }
}

// Clés de répartition (read-only for now)
match /coproprietes/{coproId}/cles-repartition/{cleId} {
  allow read: if isMemberOfCopro(coproId);
}
```
