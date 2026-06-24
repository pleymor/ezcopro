/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Copropriete } from '@/types/copropriete';
import type { Lot } from '@/types/lot';
import type { Coproprietaire } from '@/types/coproprietaire';
import type { AppelDeFonds } from '@/types/appel';
import type { Paiement } from '@/types/paiement';
import type {
  AssembleeGenerale,
  Resolution,
  Presence,
  Vote,
} from '@/types/assemblee-generale';
import type { CleRepartition } from '@/lib/schemas/cle-repartition';
import type { Dossier } from '@/types/dossier';
import type { DocumentPartage } from '@/types/document-partage';

// Test mode check
export const IS_TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === 'true';

// Helper to create a mock Firestore timestamp
function mockTimestamp(date: Date = new Date()): { seconds: number; nanoseconds: number } {
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: (date.getTime() % 1000) * 1000000,
  };
}

// Test user
export const TEST_USER = {
  uid: 'test-user-123',
  email: 'test@ezcopro.local',
  displayName: 'Test User',
  photoURL: null,
};

// Test copropriété
export const TEST_COPRO: Copropriete = {
  id: 'test-copro-123',
  nom: 'Résidence Test',
  adresse: '123 Rue du Test, 75001 Paris',
  membres: {
    [TEST_USER.uid]: {
      role: 'admin',
      email: TEST_USER.email,
      addedAt: mockTimestamp(new Date('2024-01-01')),
      addedBy: TEST_USER.uid,
    },
  },
  memberIds: [TEST_USER.uid],
  totalTantiemes: 500,
  createdAt: mockTimestamp(new Date('2024-01-01')),
  updatedAt: mockTimestamp(new Date('2024-01-01')),
};

// Test copropriétaires
export const TEST_COPROPRIETAIRES: Coproprietaire[] = [
  {
    id: 'test-cp-1',
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@example.com',
    telephone: '0612345678',
    userId: null,
    isAnonymized: false,
    createdAt: mockTimestamp(new Date('2024-01-01')),
    updatedAt: mockTimestamp(new Date('2024-01-01')),
  },
  {
    id: 'test-cp-2',
    nom: 'Martin',
    prenom: 'Marie',
    email: 'marie.martin@example.com',
    telephone: null,
    userId: null,
    isAnonymized: false,
    createdAt: mockTimestamp(new Date('2024-01-01')),
    updatedAt: mockTimestamp(new Date('2024-01-01')),
  },
];

// Test lots
export const TEST_LOTS: Lot[] = [
  {
    id: 'test-lot-1',
    numero: '101',
    type: 'appartement',
    tantiemes: 250,
    coproprietaireId: 'test-cp-1',
    description: null,
    createdAt: mockTimestamp(new Date('2024-01-01')),
    updatedAt: mockTimestamp(new Date('2024-01-01')),
  },
  {
    id: 'test-lot-2',
    numero: '102',
    type: 'appartement',
    tantiemes: 200,
    coproprietaireId: 'test-cp-2',
    description: null,
    createdAt: mockTimestamp(new Date('2024-01-01')),
    updatedAt: mockTimestamp(new Date('2024-01-01')),
  },
  {
    id: 'test-lot-3',
    numero: 'P01',
    type: 'parking',
    tantiemes: 50,
    coproprietaireId: 'test-cp-1',
    description: null,
    createdAt: mockTimestamp(new Date('2024-01-01')),
    updatedAt: mockTimestamp(new Date('2024-01-01')),
  },
];

// Test appels de fonds
export const TEST_APPELS: AppelDeFonds[] = [
  {
    id: 'test-appel-1',
    libelle: 'Charges Q1 2024',
    montantTotalCents: 150000,
    dateEcheance: mockTimestamp(new Date('2024-03-31')),
    dateCreation: mockTimestamp(new Date('2024-01-15')),
    createdBy: 'test-user-123',
    createdAt: mockTimestamp(new Date('2024-01-15')),
    updatedAt: mockTimestamp(new Date('2024-01-15')),
  },
];

// Test paiements
export const TEST_PAIEMENTS: Paiement[] = [
  {
    id: 'test-paiement-1',
    coproprietaireId: 'test-cp-1',
    montantCents: 50000,
    datePaiement: mockTimestamp(new Date('2024-02-01')),
    reference: 'VIR-001',
    createdBy: 'test-user-123',
    createdAt: mockTimestamp(new Date('2024-02-01')),
    updatedAt: mockTimestamp(new Date('2024-02-01')),
  },
];

// ============================================
// ASSEMBLÉES GÉNÉRALES - MOCK DATA
// ============================================

