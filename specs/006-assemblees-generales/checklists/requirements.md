# Quality Checklist: Gestion des Assemblées Générales

## Spec Completeness

- [x] User scenarios with acceptance criteria defined
- [x] Priority levels assigned (P1-P3)
- [x] Functional requirements listed with IDs
- [x] Key entities identified
- [x] Success criteria measurable
- [x] Edge cases documented
- [x] Assumptions stated
- [x] Out of scope items listed

## User Stories Coverage

| Story | Priority | Acceptance Scenarios | Testable |
|-------|----------|---------------------|----------|
| US1 - Créer une AG | P1 | 3 | ✓ |
| US2 - Ordre du jour | P1 | 4 | ✓ |
| US3 - Feuille de présence | P1 | 4 | ✓ |
| US4 - Voter sur résolutions | P1 | 4 | ✓ |
| US5 - Générer convocation | P2 | 3 | ✓ |
| US6 - Générer PV | P2 | 3 | ✓ |
| US7 - Historique AG | P3 | 2 | ✓ |

## Functional Requirements Traceability

| Requirement | Description | User Story |
|-------------|-------------|------------|
| FR-001 | Créer AG avec date, heure, lieu, type | US1 |
| FR-002 | Liste des AG triées par date | US1, US7 |
| FR-003 | Modifier/supprimer AG brouillon | US1 |
| FR-004 | Avertissement délai 21 jours | US1 |
| FR-005 | Ajouter résolutions | US2 |
| FR-006 | Types de majorité | US2, US4 |
| FR-007 | Réordonner résolutions | US2 |
| FR-008 | Numérotation auto | US2 |
| FR-009 | Afficher copropriétaires + tantièmes | US3 |
| FR-010 | Statut présent/représenté/absent | US3 |
| FR-011 | Calcul tantièmes présents | US3 |
| FR-012 | Limite 3 représentations | US3 |
| FR-013 | Enregistrer votes | US4 |
| FR-014 | Calcul adoption auto | US4 |
| FR-015 | Règles de majorité | US4 |
| FR-016 | Identifier opposants/défaillants | US4, US6 |
| FR-017 | Générer convocation | US5 |
| FR-018 | Générer PV | US6 |
| FR-019 | Télécharger documents | US5, US6 |
| FR-020 | Workflow statuts AG | US1-US6 |
| FR-021 | Archivage AG terminées | US7 |

## Legal Compliance Points

- [x] Délai convocation 21 jours (Art. 9 décret 1967)
- [x] Ordre du jour détaillé obligatoire (Art. 11 décret 1967)
- [x] Majorités loi 1965 : Art. 24, 25, 26, Unanimité
- [x] PV dans le mois (Art. 17 décret 1967)
- [x] Notification opposants/défaillants (Art. 18 décret 1967)
- [x] Limite représentation 3 personnes

## Dependencies on Existing System

- [x] Copropriétaires (existants dans le système)
- [x] Lots avec tantièmes (existants dans le système)
- [x] Calcul des tantièmes par copropriétaire

## Ready for Next Phase

- [x] Spec reviewed and complete
- [x] No blocking ambiguities
- [x] Clarification round completed (optional: `/speckit.clarify`)
- [x] Implementation plan created (`/speckit.plan`)
