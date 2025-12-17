# Feature Specification: Déploiement Vercel via push sur main

**Feature Branch**: `003-vercel-deploy`
**Created**: 2025-12-17
**Status**: Draft
**Input**: User description: "j'aimerais que push sur main trigger le deploiement dans vercel sur le repo https://github.com/pleymor/ezcopro-infra"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Déploiement automatique sur push (Priority: P1)

En tant que développeur, je veux que chaque push sur la branche `main` du repo `ezcopro` déclenche automatiquement un déploiement sur Vercel, afin que l'application de production soit toujours à jour sans intervention manuelle.

**Why this priority**: C'est la fonctionnalité principale demandée - le déploiement continu est essentiel pour maintenir l'application à jour automatiquement.

**Independent Test**: Faire un push sur main et vérifier que Vercel déclenche un nouveau déploiement dans les minutes qui suivent.

**Acceptance Scenarios**:

1. **Given** un développeur a mergé une PR sur main, **When** le push est effectué, **Then** Vercel reçoit une notification et démarre un nouveau build
2. **Given** le build Vercel a réussi, **When** le déploiement se termine, **Then** la nouvelle version est accessible en production
3. **Given** le build Vercel a échoué, **When** le déploiement échoue, **Then** la version précédente reste en production et le développeur est notifié

---

### User Story 2 - Visibilité du statut de déploiement (Priority: P2)

En tant que développeur, je veux voir le statut du déploiement directement sur GitHub (via les checks de commit), afin de savoir si mon code a été déployé avec succès.

**Why this priority**: La visibilité du statut est importante pour le workflow mais n'est pas bloquante pour le déploiement lui-même.

**Independent Test**: Après un push, vérifier que le statut du commit affiche le résultat du déploiement Vercel.

**Acceptance Scenarios**:

1. **Given** un déploiement est en cours, **When** je consulte le commit sur GitHub, **Then** je vois un statut "pending" avec un lien vers Vercel
2. **Given** un déploiement a réussi, **When** je consulte le commit sur GitHub, **Then** je vois un statut "success" avec un lien vers le déploiement
3. **Given** un déploiement a échoué, **When** je consulte le commit sur GitHub, **Then** je vois un statut "failure" avec un lien vers les logs d'erreur

---

### Edge Cases

- Que se passe-t-il si deux pushes arrivent en succession rapide ? (Vercel annule le premier build et lance le second)
- Que se passe-t-il si le webhook Vercel est temporairement indisponible ? (Le déploiement ne se déclenche pas - retry manuel nécessaire)
- Que se passe-t-il si le build dépasse le timeout Vercel ? (Build marqué comme échoué, notification envoyée)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT déclencher un déploiement Vercel à chaque push sur la branche `main`
- **FR-002**: Le système DOIT utiliser le repo d'infrastructure `ezcopro-infra` pour la configuration Vercel
- **FR-003**: Le système DOIT reporter le statut du déploiement comme check GitHub sur le commit
- **FR-004**: Le système DOIT conserver la version précédente en production en cas d'échec de build
- **FR-005**: Le système DOIT permettre de consulter les logs de déploiement via Vercel

### Assumptions

- Le projet Vercel existe déjà et est configuré pour le repo `ezcopro`
- Le compte Vercel dispose des permissions nécessaires pour accéder au repo GitHub
- L'intégration Vercel-GitHub est disponible et activée
- Le repo `ezcopro-infra` contient ou contiendra la configuration Vercel (vercel.json ou équivalent)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% des pushes sur main déclenchent un déploiement Vercel dans les 5 minutes
- **SC-002**: Le statut du déploiement est visible sur GitHub dans les 2 minutes suivant le push
- **SC-003**: Les déploiements réussis sont accessibles en production dans les 10 minutes suivant le push
- **SC-004**: Zéro intervention manuelle requise pour les déploiements standard
