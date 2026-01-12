# Tasks: Page des Obligations Légales du Syndic Bénévole

**Input**: Design documents from `/specs/005-legal-obligations-page/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Inclus conformément à la Constitution (Test-First Development NON-NEGOTIABLE)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Types et structure de base partagés par toutes les user stories

- [x] T001 [P] Create TypeScript types for obligations in src/types/obligations.ts
- [x] T002 [P] Create directory structure for ressources components in src/components/ressources/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infrastructure requise AVANT toute implémentation de user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create static data file with all 5 categories of obligations in src/data/obligations-legales.ts
- [x] T004 Update Navigation component to add "Ressources" section with link to obligations-legales in src/components/layouts/Navigation.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Consulter les obligations légales principales (Priority: P1) 🎯 MVP

**Goal**: Afficher une page avec les 5 catégories d'obligations légales organisées et lisibles

**Independent Test**: Accéder à `/ressources/obligations-legales` et vérifier que les 5 catégories sont affichées avec leurs obligations

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T005 [P] [US1] E2E test: page accessible after login in tests/e2e/obligations-legales.spec.ts
- [x] T006 [P] [US1] E2E test: all 5 categories displayed in tests/e2e/obligations-legales.spec.ts
- [x] T007 [P] [US1] Unit test: ObligationSection renders correctly in tests/unit/obligations-content.test.tsx

### Implementation for User Story 1

- [x] T008 [P] [US1] Create ObligationSection component for individual category display in src/components/ressources/ObligationSection.tsx
- [x] T009 [US1] Create ObligationsContent component to render all sections in src/components/ressources/ObligationsContent.tsx
- [x] T010 [US1] Create page component at src/app/(dashboard)/ressources/obligations-legales/page.tsx
- [x] T011 [US1] Verify responsive layout works on mobile (320px) and desktop

**Checkpoint**: User Story 1 complete - page displays all obligations organized by category

---

## Phase 4: User Story 2 - Naviguer entre les sections d'obligations (Priority: P2)

**Goal**: Sommaire cliquable permettant de naviguer vers chaque section avec smooth scroll

**Independent Test**: Cliquer sur un lien du sommaire et vérifier que la page défile jusqu'à la section correspondante

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T012 [P] [US2] E2E test: table of contents displays all 5 sections in tests/e2e/obligations-legales.spec.ts
- [x] T013 [P] [US2] E2E test: clicking TOC link scrolls to section in tests/e2e/obligations-legales.spec.ts
- [x] T014 [P] [US2] Unit test: TableOfContents renders all categories in tests/unit/obligations-content.test.tsx

### Implementation for User Story 2

- [x] T015 [US2] Create TableOfContents component with anchor links in src/components/ressources/TableOfContents.tsx
- [x] T016 [US2] Add HTML id attributes to ObligationSection for anchor targets in src/components/ressources/ObligationSection.tsx
- [x] T017 [US2] Integrate TableOfContents into ObligationsContent with responsive layout (sidebar desktop, collapsible mobile) in src/components/ressources/ObligationsContent.tsx
- [x] T018 [US2] Add smooth scroll CSS behavior to page in src/app/(dashboard)/ressources/obligations-legales/page.tsx
- [x] T019 [US2] Add back-to-top functionality for easy return to TOC

**Checkpoint**: User Story 2 complete - navigation within page works smoothly

---

## Phase 5: User Story 3 - Consulter les références légales (Priority: P3)

**Goal**: Afficher les références aux textes de loi pour chaque obligation

**Independent Test**: Vérifier que chaque obligation affiche ses références légales (ex: "Article 14 de la loi du 10 juillet 1965")

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T020 [P] [US3] E2E test: legal references displayed for obligations in tests/e2e/obligations-legales.spec.ts
- [x] T021 [P] [US3] Unit test: LegalReference component renders correctly in tests/unit/obligations-content.test.tsx

### Implementation for User Story 3

- [x] T022 [P] [US3] Create LegalReference display component in src/components/ressources/LegalReference.tsx
- [x] T023 [US3] Integrate LegalReference into ObligationSection for each obligation in src/components/ressources/ObligationSection.tsx
- [x] T024 [US3] Ensure all obligations in data file have complete legal references in src/data/obligations-legales.ts

**Checkpoint**: User Story 3 complete - all legal references are visible and properly formatted

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Vérifications finales et améliorations transversales

- [x] T025 [P] Verify dark mode works correctly on obligations page
- [x] T026 [P] Verify mobile responsiveness (320px minimum width)
- [x] T027 [P] E2E test: dark mode toggle works on page in tests/e2e/obligations-legales.spec.ts
- [x] T028 Run full test suite and fix any failures
- [x] T029 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (types) - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after US1 (needs ObligationSection with id attributes)
- **User Story 3 (P3)**: Can start after US1 (needs ObligationSection to integrate references)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Components before page integration
- Core implementation before enhancements
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 (all parallel):**
- T001 and T002 can run in parallel

**Phase 3 - US1 Tests (all parallel):**
- T005, T006, T007 can run in parallel

**Phase 3 - US1 Implementation:**
- T008 can run in parallel with tests
- T009 depends on T008
- T010 depends on T009

**Phase 4 - US2 Tests (all parallel):**
- T012, T013, T014 can run in parallel

**Phase 5 - US3 Tests (all parallel):**
- T020, T021 can run in parallel

**Phase 6 (mostly parallel):**
- T025, T026, T027 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "E2E test: page accessible after login in tests/e2e/obligations-legales.spec.ts"
Task: "E2E test: all 5 categories displayed in tests/e2e/obligations-legales.spec.ts"
Task: "Unit test: ObligationSection renders correctly in tests/unit/obligations-content.test.tsx"

# After tests fail, launch implementation:
Task: "Create ObligationSection component in src/components/ressources/ObligationSection.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types, directories)
2. Complete Phase 2: Foundational (data, navigation)
3. Complete Phase 3: User Story 1 (core page display)
4. **STOP and VALIDATE**: Test page independently - can deploy as MVP
5. Page shows all obligations organized by category

### Incremental Delivery

1. **MVP**: Setup + Foundational + US1 → Basic page with all content
2. **+US2**: Add table of contents → Better navigation experience
3. **+US3**: Add legal references → Complete legal information
4. **+Polish**: Dark mode, responsive verification → Production ready

### Task Count by Phase

| Phase | Tasks | Parallel |
|-------|-------|----------|
| Phase 1: Setup | 2 | 2 |
| Phase 2: Foundational | 2 | 0 |
| Phase 3: US1 | 7 | 4 |
| Phase 4: US2 | 8 | 3 |
| Phase 5: US3 | 5 | 4 |
| Phase 6: Polish | 5 | 3 |
| **Total** | **29** | **16** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD per Constitution)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All components use existing Tailwind classes for dark mode support
