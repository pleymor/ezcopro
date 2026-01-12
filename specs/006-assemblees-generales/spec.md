# Feature Specification: Gestion des Assemblées Générales

**Feature Branch**: `006-assemblees-generales`
**Created**: 2025-01-12
**Status**: Draft
**Input**: User description: "Gestion des Assemblées Générales de copropriété - Phase 2"

## Contexte

Les assemblées générales (AG) sont une obligation légale annuelle pour toute copropriété. Le syndic doit convoquer les copropriétaires, préparer l'ordre du jour, organiser les votes selon les règles de majorité définies par la loi de 1965, et rédiger le procès-verbal. Cette fonctionnalité s'appuie sur les données existantes (copropriétaires, lots, tantièmes) pour automatiser et sécuriser ce processus.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Créer une assemblée générale (Priority: P1)

En tant que syndic bénévole, je veux créer une nouvelle assemblée générale avec sa date, son lieu et son type pour planifier la réunion annuelle obligatoire.

**Why this priority**: Sans AG créée, aucune autre fonctionnalité n'est possible. C'est le point d'entrée de tout le module.

**Independent Test**: Créer une AG et vérifier qu'elle apparaît dans la liste des assemblées.

**Acceptance Scenarios**:

1. **Given** je suis sur la page des assemblées générales, **When** je clique sur "Nouvelle AG" et je remplis la date, l'heure, le lieu et le type (ordinaire/extraordinaire), **Then** l'AG est créée et visible dans la liste.
2. **Given** je crée une AG, **When** la date est dans moins de 21 jours, **Then** je vois un avertissement m'indiquant que le délai légal de convocation pourrait ne pas être respecté.
3. **Given** des AG existent, **When** j'accède à la liste, **Then** je vois les AG triées par date (prochaines en premier) avec leur statut (brouillon, convoquée, terminée).

---

### User Story 2 - Construire l'ordre du jour (Priority: P1)

En tant que syndic bénévole, je veux ajouter des résolutions à l'ordre du jour de l'AG pour définir les sujets qui seront votés.

**Why this priority**: L'ordre du jour est obligatoire dans la convocation. Sans résolutions, l'AG n'a pas de contenu.

**Independent Test**: Ajouter plusieurs résolutions à une AG et vérifier qu'elles sont listées dans l'ordre.

**Acceptance Scenarios**:

1. **Given** je suis sur le détail d'une AG, **When** je clique sur "Ajouter une résolution" et je saisis le titre, la description et le type de majorité requis, **Then** la résolution est ajoutée à l'ordre du jour.
2. **Given** l'ordre du jour contient plusieurs résolutions, **When** je consulte l'AG, **Then** je vois les résolutions numérotées dans l'ordre avec leur type de majorité.
3. **Given** une résolution existe, **When** je la modifie ou la supprime, **Then** les changements sont enregistrés et la numérotation est mise à jour.
4. **Given** je crée une résolution, **When** je sélectionne le type de majorité, **Then** je peux choisir parmi : Article 24 (majorité simple), Article 25 (majorité absolue), Article 26 (double majorité), Unanimité.

---

### User Story 3 - Gérer la feuille de présence (Priority: P1)

En tant que syndic bénévole, je veux enregistrer les présents, représentés et absents à l'AG pour calculer les quorums et les résultats de vote.

**Why this priority**: La feuille de présence est obligatoire et conditionne la validité des votes. C'est le cœur du fonctionnement de l'AG.

**Independent Test**: Marquer des copropriétaires comme présents et vérifier que le total des tantièmes présents/représentés est calculé.

**Acceptance Scenarios**:

