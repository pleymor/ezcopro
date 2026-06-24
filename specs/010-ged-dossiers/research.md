# Research: GED - Gestion Documentaire avec Dossiers

**Feature**: 010-ged-dossiers
**Date**: 2025-01-19

## Research Questions

### 1. Structure hiérarchique dans Firestore

**Question**: Comment modéliser une arborescence de dossiers dans Firestore de manière performante?

**Decision**: Utiliser un champ `parentId` avec une collection plate + un champ `path` pour le chemin complet.

**Rationale**:
- Firestore ne supporte pas les requêtes récursives
- Une collection plate avec `parentId` permet de charger un niveau à la fois
- Le champ `path` (ex: `/Contrats/2025/Ascenseur`) permet la recherche par préfixe
- Limiter à 3 niveaux simplifie la gestion (pas de requêtes complexes nécessaires)

**Alternatives considered**:
- Sous-collections imbriquées: Rejetée car complique les requêtes cross-niveau et la migration
- Materialised Path seul: Rejetée car ne permet pas facilement de lister les enfants directs
- Adjacency List + Path (choisi): Combine le meilleur des deux approches

### 2. Gestion des droits d'accès dans Firestore

**Question**: Comment implémenter les 3 niveaux d'accès (syndic, conseil, tous) de manière sécurisée?

**Decision**: Utiliser les Firestore Security Rules avec custom claims Firebase Auth.

**Rationale**:
- Les custom claims permettent de stocker le rôle (syndic/coproprietaire) et l'appartenance au conseil
- Les rules Firestore peuvent lire ces claims pour filtrer les accès
- Pas de logique de sécurité côté client uniquement

**Implementation**:
```javascript
// Custom claims structure
{
  role: "syndic" | "coproprietaire",
  coproprieteId: "xxx",
  coproprietaireId: "xxx", // si coproprietaire
  estMembreConseil: true | false // si coproprietaire
}
```

**Alternatives considered**:
- Vérification côté client uniquement: Rejetée (non sécurisé)
- Collection séparée de permissions: Rejetée (complexité, latence supplémentaire)

### 3. Migration des documents existants

**Question**: Comment gérer la compatibilité avec les documents existants (sans dossier)?

**Decision**: Ajouter `dossierId: null` et `niveauAcces: "tous"` par défaut aux documents existants.

**Rationale**:
- Les documents sans dossier sont considérés à la racine (`dossierId: null`)
- Le champ `visibleExtranet: true` existant est migré vers `niveauAcces: "tous"`
- Le champ `visibleExtranet: false` est migré vers `niveauAcces: "syndic"`
- Migration réversible si nécessaire

**Alternatives considered**:
- Nouveau champ séparé: Rejetée (duplication de logique)
- Collection séparée pour nouveaux documents: Rejetée (fragmentation des données)

### 4. Conseil syndical - Stockage des membres

**Question**: Où stocker les membres du conseil syndical?

**Decision**: Sous-collection `conseilSyndical` dans le document copropriété.

**Rationale**:
- Données liées à la copropriété, pas au copropriétaire
- Permet de lister facilement tous les membres du conseil
- Mise à jour des custom claims à chaque modification

**Structure**:
```
coproprietes/{coproprieteId}/conseilSyndical/{coproprietaireId}
```

**Alternatives considered**:
- Champ dans le document copropriétaire: Rejetée (pas de requête inverse facile)
- Collection root séparée: Rejetée (complexité inutile pour une petite feature)

### 5. Performance - Chargement de l'arborescence

**Question**: Comment charger efficacement l'arborescence de dossiers?

**Decision**: Chargement paresseux niveau par niveau + cache local.

**Rationale**:
- Ne charger que les dossiers du niveau courant (pas toute l'arborescence)
- Utiliser `onSnapshot` pour les mises à jour temps réel
- Cache les niveaux déjà visités côté client
- Avec max 3 niveaux et ~20 dossiers typiques, pas de problème de performance

**Alternatives considered**:
- Charger toute l'arborescence d'un coup: Rejetée (inutile, surcharge initiale)
- Server-side pagination: Rejetée (over-engineering pour ~100 documents)

## Technical Decisions Summary

| Aspect | Decision | Justification |
|--------|----------|---------------|
| Structure dossiers | Adjacency List + Path | Requêtes simples, chemin pour recherche |
| Droits d'accès | Custom claims + Rules | Sécurité serveur, pas de call supplémentaire |
| Migration | In-place avec defaults | Rétrocompatibilité, pas de downtime |
| Conseil syndical | Sous-collection copropriété | Cohérence avec le modèle existant |
| Performance | Chargement lazy | Adapté à l'échelle du projet |

## Dependencies

Aucune nouvelle dépendance requise. Utilisation du stack existant:
- Firebase Firestore (déjà utilisé)
- Firebase Auth custom claims (déjà configuré)
- Zod pour validation (déjà utilisé)
