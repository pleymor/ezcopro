# Tasks: Dark Mode

**Input**: Design documents from `/specs/004-dark-mode/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: TDD is required per Constitution (Principle I). Tests are written FIRST and must FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project foundation and type definitions

- [x] T001 [P] Create theme type definitions in src/types/theme.ts
- [x] T002 [P] Add dark mode CSS variables to src/app/globals.css

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core theme infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Write unit tests for useTheme hook in tests/unit/useTheme.test.ts (must fail initially)
- [x] T004 Implement ThemeProvider and useTheme hook in src/lib/hooks/useTheme.tsx
- [x] T005 Add FOUC prevention script to src/app/layout.tsx
- [x] T006 Integrate ThemeProvider into src/app/providers.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Manual Theme Toggle (Priority: P1) 🎯 MVP

**Goal**: Users can manually switch between light and dark themes via a toggle button in the header

**Independent Test**: Click theme toggle → interface switches between light/dark → theme persists across pages and sessions

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T007 [P] [US1] Write component test for ThemeToggle in tests/integration/theme-toggle.test.tsx
- [x] T008 [P] [US1] Write E2E test for manual theme toggle in tests/e2e/dark-mode.spec.ts (scenarios 1-4)

### Implementation for User Story 1

- [x] T009 [US1] Create ThemeToggle component in src/components/ui/theme-toggle.tsx
- [x] T010 [US1] Add ThemeToggle to desktop sidebar in src/components/layouts/Navigation.tsx
- [x] T011 [US1] Add ThemeToggle to mobile header in src/components/layouts/Navigation.tsx
- [x] T012 [US1] Verify all UI components render correctly in dark mode (visual review of src/components/ui/*)

**Checkpoint**: User Story 1 complete - users can manually toggle between light and dark themes

---

## Phase 4: User Story 2 - System Preference Detection (Priority: P2)

**Goal**: New users automatically see the app in their preferred system theme

**Independent Test**: Clear localStorage → set system to dark mode → open app → app displays in dark mode

### Tests for User Story 2

- [x] T013 [P] [US2] Add E2E tests for system preference detection in tests/e2e/dark-mode.spec.ts (scenarios 5-7)

### Implementation for User Story 2

- [x] T014 [US2] Verify getSystemTheme() function detects OS preference in src/lib/hooks/useTheme.tsx
- [x] T015 [US2] Verify FOUC prevention script respects system preference in src/app/layout.tsx
- [x] T016 [US2] Test fallback behavior when prefers-color-scheme is not supported

**Checkpoint**: User Stories 1 AND 2 complete - manual toggle works AND system preference is detected for new users

---

## Phase 5: User Story 3 - Theme with System Option (Priority: P3)

**Goal**: Users can choose to follow system theme automatically, with real-time updates

**Independent Test**: Select "System" option → change OS theme → app updates automatically without page reload

### Tests for User Story 3

- [x] T017 [P] [US3] Add E2E tests for System option in tests/e2e/dark-mode.spec.ts (scenarios 8-9)

### Implementation for User Story 3

- [x] T018 [US3] Verify MediaQueryList change listener works in src/lib/hooks/useTheme.tsx
- [x] T019 [US3] Ensure "Système" option is clearly visible in ThemeToggle dropdown in src/components/ui/theme-toggle.tsx
- [x] T020 [US3] Verify real-time theme update when system preference changes

**Checkpoint**: All user stories complete - full dark mode functionality implemented

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality assurance and documentation

- [x] T021 [P] Verify WCAG AA contrast ratios (4.5:1) in both themes using browser dev tools
- [x] T022 [P] Test theme toggle response time is < 100ms (SC-001)
- [x] T023 [P] Create ThemeToggle story in Storybook (if Storybook configured)
- [x] T024 Run all tests: `npm test && npm run test:e2e`
- [x] T025 Run quickstart.md verification checklist manually

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (T003-T006) - MVP deliverable
- **User Story 2 (P2)**: Depends on Foundational - Enhances US1 but independently testable
- **User Story 3 (P3)**: Depends on Foundational - Enhances US1/US2 but independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

Within Phase 1:
- T001 and T002 can run in parallel (different files)

Within Phase 3 (US1):
- T007 and T008 can run in parallel (different test files)

Across User Stories (with team):
- Once Foundational is complete, US1/US2/US3 could theoretically run in parallel
- Recommended: Complete US1 first as MVP, then US2, then US3

---

## Parallel Example: Phase 1 Setup

```bash
# Launch both setup tasks together:
Task: "Create theme type definitions in src/types/theme.ts"
Task: "Add dark mode CSS variables to src/app/globals.css"
```

## Parallel Example: User Story 1 Tests

```bash
# Launch both test tasks together (before implementation):
Task: "Write component test for ThemeToggle in tests/integration/theme-toggle.test.tsx"
Task: "Write E2E test for manual theme toggle in tests/e2e/dark-mode.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T006) - TDD: tests first!
3. Complete Phase 3: User Story 1 (T007-T012) - TDD: tests first!
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready - Users can toggle dark/light mode

### Incremental Delivery

1. Setup + Foundational → Core infrastructure ready
2. Add User Story 1 → Manual toggle works → **MVP Ready!**
3. Add User Story 2 → System detection → Enhanced first-time UX
4. Add User Story 3 → Auto-follow system → Full feature complete
5. Each story adds value without breaking previous stories

---

## Notes

- All tasks follow TDD per Constitution Principle I
- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing (Red phase)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
