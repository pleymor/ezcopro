import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config';
import type { Presence, UpdatePresenceInput, AttendanceSummary } from '@/types/assemblee-generale';
import { AGError } from '@/types/assemblee-generale';
import { createHistoriqueEntry } from './historique';
import { getCoproprietaires } from './coproprietaire';
import { getLots } from './lot';
import { IS_TEST_MODE, mockStore, createMockTimestamp } from '@/lib/test/mock-data';

const MAX_REPRESENTATIONS = 3;

/**
 * Get all presences for an AG
 */
export async function getPresences(coproId: string, agId: string): Promise<Presence[]> {
  if (IS_TEST_MODE) {
    return mockStore.presences
      .filter((p) => p.id.startsWith(`${agId}-`))
      .sort((a, b) => a.nom.localeCompare(b.nom));
  }

  const presQuery = query(
    collection(db, 'coproprietes', coproId, 'assemblees-generales', agId, 'presences'),
    orderBy('nom', 'asc')
  );
  const snapshot = await getDocs(presQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Presence[];
}

/**
 * Subscribe to presences in real-time
 */
export function subscribeToPresences(
  coproId: string,
  agId: string,
  callback: (presences: Presence[]) => void
): Unsubscribe {
  if (IS_TEST_MODE) {
    const filtered = mockStore.presences
      .filter((p) => p.id.startsWith(`${agId}-`))
      .sort((a, b) => a.nom.localeCompare(b.nom));
    callback(filtered);
    return () => {};
  }

  const presQuery = query(
    collection(db, 'coproprietes', coproId, 'assemblees-generales', agId, 'presences'),
    orderBy('nom', 'asc')
  );

  return onSnapshot(presQuery, (snapshot) => {
    const presences = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Presence[];
    callback(presences);
  });
}

/**
 * Initialize presences from current copropriétaires
 * Called when AG attendance sheet is first accessed
 */
export async function initializePresences(
  coproId: string,
  agId: string,
  userId: string,
  userEmail: string
): Promise<void> {
  // Check if already initialized
  const existing = await getPresences(coproId, agId);
  if (existing.length > 0) {
    return; // Already initialized
  }

  // Get all copropriétaires with their lots
  const coproprietaires = await getCoproprietaires(coproId);
  const lots = await getLots(coproId);

  // Calculate tantièmes per copropriétaire
  const tantiemesParCopro = new Map<string, number>();
  lots.forEach((lot) => {
    const current = tantiemesParCopro.get(lot.coproprietaireId) || 0;
    tantiemesParCopro.set(lot.coproprietaireId, current + lot.tantiemes);
  });

  const now = IS_TEST_MODE ? createMockTimestamp() : serverTimestamp();

  if (IS_TEST_MODE) {
    // Filter copropriétaires who have lots (tantièmes)
    const withTantiemes = coproprietaires.filter((cp) => tantiemesParCopro.has(cp.id));

    withTantiemes.forEach((cp) => {
      const presence: Presence = {
        id: `${agId}-pres-${cp.id}`,
        coproprietaireId: cp.id,
        nom: cp.nom,
        prenom: cp.prenom,
        statut: 'absent',
        representeParId: null,
        tantiemes: tantiemesParCopro.get(cp.id) || 0,
        createdAt: now as { seconds: number; nanoseconds: number },
        updatedAt: now as { seconds: number; nanoseconds: number },
      };
      mockStore.presences.push(presence);
    });
    return;
  }

  const batch = writeBatch(db);

  // Filter copropriétaires who have lots (tantièmes)
  const withTantiemes = coproprietaires.filter((cp) => tantiemesParCopro.has(cp.id));

  withTantiemes.forEach((cp) => {
    const presRef = doc(
      collection(db, 'coproprietes', coproId, 'assemblees-generales', agId, 'presences')
    );

    const presence = {
      id: presRef.id,
      coproprietaireId: cp.id,
      nom: cp.nom,
      prenom: cp.prenom,
      statut: 'absent',
      representeParId: null,
      tantiemes: tantiemesParCopro.get(cp.id) || 0,
      createdAt: now,
      updatedAt: now,
    };

    batch.set(presRef, presence);
  });

  await batch.commit();

  // Create historique entry
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail,
    action: 'create',
    entityType: 'presence',
    entityId: agId,
    entityLabel: `Initialisation feuille de présence (${withTantiemes.length} copropriétaires)`,
    before: null,
    after: { count: withTantiemes.length },
  });
}

