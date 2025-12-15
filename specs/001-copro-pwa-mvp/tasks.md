# Tasks: EzCopro MVP - Gestion de Copropriété

**Input**: Design documents from `/specs/001-copro-pwa-mvp/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/

**Tests**: BDD avec Playwright et Storybook (requis par la spec)

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1, US2, US3, US4, US5, US6 (maps to spec.md user stories)
- File paths relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization with Next.js, Firebase, Playwright, Storybook

- [x] T001 Create Next.js 14 project with App Router in project root
- [x] T002 Configure TypeScript strict mode in tsconfig.json
- [x] T003 [P] Install and configure Tailwind CSS in tailwind.config.ts
- [x] T004 [P] Install and configure shadcn/ui components in src/components/ui/
- [x] T005 [P] Configure ESLint and Prettier in .eslintrc.json and .prettierrc
- [x] T006 [P] Setup Playwright configuration in playwright.config.ts
- [x] T007 [P] Setup Storybook configuration in .storybook/
- [x] T008 [P] Setup Vitest configuration in vitest.config.ts
- [x] T009 Create PWA manifest in public/manifest.json
- [x] T010 Create base layout structure in src/app/layout.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Firebase setup, authentication framework, shared types and schemas

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T011 Create Firebase project configuration in src/lib/firebase/config.ts
- [x] T012 [P] Create Zod base schemas (primitives, timestamps) in src/lib/schemas/primitives.ts
- [x] T013 [P] Create User type and schema in src/types/user.ts and src/lib/schemas/user.ts
- [x] T014 [P] Create Copropriete type and schema in src/types/copropriete.ts and src/lib/schemas/copropriete.ts
- [x] T015 Create Firebase Auth service with Google OAuth in src/lib/firebase/auth.ts
- [x] T016 Create AuthContext provider in src/lib/hooks/useAuth.tsx
- [x] T017 Create protected route middleware in src/middleware.ts
- [x] T018 [P] Create base UI components (Button, Input, Card) stories in stories/ui/
- [x] T019 [P] Create loading and error state components in src/components/ui/
- [x] T020 Create Firestore Security Rules in firestore.rules
- [x] T021 Create utility functions (formatEuros, formatDate) in src/lib/utils/format.ts

**Checkpoint**: Foundation ready - Firebase connected, auth working, base types defined

---

## Phase 3: User Story 1 - Connexion et Accès (Priority: P1) 🎯 MVP

**Goal**: Authentification Google et accès au tableau de bord

**Independent Test**: Se connecter avec Google, voir le tableau de bord ou l'écran de création/rejoindre copropriété

### Tests for User Story 1 (BDD - Playwright)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T022 [P] [US1] E2E test: non-connected user sees login screen in tests/e2e/auth.spec.ts
- [x] T023 [P] [US1] E2E test: Google login redirects to dashboard in tests/e2e/auth.spec.ts
- [x] T024 [P] [US1] E2E test: user without copro sees create/join screen in tests/e2e/auth.spec.ts
- [x] T025 [P] [US1] E2E test: logout returns to login screen in tests/e2e/auth.spec.ts

### Implementation for User Story 1

- [x] T026 [US1] Create login page UI in src/app/(auth)/login/page.tsx
- [x] T027 [US1] Create login page story in stories/pages/LoginPage.stories.tsx
- [x] T028 [US1] Implement Google sign-in button component in src/components/auth/GoogleSignInButton.tsx
- [x] T029 [US1] Create onboarding page (create/join copro) in src/app/(dashboard)/onboarding/page.tsx
- [x] T030 [US1] Create copropriete form component in src/components/forms/CoproprietéForm.tsx
- [x] T031 [US1] Create CoproprietéService (create, get, join) in src/lib/firebase/services/copropriete.ts
- [x] T032 [US1] Create dashboard layout in src/app/(dashboard)/layout.tsx
- [x] T033 [US1] Create dashboard page with summary in src/app/(dashboard)/page.tsx
- [x] T034 [US1] Create dashboard page story in stories/pages/Dashboard.stories.tsx
- [x] T035 [US1] Implement navigation component (sidebar/bottom nav) in src/components/layouts/Navigation.tsx
- [x] T036 [US1] Add historique entry on copropriete creation in src/lib/firebase/services/historique.ts

**Checkpoint**: User Story 1 complete - Users can login, create/join copro, see dashboard

---

## Phase 4: User Story 2 - Gestion des Lots (Priority: P2)

**Goal**: CRUD complet des lots avec affichage des tantièmes

**Independent Test**: Créer, modifier, supprimer des lots et voir le total des tantièmes

### Tests for User Story 2 (BDD - Playwright)

- [x] T037 [P] [US2] E2E test: list lots with details in tests/e2e/lots.spec.ts
- [x] T038 [P] [US2] E2E test: create new lot in tests/e2e/lots.spec.ts
- [x] T039 [P] [US2] E2E test: edit existing lot in tests/e2e/lots.spec.ts
- [x] T040 [P] [US2] E2E test: delete lot with confirmation in tests/e2e/lots.spec.ts

### Implementation for User Story 2

- [x] T041 [P] [US2] Create Lot type and schema in src/types/lot.ts and src/lib/schemas/lot.ts
- [x] T042 [US2] Create LotService (CRUD operations) in src/lib/firebase/services/lot.ts
- [x] T043 [US2] Create lots list page in src/app/(dashboard)/lots/page.tsx
- [x] T044 [US2] Create LotCard component in src/components/lots/LotCard.tsx
- [x] T045 [US2] Create LotCard story in stories/lots/LotCard.stories.tsx
- [x] T046 [US2] Create lot form component in src/components/forms/LotForm.tsx
- [x] T047 [US2] Create lot form story in stories/forms/LotForm.stories.tsx
- [x] T048 [US2] Create lot creation modal/page in src/app/(dashboard)/lots/new/page.tsx
- [x] T049 [US2] Create lot edit page in src/app/(dashboard)/lots/[id]/edit/page.tsx
- [x] T050 [US2] Create delete confirmation dialog in src/components/ui/ConfirmDialog.tsx
- [x] T051 [US2] Implement tantiemes total calculation in src/lib/hooks/useTantiemesTotal.ts
- [ ] T051b [US2] Add pagination hook for lots list in src/lib/hooks/useLotsPagination.ts
- [x] T051c [US2] Add tantiemes validation warning in LotForm component
- [x] T052 [US2] Add historique entries for lot CRUD in src/lib/firebase/services/lot.ts

**Checkpoint**: User Story 2 complete - Full lot management working

---

## Phase 5: User Story 3 - Gestion des Copropriétaires (Priority: P2)

**Goal**: CRUD copropriétaires avec invitations et lien vers lots

**Independent Test**: Créer copropriétaire, générer invitation, voir ses lots

### Tests for User Story 3 (BDD - Playwright)

- [x] T053 [P] [US3] E2E test: list coproprietaires with lots in tests/e2e/coproprietaires.spec.ts
- [x] T054 [P] [US3] E2E test: create coproprietaire in tests/e2e/coproprietaires.spec.ts
- [x] T055 [P] [US3] E2E test: edit coproprietaire in tests/e2e/coproprietaires.spec.ts
- [x] T056 [P] [US3] E2E test: generate invitation code in tests/e2e/coproprietaires.spec.ts
- [x] T056b [P] [US3] E2E test: anonymize coproprietaire (RGPD) in tests/e2e/coproprietaires.spec.ts

### Implementation for User Story 3

- [x] T057 [P] [US3] Create Coproprietaire type and schema in src/types/coproprietaire.ts and src/lib/schemas/coproprietaire.ts
- [x] T058 [P] [US3] Create Invitation type and schema in src/types/invitation.ts and src/lib/schemas/invitation.ts
- [x] T059 [US3] Create CoproprietaireService (CRUD + anonymize) in src/lib/firebase/services/coproprietaire.ts
- [x] T060 [US3] Create InvitationService (create, validate, use) in src/lib/firebase/services/invitation.ts
- [x] T061 [US3] Create coproprietaires list page in src/app/(dashboard)/coproprietaires/page.tsx
- [ ] T061b [US3] Add pagination hook for coproprietaires list in src/lib/hooks/useCoproprietairesPagination.ts
- [x] T062 [US3] Create CoproprietaireCard component in src/components/coproprietaires/CoproprietaireCard.tsx
- [ ] T063 [US3] Create CoproprietaireCard story in stories/coproprietaires/CoproprietaireCard.stories.tsx
- [x] T064 [US3] Create coproprietaire form component in src/components/forms/CoproprietaireForm.tsx
- [ ] T065 [US3] Create coproprietaire detail page in src/app/(dashboard)/coproprietaires/[id]/page.tsx
- [x] T066 [US3] Create invitation modal component in src/components/coproprietaires/InvitationModal.tsx
- [ ] T067 [US3] Create join copro by code page in src/app/(dashboard)/join/[code]/page.tsx
- [x] T068 [US3] Add historique entries for coproprietaire CRUD in src/lib/firebase/services/coproprietaire.ts

**Checkpoint**: User Story 3 complete - Full coproprietaire management with invitations

---

## Phase 6: User Story 4 - Gestion des Finances (Priority: P3)

**Goal**: Appels de fonds avec répartition automatique et paiements

**Independent Test**: Créer appel de fonds, voir répartition par tantièmes, enregistrer paiement

### Tests for User Story 4 (BDD - Playwright)

- [ ] T069 [P] [US4] E2E test: create appel de fonds with auto-repartition in tests/e2e/finances.spec.ts
- [ ] T070 [P] [US4] E2E test: view appel detail with repartitions in tests/e2e/finances.spec.ts
- [ ] T071 [P] [US4] E2E test: record payment in tests/e2e/finances.spec.ts
- [ ] T072 [P] [US4] E2E test: view payment history in tests/e2e/finances.spec.ts

### Implementation for User Story 4

- [ ] T073 [P] [US4] Create AppelDeFonds type and schema in src/types/appel.ts and src/lib/schemas/appel.ts
- [ ] T074 [P] [US4] Create Repartition type and schema in src/types/repartition.ts and src/lib/schemas/repartition.ts
- [ ] T075 [P] [US4] Create Paiement type and schema in src/types/paiement.ts and src/lib/schemas/paiement.ts
- [ ] T076 [US4] Create AppelService with transaction for repartitions in src/lib/firebase/services/appel.ts
- [ ] T077 [US4] Create PaiementService (CRUD) in src/lib/firebase/services/paiement.ts
- [ ] T078 [US4] Create finances overview page in src/app/(dashboard)/finances/page.tsx
- [ ] T079 [US4] Create AppelCard component in src/components/finances/AppelCard.tsx
- [ ] T080 [US4] Create appel form component in src/components/forms/AppelForm.tsx
- [ ] T081 [US4] Create appel form story in stories/forms/AppelForm.stories.tsx
- [ ] T082 [US4] Create appel detail page with repartitions in src/app/(dashboard)/finances/appels/[id]/page.tsx
- [ ] T083 [US4] Create RepartitionTable component in src/components/finances/RepartitionTable.tsx
- [ ] T084 [US4] Create paiement form component in src/components/forms/PaiementForm.tsx
- [ ] T085 [US4] Create paiement modal in src/components/finances/PaiementModal.tsx
- [ ] T086 [US4] Add historique entries for appel and paiement in services

**Checkpoint**: User Story 4 complete - Financial operations working with auto-repartition

---

## Phase 7: User Story 5 - Consultation des Soldes (Priority: P3)

**Goal**: Vue synthétique des soldes créditeurs/débiteurs par copropriétaire

**Independent Test**: Voir liste des soldes avec couleurs, cliquer pour voir détail

### Tests for User Story 5 (BDD - Playwright)

- [ ] T087 [P] [US5] E2E test: view soldes list with colors in tests/e2e/soldes.spec.ts
- [ ] T088 [P] [US5] E2E test: click coproprietaire to see detail in tests/e2e/soldes.spec.ts

### Implementation for User Story 5

- [ ] T089 [US5] Create useSolde hook for calculation in src/lib/hooks/useSolde.ts
- [ ] T090 [US5] Create soldes list page in src/app/(dashboard)/soldes/page.tsx
- [ ] T091 [US5] Create SoldeCard component (green/red) in src/components/soldes/SoldeCard.tsx
- [ ] T092 [US5] Create SoldeCard story in stories/soldes/SoldeCard.stories.tsx
- [ ] T093 [US5] Create solde detail page with history in src/app/(dashboard)/soldes/[coproprietaireId]/page.tsx
- [ ] T094 [US5] Create OperationsList component in src/components/soldes/OperationsList.tsx

**Checkpoint**: User Story 5 complete - Soldes visible with color coding and details

---

## Phase 8: User Story 6 - Historique des Actions (Priority: P4)

**Goal**: Consultation et filtrage de l'historique des actions

**Independent Test**: Voir historique chronologique, filtrer par type d'action

### Tests for User Story 6 (BDD - Playwright)

- [ ] T095 [P] [US6] E2E test: view historique chronological list in tests/e2e/historique.spec.ts
- [ ] T096 [P] [US6] E2E test: filter historique by entity type in tests/e2e/historique.spec.ts

### Implementation for User Story 6

- [ ] T097 [P] [US6] Create HistoriqueEntry type and schema in src/types/historique.ts and src/lib/schemas/historique.ts
- [ ] T098 [US6] Create HistoriqueService (list, filter) in src/lib/firebase/services/historique.ts
- [ ] T099 [US6] Create historique page in src/app/(dashboard)/historique/page.tsx
- [ ] T100 [US6] Create HistoriqueEntryCard component in src/components/historique/HistoriqueEntryCard.tsx
- [ ] T101 [US6] Create HistoriqueEntryCard story in stories/historique/HistoriqueEntryCard.stories.tsx
- [ ] T102 [US6] Create filter controls component in src/components/historique/HistoriqueFilters.tsx
- [ ] T103 [US6] Implement pagination for historique in src/lib/hooks/useHistoriquePagination.ts

**Checkpoint**: User Story 6 complete - Full audit trail visible and filterable

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: PWA finalization, performance, accessibility

- [ ] T104 [P] Configure next-pwa for service worker in next.config.js
- [ ] T105 [P] Create offline fallback page in src/app/offline/page.tsx
- [ ] T106 Implement responsive navigation (sidebar desktop, bottom mobile) in src/components/layouts/Navigation.tsx
- [ ] T107 [P] Add loading skeletons to all list pages in src/components/ui/Skeleton.tsx
- [ ] T108 [P] Add error boundaries to main sections in src/components/ErrorBoundary.tsx
- [ ] T109 [P] Run Lighthouse audit and fix accessibility issues
- [ ] T110 [P] Add meta tags and OpenGraph in src/app/layout.tsx
- [ ] T111 Validate all acceptance scenarios with Playwright suite
- [ ] T112 Run quickstart.md validation manually

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ────────────────────────────────────────────┐
                                                            │
Phase 2 (Foundational) ─────────────────────────────────────┤
                                                            │
     ┌──────────────────────────────────────────────────────┘
     │
     ├── Phase 3 (US1: Auth + Dashboard) ──── MVP CHECKPOINT
     │
     ├── Phase 4 (US2: Lots) ──┬── Can run in parallel
     │                         │   after Phase 3
     ├── Phase 5 (US3: Copro) ─┘
     │
     ├── Phase 6 (US4: Finances) ── Depends on US2 + US3
     │
     ├── Phase 7 (US5: Soldes) ──── Depends on US4
     │
     ├── Phase 8 (US6: Historique) ── Can run after Phase 2
     │
     └── Phase 9 (Polish) ────────── After all user stories
```

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US1 (Auth) | Phase 2 | - |
| US2 (Lots) | US1 | US3 |
| US3 (Copro) | US1 | US2 |
| US4 (Finances) | US2, US3 | US6 |
| US5 (Soldes) | US4 | - |
| US6 (Historique) | Phase 2 | US2, US3, US4, US5 |

