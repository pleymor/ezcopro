# Tasks: Extranet Copropriétaires

**Input**: Design documents from `/specs/009-extranet-coproprietaires/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Inclus (TDD selon constitution ezcopro - Test-First Development NON-NEGOTIABLE)

**Organization**: Tasks groupées par User Story pour permettre implémentation et tests indépendants.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Peut s'exécuter en parallèle (fichiers différents, pas de dépendances)
- **[Story]**: User Story concernée (US1, US2, US3, US4, US5, US6)
- Chemins exacts inclus dans les descriptions

---

## Phase 1: Setup (Infrastructure partagée)

**Purpose**: Création des schemas, types et structure de base

- [ ] T001 [P] Créer le schema Zod InvitationExtranet dans `src/lib/schemas/invitation-extranet.ts`
- [ ] T002 [P] Créer le schema Zod DocumentPartage dans `src/lib/schemas/document-partage.ts`
- [ ] T003 [P] Créer le schema Zod PreferencesNotification dans `src/lib/schemas/preferences-notification.ts`
- [ ] T004 [P] Créer les types exportés dans `src/types/invitation-extranet.ts`
- [ ] T005 [P] Créer les types exportés dans `src/types/document-partage.ts`
- [ ] T006 [P] Créer les types exportés dans `src/types/preferences-notification.ts`
- [ ] T007 Créer la structure de dossiers pour les pages extranet dans `src/app/(dashboard)/extranet/`
- [ ] T008 Créer la structure de dossiers pour les composants extranet dans `src/components/extranet/`

---

## Phase 2: Foundational (Prérequis bloquants)

**Purpose**: Infrastructure de base nécessaire AVANT toute User Story

**⚠️ CRITICAL**: Aucune User Story ne peut commencer avant cette phase

- [ ] T009 Ajouter les types CustomClaims (syndic/coproprietaire) dans `src/types/auth.ts`
- [ ] T010 Mettre à jour le hook useAuth pour exposer les claims dans `src/lib/hooks/useAuth.tsx`
- [ ] T011 Créer le middleware de routage par rôle dans `src/middleware.ts`
- [ ] T012 Ajouter les règles Firestore pour invitations dans `firestore.rules`
- [ ] T013 Ajouter les règles Firestore pour documents dans `firestore.rules`
- [ ] T014 Ajouter les règles Firestore pour données financières copropriétaires dans `firestore.rules`
- [ ] T015 Ajouter les règles Firebase Storage pour documents dans `storage.rules`
- [ ] T016 Créer le hook useUserRole pour obtenir le rôle courant dans `src/hooks/useUserRole.ts`
- [ ] T017 [P] Créer les données de test mock pour extranet dans `src/lib/test/mock-data-extranet.ts`

**Checkpoint**: Infrastructure prête - les User Stories peuvent commencer

---

## Phase 3: User Story 4 - Invitation et création de compte (Priority: P1) 🎯 MVP

**Goal**: Le syndic peut inviter un copropriétaire et celui-ci peut créer son compte

**Independent Test**: Le syndic envoie une invitation, le copropriétaire clique sur le lien et crée son compte

**Note**: Cette US est un PRÉREQUIS pour toutes les autres (accès extranet)

### Tests pour US4

- [ ] T018 [P] [US4] Test unitaire du service invitation dans `tests/unit/extranet/invitation-service.test.ts`
- [ ] T019 [P] [US4] Test E2E du flux d'invitation dans `tests/e2e/extranet/login-invitation.spec.ts`

### Implémentation US4

- [ ] T020 [US4] Créer le service invitation-extranet dans `src/lib/firebase/services/invitation-extranet.ts`
- [ ] T021 [US4] Créer le hook useInvitations pour la gestion des invitations dans `src/hooks/useInvitations.ts`
- [ ] T022 [P] [US4] Créer le composant InviteButton pour inviter depuis la fiche copropriétaire dans `src/components/extranet/InviteButton.tsx`
- [ ] T023 [P] [US4] Créer le composant InvitationAcceptForm dans `src/components/extranet/InvitationAcceptForm.tsx`
- [ ] T024 [US4] Créer la page d'acceptation d'invitation dans `src/app/(auth)/invitation/[token]/page.tsx`
- [ ] T025 [US4] Ajouter le bouton "Inviter sur l'extranet" dans CoproprietaireCard `src/components/coproprietaires/CoproprietaireCard.tsx`
- [ ] T026 [US4] Créer la Cloud Function pour définir les Custom Claims lors de l'acceptation
- [ ] T027 [US4] Ajouter la liste des copropriétaires invités dans la page copropriétaires (syndic)
- [ ] T028 [US4] Gérer l'expiration des invitations (7 jours) et le renvoi

**Checkpoint**: US4 complète - les copropriétaires peuvent créer leur compte

---

## Phase 4: User Story 1 - Consultation du solde et des appels (Priority: P1) 🎯 MVP

**Goal**: Le copropriétaire voit son solde actuel et ses appels de fonds

**Independent Test**: Un copropriétaire connecté voit son solde et peut consulter le détail d'un appel

### Tests pour US1

- [ ] T029 [P] [US1] Test E2E consultation du solde dans `tests/e2e/extranet/consultation-solde.spec.ts`

### Implémentation US1

- [ ] T030 [US1] Créer le hook useExtranetSolde basé sur solde.ts dans `src/hooks/useExtranetSolde.ts`
- [ ] T031 [P] [US1] Créer le composant SoldeCard pour afficher le solde dans `src/components/extranet/SoldeCard.tsx`
- [ ] T032 [P] [US1] Créer le composant AppelsList pour lister les appels dans `src/components/extranet/AppelsList.tsx`
- [ ] T033 [P] [US1] Créer le composant AppelDetail pour le détail d'un appel dans `src/components/extranet/AppelDetail.tsx`
- [ ] T034 [US1] Créer la page dashboard extranet dans `src/app/(dashboard)/extranet/page.tsx`
- [ ] T035 [US1] Créer la page détail solde dans `src/app/(dashboard)/extranet/solde/page.tsx`
- [ ] T036 [US1] Ajouter l'indication visuelle pour solde débiteur (rouge/alerte)

**Checkpoint**: US1 complète - consultation du solde fonctionnelle

---

## Phase 5: User Story 2 - Consultation de l'historique des paiements (Priority: P1)

**Goal**: Le copropriétaire voit l'historique de ses paiements et peut télécharger un justificatif

**Independent Test**: Un copropriétaire voit ses paiements, filtre par période, télécharge un PDF

### Tests pour US2

- [ ] T037 [P] [US2] Test E2E historique paiements dans `tests/e2e/extranet/historique-paiements.spec.ts`

### Implémentation US2

- [ ] T038 [US2] Créer le hook useExtranetPaiements dans `src/hooks/useExtranetPaiements.ts`
- [ ] T039 [P] [US2] Créer le composant PaiementsList dans `src/components/extranet/PaiementsList.tsx`
- [ ] T040 [P] [US2] Créer le composant PeriodFilter pour filtrer par dates dans `src/components/extranet/PeriodFilter.tsx`
- [ ] T041 [P] [US2] Créer le composant JustificatifPDF avec @react-pdf/renderer dans `src/components/extranet/JustificatifPDF.tsx`
- [ ] T042 [US2] Créer la page historique paiements dans `src/app/(dashboard)/extranet/paiements/page.tsx`
- [ ] T043 [US2] Ajouter le bouton "Télécharger justificatif" générant le PDF

**Checkpoint**: US2 complète - historique paiements avec export PDF fonctionnel

---

## Phase 6: User Story 5 - Partage de documents par le syndic (Priority: P2)

**Goal**: Le syndic peut uploader des documents et les partager sur l'extranet

**Independent Test**: Le syndic uploade un document, le classe, le rend visible sur l'extranet

**Note**: Cette US est un PRÉREQUIS pour US3 (accès documents côté copropriétaire)

### Tests pour US5

- [ ] T044 [P] [US5] Test unitaire du service document-partage dans `tests/unit/extranet/document-service.test.ts`
- [ ] T045 [P] [US5] Test E2E upload document dans `tests/e2e/extranet/upload-document.spec.ts`

### Implémentation US5

- [ ] T046 [US5] Créer le service document-partage dans `src/lib/firebase/services/document-partage.ts`
- [ ] T047 [US5] Créer le hook useDocuments pour la gestion des documents dans `src/hooks/useDocuments.ts`
- [ ] T048 [P] [US5] Créer le composant DocumentUploadForm dans `src/components/documents/DocumentUploadForm.tsx`
- [ ] T049 [P] [US5] Créer le composant DocumentCard (syndic) avec toggle visibilité dans `src/components/documents/DocumentCard.tsx`
- [ ] T050 [US5] Créer la page gestion documents (syndic) dans `src/app/(dashboard)/documents/page.tsx`
- [ ] T051 [US5] Implémenter la vérification du quota 500 Mo avant upload
- [ ] T052 [US5] Ajouter la gestion des catégories (AG, Contrats, Règlement, Travaux, Autres)

**Checkpoint**: US5 complète - le syndic peut gérer les documents partagés

---

## Phase 7: User Story 3 - Accès aux documents partagés (Priority: P2)

**Goal**: Le copropriétaire peut consulter et télécharger les documents partagés

**Independent Test**: Un copropriétaire voit les documents par catégorie, télécharge un document, voit "Nouveau"

**Dépendance**: Nécessite US5 complète (documents à consulter)

### Tests pour US3

- [ ] T053 [P] [US3] Test E2E consultation documents dans `tests/e2e/extranet/documents.spec.ts`

### Implémentation US3

- [ ] T054 [US3] Créer le hook useExtranetDocuments dans `src/hooks/useExtranetDocuments.ts`
- [ ] T055 [P] [US3] Créer le composant DocumentsList (extranet) dans `src/components/extranet/DocumentsList.tsx`
- [ ] T056 [P] [US3] Créer le composant CategoryFilter pour filtrer par catégorie dans `src/components/extranet/CategoryFilter.tsx`
- [ ] T057 [P] [US3] Créer le composant DocumentItem avec badge "Nouveau" dans `src/components/extranet/DocumentItem.tsx`
- [ ] T058 [US3] Créer la page documents extranet dans `src/app/(dashboard)/extranet/documents/page.tsx`
- [ ] T059 [US3] Implémenter le marquage "consulté" lors du téléchargement
- [ ] T060 [US3] Ajouter la prévisualisation pour fichiers < 5 Mo, téléchargement direct sinon

**Checkpoint**: US3 complète - les copropriétaires peuvent accéder aux documents

---

## Phase 8: User Story 6 - Notifications de nouveaux documents (Priority: P3)

**Goal**: Les copropriétaires sont notifiés par email quand un document est partagé

**Independent Test**: Le syndic partage un document, les copropriétaires reçoivent un email (si activé)

### Tests pour US6

- [ ] T061 [P] [US6] Test unitaire des préférences notification dans `tests/unit/extranet/preferences-service.test.ts`

### Implémentation US6

- [ ] T062 [US6] Créer le service preferences-notification dans `src/lib/firebase/services/preferences-notification.ts`
- [ ] T063 [US6] Créer le hook usePreferencesNotification dans `src/hooks/usePreferencesNotification.ts`
- [ ] T064 [P] [US6] Créer le composant PreferencesForm dans `src/components/extranet/PreferencesForm.tsx`
- [ ] T065 [US6] Créer la page préférences extranet dans `src/app/(dashboard)/extranet/preferences/page.tsx`
- [ ] T066 [US6] Configurer l'extension Firebase Trigger Email
- [ ] T067 [US6] Créer le template email "nouveau-document" dans Firestore
- [ ] T068 [US6] Déclencher l'envoi email lors du partage d'un document (via Cloud Function ou Firestore trigger)

**Checkpoint**: US6 complète - notifications email fonctionnelles

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Améliorations transverses et finalisation

- [ ] T069 Ajouter la navigation extranet dans le layout dashboard
- [ ] T070 Créer un composant ExtranetLayout avec sidebar adaptée
- [ ] T071 [P] Ajouter des tests E2E de non-régression pour le flux complet
- [ ] T072 Vérifier l'accessibilité (labels, contraste, navigation clavier)
- [ ] T073 Optimiser les performances (lazy loading, cache queries)
- [ ] T074 [P] Mettre à jour la documentation utilisateur
- [ ] T075 Vérifier les règles Firestore en production
- [ ] T076 Déployer les Cloud Functions
- [ ] T077 Valider le quickstart.md avec une installation fraîche

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Pas de dépendances - peut commencer immédiatement
- **Foundational (Phase 2)**: Dépend de Setup - BLOQUE toutes les User Stories
- **US4 - Invitations (Phase 3)**: Dépend de Foundational - PRÉREQUIS pour autres US
- **US1 - Solde (Phase 4)**: Dépend de Foundational + US4 (compte créé)
- **US2 - Paiements (Phase 5)**: Dépend de Foundational + US4 (compte créé)
- **US5 - Partage documents (Phase 6)**: Dépend de Foundational
- **US3 - Accès documents (Phase 7)**: Dépend de US5 (documents à consulter)
- **US6 - Notifications (Phase 8)**: Dépend de US5 (partage déclenche notif)
- **Polish (Phase 9)**: Dépend de toutes les US souhaitées

### User Story Dependencies

```
                    ┌─────────────┐
                    │   Setup     │
                    │  (Phase 1)  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ Foundational│
                    │  (Phase 2)  │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐
    │    US4    │    │    US1    │    │    US5    │
    │ Invitations│    │   Solde   │    │  Partage  │
    │   (P1)    │    │   (P1)    │    │   (P2)    │
    └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
          │                │                │
          │          ┌─────▼─────┐    ┌─────▼─────┐
          │          │    US2    │    │    US3    │
          │          │ Paiements │    │  Documents│
          │          │   (P1)    │    │   (P2)    │
          │          └───────────┘    └─────┬─────┘
          │                                 │
          │                           ┌─────▼─────┐
          │                           │    US6    │
          │                           │  Notifs   │
          │                           │   (P3)    │
          └───────────────────────────┴───────────┘
                           │
                    ┌──────▼──────┐
                    │   Polish    │
                    │  (Phase 9)  │
                    └─────────────┘