/**
 * Update a presence status
 */
export async function updatePresence(
  coproId: string,
  agId: string,
  presenceId: string,
  userId: string,
  userEmail: string,
  input: UpdatePresenceInput
): Promise<void> {
  // Validate representation rules
  if (input.statut === 'represente' && input.representeParId) {
    const presences = await getPresences(coproId, agId);

    // Check that representative is present
    const representative = presences.find((p) => p.coproprietaireId === input.representeParId);
    if (!representative || representative.statut !== 'present') {
      throw new AGError(
        'CANNOT_REPRESENT_ABSENT',
        'Le représentant doit être présent'
      );
    }

    // Check 3-person limit
    const representedCount = presences.filter(
      (p) => p.representeParId === input.representeParId && p.id !== presenceId
    ).length;

    if (representedCount >= MAX_REPRESENTATIONS) {
      throw new AGError(
        'REPRESENTATION_LIMIT_EXCEEDED',
        `Un copropriétaire ne peut représenter que ${MAX_REPRESENTATIONS} personnes maximum`
      );
    }
  }

  if (IS_TEST_MODE) {
    const index = mockStore.presences.findIndex((p) => p.id === presenceId);
    if (index === -1) {
      throw new AGError('PRESENCE_NOT_FOUND', 'Présence non trouvée');
    }

    const current = mockStore.presences[index]!;
    const newStatut = input.statut ?? current.statut;
    mockStore.presences[index] = {
      ...current,
      statut: newStatut,
      representeParId: newStatut === 'represente' ? (input.representeParId ?? current.representeParId ?? null) : null,
      updatedAt: createMockTimestamp(),
    };
    return;
  }

  const presRef = doc(
    db,
    'coproprietes',
    coproId,
    'assemblees-generales',
    agId,
    'presences',
    presenceId
  );

  await updateDoc(presRef, {
    statut: input.statut,
    representeParId: input.statut === 'represente' ? (input.representeParId || null) : null,
    updatedAt: serverTimestamp(),
  });

  // Create historique entry
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail,
    action: 'update',
    entityType: 'presence',
    entityId: presenceId,
    entityLabel: `Mise à jour présence`,
    before: null,
    after: input,
  });
}

/**
 * Get attendance summary
 */
export async function getAttendanceSummary(
  coproId: string,
  agId: string
): Promise<AttendanceSummary> {
  const presences = await getPresences(coproId, agId);

  const presents = presences.filter((p) => p.statut === 'present');
  const representes = presences.filter((p) => p.statut === 'represente');
  const absents = presences.filter((p) => p.statut === 'absent');

  const tantiemesPresents = presents.reduce((sum, p) => sum + p.tantiemes, 0);
  const tantiemesRepresentes = representes.reduce((sum, p) => sum + p.tantiemes, 0);
  const tantiemesTotal = presences.reduce((sum, p) => sum + p.tantiemes, 0);

  const pourcentagePresence =
    tantiemesTotal > 0
      ? ((tantiemesPresents + tantiemesRepresentes) / tantiemesTotal) * 100
      : 0;

  return {
    totalCoproprietaires: presences.length,
    presents: presents.length,
    representes: representes.length,
    absents: absents.length,
    tantiemesPresents,
    tantiemesRepresentes,
    tantiemesTotal,
    pourcentagePresence: Math.round(pourcentagePresence * 100) / 100,
  };
}

/**
 * Get copropriétaires who can vote (present + represented by them)
 */
export async function getVotingCoproprietaires(
  coproId: string,
  agId: string
): Promise<Array<Presence & { votingTantiemes: number; representedNames: string[] }>> {
  const presences = await getPresences(coproId, agId);
  const presents = presences.filter((p) => p.statut === 'present');

  return presents.map((present) => {
    // Find who this person represents
    const represented = presences.filter((p) => p.representeParId === present.coproprietaireId);

    // Total voting tantiemes = own + represented
    const votingTantiemes =
      present.tantiemes + represented.reduce((sum, r) => sum + r.tantiemes, 0);

    const representedNames = represented.map((r) => `${r.prenom} ${r.nom}`.trim());

    return {
      ...present,
      votingTantiemes,
      representedNames,
    };
  });
}
