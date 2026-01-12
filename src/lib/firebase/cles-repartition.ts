import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import type {
  CleRepartition,
  CreateCleRepartitionInput,
  UpdateCleRepartitionInput,
  QuotePart,
} from '@/lib/schemas/cle-repartition';
import {
  CleRepartitionError,
  createQuotePartsFromTantiemes,
} from '@/lib/schemas/cle-repartition';

// Collection reference helper
function getClesRef(coproId: string) {
  return collection(db, 'coproprietes', coproId, 'clesRepartition');
}

// Document reference helper
function getCleRef(coproId: string, cleId: string) {
  return doc(db, 'coproprietes', coproId, 'clesRepartition', cleId);
}

/**
 * Get all clés de répartition for a copropriété
 */
export async function getClesRepartition(coproId: string): Promise<CleRepartition[]> {
  const q = query(getClesRef(coproId), orderBy('nom', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as CleRepartition[];
}

/**
 * Get a single clé de répartition by ID
 */
export async function getCleRepartition(
  coproId: string,
  cleId: string
): Promise<CleRepartition | null> {
  const docRef = getCleRef(coproId, cleId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    return null;
  }
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as CleRepartition;
}

/**
 * Check if a clé name already exists (for uniqueness validation)
 */
export async function checkCleNameExists(
  coproId: string,
  nom: string,
  excludeId?: string
): Promise<boolean> {
  const q = query(getClesRef(coproId), where('nom', '==', nom), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return false;
  const firstDoc = snapshot.docs[0];
  if (excludeId && firstDoc && firstDoc.id === excludeId) return false;
  return true;
}

/**
 * Create a new clé de répartition
 */
export async function createCleRepartition(
  coproId: string,
  input: CreateCleRepartitionInput
): Promise<string> {
  // Check name uniqueness
  const nameExists = await checkCleNameExists(coproId, input.nom);
  if (nameExists) {
    throw new CleRepartitionError(
      'CLE_NAME_EXISTS',
      'Une clé de répartition avec ce nom existe déjà'
    );
  }

  const docRef = await addDoc(getClesRef(coproId), {
    nom: input.nom,
    description: input.description ?? null,
    quoteParts: input.quoteParts,
    isDefault: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Update an existing clé de répartition
 */
export async function updateCleRepartition(
  coproId: string,
  cleId: string,
  input: UpdateCleRepartitionInput
): Promise<void> {
  // If name is being changed, check uniqueness
  if (input.nom) {
    const nameExists = await checkCleNameExists(coproId, input.nom, cleId);
    if (nameExists) {
      throw new CleRepartitionError(
        'CLE_NAME_EXISTS',
        'Une clé de répartition avec ce nom existe déjà'
      );
    }
  }

  const docRef = getCleRef(coproId, cleId);
  const updateData: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (input.nom !== undefined) updateData.nom = input.nom;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.quoteParts !== undefined) updateData.quoteParts = input.quoteParts;

  await updateDoc(docRef, updateData);
}

/**
 * Check if a clé is used in any appel de fonds
 */
export async function isCleInUse(coproId: string, cleId: string): Promise<boolean> {
  const appelsRef = collection(db, 'coproprietes', coproId, 'appels');
  const q = query(appelsRef, where('cleRepartitionId', '==', cleId), limit(1));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/**
 * Delete a clé de répartition (with protection for keys in use)
 */
export async function deleteCleRepartition(
  coproId: string,
  cleId: string
): Promise<void> {
  // Check if the key exists and is not default
  const cle = await getCleRepartition(coproId, cleId);
  if (!cle) {
    throw new CleRepartitionError('CLE_NOT_FOUND', 'Clé de répartition introuvable');
  }
  if (cle.isDefault) {
    throw new CleRepartitionError(
      'CLE_IS_DEFAULT',
      'La clé par défaut ne peut pas être supprimée'
    );
  }

  // Check if key is in use
  const inUse = await isCleInUse(coproId, cleId);
  if (inUse) {
    throw new CleRepartitionError(
      'CLE_IN_USE',
      'Cette clé est utilisée dans un ou plusieurs appels de fonds et ne peut pas être supprimée'
    );
  }

  await deleteDoc(getCleRef(coproId, cleId));
}

/**
 * Create the default "Tantièmes généraux" key from lot data
 */
export async function createDefaultCleRepartition(
  coproId: string,
  lots: Array<{ id: string; tantiemes: number }>
): Promise<string> {
  const quoteParts = createQuotePartsFromTantiemes(lots);

  const docRef = await addDoc(getClesRef(coproId), {
    nom: 'Tantièmes généraux',
    description: 'Clé par défaut basée sur les tantièmes des lots',
    quoteParts,
    isDefault: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Subscribe to clés de répartition changes (real-time)
 */
export function subscribeToClesRepartition(
  coproId: string,
  callback: (cles: CleRepartition[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(getClesRef(coproId), orderBy('nom', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const cles = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CleRepartition[];
      callback(cles);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

// Re-export helper for convenience
export { createQuotePartsFromTantiemes };
export type { QuotePart };
