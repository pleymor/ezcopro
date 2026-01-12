# Tasks: Gestion des clés de répartition

**Input**: Design documents from `/specs/007-cles-repartition/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Following TDD approach per constitution (Test-First Development)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Schema and shared infrastructure for all user stories

- [x] T001 [P] Create Zod schemas for CleRepartition and QuotePart in src/lib/schemas/cle-repartition.ts
- [x] T002 [P] Create CleRepartitionError class in src/lib/schemas/cle-repartition.ts
- [x] T003 [P] Update mock data with sample clés de répartition in src/lib/test/mock-data.ts
- [x] T004 [P] Create type exports in src/types/cle-repartition.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core hook and navigation that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Implement useClesRepartition hook with full CRUD in src/hooks/useClesRepartition.ts
- [x] T006 Create Firebase service functions in src/lib/firebase/cles-repartition.ts
- [x] T007 Add "Clés de répartition" submenu under "Lots" in src/components/layouts/Navigation.tsx
- [x] T008 Create route structure for /lots/cles-repartition/* pages

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Créer une clé de répartition (Priority: P1) 🎯 MVP

**Goal**: Syndic can create distribution keys with quotes-parts for all lots

**Independent Test**: Créer une clé de répartition et vérifier qu'elle apparaît dans la liste

### Tests for User Story 1

- [x] T009 [P] [US1] Unit test for cleRepartitionFormSchema validation in tests/unit/cle-repartition.test.ts
- [x] T010 [P] [US1] Unit test for validateQuotePartsTotal helper in tests/unit/cle-repartition.test.ts
- [x] T011 [P] [US1] Unit test for createCleRepartition service in tests/unit/cle-repartition.test.ts

### Implementation for User Story 1

- [x] T012 [P] [US1] Create QuotesPartsEditor component in src/components/cles-repartition/QuotesPartsEditor.tsx
- [x] T013 [P] [US1] Create CleRepartitionForm component in src/components/forms/CleRepartitionForm.tsx
- [x] T014 [US1] Create "nouvelle" page in src/app/(dashboard)/lots/cles-repartition/nouvelle/page.tsx
- [x] T015 [US1] Implement createCle function in useClesRepartition hook
- [x] T016 [US1] Add name uniqueness validation before creation
- [x] T017 [US1] Display total millièmes with warning if ≠ 10000

**Checkpoint**: User Story 1 complete - can create clés de répartition with quotes-parts

---

## Phase 4: User Story 2 - Affecter les lots à une clé (Priority: P1) 🎯 MVP

**Goal**: Syndic can define and modify quotes-parts for each lot

**Independent Test**: Affecter des quotes-parts à plusieurs lots et vérifier le total

### Tests for User Story 2

- [x] T018 [P] [US2] Unit test for quote-part update in tests/unit/cle-repartition.test.ts

### Implementation for User Story 2

- [x] T019 [US2] Add real-time total calculation to QuotesPartsEditor
- [x] T020 [US2] Implement updateCle function for quotes-parts updates in useClesRepartition hook
- [x] T021 [US2] Add lot info display (numero, type, owner) in QuotesPartsEditor

**Checkpoint**: User Stories 1 & 2 complete - full creation and quotes-parts management

---

## Phase 5: User Story 3 - Consulter les clés de répartition (Priority: P2)

**Goal**: Syndic can view list of keys and see detail with all quotes-parts

**Independent Test**: Accéder à la liste des clés et consulter le détail d'une clé

### Tests for User Story 3

- [x] T022 [P] [US3] E2E test for list view in tests/e2e/cles-repartition.spec.ts
- [x] T023 [P] [US3] E2E test for detail view in tests/e2e/cles-repartition.spec.ts

### Implementation for User Story 3

- [x] T024 [P] [US3] Create CleRepartitionList component in src/components/cles-repartition/CleRepartitionList.tsx
- [x] T025 [P] [US3] Create CleRepartitionDetail component in src/components/cles-repartition/CleRepartitionDetail.tsx
- [x] T026 [US3] Create list page in src/app/(dashboard)/lots/cles-repartition/page.tsx
- [x] T027 [US3] Create detail page in src/app/(dashboard)/lots/cles-repartition/[id]/page.tsx
- [x] T028 [US3] Implement auto-creation of default "Tantièmes généraux" key on first access

**Checkpoint**: User Story 3 complete - can view list and details

---

## Phase 6: User Story 4 - Modifier une clé de répartition (Priority: P2)

**Goal**: Syndic can edit name, description, and quotes-parts of existing key

**Independent Test**: Modifier le nom et une quote-part d'une clé existante

### Tests for User Story 4

- [x] T029 [P] [US4] E2E test for edit flow in tests/e2e/cles-repartition.spec.ts

### Implementation for User Story 4

- [x] T030 [US4] Create edit page in src/app/(dashboard)/lots/cles-repartition/[id]/edit/page.tsx
- [x] T031 [US4] Add edit button to CleRepartitionDetail component
- [x] T032 [US4] Implement name uniqueness check on update (excluding current key)

**Checkpoint**: User Story 4 complete - can edit existing keys

---

## Phase 7: User Story 5 - Supprimer une clé de répartition (Priority: P3)

**Goal**: Syndic can delete unused keys (with protection for keys in use)

**Independent Test**: Supprimer une clé non utilisée et vérifier qu'elle disparaît

### Tests for User Story 5

- [x] T033 [P] [US5] Unit test for deletion check (in-use validation) in tests/unit/cle-repartition.test.ts
- [x] T034 [P] [US5] E2E test for delete with protection in tests/e2e/cles-repartition.spec.ts

### Implementation for User Story 5

- [x] T035 [US5] Implement deleteCle function with in-use check in useClesRepartition hook
- [x] T036 [US5] Add delete button with confirmation dialog to CleRepartitionDetail
- [x] T037 [US5] Display error message when deletion is blocked (key in use)

**Checkpoint**: User Story 5 complete - full CRUD with deletion protection

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [x] T038 [P] Run all unit tests and fix any failures
- [x] T039 [P] Run all E2E tests and fix any failures
- [x] T040 [P] Add loading states to all pages
- [x] T041 [P] Add empty state to list page
- [x] T042 Verify mobile responsiveness for QuotesPartsEditor
- [x] T043 Run type-check and lint, fix any errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational completion
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational - No dependencies
- **US2 (P1)**: Can start after Foundational - Closely related to US1 (uses QuotesPartsEditor)
- **US3 (P2)**: Can start after Foundational - Needs list/detail components
- **US4 (P2)**: Depends on US3 (uses detail page for edit entry point)
- **US5 (P3)**: Depends on US3 (uses detail page for delete entry point)

### Parallel Opportunities

**Phase 1 (all parallel)**:
```
T001 || T002 || T003 || T004
```

**Phase 3 Tests (parallel)**:
```
T009 || T010 || T011
```

**Phase 3 Components (parallel)**:
```
T012 || T013
```

**Phase 5 Tests + Components (parallel)**:
```
T022 || T023 || T024 || T025
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (schemas)
2. Complete Phase 2: Foundational (hook, navigation)
3. Complete Phase 3: User Story 1 (create key)
4. Complete Phase 4: User Story 2 (quotes-parts)
5. **STOP and VALIDATE**: Can create and manage keys with quotes-parts

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 + US2 → MVP: Create keys with quotes-parts
3. US3 → Add list and detail views
4. US4 → Add edit capability
5. US5 → Add deletion with protection
6. Polish → Final validation

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| Setup | T001-T004 (4) | Schemas and types |
| Foundational | T005-T008 (4) | Hook, services, navigation |
| US1 - Create | T009-T017 (9) | Create clés with quotes-parts |
| US2 - Assign | T018-T021 (4) | Quotes-parts management |
| US3 - View | T022-T028 (7) | List and detail pages |
| US4 - Edit | T029-T032 (4) | Edit existing keys |
| US5 - Delete | T033-T037 (5) | Delete with protection |
| Polish | T038-T043 (6) | Final validation |

**Total**: 43 tasks

---

## Notes

- [P] tasks can run in parallel (different files)
- [US#] maps task to specific user story
- Tests written before implementation (TDD)
- Commit after each task or logical group
- US1 + US2 together form the MVP
