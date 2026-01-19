# Feature Specification: Extranet Copropriétaires

**Feature Branch**: `009-extranet-coproprietaires`
**Created**: 2025-01-16
**Status**: Draft
**Input**: Espace personnel en ligne pour les copropriétaires permettant de consulter leur solde, leurs appels de fonds, l'historique des paiements et les documents partagés par le syndic.

## Contexte

Les copropriétaires ont besoin d'un accès autonome à leurs informations financières et aux documents de la copropriété. Actuellement, ils doivent contacter le syndic bénévole pour chaque demande d'information, ce qui représente une charge de travail importante pour ce dernier. Un espace personnel en ligne permettra le self-service et réduira les sollicitations.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultation du solde et des appels de fonds (Priority: P1)

En tant que copropriétaire, je veux consulter mon solde actuel et mes derniers appels de fonds pour savoir où j'en suis financièrement vis-à-vis de la copropriété.

**Why this priority**: C'est le besoin principal des copropriétaires et la raison la plus fréquente de sollicitation du syndic. Permet de réduire immédiatement la charge du syndic bénévole.

**Independent Test**: Un copropriétaire peut se connecter et consulter son solde actuel ainsi que ses 3 derniers appels de fonds.

**Acceptance Scenarios**:

1. **Given** je suis un copropriétaire avec un compte actif, **When** je me connecte à mon espace, **Then** je vois mon solde actuel (créditeur ou débiteur) affiché clairement.
2. **Given** je suis sur mon espace personnel, **When** je consulte mes appels de fonds, **Then** je vois la liste de mes appels avec pour chacun : trimestre concerné, montant appelé, montant réglé, statut (réglé/en attente/en retard).
3. **Given** j'ai des appels de fonds, **When** je clique sur un appel, **Then** je vois le détail par poste de charges (charges générales, chauffage, eau, etc.).
4. **Given** mon solde est débiteur, **When** j'affiche mon solde, **Then** je vois une indication visuelle claire que je suis en retard de paiement.

---

### User Story 2 - Consultation de l'historique des paiements (Priority: P1)

En tant que copropriétaire, je veux consulter l'historique de tous mes paiements pour vérifier que mes règlements ont bien été enregistrés.

**Why this priority**: Complémentaire au solde, l'historique des paiements est essentiel pour la transparence financière et évite les litiges.

**Independent Test**: Un copropriétaire peut voir la liste de tous ses paiements avec dates et montants.

**Acceptance Scenarios**:

1. **Given** je suis sur mon espace personnel, **When** je consulte mon historique de paiements, **Then** je vois la liste de tous mes paiements avec date, montant et mode de paiement.
2. **Given** j'ai effectué des paiements, **When** je filtre par période, **Then** je vois uniquement les paiements de la période sélectionnée.
3. **Given** je suis sur l'historique, **When** je télécharge un justificatif, **Then** je reçois un PDF récapitulatif de mes paiements.

---

### User Story 3 - Accès aux documents partagés (Priority: P2)

