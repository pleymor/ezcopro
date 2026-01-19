# Research: Extranet Copropriétaires

**Date**: 2025-01-16
**Feature**: 009-extranet-coproprietaires

## 1. Gestion des rôles utilisateurs (syndic vs copropriétaire)

### Decision
Utiliser Firebase Custom Claims pour distinguer les rôles avec un claim `role` pouvant être `syndic` ou `coproprietaire`.

### Rationale
- Firebase Custom Claims sont propagés automatiquement dans le token JWT
- Vérifiables côté client (via `getIdTokenResult()`) et serveur (via Admin SDK)
- Intégration native avec Firestore Security Rules
- Pas de requête Firestore supplémentaire pour vérifier le rôle
- Déjà utilisé par l'application existante (architecture cohérente)

### Alternatives considérées
| Alternative | Raison du rejet |
|-------------|-----------------|
| Champ `role` dans document Firestore `/users/{uid}` | Requête supplémentaire à chaque vérification, non accessible dans les Security Rules sans lecture |
| Collection séparée `/coproprietaires/{uid}` | Complexité accrue, duplication de données utilisateur |
| Authentification séparée (deux apps Firebase) | Sur-ingénierie, coûts accrus, UX fragmentée |

### Implementation Pattern
```typescript
// Claim structure
interface CustomClaims {
  role: 'syndic' | 'coproprietaire';
  coproId?: string;           // ID de la copropriété
  coproprietaireId?: string;  // ID du copropriétaire (si role = coproprietaire)
}

// Setting claims (Cloud Function ou Admin SDK)
await admin.auth().setCustomUserClaims(uid, {
  role: 'coproprietaire',
  coproId: 'xxx',
  coproprietaireId: 'yyy'
});
```

---

## 2. Système d'invitation par email

### Decision
Utiliser Firebase Auth Action Links avec un token personnalisé stocké dans Firestore pour lier l'invitation au copropriétaire.

### Rationale
- Firebase Auth gère nativement les emails d'action (vérification, reset password)
- Pas besoin de service email tiers (SendGrid, Mailgun) pour le MVP
- Token Firestore permet de lier l'invitation au copropriétaire existant
- Expiration gérée côté Firestore (7 jours selon spec)

### Alternatives considérées
| Alternative | Raison du rejet |
|-------------|-----------------|
| Magic Links Firebase | Ne permet pas de lier à un copropriétaire existant |
| Service email tiers (SendGrid) | Coût et complexité supplémentaires pour le MVP |
| Invitation par code à saisir | UX inférieure (friction supplémentaire) |

### Implementation Pattern
```typescript
// Collection: /coproprietes/{coproId}/invitations/{invitationId}
interface InvitationExtranet {
  id: string;
  email: string;
  coproprietaireId: string;
  token: string;              // UUID v4 unique
  dateEnvoi: Timestamp;
  dateExpiration: Timestamp;  // dateEnvoi + 7 jours
  statut: 'en_attente' | 'acceptee' | 'expiree';
  createdAt: Timestamp;
}

// URL d'invitation
// https://ezcopro.app/invitation/{token}
```

---

## 3. Routage conditionnel par rôle

### Decision
Utiliser le middleware Next.js pour rediriger selon le rôle contenu dans le cookie de session Firebase.

### Rationale
- Le middleware s'exécute avant le rendu des pages (performance)
- Firebase Auth persiste le token dans un cookie accessible côté serveur
- Permet de protéger les routes sans rendu côté client
- Pattern standard Next.js App Router

### Alternatives considérées
| Alternative | Raison du rejet |
|-------------|-----------------|
| Vérification côté client uniquement | Flash de contenu non autorisé, mauvaise UX |
| Route groups séparés | Duplication de code et composants |
| API routes avec session | Sur-ingénierie pour le cas d'usage |

### Implementation Pattern
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const { role } = session.claims;
  const path = request.nextUrl.pathname;

  // Copropriétaire essaie d'accéder aux pages syndic
  if (role === 'coproprietaire' && !path.startsWith('/extranet')) {
    return NextResponse.redirect(new URL('/extranet', request.url));
  }

  // Syndic essaie d'accéder à l'extranet
  if (role === 'syndic' && path.startsWith('/extranet')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}
```

---

## 4. Stockage et partage de documents

### Decision
Utiliser Firebase Storage avec structure de chemin incluant la copropriété et la catégorie. Métadonnées dans Firestore.

### Rationale
- Firebase Storage intégré à l'écosystème, quota gratuit généreux
- Security Rules basées sur l'authentification Firebase
- Métadonnées Firestore permettent recherche et filtrage
- Séparation stockage (Storage) / métadonnées (Firestore) = best practice

### Alternatives considérées
| Alternative | Raison du rejet |
|-------------|-----------------|
| Documents en base64 dans Firestore | Limite 1 Mo par document, coût lecture élevé |
| Cloudflare R2 | Nécessite configuration supplémentaire, pas intégré Firebase |
| Stockage local serveur | Pas de CDN, scalabilité limitée |

### Implementation Pattern
```typescript
// Storage path: /coproprietes/{coproId}/documents/{documentId}

