import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config';
import type { Invitation } from '@/types/invitation';
import { addMemberToCopropriete } from './copropriete';

/**
 * Génère un code d'invitation aléatoire
 */
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Crée une invitation pour un copropriétaire
 */
export async function createInvitation(
  coproId: string,
  coproprietaireId: string,
  userId: string
): Promise<Invitation> {
  const code = generateCode();
  const invRef = doc(db, 'invitations', code);

  // Vérifier que le code n'existe pas déjà
  const existingDoc = await getDoc(invRef);
  if (existingDoc.exists()) {
    // Générer un nouveau code si collision
    return createInvitation(coproId, coproprietaireId, userId);
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 jours

  const invitation = {
    code,
    coproprietéId: coproId,
    coproprietaireId,
    createdBy: userId,
    expiresAt: Timestamp.fromDate(expiresAt),
    usedAt: null,
    usedBy: null,
    createdAt: serverTimestamp(),
  };

  await setDoc(invRef, invitation);

  return invitation as unknown as Invitation;
}

/**
 * Valide un code d'invitation sans l'utiliser
 */
export async function validateInvitation(code: string): Promise<{
  valid: boolean;
  coproprietéNom?: string;
  error?: 'expired' | 'used' | 'not_found';
}> {
  const invRef = doc(db, 'invitations', code);
  const invDoc = await getDoc(invRef);

  if (!invDoc.exists()) {
    return { valid: false, error: 'not_found' };
  }

  const invitation = invDoc.data();

  if (invitation.usedAt) {
    return { valid: false, error: 'used' };
  }

  const expiresAt = invitation.expiresAt.toDate();
  if (expiresAt < new Date()) {
    return { valid: false, error: 'expired' };
  }

  // Récupérer le nom de la copropriété
  const coproRef = doc(db, 'coproprietes', invitation.coproprietéId);
  const coproDoc = await getDoc(coproRef);
  const coproprietéNom = coproDoc.exists() ? coproDoc.data().nom : 'Copropriété';

  return { valid: true, coproprietéNom };
}

/**
 * Utilise un code d'invitation
 */
export async function useInvitation(
  code: string,
  userId: string
): Promise<{
  coproprietéId: string;
  coproprietaireId: string;
}> {
  const invRef = doc(db, 'invitations', code);
  const invDoc = await getDoc(invRef);

  if (!invDoc.exists()) {
    throw new Error('Code d\'invitation invalide');
  }

  const invitation = invDoc.data();

  if (invitation.usedAt) {
    throw new Error('Ce code a déjà été utilisé');
  }

  const expiresAt = invitation.expiresAt.toDate();
  if (expiresAt < new Date()) {
    throw new Error('Ce code a expiré');
  }

  // Marquer l'invitation comme utilisée
  await updateDoc(invRef, {
    usedAt: serverTimestamp(),
    usedBy: userId,
  });

  // Ajouter l'utilisateur à la copropriété (en tant que lecteur par défaut)
  await addMemberToCopropriete(invitation.coproprietéId, userId, 'lecteur', userId);

  // Lier l'utilisateur au copropriétaire
  const cpRef = doc(
    db,
    'coproprietes',
    invitation.coproprietéId,
    'coproprietaires',
    invitation.coproprietaireId
  );
  await updateDoc(cpRef, {
    userId,
    updatedAt: serverTimestamp(),
  });

  return {
    coproprietéId: invitation.coproprietéId,
    coproprietaireId: invitation.coproprietaireId,
  };
}
