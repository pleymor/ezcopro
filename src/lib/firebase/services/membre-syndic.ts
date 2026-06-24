import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../config';
import type { RoleSyndic, MembresMap } from '@/types/membre-syndic';
import type { Copropriete } from '@/types/copropriete';

/**
 * Récupère les membres d'une copropriété
 */
export async function getMembres(coproId: string): Promise<MembresMap> {
  const coproRef = doc(db, 'coproprietes', coproId);
  const coproDoc = await getDoc(coproRef);

  if (!coproDoc.exists()) {
    throw new Error('Copropriété non trouvée');
  }

  const data = coproDoc.data() as Copropriete;
  return data.membres || {};
}

/**
 * Récupère le rôle d'un utilisateur dans une copropriété
 * Retourne null si l'utilisateur n'est pas membre
 */
export async function getUserRole(
  coproId: string,
  userId: string
): Promise<RoleSyndic | null> {
  const coproRef = doc(db, 'coproprietes', coproId);
  const coproDoc = await getDoc(coproRef);

  if (!coproDoc.exists()) {
    return null;
  }

  const data = coproDoc.data() as Copropriete;

  if (data.membres && data.membres[userId]) {
    return data.membres[userId].role;
  }

  return null;
}

/**
 * Vérifie si un utilisateur a un rôle spécifique dans une copropriété
 */
export async function hasRole(
  coproId: string,
  userId: string,
  requiredRoles: RoleSyndic[]
): Promise<boolean> {
  const role = await getUserRole(coproId, userId);
  return role !== null && requiredRoles.includes(role);
}

/**
 * Vérifie si l'utilisateur peut écrire (admin ou gestionnaire)
 */
export async function canWrite(coproId: string, userId: string): Promise<boolean> {
  return hasRole(coproId, userId, ['admin', 'gestionnaire']);
}

/**
 * Vérifie si l'utilisateur peut lire (tout rôle)
 */
export async function canRead(coproId: string, userId: string): Promise<boolean> {
  return hasRole(coproId, userId, ['admin', 'gestionnaire', 'lecteur']);
}

/**
 * Vérifie si l'utilisateur est admin
 */
export async function isAdmin(coproId: string, userId: string): Promise<boolean> {
  return hasRole(coproId, userId, ['admin']);
}

/**
 * Ajoute un membre à une copropriété
 */
export async function addMembre(
  coproId: string,
  newUserId: string,
  role: RoleSyndic,
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
    [`membres.${newUserId}`]: membre,
    memberIds: arrayUnion(newUserId),
    updatedAt: now,
  });
}

/**
 * Met à jour le rôle d'un membre
 */
export async function updateMembreRole(
  coproId: string,
  userId: string,
  newRole: RoleSyndic
): Promise<void> {
  // Vérifier que l'utilisateur est bien membre
  const membres = await getMembres(coproId);
  if (!membres[userId]) {
    throw new Error('Utilisateur non membre de cette copropriété');
  }

  // Empêcher de changer le rôle du dernier admin
  if (membres[userId].role === 'admin' && newRole !== 'admin') {
    const admins = Object.entries(membres).filter(
      ([, m]) => m.role === 'admin'
    );
    if (admins.length <= 1) {
      throw new Error('Impossible de retirer le dernier administrateur');
    }
  }

  const coproRef = doc(db, 'coproprietes', coproId);
  await updateDoc(coproRef, {
    [`membres.${userId}.role`]: newRole,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Retire un membre de la copropriété
 */
export async function removeMembre(
  coproId: string,
  userId: string
): Promise<void> {
  // Vérifier que l'utilisateur est bien membre
  const membres = await getMembres(coproId);
  if (!membres[userId]) {
    throw new Error('Utilisateur non membre de cette copropriété');
  }

  // Empêcher de retirer le dernier admin
  if (membres[userId].role === 'admin') {
    const admins = Object.entries(membres).filter(
      ([, m]) => m.role === 'admin'
    );
    if (admins.length <= 1) {
      throw new Error('Impossible de retirer le dernier administrateur');
    }
  }

  const coproRef = doc(db, 'coproprietes', coproId);
  const now = serverTimestamp();
  const { deleteField } = await import('firebase/firestore');

  await updateDoc(coproRef, {
    [`membres.${userId}`]: deleteField(),
    memberIds: arrayRemove(userId),
    updatedAt: now,
  });
}

/**
 * Transfère l'administration à un autre membre
 */
export async function transferOwnership(
  coproId: string,
  currentAdminId: string,
  newAdminId: string
): Promise<void> {
  // Vérifier que le current admin est bien admin
  const currentRole = await getUserRole(coproId, currentAdminId);
  if (currentRole !== 'admin') {
    throw new Error('Seul un administrateur peut transférer l\'administration');
  }

  // Vérifier que le nouveau admin est membre
  const membres = await getMembres(coproId);
  if (!membres[newAdminId]) {
    throw new Error('Le nouvel administrateur doit être membre de la copropriété');
  }

  const coproRef = doc(db, 'coproprietes', coproId);
  const now = serverTimestamp();

  await updateDoc(coproRef, {
    [`membres.${newAdminId}.role`]: 'admin',
    [`membres.${currentAdminId}.role`]: 'gestionnaire',
    updatedAt: now,
  });
}
