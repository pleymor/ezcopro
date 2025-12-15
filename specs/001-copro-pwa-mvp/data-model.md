# Data Model: EzCopro MVP

**Date**: 2025-12-15
**Storage**: Firebase Firestore

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                        Firestore                            │
├─────────────────────────────────────────────────────────────┤
│  users/{userId}                                             │
│    └── coproprietes: string[] (références)                 │
│                                                             │
│  coproprietes/{coproId}                                     │
│    ├── lots/{lotId}                                        │
│    ├── coproprietaires/{coproprietaireId}                  │
│    ├── appels/{appelId}                                    │
│    │     └── repartitions/{repartitionId}                  │
│    ├── paiements/{paiementId}                              │
│    └── historique/{entryId}                                │
│                                                             │
│  invitations/{code}                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Entités

### 1. User (users/{userId})

Représente un utilisateur authentifié via Google.

```typescript
interface User {
  id: string;                    // Firebase Auth UID
  email: string;                 // Email Google
  displayName: string;           // Nom affiché
  photoURL: string | null;       // Photo Google
  coproprietes: string[];        // IDs des copropriétés membres
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Règles de validation (Zod)**:
- `email`: format email valide
- `displayName`: 1-100 caractères
- `coproprietes`: array de strings non vide après première adhésion

---

### 2. Copropriété (coproprietes/{coproId})

Représente un immeuble ou ensemble immobilier.

```typescript
interface Copropriete {
  id: string;
  nom: string;                   // "Résidence Les Lilas"
  adresse: string;               // Adresse complète
  members: string[];             // User IDs ayant accès
  totalTantiemes: number;        // Calculé (somme des lots)
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;             // User ID du créateur
}
```

**Règles de validation**:
- `nom`: 1-200 caractères, requis
- `adresse`: 1-500 caractères, requis
- `members`: au moins 1 membre (le créateur)

**Champs calculés** (non stockés, dérivés):
- `totalTantiemes`: somme de tous les `tantiemes` des lots

---

### 3. Lot (coproprietes/{coproId}/lots/{lotId})

Unité de propriété au sein d'une copropriété.

```typescript
type LotType = 'appartement' | 'cave' | 'parking' | 'local_commercial' | 'autre';

