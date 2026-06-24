# Data Model: GED - Gestion Documentaire avec Dossiers

**Feature**: 010-ged-dossiers
**Date**: 2025-01-19

## Entities

### Dossier (Nouveau)

Conteneur de documents et sous-dossiers dans l'arborescence.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | auto | Identifiant unique Firestore |
| nom | string | yes | Nom du dossier (1-100 chars, alphanum + espaces/tirets/underscores) |
| parentId | string \| null | yes | ID du dossier parent, null si racine |
| path | string | yes | Chemin complet (ex: `/Contrats/2025/Ascenseur`) |
| depth | number | yes | Profondeur dans l'arbre (0 = racine, max 2) |
| niveauAcces | NiveauAcces | yes | Niveau de visibilité du dossier |
| coproprieteId | string | yes | Référence à la copropriété |
| createdAt | Timestamp | auto | Date de création |
| updatedAt | Timestamp | auto | Date de dernière modification |
| createdBy | string | yes | UID de l'utilisateur créateur |

**Firestore Path**: `coproprietes/{coproprieteId}/dossiers/{dossierId}`

**Indexes requis**:
- `coproprieteId` + `parentId` (pour lister les enfants d'un dossier)
- `coproprieteId` + `path` (pour recherche par préfixe)

### NiveauAcces (Enum)

Niveaux de visibilité pour dossiers et documents.

| Value | Description |
|-------|-------------|
| `syndic` | Visible uniquement par le syndic |
| `conseil` | Visible par le syndic et les membres du conseil syndical |
| `tous` | Visible par tous les copropriétaires |

### MembreConseil (Nouveau)

Association d'un copropriétaire au conseil syndical.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | auto | ID = coproprietaireId (clé naturelle) |
| coproprietaireId | string | yes | Référence au copropriétaire |
| estPresident | boolean | yes | true si président du conseil |
| dateNomination | Timestamp | yes | Date d'ajout au conseil |
| nomineePar | string | yes | UID du syndic qui a fait la nomination |

**Firestore Path**: `coproprietes/{coproprieteId}/conseilSyndical/{coproprietaireId}`

### DocumentPartage (Existant - Modifié)

Ajout de champs pour support des dossiers et niveaux d'accès.

| Field | Type | Required | Change |
|-------|------|----------|--------|
| dossierId | string \| null | yes | **NOUVEAU** - ID du dossier parent, null si racine |
| niveauAcces | NiveauAcces | yes | **NOUVEAU** - Remplace visibleExtranet |
| visibleExtranet | boolean | no | **DEPRECATED** - Conservé pour migration |

**Migration**:
```
visibleExtranet: true  → niveauAcces: "tous"
visibleExtranet: false → niveauAcces: "syndic"
dossierId: null (tous les documents existants)
```

## Relationships

```
Copropriete
    │
    ├── Dossier (0..n)
    │       │
    │       └── Dossier (0..n, max depth 2)
    │               │
    │               └── DocumentPartage (0..n)
    │
    ├── DocumentPartage (0..n, racine)
    │
    └── ConseilSyndical
            │
            └── MembreConseil (0..n)
                    │
                    └── Coproprietaire (1)
```

## Validation Rules (Zod)

### DossierSchema

```typescript
const niveauAccesSchema = z.enum(['syndic', 'conseil', 'tous']);

const dossierSchema = z.object({
  nom: z.string()
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères')
    .regex(/^[\w\s\-àâäéèêëïîôùûüç]+$/i, 'Caractères non autorisés'),
  parentId: z.string().nullable(),
  niveauAcces: niveauAccesSchema,
});

const createDossierSchema = dossierSchema;

const updateDossierSchema = dossierSchema.partial();
```

### MembreConseilSchema

```typescript
const membreConseilSchema = z.object({
  coproprietaireId: z.string().min(1),
  estPresident: z.boolean().default(false),
});
```

## State Transitions

### Dossier Lifecycle

```
[Création]
    │
    ▼
[Actif] ←──────────────┐
    │                  │
    ├── Renommer ──────┤
    ├── Changer accès ─┤
    ├── Déplacer doc ──┤
    │                  │
    ▼                  │
[Suppression demandée]─┘
    │
    ├── Si vide → Supprimé
    │
    └── Si contenu → Confirmation requise
            │
            ├── Confirmé → Suppression récursive
            └── Annulé → Retour Actif
```

### MembreConseil Lifecycle

```
[Non membre]
    │
    ▼ (nomination par syndic)
[Membre] ←─────────────┐
    │                  │
    ├── Nommer président
    │       │
    │       ▼
    │   [Président] ───┘
    │
    ▼ (retrait par syndic)
[Non membre]
```

## Security Rules (Firestore)

```javascript
// Dossiers
match /coproprietes/{coproprieteId}/dossiers/{dossierId} {
  // Lecture: selon niveauAcces
  allow read: if isSyndic(coproprieteId) ||
    (resource.data.niveauAcces == 'tous') ||
    (resource.data.niveauAcces == 'conseil' && isMembreConseil(coproprieteId));

  // Écriture: syndic uniquement
  allow write: if isSyndic(coproprieteId);
}

// Conseil syndical
match /coproprietes/{coproprieteId}/conseilSyndical/{membreId} {
  allow read: if isSyndic(coproprieteId) || isCoproprietaire(coproprieteId);
  allow write: if isSyndic(coproprieteId);
}

// Fonctions helper
function isSyndic(coproprieteId) {
  return request.auth != null &&
    request.auth.token.role == 'syndic' &&
    request.auth.token.coproprieteId == coproprieteId;
}

function isMembreConseil(coproprieteId) {
  return request.auth != null &&
    request.auth.token.estMembreConseil == true &&
    request.auth.token.coproprieteId == coproprieteId;
}

function isCoproprietaire(coproprieteId) {
  return request.auth != null &&
    request.auth.token.coproprieteId == coproprieteId;
}
```
