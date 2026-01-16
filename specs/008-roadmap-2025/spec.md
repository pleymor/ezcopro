# Feature Specification: Roadmap ezcopro 2025

**Feature Branch**: `008-roadmap-2025`
**Created**: 2025-01-16
**Status**: Draft
**Input**: Roadmap basée sur l'analyse concurrentielle des solutions Coprolib', Copriciel, VILOGI et Matera.

## Contexte

Cette roadmap définit les fonctionnalités prioritaires à implémenter en 2025 pour combler l'écart avec les solutions concurrentes. L'analyse a identifié 7 fonctionnalités manquantes clés, organisées en phases trimestrielles.

## Analyse Concurrentielle

| Fonctionnalité | Coprolib' | Copriciel | VILOGI | Matera | ezcopro |
|----------------|-----------|-----------|--------|--------|---------|
| Extranet copropriétaires | ✅ | ✅ | ✅ | ✅ | ❌ |
| GED (documents) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Relances impayés | ✅ | ✅ | ✅ | ✅ | ❌ |
| Carnet d'entretien | ✅ | ❌ | ✅ | ✅ | ❌ |
| Budget prévisionnel | ✅ | ✅ | ✅ | ✅ | ❌ |
| Gestion fournisseurs | ✅ | ✅ | ✅ | ✅ | ❌ |
| Vote par correspondance | ❌ | ❌ | ✅ | ✅ | ❌ |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Extranet Copropriétaires (Priority: P1 - Q1 2025)

En tant que copropriétaire, je veux accéder à un espace personnel en ligne pour consulter mon solde, mes appels de fonds, et les documents de la copropriété sans déranger le syndic.

**Why this priority**: Fonctionnalité la plus demandée par les copropriétaires et présente chez tous les concurrents. Réduit la charge du syndic bénévole en permettant le self-service.

**Independent Test**: Un copropriétaire peut se connecter, consulter son solde et télécharger ses derniers appels de fonds.

**Acceptance Scenarios**:

1. **Given** je suis copropriétaire invité, **When** j'accepte l'invitation et crée mon compte, **Then** j'accède à mon espace personnel.
2. **Given** je suis sur mon espace, **When** je consulte "Mon compte", **Then** je vois mon solde actuel, mes derniers appels et paiements.
3. **Given** je suis sur mon espace, **When** je consulte "Documents", **Then** je vois les documents partagés par le syndic (PV AG, règlement, etc.).
4. **Given** le syndic publie un document, **When** je me connecte, **Then** je vois une notification du nouveau document.

---

### User Story 2 - GED / Gestion Documentaire (Priority: P1 - Q2 2025)

En tant que syndic bénévole, je veux stocker et organiser tous les documents de la copropriété (contrats, PV, factures, règlement) dans un espace centralisé et les partager avec le conseil syndical ou tous les copropriétaires.

**Why this priority**: Obligation légale de conserver et mettre à disposition certains documents. Présent chez tous les concurrents.

**Independent Test**: Le syndic peut uploader un document, le classer dans un dossier, et le rendre visible aux copropriétaires.

**Acceptance Scenarios**:

1. **Given** je suis syndic, **When** j'accède à "Documents", **Then** je vois une arborescence de dossiers (Contrats, AG, Comptabilité, Travaux, etc.).
2. **Given** un dossier existe, **When** j'uploade un fichier, **Then** le fichier est stocké avec date et nom.
3. **Given** un document existe, **When** je définis sa visibilité (syndic seul, conseil syndical, tous), **Then** seuls les utilisateurs autorisés le voient.
4. **Given** je suis copropriétaire, **When** je consulte Documents, **Then** je ne vois que les documents partagés avec moi.

---

### User Story 3 - Relances Automatiques Impayés (Priority: P2 - Q2 2025)

En tant que syndic bénévole, je veux automatiser les relances pour les copropriétaires en retard de paiement avec des courriers types (relance amiable, mise en demeure) pour gagner du temps et respecter les procédures.

**Why this priority**: Les impayés sont un problème fréquent. L'automatisation soulage le syndic bénévole et professionnalise la gestion.

**Independent Test**: Le système génère automatiquement une relance pour un copropriétaire débiteur.

**Acceptance Scenarios**:

1. **Given** un copropriétaire a un solde débiteur depuis plus de 30 jours, **When** je lance la génération des relances, **Then** une lettre de relance amiable est générée.
2. **Given** la relance amiable a été envoyée depuis 15 jours sans régularisation, **When** je lance les relances, **Then** une mise en demeure est générée.
3. **Given** une relance est générée, **When** je la consulte, **Then** elle contient le détail des sommes dues et les références légales.
4. **Given** le copropriétaire régularise, **When** je consulte son dossier, **Then** les relances sont marquées comme résolues.

---

### User Story 4 - Carnet d'Entretien (Priority: P2 - Q3 2025)

En tant que syndic bénévole, je veux maintenir un carnet d'entretien numérique de l'immeuble listant tous les équipements, travaux effectués et échéances de maintenance pour assurer le suivi et respecter l'obligation légale.

