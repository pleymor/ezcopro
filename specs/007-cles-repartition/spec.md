# Feature Specification: Gestion des clés de répartition

**Feature Branch**: `007-cles-repartition`
**Created**: 2026-01-12
**Status**: Implemented
**Input**: User description: "gestion des clés de répartition"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Créer une clé de répartition (Priority: P1)

En tant que syndic, je veux créer des clés de répartition pour ma copropriété afin de définir comment les charges sont réparties entre les copropriétaires selon différents critères (tantièmes généraux, tantièmes d'escalier, tantièmes de chauffage, etc.).

**Why this priority**: Les clés de répartition sont fondamentales pour le calcul des charges. Sans elles, impossible de répartir correctement les appels de fonds entre les copropriétaires.

**Independent Test**: Créer une clé de répartition et vérifier qu'elle apparaît dans la liste des clés disponibles.

**Acceptance Scenarios**:

1. **Given** une copropriété sans clé de répartition, **When** je crée une clé "Charges générales", **Then** la clé est créée avec tous les lots inclus par défaut et visible dans la liste
2. **Given** une copropriété avec des lots existants, **When** je crée une clé de répartition, **Then** les quotes-parts sont calculées automatiquement au prorata des tantièmes
3. **Given** une clé de répartition en cours de création, **When** aucun lot n'est coché, **Then** le système affiche un avertissement "Aucun lot sélectionné"

---

### User Story 2 - Affecter les lots à une clé de répartition (Priority: P1)

En tant que syndic, je veux pouvoir sélectionner quels lots participent à une clé de répartition, afin que les charges soient calculées uniquement sur les lots concernés.

**Why this priority**: L'affectation des lots aux clés est indissociable de la création des clés - sans cela, les clés ne servent à rien.

**Independent Test**: Sélectionner des lots pour une clé et vérifier que les quotes-parts sont calculées automatiquement.

**Acceptance Scenarios**:

1. **Given** une clé de répartition et des lots, **When** je coche les lots à inclure, **Then** les quotes-parts sont calculées automatiquement au prorata des tantièmes
2. **Given** une clé avec tous les lots cochés, **When** je décoche un lot, **Then** les quotes-parts des lots restants sont recalculées pour totaliser 10000
3. **Given** une clé de répartition, **When** je clique sur "Inclure tous les lots", **Then** tous les lots sont cochés et les quotes-parts recalculées

---

### User Story 3 - Consulter les clés de répartition (Priority: P2)

En tant que syndic, je veux pouvoir consulter la liste des clés de répartition de ma copropriété et voir le détail de chaque clé (lots concernés et leurs quotes-parts).

**Why this priority**: La consultation est essentielle mais moins critique que la création et l'affectation.

**Independent Test**: Accéder à la liste des clés et consulter le détail d'une clé.

**Acceptance Scenarios**:

1. **Given** plusieurs clés de répartition existantes, **When** j'accède à la page des clés de répartition, **Then** je vois la liste de toutes les clés avec leur nom et description
2. **Given** une clé de répartition avec des lots affectés, **When** je clique sur cette clé, **Then** je vois le détail avec tous les lots et leurs quotes-parts

---

### User Story 4 - Modifier une clé de répartition (Priority: P2)

En tant que syndic, je veux pouvoir modifier le nom, la description ou les lots inclus d'une clé de répartition existante.

**Why this priority**: Les modifications sont nécessaires mais moins fréquentes que la création initiale.

**Independent Test**: Modifier le nom et les lots inclus d'une clé existante.

**Acceptance Scenarios**:

1. **Given** une clé de répartition existante, **When** je modifie son nom, **Then** le nouveau nom est enregistré
2. **Given** une clé de répartition avec des lots inclus, **When** je décoche un lot, **Then** les quotes-parts sont recalculées automatiquement

---

### User Story 5 - Supprimer une clé de répartition (Priority: P3)

En tant que syndic, je veux pouvoir supprimer une clé de répartition qui n'est plus utilisée.

**Why this priority**: La suppression est rare et doit être protégée pour éviter les erreurs.

**Independent Test**: Supprimer une clé non utilisée et vérifier qu'elle disparaît.

**Acceptance Scenarios**:

1. **Given** une clé de répartition non utilisée dans aucun appel de fonds, **When** je la supprime, **Then** la clé est supprimée
2. **Given** une clé de répartition utilisée dans un appel de fonds, **When** je tente de la supprimer, **Then** le système m'en empêche et affiche un message explicatif

---

### Edge Cases

- Que se passe-t-il si aucun lot n'est coché ? → Le système affiche un avertissement "Aucun lot sélectionné" et le total est 0
- Que se passe-t-il si un lot n'est pas coché pour une clé ? → Sa quote-part est 0 (lot exclu de cette clé)
- Que se passe-t-il si on supprime un lot qui a des quotes-parts ? → Les quotes-parts associées sont supprimées automatiquement
- Que se passe-t-il si on crée une clé avec le même nom qu'une existante ? → Le système refuse et demande un nom unique
- Que se passe-t-il avec les arrondis du calcul automatique ? → Le système ajuste automatiquement pour que le total soit exactement 10000

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT permettre de créer une clé de répartition avec un nom unique et une description optionnelle
- **FR-002**: Le système DOIT permettre de sélectionner (via checkbox) quels lots participent à une clé de répartition
- **FR-003**: Le système DOIT calculer automatiquement les quotes-parts au prorata des tantièmes des lots sélectionnés
- **FR-004**: Le système DOIT afficher le total des quotes-parts (toujours 10000 si au moins un lot est sélectionné)
- **FR-005**: Le système DOIT permettre de modifier le nom, la description et les lots inclus d'une clé existante
- **FR-006**: Le système DOIT permettre de supprimer une clé non utilisée dans des appels de fonds
- **FR-007**: Le système DOIT empêcher la suppression d'une clé utilisée dans au moins un appel de fonds
- **FR-008**: Le système DOIT afficher la liste des clés de répartition avec possibilité de voir le détail
- **FR-009**: Le système DOIT créer automatiquement une clé par défaut "Tantièmes généraux" avec tous les lots inclus lors du premier accès
- **FR-010**: Le système DOIT afficher l'entrée "Clés de répartition" comme sous-menu de "Lots" dans la navigation
- **FR-011**: Le système DOIT proposer un bouton "Inclure tous les lots" pour réinitialiser la sélection
- **FR-012**: Le système DOIT ajuster automatiquement les arrondis pour garantir un total exact de 10000 millièmes

### Key Entities

- **Clé de répartition (CleRepartition)**: Définit une règle de répartition des charges. Attributs : nom (unique), description (optionnel), liste des quotes-parts par lot
- **Quote-part (QuotePart)**: Association entre un lot et une clé de répartition. Attributs : lot concerné, valeur en millièmes (0-10000)
- **Lot**: Unité de copropriété déjà existante dans le système, avec ses tantièmes généraux

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Le syndic peut créer une clé de répartition en moins de 1 minute (sélection des lots + calcul auto)
- **SC-002**: Le système affiche clairement le total des quotes-parts et le nombre de lots inclus
- **SC-003**: 100% des tentatives de suppression de clés utilisées sont bloquées avec un message clair
- **SC-004**: La consultation d'une clé affiche tous les lots avec leurs quotes-parts en moins de 2 secondes

## Assumptions

- Les quotes-parts sont exprimées en millièmes (base 10000) pour plus de précision que les tantièmes
- Une clé de répartition est spécifique à une copropriété (pas de partage entre copropriétés)
- Les tantièmes généraux des lots peuvent servir de base pour créer automatiquement une clé par défaut
- Un lot peut avoir une quote-part de 0 pour certaines clés (ex: un parking n'a pas de quote-part pour les charges d'ascenseur)

## Clarifications

### Session 2026-01-12

- Q: Quand la clé par défaut "Tantièmes généraux" doit-elle être créée ? → A: Automatiquement lors du premier accès à la section clés de répartition (si aucune clé n'existe)
- Q: Où les clés de répartition doivent-elles apparaître dans la navigation ? → A: Sous-menu de "Lots" (puisque les clés référencent les lots)
- Q: Comment saisir les quotes-parts pour une clé avec de nombreux lots ? → A: L'utilisateur coche les lots à inclure, les quotes-parts sont calculées automatiquement au prorata des tantièmes
- Q: A-t-on besoin de spécifier les quotes-parts manuellement ? → A: Non, le calcul est automatique basé sur les tantièmes. Formule : `(tantièmes du lot / somme tantièmes lots cochés) × 10000`
