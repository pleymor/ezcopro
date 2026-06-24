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
} from 'firebase/firestore';
import { db } from '../config';
import type {
  InvitationGestionnaire,
  CreateInvitationGestionnaireInput,
  RoleInvitable,
} from '@/types/invitation-gestionnaire';
import { addMembre } from './membre-syndic';

// Durée de validité d'une invitation (7 jours)
const INVITATION_VALIDITY_DAYS = 7;

/**
 * Génère un token UUID v4
 */
function generateToken(): string {
  return crypto.randomUUID();
}

/**
 * Crée une nouvelle invitation gestionnaire
 */
export async function createInvitationGestionnaire(
  coproId: string,
  coproNom: string,
  input: CreateInvitationGestionnaireInput,
  invitePar: string,
  inviteParEmail?: string
): Promise<InvitationGestionnaire> {
  // Vérifier qu'il n'y a pas déjà une invitation en attente pour cet email
  const existingQuery = query(
    collection(db, 'invitationsGestionnaire'),
    where('coproprieteId', '==', coproId),
    where('email', '==', input.email.toLowerCase()),
    where('statut', '==', 'en_attente')
  );
  const existingDocs = await getDocs(existingQuery);

  if (!existingDocs.empty) {
    throw new Error('Une invitation est déjà en attente pour cet email');
  }

  const invitationRef = doc(collection(db, 'invitationsGestionnaire'));
  const now = Timestamp.now();
  const expiration = Timestamp.fromMillis(
    now.toMillis() + INVITATION_VALIDITY_DAYS * 24 * 60 * 60 * 1000
  );

  const invitation: Omit<InvitationGestionnaire, 'createdAt' | 'updatedAt'> & {
    createdAt: ReturnType<typeof serverTimestamp>;
    updatedAt: ReturnType<typeof serverTimestamp>;
  } = {
    id: invitationRef.id,
    email: input.email.toLowerCase(),
    coproprieteId: coproId,
    coproprieteNom: coproNom,
    role: input.role,
    token: generateToken(),
    statut: 'en_attente',
    dateEnvoi: now,
    dateExpiration: expiration,
    invitePar,
    inviteParEmail,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(invitationRef, invitation);

  return invitation as unknown as InvitationGestionnaire;
}

/**
 * Valide un token d'invitation et retourne l'invitation si valide
 */
export async function validateInvitationGestionnaire(
  token: string
): Promise<InvitationGestionnaire | null> {
  const invitationsQuery = query(
    collection(db, 'invitationsGestionnaire'),
    where('token', '==', token)
  );
  const snapshot = await getDocs(invitationsQuery);

  if (snapshot.empty) {
    return null;
  }

  const invitation = {
    id: snapshot.docs[0]!.id,
    ...snapshot.docs[0]!.data(),
  } as InvitationGestionnaire;

  // Vérifier le statut
  if (invitation.statut !== 'en_attente') {
    return null;
  }

  // Vérifier l'expiration
  const now = Timestamp.now();
  const expiration = invitation.dateExpiration as unknown as Timestamp;
  if (now.toMillis() > expiration.toMillis()) {
    // Marquer comme expirée
    await updateDoc(doc(db, 'invitationsGestionnaire', invitation.id), {
      statut: 'expiree',
      updatedAt: serverTimestamp(),
    });
    return null;
  }

  return invitation;
}

/**
 * Accepte une invitation gestionnaire
 */
export async function acceptInvitationGestionnaire(
  token: string,
  userId: string,
  userEmail: string,
  displayName?: string
): Promise<void> {
  // Valider l'invitation
  const invitation = await validateInvitationGestionnaire(token);
  if (!invitation) {
    throw new Error('Invitation invalide ou expirée');
  }

  // Ajouter l'utilisateur comme membre
  await addMembre(
    invitation.coproprieteId,
    userId,
    invitation.role as RoleInvitable,
    invitation.invitePar,
    { email: userEmail, displayName }
  );

  // Marquer l'invitation comme acceptée
  await updateDoc(doc(db, 'invitationsGestionnaire', invitation.id), {
    statut: 'acceptee',
    acceptePar: userId,
    dateAcceptation: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Annule une invitation
 */
export async function cancelInvitationGestionnaire(
  invitationId: string
): Promise<void> {
  const invitationRef = doc(db, 'invitationsGestionnaire', invitationId);
  const invitationDoc = await getDoc(invitationRef);

  if (!invitationDoc.exists()) {
    throw new Error('Invitation non trouvée');
  }

  const invitation = invitationDoc.data() as InvitationGestionnaire;
  if (invitation.statut !== 'en_attente') {
    throw new Error('Seules les invitations en attente peuvent être annulées');
  }

  await updateDoc(invitationRef, {
    statut: 'annulee',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Renvoie une invitation (prolonge l'expiration)
 */
export async function resendInvitationGestionnaire(
  invitationId: string
): Promise<InvitationGestionnaire> {
  const invitationRef = doc(db, 'invitationsGestionnaire', invitationId);
  const invitationDoc = await getDoc(invitationRef);

  if (!invitationDoc.exists()) {
    throw new Error('Invitation non trouvée');
  }

  const invitation = invitationDoc.data() as InvitationGestionnaire;
  if (invitation.statut !== 'en_attente' && invitation.statut !== 'expiree') {
    throw new Error('Seules les invitations en attente ou expirées peuvent être renvoyées');
  }

  const now = Timestamp.now();
  const expiration = Timestamp.fromMillis(
    now.toMillis() + INVITATION_VALIDITY_DAYS * 24 * 60 * 60 * 1000
  );

  await updateDoc(invitationRef, {
    statut: 'en_attente',
    dateEnvoi: now,
    dateExpiration: expiration,
    token: generateToken(), // Nouveau token
    updatedAt: serverTimestamp(),
  });

  const updatedDoc = await getDoc(invitationRef);
  return {
    id: updatedDoc.id,
    ...updatedDoc.data(),
  } as InvitationGestionnaire;
}

/**
 * Récupère les invitations d'une copropriété
 */
export async function getInvitationsForCopropriete(
  coproId: string
): Promise<InvitationGestionnaire[]> {
  const invitationsQuery = query(
    collection(db, 'invitationsGestionnaire'),
    where('coproprieteId', '==', coproId),
    orderBy('dateEnvoi', 'desc')
  );

  const snapshot = await getDocs(invitationsQuery);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as InvitationGestionnaire[];
}

/**
 * Récupère les invitations en attente pour un email
 */
export async function getPendingInvitationsForEmail(
  email: string
): Promise<InvitationGestionnaire[]> {
  const invitationsQuery = query(
    collection(db, 'invitationsGestionnaire'),
    where('email', '==', email.toLowerCase()),
    where('statut', '==', 'en_attente')
  );

  const snapshot = await getDocs(invitationsQuery);

  // Filtrer les expirations
  const now = Timestamp.now();
  const validInvitations: InvitationGestionnaire[] = [];

  for (const d of snapshot.docs) {
    const data = d.data();
    const expiration = data.dateExpiration as unknown as Timestamp;

    if (now.toMillis() <= expiration.toMillis()) {
      validInvitations.push({ ...data, id: d.id } as InvitationGestionnaire);
    }
  }

  return validInvitations;
}

/**
 * Récupère une invitation par son ID
 */
export async function getInvitationById(
  invitationId: string
): Promise<InvitationGestionnaire | null> {
  const invitationRef = doc(db, 'invitationsGestionnaire', invitationId);
  const invitationDoc = await getDoc(invitationRef);

  if (!invitationDoc.exists()) {
    return null;
  }

  return {
    id: invitationDoc.id,
    ...invitationDoc.data(),
  } as InvitationGestionnaire;
}
