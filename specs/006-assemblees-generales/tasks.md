# Tasks: Gestion des Assemblées Générales

**Feature Branch**: `006-assemblees-generales`
**Generated**: 2025-01-12
**Total Tasks**: 52

## User Stories Mapping

| Story | Priority | Description | Tasks |
|-------|----------|-------------|-------|
| US1 | P1 | Créer une assemblée générale | 8 |
| US2 | P1 | Construire l'ordre du jour | 7 |
| US3 | P1 | Gérer la feuille de présence | 7 |
| US4 | P1 | Voter sur les résolutions | 8 |
| US5 | P2 | Générer la convocation | 5 |
| US6 | P2 | Générer le procès-verbal | 5 |
| US7 | P3 | Consulter l'historique des AG | 4 |

---

## Phase 1: Setup

Project initialization and shared infrastructure.

- [x] T001 Create Zod schemas for AG entities in `src/lib/schemas/assemblee-generale.ts`
- [x] T002 Create type exports in `src/types/assemblee-generale.ts`
- [x] T003 [P] Add mock store for AG entities in `src/lib/test/mock-data.ts`
- [x] T004 [P] Add CleRepartition seed data in `src/lib/test/mock-data.ts`

---

## Phase 2: Foundational (Data Layer)

Blocking prerequisites - Firebase services and hooks required by all user stories.

- [x] T005 Implement AG Firebase service (CRUD) in `src/lib/firebase/services/assemblee-generale.ts`
- [x] T006 [P] Implement Resolution Firebase service in `src/lib/firebase/services/resolution.ts`
- [x] T007 [P] Implement Presence Firebase service in `src/lib/firebase/services/presence.ts`
- [x] T008 [P] Implement Vote Firebase service in `src/lib/firebase/services/vote.ts`
- [x] T009 Create useAssembleesGenerales hook in `src/hooks/useAssembleesGenerales.ts`
- [x] T010 [P] Create useAssembleeGenerale hook in `src/hooks/useAssembleeGenerale.ts`
- [x] T011 [P] Create useResolutions hook in `src/hooks/useResolutions.ts`
- [x] T012 [P] Create usePresences hook in `src/hooks/usePresences.ts`
- [x] T013 [P] Create useVotes hook in `src/hooks/useVotes.ts`
- [x] T014 [P] Create useClesRepartition hook in `src/hooks/useClesRepartition.ts`
- [ ] T015 Write unit tests for AG schemas in `tests/unit/schemas/assemblee-generale.test.ts`

---

## Phase 3: User Story 1 - Créer une AG

**Goal**: Syndic can create a new AG with date, time, location, and type.

**Independent Test**: Create an AG and verify it appears in the list.

**Acceptance Criteria**:
- AG creation form with date, heure, lieu, type fields
- 21-day warning when date is too close
- AG list sorted by date with status badges

### Tasks

- [ ] T016 [US1] Create AGStatusBadge component in `src/components/assemblees-generales/AGStatusBadge.tsx`
- [ ] T017 [US1] Create AGForm component with date/heure/lieu/type fields in `src/components/assemblees-generales/AGForm.tsx`
- [ ] T018 [US1] Implement 21-day warning logic in AGForm
- [ ] T019 [US1] Create AGList component with status badges in `src/components/assemblees-generales/AGList.tsx`
- [ ] T020 [US1] Create AG list page in `src/app/(dashboard)/assemblees-generales/page.tsx`
- [ ] T021 [US1] Create AG creation page in `src/app/(dashboard)/assemblees-generales/nouvelle/page.tsx`
- [ ] T022 [US1] Add "Assemblées générales" link to dashboard navigation
- [ ] T023 [US1] Write component tests for AGForm and AGList in `tests/unit/components/ag-form.test.tsx`

---

## Phase 4: User Story 2 - Construire l'ordre du jour

**Goal**: Syndic can add, edit, delete, and reorder resolutions for an AG.

**Independent Test**: Add multiple resolutions and verify they are listed in order.

**Acceptance Criteria**:
- Add resolution with titre, description, type majorité
- Auto-numbering of resolutions
- Drag-and-drop reordering
- Majority type selector (Art. 24, 25, 26, Unanimité)

### Tasks

