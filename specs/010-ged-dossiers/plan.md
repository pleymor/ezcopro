# Implementation Plan: GED - Gestion Documentaire avec Dossiers

**Branch**: `010-ged-dossiers` | **Date**: 2025-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-ged-dossiers/spec.md`

## Summary

Extension de la fonctionnalité documents existante (009-extranet-coproprietaires) pour ajouter:
- Organisation hiérarchique en dossiers et sous-dossiers (max 3 niveaux)
- Gestion fine des droits d'accès (syndic seul, conseil syndical, tous copropriétaires)
- Constitution et gestion du conseil syndical

## Technical Context

**Language/Version**: TypeScript 5.6.0 (strict mode enabled)
**Primary Dependencies**: Next.js 15.x, React 19.x, Firebase (Auth, Firestore, Storage), Tailwind CSS, Zod, React Hook Form, Radix UI, Lucide React
**Storage**: Firebase Firestore (documents metadata) + Firebase Storage (fichiers)
**Testing**: Playwright (E2E), Vitest (unit - si nécessaire)
**Target Platform**: Web PWA (mobile-first responsive)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Navigation entre dossiers < 500ms, recherche < 2s
**Constraints**: Quota stockage 500 Mo/copropriété (existant), profondeur max 3 niveaux
**Scale/Scope**: Petites copropriétés (3-30 lots), ~100 documents max par copro

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | ✅ PASS | Tests E2E Playwright avant implémentation |
| II. BDD Acceptance Scenarios | ✅ PASS | 5 user stories avec scénarios Given/When/Then |
| III. Type Safety | ✅ PASS | TypeScript strict, Zod pour validation runtime |
| IV. Security First | ✅ PASS | Firestore rules pour droits d'accès, vérification côté serveur |
| V. API-First Design | ✅ PASS | Contrats OpenAPI générés avant implémentation |
| VI. Data Integrity | ✅ PASS | Transactions Firestore pour opérations multi-documents |
| VII. Simplicity | ✅ PASS | Extension du code existant, pas de nouvelle dépendance |

## Project Structure

### Documentation (this feature)

```text
specs/010-ged-dossiers/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── (dashboard)/
│       ├── documents/
│       │   └── page.tsx              # Page syndic (à modifier)
│       ├── extranet/
│       │   └── documents/
│       │       └── page.tsx          # Page extranet (à modifier)
│       └── parametres/
│           └── conseil-syndical/
│               └── page.tsx          # Nouvelle page
├── components/
│   └── documents/
│       ├── FolderTree.tsx            # Nouveau - arborescence
│       ├── FolderCard.tsx            # Nouveau - carte dossier
│       ├── Breadcrumb.tsx            # Nouveau - fil d'Ariane
│       ├── CreateFolderModal.tsx     # Nouveau - création dossier
│       ├── MoveDocumentModal.tsx     # Nouveau - déplacement
│       └── AccessLevelBadge.tsx      # Nouveau - badge niveau accès
├── hooks/
│   ├── useDocuments.ts               # Existant (à modifier)
│   ├── useFolders.ts                 # Nouveau
│   └── useConseilSyndical.ts         # Nouveau
├── lib/
│   ├── firebase/
│   │   └── services/
│   │       ├── document-partage.ts   # Existant (à modifier)
│   │       ├── dossier.ts            # Nouveau
│   │       └── conseil-syndical.ts   # Nouveau
│   └── schemas/
│       ├── dossier.ts                # Nouveau
│       └── conseil-syndical.ts       # Nouveau
└── types/
    ├── dossier.ts                    # Nouveau
    └── conseil-syndical.ts           # Nouveau

tests/
└── e2e/
    ├── syndic/
    │   ├── documents.spec.ts         # Existant (à étendre)
    │   └── dossiers.spec.ts          # Nouveau
    └── extranet/
        └── documents.spec.ts         # Existant (à étendre)
```

**Structure Decision**: Extension de la structure existante. Pas de nouveau répertoire racine, utilisation des conventions établies (hooks/, components/, lib/firebase/services/).

## Complexity Tracking

> Aucune violation de la constitution détectée. Pas de justification requise.
