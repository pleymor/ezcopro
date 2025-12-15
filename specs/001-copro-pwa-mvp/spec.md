# Feature Specification: EzCopro MVP - Gestion de Copropriété

**Feature Branch**: `001-copro-pwa-mvp`
**Created**: 2025-12-15
**Status**: Draft
**Input**: PWA permettant à des copropriétés avec syndic bénévole de gérer leur copropriété en France. Identification Google, storage cloud, gestion des lots/copropriétaires/finances/soldes, historisation, design mobile-first, BDD avec Playwright et Storybook.

## Clarifications

### Session 2025-12-15

- Q: Un lot peut-il avoir plusieurs copropriétaires ou être vacant ? → A: Un lot a toujours exactement un copropriétaire unique. Les cas d'indivision sont gérés en créant un copropriétaire représentant l'indivision (ex: "Indivision Dupont/Martin").
- Q: La gestion de fichiers/documents est-elle incluse dans le MVP ? → A: Hors scope MVP - pas de gestion de fichiers dans cette version.
- Q: Contrainte de coût pour le MVP ? → A: Gratuit (0€) via free tiers (Firebase/Supabase/Vercel), cible ~5 copropriétés pilotes / ~100 utilisateurs. Voir constitution pour stratégie post-MVP.
- Q: Langue de l'interface ? → A: Français uniquement (pas d'internationalisation dans le MVP).
- Q: Suppression de données utilisateur (RGPD) ? → A: Anonymisation - données personnelles effacées, historique financier conservé avec mention "Ancien copropriétaire".

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Connexion et Accès à la Copropriété (Priority: P1)

En tant que copropriétaire, je veux me connecter avec mon compte Google et accéder à ma copropriété pour consulter les informations essentielles.

**Why this priority**: Sans authentification et accès de base, aucune autre fonctionnalité n'est utilisable. C'est le point d'entrée obligatoire de l'application.

**Independent Test**: Peut être testé en se connectant avec Google et en vérifiant l'affichage du tableau de bord de la copropriété avec les informations de base.

**Acceptance Scenarios**:

1. **Given** je suis un utilisateur non connecté, **When** j'accède à l'application, **Then** je vois un écran de connexion avec l'option "Se connecter avec Google"
2. **Given** je suis sur l'écran de connexion, **When** je clique sur "Se connecter avec Google" et j'autorise l'accès, **Then** je suis redirigé vers le tableau de bord de ma copropriété
3. **Given** je suis connecté et membre d'une copropriété, **When** j'accède au tableau de bord, **Then** je vois le nom de la copropriété, mon solde actuel et un résumé des dernières actions
4. **Given** je suis connecté mais pas encore membre d'une copropriété, **When** j'accède à l'application, **Then** je vois un écran me proposant de créer une nouvelle copropriété ou de rejoindre une existante via un code d'invitation
5. **Given** je suis connecté, **When** je clique sur "Déconnexion", **Then** ma session est terminée et je reviens à l'écran de connexion

---

### User Story 2 - Gestion des Lots (Priority: P2)

En tant que copropriétaire, je veux consulter et gérer la liste des lots de la copropriété pour connaître la répartition des tantièmes et les propriétaires associés.

**Why this priority**: Les lots sont la base de toute copropriété. Ils définissent les tantièmes qui servent au calcul des charges. Fonctionnalité fondamentale après l'authentification.

**Independent Test**: Peut être testé en créant, modifiant et supprimant des lots, et en vérifiant que les informations sont correctement affichées et persistées.

**Acceptance Scenarios**:

1. **Given** je suis connecté à une copropriété, **When** j'accède à la section "Lots", **Then** je vois la liste de tous les lots avec leur numéro, type, tantièmes et copropriétaire associé
2. **Given** je suis dans la section "Lots", **When** je clique sur "Ajouter un lot", **Then** je peux saisir le numéro du lot, le type (appartement, cave, parking, etc.), les tantièmes et sélectionner un copropriétaire
3. **Given** je visualise un lot, **When** je clique sur "Modifier", **Then** je peux éditer toutes les informations du lot
4. **Given** je visualise un lot, **When** je clique sur "Supprimer" et confirme, **Then** le lot est supprimé et l'action est historisée
5. **Given** je suis dans la section "Lots", **When** je consulte les totaux, **Then** je vois le total des tantièmes et le nombre de lots