**Why this priority**: Document obligatoire en copropriété. Permet d'anticiper les travaux et de valoriser l'immeuble.

**Independent Test**: Le syndic peut ajouter un équipement avec sa date d'installation et ses prochaines échéances de maintenance.

**Acceptance Scenarios**:

1. **Given** je suis sur le carnet d'entretien, **When** j'ajoute un équipement (ascenseur, chaudière, etc.), **Then** il apparaît avec ses caractéristiques.
2. **Given** un équipement existe, **When** j'ajoute une intervention, **Then** elle est enregistrée avec date, prestataire et coût.
3. **Given** une échéance de maintenance approche (< 30 jours), **When** je consulte le tableau de bord, **Then** je vois une alerte.
4. **Given** je suis copropriétaire, **When** je consulte le carnet d'entretien, **Then** je vois l'historique des travaux et équipements.

---

### User Story 5 - Budget Prévisionnel (Priority: P2 - Q3 2025)

En tant que syndic bénévole, je veux créer un budget prévisionnel annuel, le faire voter en AG, et comparer les dépenses réelles au budget pour piloter les finances de la copropriété.

**Why this priority**: Obligation légale de présenter un budget en AG. Permet un meilleur suivi financier.

**Independent Test**: Le syndic crée un budget avec des postes, le soumet au vote en AG, puis compare avec le réalisé.

**Acceptance Scenarios**:

1. **Given** je crée un nouveau budget, **When** j'ajoute des postes (entretien, assurance, énergie, etc.), **Then** le total est calculé automatiquement.
2. **Given** un budget est créé, **When** je le soumets au vote d'une AG, **Then** il est lié à la résolution correspondante.
3. **Given** le budget est voté, **When** je saisis des dépenses, **Then** je vois le comparatif prévu vs réalisé par poste.
4. **Given** un poste dépasse le budget de plus de 10%, **When** je consulte le tableau de bord, **Then** je vois une alerte.

---

### User Story 6 - Gestion Fournisseurs et Contrats (Priority: P3 - Q4 2025)

En tant que syndic bénévole, je veux gérer une base de fournisseurs et suivre les contrats en cours (échéances, renouvellements) pour ne pas oublier de dates importantes.

**Why this priority**: Améliore l'organisation et évite les oublis de résiliation ou renégociation.

**Independent Test**: Le syndic ajoute un fournisseur, lui associe un contrat avec échéance, et reçoit une alerte avant l'échéance.

**Acceptance Scenarios**:

1. **Given** je suis sur "Fournisseurs", **When** j'ajoute un fournisseur (nom, activité, contact), **Then** il apparaît dans la liste.
2. **Given** un fournisseur existe, **When** j'ajoute un contrat (objet, dates, montant), **Then** le contrat est lié au fournisseur.
3. **Given** un contrat arrive à échéance dans 60 jours, **When** je consulte le tableau de bord, **Then** je vois une alerte.
4. **Given** une dépense est saisie, **When** je la lie à un fournisseur, **Then** l'historique des dépenses du fournisseur est mis à jour.

---

### User Story 7 - Vote par Correspondance (Priority: P3 - Q4 2025)

En tant que copropriétaire ne pouvant pas assister à l'AG, je veux voter par correspondance avant la réunion pour que ma voix soit comptée même en mon absence.

**Why this priority**: Améliore la participation aux AG. Différenciateur par rapport à certains concurrents.

**Independent Test**: Un copropriétaire reçoit le formulaire de vote, vote sur chaque résolution, et ses votes sont comptabilisés en AG.

**Acceptance Scenarios**:

1. **Given** l'AG est convoquée, **When** je reçois la convocation, **Then** je peux accéder au formulaire de vote par correspondance.
2. **Given** je remplis le formulaire, **When** je vote (pour/contre/abstention) sur chaque résolution, **Then** mes choix sont enregistrés.
3. **Given** j'ai voté par correspondance, **When** le syndic ouvre l'AG, **Then** mes votes sont automatiquement comptabilisés dans les résultats.
4. **Given** j'ai voté par correspondance, **When** je me présente finalement à l'AG, **Then** je peux annuler mon vote par correspondance et voter en présentiel.

---

### Edge Cases

- Que se passe-t-il si un copropriétaire n'a pas d'email ? → Il ne peut pas accéder à l'extranet, le syndic doit lui communiquer les infos autrement.
- Comment gérer les documents volumineux (> 10 Mo) ? → Compression ou refus avec message explicite.
- Que se passe-t-il si le vote par correspondance arrive après le début de l'AG ? → Il n'est pas comptabilisé.
- Comment gérer les contrats multi-copropriétés ? → Hors scope, chaque copro gère ses propres contrats.

## Requirements *(mandatory)*

### Functional Requirements

