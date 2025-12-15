# Quickstart: EzCopro MVP

**Date**: 2025-12-15
**Temps estimé**: 15 minutes

Ce guide permet de lancer le projet EzCopro en local pour le développement.

---

## Prérequis

- **Node.js** 18.x ou supérieur
- **npm** 9.x ou supérieur (ou pnpm/yarn)
- **Compte Google** pour l'authentification
- **Compte Firebase** (gratuit)

---

## 1. Cloner et installer

```bash
# Cloner le repo
git clone <repo-url> ezcopro
cd ezcopro

# Installer les dépendances
npm install
```

---

## 2. Configuration Firebase

### 2.1 Créer un projet Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquer "Créer un projet"
3. Nom du projet : `ezcopro-dev` (ou autre)
4. Désactiver Google Analytics (pas nécessaire pour le dev)
5. Attendre la création

### 2.2 Activer Authentication

1. Dans la console Firebase, aller dans "Authentication"
2. Cliquer "Commencer"
3. Onglet "Sign-in method"
4. Activer "Google"
5. Configurer l'email de support
6. Sauvegarder

### 2.3 Créer la base Firestore

1. Aller dans "Firestore Database"
2. Cliquer "Créer une base de données"
3. Choisir "Mode test" (pour le développement)
4. Sélectionner la région `europe-west1` (Belgique)
5. Attendre la création

### 2.4 Récupérer les credentials

1. Aller dans Paramètres du projet (icône engrenage)
2. Onglet "Général"
3. Section "Vos applications" → "Ajouter une application" → Web
4. Nom : `ezcopro-web`
5. Cocher "Firebase Hosting" (optionnel)
6. Copier la configuration

---

## 3. Variables d'environnement

Créer un fichier `.env.local` à la racine :

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ezcopro-dev.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ezcopro-dev
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ezcopro-dev.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Environment
NEXT_PUBLIC_ENV=development
```

> ⚠️ Ne jamais commiter `.env.local` - il est déjà dans `.gitignore`

---

## 4. Lancer le développement

```bash
# Démarrer le serveur de développement
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000)

---

## 5. Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement (hot reload) |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production (après build) |
| `npm run lint` | Linting ESLint |
| `npm run type-check` | Vérification TypeScript |
| `npm run test` | Tests unitaires (Vitest) |
| `npm run test:e2e` | Tests E2E (Playwright) |
| `npm run storybook` | Lancer Storybook |

---

## 6. Structure du projet

```
ezcopro/
├── src/
│   ├── app/              # Pages Next.js (App Router)
│   ├── components/       # Composants React
│   ├── lib/              # Logique métier
│   │   ├── firebase/     # Config et helpers Firebase
│   │   ├── hooks/        # React hooks
│   │   ├── schemas/      # Schémas Zod
│   │   └── utils/        # Utilitaires
│   └── types/            # Types TypeScript
├── tests/
│   ├── e2e/              # Tests Playwright
│   └── unit/             # Tests Vitest
├── stories/              # Stories Storybook
├── public/               # Assets statiques
└── specs/                # Documentation technique
```

---

## 7. Tester l'authentification

1. Ouvrir [http://localhost:3000](http://localhost:3000)
2. Cliquer "Se connecter avec Google"
3. Sélectionner votre compte Google
4. Vous devriez voir l'écran de création/rejoindre une copropriété

---

## 8. Configurer les Security Rules (optionnel en dev)

Pour le développement, Firestore est en "mode test". Pour tester les vraies règles :

1. Aller dans Firestore → Règles
2. Coller le contenu de `specs/001-copro-pwa-mvp/contracts/firebase-services.md` (section Security Rules)
3. Publier

---

## 9. Lancer Storybook

```bash
npm run storybook
```

Storybook s'ouvre sur [http://localhost:6006](http://localhost:6006)

---

## 10. Lancer les tests

### Tests unitaires

```bash
# Tous les tests
npm run test

# Mode watch
npm run test -- --watch

# Avec couverture
npm run test -- --coverage
```

### Tests E2E

```bash
# Installer les navigateurs Playwright (première fois)
npx playwright install

# Lancer les tests
npm run test:e2e

# Mode UI (debug)
npm run test:e2e -- --ui

# Un seul fichier
npm run test:e2e -- tests/e2e/auth.spec.ts
```

---

## Dépannage

### "Firebase: Error (auth/configuration-not-found)"

- Vérifier que `.env.local` contient les bonnes valeurs
- Redémarrer le serveur de dev après modification de `.env.local`

### "Permission denied" dans Firestore

- En mode test, les règles expirent après 30 jours
- Aller dans Firestore → Règles et republier

### L'authentification Google ne fonctionne pas

- Vérifier que le domaine `localhost` est autorisé dans Firebase Console
- Authentication → Settings → Authorized domains → Ajouter `localhost`

### Les tests E2E échouent

- S'assurer que le serveur de dev tourne (`npm run dev`)
- Ou configurer un serveur de test dédié dans `playwright.config.ts`

---

## Prochaines étapes

1. Lire la [spec.md](./spec.md) pour comprendre les fonctionnalités
2. Consulter le [data-model.md](./data-model.md) pour la structure des données
3. Voir les [contracts/](./contracts/) pour les interfaces de services
4. Commencer par les tests BDD dans `tests/e2e/`
