# Quickstart: Page des Obligations Légales du Syndic Bénévole

**Feature**: 005-legal-obligations-page
**Date**: 2026-01-11

## Prerequisites

- Node.js >= 24.0.0
- npm >= 10.0.0
- Projet EzCopro configuré et fonctionnel

## Development Setup

```bash
# 1. Checkout de la branche feature
git checkout 005-legal-obligations-page

# 2. Installation des dépendances (si nécessaire)
npm install

# 3. Lancer le serveur de développement
npm run dev

# 4. Accéder à la page
# http://localhost:3000/ressources/obligations-legales
# (nécessite d'être connecté)
```

## Running Tests

```bash
# Tests unitaires
npm run test

# Tests E2E (avec Playwright)
npm run test:e2e

# Tests E2E spécifiques à cette feature
npx playwright test obligations-legales
```

## File Structure

```
src/
├── app/(dashboard)/ressources/obligations-legales/
│   └── page.tsx                    # Page principale
├── components/ressources/
│   ├── ObligationsContent.tsx      # Contenu principal
│   ├── TableOfContents.tsx         # Sommaire cliquable
│   └── ObligationSection.tsx       # Section individuelle
├── data/
│   └── obligations-legales.ts      # Données statiques
└── types/
    └── obligations.ts              # Types TypeScript

tests/
├── e2e/
│   └── obligations-legales.spec.ts
└── unit/
    └── obligations-content.test.tsx
```

## Key Implementation Points

### 1. Page Route

La page est accessible à `/ressources/obligations-legales` et protégée par le layout dashboard existant.

### 2. Navigation

Ajouter un lien "Ressources" dans `src/components/layouts/Navigation.tsx` avec un sous-menu vers "Obligations légales".

### 3. Sommaire (Table of Contents)

Utilise des ancres HTML (`#section-id`) avec smooth scroll:

```tsx
<a href="#comptabilite" className="scroll-smooth">
  Obligations comptables
</a>
```

### 4. Mode sombre

Les composants utilisent les classes Tailwind existantes (`bg-card`, `text-foreground`, etc.) pour supporter automatiquement le mode clair/sombre.

### 5. Responsive

- Desktop: Sommaire fixe en sidebar gauche
- Mobile: Sommaire collapsible en haut de page

## Verification Checklist

- [ ] La page est accessible après connexion
- [ ] Le sommaire affiche les 5 catégories
- [ ] Les liens du sommaire scrollent vers les sections
- [ ] Le mode sombre fonctionne
- [ ] La page est lisible sur mobile (320px)
- [ ] Les références légales sont affichées
