import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config';
import type { Paiement, CreatePaiementInput } from '@/types/paiement';
import { createHistoriqueEntry } from './historique';
import { IS_TEST_MODE, mockStore, generateTestId, createMockTimestamp } from '@/lib/test/mock-data';

/**
 * Récupère tous les paiements d'une copropriété
 */
export async function getPaiements(coproId: string): Promise<Paiement[]> {
  if (IS_TEST_MODE) {
    return [...mockStore.paiements].sort((a, b) =>
      b.datePaiement.seconds - a.datePaiement.seconds
    );
  }

  const paiementsQuery = query(
    collection(db, 'condos', coproId, 'payments'),
    orderBy('datePaiement', 'desc')
  );
  const snapshot = await getDocs(paiementsQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Paiement[];
}

/**
 * Observe les paiements en temps réel
 */
export function subscribeToPaiements(
  coproId: string,
  callback: (paiements: Paiement[]) => void
): Unsubscribe {
  if (IS_TEST_MODE) {
    callback([...mockStore.paiements].sort((a, b) =>
      b.datePaiement.seconds - a.datePaiement.seconds
    ));
    return () => {};
  }

  const paiementsQuery = query(
    collection(db, 'condos', coproId, 'payments'),
    orderBy('datePaiement', 'desc')
  );

  return onSnapshot(paiementsQuery, (snapshot) => {
    const paiements = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Paiement[];
    callback(paiements);
  });
}

/**
 * Récupère un paiement par ID
 */
export async function getPaiement(coproId: string, paiementId: string): Promise<Paiement | null> {
  if (IS_TEST_MODE) {
    return mockStore.paiements.find(p => p.id === paiementId) || null;
  }

  const paiementRef = doc(db, 'condos', coproId, 'payments', paiementId);
  const paiementDoc = await getDoc(paiementRef);

  if (!paiementDoc.exists()) {
    return null;
  }

  return { id: paiementDoc.id, ...paiementDoc.data() } as Paiement;
}

/**
 * Récupère les paiements d'un copropriétaire
 */
export async function getPaiementsByCoproprietaire(
  coproId: string,
  coproprietaireId: string
): Promise<Paiement[]> {
  if (IS_TEST_MODE) {
    return mockStore.paiements
      .filter(p => p.coproprietaireId === coproprietaireId)
      .sort((a, b) => b.datePaiement.seconds - a.datePaiement.seconds);
  }

  const paiementsQuery = query(
    collection(db, 'condos', coproId, 'payments'),
    where('coproprietaireId', '==', coproprietaireId),
    orderBy('datePaiement', 'desc')
  );
  const snapshot = await getDocs(paiementsQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Paiement[];
}

/**
 * Observe les paiements d'un copropriétaire en temps réel
 */
export function subscribeToPaiementsByCoproprietaire(
  coproId: string,
  coproprietaireId: string,
  callback: (paiements: Paiement[]) => void
): Unsubscribe {
  if (IS_TEST_MODE) {
    callback(mockStore.paiements
      .filter(p => p.coproprietaireId === coproprietaireId)
      .sort((a, b) => b.datePaiement.seconds - a.datePaiement.seconds)
    );
    return () => {};
  }

  const paiementsQuery = query(
    collection(db, 'condos', coproId, 'payments'),
    where('coproprietaireId', '==', coproprietaireId),
    orderBy('datePaiement', 'desc')
  );

  return onSnapshot(paiementsQuery, (snapshot) => {
    const paiements = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Paiement[];
    callback(paiements);
  });
}

/**
 * Crée un nouveau paiement
 */
export async function createPaiement(
  coproId: string,
  userId: string,
  userEmail: string,
  input: CreatePaiementInput
): Promise<Paiement> {
  if (IS_TEST_MODE) {
    const now = createMockTimestamp();
    const paiement: Paiement = {
      id: generateTestId(),
      coproprietaireId: input.coproprietaireId,
      montantCents: input.montantCents,
      datePaiement: now,
      reference: input.reference || null,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    };
    mockStore.paiements.push(paiement);
    return paiement;
  }

  const paiementRef = doc(collection(db, 'condos', coproId, 'payments'));
  const now = serverTimestamp();

  const paiement = {
    id: paiementRef.id,
    coproprietaireId: input.coproprietaireId,
    montantCents: input.montantCents,
    datePaiement: Timestamp.fromDate(input.datePaiement),
    reference: input.reference || null,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(paiementRef, paiement);

  // Créer l'entrée d'historique
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail,
    action: 'create',
    entityType: 'paiement',
    entityId: paiementRef.id,
    entityLabel: `Paiement ${(input.montantCents / 100).toFixed(2)} €`,
    before: null,
    after: paiement,
  });

  return paiement as unknown as Paiement;
}

/**
 * Met à jour un paiement
 */
export async function updatePaiement(
  coproId: string,
  paiementId: string,
  userId: string,
  userEmail: string,
  input: Partial<CreatePaiementInput>
): Promise<void> {
  if (IS_TEST_MODE) {
    const index = mockStore.paiements.findIndex(p => p.id === paiementId);
    if (index === -1) {
      throw new Error('Paiement non trouvé');
    }
    const updates: Partial<Paiement> = { updatedAt: createMockTimestamp() };
    if (input.coproprietaireId !== undefined) updates.coproprietaireId = input.coproprietaireId;
    if (input.montantCents !== undefined) updates.montantCents = input.montantCents;
    if (input.datePaiement !== undefined) updates.datePaiement = createMockTimestamp();
    if (input.reference !== undefined) updates.reference = input.reference || null;
    mockStore.paiements[index] = { ...mockStore.paiements[index]!, ...updates };
    return;
  }

  const paiementRef = doc(db, 'condos', coproId, 'payments', paiementId);
  const paiementDoc = await getDoc(paiementRef);

  if (!paiementDoc.exists()) {
    throw new Error('Paiement non trouvé');
  }

  const before = paiementDoc.data();
  const updates: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (input.coproprietaireId !== undefined) {
    updates.coproprietaireId = input.coproprietaireId;
  }
  if (input.montantCents !== undefined) {
    updates.montantCents = input.montantCents;
  }
  if (input.datePaiement !== undefined) {
    updates.datePaiement = Timestamp.fromDate(input.datePaiement);
  }
  if (input.reference !== undefined) {
    updates.reference = input.reference || null;
  }

  await updateDoc(paiementRef, updates);

  // Créer l'entrée d'historique
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail,
    action: 'update',
    entityType: 'paiement',
    entityId: paiementId,
    entityLabel: `Paiement ${((input.montantCents || before.montantCents) / 100).toFixed(2)} €`,
    before,
    after: { ...before, ...updates },
  });
}

/**
 * Supprime un paiement
 */
export async function deletePaiement(
  coproId: string,
  paiementId: string,
  userId: string,
  userEmail: string
): Promise<void> {
  if (IS_TEST_MODE) {
    const index = mockStore.paiements.findIndex(p => p.id === paiementId);
    if (index === -1) {
      throw new Error('Paiement non trouvé');
    }
    mockStore.paiements.splice(index, 1);
    return;
  }

  const paiementRef = doc(db, 'condos', coproId, 'payments', paiementId);
  const paiementDoc = await getDoc(paiementRef);

  if (!paiementDoc.exists()) {
    throw new Error('Paiement non trouvé');
  }

  const before = paiementDoc.data();

  await deleteDoc(paiementRef);

  // Créer l'entrée d'historique
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail,
    action: 'delete',
    entityType: 'paiement',
    entityId: paiementId,
    entityLabel: `Paiement ${(before.montantCents / 100).toFixed(2)} €`,
    before,
    after: null,
  });
}

/**
 * Calcule le total des paiements pour un copropriétaire
 */
export function calculateTotalPaiements(paiements: Paiement[]): number {
  return paiements.reduce((sum, p) => sum + p.montantCents, 0);
}
