# Feature Specification: GED - Gestion Documentaire avec Dossiers

**Feature Branch**: `010-ged-dossiers`
**Created**: 2025-01-19
**Status**: Draft
**Input**: Phase 2 - GED / Gestion Documentaire avancée: Organisation des documents en dossiers et sous-dossiers, gestion fine des droits d'accès (syndic seul, conseil syndical, tous copropriétaires). Extension de la fonctionnalité documents existante.

## Contexte

La fonctionnalité documents existante (009-extranet-coproprietaires) permet déjà :
- Upload de documents avec catégories (AG, Contrats, Règlement, Travaux, Autres)
- Toggle de visibilité extranet (visible/masqué pour copropriétaires)
- Quota de stockage (500 Mo par copropriété)

Cette phase étend ces fonctionnalités avec :
- Organisation hiérarchique en dossiers et sous-dossiers
- Gestion fine des droits d'accès (syndic seul, conseil syndical, tous copropriétaires)
- Possibilité de créer un conseil syndical avec des membres désignés

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Création et organisation de dossiers (Priority: P1)

En tant que syndic bénévole, je veux organiser mes documents dans une arborescence de dossiers et sous-dossiers pour retrouver facilement les documents et maintenir une structure logique.

**Why this priority**: Sans arborescence, la gestion de nombreux documents devient chaotique. C'est le fondement de la GED.

**Independent Test**: Le syndic peut créer un dossier racine "Contrats 2025", y créer un sous-dossier "Ascenseur", et y déplacer un document existant.

**Acceptance Scenarios**:

1. **Given** je suis syndic sur la page Documents, **When** je clique sur "Nouveau dossier", **Then** je peux saisir un nom et créer un dossier racine.
2. **Given** un dossier existe, **When** je clique sur "Nouveau sous-dossier" dans ce dossier, **Then** je peux créer un sous-dossier à l'intérieur.
3. **Given** un document existe à la racine, **When** je le déplace dans un dossier, **Then** il apparaît dans le dossier et disparaît de la racine.
4. **Given** un dossier contient des documents, **When** je le renomme, **Then** le nouveau nom est affiché et les documents restent à l'intérieur.
5. **Given** un dossier est vide, **When** je le supprime, **Then** il disparaît de l'arborescence.
6. **Given** un dossier contient des éléments, **When** je tente de le supprimer, **Then** un message m'avertit que le dossier n'est pas vide et me demande confirmation.

---

### User Story 2 - Gestion des droits d'accès par dossier (Priority: P1)

En tant que syndic bénévole, je veux définir qui peut voir chaque dossier (syndic seul, conseil syndical, tous copropriétaires) pour partager les documents appropriés avec les bonnes personnes.

**Why this priority**: La confidentialité des documents est essentielle. Certains documents (devis en cours, contentieux) ne doivent pas être visibles par tous.

**Independent Test**: Le syndic crée un dossier "Contentieux" avec accès "Syndic seul", et vérifie qu'un membre du conseil syndical ne le voit pas.

**Acceptance Scenarios**:

1. **Given** je crée un nouveau dossier, **When** je définis sa visibilité, **Then** je peux choisir entre "Syndic seul", "Conseil syndical", ou "Tous les copropriétaires".
2. **Given** un dossier a l'accès "Syndic seul", **When** un membre du conseil syndical consulte Documents, **Then** ce dossier n'apparaît pas dans sa vue.
3. **Given** un dossier a l'accès "Conseil syndical", **When** un copropriétaire standard consulte Documents, **Then** ce dossier n'apparaît pas.
4. **Given** un dossier a l'accès "Tous les copropriétaires", **When** n'importe quel copropriétaire consulte Documents, **Then** ce dossier est visible.
5. **Given** un dossier existe avec un accès défini, **When** je modifie son niveau d'accès, **Then** le changement s'applique immédiatement.
6. **Given** un dossier parent a l'accès "Conseil syndical", **When** je crée un sous-dossier, **Then** il hérite par défaut du même niveau d'accès (modifiable).

---

### User Story 3 - Constitution du conseil syndical (Priority: P2)

En tant que syndic bénévole, je veux désigner les membres du conseil syndical parmi les copropriétaires pour qu'ils puissent accéder aux documents qui leur sont réservés.