- [ ] T024 [US2] Create ResolutionForm component in `src/components/assemblees-generales/ResolutionForm.tsx`
- [ ] T025 [US2] Create MajorityTypeSelector component in `src/components/assemblees-generales/MajorityTypeSelector.tsx`
- [ ] T026 [US2] Create ResolutionList component with drag-and-drop in `src/components/assemblees-generales/ResolutionList.tsx`
- [ ] T027 [US2] Implement auto-numbering logic in ResolutionList
- [ ] T028 [US2] Create AG detail page in `src/app/(dashboard)/assemblees-generales/[agId]/page.tsx`
- [ ] T029 [US2] Create ordre-du-jour page in `src/app/(dashboard)/assemblees-generales/[agId]/ordre-du-jour/page.tsx`
- [ ] T030 [US2] Write component tests for ResolutionForm and ResolutionList in `tests/unit/components/resolution.test.tsx`

---

## Phase 5: User Story 3 - Gérer la feuille de présence

**Goal**: Syndic can mark co-owners as present, represented, or absent.

**Independent Test**: Mark co-owners as present and verify tantièmes total is calculated.

**Acceptance Criteria**:
- List all co-owners with their tantièmes
- Toggle présent/représenté/absent
- Select representative (max 3 persons limit)
- Display tantièmes summary

### Tasks

- [ ] T031 [US3] Create PresenceStatusToggle component in `src/components/assemblees-generales/PresenceStatusToggle.tsx`
- [ ] T032 [US3] Create RepresentativeSelector component with 3-person limit in `src/components/assemblees-generales/RepresentativeSelector.tsx`
- [ ] T033 [US3] Create PresenceSummary component in `src/components/assemblees-generales/PresenceSummary.tsx`
- [ ] T034 [US3] Create PresenceSheet component in `src/components/assemblees-generales/PresenceSheet.tsx`
- [ ] T035 [US3] Create presence page in `src/app/(dashboard)/assemblees-generales/[agId]/presence/page.tsx`
- [ ] T036 [US3] Implement "Démarrer l'AG" button with status transition to en_cours
- [ ] T037 [US3] Write component tests for PresenceSheet in `tests/unit/components/presence.test.tsx`

---

## Phase 6: User Story 4 - Voter sur les résolutions

**Goal**: Syndic can record votes and see if resolutions are adopted or rejected.

**Independent Test**: Vote on a resolution and verify the result is correctly calculated.

**Acceptance Criteria**:
- Vote screen per resolution with navigation
- Record pour/contre/abstention for each présent/représenté
- Calculate majority (Art. 24, 25, 26, Unanimité)
- Display adopté/rejeté result
- Indicate if Art.25→24 second vote possible

### Tasks

- [ ] T038 [US4] Create VoteChoiceSelector component in `src/components/assemblees-generales/VoteChoiceSelector.tsx`
- [ ] T039 [US4] Create MajorityCalculator utility in `src/lib/utils/majority-calculator.ts`
- [ ] T040 [US4] Write unit tests for MajorityCalculator with all majority types in `tests/unit/utils/majority-calculator.test.ts`
- [ ] T041 [US4] Create VoteResultDisplay component in `src/components/assemblees-generales/VoteResultDisplay.tsx`
- [ ] T042 [US4] Create VoteScreen component in `src/components/assemblees-generales/VoteScreen.tsx`
- [ ] T043 [US4] Create votes list page in `src/app/(dashboard)/assemblees-generales/[agId]/votes/page.tsx`
- [ ] T044 [US4] Create vote per resolution page in `src/app/(dashboard)/assemblees-generales/[agId]/votes/[resolutionId]/page.tsx`
- [ ] T045 [US4] Write component tests for VoteScreen in `tests/unit/components/vote.test.tsx`

---

## Phase 7: User Story 5 - Générer la convocation

**Goal**: Syndic can generate a convocation document ready to send.

**Independent Test**: Generate a convocation and verify it contains all required legal information.

**Acceptance Criteria**:
- Document with date/heure/lieu, ordre du jour, formulaire de pouvoir
- CSS print styles for browser print
- Status transition to "Convoquée"

### Tasks

- [ ] T046 [US5] Create ConvocationDocument component in `src/components/assemblees-generales/ConvocationDocument.tsx`
- [ ] T047 [US5] Create PouvoirForm component (proxy form) in `src/components/assemblees-generales/PouvoirForm.tsx`
- [ ] T048 [US5] Add CSS print styles in `src/app/globals.css` or component-specific
- [ ] T049 [US5] Create convocation page in `src/app/(dashboard)/assemblees-generales/[agId]/convocation/page.tsx`
- [ ] T050 [US5] Write E2E test for convocation generation in `tests/e2e/ag-convocation.spec.ts`

