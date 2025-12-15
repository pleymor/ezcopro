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
} from 'firebase/firestore';
import { db } from '../config';
import type { Lot, CreateLotInput, UpdateLotInput } from '@/types/lot';
import { createHistoriqueEntry } from './historique';

/**
 * Récupère tous les lots d'une copropriété
 */
export async function getLots(coproId: string): Promise<Lot[]> {
  const lotsQuery = query(
    collection(db, 'coproprietes', coproId, 'lots'),
    orderBy('numero', 'asc')
  );
  const snapshot = await getDocs(lotsQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Lot[];
}

/**
 * Observe les lots en temps réel
 */
export function subscribeToLots(
  coproId: string,
  callback: (lots: Lot[]) => void
): Unsubscribe {
  const lotsQuery = query(
    collection(db, 'coproprietes', coproId, 'lots'),
    orderBy('numero', 'asc')
  );

  return onSnapshot(lotsQuery, (snapshot) => {
    const lots = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Lot[];
    callback(lots);
  });
}

/**
 * Récupère un lot par ID
 */
export async function getLot(coproId: string, lotId: string): Promise<Lot | null> {
  const lotRef = doc(db, 'coproprietes', coproId, 'lots', lotId);
  const lotDoc = await getDoc(lotRef);

  if (!lotDoc.exists()) {
    return null;
  }

  return { id: lotDoc.id, ...lotDoc.data() } as Lot;
}

/**
 * Crée un nouveau lot
 */
export async function createLot(
  coproId: string,
  userId: string,
  input: CreateLotInput
): Promise<Lot> {
  const lotRef = doc(collection(db, 'coproprietes', coproId, 'lots'));
  const now = serverTimestamp();

  const lot = {
    id: lotRef.id,
    numero: input.numero,
    type: input.type,
    tantiemes: input.tantiemes,
    coproprietaireId: input.coproprietaireId,
    description: input.description || null,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(lotRef, lot);

  // Créer l'entrée d'historique
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail: '',
    action: 'create',
    entityType: 'lot',
    entityId: lotRef.id,
    entityLabel: `Lot ${input.numero}`,
    before: null,
    after: lot,
  });

  return lot as unknown as Lot;
}

/**
 * Met à jour un lot
 */
export async function updateLot(
  coproId: string,
  lotId: string,
  userId: string,
  input: UpdateLotInput
): Promise<void> {
  const lotRef = doc(db, 'coproprietes', coproId, 'lots', lotId);
  const lotDoc = await getDoc(lotRef);

  if (!lotDoc.exists()) {
    throw new Error('Lot non trouvé');
  }

  const before = lotDoc.data();

  await updateDoc(lotRef, {
    ...input,
    updatedAt: serverTimestamp(),
  });

  // Créer l'entrée d'historique
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail: '',
    action: 'update',
    entityType: 'lot',
    entityId: lotId,
    entityLabel: `Lot ${input.numero || before.numero}`,
    before,
    after: { ...before, ...input },
  });
}

/**
 * Supprime un lot
 */
export async function deleteLot(
  coproId: string,
  lotId: string,
  userId: string
): Promise<void> {
  const lotRef = doc(db, 'coproprietes', coproId, 'lots', lotId);
  const lotDoc = await getDoc(lotRef);

  if (!lotDoc.exists()) {
    throw new Error('Lot non trouvé');
  }

  const before = lotDoc.data();

  await deleteDoc(lotRef);

  // Créer l'entrée d'historique
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail: '',
    action: 'delete',
    entityType: 'lot',
    entityId: lotId,
    entityLabel: `Lot ${before.numero}`,
    before,
    after: null,
  });
}

/**
 * Récupère les lots d'un copropriétaire
 */
export async function getLotsByCoproprietaire(
  coproId: string,
  coproprietaireId: string
): Promise<Lot[]> {
  const lotsQuery = query(
    collection(db, 'coproprietes', coproId, 'lots'),
    where('coproprietaireId', '==', coproprietaireId),
    orderBy('numero', 'asc')
  );
  const snapshot = await getDocs(lotsQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Lot[];
}
