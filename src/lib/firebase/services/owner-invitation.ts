import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config';
import type { OwnerInvitation, CreateOwnerInvitationInput, InvitationStatus } from '@/types/owner-invitation';

const COLLECTION = 'ownerInvitations';
const INVITATION_VALIDITY_DAYS = 7;

/**
 * Create a new owner invitation
 */
export async function createOwnerInvitation(
  condoId: string,
  condoName: string,
  input: CreateOwnerInvitationInput,
  invitedBy: string,
  invitedByEmail?: string
): Promise<OwnerInvitation> {
  const invitationRef = doc(collection(db, COLLECTION));
  const now = Timestamp.now();
  const expiresAt = Timestamp.fromDate(
    new Date(Date.now() + INVITATION_VALIDITY_DAYS * 24 * 60 * 60 * 1000)
  );

  const invitation = {
    id: invitationRef.id,
    condoId,
    condoName,
    ownerId: input.ownerId,
    email: input.email,
    token: uuidv4(),
    status: 'pending' as InvitationStatus,
    invitedBy,
    invitedByEmail,
    acceptedBy: null,
    sentAt: now,
    expiresAt,
    acceptedAt: null,
  };

  await setDoc(invitationRef, invitation);

  return invitation as OwnerInvitation;
}

/**
 * Get an invitation by token
 */
export async function getInvitationByToken(token: string): Promise<OwnerInvitation | null> {
  const q = query(
    collection(db, COLLECTION),
    where('token', '==', token)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0]!;
  return { id: doc.id, ...doc.data() } as OwnerInvitation;
}

/**
 * Get an invitation by ID
 */
export async function getInvitation(id: string): Promise<OwnerInvitation | null> {
  const invitationRef = doc(db, COLLECTION, id);
  const invitationDoc = await getDoc(invitationRef);

  if (!invitationDoc.exists()) {
    return null;
  }

  return { id: invitationDoc.id, ...invitationDoc.data() } as OwnerInvitation;
}

/**
 * Get all pending invitations for a condo
 */
export async function getPendingInvitations(condoId: string): Promise<OwnerInvitation[]> {
  const q = query(
    collection(db, COLLECTION),
    where('condoId', '==', condoId),
    where('status', '==', 'pending'),
    orderBy('sentAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as OwnerInvitation));
}

/**
 * Subscribe to invitations for a condo
 */
export function subscribeToInvitations(
  condoId: string,
  callback: (invitations: OwnerInvitation[]) => void,
  statusFilter?: InvitationStatus[]
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where('condoId', '==', condoId),
    orderBy('sentAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    let invitations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as OwnerInvitation));

    if (statusFilter && statusFilter.length > 0) {
      invitations = invitations.filter(inv => statusFilter.includes(inv.status));
    }

    callback(invitations);
  });
}

/**
 * Validate an invitation (check if valid and not expired)
 */
export async function validateInvitation(token: string): Promise<{
  valid: boolean;
  invitation?: OwnerInvitation;
  error?: string;
}> {
  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    return { valid: false, error: 'Invitation not found' };
  }

  if (invitation.status !== 'pending') {
    return { valid: false, invitation, error: `Invitation is ${invitation.status}` };
  }

  const now = new Date();
  let expiresAt: Date;
  if (invitation.expiresAt instanceof Timestamp) {
    expiresAt = invitation.expiresAt.toDate();
  } else if (typeof invitation.expiresAt === 'object' && 'seconds' in invitation.expiresAt) {
    expiresAt = new Date((invitation.expiresAt as { seconds: number }).seconds * 1000);
  } else {
    expiresAt = new Date(invitation.expiresAt as unknown as string | number);
  }

  if (now > expiresAt) {
    // Mark as expired
    await updateInvitationStatus(invitation.id, 'expired');
    return { valid: false, invitation, error: 'Invitation has expired' };
  }

  return { valid: true, invitation };
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(
  invitationId: string,
  acceptedByUserId: string
): Promise<void> {
  const invitationRef = doc(db, COLLECTION, invitationId);

  await updateDoc(invitationRef, {
    status: 'accepted',
    acceptedBy: acceptedByUserId,
    acceptedAt: serverTimestamp(),
  });
}

/**
 * Cancel an invitation
 */
export async function cancelInvitation(invitationId: string): Promise<void> {
  await updateInvitationStatus(invitationId, 'cancelled');
}

/**
 * Update invitation status
 */
export async function updateInvitationStatus(
  invitationId: string,
  status: InvitationStatus
): Promise<void> {
  const invitationRef = doc(db, COLLECTION, invitationId);

  await updateDoc(invitationRef, {
    status,
  });
}

/**
 * Get invitation for a specific owner
 */
export async function getInvitationForOwner(
  condoId: string,
  ownerId: string
): Promise<OwnerInvitation | null> {
  const q = query(
    collection(db, COLLECTION),
    where('condoId', '==', condoId),
    where('ownerId', '==', ownerId),
    where('status', '==', 'pending')
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0]!;
  return { id: doc.id, ...doc.data() } as OwnerInvitation;
}

/**
 * Expire all old pending invitations
 */
export async function expireOldInvitations(): Promise<number> {
  const now = Timestamp.now();
  const q = query(
    collection(db, COLLECTION),
    where('status', '==', 'pending'),
    where('expiresAt', '<', now)
  );

  const snapshot = await getDocs(q);
  let count = 0;

  for (const docSnap of snapshot.docs) {
    await updateInvitationStatus(docSnap.id, 'expired');
    count++;
  }

  return count;
}