En tant que copropriétaire, je veux accéder aux documents de la copropriété (PV d'AG, règlement, contrats importants) pour les consulter à tout moment sans déranger le syndic.

**Why this priority**: Les documents sont une obligation légale et un besoin récurrent, mais moins fréquent que la consultation financière.

**Independent Test**: Un copropriétaire peut consulter et télécharger les documents partagés par le syndic.

**Acceptance Scenarios**:

1. **Given** je suis sur mon espace personnel, **When** je consulte la section Documents, **Then** je vois les documents partagés organisés par catégorie (AG, Contrats, Règlement, Travaux).
2. **Given** des documents sont disponibles, **When** je clique sur un document, **Then** je peux le visualiser ou le télécharger.
3. **Given** un document est volumineux (> 5 Mo), **When** je clique dessus, **Then** il se télécharge directement sans prévisualisation.
4. **Given** le syndic a partagé un nouveau document, **When** je me connecte, **Then** je vois une indication "Nouveau" sur le document.

---

### User Story 4 - Invitation et création de compte copropriétaire (Priority: P1)

En tant que syndic, je veux inviter un copropriétaire à créer son compte sur l'extranet pour qu'il puisse accéder à ses informations de manière autonome.

**Why this priority**: Sans cette fonctionnalité, les copropriétaires ne peuvent pas accéder à l'extranet. C'est un prérequis fonctionnel.

**Independent Test**: Le syndic peut envoyer une invitation et le copropriétaire peut créer son compte.

**Acceptance Scenarios**:

1. **Given** je suis syndic et un copropriétaire a une adresse email renseignée, **When** je clique sur "Inviter sur l'extranet", **Then** un email d'invitation est envoyé au copropriétaire.
2. **Given** je suis copropriétaire et j'ai reçu une invitation, **When** je clique sur le lien, **Then** je peux créer mon mot de passe et accéder à mon espace.
3. **Given** un copropriétaire a déjà un compte, **When** j'essaie de l'inviter à nouveau, **Then** le système m'indique que ce copropriétaire a déjà accès.
4. **Given** le lien d'invitation a plus de 7 jours, **When** le copropriétaire clique dessus, **Then** le système indique que le lien a expiré et propose de demander une nouvelle invitation.

---

### User Story 5 - Partage de documents par le syndic (Priority: P2)

En tant que syndic, je veux partager des documents avec les copropriétaires pour qu'ils puissent y accéder depuis leur espace personnel.

**Why this priority**: Complémentaire à l'accès documents côté copropriétaire. Dépend de la GED (issue #10) pour une gestion complète, mais une version simplifiée peut être intégrée.

**Independent Test**: Le syndic peut uploader un document et le rendre visible aux copropriétaires.

**Acceptance Scenarios**:

1. **Given** je suis syndic sur la page de gestion documentaire, **When** j'uploade un document et coche "Visible sur l'extranet", **Then** le document apparaît dans l'espace des copropriétaires.
2. **Given** un document est partagé, **When** je décoche "Visible sur l'extranet", **Then** le document n'est plus visible par les copropriétaires.
3. **Given** j'uploade un document, **When** je choisis une catégorie, **Then** le document est classé dans cette catégorie pour les copropriétaires.

---

### User Story 6 - Notifications de nouveaux documents (Priority: P3)

En tant que copropriétaire, je veux être notifié quand un nouveau document est partagé pour ne pas manquer d'information importante.

**Why this priority**: Améliore l'expérience mais n'est pas critique pour la valeur principale de consultation.

**Independent Test**: Un copropriétaire reçoit une notification email quand un document est partagé.

**Acceptance Scenarios**:

1. **Given** le syndic partage un nouveau document, **When** le document est marqué comme partagé, **Then** tous les copropriétaires avec un compte actif reçoivent une notification email.
2. **Given** je suis copropriétaire, **When** je configure mes préférences, **Then** je peux activer ou désactiver les notifications par email.
3. **Given** j'ai désactivé les notifications, **When** un document est partagé, **Then** je ne reçois pas d'email mais je vois toujours l'indicateur "Nouveau" sur l'extranet.

---

### Edge Cases

- Que se passe-t-il si un copropriétaire n'a pas d'email ? → Il ne peut pas accéder à l'extranet. Le syndic doit lui communiquer les informations par un autre moyen.
- Que se passe-t-il si un lot change de propriétaire ? → Le nouveau copropriétaire doit être invité séparément, l'ancien compte est désactivé par le syndic.
- Que se passe-t-il si un copropriétaire oublie son mot de passe ? → Un processus standard de réinitialisation par email est disponible.
- Que se passe-t-il si un copropriétaire possède plusieurs lots ? → Un seul compte avec la vue consolidée de tous ses lots.
- Que se passe-t-il si le syndic change ? → Le nouveau syndic conserve l'accès admin, les comptes copropriétaires restent actifs.
- Que se passe-t-il si l'upload d'un document dépasse le quota de 500 Mo ? → L'upload est bloqué avec un message d'erreur explicite indiquant l'espace restant disponible.

## Requirements *(mandatory)*

### Functional Requirements

**Accès et Authentification**
- **FR-001**: Le système DOIT permettre au syndic d'inviter un copropriétaire à créer son compte via email.
- **FR-002**: Le système DOIT permettre au copropriétaire de créer son compte via un lien d'invitation sécurisé.
- **FR-003**: Les liens d'invitation DOIVENT expirer après 7 jours.
- **FR-004**: Le système DOIT permettre au copropriétaire de réinitialiser son mot de passe.
- **FR-005**: Le copropriétaire DOIT uniquement voir les données de ses propres lots.

**Consultation Financière**
- **FR-006**: Le système DOIT afficher le solde actuel du copropriétaire (créditeur ou débiteur).
- **FR-007**: Le système DOIT afficher la liste des appels de fonds avec leur statut (réglé, en attente, en retard).
- **FR-008**: Le système DOIT permettre de voir le détail d'un appel de fonds par poste de charges.
- **FR-009**: Le système DOIT afficher l'historique des paiements avec date, montant et mode de paiement.
- **FR-010**: Le système DOIT permettre de filtrer l'historique par période.
- **FR-011**: Le système DOIT permettre de télécharger un justificatif PDF des paiements.

**Documents**
- **FR-012**: Le système DOIT permettre au syndic de partager des documents sur l'extranet.
- **FR-013**: Le système DOIT organiser les documents par catégorie (AG, Contrats, Règlement, Travaux, Autres).
- **FR-014**: Le système DOIT permettre au copropriétaire de consulter et télécharger les documents partagés.
- **FR-015**: Le système DOIT indiquer visuellement les documents non encore consultés ("Nouveau").

**Notifications**
- **FR-016**: Le système DOIT envoyer une notification email lors du partage d'un nouveau document.
- **FR-017**: Le système DOIT permettre au copropriétaire de désactiver les notifications email.

**Gestion par le syndic**
- **FR-018**: Le syndic DOIT pouvoir voir la liste des copropriétaires ayant accès à l'extranet.
- **FR-019**: Le syndic DOIT pouvoir désactiver l'accès d'un copropriétaire.
- **FR-020**: Le syndic DOIT pouvoir renvoyer une invitation si elle a expiré.

### Key Entities

- **CompteCoproprietaire**: Compte d'accès à l'extranet. Attributs : id, email, coproprietaireId, statut (actif/désactivé), dateCreation, derniereConnexion, notificationsEmail (boolean).
- **InvitationExtranet**: Invitation à créer un compte. Attributs : id, email, coproprietaireId, token, dateEnvoi, dateExpiration, statut (en attente/acceptée/expirée).
- **DocumentPartage**: Document visible sur l'extranet. Attributs : documentId, datePartage, categorie, consultéPar[] (liste des comptes ayant consulté).
- **PreferencesNotification**: Préférences de notification du copropriétaire. Attributs : compteId, emailNouveauxDocuments (boolean).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 80% des copropriétaires invités créent leur compte dans les 30 jours suivant l'invitation.
- **SC-002**: Les copropriétaires accèdent à leur solde en moins de 10 secondes après connexion.
- **SC-003**: 80% des copropriétaires utilisent l'extranet au moins une fois par trimestre.
- **SC-004**: Le nombre de sollicitations du syndic pour consultation de solde diminue de 70%.
- **SC-005**: 100% des documents partagés sont accessibles en lecture/téléchargement par les copropriétaires.
- **SC-006**: Les copropriétaires peuvent consulter l'intégralité de leur historique financier (appels et paiements).

## Assumptions

- Les copropriétaires ont une adresse email valide renseignée dans le système.
- Le système d'authentification existant (Firebase Auth) sera utilisé pour les comptes copropriétaires.
- Les données financières (solde, appels, paiements) existent déjà dans le système via les modules existants.
- La fonctionnalité GED complète (issue #10) n'est pas un prérequis ; une gestion documentaire simplifiée suffit pour cette phase.
- Le stockage documents est limité à 500 Mo par copropriété.
- L'extranet copropriétaires utilise la même URL que l'application syndic, avec un routage basé sur le rôle de l'utilisateur connecté.

## Clarifications

### Session 2025-01-16

- Q: Quelle limite de stockage par copropriété pour les documents partagés ? → A: 500 Mo par copropriété
- Q: Comment les copropriétaires accèdent-ils à leur espace ? → A: URL unique avec routage basé sur le rôle (syndic vs copropriétaire)
- Q: Que se passe-t-il si l'upload dépasse le quota de 500 Mo ? → A: Bloquer l'upload avec message d'erreur explicite
