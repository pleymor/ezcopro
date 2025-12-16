# Implementation Plan: État vide du dashboard

**Branch**: `002-empty-dashboard-state` | **Date**: 2025-12-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-empty-dashboard-state/spec.md`

## Summary

Modifier le dashboard pour afficher un état vide adapté lorsqu'un utilisateur n'a aucune copropriété, au lieu d'un écran de chargement infini. L'état vide comprend un message d'accueil, une illustration, et un bouton d'action redirigeant vers la page d'onboarding.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 15.x, React 19.x, Tailwind CSS, Lucide React (icons)
**Storage**: Firebase Firestore (via hook existant `useCopropriete`)
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Web PWA (responsive)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Rendu instantané de l'état vide (< 100ms après chargement)
**Constraints**: Offline-capable (PWA), mobile-first
**Scale/Scope**: Simple modification UI d'une page existante

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First (TDD) | ✅ | Tests E2E pour l'état vide avant implémentation |
| II. BDD | ✅ | Scenarios Given/When/Then définis dans spec.md |
| III. Type Safety | ✅ | TypeScript strict, pas de `any` |
| IV. Security First | ✅ N/A | Pas de données sensibles, auth gérée par hook existant |
| V. API-First | ✅ N/A | Pas de nouvelle API, utilise hook existant |
| VI. Data Integrity | ✅ N/A | Pas de mutation de données |
| VII. Simplicity | ✅ | Modification minimale d'un seul fichier + 1 composant |

**Gate Status**: ✅ PASS - Aucune violation

## Project Structure

### Documentation (this feature)

```text
specs/002-empty-dashboard-state/
├── plan.md              # This file
├── spec.md              # Feature specification
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
src/
├── app/
│   └── (dashboard)/
│       └── dashboard/
│           └── page.tsx        # [MODIFY] Ajouter gestion état vide
├── components/
│   └── dashboard/
│       └── EmptyState.tsx      # [CREATE] Composant état vide
└── lib/
    └── hooks/
        └── useCopropriete.tsx  # [EXISTING] Fournit coproprietes, loading, error

tests/
└── e2e/
    └── dashboard-empty.spec.ts # [CREATE] Tests E2E état vide
```

**Structure Decision**: Modification minimale - ajout d'un composant `EmptyState` réutilisable et modification de la page dashboard existante.

## Implementation Approach

### Phase 1: Tests E2E (TDD - Red)

Créer les tests E2E qui échoueront avant l'implémentation :

```typescript
// tests/e2e/dashboard-empty.spec.ts
test('affiche état vide quand aucune copropriété', async ({ page }) => {
  // Mock user sans copropriété
  await page.goto('/dashboard');
  await expect(page.getByText(/créer.*copropriété/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /créer/i })).toHaveAttribute('href', '/onboarding');
});

test('redirige vers onboarding au clic sur le bouton', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('text=/créer.*copropriété/i');
  await expect(page).toHaveURL('/onboarding');
});
```

### Phase 2: Composant EmptyState (Green)

```typescript
// src/components/dashboard/EmptyState.tsx
interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  icon?: React.ComponentType<{ className?: string }>;
}
```

### Phase 3: Modification Dashboard

Modifier `src/app/(dashboard)/dashboard/page.tsx` :
- Ajouter condition `coproprietes.length === 0 && !loading`
- Afficher `EmptyState` avec lien vers `/onboarding`
- Gérer l'état d'erreur avec bouton "Réessayer"

## Complexity Tracking

Aucune violation de la constitution - pas de complexity tracking nécessaire.