```

### Parallel Opportunities

- **Phase 1**: T001-T006 en parallèle (schemas et types)
- **Phase 2**: T012-T015 en parallèle (règles Firestore/Storage)
- **Phase 3**: T022-T023 en parallèle (composants invitation)
- **Phase 4**: T031-T033 en parallèle (composants solde)
- **Phase 5**: T048-T049 en parallèle (composants documents syndic)
- **Phase 7**: T055-T057 en parallèle (composants documents extranet)
- **US1/US2**: Peuvent être développées en parallèle après US4
- **US5/US3**: US5 avant US3, mais parallélisable avec US1/US2

---

## Parallel Example: Phase 1 Setup

```bash
# Lancer tous les schemas en parallèle:
Task: "Créer schema Zod InvitationExtranet dans src/lib/schemas/invitation-extranet.ts"
Task: "Créer schema Zod DocumentPartage dans src/lib/schemas/document-partage.ts"
Task: "Créer schema Zod PreferencesNotification dans src/lib/schemas/preferences-notification.ts"

# Puis tous les types en parallèle:
Task: "Créer types exportés dans src/types/invitation-extranet.ts"
Task: "Créer types exportés dans src/types/document-partage.ts"
Task: "Créer types exportés dans src/types/preferences-notification.ts"
```

---

## Implementation Strategy

### MVP First (US4 + US1 uniquement)

1. Compléter Phase 1: Setup
2. Compléter Phase 2: Foundational (CRITIQUE)
3. Compléter Phase 3: US4 - Invitations
4. Compléter Phase 4: US1 - Solde
5. **STOP et VALIDER**: Tester le flux complet invitation → consultation solde
6. Déployer/démo si prêt

### Incremental Delivery

1. Setup + Foundational → Infrastructure prête
2. US4 → Les copropriétaires peuvent créer leur compte
3. US1 → Consultation du solde (MVP!)
4. US2 → Historique paiements
5. US5 → Syndic peut partager documents
6. US3 → Copropriétaires voient documents
7. US6 → Notifications email
8. Polish → Optimisations finales

### Parallel Team Strategy

Avec plusieurs développeurs après Phase 2:
- **Dev A**: US4 (Invitations) puis US1 (Solde)
- **Dev B**: US5 (Partage documents) puis US3 (Accès documents)
- **Dev C**: US2 (Paiements) puis US6 (Notifications)

---

## Summary

| Phase | User Story | Tasks | Parallel |
|-------|------------|-------|----------|
| 1 | Setup | 8 | 6 |
| 2 | Foundational | 9 | 1 |
| 3 | US4 - Invitations (P1) | 11 | 4 |
| 4 | US1 - Solde (P1) | 8 | 4 |
| 5 | US2 - Paiements (P1) | 7 | 4 |
| 6 | US5 - Partage docs (P2) | 9 | 3 |
| 7 | US3 - Accès docs (P2) | 8 | 4 |
| 8 | US6 - Notifications (P3) | 8 | 2 |
| 9 | Polish | 9 | 3 |
| **Total** | | **77** | **31** |

---

## Notes

- [P] tasks = fichiers différents, pas de dépendances
- [Story] label mappe la tâche à une User Story spécifique
- Chaque User Story doit être testable indépendamment
- Vérifier que les tests échouent avant d'implémenter (TDD)
- Commit après chaque tâche ou groupe logique
- S'arrêter à tout checkpoint pour valider la story indépendamment
