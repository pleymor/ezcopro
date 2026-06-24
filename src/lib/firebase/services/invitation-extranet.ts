import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config';
import type {
  InvitationExtranet,
  CreateInvitationInput,
  StatutInvitation,
} from '@/types/invitation-extranet';
import { IS_TEST_MODE } from '@/lib/test/mock-data';
import {
  mockStoreExtranet,
  createMockInvitation,
} from '@/lib/test/mock-data-extranet';
import { linkOwnerToUser } from './owner';

/**
 * Génère un UUID v4 pour le token d'invitation
 */
function generateToken(): string {
  return crypto.randomUUID();
}

/**
 * Crée une invitation extranet pour un copropriétaire
 */
export async function createInvitationExtranet(
  coproprieteId: string,
  input: CreateInvitationInput,
  _userId: string
): Promise<InvitationExtranet> {
  if (IS_TEST_MODE) {
    const invitation = createMockInvitation(input.email, input.coproprietaireId);
    mockStoreExtranet.invitationsExtranet.push(invitation);
    return invitation;
  }

  const token = generateToken();
  const invRef = doc(collection(db, 'ownerInvitations'));

  const now = new Date();
  const dateExpiration = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 jours

  const invitation: Omit<InvitationExtranet, 'id'> & { condoId: string } = {
    email: input.email,
    coproprietaireId: input.coproprietaireId,
    condoId: coproprieteId,
    token,
    dateEnvoi: Timestamp.fromDate(now),
    dateExpiration: Timestamp.fromDate(dateExpiration),
    statut: 'en_attente' as StatutInvitation,
    createdAt: serverTimestamp() as unknown as { seconds: number; nanoseconds: number },
    updatedAt: serverTimestamp() as unknown as { seconds: number; nanoseconds: number },
  };

  await setDoc(invRef, invitation);

  return {
    id: invRef.id,
    ...invitation,
  } as unknown as InvitationExtranet;
}

/**
 * Récupère une invitation par son token
 */
export async function getInvitationByToken(
  token: string
): Promise<InvitationExtranet | null> {
  if (IS_TEST_MODE) {
    return mockStoreExtranet.invitationsExtranet.find(
      (inv) => inv.token === token
    ) || null;
  }

  const q = query(
    collection(db, 'ownerInvitations'),
    where('token', '==', token)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const docSnapshot = snapshot.docs[0];
  if (!docSnapshot) {
    return null;
  }
  return {
    id: docSnapshot.id,
    ...docSnapshot.data(),
  } as unknown as InvitationExtranet;
}

/**
 * Valide une invitation par son token
 */
export async function validateInvitationExtranet(token: string): Promise<{
  valid: boolean;
  invitation?: InvitationExtranet;
  coproprieteName?: string;
  error?: 'expired' | 'used' | 'not_found';
}> {
  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    return { valid: false, error: 'not_found' };
  }

  if (invitation.statut === 'acceptee') {
    return { valid: false, error: 'used' };
  }

  const dateExpiration = invitation.dateExpiration as unknown as Timestamp;
  const expirationDate = dateExpiration.toDate ? dateExpiration.toDate() : new Date(dateExpiration.seconds * 1000);

  if (expirationDate < new Date()) {
    // Marquer comme expirée si ce n'est pas déjà fait
    if (invitation.statut !== 'expiree') {
      await updateInvitationStatus(invitation.id, 'expiree');
    }
    return { valid: false, error: 'expired' };
  }

  // Récupérer le nom de la copropriété (si on a accès via le contexte)
  // Pour l'instant, on retourne juste l'invitation valide
  return { valid: true, invitation };
}

/**
 * Met à jour le statut d'une invitation
 */