1. **Given** je suis sur la feuille de présence d'une AG, **When** je consulte la liste, **Then** je vois tous les copropriétaires avec leurs tantièmes et leur statut par défaut (absent).
2. **Given** un copropriétaire, **When** je le marque comme "présent", **Then** ses tantièmes sont ajoutés au total des présents.
3. **Given** un copropriétaire absent, **When** je le marque comme "représenté par" et je sélectionne un autre copropriétaire, **Then** ses tantièmes sont ajoutés aux tantièmes du représentant pour les votes.
4. **Given** la feuille de présence est remplie, **When** je consulte le récapitulatif, **Then** je vois : nombre de présents, nombre de représentés, nombre d'absents, total des tantièmes présents/représentés, pourcentage du total.

---

### User Story 4 - Voter sur les résolutions (Priority: P1)

En tant que syndic bénévole, je veux enregistrer les votes pour chaque résolution et voir si elle est adoptée ou rejetée selon la majorité requise.

**Why this priority**: Le vote est la raison d'être de l'AG. Sans enregistrement des votes, l'AG ne produit aucune décision.

**Independent Test**: Voter sur une résolution et vérifier que le résultat (adopté/rejeté) est calculé correctement selon la majorité.

**Acceptance Scenarios**:

1. **Given** je suis sur l'écran de vote d'une résolution, **When** je consulte la liste des votants, **Then** je vois tous les copropriétaires présents/représentés avec leurs tantièmes, et je peux naviguer vers la résolution précédente/suivante.
2. **Given** une résolution affichée, **When** j'enregistre le vote de chaque copropriétaire (pour, contre, abstention), **Then** les tantièmes sont comptabilisés dans chaque catégorie.
3. **Given** tous les votes sont enregistrés, **When** je valide le vote, **Then** le système calcule si la résolution est adoptée ou rejetée selon la règle de majorité applicable.
4. **Given** une résolution à l'article 25 n'atteint pas la majorité absolue mais obtient au moins 1/3 des voix, **When** je consulte le résultat, **Then** le système m'indique qu'un second vote à l'article 24 est possible.

---

### User Story 5 - Générer la convocation (Priority: P2)

En tant que syndic bénévole, je veux générer un document de convocation prêt à envoyer aux copropriétaires pour respecter mes obligations légales.

**Why this priority**: Important pour la conformité légale mais l'AG peut fonctionner sans génération automatique (convocation manuelle possible).

**Independent Test**: Générer une convocation et vérifier qu'elle contient toutes les informations légales requises.

**Acceptance Scenarios**:

1. **Given** une AG avec un ordre du jour, **When** je clique sur "Générer la convocation", **Then** un document est généré avec : date/heure/lieu, ordre du jour complet avec résolutions, formulaire de pouvoir.
2. **Given** je génère une convocation, **When** le document est prêt, **Then** je peux le télécharger ou le visualiser.
3. **Given** je génère la convocation, **When** je la valide, **Then** le statut de l'AG passe à "Convoquée" et la date de convocation est enregistrée.

---

### User Story 6 - Générer le procès-verbal (Priority: P2)

En tant que syndic bénévole, je veux générer le procès-verbal de l'AG avec tous les résultats de vote pour archiver les décisions prises.

**Why this priority**: Le PV est obligatoire dans le mois suivant l'AG. Fonctionnalité importante mais post-AG.

**Independent Test**: Générer un PV après une AG et vérifier qu'il contient la feuille de présence et tous les résultats de vote.

**Acceptance Scenarios**:

1. **Given** une AG terminée avec tous les votes enregistrés, **When** je clique sur "Générer le PV", **Then** un document est généré avec : feuille de présence, résultats de chaque vote (pour/contre/abstention en tantièmes), mention adopté/rejeté.
2. **Given** je génère le PV, **When** je le valide, **Then** le statut de l'AG passe à "Terminée" et le PV est archivé.
3. **Given** le PV est généré, **When** je le consulte, **Then** je vois la liste des copropriétaires opposants et défaillants (pour notification obligatoire).

---

### User Story 7 - Consulter l'historique des AG (Priority: P3)

En tant que syndic bénévole, je veux consulter les AG passées et leurs décisions pour retrouver l'historique des votes.

**Why this priority**: Utile pour la traçabilité mais pas bloquant pour le fonctionnement courant.

