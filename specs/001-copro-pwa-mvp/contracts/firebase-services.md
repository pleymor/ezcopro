# Firebase Services Contract

**Date**: 2025-12-15
**Type**: Client-side Firebase SDK

> **Note**: EzCopro utilise Firebase côté client (pas d'API REST backend). Ce document définit les contrats des services Firebase utilisés.

---

## Authentication Service

### Sign In with Google

```typescript
interface AuthService {
  /**
   * Déclenche le flow OAuth2 Google
   * @returns User authentifié ou erreur
   */
  signInWithGoogle(): Promise<User>;

  /**
   * Déconnecte l'utilisateur
   */
  signOut(): Promise<void>;

  /**
   * Observe les changements d'état d'authentification
   */
  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe;

  /**
   * Retourne l'utilisateur courant (null si non connecté)
   */
  getCurrentUser(): User | null;
}
```

### Erreurs possibles

| Code | Description | Action UI |
|------|-------------|-----------|
| `auth/popup-closed-by-user` | Popup fermé | Rien (utilisateur a annulé) |
| `auth/network-request-failed` | Pas de connexion | Message "Vérifiez votre connexion" |
| `auth/too-many-requests` | Rate limited | Message "Trop de tentatives, réessayez plus tard" |

---

## Firestore Service

### Collections et opérations

#### Users

```typescript
interface UserService {
  /** Crée ou met à jour le profil utilisateur après auth */
  upsertUser(user: User): Promise<void>;

  /** Récupère les copropriétés d'un utilisateur */
  getUserCoproprietes(userId: string): Promise<Copropriete[]>;

  /** Ajoute une copropriété à un utilisateur */
  addCoproprietéToUser(userId: string, coproId: string): Promise<void>;
}
```

#### Copropriétés

```typescript
interface CoproprietéService {
  /** Crée une nouvelle copropriété */
  createCopropriete(data: CreateCoproprietéInput): Promise<Copropriete>;

  /** Récupère une copropriété par ID */
  getCopropriete(id: string): Promise<Copropriete | null>;

  /** Met à jour une copropriété */
  updateCopropriete(id: string, data: UpdateCoproprietéInput): Promise<void>;

  /** Observe les changements d'une copropriété (temps réel) */
  subscribeToCopropriete(id: string, callback: (copro: Copropriete) => void): Unsubscribe;
}

interface CreateCoproprietéInput {
  nom: string;
  adresse: string;
}

interface UpdateCoproprietéInput {
  nom?: string;
  adresse?: string;
}
```

#### Lots

```typescript
interface LotService {
  /** Liste tous les lots d'une copropriété */
  getLots(coproId: string): Promise<Lot[]>;

  /** Observe les lots en temps réel */
  subscribeToLots(coproId: string, callback: (lots: Lot[]) => void): Unsubscribe;

  /** Crée un nouveau lot */
  createLot(coproId: string, data: CreateLotInput): Promise<Lot>;

  /** Met à jour un lot */
  updateLot(coproId: string, lotId: string, data: UpdateLotInput): Promise<void>;

  /** Supprime un lot */
  deleteLot(coproId: string, lotId: string): Promise<void>;
}

interface CreateLotInput {
  numero: string;
  type: LotType;
  tantiemes: number;
  coproprietaireId: string;
  description?: string;
}

interface UpdateLotInput {
  numero?: string;
  type?: LotType;
  tantiemes?: number;
  coproprietaireId?: string;
  description?: string;
}
```

#### Copropriétaires

```typescript
interface CoproprietaireService {
  /** Liste tous les copropriétaires d'une copropriété */
  getCoproprietaires(coproId: string): Promise<Coproprietaire[]>;

  /** Observe les copropriétaires en temps réel */
  subscribeToCoproprietaires(coproId: string, callback: (c: Coproprietaire[]) => void): Unsubscribe;

  /** Crée un nouveau copropriétaire */
  createCoproprietaire(coproId: string, data: CreateCoproprietaireInput): Promise<Coproprietaire>;

  /** Met à jour un copropriétaire */
  updateCoproprietaire(coproId: string, id: string, data: UpdateCoproprietaireInput): Promise<void>;

  /** Anonymise un copropriétaire (RGPD) */
  anonymizeCoproprietaire(coproId: string, id: string): Promise<void>;

  /** Calcule le solde d'un copropriétaire */
  getSolde(coproId: string, coproprietaireId: string): Promise<number>;

  /** Récupère les lots d'un copropriétaire */
  getLotsByCoproprietaire(coproId: string, coproprietaireId: string): Promise<Lot[]>;
}

interface CreateCoproprietaireInput {
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
}

interface UpdateCoproprietaireInput {
  nom?: string;
  prenom?: string;
  email?: string | null;
  telephone?: string | null;
}
```

#### Appels de fonds

```typescript
interface AppelService {
  /** Liste tous les appels d'une copropriété */
  getAppels(coproId: string): Promise<AppelDeFonds[]>;

  /** Observe les appels en temps réel */
  subscribeToAppels(coproId: string, callback: (appels: AppelDeFonds[]) => void): Unsubscribe;

  /** Crée un appel avec répartition automatique */
  createAppel(coproId: string, data: CreateAppelInput): Promise<AppelDeFonds>;

  /** Récupère les répartitions d'un appel */
  getRepartitions(coproId: string, appelId: string): Promise<Repartition[]>;

  /** Supprime un appel et ses répartitions */
  deleteAppel(coproId: string, appelId: string): Promise<void>;
}

interface CreateAppelInput {
  libelle: string;
  montantTotalCents: number;
  dateEcheance: Date;
}

// La répartition est calculée automatiquement à la création
```

#### Paiements

```typescript
interface PaiementService {
  /** Liste tous les paiements d'une copropriété */
  getPaiements(coproId: string): Promise<Paiement[]>;

  /** Liste les paiements d'un copropriétaire */
  getPaiementsByCoproprietaire(coproId: string, coproprietaireId: string): Promise<Paiement[]>;

  /** Observe les paiements en temps réel */
  subscribeToPaiements(coproId: string, callback: (p: Paiement[]) => void): Unsubscribe;

  /** Enregistre un paiement */
  createPaiement(coproId: string, data: CreatePaiementInput): Promise<Paiement>;

  /** Met à jour un paiement */
  updatePaiement(coproId: string, id: string, data: UpdatePaiementInput): Promise<void>;

  /** Supprime un paiement */
  deletePaiement(coproId: string, id: string): Promise<void>;
}

interface CreatePaiementInput {
  coproprietaireId: string;
  montantCents: number;
  datePaiement: Date;
  reference?: string;
}

interface UpdatePaiementInput {
  montantCents?: number;
  datePaiement?: Date;
  reference?: string | null;
}
```

#### Historique

```typescript
interface HistoriqueService {
  /** Liste l'historique d'une copropriété (paginé) */
  getHistorique(coproId: string, options?: HistoriqueOptions): Promise<HistoriquePage>;

  /** Observe l'historique en temps réel */
  subscribeToHistorique(coproId: string, callback: (entries: HistoriqueEntry[]) => void): Unsubscribe;
}

interface HistoriqueOptions {
  limit?: number;           // Défaut: 50
  startAfter?: string;      // ID pour pagination
  entityType?: EntityType;  // Filtre par type
}

interface HistoriquePage {
  entries: HistoriqueEntry[];
  hasMore: boolean;
  lastId: string | null;
}
```

#### Invitations

```typescript
interface InvitationService {
  /** Génère un code d'invitation */
  createInvitation(coproId: string, coproprietaireId: string): Promise<Invitation>;

  /** Valide et utilise un code d'invitation */
  useInvitation(code: string, userId: string): Promise<{
    coproprietéId: string;
    coproprietaireId: string;
  }>;

  /** Vérifie si un code est valide (sans l'utiliser) */
  validateInvitation(code: string): Promise<{
    valid: boolean;
    coproprietéNom?: string;
    error?: 'expired' | 'used' | 'not_found';
  }>;
}
```

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: vérifie si l'utilisateur est membre d'une copropriété
    function isMember(coproId) {
      return request.auth != null &&
        request.auth.uid in get(/databases/$(database)/documents/coproprietes/$(coproId)).data.members;
    }

    // Users: lecture/écriture de son propre profil uniquement
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Copropriétés: membres uniquement
    match /coproprietes/{coproId} {
      allow read: if isMember(coproId);
      allow create: if request.auth != null;
      allow update: if isMember(coproId);
      allow delete: if false; // Jamais supprimé

      // Sous-collections
      match /lots/{lotId} {
        allow read, write: if isMember(coproId);
      }

      match /coproprietaires/{cpId} {
        allow read, write: if isMember(coproId);
      }

      match /appels/{appelId} {
        allow read, write: if isMember(coproId);

        match /repartitions/{repId} {
          allow read: if isMember(coproId);
          allow write: if false; // Créé automatiquement
        }
      }

      match /paiements/{paiementId} {
        allow read, write: if isMember(coproId);
      }

      match /historique/{entryId} {
        allow read: if isMember(coproId);
        allow write: if false; // Créé automatiquement
      }
    }

    // Invitations: lecture publique pour validation, écriture par membres
    match /invitations/{code} {
      allow read: if true;
      allow create: if request.auth != null &&
        isMember(request.resource.data.coproprietéId);
      allow update: if request.auth != null &&
        resource.data.usedAt == null; // Seulement si pas encore utilisé
      allow delete: if false;
    }
  }
}
```

---

## Gestion des erreurs

### Codes d'erreur Firestore

| Code | Description | Action UI |
|------|-------------|-----------|
| `permission-denied` | Pas autorisé | Rediriger vers login ou afficher "Accès refusé" |
| `not-found` | Document inexistant | Afficher "Élément non trouvé" |
| `unavailable` | Firestore indisponible | Message "Service temporairement indisponible" |
| `deadline-exceeded` | Timeout | Réessayer automatiquement (1 fois) |

### Pattern de retry

```typescript
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 1
): Promise<T> => {
  let lastError: Error;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (error.code !== 'unavailable' && error.code !== 'deadline-exceeded') {
        throw error;
      }
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastError;
};
```

---

## Transactions

### Création d'appel de fonds avec répartitions

```typescript
const createAppelWithRepartitions = async (
  coproId: string,
  input: CreateAppelInput
): Promise<AppelDeFonds> => {
  return runTransaction(async (transaction) => {
    // 1. Récupérer tous les lots
    const lotsRef = collection(db, 'coproprietes', coproId, 'lots');
    const lotsSnapshot = await transaction.get(query(lotsRef));
    const lots = lotsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // 2. Calculer le total des tantièmes
    const totalTantiemes = lots.reduce((sum, lot) => sum + lot.tantiemes, 0);

    // 3. Créer l'appel
    const appelRef = doc(collection(db, 'coproprietes', coproId, 'appels'));
    const appel = {
      ...input,
      id: appelRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: auth.currentUser.uid,
    };
    transaction.set(appelRef, appel);

    // 4. Créer les répartitions
    for (const lot of lots) {
      const montantCents = Math.round(
        (lot.tantiemes / totalTantiemes) * input.montantTotalCents
      );
      const repRef = doc(collection(appelRef, 'repartitions'));
      transaction.set(repRef, {
        id: repRef.id,
        lotId: lot.id,
        coproprietaireId: lot.coproprietaireId,
        montantCents,
        tantiemesSnapshot: lot.tantiemes,
        createdAt: serverTimestamp(),
      });
    }

    // 5. Créer l'entrée d'historique
    const histRef = doc(collection(db, 'coproprietes', coproId, 'historique'));
    transaction.set(histRef, {
      id: histRef.id,
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email,
      action: 'create',
      entityType: 'appel',
      entityId: appelRef.id,
      entityLabel: input.libelle,
      before: null,
      after: appel,
      timestamp: serverTimestamp(),
    });

    return appel;
  });
};
```

---

## Formats de réponse

### Succès

```typescript
// Les services retournent directement les données typées
const lot: Lot = await lotService.createLot(coproId, input);
```

### Erreur

```typescript
// Les erreurs Firebase sont propagées avec leur code
try {
  await service.operation();
} catch (error) {
  if (error.code === 'permission-denied') {
    // Gérer l'erreur d'autorisation
  }
}
```