---

### User Story 3 - Gestion des Copropriétaires (Priority: P2)

En tant que copropriétaire, je veux gérer la liste des copropriétaires pour maintenir à jour les coordonnées et savoir qui possède quels lots.

**Why this priority**: Les copropriétaires sont liés aux lots et aux finances. Cette fonctionnalité est au même niveau que les lots car elles sont interdépendantes.

**Independent Test**: Peut être testé en ajoutant, modifiant et supprimant des copropriétaires, et en vérifiant les liens avec les lots.

**Acceptance Scenarios**:

1. **Given** je suis connecté à une copropriété, **When** j'accède à la section "Copropriétaires", **Then** je vois la liste de tous les copropriétaires avec leur nom, email et lots possédés
2. **Given** je suis dans la section "Copropriétaires", **When** je clique sur "Ajouter un copropriétaire", **Then** je peux saisir le nom, prénom, email et numéro de téléphone
3. **Given** je visualise un copropriétaire, **When** je clique dessus, **Then** je vois le détail avec tous ses lots et son solde actuel
4. **Given** je visualise un copropriétaire, **When** je clique sur "Modifier", **Then** je peux éditer ses informations de contact
5. **Given** je visualise un copropriétaire, **When** je clique sur "Inviter", **Then** un code d'invitation est généré pour qu'il puisse rejoindre l'application

---

### User Story 4 - Gestion des Opérations Financières (Priority: P3)

En tant que copropriétaire, je veux enregistrer les appels de fonds et les paiements pour suivre la trésorerie de la copropriété.

**Why this priority**: Les finances sont essentielles mais nécessitent d'abord que les lots et copropriétaires soient en place pour calculer les répartitions.

**Independent Test**: Peut être testé en créant des appels de fonds, en enregistrant des paiements et en vérifiant les calculs de répartition.

**Acceptance Scenarios**:

1. **Given** je suis connecté à une copropriété, **When** j'accède à la section "Finances", **Then** je vois un résumé avec le solde global de la copropriété et la liste des opérations récentes
2. **Given** je suis dans la section "Finances", **When** je clique sur "Nouvel appel de fonds", **Then** je peux saisir le montant total, le libellé, la date d'échéance et le système calcule automatiquement la répartition par lot selon les tantièmes
3. **Given** un appel de fonds existe, **When** je consulte le détail, **Then** je vois le montant dû par chaque copropriétaire et le statut de paiement (payé/en attente)
4. **Given** je visualise un copropriétaire, **When** je clique sur "Enregistrer un paiement", **Then** je peux saisir le montant, la date et une référence optionnelle
5. **Given** un paiement est enregistré, **When** je consulte l'historique, **Then** je vois le paiement avec sa date, son montant et le copropriétaire concerné

---

### User Story 5 - Consultation des Soldes (Priority: P3)

En tant que copropriétaire, je veux consulter les soldes de chaque copropriétaire pour connaître la situation financière individuelle.

**Why this priority**: Les soldes découlent des opérations financières et offrent une vue synthétique indispensable pour le suivi.

**Independent Test**: Peut être testé en consultant les soldes après avoir créé des appels de fonds et enregistré des paiements.

**Acceptance Scenarios**:

1. **Given** je suis connecté, **When** j'accède à la section "Soldes", **Then** je vois la liste de tous les copropriétaires avec leur solde actuel (créditeur ou débiteur)
2. **Given** je consulte les soldes, **When** un copropriétaire est débiteur, **Then** son solde est affiché en rouge avec le montant dû
3. **Given** je consulte les soldes, **When** un copropriétaire est créditeur, **Then** son solde est affiché en vert avec le montant en avance
4. **Given** je clique sur un copropriétaire dans la liste des soldes, **When** le détail s'affiche, **Then** je vois l'historique de toutes les opérations ayant impacté son solde

