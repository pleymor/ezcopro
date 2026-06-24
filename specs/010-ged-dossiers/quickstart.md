# Quickstart: GED - Gestion Documentaire avec Dossiers

**Feature**: 010-ged-dossiers
**Date**: 2025-01-19

## Overview

Cette feature étend la gestion documentaire existante avec:
- **Dossiers hiérarchiques** (max 3 niveaux)
- **Droits d'accès granulaires** (syndic/conseil/tous)
- **Gestion du conseil syndical**

## Prerequisites

- Node.js 24+
- Firebase CLI configuré
- Projet EzCopro cloné avec la feature 009-extranet-coproprietaires mergée

## Quick Setup

```bash
# 1. Se placer sur la branche
git checkout 010-ged-dossiers

# 2. Installer les dépendances (si nouvelles)
npm install

# 3. Lancer le serveur de développement
npm run dev

# 4. Lancer les tests E2E
NEXT_PUBLIC_TEST_MODE=true npm run dev &
npx playwright test tests/e2e/syndic/dossiers.spec.ts --project=chromium
```

## Key Files

### Types

```typescript
// src/types/dossier.ts
export type NiveauAcces = 'syndic' | 'conseil' | 'tous';

export interface Dossier {
  id: string;
  nom: string;
  parentId: string | null;
  path: string;
  depth: number;
  niveauAcces: NiveauAcces;
  coproprieteId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

```typescript
// src/types/conseil-syndical.ts
export interface MembreConseil {
  coproprietaireId: string;
  estPresident: boolean;
  dateNomination: Timestamp;
  nomineePar: string;
}
```

### Hooks

```typescript
// src/hooks/useFolders.ts
export function useFolders(coproprieteId: string, parentId: string | null) {
  // Retourne { folders, loading, error, createFolder, deleteFolder, updateFolder }
}

// src/hooks/useConseilSyndical.ts
export function useConseilSyndical(coproprieteId: string) {
  // Retourne { membres, loading, error, addMembre, removeMembre, setPresident }
}
```

### Services Firebase

```typescript
// src/lib/firebase/services/dossier.ts
export function subscribeToDossiers(coproprieteId, parentId, callback): Unsubscribe
export async function createDossier(coproprieteId, data): Promise<Dossier>
export async function updateDossier(coproprieteId, dossierId, data): Promise<void>
export async function deleteDossier(coproprieteId, dossierId, force): Promise<void>
export async function getDossierPath(coproprieteId, dossierId): Promise<Dossier[]>
```

### Components

| Component | Description |
|-----------|-------------|
| `FolderTree` | Affiche la liste des dossiers avec actions |
| `FolderCard` | Carte individuelle d'un dossier |
| `Breadcrumb` | Fil d'Ariane pour la navigation |
| `CreateFolderModal` | Modal de création de dossier |
| `MoveDocumentModal` | Modal pour déplacer un document |
| `AccessLevelBadge` | Badge affichant le niveau d'accès |

## Usage Examples

### Créer un dossier

```typescript
const { createFolder } = useFolders(coproprieteId, null);

await createFolder({
  nom: 'Contrats 2025',
  niveauAcces: 'conseil',
  parentId: null, // racine
});
```

### Naviguer dans l'arborescence

```typescript
const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
const { folders } = useFolders(coproprieteId, currentFolderId);
const { path } = useFolderPath(coproprieteId, currentFolderId);

// path = [{ id: null, nom: 'Racine' }, { id: 'xxx', nom: 'Contrats' }, ...]
```

### Gérer le conseil syndical

```typescript
const { membres, addMembre, removeMembre, setPresident } = useConseilSyndical(coproprieteId);

// Ajouter un membre
await addMembre(coproprietaireId);

// Le nommer président
await setPresident(coproprietaireId);

// Le retirer
await removeMembre(coproprietaireId);
```

## Test Mode

En mode test (`NEXT_PUBLIC_TEST_MODE=true`), les données mock incluent:
- 3 dossiers de test (Contrats, AG, Privé-Syndic)
- 2 membres du conseil syndical de test
- Documents existants avec `dossierId` et `niveauAcces`

## Firestore Rules

Les règles doivent être déployées pour que les droits d'accès fonctionnent:

```bash
firebase deploy --only firestore:rules
```

## Migration

Les documents existants (sans dossier) fonctionnent sans modification:
- `dossierId: null` = racine
- `visibleExtranet: true` → affiché si `niveauAcces` compatible

Pour migrer explicitement (optionnel):
```typescript
// Script de migration one-time
await migrateDocumentsToNiveauAcces(coproprieteId);
```

## Common Tasks

### Ajouter un niveau d'accès

1. Modifier `NiveauAcces` dans `src/types/dossier.ts`
2. Mettre à jour le schema Zod dans `src/lib/schemas/dossier.ts`
3. Ajouter les règles Firestore correspondantes
4. Mettre à jour `AccessLevelBadge` pour l'affichage

### Augmenter la profondeur max

1. Modifier la constante `MAX_FOLDER_DEPTH` dans `src/lib/firebase/services/dossier.ts`
2. Mettre à jour la validation dans `createDossier`
3. Ajuster les tests E2E
