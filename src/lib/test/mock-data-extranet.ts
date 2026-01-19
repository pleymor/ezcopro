/* eslint-disable @typescript-eslint/no-explicit-any */
import type { InvitationExtranet, StatutInvitation } from '@/types/invitation-extranet';
import type { DocumentPartage, CategorieDocument } from '@/types/document-partage';
import type { PreferencesNotification } from '@/types/preferences-notification';
import type { CustomClaims } from '@/types/auth';
import { TEST_USER, TEST_COPRO, TEST_COPROPRIETAIRES, TEST_APPELS, TEST_PAIEMENTS, createMockTimestamp, generateTestId } from './mock-data';

// ============================================
// EXTRANET - MOCK DATA
// ============================================

// Helper to create a mock Firestore timestamp
function mockTimestamp(date: Date = new Date()): { seconds: number; nanoseconds: number } {
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: (date.getTime() % 1000) * 1000000,
  };
}

// Test copropriétaire user (avec compte créé)
export const TEST_COPROPRIETAIRE_USER = {
  uid: 'test-coproprietaire-user-123',
  email: 'jean.dupont@example.com',
  displayName: 'Jean Dupont',
  photoURL: null,
};

// Claims pour le syndic
export const TEST_SYNDIC_CLAIMS: CustomClaims = {
  role: 'syndic',
  coproprieteId: TEST_COPRO.id,
};

// Claims pour le copropriétaire
export const TEST_COPROPRIETAIRE_CLAIMS: CustomClaims = {
  role: 'coproprietaire',
  coproprieteId: TEST_COPRO.id,
  coproprietaireId: TEST_COPROPRIETAIRES[0]?.id ?? 'test-cp-1',
};

// ============================================
// INVITATIONS EXTRANET
// ============================================

export const TEST_INVITATIONS_EXTRANET: InvitationExtranet[] = [
  {
    id: 'test-invitation-1',
    email: 'jean.dupont@example.com',
    coproprietaireId: 'test-cp-1',
    token: '550e8400-e29b-41d4-a716-446655440000',
    dateEnvoi: mockTimestamp(new Date('2024-12-01')),
    dateExpiration: mockTimestamp(new Date('2024-12-08')), // 7 jours après
    statut: 'acceptee' as StatutInvitation,
    createdAt: mockTimestamp(new Date('2024-12-01')),
    updatedAt: mockTimestamp(new Date('2024-12-02')),
  },
  {
    id: 'test-invitation-2',
    email: 'marie.martin@example.com',
    coproprietaireId: 'test-cp-2',
    token: '550e8400-e29b-41d4-a716-446655440001',
    dateEnvoi: mockTimestamp(new Date('2024-12-10')),
    dateExpiration: mockTimestamp(new Date('2024-12-17')),
    statut: 'en_attente' as StatutInvitation,
    createdAt: mockTimestamp(new Date('2024-12-10')),
    updatedAt: mockTimestamp(new Date('2024-12-10')),
  },
  {
    id: 'test-invitation-3',
    email: 'ancien@example.com',
    coproprietaireId: 'test-cp-1',
    token: '550e8400-e29b-41d4-a716-446655440002',
    dateEnvoi: mockTimestamp(new Date('2024-10-01')),
    dateExpiration: mockTimestamp(new Date('2024-10-08')),
    statut: 'expiree' as StatutInvitation,
    createdAt: mockTimestamp(new Date('2024-10-01')),
    updatedAt: mockTimestamp(new Date('2024-10-08')),
  },
];

// ============================================
// DOCUMENTS PARTAGÉS
// ============================================

export const TEST_DOCUMENTS_PARTAGES: DocumentPartage[] = [
  {
    id: 'test-doc-1',
    nom: 'PV AG 2024.pdf',
    type: 'application/pdf',
    taille: 2500000, // 2.5 Mo
    storagePath: `coproprietes/${TEST_COPRO.id}/documents/pv-ag-2024.pdf`,
    categorie: 'ag' as CategorieDocument,
    visibleExtranet: true,
    datePartage: mockTimestamp(new Date('2024-12-01')),
    consultePar: [TEST_COPROPRIETAIRES[0]?.id ?? 'test-cp-1'],
    uploadedBy: TEST_USER.uid,
    createdAt: mockTimestamp(new Date('2024-12-01')),
    updatedAt: mockTimestamp(new Date('2024-12-01')),
  },
  {
    id: 'test-doc-2',
    nom: 'Règlement de copropriété.pdf',
    type: 'application/pdf',
    taille: 5000000, // 5 Mo
    storagePath: `coproprietes/${TEST_COPRO.id}/documents/reglement.pdf`,
    categorie: 'reglement' as CategorieDocument,
    visibleExtranet: true,
    datePartage: mockTimestamp(new Date('2024-01-15')),
    consultePar: [],
    uploadedBy: TEST_USER.uid,
    createdAt: mockTimestamp(new Date('2024-01-15')),
    updatedAt: mockTimestamp(new Date('2024-01-15')),
  },
  {
    id: 'test-doc-3',
    nom: 'Contrat ascenseur.pdf',
    type: 'application/pdf',
    taille: 1200000,
    storagePath: `coproprietes/${TEST_COPRO.id}/documents/contrat-ascenseur.pdf`,
    categorie: 'contrats' as CategorieDocument,
    visibleExtranet: false, // Non visible sur l'extranet
    datePartage: null,
    consultePar: [],
    uploadedBy: TEST_USER.uid,
    createdAt: mockTimestamp(new Date('2024-06-01')),
    updatedAt: mockTimestamp(new Date('2024-06-01')),
  },
  {
    id: 'test-doc-4',
    nom: 'Devis ravalement.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    taille: 350000,
    storagePath: `coproprietes/${TEST_COPRO.id}/documents/devis-ravalement.xlsx`,
    categorie: 'travaux' as CategorieDocument,
    visibleExtranet: true,
    datePartage: mockTimestamp(new Date('2024-11-15')),
    consultePar: [TEST_COPROPRIETAIRES[0]?.id ?? 'test-cp-1', TEST_COPROPRIETAIRES[1]?.id ?? 'test-cp-2'],
    uploadedBy: TEST_USER.uid,
    createdAt: mockTimestamp(new Date('2024-11-15')),
    updatedAt: mockTimestamp(new Date('2024-11-15')),
  },
];

