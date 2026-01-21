import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../config';
import type { Condo, CreateCondoInput, UpdateCondoInput } from '@/types/condo';

const COLLECTION = 'condos';

/**
 * Create a new condo
 * The creator becomes the owner (syndic)
 */
export async function createCondo(
  userId: string,
  input: CreateCondoInput
): Promise<Condo> {
  const condoRef = doc(collection(db, COLLECTION));
  const now = serverTimestamp();

  const condo = {
    id: condoRef.id,
    name: input.name,
    address: input.address,
    ownerId: userId,
    boardMemberIds: [],
    totalShares: 0,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(condoRef, condo);

  return condo as unknown as Condo;
}

/**
 * Get a condo by ID
 */
export async function getCondo(id: string): Promise<Condo | null> {
  const condoRef = doc(db, COLLECTION, id);
  const condoDoc = await getDoc(condoRef);

  if (!condoDoc.exists()) {
    return null;
  }

  return { id: condoDoc.id, ...condoDoc.data() } as Condo;
}

/**
 * Get all condos accessible by a user (as syndic or board member)
 * Excludes soft-deleted condos
 */
export async function getUserCondos(userId: string): Promise<Condo[]> {
  try {
    // Query 1: Condos where user is the owner (syndic)
    const ownerQuery = query(
      collection(db, COLLECTION),
      where('ownerId', '==', userId)
    );

    // Query 2: Condos where user is a board member
    const boardMemberQuery = query(
      collection(db, COLLECTION),
      where('boardMemberIds', 'array-contains', userId)
    );

    const [ownerSnapshot, boardSnapshot] = await Promise.all([
      getDocs(ownerQuery),
      getDocs(boardMemberQuery),
    ]);

    // Merge results, avoiding duplicates
    const condoMap = new Map<string, Condo>();

    ownerSnapshot.docs.forEach(doc => {
      const data = doc.data();
      // Skip soft-deleted condos
      if (!data.deletedAt) {
        condoMap.set(doc.id, { id: doc.id, ...data } as Condo);
      }
    });

    boardSnapshot.docs.forEach(doc => {
      const data = doc.data();
      // Skip soft-deleted condos
      if (!condoMap.has(doc.id) && !data.deletedAt) {
        condoMap.set(doc.id, { id: doc.id, ...data } as Condo);
      }
    });

    return Array.from(condoMap.values());
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission')) {
      return [];
    }
    throw error;
  }
}

/**
 * Update a condo
 */
export async function updateCondo(
  condoId: string,
  input: UpdateCondoInput
): Promise<void> {
  const condoRef = doc(db, COLLECTION, condoId);

  await updateDoc(condoRef, {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Hard delete a condo (permanent)
 */
export async function deleteCondo(condoId: string): Promise<void> {
  const condoRef = doc(db, COLLECTION, condoId);
  await deleteDoc(condoRef);
}

/**
 * Soft delete a condo (marks as deleted but keeps data)
 */
export async function softDeleteCondo(condoId: string): Promise<void> {
  const condoRef = doc(db, COLLECTION, condoId);
  await updateDoc(condoRef, {
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Restore a soft-deleted condo
 */
export async function restoreCondo(condoId: string): Promise<void> {
  const condoRef = doc(db, COLLECTION, condoId);
  await updateDoc(condoRef, {
    deletedAt: null,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Add a board member to a condo
 */
export async function addBoardMember(
  condoId: string,
  userId: string
): Promise<void> {
  const condoRef = doc(db, COLLECTION, condoId);

  await updateDoc(condoRef, {
    boardMemberIds: arrayUnion(userId),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Remove a board member from a condo
 */
export async function removeBoardMember(
  condoId: string,
  userId: string
): Promise<void> {
  const condoRef = doc(db, COLLECTION, condoId);

  await updateDoc(condoRef, {
    boardMemberIds: arrayRemove(userId),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Transfer ownership of a condo to another user
 */
export async function transferOwnership(
  condoId: string,
  newOwnerId: string
): Promise<void> {
  const condoRef = doc(db, COLLECTION, condoId);

  await updateDoc(condoRef, {
    ownerId: newOwnerId,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update total shares for a condo
 */
export async function updateTotalShares(
  condoId: string,
  totalShares: number
): Promise<void> {
  const condoRef = doc(db, COLLECTION, condoId);

  await updateDoc(condoRef, {
    totalShares,
    updatedAt: serverTimestamp(),
  });
}