---

## Phase 8: User Story 6 - Générer le procès-verbal

**Goal**: Syndic can generate the PV with attendance and vote results.

**Independent Test**: Generate a PV and verify it contains attendance sheet and vote results.

**Acceptance Criteria**:
- Document with feuille de présence, vote results (pour/contre/abstention)
- List of opposants and défaillants
- Status transition to "Terminée"

### Tasks

- [ ] T051 [US6] Create PVDocument component in `src/components/assemblees-generales/PVDocument.tsx`
- [ ] T052 [US6] Create OpposantsDefaillantsList component in `src/components/assemblees-generales/OpposantsDefaillantsList.tsx`
- [ ] T053 [US6] Create proces-verbal page in `src/app/(dashboard)/assemblees-generales/[agId]/proces-verbal/page.tsx`
- [ ] T054 [US6] Implement status transition to "Terminée" on PV validation
- [ ] T055 [US6] Write E2E test for PV generation in `tests/e2e/ag-proces-verbal.spec.ts`

---

## Phase 9: User Story 7 - Consulter l'historique

**Goal**: Syndic can view past AGs and their decisions.

**Independent Test**: View a past AG and see its resolutions and results.

**Acceptance Criteria**:
- List of terminated AGs
- Read-only detail view with ordre du jour, présence, vote results

### Tasks

- [ ] T056 [US7] Create AGHistoryList component in `src/components/assemblees-generales/AGHistoryList.tsx`
- [ ] T057 [US7] Create AGHistoryDetail component (read-only) in `src/components/assemblees-generales/AGHistoryDetail.tsx`
- [ ] T058 [US7] Add history tab/section to AG list page
- [ ] T059 [US7] Write E2E test for history viewing in `tests/e2e/ag-history.spec.ts`

---

## Phase 10: Polish & Cross-Cutting

Final touches and integration.

- [ ] T060 Add loading states to all AG pages
- [ ] T061 Add error handling and toast notifications
- [ ] T062 Write full E2E test for complete AG workflow in `tests/e2e/assemblees-generales.spec.ts`

---

## Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational - Data Layer)
    │
    ├──────────────────────────────────────────────────┐
    ▼                    ▼                    ▼        │
Phase 3 (US1)    Phase 4 (US2)    Phase 5 (US3)       │
    │                    │                    │        │
    └────────────────────┴────────────────────┘        │
                         │                             │
                         ▼                             │
                   Phase 6 (US4) ◄─────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         ▼                               ▼
   Phase 7 (US5)                   Phase 8 (US6)
         │                               │
         └───────────────┬───────────────┘
                         ▼
                   Phase 9 (US7)
                         │
                         ▼
                   Phase 10 (Polish)
```

**Notes**:
- US1, US2, US3 can be implemented in parallel after Foundational phase
- US4 (Votes) depends on US2 (Résolutions) and US3 (Présences)
- US5 (Convocation) depends on US2 (ordre du jour complete)
- US6 (PV) depends on US4 (votes recorded)
- US7 (History) depends on US6 (AG terminée)

---

## Parallel Execution Opportunities

### Within Phase 2 (Foundational)
```bash
# These can run in parallel:
T006, T007, T008  # Firebase services
T010, T011, T012, T013, T014  # Hooks
```

### Within Phase 3-5 (US1, US2, US3)
After Foundational is complete, these three user stories can be implemented in parallel by different developers.

### Within Each User Story
Components can often be built in parallel:
- US4: T038 + T039 (VoteChoiceSelector + MajorityCalculator)
- US5: T046 + T047 (ConvocationDocument + PouvoirForm)

---

## MVP Scope

**Recommended MVP**: Phase 1 + Phase 2 + Phase 3 (US1 only)

This delivers:
- Ability to create and list AGs
- Status management
- 21-day warning

Estimated scope: **23 tasks** (T001-T023)

---

## Implementation Strategy

1. **Start with Foundational**: Complete Phase 1-2 first (data layer must be solid)
2. **Parallel US1-US3**: Implement US1, US2, US3 in parallel if possible
3. **Sequential US4**: Votes require résolutions and présences
4. **Documents last**: Convocation and PV are lower priority
5. **History last**: Only needed after AGs are completed

---

## Validation

- [x] All tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
- [x] All user story tasks have [US?] labels
- [x] Setup and Foundational phases have no story labels
- [x] Parallel opportunities marked with [P]
- [x] File paths specified for all tasks
- [x] Dependencies documented
