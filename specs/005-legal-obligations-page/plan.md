# Implementation Plan: Page des Obligations Légales du Syndic Bénévole

**Branch**: `005-legal-obligations-page` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-legal-obligations-page/spec.md`

## Summary

Création d'une page d'information statique présentant les obligations légales du syndic bénévole en France, accessible depuis une section "Ressources" dans la navigation. La page affichera le contenu organisé en 5 catégories avec un sommaire cliquable et les références aux textes de loi (loi du 10 juillet 1965, décret du 17 mars 1967).

## Technical Context

**Language/Version**: TypeScript 5.6.0 (strict mode enabled)
**Primary Dependencies**: Next.js 15.1.0, React 19.0.0, Tailwind CSS 3.4.0, Lucide React
**Storage**: N/A (contenu statique, pas de données persistées)
**Testing**: Vitest (unit), Playwright (e2e)
**Target Platform**: Web (PWA), responsive (desktop, tablet, mobile 320px+)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Chargement instantané (<2s), contenu statique
**Constraints**: Mode clair/sombre, accessibilité, authentification requise
**Scale/Scope**: Page unique avec 5 sections de contenu

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | ✅ PASS | Tests E2E Playwright pour la navigation et l'affichage du contenu |
| II. Behavior-Driven Development | ✅ PASS | Scenarios Given/When/Then définis dans spec.md |
| III. Type Safety | ✅ PASS | TypeScript strict mode, types pour le contenu des obligations |
| IV. Security First | ✅ PASS | Page protégée par authentification (dashboard layout existant) |
| V. API-First Design | ⚪ N/A | Pas d'API requise (contenu statique) |
| VI. Data Integrity & Auditability | ⚪ N/A | Pas de données persistées |
| VII. Simplicity & Pragmatism | ✅ PASS | Solution simple: composant React avec contenu statique |

**Gate Status**: ✅ PASS - Aucune violation, prêt pour Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/005-legal-obligations-page/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (structure du contenu)
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── (dashboard)/
│       └── ressources/
│           └── obligations-legales/
│               └── page.tsx          # Page principale
├── components/
│   └── ressources/
│       ├── ObligationsContent.tsx    # Contenu des obligations
│       ├── TableOfContents.tsx       # Sommaire cliquable
│       └── ObligationSection.tsx     # Section individuelle
├── data/
│   └── obligations-legales.ts        # Données statiques typées
└── types/
    └── obligations.ts                # Types pour le contenu

tests/
├── e2e/
│   └── obligations-legales.spec.ts   # Tests E2E Playwright
└── unit/
    └── obligations-content.test.tsx  # Tests unitaires composants
```

**Structure Decision**: Extension du dashboard existant avec une nouvelle route `/ressources/obligations-legales`. Les composants sont isolés dans `components/ressources/` pour la modularité. Le contenu est séparé dans `data/` pour faciliter les futures mises à jour.

## Complexity Tracking

> Aucune violation de la Constitution - pas de justification nécessaire.
