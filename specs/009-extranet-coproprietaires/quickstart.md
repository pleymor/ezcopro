# Quickstart: Extranet Copropriétaires

Guide de démarrage rapide pour l'implémentation de l'extranet copropriétaires.

## Prérequis

- Node.js >= 24.0.0
- npm >= 10.0.0
- Firebase CLI installé (`npm install -g firebase-tools`)
- Accès au projet Firebase ezcopro

## Setup local

```bash
# Cloner le repo et checkout la branche
git checkout 009-extranet-coproprietaires

# Installer les dépendances
npm install

# Lancer les émulateurs Firebase (Firestore + Auth + Storage)
npm run emulators

# Dans un autre terminal, lancer le serveur de développement
npm run dev
```

## Configuration Firebase

### 1. Activer Firebase Storage

Si pas encore fait, activer Storage dans la console Firebase :
1. Aller dans Firebase Console > Storage
2. Cliquer "Get Started"
3. Choisir les règles de production

### 2. Installer l'extension Trigger Email (pour notifications)

```bash
firebase ext:install firebase/firestore-send-email --project=ezcopro
```

Configuration requise :
- SMTP connection URI : `smtps://user:password@smtp.gmail.com:465`
- Email collection : `mail`
- Templates collection : `email-templates`

### 3. Déployer les Firestore Rules

Ajouter les règles de `data-model.md` dans `firestore.rules` puis :

```bash
firebase deploy --only firestore:rules
```

### 4. Déployer les Storage Rules

```bash
# Créer/modifier storage.rules
firebase deploy --only storage
```

## Structure des fichiers à créer

### Phase 1 - Schemas et Types

```bash
# Créer les nouveaux fichiers
touch src/lib/schemas/invitation-extranet.ts
touch src/lib/schemas/document-partage.ts
touch src/lib/schemas/preferences-notification.ts
touch src/types/invitation-extranet.ts
touch src/types/document-partage.ts
touch src/types/preferences-notification.ts
```

### Phase 2 - Services Firebase

```bash
touch src/lib/firebase/services/invitation-extranet.ts
touch src/lib/firebase/services/document-partage.ts
```

### Phase 3 - Hooks

```bash
touch src/hooks/useExtranetData.ts
touch src/hooks/useDocuments.ts
touch src/hooks/useInvitations.ts
```

### Phase 4 - Pages Extranet

```bash
mkdir -p src/app/\(dashboard\)/extranet/solde
mkdir -p src/app/\(dashboard\)/extranet/paiements
mkdir -p src/app/\(dashboard\)/extranet/documents
mkdir -p src/app/\(auth\)/invitation/\[token\]

touch src/app/\(dashboard\)/extranet/page.tsx
touch src/app/\(dashboard\)/extranet/solde/page.tsx
touch src/app/\(dashboard\)/extranet/paiements/page.tsx
touch src/app/\(dashboard\)/extranet/documents/page.tsx
touch src/app/\(auth\)/invitation/\[token\]/page.tsx
```

### Phase 5 - Composants

```bash
mkdir -p src/components/extranet

touch src/components/extranet/SoldeCard.tsx
touch src/components/extranet/AppelsList.tsx
touch src/components/extranet/PaiementsList.tsx
touch src/components/extranet/DocumentsList.tsx
touch src/components/extranet/InvitationAcceptForm.tsx
touch src/components/extranet/JustificatifPDF.tsx
```

## Tests

### Lancer les tests unitaires

```bash
npm run test
```

### Lancer les tests E2E

```bash
# Mode test (avec mock data)
npm run test:e2e

# Mode émulateurs (avec vrais émulateurs Firebase)
npm run test:e2e:emulators
```

### Créer les fichiers de test

```bash
mkdir -p tests/e2e/extranet
mkdir -p tests/unit/extranet

touch tests/e2e/extranet/login-invitation.spec.ts
touch tests/e2e/extranet/consultation-solde.spec.ts
touch tests/e2e/extranet/documents.spec.ts
touch tests/unit/extranet/invitation-service.test.ts
touch tests/unit/extranet/document-service.test.ts
```

## Workflow TDD

Pour chaque fonctionnalité, suivre ce workflow :

1. **RED** : Écrire le test qui échoue
   ```bash
   npm run test:watch -- invitation-service
   ```

2. **GREEN** : Implémenter le minimum pour que le test passe

3. **REFACTOR** : Améliorer le code en gardant les tests verts

## Données de test

### Créer une invitation de test

```typescript
// Dans la console Firebase ou un script
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const invitation = {
  email: 'test-copro@example.com',
  coproprietaireId: 'copro-123',
  token: uuidv4(),
  dateEnvoi: Timestamp.now(),
  dateExpiration: Timestamp.fromDate(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ),
  statut: 'en_attente',
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

await addDoc(
  collection(db, 'coproprietes', 'copro-test', 'invitations'),
  invitation
);
```

### Tester le flux d'invitation

1. Se connecter en tant que syndic
2. Aller sur la page copropriétaires
3. Cliquer "Inviter sur l'extranet" sur un copropriétaire avec email
4. Vérifier l'email reçu (ou dans l'émulateur Auth)
5. Ouvrir le lien d'invitation
6. Créer le mot de passe
7. Vérifier l'accès à l'extranet

## Commandes utiles

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build production
npm run build

# Voir les logs émulateurs
firebase emulators:start --inspect-functions

# Exporter les données émulateurs
firebase emulators:export ./emulator-data

# Importer les données émulateurs
firebase emulators:start --import=./emulator-data
```

## Ressources

- [Firebase Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Firebase Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [React PDF Renderer](https://react-pdf.org/)
- [Firebase Trigger Email Extension](https://firebase.google.com/products/extensions/firebase-firestore-send-email)

## Checklist de démarrage

- [ ] Branche `009-extranet-coproprietaires` créée
- [ ] Émulateurs Firebase fonctionnels
- [ ] Extension Trigger Email configurée (ou skip pour MVP)
- [ ] Schemas Zod créés et typés
- [ ] Premier test unitaire écrit et passant
- [ ] Premier test E2E écrit et passant
- [ ] Page /extranet accessible après login copropriétaire