---

### User Story 6 - Historique des Actions (Priority: P4)

En tant que copropriétaire, je veux consulter l'historique de toutes les actions effectuées pour assurer la traçabilité et la transparence.

**Why this priority**: L'historisation est importante pour la transparence mais peut fonctionner même si les autres fonctionnalités sont partiellement implémentées.

**Independent Test**: Peut être testé en effectuant diverses actions et en vérifiant qu'elles apparaissent dans l'historique.

**Acceptance Scenarios**:

1. **Given** je suis connecté, **When** j'accède à la section "Historique", **Then** je vois la liste chronologique de toutes les actions effectuées
2. **Given** je consulte l'historique, **When** je regarde une entrée, **Then** je vois la date, l'heure, l'utilisateur qui a fait l'action, le type d'action et les détails
3. **Given** je consulte l'historique, **When** je filtre par type d'action, **Then** seules les actions du type sélectionné sont affichées
4. **Given** une action est effectuée (création, modification, suppression), **When** l'action est terminée, **Then** une entrée est automatiquement ajoutée à l'historique

---

### Edge Cases

- Que se passe-t-il si un copropriétaire supprimé a encore un solde non nul ? Le système affiche un avertissement et empêche la suppression jusqu'à régularisation
- Comment gérer la connexion Google si l'utilisateur n'a pas de compte Google ? L'utilisateur doit créer un compte Google (gratuit) pour utiliser l'application
- Que se passe-t-il si la somme des tantièmes n'est pas égale à un nombre rond (ex: 1000, 10000) ? Le système accepte toute somme mais affiche un avertissement si elle semble inhabituelle
- Comment gérer les copropriétaires avec plusieurs lots ? Un copropriétaire peut avoir plusieurs lots, son solde est la somme des montants dus/payés pour tous ses lots
- Que se passe-t-il en cas de perte de connexion internet ? L'application affiche un message d'erreur clair et invite l'utilisateur à réessayer une fois connecté
- Gestion de fichiers/documents ? Explicitement hors scope du MVP
- Suppression d'un copropriétaire ayant un historique financier ? Les données sont anonymisées ("Ancien copropriétaire") pour conformité RGPD tout en préservant l'intégrité comptable

## Requirements *(mandatory)*

### Functional Requirements

**Authentification & Accès**
- **FR-001**: Le système DOIT permettre l'authentification uniquement via compte Google
- **FR-002**: Le système DOIT permettre à un utilisateur de créer une nouvelle copropriété
- **FR-003**: Le système DOIT permettre à un utilisateur de rejoindre une copropriété existante via un code d'invitation
- **FR-004**: Le système DOIT afficher un tableau de bord récapitulatif après connexion

**Gestion des Lots**
- **FR-005**: Le système DOIT permettre de créer, modifier et supprimer des lots
- **FR-006**: Un lot DOIT avoir un numéro unique (au sein de la copropriété), un type, des tantièmes et exactement un copropriétaire associé (les indivisions sont représentées par un copropriétaire unique nommé explicitement)
- **FR-007**: Les types de lots disponibles DOIVENT inclure : appartement, cave, parking, local commercial, autre
- **FR-008**: Le système DOIT afficher le total des tantièmes de la copropriété

**Gestion des Copropriétaires**
- **FR-009**: Le système DOIT permettre de créer, modifier et supprimer des copropriétaires (suppression = anonymisation RGPD : données personnelles effacées, historique financier conservé avec "Ancien copropriétaire")
- **FR-010**: Un copropriétaire DOIT avoir un nom, prénom, email (optionnel) et téléphone (optionnel)
- **FR-011**: Le système DOIT permettre de générer un code d'invitation pour un copropriétaire
- **FR-012**: Le système DOIT afficher les lots possédés par chaque copropriétaire