**Why this priority**: Nécessaire pour que les droits "Conseil syndical" fonctionnent. Sans membres désignés, ce niveau d'accès serait inutile.

**Independent Test**: Le syndic désigne 3 copropriétaires comme membres du conseil syndical, et vérifie qu'ils voient les dossiers réservés au conseil.

**Acceptance Scenarios**:

1. **Given** je suis syndic, **When** j'accède aux paramètres de la copropriété, **Then** je vois une section "Conseil syndical".
2. **Given** je suis sur la section Conseil syndical, **When** j'ajoute un copropriétaire comme membre, **Then** il apparaît dans la liste des membres du conseil.
3. **Given** un copropriétaire est membre du conseil, **When** il se connecte à l'extranet, **Then** il voit les dossiers avec accès "Conseil syndical".
4. **Given** un copropriétaire est membre du conseil, **When** je le retire du conseil, **Then** il ne voit plus les dossiers réservés au conseil.
5. **Given** je désigne un président du conseil, **When** je consulte la liste, **Then** il est marqué comme "Président".

---

### User Story 4 - Navigation dans l'arborescence (Priority: P2)

En tant qu'utilisateur (syndic ou copropriétaire), je veux naviguer facilement dans l'arborescence des dossiers pour trouver rapidement les documents.

**Why this priority**: Une bonne navigation est essentielle pour l'utilisabilité. Sans elle, l'arborescence devient un obstacle plutôt qu'une aide.

**Independent Test**: L'utilisateur peut naviguer jusqu'à un sous-dossier profond, voir le fil d'Ariane, et revenir à la racine en un clic.

**Acceptance Scenarios**:

1. **Given** je suis sur la page Documents, **When** je clique sur un dossier, **Then** je vois son contenu (sous-dossiers et documents).
2. **Given** je suis dans un sous-dossier, **When** je regarde en haut de page, **Then** je vois un fil d'Ariane (breadcrumb) montrant le chemin.
3. **Given** je suis dans un sous-dossier profond, **When** je clique sur un élément du fil d'Ariane, **Then** je navigue directement à ce niveau.
4. **Given** je suis dans un dossier, **When** je clique sur "Retour" ou l'icône parent, **Then** je remonte d'un niveau.
5. **Given** je recherche un document, **When** je saisis un terme de recherche, **Then** les résultats montrent le chemin complet de chaque document trouvé.

---

### User Story 5 - Upload de documents dans un dossier (Priority: P2)

En tant que syndic, je veux uploader des documents directement dans un dossier pour éviter de devoir les déplacer après coup.

**Why this priority**: Améliore l'ergonomie et réduit les manipulations.

**Independent Test**: Le syndic ouvre un dossier, clique sur "Ajouter un document", et le document apparaît directement dans ce dossier.

**Acceptance Scenarios**:

1. **Given** je suis dans un dossier, **When** je clique sur "Ajouter un document", **Then** le document uploadé est placé dans ce dossier.
2. **Given** j'uploade un document dans un dossier avec accès restreint, **When** l'upload est terminé, **Then** le document hérite des droits d'accès du dossier.
3. **Given** je suis à la racine, **When** j'uploade un document, **Then** il est placé à la racine (comportement actuel conservé).

---

### Edge Cases

