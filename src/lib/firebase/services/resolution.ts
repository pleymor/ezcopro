import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config';
import type {
  Resolution,
  CreateResolutionInput,
  UpdateResolutionInput,
} from '@/types/assemblee-generale';
import { AGError } from '@/types/assemblee-generale';
import { createHistoriqueEntry } from './historique';
import { IS_TEST_MODE, mockStore, generateTestId, createMockTimestamp } from '@/lib/test/mock-data';

const DEFAULT_CLE_REPARTITION = 'tantiemes_generaux';

/**
 * Get all resolutions for an AG
 */
export async function getResolutions(coproId: string, agId: string): Promise<Resolution[]> {
  if (IS_TEST_MODE) {
    return mockStore.resolutions
      .filter((r) => r.id.startsWith(`${agId}-`))
      .sort((a, b) => a.ordre - b.ordre);
  }

  const resQuery = query(
    collection(db, 'condos', coproId, 'meetings', agId, 'resolutions'),
    orderBy('ordre', 'asc')
  );
  const snapshot = await getDocs(resQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Resolution[];
}

/**
 * Subscribe to resolutions in real-time
 */
export function subscribeToResolutions(
  coproId: string,
  agId: string,
  callback: (resolutions: Resolution[]) => void
): Unsubscribe {
  if (IS_TEST_MODE) {
    const filtered = mockStore.resolutions
      .filter((r) => r.id.startsWith(`${agId}-`))
      .sort((a, b) => a.ordre - b.ordre);
    callback(filtered);
    return () => {};
  }

  const resQuery = query(
    collection(db, 'condos', coproId, 'meetings', agId, 'resolutions'),
    orderBy('ordre', 'asc')
  );

  return onSnapshot(resQuery, (snapshot) => {
    const resolutions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Resolution[];
    callback(resolutions);
  });
}

/**
 * Get the next resolution number
 */
async function getNextResolutionNumber(coproId: string, agId: string): Promise<number> {
  if (IS_TEST_MODE) {
    const resolutions = mockStore.resolutions.filter((r) => r.id.startsWith(`${agId}-`));
    return resolutions.length + 1;
  }

  const resolutions = await getResolutions(coproId, agId);
  return resolutions.length + 1;
}

/**
 * Create a new resolution
 */
export async function createResolution(
  coproId: string,
  agId: string,
  userId: string,
  userEmail: string,
  input: CreateResolutionInput
): Promise<Resolution> {
  const now = IS_TEST_MODE ? createMockTimestamp() : serverTimestamp();
  const numero = await getNextResolutionNumber(coproId, agId);

  if (IS_TEST_MODE) {
    const resolution: Resolution = {
      id: `${agId}-res-${generateTestId()}`,
      numero,
      titre: input.titre,
      description: input.description || null,
      typeMajorite: input.typeMajorite,
      cleRepartitionId: input.cleRepartitionId || DEFAULT_CLE_REPARTITION,
      resultat: 'non_vote',
      votePour: 0,
      voteContre: 0,
      voteAbstention: 0,
      ordre: numero - 1,
      createdAt: now as { seconds: number; nanoseconds: number },
      updatedAt: now as { seconds: number; nanoseconds: number },
    };
    mockStore.resolutions.push(resolution);
    return resolution;
  }

  const resRef = doc(
    collection(db, 'condos', coproId, 'meetings', agId, 'resolutions')
  );

  const resolution = {
    id: resRef.id,
    numero,
    titre: input.titre,
    description: input.description || null,
    typeMajorite: input.typeMajorite,
    cleRepartitionId: input.cleRepartitionId || DEFAULT_CLE_REPARTITION,
    resultat: 'non_vote',
    votePour: 0,
    voteContre: 0,
    voteAbstention: 0,
    ordre: numero - 1,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(resRef, resolution);

  // Create historique entry
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail,
    action: 'create',
    entityType: 'resolution',
    entityId: resRef.id,
    entityLabel: `Résolution ${numero}: ${input.titre}`,
    before: null,
    after: resolution,
  });

  return resolution as unknown as Resolution;
}

/**
 * Update a resolution
 */
