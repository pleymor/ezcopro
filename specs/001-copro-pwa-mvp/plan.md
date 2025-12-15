# Implementation Plan: EzCopro MVP - Gestion de Copropriété

**Branch**: `001-copro-pwa-mvp` | **Date**: 2025-12-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-copro-pwa-mvp/spec.md`

## Summary

PWA de gestion de copropriété pour syndics bénévoles en France. Fonctionnalités MVP : authentification Google, gestion des lots et copropriétaires, appels de fonds avec répartition automatique par tantièmes, suivi des paiements et soldes, historisation complète des actions. Interface mobile-first, française uniquement, développement en BDD avec Playwright et Storybook.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 14+ (App Router), React 18+, Tailwind CSS, Zod (validation), Playwright (E2E), Storybook (composants)
**Storage**: Firebase Firestore (free tier: 1GB storage, 50K reads/day, 20K writes/day)
**Authentication**: Firebase Auth (Google OAuth2)
**Testing**: Vitest (unit), Playwright (E2E/BDD), Storybook (composants visuels)
**Target Platform**: PWA - navigateurs modernes (Chrome, Firefox, Safari, Edge - 2 dernières versions)
**Project Type**: Web application (monorepo simplifié)
**Performance Goals**: <2s temps de réponse pour 95% des actions (SC-004)
**Constraints**: 0€ infrastructure (free tiers), ~5 copropriétés pilotes, ~100 utilisateurs max
**Scale/Scope**: 3-30 lots par copropriété, <15 typiquement

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Implementation |
|-----------|--------|----------------|
| I. Test-First (TDD) | ✅ PASS | Playwright BDD tests écrits avant implémentation, Vitest pour unit tests |
| II. BDD | ✅ PASS | Scénarios Given/When/Then dans spec.md, mappés vers tests Playwright |
| III. Type Safety | ✅ PASS | TypeScript strict, Zod pour validation runtime, Firestore avec types |
| IV. Security First | ✅ PASS | Firebase Auth (OAuth2), Firestore Security Rules, validation Zod |
| V. API-First | ✅ PASS | Contracts définis avant implémentation (voir /contracts/) |
| VI. Data Integrity | ✅ PASS | Firestore transactions, types décimaux pour montants, audit trail |
| VII. Simplicity | ✅ PASS | Stack minimale, Firebase managed services, pas de backend custom |

## Project Structure

### Documentation (this feature)

```text
specs/001-copro-pwa-mvp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Routes authentification
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/         # Routes protégées
│   │   ├── page.tsx         # Tableau de bord
│   │   ├── lots/
│   │   ├── coproprietaires/
│   │   ├── finances/
│   │   ├── soldes/
│   │   └── historique/
│   ├── layout.tsx
│   └── globals.css
├── components/              # Composants React réutilisables
│   ├── ui/                  # Composants UI de base (Storybook)
│   ├── forms/               # Formulaires
│   └── layouts/             # Layouts partagés
├── lib/                     # Logique métier et utilitaires
│   ├── firebase/            # Configuration et helpers Firebase
│   ├── hooks/               # React hooks custom
│   ├── schemas/             # Schémas Zod
│   └── utils/               # Fonctions utilitaires
├── types/                   # Types TypeScript partagés
└── styles/                  # Styles globaux

tests/
├── e2e/                     # Tests Playwright (BDD)
│   ├── auth.spec.ts
│   ├── lots.spec.ts
│   ├── coproprietaires.spec.ts
│   ├── finances.spec.ts
│   └── historique.spec.ts
└── unit/                    # Tests Vitest

.storybook/                  # Configuration Storybook
stories/                     # Stories des composants

public/
├── manifest.json            # PWA manifest
└── sw.js                    # Service Worker
```

**Structure Decision**: Architecture Next.js App Router monolithique. Pas de séparation frontend/backend car Firebase gère l'authentification et les données côté client. Structure optimisée pour le développement d'une équipe réduite avec BDD.

## Complexity Tracking

> **Aucune violation de constitution à justifier.**

La stack choisie respecte tous les principes :
- Firebase free tier = 0€ (Principe VII: Simplicity)
- TypeScript strict + Zod = type safety (Principe III)
- Firestore Security Rules = sécurité au niveau données (Principe IV)
- Playwright + Given/When/Then = BDD natif (Principe II)