**Independent Test**: Consulter une AG passée et voir ses résolutions et résultats.

**Acceptance Scenarios**:

1. **Given** des AG passées existent, **When** j'accède à l'historique, **Then** je vois la liste des AG terminées avec leur date et nombre de résolutions.
2. **Given** je clique sur une AG passée, **When** je consulte le détail, **Then** je vois l'ordre du jour, la feuille de présence et les résultats de chaque vote.

---

### Edge Cases

- Que se passe-t-il si un copropriétaire n'a pas de lot au moment de l'AG ? → Il n'apparaît pas dans la feuille de présence (pas de droit de vote sans tantièmes).
- Que se passe-t-il si un copropriétaire se représente lui-même et représente quelqu'un d'autre ? → Ses tantièmes propres + les tantièmes du représenté sont cumulés pour ses votes.
- Que se passe-t-il si personne n'est présent/représenté ? → L'AG ne peut pas se tenir, le système empêche de passer aux votes.
- Que se passe-t-il si on modifie l'ordre du jour après la convocation ? → Avertissement que la convocation devra être renvoyée.
- Comment gérer un copropriétaire qui arrive en retard ? → Il peut être marqué présent, ses votes ne comptent que pour les résolutions votées après son arrivée (gestion manuelle).

## Requirements *(mandatory)*

### Functional Requirements

**Gestion des AG**
- **FR-001**: Le système DOIT permettre de créer une AG avec : date, heure, lieu, type (ordinaire/extraordinaire).
- **FR-002**: Le système DOIT afficher la liste des AG triées par date avec leur statut.
- **FR-003**: Le système DOIT permettre de modifier ou supprimer une AG en brouillon.
- **FR-004**: Le système DOIT avertir si le délai légal de 21 jours avant l'AG n'est pas respecté.

**Ordre du jour**
- **FR-005**: Le système DOIT permettre d'ajouter des résolutions à l'ordre du jour avec : numéro, titre, description, type de majorité, clé de répartition (défaut: tantièmes généraux).
- **FR-006**: Le système DOIT supporter les types de majorité : Article 24, Article 25, Article 26, Unanimité.
- **FR-007**: Le système DOIT permettre de réordonner, modifier et supprimer les résolutions.
- **FR-008**: Le système DOIT numéroter automatiquement les résolutions.

**Feuille de présence**
- **FR-009**: Le système DOIT afficher tous les copropriétaires avec lots et leurs tantièmes.
- **FR-010**: Le système DOIT permettre de marquer chaque copropriétaire comme : présent, représenté (avec choix du représentant), absent.
- **FR-011**: Le système DOIT calculer le total des tantièmes présents/représentés.
- **FR-012**: Le système DOIT empêcher un copropriétaire de représenter plus de 3 personnes (limite légale, sauf conjoint).

**Votes**
- **FR-013**: Le système DOIT permettre d'enregistrer le vote de chaque présent/représenté : pour, contre, abstention.
- **FR-014**: Le système DOIT calculer automatiquement si une résolution est adoptée selon sa majorité.
- **FR-015**: Le système DOIT appliquer les règles de majorité :
  - Article 24 : majorité des voix exprimées des présents/représentés
  - Article 25 : majorité absolue de tous les tantièmes (>50%)
  - Article 26 : majorité des membres représentant 2/3 des tantièmes
  - Unanimité : 100% des tantièmes
- **FR-016**: Le système DOIT identifier les copropriétaires opposants (vote contre) et défaillants (absents non représentés).

**Documents**
- **FR-017**: Le système DOIT générer une convocation contenant : date/heure/lieu, ordre du jour, formulaire de pouvoir.
- **FR-018**: Le système DOIT générer un procès-verbal contenant : feuille de présence, résultats détaillés de chaque vote.
- **FR-019**: Le système DOIT permettre de télécharger les documents générés.

