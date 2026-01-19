# Data Model: Extranet Copropriétaires

**Date**: 2025-01-16
**Feature**: 009-extranet-coproprietaires

## Entity Relationship Diagram

```
┌──────────────────────┐       ┌─────────────────────────┐
│     Copropriete      │       │    Firebase Auth User   │
│  (existing entity)   │       │    (existing entity)    │
└──────────┬───────────┘       └────────────┬────────────┘
           │                                │
           │ 1:N                            │ 1:1
           │                                │
           ▼                                ▼
┌──────────────────────┐       ┌─────────────────────────┐
│   Coproprietaire     │◄──────│    CompteCoproprietaire │
│  (existing entity)   │  1:1  │    (NEW - extends User) │
└──────────┬───────────┘       └─────────────────────────┘
           │                                │
           │                                │
           │ 1:N                            │ N:M
           │                                │
           ▼                                ▼
┌──────────────────────┐       ┌─────────────────────────┐
│ InvitationExtranet   │       │    DocumentPartage      │
│       (NEW)          │       │        (NEW)            │
└──────────────────────┘       └─────────────────────────┘
```

## New Entities

### 1. InvitationExtranet

**Collection Path**: `/coproprietes/{coproId}/invitations/{invitationId}`

Représente une invitation envoyée à un copropriétaire pour créer son compte extranet.

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | string | ✅ | ID unique (auto-generated) | Firestore ID |
| email | string | ✅ | Email du copropriétaire | Format email valide |
| coproprietaireId | string | ✅ | Référence au copropriétaire | Existe dans collection coproprietaires |
| token | string | ✅ | Token unique pour l'URL | UUID v4, unique global |
| dateEnvoi | Timestamp | ✅ | Date d'envoi de l'invitation | - |
| dateExpiration | Timestamp | ✅ | Date d'expiration | dateEnvoi + 7 jours |
| statut | enum | ✅ | État de l'invitation | 'en_attente' \| 'acceptee' \| 'expiree' |
| createdAt | Timestamp | ✅ | Date de création | Auto |
| updatedAt | Timestamp | ✅ | Date de dernière modification | Auto |

**State Transitions**:
```
[en_attente] ─── acceptée ───► [acceptee]
      │
      └─── expirée (7j) ───► [expiree]
```

