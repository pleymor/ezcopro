# Tasks: GED - Gestion Documentaire avec Dossiers

**Input**: Design documents from `/specs/010-ged-dossiers/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ged-api.yaml ✓

**Tests**: Tests E2E Playwright inclus conformément à la constitution du projet (Test-First Development).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Types & Schemas)

**Purpose**: Create TypeScript types and Zod validation schemas

- [x] T001 [P] Create NiveauAcces enum and Dossier type in src/types/dossier.ts
- [x] T002 [P] Create MembreConseil type in src/types/conseil-syndical.ts
- [x] T003 [P] Create Zod schema for dossier validation in src/lib/schemas/dossier.ts
- [x] T004 [P] Create Zod schema for conseil syndical in src/lib/schemas/conseil-syndical.ts
- [x] T005 Extend DocumentPartage type with dossierId and niveauAcces in src/types/document.ts

---

## Phase 2: Foundational (Services Firebase & Rules)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create dossier Firebase service with CRUD operations in src/lib/firebase/services/dossier.ts
- [x] T007 Create conseil-syndical Firebase service in src/lib/firebase/services/conseil-syndical.ts
- [x] T008 [P] Create useFolders hook in src/hooks/useFolders.ts
- [x] T009 [P] Create useConseilSyndical hook in src/hooks/useConseilSyndical.ts
- [x] T010 [P] Create useFolderPath hook for breadcrumb navigation in src/hooks/useFolderPath.ts
- [x] T011 Update Firestore security rules for dossiers and conseilSyndical collections in firestore.rules
- [x] T012 Update document-partage service with dossierId and niveauAcces support in src/lib/firebase/services/document-partage.ts
- [x] T013 Add mock data for test mode (dossiers, conseil members) in src/lib/test/mock-data.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Création et organisation de dossiers (Priority: P1) 🎯 MVP

**Goal**: Le syndic peut créer des dossiers et sous-dossiers (max 3 niveaux), renommer, supprimer et déplacer des documents entre dossiers.

**Independent Test**: Le syndic peut créer un dossier racine "Contrats 2025", y créer un sous-dossier "Ascenseur", et y déplacer un document existant.

### Tests E2E for User Story 1

- [ ] T014 [US1] Create E2E test file for folder CRUD operations in tests/e2e/syndic/dossiers.spec.ts

### Implementation for User Story 1

- [x] T015 [P] [US1] Create FolderCard component in src/components/documents/FolderCard.tsx
- [x] T016 [P] [US1] Create FolderTree component for folder listing in src/components/documents/FolderTree.tsx
- [x] T017 [P] [US1] Create CreateFolderModal component in src/components/documents/CreateFolderModal.tsx
- [x] T018 [P] [US1] Create MoveDocumentModal component in src/components/documents/MoveDocumentModal.tsx
- [x] T019 [P] [US1] Create DeleteFolderDialog confirmation component in src/components/documents/DeleteFolderDialog.tsx
- [x] T020 [US1] Update syndic documents page to display folders in src/app/(dashboard)/documents/page.tsx
- [x] T021 [US1] Add folder creation button and modal integration in syndic documents page
- [x] T022 [US1] Add folder rename functionality in FolderCard component
- [x] T023 [US1] Add folder delete functionality with confirmation dialog
- [x] T024 [US1] Add document move functionality between folders
- [x] T025 [US1] Validate depth limit (max 3 levels) in createFolder service

**Checkpoint**: User Story 1 complete - syndic can create/manage folder hierarchy

---

## Phase 4: User Story 2 - Gestion des droits d'accès par dossier (Priority: P1) 🎯 MVP

**Goal**: Le syndic peut définir le niveau d'accès de chaque dossier (syndic, conseil, tous) et les droits sont appliqués à l'affichage.

**Independent Test**: Le syndic crée un dossier "Contentieux" avec accès "Syndic seul", et vérifie qu'un membre du conseil syndical ne le voit pas.

### Tests E2E for User Story 2

- [ ] T026 [US2] Add E2E tests for access level management in tests/e2e/syndic/dossiers.spec.ts
- [ ] T027 [US2] Add E2E tests for access filtering in extranet in tests/e2e/extranet/documents.spec.ts

### Implementation for User Story 2

- [x] T028 [P] [US2] Create AccessLevelBadge component in src/components/documents/AccessLevelBadge.tsx
- [x] T029 [P] [US2] Create AccessLevelSelect component for folder creation/edit in src/components/documents/AccessLevelSelect.tsx
- [x] T030 [US2] Add niveauAcces field to CreateFolderModal
- [x] T031 [US2] Add niveauAcces editing capability to FolderCard
- [x] T032 [US2] Implement access filtering logic in useFolders hook based on user role
- [x] T033 [US2] Update extranet documents page to filter folders by user access level in src/app/(dashboard)/extranet/documents/page.tsx
- [x] T034 [US2] Implement inheritance of niveauAcces for new subfolders
- [x] T035 [US2] Implement inheritance of niveauAcces for uploaded documents

**Checkpoint**: User Stories 1 AND 2 complete - folder management with access control working

---

## Phase 5: User Story 3 - Constitution du conseil syndical (Priority: P2)

**Goal**: Le syndic peut désigner des copropriétaires comme membres du conseil syndical et définir un président.

**Independent Test**: Le syndic désigne 3 copropriétaires comme membres du conseil syndical, et vérifie qu'ils voient les dossiers réservés au conseil.

### Tests E2E for User Story 3

- [ ] T036 [US3] Create E2E test file for conseil syndical management in tests/e2e/syndic/conseil-syndical.spec.ts

### Implementation for User Story 3

- [x] T037 [P] [US3] Create MembreConseilCard component in src/components/conseil-syndical/MembreConseilCard.tsx
- [x] T038 [P] [US3] Create AddMembreConseilModal component in src/components/conseil-syndical/AddMembreConseilModal.tsx
- [x] T039 [P] [US3] Create ConseilSyndicalList component in src/components/conseil-syndical/ConseilSyndicalList.tsx
- [x] T040 [US3] Create conseil syndical settings page in src/app/(dashboard)/parametres/conseil-syndical/page.tsx
- [x] T041 [US3] Add member addition functionality with copropriétaire selector
- [x] T042 [US3] Add president designation toggle
- [x] T043 [US3] Add member removal functionality
- [ ] T044 [US3] Update user custom claims when conseil membership changes (if using Firebase Auth claims)

**Checkpoint**: User Story 3 complete - conseil syndical can be managed

---

## Phase 6: User Story 4 - Navigation dans l'arborescence (Priority: P2)

**Goal**: L'utilisateur peut naviguer dans l'arborescence avec un fil d'Ariane et une navigation fluide.

**Independent Test**: L'utilisateur peut naviguer jusqu'à un sous-dossier profond, voir le fil d'Ariane, et revenir à la racine en un clic.

### Tests E2E for User Story 4

- [ ] T045 [US4] Add E2E tests for breadcrumb navigation in tests/e2e/syndic/dossiers.spec.ts
- [ ] T046 [US4] Add E2E tests for extranet folder navigation in tests/e2e/extranet/documents.spec.ts

### Implementation for User Story 4

- [x] T047 [P] [US4] Create Breadcrumb component in src/components/documents/Breadcrumb.tsx
- [x] T048 [US4] Integrate Breadcrumb into syndic documents page
- [x] T049 [US4] Integrate Breadcrumb into extranet documents page
- [x] T050 [US4] Add folder click navigation to enter subfolder
- [x] T051 [US4] Add parent folder navigation (back button)
- [ ] T052 [US4] Update document search results to display full folder path

**Checkpoint**: User Story 4 complete - smooth folder navigation with breadcrumb

---

## Phase 7: User Story 5 - Upload de documents dans un dossier (Priority: P2)

**Goal**: Le syndic peut uploader des documents directement dans un dossier, héritant des droits d'accès.

**Independent Test**: Le syndic ouvre un dossier, clique sur "Ajouter un document", et le document apparaît directement dans ce dossier.

### Tests E2E for User Story 5

- [ ] T053 [US5] Add E2E tests for upload in folder context in tests/e2e/syndic/dossiers.spec.ts

### Implementation for User Story 5

- [x] T054 [US5] Update document upload form to include current folder context in src/components/documents/DocumentUploadForm.tsx
- [x] T055 [US5] Pass dossierId to document creation when uploading within a folder
- [x] T056 [US5] Display current folder location in upload modal
- [x] T057 [US5] Update useDocuments hook to filter documents by current folder in src/hooks/useDocuments.ts

**Checkpoint**: User Story 5 complete - document upload respects folder context

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T058 [P] Add loading states and skeleton loaders to folder components
- [x] T059 [P] Add error handling and user-friendly error messages
- [x] T060 [P] Add empty states for folders with no content
- [x] T061 Ensure mobile responsiveness for folder navigation
- [ ] T062 Run quickstart.md validation and update if needed
- [ ] T063 Verify all E2E tests pass in tests/e2e/syndic/dossiers.spec.ts
- [ ] T064 Verify all E2E tests pass in tests/e2e/syndic/conseil-syndical.spec.ts
- [x] T065 Verify extranet access filtering works correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Builds on US1 components
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent from US1/US2
- **User Story 4 (P2)**: Can start after US1 components exist - Uses folder structure
- **User Story 5 (P2)**: Can start after US1 and US2 - Requires folder and access level support

### Recommended Execution Order

1. Phase 1: Setup (T001-T005) - All parallel
2. Phase 2: Foundational (T006-T013) - Mostly parallel after T006-T007
3. Phase 3: US1 - Folders (T014-T025)
4. Phase 4: US2 - Access (T026-T035)
5. Phase 5: US3 - Conseil (T036-T044) - Can run parallel to US4/US5
6. Phase 6: US4 - Navigation (T045-T052)
7. Phase 7: US5 - Upload (T053-T057)
8. Phase 8: Polish (T058-T065)

### Parallel Opportunities

**Phase 1** (all parallel):
```
T001, T002, T003, T004, T005
```

**Phase 2** (T006-T007 first, then parallel):
```
T006 → T008, T010, T012
T007 → T009
T011, T013 (parallel)
```

**Phase 3 - US1** (components parallel, then integration):
```
T015, T016, T017, T018, T019 (parallel)
→ T020, T021, T022, T023, T024, T025 (sequential integration)
```

**Phase 4 - US2** (components parallel, then integration):
```
T028, T029 (parallel)
→ T030, T031, T032, T033, T034, T035 (sequential)
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 - Folder creation/management
4. Complete Phase 4: US2 - Access control
5. **STOP and VALIDATE**: Test folder management with access levels
6. Deploy/demo if ready (functional GED with permissions)

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Folders) → Test → Deploy (basic folder structure)
3. Add US2 (Access) → Test → Deploy (permissions working)
4. Add US3 (Conseil) → Test → Deploy (conseil management)
5. Add US4 (Navigation) → Test → Deploy (improved UX)
6. Add US5 (Upload) → Test → Deploy (complete feature)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Max folder depth: 3 levels (enforced in T025)
- Access levels: "syndic" | "conseil" | "tous"