export async function updateInvitationStatus(
  invitationId: string,
  statut: StatutInvitation
): Promise<void> {
  if (IS_TEST_MODE) {
    const invitation = mockStoreExtranet.invitationsExtranet.find(
      (inv) => inv.id === invitationId
    );
    if (invitation) {
      invitation.statut = statut;
      invitation.updatedAt = {
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0,
      };
    }
    return;
  }

  const invRef = doc(db, 'ownerInvitations', invitationId);
  await updateDoc(invRef, {
    statut,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Marque une invitation comme acceptée et lie l'utilisateur au copropriétaire
 * Appelé après la création du compte utilisateur ou connexion
 */
export async function acceptInvitation(
  invitationId: string,
  userId: string
): Promise<void> {
  if (IS_TEST_MODE) {
    const invitation = mockStoreExtranet.invitationsExtranet.find(
      (inv) => inv.id === invitationId
    );
    if (invitation) {
      invitation.statut = 'acceptee';
      invitation.updatedAt = {
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0,
      };
    }
    return;
  }

  // Récupérer l'invitation pour obtenir condoId et coproprietaireId
  const invRef = doc(db, 'ownerInvitations', invitationId);
  const invDoc = await getDoc(invRef);

  if (!invDoc.exists()) {
    throw new Error('Invitation non trouvée');
  }

  const invitationData = invDoc.data();

  // Marquer l'invitation comme acceptée
  await updateDoc(invRef, {
    statut: 'acceptee' as StatutInvitation,
    acceptedBy: userId,
    dateAcceptation: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Lier l'utilisateur au copropriétaire (owner)
  await linkOwnerToUser(
    invitationData.condoId,
    invitationData.coproprietaireId,
    userId
  );
}

/**
 * Récupère les invitations pour une copropriété
 */
export async function getInvitationsForCopropriete(
  coproprieteId: string
): Promise<InvitationExtranet[]> {
  if (IS_TEST_MODE) {
    // En mode test, on retourne toutes les invitations (pas de filtrage par copro)
    return mockStoreExtranet.invitationsExtranet;
  }

  const q = query(
    collection(db, 'ownerInvitations'),
    where('condoId', '==', coproprieteId),
    orderBy('dateEnvoi', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as unknown as InvitationExtranet[];
}

/**
 * Récupère les invitations pour un copropriétaire spécifique
 */
export async function getInvitationsForCoproprietaire(
  coproprietaireId: string
): Promise<InvitationExtranet[]> {
  if (IS_TEST_MODE) {
    return mockStoreExtranet.invitationsExtranet.filter(
      (inv) => inv.coproprietaireId === coproprietaireId
    );
  }

  const q = query(
    collection(db, 'ownerInvitations'),
    where('coproprietaireId', '==', coproprietaireId),
    orderBy('dateEnvoi', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as unknown as InvitationExtranet[];
}

/**
 * Renvoie une invitation (crée une nouvelle avec le même email et copropriétaire)
 */
export async function resendInvitation(
  coproprieteId: string,
  invitationId: string,
  userId: string
): Promise<InvitationExtranet> {
  // Récupérer l'ancienne invitation
  if (IS_TEST_MODE) {
    const oldInvitation = mockStoreExtranet.invitationsExtranet.find(
      (inv) => inv.id === invitationId
    );
    if (!oldInvitation) {
      throw new Error('Invitation non trouvée');
    }
    // Marquer l'ancienne comme expirée
    oldInvitation.statut = 'expiree';
    // Créer une nouvelle
    return createInvitationExtranet(coproprieteId, {
      email: oldInvitation.email,
      coproprietaireId: oldInvitation.coproprietaireId,
    }, userId);
  }

  const invRef = doc(db, 'ownerInvitations', invitationId);
  const invDoc = await getDoc(invRef);

  if (!invDoc.exists()) {
    throw new Error('Invitation non trouvée');
  }

  const oldInvitation = invDoc.data();

  // Marquer l'ancienne comme expirée
  await updateDoc(invRef, {
    statut: 'expiree' as StatutInvitation,
    updatedAt: serverTimestamp(),
  });

  // Créer une nouvelle invitation
  return createInvitationExtranet(coproprieteId, {
    email: oldInvitation.email,
    coproprietaireId: oldInvitation.coproprietaireId,
  }, userId);
}

/**
 * Vérifie si un copropriétaire a déjà une invitation en attente
 */
export async function hasPendingInvitation(
  coproprietaireId: string
): Promise<boolean> {
  const invitations = await getInvitationsForCoproprietaire(coproprietaireId);
  return invitations.some((inv) => inv.statut === 'en_attente');
}

/**
 * Vérifie si un copropriétaire a déjà accepté une invitation (a un compte)
 */
export async function hasAcceptedInvitation(
  coproprietaireId: string
): Promise<boolean> {
  const invitations = await getInvitationsForCoproprietaire(coproprietaireId);
  return invitations.some((inv) => inv.statut === 'acceptee');
}

/**
 * Annule une invitation extranet (la marque comme expirée)
 */
export async function cancelInvitationExtranet(
  invitationId: string
): Promise<void> {
  await updateInvitationStatus(invitationId, 'expiree');
}

/**
 * Récupère l'invitation acceptée par un utilisateur (via son UID)
 * Utilisé comme fallback quand les custom claims ne sont pas définis
 */
export async function getAcceptedInvitationForUser(
  userId: string
): Promise<{ coproprieteId: string; coproprietaireId: string } | null> {
  if (IS_TEST_MODE) {
    // En mode test, pas de fallback nécessaire
    return null;
  }

  const q = query(
    collection(db, 'ownerInvitations'),
    where('acceptedBy', '==', userId),
    where('statut', '==', 'acceptee')
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty || !snapshot.docs[0]) {
    return null;
  }

  const invitation = snapshot.docs[0].data();
  return {
    coproprieteId: invitation.condoId,
    coproprietaireId: invitation.coproprietaireId,
  };
}

export interface AcceptedInvitation {
  invitationId: string;
  coproprieteId: string;
  coproprietaireId: string;
  email: string;
  dateAcceptation: Date;
}

/**
 * Récupère TOUTES les invitations acceptées par un utilisateur (via son UID)
 * Permet de supporter les utilisateurs copropriétaires dans plusieurs copropriétés
 */
export async function getAllAcceptedInvitationsForUser(
  userId: string
): Promise<AcceptedInvitation[]> {
  if (IS_TEST_MODE) {
    // En mode test, retourner les invitations acceptées du mock
    return mockStoreExtranet.invitationsExtranet
      .filter((inv) => inv.statut === 'acceptee')
      .map((inv) => ({
        invitationId: inv.id,
        coproprieteId: (inv as unknown as { coproprieteId: string }).coproprieteId || 'mock-copro-id',
        coproprietaireId: inv.coproprietaireId,
        email: inv.email,
        dateAcceptation: new Date(),
      }));
  }

  const q = query(
    collection(db, 'ownerInvitations'),
    where('acceptedBy', '==', userId),
    where('statut', '==', 'acceptee')
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return [];
  }

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    const dateAcceptation = data.dateAcceptation as Timestamp | undefined;
    return {
      invitationId: doc.id,
      coproprieteId: data.condoId,
      coproprietaireId: data.coproprietaireId,
      email: data.email,
      dateAcceptation: dateAcceptation?.toDate?.() ?? new Date(),
    };
  });
}