interface Lot {
  id: string;
  numero: string;                // "A01", "B12", etc.
  type: LotType;
  tantiemes: number;             // Quote-part (entier positif)
  coproprietaireId: string;      // Référence vers coproprietaire
  description: string | null;    // Description optionnelle
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Règles de validation**:
- `numero`: 1-20 caractères, unique au sein de la copropriété
- `type`: une des valeurs enum
- `tantiemes`: entier > 0
- `coproprietaireId`: doit référencer un copropriétaire existant

**Contraintes**:
- Un lot appartient à exactement un copropriétaire
- Le numéro est unique par copropriété

---

### 4. Copropriétaire (coproprietes/{coproId}/coproprietaires/{coproprietaireId})

Personne physique ou morale possédant des lots.

```typescript
interface Coproprietaire {
  id: string;
  nom: string;                   // Nom de famille ou raison sociale
  prenom: string;                // Prénom (vide si personne morale)
  email: string | null;          // Email de contact (optionnel)
  telephone: string | null;      // Téléphone (optionnel)
  userId: string | null;         // Lié à un User si connecté
  isAnonymized: boolean;         // True si supprimé (RGPD)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Règles de validation**:
- `nom`: 1-100 caractères, requis
- `prenom`: 0-100 caractères
- `email`: format email si fourni
- `telephone`: format téléphone français si fourni

**États**:
- **Actif**: `isAnonymized = false`
- **Anonymisé**: `isAnonymized = true`, `nom = "Ancien copropriétaire"`, autres champs vidés

**Champs calculés** (non stockés):
- `lots`: liste des lots appartenant à ce copropriétaire
- `totalTantiemes`: somme des tantièmes de ses lots
- `solde`: somme des répartitions - somme des paiements

---

### 5. Appel de fonds (coproprietes/{coproId}/appels/{appelId})

Demande de paiement émise vers les copropriétaires.

```typescript
interface AppelDeFonds {
  id: string;
  libelle: string;               // "Charges Q1 2025"
  montantTotalCents: number;     // Montant en centimes (ex: 150000 = 1500.00€)
  dateEcheance: Timestamp;       // Date limite de paiement
  dateCreation: Timestamp;
  createdBy: string;             // User ID
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Règles de validation**:
- `libelle`: 1-200 caractères, requis
- `montantTotalCents`: entier > 0
- `dateEcheance`: date future ou présente

---

### 6. Répartition (coproprietes/{coproId}/appels/{appelId}/repartitions/{repartitionId})

Part d'un appel de fonds pour un lot spécifique.

```typescript
interface Repartition {
  id: string;
  lotId: string;
  coproprietaireId: string;      // Dénormalisé pour queries rapides
  montantCents: number;          // Montant dû en centimes
  tantiemesSnapshot: number;     // Tantièmes au moment du calcul
  createdAt: Timestamp;
}
```

**Calcul automatique**:
```
montantCents = (lot.tantiemes / copropriete.totalTantiemes) * appel.montantTotalCents
```

**Règles**:
- Une répartition par lot par appel
- `tantiemesSnapshot` capture les tantièmes au moment de l'appel (historique)

---

### 7. Paiement (coproprietes/{coproId}/paiements/{paiementId})

Versement effectué par un copropriétaire.

```typescript
interface Paiement {
  id: string;
  coproprietaireId: string;
  montantCents: number;          // Montant en centimes
  datePaiement: Timestamp;
  reference: string | null;      // Référence optionnelle (chèque, virement)
  createdBy: string;             // User ID qui a enregistré
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Règles de validation**:
- `montantCents`: entier > 0
- `datePaiement`: date passée ou présente
- `reference`: 0-100 caractères si fourni

---

### 8. Entrée d'historique (coproprietes/{coproId}/historique/{entryId})

Trace immuable d'une action.

```typescript
type ActionType = 'create' | 'update' | 'delete';
type EntityType = 'lot' | 'coproprietaire' | 'appel' | 'paiement' | 'copropriete';

interface HistoriqueEntry {
  id: string;
  userId: string;
  userEmail: string;             // Dénormalisé pour affichage
  action: ActionType;
  entityType: EntityType;
  entityId: string;
  entityLabel: string;           // Ex: "Lot A01", "Dupont Jean"
  before: Record<string, unknown> | null;  // État avant (null si create)
  after: Record<string, unknown> | null;   // État après (null si delete)
  timestamp: Timestamp;
}
```

**Règles**:
- Immutable : jamais modifié ni supprimé
- Créé automatiquement sur chaque mutation
- `before`/`after` contiennent uniquement les champs modifiés pour update

---

### 9. Invitation (invitations/{code})

Code d'invitation pour rejoindre une copropriété.

```typescript
interface Invitation {
  code: string;                  // Code unique (ex: "ABC123")
  coproprietéId: string;
  coproprietaireId: string;      // Le copropriétaire à lier
  createdBy: string;             // User ID qui a créé
  expiresAt: Timestamp;          // Expiration (7 jours par défaut)
  usedAt: Timestamp | null;      // Date d'utilisation
  usedBy: string | null;         // User ID qui a utilisé
  createdAt: Timestamp;
}
```

**Règles**:
- `code`: 6-10 caractères alphanumériques, unique
- `expiresAt`: max 30 jours après création
- Une fois utilisé, non réutilisable

---

## Index Firestore recommandés

```javascript
// Index composites pour queries fréquentes

// Lots par copropriétaire
coproprietes/{coproId}/lots
  - coproprietaireId ASC, numero ASC

// Paiements par copropriétaire
coproprietes/{coproId}/paiements
  - coproprietaireId ASC, datePaiement DESC

// Historique par date
coproprietes/{coproId}/historique
  - timestamp DESC

// Historique par type d'entité
coproprietes/{coproId}/historique
  - entityType ASC, timestamp DESC
```

---

## Diagramme de relations

```
User (1) ────────────── (N) Copropriete
  │                           │
  │                           ├── (N) Lot ──── (1) Coproprietaire
  │                           │
  │                           ├── (N) Coproprietaire
  │                           │
  │                           ├── (N) AppelDeFonds
  │                           │         │
  │                           │         └── (N) Repartition ──── (1) Lot
  │                           │
  │                           ├── (N) Paiement ──── (1) Coproprietaire
  │                           │
  │                           └── (N) HistoriqueEntry
  │
  └──────── peut être lié à ──── Coproprietaire (0..1)

Invitation ──── (1) Copropriete
           ──── (1) Coproprietaire
```

---

## Calculs dérivés

### Solde d'un copropriétaire

```typescript
const calculerSolde = async (coproId: string, coproprietaireId: string): number => {
  // Total des répartitions (montants dus)
  const repartitions = await getSubcollectionQuery(
    'coproprietes', coproId, 'appels', '*', 'repartitions',
    where('coproprietaireId', '==', coproprietaireId)
  );
  const totalDu = repartitions.reduce((sum, r) => sum + r.montantCents, 0);

  // Total des paiements
  const paiements = await getQuery(
    'coproprietes', coproId, 'paiements',
    where('coproprietaireId', '==', coproprietaireId)
  );
  const totalPaye = paiements.reduce((sum, p) => sum + p.montantCents, 0);

  // Solde = payé - dû (positif = créditeur, négatif = débiteur)
  return totalPaye - totalDu;
};
```

### Total tantièmes d'une copropriété

```typescript
const calculerTotalTantiemes = async (coproId: string): number => {
  const lots = await getCollection('coproprietes', coproId, 'lots');
  return lots.reduce((sum, lot) => sum + lot.tantiemes, 0);
};
```

---

## Migrations

Pour le MVP, pas de migration nécessaire (greenfield). Structure de migration prévue pour évolutions futures :

```
migrations/
├── 001_initial_schema.ts
└── README.md
```
