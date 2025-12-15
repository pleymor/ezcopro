# Research: EzCopro MVP

**Date**: 2025-12-15
**Feature**: 001-copro-pwa-mvp

## Résumé des décisions

Ce document consolide les recherches et décisions techniques pour le MVP EzCopro.

---

## 1. Backend-as-a-Service (BaaS)

### Décision: Firebase (Firestore + Auth)

### Rationale
- **Free tier généreux** : 1GB stockage, 50K lectures/jour, 20K écritures/jour - largement suffisant pour ~5 copropriétés pilotes
- **Auth Google intégré** : Configuration minimale pour OAuth2
- **Temps réel natif** : Synchronisation automatique des données entre clients
- **Security Rules** : Sécurité au niveau des données sans backend custom
- **PWA ready** : SDK JavaScript optimisé pour le web

### Alternatives considérées

| Alternative | Raison du rejet |
|-------------|-----------------|
| Supabase | Free tier plus limité (500MB), PostgreSQL overkill pour ce volume |
| Appwrite | Moins mature, communauté plus petite |
| Backend custom (Node.js) | Complexité et coût d'hébergement inutiles pour MVP |
| PocketBase | Self-hosted = coûts serveur |

### Limites à surveiller
- 50K lectures/jour → implémenter cache agressif côté client
- 1GB stockage → pas de fichiers dans MVP (confirmé dans clarifications)
- Vendor lock-in → acceptable pour MVP, migration possible vers Supabase si besoin

---

## 2. Framework Frontend

### Décision: Next.js 14+ (App Router)

### Rationale
- **SSR/SSG optionnel** : Flexibilité pour optimiser les performances
- **App Router** : Architecture moderne avec Server Components
- **Vercel free tier** : Déploiement gratuit avec preview branches
- **Écosystème React** : Large choix de composants et outils
- **PWA support** : next-pwa pour Service Worker automatique

### Alternatives considérées

| Alternative | Raison du rejet |
|-------------|-----------------|
| Vite + React | Pas de SSR natif, moins optimisé pour SEO/performance initiale |
| Remix | Moins adapté à Firebase (orienté serveur), plus complexe |
| SvelteKit | Équipe moins familière, écosystème plus petit |
| Vue/Nuxt | Même raison |

---

## 3. Styling

### Décision: Tailwind CSS

### Rationale
- **Utility-first** : Développement rapide, pas de CSS à maintenir
- **Mobile-first** : Breakpoints intégrés (sm, md, lg)
- **Tree-shaking** : Bundle minimal en production
- **Design system** : Tokens configurables pour cohérence

### Alternatives considérées

| Alternative | Raison du rejet |
|-------------|-----------------|
| CSS Modules | Plus verbeux, moins de productivité |
| Styled-components | Runtime CSS-in-JS = performance moindre |
| shadcn/ui | Sera utilisé EN PLUS de Tailwind pour les composants de base |

### Décision complémentaire: shadcn/ui
Utiliser shadcn/ui pour les composants UI de base (buttons, inputs, modals, etc.) car :
- Composants accessibles (Radix primitives)
- Code copié dans le projet (pas de dépendance externe)
- Personnalisable avec Tailwind
- Storybook-ready

---

## 4. Validation et Types

### Décision: Zod

### Rationale
- **Runtime validation** : Vérifie les données Firebase à l'exécution
- **TypeScript inference** : `z.infer<typeof schema>` pour types automatiques
- **Composable** : Schemas réutilisables et composables
- **Petite taille** : ~12KB gzipped

### Alternatives considérées

| Alternative | Raison du rejet |
|-------------|-----------------|
| Yup | API moins TypeScript-native |
| io-ts | Syntaxe plus complexe |
| class-validator | Orienté classes, pas fonctionnel |

---

## 5. Testing

### Décision: Playwright (E2E/BDD) + Vitest (Unit)

### Rationale

**Playwright pour BDD/E2E :**
- Support natif des fixtures et steps réutilisables
- Multi-navigateur (Chrome, Firefox, Safari)
- Mode headed pour debugging
- Rapports HTML intégrés
- Intégration facile avec Given/When/Then via librairies comme `@cucumber/cucumber` ou approche custom