// Clés de répartition (seed data with full schema)
export const TEST_CLES_REPARTITION: CleRepartition[] = [
  {
    id: 'tantiemes_generaux',
    nom: 'Tantièmes généraux',
    description: 'Charges communes générales',
    quoteParts: [
      { lotId: 'test-lot-1', valeur: 5000 }, // 250/500 * 10000
      { lotId: 'test-lot-2', valeur: 4000 }, // 200/500 * 10000
      { lotId: 'test-lot-3', valeur: 1000 }, // 50/500 * 10000
    ],
    isDefault: true,
    createdAt: mockTimestamp(new Date('2024-01-01')),
    updatedAt: mockTimestamp(new Date('2024-01-01')),
  },
  {
    id: 'ascenseur',
    nom: 'Ascenseur',
    description: 'Charges d\'ascenseur (étages concernés)',
    quoteParts: [
      { lotId: 'test-lot-1', valeur: 5556 },
      { lotId: 'test-lot-2', valeur: 4444 },
      { lotId: 'test-lot-3', valeur: 0 }, // Parking excluded
    ],
    isDefault: false,
    createdAt: mockTimestamp(new Date('2024-01-01')),
    updatedAt: mockTimestamp(new Date('2024-01-01')),
  },
  {
    id: 'chauffage',
    nom: 'Chauffage collectif',
    description: 'Charges de chauffage',
    quoteParts: [
      { lotId: 'test-lot-1', valeur: 5556 },
      { lotId: 'test-lot-2', valeur: 4444 },
      { lotId: 'test-lot-3', valeur: 0 }, // Parking excluded
    ],
    isDefault: false,
    createdAt: mockTimestamp(new Date('2024-01-01')),
    updatedAt: mockTimestamp(new Date('2024-01-01')),
  },
];

// Test assemblées générales
export const TEST_ASSEMBLEES_GENERALES: AssembleeGenerale[] = [
  {
    id: 'test-ag-1',
    type: 'ordinaire',
    date: mockTimestamp(new Date('2025-03-15')),
    heure: '18:00',
    lieu: 'Salle de réunion',
    statut: 'brouillon',
    dateConvocation: null,
    totalTantiemes: 450,
    createdAt: mockTimestamp(new Date('2024-01-01')),
    updatedAt: mockTimestamp(new Date('2024-01-01')),
  },
];

// Test résolutions
export const TEST_RESOLUTIONS: Resolution[] = [];

// Test présences
export const TEST_PRESENCES: Presence[] = [];

// Test votes
export const TEST_VOTES: Vote[] = [];

// ============================================
// GED DOSSIERS - MOCK DATA
// ============================================

// Test dossiers (folder hierarchy)
export const TEST_DOSSIERS: Dossier[] = [
  {
    id: 'test-folder-1',
    nom: 'Contrats',
    parentId: null,
    path: '/Contrats',
    depth: 0,
    niveauAcces: 'tous',
    coproprieteId: 'test-copro-123',
    createdAt: mockTimestamp(new Date('2024-06-01')),
    updatedAt: mockTimestamp(new Date('2024-06-01')),
    createdBy: 'test-user-123',
  },
  {
    id: 'test-folder-2',
    nom: 'AG',
    parentId: null,
    path: '/AG',
    depth: 0,
    niveauAcces: 'tous',
    coproprieteId: 'test-copro-123',
    createdAt: mockTimestamp(new Date('2024-06-01')),
    updatedAt: mockTimestamp(new Date('2024-06-01')),
    createdBy: 'test-user-123',
  },
  {
    id: 'test-folder-3',
    nom: 'Privé Syndic',
    parentId: null,
    path: '/Privé Syndic',
    depth: 0,
    niveauAcces: 'syndic',
    coproprieteId: 'test-copro-123',
    createdAt: mockTimestamp(new Date('2024-06-01')),
    updatedAt: mockTimestamp(new Date('2024-06-01')),
    createdBy: 'test-user-123',
  },
  {
    id: 'test-folder-4',
    nom: 'Documents Conseil',
    parentId: null,
    path: '/Documents Conseil',
    depth: 0,
    niveauAcces: 'conseil',
    coproprieteId: 'test-copro-123',
    createdAt: mockTimestamp(new Date('2024-06-01')),
    updatedAt: mockTimestamp(new Date('2024-06-01')),
    createdBy: 'test-user-123',
  },
  {
    id: 'test-folder-1-sub',
    nom: '2024',
    parentId: 'test-folder-1',
    path: '/Contrats/2024',
    depth: 1,
    niveauAcces: 'tous',
    coproprieteId: 'test-copro-123',
    createdAt: mockTimestamp(new Date('2024-06-15')),
    updatedAt: mockTimestamp(new Date('2024-06-15')),
    createdBy: 'test-user-123',
  },
];

