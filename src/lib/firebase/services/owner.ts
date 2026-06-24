import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config';
import type { Owner, CreateOwnerInput, UpdateOwnerInput } from '@/types/owner';

/**
 * Get all owners for a condo
 */
export async function getOwners(condoId: string): Promise<Owner[]> {
  const ownerQuery = query(
    collection(db, 'condos', condoId, 'owners'),
    orderBy('lastName', 'asc')
  );
  const snapshot = await getDocs(ownerQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Owner[];
}

/**
 * Subscribe to owners in real-time
 */
export function subscribeToOwners(
  condoId: string,
  callback: (owners: Owner[]) => void
): Unsubscribe {
  const ownerQuery = query(
    collection(db, 'condos', condoId, 'owners'),
    orderBy('lastName', 'asc')
  );

  return onSnapshot(ownerQuery, (snapshot) => {
    const owners = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Owner[];
    callback(owners);
  });
}

/**
 * Get an owner by ID
 */
export async function getOwner(
  condoId: string,
  ownerId: string
): Promise<Owner | null> {
  const ownerRef = doc(db, 'condos', condoId, 'owners', ownerId);
  const ownerDoc = await getDoc(ownerRef);

  if (!ownerDoc.exists()) {
    return null;
  }

  return { id: ownerDoc.id, ...ownerDoc.data() } as Owner;
}

/**
 * Find an owner by their linked Firebase user ID
 */
export async function getOwnerByUserId(
  condoId: string,
  userId: string
): Promise<Owner | null> {
  const ownerQuery = query(
    collection(db, 'condos', condoId, 'owners'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(ownerQuery);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0]!;
  return { id: doc.id, ...doc.data() } as Owner;
}

/**
 * Create a new owner
 */
export async function createOwner(
  condoId: string,
  input: CreateOwnerInput
): Promise<Owner> {
  const ownerRef = doc(collection(db, 'condos', condoId, 'owners'));
  const now = serverTimestamp();

  const owner = {
    id: ownerRef.id,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email || null,
    phone: input.phone || null,
    userId: null,
    isBoardMember: input.isBoardMember ?? false,
    isAnonymized: false,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(ownerRef, owner);

  return owner as unknown as Owner;
}

/**
 * Update an owner
 */
export async function updateOwner(
  condoId: string,
  ownerId: string,
  input: UpdateOwnerInput
): Promise<void> {
  const ownerRef = doc(db, 'condos', condoId, 'owners', ownerId);

  await updateDoc(ownerRef, {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Link an owner to a Firebase user account
 * If the owner is a board member, also add them to condo.boardMemberIds
 */
export async function linkOwnerToUser(
  condoId: string,
  ownerId: string,
  userId: string
): Promise<void> {
  const ownerRef = doc(db, 'condos', condoId, 'owners', ownerId);

  // Get the owner to check if they're a board member
  const ownerDoc = await getDoc(ownerRef);
  const ownerData = ownerDoc.data();

  await updateDoc(ownerRef, {
    userId,
    updatedAt: serverTimestamp(),
  });

  // If owner is a board member, add their userId to condo.boardMemberIds
  if (ownerData?.isBoardMember) {
    const { arrayUnion } = await import('firebase/firestore');
    const condoRef = doc(db, 'condos', condoId);
    await updateDoc(condoRef, {
      boardMemberIds: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Unlink an owner from their Firebase user account
 */
export async function unlinkOwnerFromUser(
  condoId: string,
  ownerId: string
): Promise<void> {
  const ownerRef = doc(db, 'condos', condoId, 'owners', ownerId);

  await updateDoc(ownerRef, {
    userId: null,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Anonymize an owner (GDPR compliance)
 */
export async function anonymizeOwner(
  condoId: string,
  ownerId: string
): Promise<void> {
  const ownerRef = doc(db, 'condos', condoId, 'owners', ownerId);

  await updateDoc(ownerRef, {
    firstName: 'Former',
    lastName: 'Owner',
    email: null,
    phone: null,
    userId: null,
    isAnonymized: true,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get all board members for a condo
 */
export async function getBoardMembers(condoId: string): Promise<Owner[]> {
  const ownerQuery = query(
    collection(db, 'condos', condoId, 'owners'),
    where('isBoardMember', '==', true),
    orderBy('lastName', 'asc')
  );
  const snapshot = await getDocs(ownerQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Owner[];
}

/**
 * Set an owner as president of the board
 * Only one president at a time - removes status from previous president
 */
export async function setPresidentStatus(
  condoId: string,
  ownerId: string,
  isPresident: boolean
): Promise<void> {
  const ownersRef = collection(db, 'condos', condoId, 'owners');

  // If setting as president, first remove president status from others
  if (isPresident) {
    const presidentsQuery = query(ownersRef, where('isPresident', '==', true));
    const snapshot = await getDocs(presidentsQuery);

    const updates = snapshot.docs.map((docSnap) =>
      updateDoc(docSnap.ref, {
        isPresident: false,
        updatedAt: serverTimestamp(),
      })
    );
    await Promise.all(updates);
  }

  // Update the target owner
  const ownerRef = doc(db, 'condos', condoId, 'owners', ownerId);
  await updateDoc(ownerRef, {
    isPresident,
    // If becoming president, also ensure they're a board member
    ...(isPresident && { isBoardMember: true }),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Set an owner as board member
 * If the owner has a linked userId, also update condo.boardMemberIds
 */
export async function setBoardMemberStatus(
  condoId: string,
  ownerId: string,
  isBoardMember: boolean
): Promise<void> {
  const ownerRef = doc(db, 'condos', condoId, 'owners', ownerId);

  // Get the owner to check if they have a linked userId
  const ownerDoc = await getDoc(ownerRef);
  const ownerData = ownerDoc.data();

  // If userId is null, try to sync from accepted invitation
  let userId = ownerData?.userId;
  if (!userId) {
    const syncResult = await syncOwnerFromInvitation(condoId, ownerId);
    if (syncResult.synced && syncResult.userId) {
      userId = syncResult.userId;
    }
  }

  // Build update object
  const ownerUpdate: Record<string, unknown> = {
    isBoardMember,
    updatedAt: serverTimestamp(),
  };

  // Set or clear nomination date and president status
  if (isBoardMember) {
    ownerUpdate.dateNominationConseil = serverTimestamp();
  } else {
    ownerUpdate.dateNominationConseil = null;
    ownerUpdate.isPresident = false; // Can't be president if not board member
  }

  await updateDoc(ownerRef, ownerUpdate);

  // If owner has a linked userId, update condo.boardMemberIds
  if (userId) {
    const { arrayUnion, arrayRemove } = await import('firebase/firestore');
    const condoRef = doc(db, 'condos', condoId);
    await updateDoc(condoRef, {
      boardMemberIds: isBoardMember
        ? arrayUnion(userId)
        : arrayRemove(userId),
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Sync userId from accepted invitation to owner document
 * Used to fix data when linkOwnerToUser failed during invitation acceptance
 */
export async function syncOwnerFromInvitation(
  condoId: string,
  ownerId: string
): Promise<{ synced: boolean; userId?: string }> {
  // Find accepted invitation for this owner
  const invitationsQuery = query(
    collection(db, 'ownerInvitations'),
    where('coproprietaireId', '==', ownerId),
    where('statut', '==', 'acceptee')
  );
  const snapshot = await getDocs(invitationsQuery);

  if (snapshot.empty) {
    return { synced: false };
  }

  const invitation = snapshot.docs[0]?.data();
  const acceptedBy = invitation?.acceptedBy;

  if (!acceptedBy) {
    return { synced: false };
  }

  // Update owner document with userId
  const ownerRef = doc(db, 'condos', condoId, 'owners', ownerId);
  await updateDoc(ownerRef, {
    userId: acceptedBy,
    updatedAt: serverTimestamp(),
  });

  // Check if owner is a board member and update boardMemberIds
  const ownerDoc = await getDoc(ownerRef);
  const ownerData = ownerDoc.data();

  if (ownerData?.isBoardMember) {
    const { arrayUnion } = await import('firebase/firestore');
    const condoRef = doc(db, 'condos', condoId);
    await updateDoc(condoRef, {
      boardMemberIds: arrayUnion(acceptedBy),
      updatedAt: serverTimestamp(),
    });
  }

  return { synced: true, userId: acceptedBy };
}