- **Dossier avec sous-dossiers non vides**: La suppression d'un dossier parent doit demander confirmation et supprimer récursivement tout le contenu.
- **Changement de droits sur un dossier parent**: Les sous-dossiers conservent leurs droits propres (pas d'héritage forcé après création).
- **Copropriétaire retiré du conseil syndical**: Il perd immédiatement l'accès aux documents réservés au conseil (pas de cache).
- **Profondeur maximale**: L'arborescence est limitée à 3 niveaux de profondeur (racine + 2 niveaux) pour éviter la complexité excessive.
- **Dossier sans nom**: Un nom de dossier est obligatoire et doit contenir au moins 1 caractère (espaces seuls refusés).
- **Caractères spéciaux dans le nom**: Les noms de dossiers acceptent lettres, chiffres, espaces, tirets et underscores uniquement.

## Requirements *(mandatory)*

### Functional Requirements

**Gestion des dossiers**
- **FR-001**: Le système DOIT permettre au syndic de créer des dossiers à la racine.
- **FR-002**: Le système DOIT permettre au syndic de créer des sous-dossiers dans un dossier existant.
- **FR-003**: Le système DOIT limiter la profondeur d'arborescence à 3 niveaux maximum.
- **FR-004**: Le système DOIT permettre de renommer un dossier.
- **FR-005**: Le système DOIT permettre de supprimer un dossier vide.
- **FR-006**: Le système DOIT demander confirmation avant de supprimer un dossier contenant des éléments.
- **FR-007**: Le système DOIT permettre de déplacer un document d'un dossier à un autre.

**Droits d'accès**
- **FR-008**: Le système DOIT proposer 3 niveaux d'accès pour chaque dossier : "Syndic seul", "Conseil syndical", "Tous les copropriétaires".
- **FR-009**: Le système DOIT appliquer les droits d'accès à l'affichage des dossiers et documents.
- **FR-010**: Le système DOIT permettre de modifier le niveau d'accès d'un dossier existant.
- **FR-011**: Un nouveau sous-dossier DOIT hériter par défaut du niveau d'accès de son parent.
- **FR-012**: Un document uploadé DOIT hériter du niveau d'accès du dossier dans lequel il est placé.

**Conseil syndical**
- **FR-013**: Le système DOIT permettre au syndic de désigner des copropriétaires comme membres du conseil syndical.
- **FR-014**: Le système DOIT permettre de désigner un président du conseil syndical parmi les membres.
- **FR-015**: Le système DOIT permettre de retirer un membre du conseil syndical.
- **FR-016**: Les membres du conseil syndical DOIVENT voir les dossiers avec accès "Conseil syndical".

**Navigation et recherche**
- **FR-017**: Le système DOIT afficher un fil d'Ariane (breadcrumb) lors de la navigation.
- **FR-018**: Le système DOIT permettre de naviguer via le fil d'Ariane.
- **FR-019**: La recherche de documents DOIT afficher le chemin complet de chaque résultat.

**Intégration avec l'existant**
- **FR-020**: Le système DOIT conserver la compatibilité avec les documents existants (sans dossier = racine).
- **FR-021**: Le système DOIT conserver le système de catégories existant (en complément des dossiers).
- **FR-022**: Le système DOIT conserver le quota de stockage existant (500 Mo par copropriété).

### Key Entities

- **Dossier**: Conteneur de documents et sous-dossiers. Attributs : nom, parentId (null si racine), niveauAcces, coproprieteId, createdAt, updatedAt.
- **NiveauAcces**: Énumération des droits d'accès : "syndic", "conseil", "tous".
- **MembreConseil**: Association entre un copropriétaire et le conseil syndical. Attributs : coproprietaireId, coproprieteId, estPresident, dateNomination.
- **DocumentPartage** (existant, modifié): Ajout de l'attribut dossierId (null si racine), le niveauAcces remplace visibleExtranet.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Le syndic peut créer une arborescence de 3 niveaux en moins de 2 minutes.
- **SC-002**: Un copropriétaire standard ne voit jamais les dossiers marqués "Syndic seul" ou "Conseil syndical".
- **SC-003**: 100% des membres du conseil syndical désignés voient les dossiers qui leur sont réservés.
- **SC-004**: La navigation jusqu'à un document en sous-dossier prend moins de 3 clics depuis la racine.
- **SC-005**: Le fil d'Ariane est visible à tout moment lors de la navigation dans les dossiers.
- **SC-006**: La recherche de documents retourne des résultats avec chemin complet en moins de 2 secondes.
- **SC-007**: Les documents existants (sans dossier) restent accessibles sans modification.

## Assumptions

- Les catégories existantes (AG, Contrats, Règlement, Travaux, Autres) sont conservées comme métadonnée des documents, indépendamment de leur emplacement dans l'arborescence.
- Un document ne peut être que dans un seul dossier à la fois (pas de multi-classement).
- La profondeur maximale de 3 niveaux est suffisante pour les besoins d'une copropriété standard.
- Le conseil syndical est optionnel - une copropriété peut fonctionner sans conseil désigné.
- Le quota de stockage (500 Mo) s'applique à l'ensemble des documents, indépendamment de leur organisation en dossiers.