**Extranet Copropriétaires**
- **FR-001**: Le système DOIT permettre aux copropriétaires de se connecter à un espace personnel.
- **FR-002**: Le système DOIT afficher le solde, les appels de fonds et l'historique des paiements.
- **FR-003**: Le système DOIT afficher les documents partagés par le syndic.

**GED / Documents**
- **FR-004**: Le système DOIT permettre d'uploader des fichiers (PDF, images, Word, Excel).
- **FR-005**: Le système DOIT organiser les documents en dossiers et sous-dossiers.
- **FR-006**: Le système DOIT gérer les droits d'accès (syndic, conseil syndical, tous copropriétaires).

**Relances Impayés**
- **FR-007**: Le système DOIT identifier les copropriétaires débiteurs.
- **FR-008**: Le système DOIT générer des courriers de relance personnalisés.
- **FR-009**: Le système DOIT suivre l'historique des relances par copropriétaire.

**Carnet d'Entretien**
- **FR-010**: Le système DOIT permettre de référencer les équipements de l'immeuble.
- **FR-011**: Le système DOIT enregistrer les interventions et travaux.
- **FR-012**: Le système DOIT alerter sur les échéances de maintenance.

**Budget Prévisionnel**
- **FR-013**: Le système DOIT permettre de créer un budget avec des postes de dépenses.
- **FR-014**: Le système DOIT comparer le budget prévu aux dépenses réelles.
- **FR-015**: Le système DOIT alerter en cas de dépassement significatif.

**Gestion Fournisseurs**
- **FR-016**: Le système DOIT permettre de gérer une base de fournisseurs.
- **FR-017**: Le système DOIT permettre de suivre les contrats et leurs échéances.
- **FR-018**: Le système DOIT alerter avant les échéances de contrats.

**Vote par Correspondance**
- **FR-019**: Le système DOIT permettre de voter à distance avant l'AG.
- **FR-020**: Le système DOIT intégrer automatiquement les votes par correspondance aux résultats.
- **FR-021**: Le système DOIT permettre d'annuler un vote par correspondance si présent à l'AG.

### Key Entities

- **Document**: Fichier stocké dans la GED. Attributs : nom, type, taille, dossier, visibilité, dateUpload.
- **Dossier**: Conteneur de documents. Attributs : nom, parent, droitsAccès.
- **Relance**: Courrier de relance généré. Attributs : copropriétaireId, type (amiable/mise en demeure), date, statut.
- **Equipement**: Élément de l'immeuble. Attributs : nom, type, dateInstallation, prochaineMaintenance.
- **Intervention**: Travail effectué sur un équipement. Attributs : equipementId, date, prestataire, coût, description.
- **BudgetPrevisionnel**: Budget annuel voté. Attributs : annee, agId, postes[], total.
- **PosteBudget**: Ligne du budget. Attributs : libelle, montantPrevu, montantRealise.
- **Fournisseur**: Prestataire externe. Attributs : nom, activite, contact, email, telephone.
- **Contrat**: Engagement avec un fournisseur. Attributs : fournisseurId, objet, dateDebut, dateFin, montant, taciteReconduction.
- **VoteCorrespondance**: Vote envoyé avant l'AG. Attributs : resolutionId, coproprietaireId, choix, dateVote.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 80% des copropriétaires utilisent l'extranet au moins une fois par trimestre.
- **SC-002**: Le nombre de sollicitations du syndic pour consultation de solde diminue de 70%.
- **SC-003**: 100% des documents obligatoires sont accessibles en ligne.
- **SC-004**: Le taux de recouvrement des impayés s'améliore de 20% grâce aux relances automatisées.
- **SC-005**: Le syndic économise en moyenne 2h par mois grâce à l'automatisation des relances.
- **SC-006**: Le carnet d'entretien est complet et à jour pour 100% des copropriétés utilisatrices.
- **SC-007**: 90% des dépassements budgétaires sont détectés avant la fin du trimestre concerné.
- **SC-008**: Aucune échéance de contrat n'est manquée grâce aux alertes automatiques.
- **SC-009**: Le taux de participation aux AG augmente de 15% grâce au vote par correspondance.

## Planning Prévisionnel

| Phase | Trimestre | Fonctionnalité | Priorité |
|-------|-----------|----------------|----------|
| 1 | Q1 2025 | Extranet Copropriétaires | P1 |
| 2 | Q2 2025 | GED / Documents | P1 |
| 3 | Q2 2025 | Relances Impayés | P2 |
| 4 | Q3 2025 | Carnet d'Entretien | P2 |
| 5 | Q3 2025 | Budget Prévisionnel | P2 |
| 6 | Q4 2025 | Gestion Fournisseurs | P3 |
| 7 | Q4 2025 | Vote par Correspondance | P3 |

## Assumptions

- Les copropriétaires ont une adresse email pour accéder à l'extranet.
- Le stockage cloud gratuit est suffisant pour les documents (limite à définir selon le tier).
- Les modèles de courriers de relance sont conformes à la législation française.
- Le vote par correspondance respecte les dispositions légales (formulaire Cerfa).
