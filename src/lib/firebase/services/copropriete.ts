import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../config';
import type { Copropriete, CreateCoproprieteInput, UpdateCoproprieteInput } from '@/types/copropriete';
import { createHistoriqueEntry } from './historique';

/**
 * Crée une nouvelle copropriété
 */
export async function createCopropriete(
  userId: string,
  userEmail: string,
  input: CreateCoproprieteInput
): Promise<Copropriete> {
  const coproRef = doc(collection(db, 'coproprietes'));
  const now = serverTimestamp();

  const copropriete = {
    id: coproRef.id,
    nom: input.nom,
    adresse: input.adresse,
    membres: {
      [userId]: {
        role: 'admin',
        email: userEmail,
        addedAt: now,
        addedBy: userId,
      },
    },
    memberIds: [userId],
    totalTantiemes: 0,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(coproRef, copropriete);

  // Créer l'entrée d'historique
  await createHistoriqueEntry(coproRef.id, {
    userId,
    userEmail,
    action: 'create',
    entityType: 'copropriete',
    entityId: coproRef.id,
    entityLabel: input.nom,
    before: null,
    after: copropriete,
  });

  return copropriete as unknown as Copropriete;
}

/**
 * Récupère une copropriété par ID
 */
export async function getCopropriete(id: string): Promise<Copropriete | null> {
  const coproRef = doc(db, 'coproprietes', id);
  const coproDoc = await getDoc(coproRef);

  if (!coproDoc.exists()) {
    return null;
  }

  return { id: coproDoc.id, ...coproDoc.data() } as Copropriete;
}

/**
 * Récupère toutes les copropriétés d'un utilisateur
 * Query directe sur memberIds (array-contains)
 */
export async function getUserCoproprietes(userId: string): Promise<Copropriete[]> {
  try {
    const coproQuery = query(
      collection(db, 'coproprietes'),
      where('memberIds', 'array-contains', userId)
    );

    const snapshot = await getDocs(coproQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Copropriete));
  } catch (error) {
    // Firestore renvoie "permission-denied" si pas de droits
    if (error instanceof Error && error.message.includes('permission')) {
      return [];
    }
    throw error;
  }
}

/**
 * Met à jour une copropriété
 */
export async function updateCopropriete(
  coproId: string,
  userId: string,
  userEmail: string,
  input: UpdateCoproprieteInput
): Promise<void> {
  const coproRef = doc(db, 'coproprietes', coproId);
  const coproDoc = await getDoc(coproRef);

  if (!coproDoc.exists()) {
    throw new Error('Copropriété non trouvée');
  }

  const before = coproDoc.data();

  await updateDoc(coproRef, {
    ...input,
    updatedAt: serverTimestamp(),
  });

  // Créer l'entrée d'historique
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail,
    action: 'update',
    entityType: 'copropriete',
    entityId: coproId,
    entityLabel: input.nom || before.nom,
    before,
    after: { ...before, ...input },
  });
}

/**
 * Ajoute un membre à une copropriété
 * Met à jour membres (map) et memberIds (array) de manière atomique
 */
export async function addMemberToCopropriete(
  coproId: string,
  userId: string,
  role: 'admin' | 'gestionnaire' | 'lecteur',
  addedBy: string,
  userInfo?: { email?: string; displayName?: string }
): Promise<void> {
  const coproRef = doc(db, 'coproprietes', coproId);
  const now = serverTimestamp();

  const membre: Record<string, unknown> = {
    role,
    addedBy,
    addedAt: now,
  };

  if (userInfo?.email) {
    membre.email = userInfo.email;
  }
  if (userInfo?.displayName) {
    membre.displayName = userInfo.displayName;
  }

  await updateDoc(coproRef, {
    [`membres.${userId}`]: membre,
    memberIds: arrayUnion(userId),
    updatedAt: now,
  });
}

/**
 * Retire un membre d'une copropriété
 */
export async function removeMemberFromCopropriete(
  coproId: string,
  userId: string
): Promise<void> {
  const coproRef = doc(db, 'coproprietes', coproId);
  const now = serverTimestamp();
  const { deleteField } = await import('firebase/firestore');

  await updateDoc(coproRef, {
    [`membres.${userId}`]: deleteField(),
    memberIds: arrayRemove(userId),
    updatedAt: now,
  });
}
