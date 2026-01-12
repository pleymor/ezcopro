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
  CleRepartition,
} from '@/types/assemblee-generale';

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
  members: [TEST_USER.uid],
  totalTantiemes: 500,
  createdBy: TEST_USER.uid,
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

// Clés de répartition (seed data)
export const TEST_CLES_REPARTITION: CleRepartition[] = [
  {
    id: 'tantiemes_generaux',
    nom: 'Tantièmes généraux',
    description: 'Charges communes générales',
  },
  {
    id: 'ascenseur',
    nom: 'Ascenseur',
    description: 'Charges d\'ascenseur (étages concernés)',
  },
  {
    id: 'chauffage',
    nom: 'Chauffage collectif',
    description: 'Charges de chauffage',
  },
];

// Test assemblées générales
export const TEST_ASSEMBLEES_GENERALES: AssembleeGenerale[] = [];

// Test résolutions
export const TEST_RESOLUTIONS: Resolution[] = [];

// Test présences
export const TEST_PRESENCES: Presence[] = [];

// Test votes
export const TEST_VOTES: Vote[] = [];

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
}

// Helper to generate ID
export function generateTestId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to create a mock timestamp for test operations
export function createMockTimestamp(): { seconds: number; nanoseconds: number } {
  return mockTimestamp();
}
