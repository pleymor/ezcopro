# Data Model: Page des Obligations Légales du Syndic Bénévole

**Feature**: 005-legal-obligations-page
**Date**: 2026-01-11

## Overview

Cette feature utilise des données statiques typées (pas de persistance en base de données). Le modèle de données définit la structure du contenu des obligations légales.

## Type Definitions

### ObligationCategory

Représente une catégorie d'obligations (ex: "Obligations comptables")

```typescript
interface ObligationCategory {
  /** Identifiant unique pour les ancres HTML */
  id: string;
  /** Titre de la catégorie */
  title: string;
  /** Icône Lucide React à afficher */
  icon: LucideIcon;
  /** Description courte de la catégorie */
  description: string;
  /** Liste des obligations dans cette catégorie */
  obligations: Obligation[];
}
```

### Obligation

Représente une obligation légale individuelle

```typescript
interface Obligation {
  /** Identifiant unique */
  id: string;
  /** Titre de l'obligation */
  title: string;
  /** Description détaillée (peut contenir du texte formaté) */
  description: string;
  /** Références légales associées */
  legalReferences: LegalReference[];
  /** Niveau d'importance: critical, important, standard */
  importance: 'critical' | 'important' | 'standard';
}
```

### LegalReference

Représente une référence à un texte de loi

```typescript
interface LegalReference {
  /** Texte court affiché (ex: "Art. 14 loi 1965") */
  shortText: string;
  /** Texte complet de la référence */
  fullText: string;
  /** Lien externe optionnel (Légifrance, etc.) - pour référence future */
  url?: string;
}
```

## Content Structure

### Categories (5 total)

| ID | Title | Icon | Obligations Count |
|----|-------|------|-------------------|
| `comptabilite` | Obligations comptables | `Calculator` | 4 |
| `assemblees` | Assemblées générales | `Users` | 4 |
| `assurance` | Obligations d'assurance | `Shield` | 2 |
| `administratif` | Obligations administratives | `FileText` | 3 |
| `documents` | Conservation des documents | `Archive` | 2 |

### Validation Rules

- Chaque catégorie DOIT avoir au moins 2 obligations (SC-002)
- Chaque obligation DOIT avoir au moins 1 référence légale (FR-005)
- Les IDs DOIVENT être uniques et URL-safe (kebab-case)
- Les titres DOIVENT être en français et compréhensibles par un non-juriste (FR-003)

## File Location

```
src/
├── types/
│   └── obligations.ts          # Types exportés
└── data/
    └── obligations-legales.ts  # Données statiques avec contenu complet
```

## No Database Schema

Cette feature n'utilise pas de persistance en base de données. Le contenu est statique et versionné avec le code source.
