# Research: Page des Obligations Légales du Syndic Bénévole

**Feature**: 005-legal-obligations-page
**Date**: 2026-01-11

## Research Summary

Cette feature ne nécessite pas de recherche technique approfondie car elle utilise des patterns existants dans le codebase. Le contenu légal est basé sur la législation française établie.

## Technical Decisions

### 1. Architecture de la page

**Decision**: Composant React Server Component (RSC) avec contenu statique
**Rationale**: Le contenu est purement informatif et statique, pas besoin de state côté client. RSC permet un rendu optimal et un meilleur SEO.
**Alternatives considered**:
- Client Component avec données chargées dynamiquement → Rejeté: surcharge inutile pour du contenu statique
- Page MDX → Rejeté: ajoute une dépendance, le contenu est mieux structuré en TypeScript typé

### 2. Structure du contenu

**Decision**: Données typées dans un fichier TypeScript séparé (`src/data/obligations-legales.ts`)
**Rationale**:
- Séparation claire entre données et présentation
- Types stricts pour garantir la cohérence du contenu
- Facilite les futures mises à jour du contenu légal
**Alternatives considered**:
- Contenu inline dans les composants → Rejeté: difficile à maintenir et à mettre à jour
- Fichier JSON → Rejeté: pas de typage natif, moins flexible pour les références légales

### 3. Navigation vers la section "Ressources"

**Decision**: Ajout d'une section "Ressources" avec sous-menu dans la navigation desktop, et lien dans le menu mobile
**Rationale**:
- Conforme à la clarification spec (section "Ressources" ou "Aide")
- Ne surcharge pas la navigation principale avec du contenu informatif
- Pattern existant dans l'app pour les éléments secondaires
**Alternatives considered**:
- Lien direct dans la navigation principale → Rejeté: clarification spec demande une section séparée
- Footer uniquement → Rejeté: trop discret pour du contenu important

### 4. Sommaire cliquable (Table of Contents)

**Decision**: Composant `TableOfContents` utilisant les ancres HTML natives (`#section-id`) avec smooth scroll
**Rationale**:
- Solution native, pas de dépendance supplémentaire
- Fonctionne sans JavaScript (progressive enhancement)
- Compatible avec le partage de liens vers des sections spécifiques
**Alternatives considered**:
- Librairie de scroll (react-scroll) → Rejeté: dépendance inutile pour un cas simple
- State React pour suivre la section active → Rejeté: complexité non requise pour MVP

### 5. Responsive design

**Decision**: Layout adaptatif avec sommaire fixe sur desktop, sommaire collapsible sur mobile
**Rationale**:
- Sur desktop: sommaire visible en sidebar pour navigation rapide
- Sur mobile: sommaire en haut de page, collapsible pour économiser l'espace
- Utilise les utilitaires Tailwind existants (`md:`, `lg:`)
**Alternatives considered**:
- Sommaire toujours en haut → Rejeté: moins pratique sur desktop
- Sommaire en drawer/modal sur mobile → Rejeté: complexité supplémentaire

## Content Research

### Sources légales principales

1. **Loi n° 65-557 du 10 juillet 1965** - Statut de la copropriété des immeubles bâtis
2. **Décret n° 67-223 du 17 mars 1967** - Application de la loi de 1965
3. **Ordonnance n° 2019-1101 du 30 octobre 2019** - Réforme du droit de la copropriété

### Catégories de contenu identifiées

Conformément au spec.md:

1. **Obligations comptables** (Articles 14-1, 14-2, 18 loi 1965)
2. **Obligations AG** (Articles 9-11 décret 1967, articles 17-26 loi 1965)
3. **Obligations d'assurance** (Article 18 loi 1965)
4. **Obligations administratives** (Loi ALUR 2014, articles L711-1 à L711-7 CCH)
5. **Conservation des documents** (Article 33 décret 1967)

## No Outstanding NEEDS CLARIFICATION

Tous les éléments techniques ont été résolus. Prêt pour Phase 1.
