import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  arrayUnion,
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
    members: [userId],
    totalTantiemes: 0,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  };

  await setDoc(coproRef, copropriete);

  // Ajouter la copropriété à l'utilisateur
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    coproprietes: arrayUnion(coproRef.id),
    updatedAt: now,
  }).catch(async () => {
    // Si l'utilisateur n'existe pas encore, le créer
    await setDoc(userRef, {
      id: userId,
      coproprietes: [coproRef.id],
      createdAt: now,
      updatedAt: now,
    }, { merge: true });
  });

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
 * Retourne un tableau vide si l'utilisateur n'a pas de copropriétés
 * ou si les permissions Firestore bloquent l'accès (nouveau user)
 */
export async function getUserCoproprietes(userId: string): Promise<Copropriete[]> {
  try {
    const coproQuery = query(
      collection(db, 'coproprietes'),
      where('members', 'array-contains', userId)
    );
    const snapshot = await getDocs(coproQuery);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Copropriete[];
  } catch (error) {
    // Firestore renvoie "permission-denied" pour un utilisateur sans copropriété
    // car la règle vérifie l'appartenance aux membres avant de permettre la lecture
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
 */
export async function addMemberToCopropriete(
  coproId: string,
  userId: string
): Promise<void> {
  const coproRef = doc(db, 'coproprietes', coproId);

  await updateDoc(coproRef, {
    members: arrayUnion(userId),
    updatedAt: serverTimestamp(),
  });

  // Ajouter la copropriété à l'utilisateur
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    coproprietes: arrayUnion(coproId),
    updatedAt: serverTimestamp(),
  });
}