**Vitest pour Unit :**
- Compatible Jest API (migration facile)
- Très rapide (Vite-powered)
- Support TypeScript natif
- Watch mode performant

### Alternatives considérées

| Alternative | Raison du rejet |
|-------------|-----------------|
| Cypress | Plus lent, moins adapté au multi-navigateur |
| Jest | Plus lent que Vitest, configuration plus lourde |
| Testing Library seul | Insuffisant pour E2E, mais sera utilisé avec Vitest |

### Structure BDD
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Story 1 - Connexion', () => {
  test('Given utilisateur non connecté, When accède à app, Then voit connexion Google', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
  });
});
```

---

## 6. PWA

### Décision: next-pwa + Workbox

### Rationale
- **Intégration Next.js** : Configuration minimale
- **Workbox** : Stratégies de cache flexibles
- **Manifest auto** : Génération automatique
- **Offline-first capable** : Prépare le terrain pour mode hors-ligne futur

### Configuration cible
- Cache-first pour assets statiques
- Network-first pour données Firestore (pas de mode offline MVP)
- Install prompt sur mobile

---

## 7. Gestion des montants financiers

### Décision: Stockage en centimes (entiers)

### Rationale
- **Évite les erreurs float** : 10.00€ → 1000 centimes
- **Firestore compatible** : Entiers natifs
- **Calculs précis** : Pas d'arrondi inattendu
- **Standard industrie** : Stripe, banques utilisent cette approche

### Implémentation
```typescript
// Stockage
interface Payment {
  amountCents: number; // 1050 = 10.50€
}

// Affichage
const formatEuros = (cents: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(cents / 100);
```

---

## 8. Historisation (Audit Trail)

### Décision: Collection Firestore dédiée avec triggers

### Rationale
- **Séparation des concerns** : Données métier vs audit
- **Queries optimisées** : Index sur timestamp et copropriété
- **Immutable** : Entrées jamais modifiées/supprimées

### Structure
```typescript
interface AuditEntry {
  id: string;
  coproprietéId: string;
  userId: string;
  userEmail: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'lot' | 'coproprietaire' | 'appel' | 'paiement';
  entityId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  timestamp: Timestamp;
}
```

---

## 9. Multi-tenancy

### Décision: Copropriété ID dans chaque document + Security Rules

### Rationale
- **Simple** : Pas de base séparée par tenant
- **Firestore native** : Security Rules pour isolation
- **Scalable** : Fonctionne jusqu'à des milliers de copropriétés

### Security Rule pattern
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /coproprietes/{coproId}/{document=**} {
      allow read, write: if request.auth != null
        && request.auth.uid in get(/databases/$(database)/documents/coproprietes/$(coproId)).data.members;
    }
  }
}
```

---

## 10. Déploiement

### Décision: Vercel (Frontend) + Firebase (Backend)

### Rationale
- **Vercel free tier** : Suffisant pour MVP (100GB bandwidth)
- **Preview deployments** : Chaque PR testable
- **Edge network** : Performance mondiale
- **Firebase Console** : Gestion Firestore et Auth

### CI/CD
- GitHub Actions pour tests
- Vercel auto-deploy sur push main
- Preview branches automatiques

---

## Questions résolues

| Question initiale | Résolution |
|-------------------|------------|
| BaaS gratuit ? | Firebase free tier |
| Framework frontend ? | Next.js 14 App Router |
| Tests BDD ? | Playwright avec structure Given/When/Then |
| Montants financiers ? | Entiers en centimes |
| Multi-tenant ? | Copropriété ID + Security Rules |
| PWA ? | next-pwa + Workbox |

## Risques identifiés

| Risque | Mitigation |
|--------|------------|
| Dépassement free tier Firebase | Monitoring usage, cache agressif |
| Performance Firestore | Pagination, indexes optimisés |
| Vendor lock-in Firebase | Architecture découplée, migration possible |