**Workflow**
- **FR-020**: Le système DOIT gérer les statuts d'AG : Brouillon → Convoquée → En cours → Terminée.
- **FR-020a**: La transition Convoquée → En cours se fait via un bouton "Démarrer l'AG" après validation de la feuille de présence.
- **FR-021**: Le système DOIT archiver les AG terminées avec toutes leurs données.

### Key Entities

- **AssembleeGenerale**: Réunion des copropriétaires. Attributs : date, heure, lieu, type (ordinaire/extraordinaire), statut, dateConvocation.
- **Resolution**: Point à voter lors de l'AG. Attributs : numéro, titre, description, typeMajorite, cleRepartition (défaut: tantièmes généraux), resultat (adopté/rejeté/non voté).
- **Presence**: Participation d'un copropriétaire à l'AG. Attributs : coproprietaireId, statut (présent/représenté/absent), representePar (si représenté), tantièmes (somme des lots selon clé de répartition).
- **Vote**: Vote d'un participant sur une résolution. Attributs : resolutionId, coproprietaireId, choix (pour/contre/abstention), tantièmes (calculés selon clé de répartition applicable à la résolution).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un syndic peut créer une AG et son ordre du jour complet en moins de 15 minutes.
- **SC-002**: La feuille de présence avec calcul des tantièmes s'affiche en moins de 2 secondes.
- **SC-003**: Le résultat d'un vote (adopté/rejeté) est calculé instantanément après enregistrement des votes.
- **SC-004**: 100% des calculs de majorité sont conformes aux règles légales (articles 24, 25, 26).
- **SC-005**: Les documents générés (convocation, PV) contiennent toutes les mentions légales obligatoires.
- **SC-006**: L'historique des AG passées est consultable sans limite de temps.

## Clarifications

### Session 2025-01-12

- Q: Comment comptabiliser les tantièmes pour le vote quand un copropriétaire a plusieurs lots ? → A: Somme des tantièmes de tous les lots du copropriétaire selon la clé de répartition applicable.
- Q: Quel mode d'interaction pour la saisie des votes pendant l'AG ? → A: Un écran par résolution avec navigation séquentielle.
- Q: Quel format de sortie pour la génération des documents (convocation, PV) ? → A: Impression navigateur (CSS print + window.print()).
- Q: Qu'est-ce qui déclenche le passage du statut "Convoquée" à "En cours" ? → A: Bouton explicite "Démarrer l'AG" après validation de la feuille de présence.
- Q: Comment déterminer quelle clé de répartition utiliser pour chaque résolution ? → A: Associer une clé de répartition à chaque résolution (avec défaut: tantièmes généraux).
- Q: D'où proviennent les clés de répartition disponibles ? → A: Gérées dans un module séparé de configuration.
- Q: Le module de configuration des clés fait-il partie de cette feature ? → A: Hors scope - on suppose que les clés existent déjà (mock/seed data).

## Assumptions

- Les copropriétaires et lots avec tantièmes sont déjà enregistrés dans le système.
- Les clés de répartition existent déjà dans le système (mock/seed data pour cette feature ; module de gestion à développer séparément).
- Le syndic est responsable de l'envoi effectif des convocations (le système génère le document mais n'envoie pas).
- Les votes sont enregistrés manuellement par le syndic pendant l'AG (pas de vote en ligne dans cette version).
- Un seul scrutin par résolution (pas de second tour automatique article 25 → 24).
- Les documents sont générés via impression navigateur (CSS print + window.print()), permettant sauvegarde PDF via la boîte de dialogue.

## Out of Scope

- Module de gestion des clés de répartition (CRUD) - feature séparée ; mock/seed data utilisé pour les AG.
- Vote en ligne / vote par correspondance avant l'AG - fonctionnalité future.
- Envoi automatique des convocations par email/courrier - fonctionnalité future.
- Signature électronique de la feuille de présence - fonctionnalité future.
- Visioconférence intégrée - fonctionnalité future.
- Gestion du second tour automatique (article 25 → 24) - fonctionnalité future.
- Notifications automatiques aux opposants/défaillants - fonctionnalité future.
