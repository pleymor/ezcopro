# Feature Specification: État vide du dashboard

**Feature Branch**: `002-empty-dashboard-state`
**Created**: 2025-12-16
**Status**: Draft
**Input**: User description: "si pas de copro créée, on devrait adapter le dashboard"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Affichage de l'état vide (Priority: P1)

Un nouvel utilisateur se connecte à l'application pour la première fois. Il n'a encore créé aucune copropriété. Au lieu de voir un écran de chargement infini ou une page vide, il voit un message d'accueil clair qui lui explique qu'il doit créer sa première copropriété pour commencer, avec un bouton d'action évident pour le faire.

**Why this priority**: C'est le scénario principal qui justifie cette fonctionnalité. Sans cet affichage adapté, les nouveaux utilisateurs sont bloqués et ne comprennent pas comment utiliser l'application.

**Independent Test**: Peut être testé en créant un nouvel utilisateur sans copropriété et en vérifiant que l'écran d'onboarding s'affiche correctement avec le bouton de création.

**Acceptance Scenarios**:

1. **Given** un utilisateur connecté sans aucune copropriété, **When** il accède au dashboard, **Then** il voit un message d'accueil l'invitant à créer sa première copropriété
2. **Given** un utilisateur connecté sans aucune copropriété, **When** il accède au dashboard, **Then** il voit un bouton clairement visible pour créer une copropriété
3. **Given** un utilisateur connecté sans aucune copropriété, **When** il clique sur le bouton de création, **Then** il est redirigé vers la page de création de copropriété (onboarding)

---

### User Story 2 - Transition vers le dashboard normal (Priority: P2)

Après avoir créé sa première copropriété via l'onboarding, l'utilisateur doit voir le dashboard normal avec les liens rapides (Lots, Copropriétaires, Finances, Historique) au lieu de l'état vide.

**Why this priority**: Cette transition fluide est essentielle pour que l'utilisateur comprenne qu'il a bien complété l'étape de création et puisse commencer à utiliser l'application.

**Independent Test**: Peut être testé en créant une copropriété depuis l'état vide et en vérifiant que le dashboard normal s'affiche ensuite.

**Acceptance Scenarios**:

1. **Given** un utilisateur qui vient de créer sa première copropriété, **When** il revient au dashboard, **Then** il voit le dashboard normal avec la copropriété sélectionnée
2. **Given** un utilisateur avec exactement une copropriété, **When** il accède au dashboard, **Then** cette copropriété est automatiquement sélectionnée et le dashboard normal s'affiche

---

### Edge Cases

- Que se passe-t-il si le chargement des copropriétés échoue ? L'utilisateur doit voir un message d'erreur clair avec une option de réessayer, pas un écran de chargement infini.
- Que se passe-t-il si l'utilisateur supprime toutes ses copropriétés ? Il doit revenir à l'état vide du dashboard.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT détecter quand un utilisateur n'a aucune copropriété
- **FR-002**: Le système DOIT afficher un état vide adapté quand l'utilisateur n'a pas de copropriété, comprenant :
  - Un message d'accueil explicatif
  - Une illustration ou icône visuelle
  - Un bouton d'action principal pour créer une copropriété
- **FR-003**: Le bouton de création DOIT rediriger vers la page d'onboarding (`/onboarding`)
- **FR-004**: Le système DOIT afficher le dashboard normal dès qu'au moins une copropriété existe
- **FR-005**: Le système DOIT afficher un message d'erreur si le chargement des copropriétés échoue, avec une option pour réessayer

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% des nouveaux utilisateurs sans copropriété voient l'état vide adapté au lieu d'un écran de chargement
- **SC-002**: Les utilisateurs peuvent accéder à la création de copropriété en un seul clic depuis l'état vide
- **SC-003**: Le temps de compréhension pour un nouvel utilisateur (savoir quoi faire ensuite) est inférieur à 5 secondes
- **SC-004**: La transition entre état vide et dashboard normal est instantanée après création d'une copropriété

## Assumptions

- La page d'onboarding (`/onboarding`) existe déjà et permet de créer une copropriété
- Le hook `useCopropriete` fournit déjà la liste des copropriétés et l'état de chargement
- L'utilisateur est déjà authentifié quand il accède au dashboard