// ============================================
// PRÉFÉRENCES NOTIFICATION
// ============================================

export const TEST_PREFERENCES_NOTIFICATION: PreferencesNotification[] = [
  {
    id: TEST_COPROPRIETAIRE_USER.uid,
    emailNouveauxDocuments: true,
    createdAt: mockTimestamp(new Date('2024-12-02')),
    updatedAt: mockTimestamp(new Date('2024-12-02')),
  },
];

// ============================================
// DONNÉES FINANCIÈRES EXTRANET
// ============================================

// Solde calculé pour le copropriétaire test
// Basé sur les appels et paiements existants dans mock-data.ts
export function getExtranetSoldeForCoproprietaire(coproprietaireId: string) {
  // Dans le mock, le copropriétaire test-cp-1 a:
  // - Part de l'appel Q1 2024: 75000 cents (50% de 150000)
  // - Paiement: 50000 cents
  // Solde débiteur: 25000 cents (250 EUR)
  if (coproprietaireId === 'test-cp-1') {
    return {
      totalAppelesCents: 75000,
      totalPayesCents: 50000,
      soldeCents: -25000, // Négatif = débiteur
    };
  }
  // Copropriétaire test-cp-2:
  // - Part de l'appel Q1 2024: 60000 cents (40% de 150000)
  // - Pas de paiement
  if (coproprietaireId === 'test-cp-2') {
    return {
      totalAppelesCents: 60000,
      totalPayesCents: 0,
      soldeCents: -60000,
    };
  }
  return {
    totalAppelesCents: 0,
    totalPayesCents: 0,
    soldeCents: 0,
  };
}

// Historique des appels pour un copropriétaire
export function getAppelsForCoproprietaire(coproprietaireId: string) {
  // Filtrer les appels selon la quote-part du copropriétaire
  return TEST_APPELS.map((appel) => {
    const quotePart = coproprietaireId === 'test-cp-1' ? 0.5 : 0.4;
    return {
      ...appel,
      montantCoproprietaireCents: Math.round(appel.montantTotalCents * quotePart),
    };
  });
}

// Historique des paiements pour un copropriétaire
export function getPaiementsForCoproprietaire(coproprietaireId: string) {
  return TEST_PAIEMENTS.filter((p) => p.coproprietaireId === coproprietaireId);
}

// Documents visibles sur l'extranet
export function getDocumentsForExtranet(): DocumentPartage[] {
  return TEST_DOCUMENTS_PARTAGES.filter((doc) => doc.visibleExtranet);
}

// ============================================
// MOCK STORE EXTRANET
// ============================================

export const mockStoreExtranet = {
  invitationsExtranet: [...TEST_INVITATIONS_EXTRANET] as InvitationExtranet[],
  documentsPartages: [...TEST_DOCUMENTS_PARTAGES] as DocumentPartage[],
  preferencesNotification: [...TEST_PREFERENCES_NOTIFICATION] as PreferencesNotification[],
};

// Helper to reset mock data
export function resetMockDataExtranet(): void {
  mockStoreExtranet.invitationsExtranet = [...TEST_INVITATIONS_EXTRANET];
  mockStoreExtranet.documentsPartages = [...TEST_DOCUMENTS_PARTAGES];
  mockStoreExtranet.preferencesNotification = [...TEST_PREFERENCES_NOTIFICATION];
}

// ============================================
// HELPERS POUR TESTS
// ============================================

// Créer une nouvelle invitation
export function createMockInvitation(
  email: string,
  coproprietaireId: string
): InvitationExtranet {
  const now = new Date();
  const expiration = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 jours
  return {
    id: generateTestId(),
    email,
    coproprietaireId,
    token: crypto.randomUUID(),
    dateEnvoi: createMockTimestamp(),
    dateExpiration: mockTimestamp(expiration),
    statut: 'en_attente',
    createdAt: createMockTimestamp(),
    updatedAt: createMockTimestamp(),
  };
}

// Créer un nouveau document partagé
export function createMockDocument(
  nom: string,
  categorie: CategorieDocument,
  visibleExtranet: boolean = false
): DocumentPartage {
  return {
    id: generateTestId(),
    nom,
    type: 'application/pdf',
    taille: 1000000,
    storagePath: `coproprietes/${TEST_COPRO.id}/documents/${nom}`,
    categorie,
    visibleExtranet,
    datePartage: visibleExtranet ? createMockTimestamp() : null,
    consultePar: [],
    uploadedBy: TEST_USER.uid,
    createdAt: createMockTimestamp(),
    updatedAt: createMockTimestamp(),
  };
}
