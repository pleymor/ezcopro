import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config';
import type { AppelDeFonds, CreateAppelInput } from '@/types/appel';
import type { Repartition } from '@/types/repartition';
import type { Lot } from '@/types/lot';
import { createHistoriqueEntry } from './historique';
import { IS_TEST_MODE, mockStore, generateTestId, createMockTimestamp } from '@/lib/test/mock-data';

// Mock repartitions storage for test mode
const mockRepartitions: Map<string, Repartition[]> = new Map();

/**
 * Récupère tous les appels de fonds d'une copropriété
 */
export async function getAppels(coproId: string): Promise<AppelDeFonds[]> {
  if (IS_TEST_MODE) {
    return [...mockStore.appels].sort((a, b) =>
      b.dateEcheance.seconds - a.dateEcheance.seconds
    );
  }

  const appelsQuery = query(
    collection(db, 'coproprietes', coproId, 'appels'),
    orderBy('dateEcheance', 'desc')
  );
  const snapshot = await getDocs(appelsQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as AppelDeFonds[];
}

/**
 * Observe les appels en temps réel
 */
export function subscribeToAppels(
  coproId: string,
  callback: (appels: AppelDeFonds[]) => void
): Unsubscribe {
  if (IS_TEST_MODE) {
    callback([...mockStore.appels].sort((a, b) =>
      b.dateEcheance.seconds - a.dateEcheance.seconds
    ));
    return () => {};
  }

  const appelsQuery = query(
    collection(db, 'coproprietes', coproId, 'appels'),
    orderBy('dateEcheance', 'desc')
  );

  return onSnapshot(appelsQuery, (snapshot) => {
    const appels = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AppelDeFonds[];
    callback(appels);
  });
}

/**
 * Récupère un appel par ID
 */
export async function getAppel(coproId: string, appelId: string): Promise<AppelDeFonds | null> {
  if (IS_TEST_MODE) {
    const appel = mockStore.appels.find(a => a.id === appelId);
    return appel ? (appel as unknown as AppelDeFonds) : null;
  }

  const appelRef = doc(db, 'coproprietes', coproId, 'appels', appelId);
  const appelDoc = await getDoc(appelRef);

  if (!appelDoc.exists()) {
    return null;
  }

  return { id: appelDoc.id, ...appelDoc.data() } as AppelDeFonds;
}

/**
 * Récupère les répartitions d'un appel
 */
export async function getRepartitions(coproId: string, appelId: string): Promise<Repartition[]> {
  if (IS_TEST_MODE) {
    return mockRepartitions.get(appelId) || [];
  }

  const repartitionsQuery = query(
    collection(db, 'coproprietes', coproId, 'appels', appelId, 'repartitions'),
    orderBy('createdAt', 'asc')
  );
  const snapshot = await getDocs(repartitionsQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Repartition[];
}

/**
 * Observe les répartitions en temps réel
 */
export function subscribeToRepartitions(
  coproId: string,
  appelId: string,
  callback: (repartitions: Repartition[]) => void
): Unsubscribe {
  if (IS_TEST_MODE) {
    callback(mockRepartitions.get(appelId) || []);
    return () => {};
  }

  const repartitionsQuery = query(
    collection(db, 'coproprietes', coproId, 'appels', appelId, 'repartitions'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(repartitionsQuery, (snapshot) => {
    const repartitions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Repartition[];
    callback(repartitions);
  });
}

/**
 * Crée un appel de fonds avec répartition automatique au prorata des tantièmes
 * Utilise une transaction pour assurer la cohérence des données
 */
export async function createAppelWithRepartitions(
  coproId: string,
  userId: string,
  userEmail: string,
  input: CreateAppelInput,
  lots: Lot[]
): Promise<AppelDeFonds> {
  // Filtrer les lots qui ont un copropriétaire assigné
  const lotsAvecCoproprietaire = lots.filter((lot) => lot.coproprietaireId);

  if (lotsAvecCoproprietaire.length === 0) {
    throw new Error('Aucun lot avec copropriétaire assigné pour la répartition');
  }

  // Calculer le total des tantièmes
  const totalTantiemes = lotsAvecCoproprietaire.reduce((sum, lot) => sum + lot.tantiemes, 0);

  if (totalTantiemes === 0) {
    throw new Error('Le total des tantièmes est nul');
  }

  if (IS_TEST_MODE) {
    const now = createMockTimestamp();
    const appelId = generateTestId();
    const appel: AppelDeFonds = {
      id: appelId,
      libelle: input.libelle,
      montantTotalCents: input.montantTotalCents,
      dateEcheance: now,
      dateCreation: now,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    };
    mockStore.appels.push(appel);

    // Create repartitions
    const repartitions: Repartition[] = [];
    let montantDistribue = 0;
    const lotsTries = [...lotsAvecCoproprietaire].sort((a, b) => b.tantiemes - a.tantiemes);

    for (let i = 0; i < lotsTries.length; i++) {
      const lot = lotsTries[i]!;
      let montantCents: number;
      if (i === lotsTries.length - 1) {
        montantCents = input.montantTotalCents - montantDistribue;
      } else {
        montantCents = Math.floor((input.montantTotalCents * lot.tantiemes) / totalTantiemes);
      }
      montantDistribue += montantCents;

      repartitions.push({
        id: generateTestId(),
        lotId: lot.id,
        coproprietaireId: lot.coproprietaireId!,
        montantCents,
        tantiemesSnapshot: lot.tantiemes,
        createdAt: now,
      });
    }
    mockRepartitions.set(appelId, repartitions);

    return appel;
  }

  const appelRef = doc(collection(db, 'coproprietes', coproId, 'appels'));
  const now = serverTimestamp();

  const appel = {
    id: appelRef.id,
    libelle: input.libelle,
    montantTotalCents: input.montantTotalCents,
    dateEcheance: Timestamp.fromDate(input.dateEcheance),
    dateCreation: now,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  };

  // Calculer les répartitions au prorata des tantièmes
  // Utiliser une répartition par reste pour éviter les erreurs d'arrondi
  let montantDistribue = 0;
  const repartitionsData: Array<{
    lotId: string;
    coproprietaireId: string;
    montantCents: number;
    tantiemesSnapshot: number;
  }> = [];

  // Trier les lots par tantièmes décroissants pour la distribution du reste
  const lotsTries = [...lotsAvecCoproprietaire].sort((a, b) => b.tantiemes - a.tantiemes);

  for (let i = 0; i < lotsTries.length; i++) {
    const lot = lotsTries[i]!;
    let montantCents: number;

    if (i === lotsTries.length - 1) {
      // Dernier lot : attribuer le reste pour garantir la somme exacte
      montantCents = input.montantTotalCents - montantDistribue;
    } else {
      // Calcul au prorata avec arrondi à l'entier inférieur
      montantCents = Math.floor((input.montantTotalCents * lot.tantiemes) / totalTantiemes);
    }

    montantDistribue += montantCents;

    repartitionsData.push({
      lotId: lot.id,
      coproprietaireId: lot.coproprietaireId!,
      montantCents,
      tantiemesSnapshot: lot.tantiemes,
    });
  }

  // Exécuter dans une transaction
  await runTransaction(db, async (transaction) => {
    // Créer l'appel
    transaction.set(appelRef, appel);

    // Créer les répartitions
    for (const rep of repartitionsData) {
      const repRef = doc(collection(db, 'coproprietes', coproId, 'appels', appelRef.id, 'repartitions'));
      transaction.set(repRef, {
        id: repRef.id,
        ...rep,
        createdAt: now,
      });
    }
  });

  // Créer l'entrée d'historique (hors transaction)
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail,
    action: 'create',
    entityType: 'appel',
    entityId: appelRef.id,
    entityLabel: input.libelle,
    before: null,
    after: {
      ...appel,
      repartitionsCount: repartitionsData.length,
    },
  });

  return appel as unknown as AppelDeFonds;
}

/**
 * Supprime un appel de fonds et ses répartitions
 */
export async function deleteAppel(
  coproId: string,
  appelId: string,
  userId: string,
  userEmail: string
): Promise<void> {
  if (IS_TEST_MODE) {
    const index = mockStore.appels.findIndex(a => a.id === appelId);
    if (index === -1) {
      throw new Error('Appel de fonds non trouvé');
    }
    mockStore.appels.splice(index, 1);
    mockRepartitions.delete(appelId);
    return;
  }

  const appelRef = doc(db, 'coproprietes', coproId, 'appels', appelId);
  const appelDoc = await getDoc(appelRef);

  if (!appelDoc.exists()) {
    throw new Error('Appel de fonds non trouvé');
  }

  const before = appelDoc.data();

  // Supprimer les répartitions d'abord
  const repartitionsSnapshot = await getDocs(
    collection(db, 'coproprietes', coproId, 'appels', appelId, 'repartitions')
  );

  await runTransaction(db, async (transaction) => {
    // Supprimer toutes les répartitions
    for (const repDoc of repartitionsSnapshot.docs) {
      transaction.delete(repDoc.ref);
    }
    // Supprimer l'appel
    transaction.delete(appelRef);
  });

  // Créer l'entrée d'historique
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail,
    action: 'delete',
    entityType: 'appel',
    entityId: appelId,
    entityLabel: before.libelle,
    before,
    after: null,
  });
}

/**
 * Calcule le montant total dû par un copropriétaire pour un appel
 */
export function calculateMontantDuByCoproprietaire(
  repartitions: Repartition[],
  coproprietaireId: string
): number {
  return repartitions
    .filter((rep) => rep.coproprietaireId === coproprietaireId)
    .reduce((sum, rep) => sum + rep.montantCents, 0);
}