### Within Each User Story

1. Tests FIRST (Playwright) → must FAIL
2. Types & Schemas → can parallel
3. Services → depends on schemas
4. UI Components + Stories → can parallel
5. Pages → depends on components + services
6. Tests PASS

---

## Parallel Opportunities

### Phase 2 Parallel (6 tasks)

```bash
# Can run together:
T012: Zod primitives
T013: User schema
T014: Copropriete schema
T018: UI component stories
T019: Loading/error components
```

### User Story 2 + 3 Parallel

After US1 complete, US2 and US3 can be developed in parallel by different developers.

### Tests Within Each Story

All E2E tests marked [P] within a story can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (~8 tasks)
2. Complete Phase 2: Foundational (~11 tasks)
3. Complete Phase 3: User Story 1 (~15 tasks)
4. **STOP and VALIDATE**: Deploy preview, test with real Google account
5. Total: ~34 tasks for deployable MVP

### Incremental Delivery

| Increment | Stories | Cumulative Tasks | Value Delivered |
|-----------|---------|------------------|-----------------|
| MVP | US1 | 34 | Login + Create copro |
| v0.2 | +US2, US3 | 66 | Lots + Copropriétaires |
| v0.3 | +US4, US5 | 92 | Finances + Soldes |
| v0.4 | +US6 | 103 | Historique complet |
| v1.0 | +Polish | 112 | Production ready |

---

## Notes

- Tous les tests Playwright suivent le format Given/When/Then de la spec
- Les stories Storybook permettent le développement isolé des composants
- Les services Firebase incluent automatiquement les entrées d'historique
- Les montants sont stockés en centimes (entiers) et affichés en euros
- L'anonymisation RGPD est gérée dans CoproprietaireService.anonymize()