**Gestion Financière**
- **FR-013**: Le système DOIT permettre de créer des appels de fonds avec montant, libellé et date d'échéance
- **FR-014**: Le système DOIT calculer automatiquement la répartition d'un appel de fonds selon les tantièmes des lots
- **FR-015**: Le système DOIT permettre d'enregistrer des paiements pour un copropriétaire avec montant, date et référence optionnelle
- **FR-016**: Le système DOIT calculer et afficher le solde de chaque copropriétaire (somme des appels - somme des paiements)

**Historisation**
- **FR-017**: Le système DOIT enregistrer automatiquement toutes les actions de création, modification et suppression
- **FR-018**: Chaque entrée d'historique DOIT contenir : date/heure, utilisateur, type d'action, entité concernée, détails avant/après modification
- **FR-019**: Le système DOIT permettre de consulter et filtrer l'historique des actions

**Interface & Expérience**
- **FR-020**: L'application DOIT être une PWA installable sur mobile et desktop
- **FR-021**: L'interface DOIT être responsive et optimisée mobile-first
- **FR-022**: L'application DOIT fonctionner sur les navigateurs modernes (Chrome, Firefox, Safari, Edge - 2 dernières versions)
- **FR-025**: L'interface DOIT être en français uniquement (pas d'internationalisation)

**Données & Stockage**
- **FR-023**: Toutes les données DOIVENT être stockées dans le cloud et synchronisées en temps réel
- **FR-024**: Le système DOIT supporter plusieurs copropriétés (multi-tenant)

### Key Entities

- **Copropriété**: Représente un immeuble ou ensemble immobilier géré collectivement. Possède un nom, une adresse, et regroupe des lots, copropriétaires et opérations financières.

- **Lot**: Unité de propriété au sein d'une copropriété (appartement, cave, parking, etc.). Possède un numéro unique, un type, des tantièmes (quote-part) et est rattaché à un copropriétaire.

- **Copropriétaire**: Personne physique ou morale possédant un ou plusieurs lots. Possède nom, prénom, coordonnées et un solde calculé.

- **Appel de fonds**: Demande de paiement émise vers les copropriétaires. Possède un montant total, un libellé, une date d'échéance. Est réparti entre les lots selon leurs tantièmes.

- **Paiement**: Versement effectué par un copropriétaire. Possède un montant, une date, une référence optionnelle et est rattaché à un copropriétaire.

- **Entrée d'historique**: Trace d'une action effectuée dans le système. Possède date/heure, utilisateur, type d'action, entité concernée et détails de modification.

- **Utilisateur**: Compte connecté à l'application via Google. Peut être membre d'une ou plusieurs copropriétés.

## Assumptions

- Les utilisateurs ont accès à un compte Google pour l'authentification
- Les copropriétés ciblées sont de petite à moyenne taille (3-30 lots, typiquement < 15) correspondant au profil des syndics bénévoles (copropriétés autogérées)
- Les tantièmes sont des nombres entiers
- Les montants financiers sont en euros, avec deux décimales maximum
- Tous les utilisateurs membres d'une copropriété ont les mêmes droits (pas de rôles différenciés dans cette version)
- L'application nécessite une connexion internet pour fonctionner (pas de mode hors-ligne)
- Le code d'invitation a une durée de validité limitée (7 jours par défaut)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un nouveau copropriétaire peut se connecter et accéder à sa copropriété en moins de 2 minutes
- **SC-002**: La création d'un appel de fonds avec répartition automatique prend moins de 1 minute
- **SC-003**: L'application est utilisable sur écran mobile (320px de large minimum) sans scroll horizontal
- **SC-004**: 95% des actions utilisateur reçoivent un retour visuel en moins de 2 secondes
- **SC-005**: L'historique affiche toutes les actions des 12 derniers mois avec possibilité de filtrage
- **SC-006**: Le solde affiché pour chaque copropriétaire est toujours exact et à jour après chaque opération
- **SC-007**: L'application peut être installée comme PWA sur mobile et desktop
- **SC-008**: Un utilisateur peut inviter un nouveau copropriétaire en moins de 30 secondes