**Indexes requis**:
- `token` (unique, pour lookup rapide lors de l'acceptation)
- `coproprietaireId` + `statut` (pour vérifier si invitation active existe)

---

### 2. DocumentPartage

**Collection Path**: `/coproprietes/{coproId}/documents/{documentId}`

Représente un document stocké et potentiellement partagé sur l'extranet.

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | string | ✅ | ID unique (auto-generated) | Firestore ID |
| nom | string | ✅ | Nom du fichier original | 1-255 caractères |
| type | string | ✅ | MIME type | Types autorisés uniquement |
| taille | number | ✅ | Taille en bytes | > 0, < 10 Mo |
| storagePath | string | ✅ | Chemin Firebase Storage | Format valide |
| categorie | enum | ✅ | Catégorie de classement | Voir enum ci-dessous |
| visibleExtranet | boolean | ✅ | Partagé sur l'extranet | - |
| datePartage | Timestamp \| null | - | Date de partage extranet | null si non partagé |
| consultePar | string[] | ✅ | IDs des comptes ayant consulté | Array de userId |
| uploadedBy | string | ✅ | ID du syndic ayant uploadé | userId valide |
| createdAt | Timestamp | ✅ | Date de création | Auto |
| updatedAt | Timestamp | ✅ | Date de dernière modification | Auto |

**Enum categorie**:
```typescript
type CategorieDocument = 'ag' | 'contrats' | 'reglement' | 'travaux' | 'autres';
```

**Types MIME autorisés**:
- `application/pdf`
- `image/jpeg`, `image/png`, `image/gif`
- `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Indexes requis**:
- `visibleExtranet` + `categorie` + `datePartage` (liste documents extranet par catégorie)
- `uploadedBy` + `createdAt` (documents uploadés par un syndic)

---

### 3. PreferencesNotification

**Collection Path**: `/coproprietes/{coproId}/preferencesNotification/{userId}`

Préférences de notification d'un copropriétaire.

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | string | ✅ | userId Firebase | - |
| emailNouveauxDocuments | boolean | ✅ | Recevoir emails nouveaux docs | Default: true |
| createdAt | Timestamp | ✅ | Date de création | Auto |
| updatedAt | Timestamp | ✅ | Date de dernière modification | Auto |

---

## Modified Entities

### Coproprietaire (extension)

Ajout d'un champ pour lier au compte Firebase Auth créé via invitation.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string \| null | - | ID Firebase Auth si compte extranet créé |

**Note**: Ce champ existe déjà dans le schéma actuel, il sera utilisé pour lier le copropriétaire à son compte extranet.

---

## Firebase Custom Claims

Structure des claims ajoutés au token Firebase Auth pour les copropriétaires.

```typescript
interface CoproprietaireClaims {
  role: 'coproprietaire';
  coproId: string;           // ID de la copropriété
  coproprietaireId: string;  // ID du document coproprietaire
}

interface SyndicClaims {
  role: 'syndic';
  coproId: string;           // ID de la copropriété gérée
}

type CustomClaims = CoproprietaireClaims | SyndicClaims;
```

---

## Firestore Security Rules

### Règles pour InvitationExtranet

```javascript
match /coproprietes/{coproId}/invitations/{invitationId} {
  // Seul le syndic peut créer/modifier les invitations
  allow read, write: if isSyndic(coproId);

  // Lecture publique par token (pour acceptation)
  allow read: if resource.data.token == request.auth.token.invitationToken;
}
```

### Règles pour DocumentPartage

```javascript
match /coproprietes/{coproId}/documents/{docId} {
  // Syndic: lecture/écriture complète
  allow read, write: if isSyndic(coproId);

  // Copropriétaire: lecture si document visible sur extranet
  allow read: if isCoproprietaire(coproId)
              && resource.data.visibleExtranet == true;
}
```

### Règles pour données financières (existantes, à adapter)

```javascript
// Les copropriétaires ne peuvent voir que leurs propres données
match /coproprietes/{coproId}/appels/{appelId}/repartitions/{repId} {
  allow read: if isSyndic(coproId)
           || (isCoproprietaire(coproId)
               && resource.data.coproprietaireId == request.auth.token.coproprietaireId);
}

match /coproprietes/{coproId}/paiements/{paiementId} {
  allow read: if isSyndic(coproId)
           || (isCoproprietaire(coproId)
               && resource.data.coproprietaireId == request.auth.token.coproprietaireId);
}
```

---

## Zod Schemas

### invitation-extranet.ts

```typescript
import { z } from 'zod';
import { firestoreIdSchema, timestampSchema } from './primitives';

export const statutInvitationSchema = z.enum(['en_attente', 'acceptee', 'expiree']);

export const invitationExtranetSchema = z.object({
  id: firestoreIdSchema,
  email: z.string().email(),
  coproprietaireId: firestoreIdSchema,
  token: z.string().uuid(),
  dateEnvoi: timestampSchema,
  dateExpiration: timestampSchema,
  statut: statutInvitationSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type InvitationExtranet = z.infer<typeof invitationExtranetSchema>;
export type StatutInvitation = z.infer<typeof statutInvitationSchema>;
```

### document-partage.ts

```typescript
import { z } from 'zod';
import { firestoreIdSchema, timestampSchema } from './primitives';

export const categorieDocumentSchema = z.enum([
  'ag',
  'contrats',
  'reglement',
  'travaux',
  'autres'
]);

export const mimeTypeAutoriseSchema = z.enum([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

export const documentPartageSchema = z.object({
  id: firestoreIdSchema,
  nom: z.string().min(1).max(255),
  type: mimeTypeAutoriseSchema,
  taille: z.number().int().positive().max(10 * 1024 * 1024), // 10 Mo max
  storagePath: z.string().min(1),
  categorie: categorieDocumentSchema,
  visibleExtranet: z.boolean(),
  datePartage: timestampSchema.nullable(),
  consultePar: z.array(firestoreIdSchema),
  uploadedBy: firestoreIdSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type DocumentPartage = z.infer<typeof documentPartageSchema>;
export type CategorieDocument = z.infer<typeof categorieDocumentSchema>;
```

### preferences-notification.ts

```typescript
import { z } from 'zod';
import { firestoreIdSchema, timestampSchema } from './primitives';

export const preferencesNotificationSchema = z.object({
  id: firestoreIdSchema, // = userId
  emailNouveauxDocuments: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type PreferencesNotification = z.infer<typeof preferencesNotificationSchema>;
```
