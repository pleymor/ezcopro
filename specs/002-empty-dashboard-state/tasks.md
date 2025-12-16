# Tasks: État vide du dashboard

**Input**: Design documents from `/specs/002-empty-dashboard-state/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), quickstart.md

**Tests**: Tests E2E inclus (TDD requis par la constitution)

**Organization**: Tasks groupées par user story pour permettre une implémentation et des tests indépendants.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Peut s'exécuter en parallèle (fichiers différents, pas de dépendances)
- **[Story]**: À quelle user story appartient cette tâche (US1, US2)
- Chemins de fichiers exacts inclus dans les descriptions

---

## Phase 1: Setup

**Purpose**: Pas de setup nécessaire - le projet existe déjà avec toute l'infrastructure

✅ Aucune tâche de setup requise - utilise l'infrastructure existante (Next.js, Tailwind, Lucide React)

---

## Phase 2: Foundational

**Purpose**: Pas de prérequis bloquants - le hook `useCopropriete` existe déjà

✅ Aucune tâche fondationnelle requise - tous les hooks et types sont déjà en place

**Checkpoint**: Foundation ready - l'implémentation des user stories peut commencer

---

## Phase 3: User Story 1 - Affichage de l'état vide (Priority: P1) 🎯 MVP

**Goal**: Afficher un état vide adapté quand l'utilisateur n'a aucune copropriété, avec message d'accueil et bouton vers onboarding

**Independent Test**: Créer un utilisateur sans copropriété et vérifier que l'écran d'état vide s'affiche avec le bouton de création

### Tests E2E pour User Story 1 (TDD - RED) ⚠️

> **NOTE: Écrire ces tests EN PREMIER, s'assurer qu'ils ÉCHOUENT avant l'implémentation**

- [x] T001 [US1] Créer test E2E "affiche état vide quand aucune copropriété" dans tests/e2e/dashboard-empty.spec.ts
- [x] T002 [US1] Créer test E2E "bouton redirige vers onboarding" dans tests/e2e/dashboard-empty.spec.ts
- [x] T003 [US1] Vérifier que les tests échouent (RED phase)

### Implémentation pour User Story 1 (GREEN)

- [x] T004 [P] [US1] Créer composant EmptyState réutilisable dans src/components/dashboard/EmptyState.tsx
- [x] T005 [US1] Modifier dashboard pour détecter `coproprietes.length === 0` dans src/app/(dashboard)/dashboard/page.tsx
- [x] T006 [US1] Intégrer EmptyState dans le dashboard avec lien vers /onboarding dans src/app/(dashboard)/dashboard/page.tsx
- [x] T007 [US1] Vérifier que les tests E2E passent (GREEN phase)

**Checkpoint**: User Story 1 complète - l'état vide s'affiche et redirige vers onboarding

---

## Phase 4: User Story 2 - Transition vers dashboard normal (Priority: P2)

**Goal**: Après création d'une copropriété, le dashboard normal s'affiche automatiquement

**Independent Test**: Créer une copropriété depuis l'état vide et vérifier que le dashboard normal s'affiche

### Tests E2E pour User Story 2 (TDD - RED) ⚠️

- [x] T008 [US2] Créer test E2E "affiche dashboard normal après création copropriété" dans tests/e2e/dashboard-empty.spec.ts
- [x] T009 [US2] Vérifier que le test échoue (RED phase)

### Implémentation pour User Story 2 (GREEN)

- [x] T010 [US2] Vérifier que la logique existante gère déjà la transition (auto-sélection dans useCopropriete) - NO-OP si déjà fonctionnel
- [x] T011 [US2] Vérifier que le test E2E passe (GREEN phase)

**Checkpoint**: User Stories 1 ET 2 fonctionnent indépendamment

---

## Phase 5: Edge Cases & Error Handling

**Goal**: Gérer les cas limites (erreur de chargement, suppression de toutes les copros)

### Tests pour Edge Cases

- [x] T012 [P] Créer test E2E "affiche erreur si chargement échoue" dans tests/e2e/dashboard-empty.spec.ts
- [x] T013 Vérifier que le test échoue

### Implémentation Edge Cases

- [x] T014 Ajouter gestion de l'état d'erreur avec bouton "Réessayer" dans src/app/(dashboard)/dashboard/page.tsx
- [x] T015 Vérifier que le test passe

**Checkpoint**: Tous les edge cases sont gérés

---

## Phase 6: Polish & Validation

**Purpose**: Vérifications finales et nettoyage

- [x] T016 Exécuter tous les tests E2E et vérifier qu'ils passent
- [x] T017 Vérifier le type-check (`npm run type-check`)
- [x] T018 Vérifier le lint (`npm run lint`)
- [ ] T019 Tester manuellement le flux complet (nouvel utilisateur → état vide → onboarding → dashboard normal)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Aucune tâche - infrastructure existante
- **Foundational (Phase 2)**: Aucune tâche - hooks existants
- **User Story 1 (Phase 3)**: Peut commencer immédiatement
- **User Story 2 (Phase 4)**: Dépend de Phase 3 (même fichier dashboard)
- **Edge Cases (Phase 5)**: Dépend de Phase 3
- **Polish (Phase 6)**: Dépend de toutes les phases précédentes

### User Story Dependencies

- **User Story 1 (P1)**: Aucune dépendance - MVP minimal
- **User Story 2 (P2)**: Dépend de US1 (utilise le même dashboard modifié)

### Within Each User Story

- Tests DOIVENT être écrits et ÉCHOUER avant l'implémentation
- Composant EmptyState avant modification dashboard
- Vérification GREEN après chaque implémentation

### Parallel Opportunities

- T004 (EmptyState) peut être fait en parallèle avec T001-T003 (tests)
- T012 (test erreur) peut être fait en parallèle avec T008 (test transition)

---

## Parallel Example: User Story 1

```bash
# Lancer les tests E2E en premier (doivent échouer):
Task: "Créer test E2E 'affiche état vide' dans tests/e2e/dashboard-empty.spec.ts"
Task: "Créer test E2E 'bouton redirige' dans tests/e2e/dashboard-empty.spec.ts"

# En parallèle, créer le composant (pendant que les tests sont écrits):
Task: "Créer composant EmptyState dans src/components/dashboard/EmptyState.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ✅ Phase 1: Setup (rien à faire)
2. ✅ Phase 2: Foundational (rien à faire)
3. Phase 3: User Story 1 (T001-T007)
4. **STOP and VALIDATE**: Tester US1 indépendamment
5. Deploy/demo si prêt

### Incremental Delivery

1. US1 → État vide fonctionnel (MVP!)
2. US2 → Transition automatique validée
3. Edge Cases → Gestion d'erreur robuste
4. Chaque story ajoute de la valeur sans casser les précédentes

---

## Notes

- [P] tasks = fichiers différents, pas de dépendances
- [Story] label mappe la tâche à une user story spécifique
- Constitution TDD respectée : tests RED avant implémentation GREEN
- Feature simple : ~19 tâches, 1 nouveau composant, 1 fichier modifié
- Commit après chaque tâche logique