export async function updateResolution(
  coproId: string,
  agId: string,
  resolutionId: string,
  userId: string,
  userEmail: string,
  input: UpdateResolutionInput
): Promise<void> {
  if (IS_TEST_MODE) {
    const index = mockStore.resolutions.findIndex((r) => r.id === resolutionId);
    if (index === -1) {
      throw new AGError('RESOLUTION_NOT_FOUND', 'Résolution non trouvée');
    }

    mockStore.resolutions[index] = {
      ...mockStore.resolutions[index]!,
      ...input,
      updatedAt: createMockTimestamp(),
    };
    return;
  }

  const resRef = doc(
    db,
    'condos',
    coproId,
    'meetings',
    agId,
    'resolutions',
    resolutionId
  );
  const resDoc = await getDoc(resRef);

  if (!resDoc.exists()) {
    throw new AGError('RESOLUTION_NOT_FOUND', 'Résolution non trouvée');
  }

  const before = resDoc.data();

  await updateDoc(resRef, {
    ...input,
    updatedAt: serverTimestamp(),
  });

  // Create historique entry
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail,
    action: 'update',
    entityType: 'resolution',
    entityId: resolutionId,
    entityLabel: `Résolution ${before.numero}: ${input.titre || before.titre}`,
    before,
    after: { ...before, ...input },
  });
}

/**
 * Delete a resolution
 */
export async function deleteResolution(
  coproId: string,
  agId: string,
  resolutionId: string,
  userId: string,
  userEmail: string
): Promise<void> {
  if (IS_TEST_MODE) {
    const index = mockStore.resolutions.findIndex((r) => r.id === resolutionId);
    if (index === -1) {
      throw new AGError('RESOLUTION_NOT_FOUND', 'Résolution non trouvée');
    }

    mockStore.resolutions.splice(index, 1);

    // Renumber remaining resolutions
    const remaining = mockStore.resolutions
      .filter((r) => r.id.startsWith(`${agId}-`))
      .sort((a, b) => a.ordre - b.ordre);
    remaining.forEach((r, i) => {
      r.numero = i + 1;
      r.ordre = i;
    });

    return;
  }

  const resRef = doc(
    db,
    'condos',
    coproId,
    'meetings',
    agId,
    'resolutions',
    resolutionId
  );
  const resDoc = await getDoc(resRef);

  if (!resDoc.exists()) {
    throw new AGError('RESOLUTION_NOT_FOUND', 'Résolution non trouvée');
  }

  const before = resDoc.data();
  await deleteDoc(resRef);

  // Renumber remaining resolutions
  const remaining = await getResolutions(coproId, agId);
  const batch = writeBatch(db);

  remaining.forEach((res, index) => {
    const ref = doc(
      db,
      'condos',
      coproId,
      'meetings',
      agId,
      'resolutions',
      res.id
    );
    batch.update(ref, { numero: index + 1, ordre: index });
  });

  await batch.commit();

  // Create historique entry
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail,
    action: 'delete',
    entityType: 'resolution',
    entityId: resolutionId,
    entityLabel: `Résolution ${before.numero}: ${before.titre}`,
    before,
    after: null,
  });
}

/**
 * Reorder resolutions
 */
export async function reorderResolutions(
  coproId: string,
  agId: string,
  userId: string,
  userEmail: string,
  orderedIds: string[]
): Promise<void> {
  if (IS_TEST_MODE) {
    orderedIds.forEach((id, index) => {
      const res = mockStore.resolutions.find((r) => r.id === id);
      if (res) {
        res.ordre = index;
        res.numero = index + 1;
        res.updatedAt = createMockTimestamp();
      }
    });
    return;
  }

  const batch = writeBatch(db);

  orderedIds.forEach((id, index) => {
    const ref = doc(
      db,
      'condos',
      coproId,
      'meetings',
      agId,
      'resolutions',
      id
    );
    batch.update(ref, {
      ordre: index,
      numero: index + 1,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();

  // Create historique entry
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail,
    action: 'update',
    entityType: 'resolution',
    entityId: agId,
    entityLabel: 'Réorganisation des résolutions',
    before: null,
    after: { orderedIds },
  });
}

/**
 * Update resolution vote results
 */
export async function updateResolutionResults(
  coproId: string,
  agId: string,
  resolutionId: string,
  results: {
    resultat: 'adopte' | 'rejete';
    votePour: number;
    voteContre: number;
    voteAbstention: number;
  }
): Promise<void> {
  if (IS_TEST_MODE) {
    const index = mockStore.resolutions.findIndex((r) => r.id === resolutionId);
    if (index === -1) {
      throw new AGError('RESOLUTION_NOT_FOUND', 'Résolution non trouvée');
    }

    mockStore.resolutions[index] = {
      ...mockStore.resolutions[index]!,
      ...results,
      updatedAt: createMockTimestamp(),
    };
    return;
  }

  const resRef = doc(
    db,
    'condos',
    coproId,
    'meetings',
    agId,
    'resolutions',
    resolutionId
  );

  await updateDoc(resRef, {
    ...results,
    updatedAt: serverTimestamp(),
  });
}
