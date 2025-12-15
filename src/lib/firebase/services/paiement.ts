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

/**
 * Récupère tous les paiements d'une copropriété
 */
export async function getPaiements(coproId: string): Promise<Paiement[]> {
  const paiementsQuery = query(
    collection(db, 'coproprietes', coproId, 'paiements'),
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
  const paiementsQuery = query(
    collection(db, 'coproprietes', coproId, 'paiements'),
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
  const paiementRef = doc(db, 'coproprietes', coproId, 'paiements', paiementId);
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
  const paiementsQuery = query(
    collection(db, 'coproprietes', coproId, 'paiements'),
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
  const paiementsQuery = query(
    collection(db, 'coproprietes', coproId, 'paiements'),
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
  input: CreatePaiementInput
): Promise<Paiement> {
  const paiementRef = doc(collection(db, 'coproprietes', coproId, 'paiements'));
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
    userEmail: '',
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
  input: Partial<CreatePaiementInput>
): Promise<void> {
  const paiementRef = doc(db, 'coproprietes', coproId, 'paiements', paiementId);
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
    userEmail: '',
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
  userId: string
): Promise<void> {
  const paiementRef = doc(db, 'coproprietes', coproId, 'paiements', paiementId);
  const paiementDoc = await getDoc(paiementRef);

  if (!paiementDoc.exists()) {
    throw new Error('Paiement non trouvé');
  }

  const before = paiementDoc.data();

  await deleteDoc(paiementRef);

  // Créer l'entrée d'historique
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail: '',
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
