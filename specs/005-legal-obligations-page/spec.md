# Feature Specification: Page des Obligations Légales du Syndic Bénévole

**Feature Branch**: `005-legal-obligations-page`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "Ajouter une page d'information sur les obligations légales d'un syndic bénévole en France"

## Clarifications

### Session 2026-01-11

- Q: Où placer le lien vers la page dans la navigation ? → A: Sous-menu ou section "Ressources" / "Aide"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consulter les obligations légales principales (Priority: P1)

En tant que syndic bénévole, je souhaite accéder à une page présentant clairement mes obligations légales principales afin de m'assurer que je gère correctement la copropriété.

**Why this priority**: C'est la fonction première de cette page - fournir l'information essentielle aux syndics bénévoles qui ont besoin de connaître leurs responsabilités légales.

**Independent Test**: Peut être testé en accédant à la page et en vérifiant que toutes les catégories d'obligations sont affichées de manière lisible et organisée.

**Acceptance Scenarios**:

1. **Given** un utilisateur connecté sur le dashboard, **When** il accède à la section "Ressources" ou "Aide" et clique sur "Obligations légales", **Then** il accède à une page présentant les obligations légales organisées par catégories.
2. **Given** un utilisateur sur la page des obligations légales, **When** il consulte le contenu, **Then** il voit des informations structurées couvrant les obligations comptables, administratives, et relatives aux assemblées générales.

---

### User Story 2 - Naviguer entre les sections d'obligations (Priority: P2)

En tant que syndic bénévole, je souhaite pouvoir naviguer facilement entre les différentes catégories d'obligations (comptabilité, assemblées générales, assurances, etc.) afin de trouver rapidement l'information dont j'ai besoin.

**Why this priority**: Améliore l'expérience utilisateur en permettant un accès rapide aux sections pertinentes sans devoir faire défiler toute la page.

**Independent Test**: Peut être testé en vérifiant que les liens de navigation interne amènent bien aux sections correspondantes.

**Acceptance Scenarios**:

1. **Given** un utilisateur sur la page des obligations légales, **When** il clique sur un lien de section dans le sommaire, **Then** la page défile jusqu'à la section correspondante.
2. **Given** un utilisateur consultant une section, **When** il souhaite revenir au sommaire, **Then** il peut facilement remonter en haut de page.

---

### User Story 3 - Consulter les références légales (Priority: P3)

En tant que syndic bénévole, je souhaite voir les références aux textes de loi (articles du Code de la copropriété, loi de 1965, etc.) afin de pouvoir approfondir mes recherches si nécessaire.

**Why this priority**: Fournit une valeur ajoutée pour les utilisateurs souhaitant consulter les textes officiels, mais n'est pas indispensable pour la compréhension des obligations de base.

**Independent Test**: Peut être testé en vérifiant que les références légales sont présentes et correctement formatées dans chaque section.

**Acceptance Scenarios**:

1. **Given** un utilisateur consultant une section d'obligations, **When** il lit le contenu, **Then** il voit les références aux articles de loi pertinents (ex: "Article 14 de la loi du 10 juillet 1965").

---

### Edge Cases

- Que se passe-t-il si le contenu n'est pas disponible ? La page affiche un message d'erreur approprié.
- Comment la page se comporte-t-elle sur mobile ? Le contenu reste lisible et le sommaire reste accessible.
- Que se passe-t-il si l'utilisateur n'est pas connecté ? Il est redirigé vers la page de connexion (comportement standard du dashboard).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT afficher une page dédiée aux obligations légales du syndic bénévole accessible depuis une section "Ressources" ou "Aide" dans la navigation.
- **FR-002**: La page DOIT présenter les obligations organisées en catégories distinctes : obligations comptables, obligations relatives aux assemblées générales, obligations d'assurance, obligations administratives, et obligations de conservation des documents.
- **FR-003**: Chaque catégorie DOIT inclure une liste des obligations principales avec une description claire et compréhensible par un non-juriste.
- **FR-004**: La page DOIT inclure un sommaire cliquable permettant de naviguer directement vers chaque section.
- **FR-005**: La page DOIT afficher les références légales (numéros d'articles de loi) pour chaque obligation.
- **FR-006**: La page DOIT être accessible uniquement aux utilisateurs connectés (cohérence avec le dashboard).
- **FR-007**: La page DOIT être responsive et lisible sur tous les appareils (desktop, tablette, mobile).
- **FR-008**: La page DOIT respecter le mode clair/sombre de l'application.

### Contenu des Obligations Légales

Le contenu couvrira les catégories suivantes (basées sur la loi du 10 juillet 1965 et le décret du 17 mars 1967) :

1. **Obligations comptables**
   - Tenue d'une comptabilité en partie double
   - Présentation des comptes annuels
   - Ouverture d'un compte bancaire séparé
   - Clôture des comptes à date fixe

2. **Obligations relatives aux assemblées générales**
   - Convocation des assemblées dans les délais légaux
   - Envoi de l'ordre du jour et des documents
   - Rédaction du procès-verbal
   - Notification des décisions

3. **Obligations d'assurance**
   - Souscription d'une assurance responsabilité civile
   - Assurance de l'immeuble

4. **Obligations administratives**
   - Immatriculation au registre national des copropriétés
   - Mise à jour de la fiche synthétique
   - Conservation du carnet d'entretien

5. **Obligations de conservation des documents**
   - Durées de conservation légales
   - Types de documents à conserver

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% des utilisateurs peuvent accéder à la page des obligations légales depuis la navigation en moins de 2 clics.
- **SC-002**: La page affiche les 5 catégories d'obligations définies avec au moins 3 obligations par catégorie.
- **SC-003**: Le temps de chargement de la page est perçu comme instantané (moins de 2 secondes).
- **SC-004**: La page est entièrement lisible et navigable sur écran mobile (largeur 320px minimum).
- **SC-005**: 100% des sections sont accessibles via le sommaire cliquable.

## Assumptions

- Le contenu des obligations légales sera statique (pas de mise à jour dynamique depuis une source externe).
- Les informations sont basées sur la législation française en vigueur (loi du 10 juillet 1965 et décret du 17 mars 1967).
- La page sera accessible uniquement aux utilisateurs authentifiés, conformément au pattern existant du dashboard.
- Le contenu sera rédigé en français.
- Aucune fonctionnalité de recherche dans le contenu n'est requise pour cette version.

## Out of Scope

- Mise à jour automatique du contenu en cas de changement législatif.
- Traduction du contenu en d'autres langues.
- Fonctionnalité de téléchargement PDF du contenu.
- Système de favoris ou de marque-pages personnalisés.
- Intégration avec des sources légales externes (Légifrance, etc.).