// Test documents with folder support
export const TEST_DOCUMENTS: DocumentPartage[] = [
  {
    id: 'test-doc-1',
    nom: 'Règlement de copropriété',
    type: 'application/pdf',
    taille: 1024 * 500,
    storagePath: 'coproprietes/test-copro-123/documents/reglement.pdf',
    categorie: 'reglement',
    visibleExtranet: true,
    dossierId: null,
    niveauAcces: 'tous',
    datePartage: mockTimestamp(new Date('2024-06-01')),
    consultePar: [],
    uploadedBy: 'test-user-123',
    createdAt: mockTimestamp(new Date('2024-01-01')),
    updatedAt: mockTimestamp(new Date('2024-06-01')),
  },
  {
    id: 'test-doc-2',
    nom: 'PV AG 2024',
    type: 'application/pdf',
    taille: 1024 * 250,
    storagePath: 'coproprietes/test-copro-123/documents/pv-ag-2024.pdf',
    categorie: 'ag',
    visibleExtranet: true,
    dossierId: 'test-folder-2',
    niveauAcces: 'tous',
    datePartage: mockTimestamp(new Date('2024-06-15')),
    consultePar: ['test-cp-1'],
    uploadedBy: 'test-user-123',
    createdAt: mockTimestamp(new Date('2024-06-15')),
    updatedAt: mockTimestamp(new Date('2024-06-15')),
  },
  {
    id: 'test-doc-3',
    nom: 'Contrat ascenseur',
    type: 'application/pdf',
    taille: 1024 * 150,
    storagePath: 'coproprietes/test-copro-123/documents/contrat-ascenseur.pdf',
    categorie: 'contrats',
    visibleExtranet: false,
    dossierId: 'test-folder-1-sub',
    niveauAcces: 'syndic',
    datePartage: null,
    consultePar: [],
    uploadedBy: 'test-user-123',
    createdAt: mockTimestamp(new Date('2024-03-01')),
    updatedAt: mockTimestamp(new Date('2024-03-01')),
  },
  {
    id: 'test-doc-4',
    nom: 'Budget prévisionnel',
    type: 'application/pdf',
    taille: 1024 * 200,
    storagePath: 'coproprietes/test-copro-123/documents/budget.pdf',
    categorie: 'autres',
    visibleExtranet: false,
    dossierId: 'test-folder-4',
    niveauAcces: 'conseil',
    datePartage: mockTimestamp(new Date('2024-07-01')),
    consultePar: [],
    uploadedBy: 'test-user-123',
    createdAt: mockTimestamp(new Date('2024-07-01')),
    updatedAt: mockTimestamp(new Date('2024-07-01')),
  },
];

// Mock data store (mutable for tests)
export const mockStore = {
  coproprietes: [TEST_COPRO] as Copropriete[],
  lots: [...TEST_LOTS] as Lot[],
  coproprietaires: [...TEST_COPROPRIETAIRES] as Coproprietaire[],
  appels: [...TEST_APPELS] as AppelDeFonds[],
  paiements: [...TEST_PAIEMENTS] as Paiement[],
  historique: [] as Array<{
    id: string;
    action: 'create' | 'update' | 'delete';
    entityType: string;
    entityId: string;
    entityLabel: string;
    userId: string;
    timestamp: Date;
  }>,
  // Assemblées générales
  clesRepartition: [...TEST_CLES_REPARTITION] as CleRepartition[],
  assembleesGenerales: [...TEST_ASSEMBLEES_GENERALES] as AssembleeGenerale[],
  resolutions: [...TEST_RESOLUTIONS] as Resolution[],
  presences: [...TEST_PRESENCES] as Presence[],
  votes: [...TEST_VOTES] as Vote[],
  // GED - Dossiers
  dossiers: [...TEST_DOSSIERS] as Dossier[],
  documents: [...TEST_DOCUMENTS] as DocumentPartage[],
};

// Helper to reset mock data
export function resetMockData(): void {
  mockStore.lots = [...TEST_LOTS];
  mockStore.coproprietaires = [...TEST_COPROPRIETAIRES];
  mockStore.appels = [...TEST_APPELS];
  mockStore.paiements = [...TEST_PAIEMENTS];
  mockStore.historique = [];
  // Assemblées générales
  mockStore.clesRepartition = [...TEST_CLES_REPARTITION];
  mockStore.assembleesGenerales = [...TEST_ASSEMBLEES_GENERALES];
  mockStore.resolutions = [...TEST_RESOLUTIONS];
  mockStore.presences = [...TEST_PRESENCES];
  mockStore.votes = [...TEST_VOTES];
  // GED - Dossiers
  mockStore.dossiers = [...TEST_DOSSIERS];
  mockStore.documents = [...TEST_DOCUMENTS];
}

// Helper to generate ID
export function generateTestId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to create a mock timestamp for test operations
export function createMockTimestamp(): { seconds: number; nanoseconds: number } {
  return mockTimestamp();
}