// Collection Firestore: /coproprietes/{coproId}/documents/{docId}
interface DocumentPartage {
  id: string;
  nom: string;
  type: string;              // MIME type
  taille: number;            // bytes
  storagePath: string;       // chemin Firebase Storage
  categorie: 'ag' | 'contrats' | 'reglement' | 'travaux' | 'autres';
  visibleExtranet: boolean;
  datePartage: Timestamp | null;
  consultePar: string[];     // IDs des comptes ayant consulté
  uploadedBy: string;        // userId du syndic
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 5. Affichage du solde et des appels

### Decision
Réutiliser les services existants (`solde.ts`) avec une nouvelle vue adaptée au copropriétaire (données filtrées par son ID).

### Rationale
- Le service `calculateSoldesByCoproprietaire` existe déjà et fonctionne
- `getDetailSoldeCoproprietaire` fournit le détail appels/paiements
- Pas de duplication de logique métier
- Cohérence des calculs entre vue syndic et vue copropriétaire

### Alternatives considérées
| Alternative | Raison du rejet |
|-------------|-----------------|
| Nouveau service dédié copropriétaire | Duplication de code, risque d'incohérence |
| Cloud Function pour calcul | Latence supplémentaire, complexité |
| Pré-calcul stocké dans Firestore | Synchronisation complexe, risque de désync |

### Implementation Pattern
```typescript
// Hook pour extranet - utilise les services existants
function useExtranetSolde(coproId: string, coproprietaireId: string) {
  // Réutilise getDetailSoldeCoproprietaire existant
  // Filtré automatiquement par coproprietaireId via Security Rules
}
```

---

## 6. Génération PDF des justificatifs

### Decision
Utiliser `@react-pdf/renderer` côté client pour générer les PDF de justificatifs de paiement.

### Rationale
- Déjà potentiellement utilisé pour les PV d'AG (vérifier)
- Génération côté client = pas de charge serveur
- Templates React = maintenables et typés
- Pas de dépendance serveur (Puppeteer, wkhtmltopdf)

### Alternatives considérées
| Alternative | Raison du rejet |
|-------------|-----------------|
| Puppeteer (Cloud Function) | Cold start, coût, complexité |
| jsPDF | API moins ergonomique, moins de contrôle styling |
| PDF stockés pré-générés | Synchronisation complexe, stockage inutile |

### Implementation Pattern
```typescript
// Composant React PDF
const JustificatifPaiements = ({ paiements, coproprietaire }) => (
  <Document>
    <Page>
      <View>
        <Text>Justificatif de paiements</Text>
        {/* ... */}
      </View>
    </Page>
  </Document>
);

// Génération et téléchargement
const blob = await pdf(<JustificatifPaiements {...data} />).toBlob();
saveAs(blob, 'justificatif.pdf');
```

---

## 7. Notifications email nouveaux documents

### Decision
Utiliser Firebase Cloud Functions avec extension Trigger Email (Firestore → Email) pour le MVP.

### Rationale
- Extension Firebase officielle, maintenance par Google
- Configuration simple via Firestore (collection `mail`)
- Pas de code backend à maintenir
- Suffisant pour le volume MVP (~100 utilisateurs)

### Alternatives considérées
| Alternative | Raison du rejet |
|-------------|-----------------|
| SendGrid API directe | Configuration supplémentaire, API keys à gérer |
| Resend | Service tiers supplémentaire |
| Pas de notification (indicateur extranet uniquement) | UX dégradée selon spec |

### Implementation Pattern
```typescript
// Extension Firebase Trigger Email
// Quand un document est partagé, ajouter à collection mail
await addDoc(collection(db, 'mail'), {
  to: ['copro1@email.com', 'copro2@email.com'],
  template: {
    name: 'nouveau-document',
    data: {
      documentNom: 'PV AG 2024',
      coproNom: 'Résidence Les Lilas',
      lienExtranet: 'https://ezcopro.app/extranet/documents'
    }
  }
});
```

---

## Résumé des technologies

| Besoin | Solution retenue |
|--------|------------------|
| Rôles utilisateurs | Firebase Custom Claims |
| Invitations | Token Firestore + Firebase Auth |
| Routage | Middleware Next.js |
| Stockage documents | Firebase Storage + métadonnées Firestore |
| Calculs solde | Services existants (solde.ts) |
| PDF justificatifs | @react-pdf/renderer |
| Notifications email | Firebase Extension Trigger Email |
