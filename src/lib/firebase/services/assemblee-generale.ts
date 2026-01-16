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
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config';
import type {
  AssembleeGenerale,
  CreateAGInput,
  UpdateAGInput,
  AGStatus,
} from '@/types/assemblee-generale';
import { AGError } from '@/types/assemblee-generale';
import { createHistoriqueEntry } from './historique';
import { IS_TEST_MODE, mockStore, generateTestId, createMockTimestamp } from '@/lib/test/mock-data';

// Valid status transitions
const VALID_TRANSITIONS: Record<AGStatus, AGStatus[]> = {
  brouillon: ['convoquee'],
  convoquee: ['en_cours'],
  en_cours: ['terminee'],
  terminee: [],
};

/**
 * Get all AGs for a copropriété
 */
export async function getAssembleesGenerales(coproId: string): Promise<AssembleeGenerale[]> {
  if (IS_TEST_MODE) {
    return [...mockStore.assembleesGenerales].sort((a, b) => {
      const dateA = a.date.seconds;
      const dateB = b.date.seconds;
      return dateB - dateA; // Most recent first
    });
  }

  const agQuery = query(
    collection(db, 'coproprietes', coproId, 'assemblees-generales'),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(agQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as AssembleeGenerale[];
}

/**
 * Subscribe to AGs in real-time
 */
export function subscribeToAssembleesGenerales(
  coproId: string,
  callback: (ags: AssembleeGenerale[]) => void
): Unsubscribe {
  if (IS_TEST_MODE) {
    const sorted = [...mockStore.assembleesGenerales].sort((a, b) => {
      return b.date.seconds - a.date.seconds;
    });
    callback(sorted);
    return () => {};
  }

  const agQuery = query(
    collection(db, 'coproprietes', coproId, 'assemblees-generales'),
    orderBy('date', 'desc')
  );

  return onSnapshot(agQuery, (snapshot) => {
    const ags = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AssembleeGenerale[];
    callback(ags);
  });
}

/**
 * Get a single AG by ID
 */
export async function getAssembleeGenerale(
  coproId: string,
  agId: string
): Promise<AssembleeGenerale | null> {
  if (IS_TEST_MODE) {
    return mockStore.assembleesGenerales.find((ag) => ag.id === agId) || null;
  }

  const agRef = doc(db, 'coproprietes', coproId, 'assemblees-generales', agId);
  const agDoc = await getDoc(agRef);

  if (!agDoc.exists()) {
    return null;
  }

  return { id: agDoc.id, ...agDoc.data() } as AssembleeGenerale;
}

/**
 * Subscribe to a single AG in real-time
 */
export function subscribeToAssembleeGenerale(
  coproId: string,
  agId: string,
  callback: (ag: AssembleeGenerale | null) => void
): Unsubscribe {
  if (IS_TEST_MODE) {
    const ag = mockStore.assembleesGenerales.find((ag) => ag.id === agId) || null;
    callback(ag);
    return () => {};
  }

  const agRef = doc(db, 'coproprietes', coproId, 'assemblees-generales', agId);

  return onSnapshot(agRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback({ id: snapshot.id, ...snapshot.data() } as AssembleeGenerale);
  });
}

/**
 * Create a new AG
 */
export async function createAssembleeGenerale(
  coproId: string,
  userId: string,
  userEmail: string,
  input: CreateAGInput,
  totalTantiemes: number
): Promise<AssembleeGenerale> {
  const now = IS_TEST_MODE ? createMockTimestamp() : serverTimestamp();
  const dateTimestamp = IS_TEST_MODE
    ? { seconds: Math.floor(input.date.getTime() / 1000), nanoseconds: 0 }
    : Timestamp.fromDate(input.date);

  if (IS_TEST_MODE) {
    const ag: AssembleeGenerale = {
      id: generateTestId(),
      date: dateTimestamp as { seconds: number; nanoseconds: number },
      heure: input.heure,
      lieu: input.lieu,
      type: input.type,
      statut: 'brouillon',
      dateConvocation: null,
      totalTantiemes,
      createdAt: now as { seconds: number; nanoseconds: number },
      updatedAt: now as { seconds: number; nanoseconds: number },
    };
    mockStore.assembleesGenerales.push(ag);
    return ag;
  }

  const agRef = doc(collection(db, 'coproprietes', coproId, 'assemblees-generales'));

  const ag = {
    id: agRef.id,
    date: dateTimestamp,
    heure: input.heure,
    lieu: input.lieu,
    type: input.type,
    statut: 'brouillon' as AGStatus,
    dateConvocation: null,
    totalTantiemes,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(agRef, ag);

  // Create historique entry
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail,
    action: 'create',
    entityType: 'assemblee_generale',
    entityId: agRef.id,
    entityLabel: `AG ${input.type} du ${input.date.toLocaleDateString('fr-FR')}`,
    before: null,
    after: ag,
  });

  return ag as unknown as AssembleeGenerale;
}

/**
 * Update an AG (only in brouillon status)
 */
export async function updateAssembleeGenerale(
  coproId: string,
  agId: string,
  userId: string,
  userEmail: string,
  input: UpdateAGInput
): Promise<void> {
  if (IS_TEST_MODE) {
    const index = mockStore.assembleesGenerales.findIndex((ag) => ag.id === agId);
    if (index === -1) {
      throw new AGError('AG_NOT_FOUND', 'Assemblée générale non trouvée');
    }

    const ag = mockStore.assembleesGenerales[index]!;
    if (ag.statut !== 'brouillon') {
      throw new AGError(
        'AG_CANNOT_MODIFY_NON_BROUILLON',
        'Seule une AG en brouillon peut être modifiée'
      );
    }

    const updates: Record<string, unknown> = {
      updatedAt: createMockTimestamp(),
    };

    if (input.heure) updates.heure = input.heure;
    if (input.lieu) updates.lieu = input.lieu;
    if (input.type) updates.type = input.type;
    if (input.date) {
      updates.date = { seconds: Math.floor(input.date.getTime() / 1000), nanoseconds: 0 };
    }

    mockStore.assembleesGenerales[index] = { ...ag, ...updates } as AssembleeGenerale;
    return;
  }

  const agRef = doc(db, 'coproprietes', coproId, 'assemblees-generales', agId);
  const agDoc = await getDoc(agRef);

  if (!agDoc.exists()) {
    throw new AGError('AG_NOT_FOUND', 'Assemblée générale non trouvée');
  }

  const before = agDoc.data();
  if (before.statut !== 'brouillon') {
    throw new AGError(
      'AG_CANNOT_MODIFY_NON_BROUILLON',
      'Seule une AG en brouillon peut être modifiée'
    );
  }

  const updates: Record<string, unknown> = {
    ...input,
    updatedAt: serverTimestamp(),
  };

  if (input.date) {
    updates.date = Timestamp.fromDate(input.date);
  }

  await updateDoc(agRef, updates);

  // Create historique entry
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail,
    action: 'update',
    entityType: 'assemblee_generale',
    entityId: agId,
    entityLabel: `AG du ${new Date(before.date.seconds * 1000).toLocaleDateString('fr-FR')}`,
    before,
    after: { ...before, ...updates },
  });
}

/**
 * Delete an AG (only in brouillon status)
 */
export async function deleteAssembleeGenerale(
  coproId: string,
  agId: string,
  userId: string,
  userEmail: string
): Promise<void> {
  if (IS_TEST_MODE) {
    const index = mockStore.assembleesGenerales.findIndex((ag) => ag.id === agId);
    if (index === -1) {
      throw new AGError('AG_NOT_FOUND', 'Assemblée générale non trouvée');
    }

    const ag = mockStore.assembleesGenerales[index]!;
    if (ag.statut !== 'brouillon') {
      throw new AGError(
        'AG_CANNOT_MODIFY_NON_BROUILLON',
        'Seule une AG en brouillon peut être supprimée'
      );
    }

    mockStore.assembleesGenerales.splice(index, 1);
    return;
  }

  const agRef = doc(db, 'coproprietes', coproId, 'assemblees-generales', agId);
  const agDoc = await getDoc(agRef);

  if (!agDoc.exists()) {
    throw new AGError('AG_NOT_FOUND', 'Assemblée générale non trouvée');
  }

  const before = agDoc.data();
  if (before.statut !== 'brouillon') {
    throw new AGError(
      'AG_CANNOT_MODIFY_NON_BROUILLON',
      'Seule une AG en brouillon peut être supprimée'
    );
  }

  await deleteDoc(agRef);

  // Create historique entry
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail,
    action: 'delete',
    entityType: 'assemblee_generale',
    entityId: agId,
    entityLabel: `AG du ${new Date(before.date.seconds * 1000).toLocaleDateString('fr-FR')}`,
    before,
    after: null,
  });
}

/**
 * Transition AG status
 */
export async function transitionAGStatus(
  coproId: string,
  agId: string,
  userId: string,
  userEmail: string,
  newStatus: AGStatus
): Promise<void> {
  if (IS_TEST_MODE) {
    const index = mockStore.assembleesGenerales.findIndex((ag) => ag.id === agId);
    if (index === -1) {
      throw new AGError('AG_NOT_FOUND', 'Assemblée générale non trouvée');
    }

    const ag = mockStore.assembleesGenerales[index]!;
    const validTransitions = VALID_TRANSITIONS[ag.statut];

    if (!validTransitions.includes(newStatus)) {
      throw new AGError(
        'AG_INVALID_STATUS_TRANSITION',
        `Transition de ${ag.statut} vers ${newStatus} non autorisée`
      );
    }

    const updates: Partial<AssembleeGenerale> = {
      statut: newStatus,
      updatedAt: createMockTimestamp(),
    };

    if (newStatus === 'convoquee') {
      updates.dateConvocation = createMockTimestamp();
    }

    mockStore.assembleesGenerales[index] = { ...ag, ...updates } as AssembleeGenerale;
    return;
  }

  const agRef = doc(db, 'coproprietes', coproId, 'assemblees-generales', agId);
  const agDoc = await getDoc(agRef);

  if (!agDoc.exists()) {
    throw new AGError('AG_NOT_FOUND', 'Assemblée générale non trouvée');
  }

  const before = agDoc.data();
  const validTransitions = VALID_TRANSITIONS[before.statut as AGStatus];

  if (!validTransitions.includes(newStatus)) {
    throw new AGError(
      'AG_INVALID_STATUS_TRANSITION',
      `Transition de ${before.statut} vers ${newStatus} non autorisée`
    );
  }

  const updates: Record<string, unknown> = {
    statut: newStatus,
    updatedAt: serverTimestamp(),
  };

  if (newStatus === 'convoquee') {
    updates.dateConvocation = serverTimestamp();
  }

  await updateDoc(agRef, updates);

  // Create historique entry
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail,
    action: 'update',
    entityType: 'assemblee_generale',
    entityId: agId,
    entityLabel: `AG - Transition vers ${newStatus}`,
    before,
    after: { ...before, ...updates },
  });
}
