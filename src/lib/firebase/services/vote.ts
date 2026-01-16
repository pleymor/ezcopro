import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config';
import type {
  Vote,
  RecordVoteInput,
  UpdateVoteInput,
  ResolutionResult,
  MajoriteType,
} from '@/types/assemblee-generale';
import { AGError } from '@/types/assemblee-generale';
import { createHistoriqueEntry } from './historique';
import { getPresences, getAttendanceSummary } from './presence';
import { updateResolutionResults } from './resolution';
import { IS_TEST_MODE, mockStore, generateTestId, createMockTimestamp } from '@/lib/test/mock-data';

/**
 * Get all votes for a resolution
 */
export async function getVotes(
  coproId: string,
  agId: string,
  resolutionId: string
): Promise<Vote[]> {
  if (IS_TEST_MODE) {
    return mockStore.votes.filter((v) => v.resolutionId === resolutionId);
  }

  const votesQuery = query(
    collection(
      db,
      'coproprietes',
      coproId,
      'assemblees-generales',
      agId,
      'resolutions',
      resolutionId,
      'votes'
    )
  );
  const snapshot = await getDocs(votesQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Vote[];
}

/**
 * Subscribe to votes in real-time
 */
export function subscribeToVotes(
  coproId: string,
  agId: string,
  resolutionId: string,
  callback: (votes: Vote[]) => void
): Unsubscribe {
  if (IS_TEST_MODE) {
    const filtered = mockStore.votes.filter((v) => v.resolutionId === resolutionId);
    callback(filtered);
    return () => {};
  }

  const votesQuery = query(
    collection(
      db,
      'coproprietes',
      coproId,
      'assemblees-generales',
      agId,
      'resolutions',
      resolutionId,
      'votes'
    )
  );

  return onSnapshot(votesQuery, (snapshot) => {
    const votes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Vote[];
    callback(votes);
  });
}

/**
 * Record a vote
 */
export async function recordVote(
  coproId: string,
  agId: string,
  resolutionId: string,
  userId: string,
  userEmail: string,
  input: RecordVoteInput,
  tantiemes: number,
  representantId: string | null = null
): Promise<Vote> {
  // Validate that the copropriétaire can vote
  const presences = await getPresences(coproId, agId);
  const presence = presences.find((p) => p.coproprietaireId === input.coproprietaireId);

  if (!presence) {
    throw new AGError(
      'VOTE_INVALID_COPROPRIETAIRE',
      'Ce copropriétaire ne fait pas partie de cette AG'
    );
  }

  if (presence.statut === 'absent') {
    throw new AGError(
      'VOTE_INVALID_COPROPRIETAIRE',
      'Un copropriétaire absent ne peut pas voter'
    );
  }

  const now = IS_TEST_MODE ? createMockTimestamp() : serverTimestamp();

  if (IS_TEST_MODE) {
    // Check if vote already exists
    const existingIndex = mockStore.votes.findIndex(
      (v) => v.resolutionId === resolutionId && v.coproprietaireId === input.coproprietaireId
    );

    const vote: Vote = {
      id: existingIndex >= 0 ? mockStore.votes[existingIndex]!.id : generateTestId(),
      resolutionId,
      coproprietaireId: input.coproprietaireId,
      choix: input.choix,
      tantiemes,
      representantId,
      createdAt: now as { seconds: number; nanoseconds: number },
      updatedAt: now as { seconds: number; nanoseconds: number },
    };

    if (existingIndex >= 0) {
      mockStore.votes[existingIndex] = vote;
    } else {
      mockStore.votes.push(vote);
    }

    return vote;
  }

  // Check if vote already exists
  const existingVotes = await getVotes(coproId, agId, resolutionId);
  const existingVote = existingVotes.find((v) => v.coproprietaireId === input.coproprietaireId);

  const voteRef = existingVote
    ? doc(
        db,
        'coproprietes',
        coproId,
        'assemblees-generales',
        agId,
        'resolutions',
        resolutionId,
        'votes',
        existingVote.id
      )
    : doc(
        collection(
          db,
          'coproprietes',
          coproId,
          'assemblees-generales',
          agId,
          'resolutions',
          resolutionId,
          'votes'
        )
      );

  const vote = {
    id: voteRef.id,
    resolutionId,
    coproprietaireId: input.coproprietaireId,
    choix: input.choix,
    tantiemes,
    representantId,
    createdAt: existingVote ? existingVote.createdAt : now,
    updatedAt: now,
  };

  await setDoc(voteRef, vote);

  // Create historique entry
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail,
    action: existingVote ? 'update' : 'create',
    entityType: 'vote',
    entityId: voteRef.id,
    entityLabel: `Vote ${input.choix}`,
    before: existingVote || null,
    after: vote,
  });

  return vote as unknown as Vote;
}

/**
 * Update a vote
 */
export async function updateVote(
  coproId: string,
  agId: string,
  resolutionId: string,
  voteId: string,
  userId: string,
  userEmail: string,
  input: UpdateVoteInput
): Promise<void> {
  if (IS_TEST_MODE) {
    const index = mockStore.votes.findIndex((v) => v.id === voteId);
    if (index === -1) {
      throw new AGError('VOTE_INVALID_COPROPRIETAIRE', 'Vote non trouvé');
    }

    mockStore.votes[index] = {
      ...mockStore.votes[index]!,
      choix: input.choix,
      updatedAt: createMockTimestamp(),
    };
    return;
  }

  const voteRef = doc(
    db,
    'coproprietes',
    coproId,
    'assemblees-generales',
    agId,
    'resolutions',
    resolutionId,
    'votes',
    voteId
  );

  const voteDoc = await getDoc(voteRef);
  if (!voteDoc.exists()) {
    throw new AGError('VOTE_INVALID_COPROPRIETAIRE', 'Vote non trouvé');
  }

  const before = voteDoc.data();

  await updateDoc(voteRef, {
    choix: input.choix,
    updatedAt: serverTimestamp(),
  });

  // Create historique entry
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail,
    action: 'update',
    entityType: 'vote',
    entityId: voteId,
    entityLabel: `Vote modifié: ${input.choix}`,
    before,
    after: { ...before, choix: input.choix },
  });
}

/**
 * Delete a vote
 */
export async function deleteVote(
  coproId: string,
  agId: string,
  resolutionId: string,
  voteId: string
): Promise<void> {
  if (IS_TEST_MODE) {
    const index = mockStore.votes.findIndex((v) => v.id === voteId);
    if (index >= 0) {
      mockStore.votes.splice(index, 1);
    }
    return;
  }

  const voteRef = doc(
    db,
    'coproprietes',
    coproId,
    'assemblees-generales',
    agId,
    'resolutions',
    resolutionId,
    'votes',
    voteId
  );

  await deleteDoc(voteRef);
}

/**
 * Calculate if a resolution is adopted based on majority type
 */
export function calculateMajorityResult(
  typeMajorite: MajoriteType,
  votePour: number,
  voteContre: number,
  _voteAbstention: number,
  totalTantiemes: number
): { resultat: 'adopte' | 'rejete'; canSecondVote: boolean } {
  switch (typeMajorite) {
    case 'article_24':
      // Majorité simple des voix exprimées
      return {
        resultat: votePour > voteContre ? 'adopte' : 'rejete',
        canSecondVote: false,
      };

    case 'article_25':
      // Majorité absolue de tous les tantièmes (>50%)
      const isAdopted25 = votePour > totalTantiemes / 2;
      // Can have second vote at Art.24 if got at least 1/3 of votes
      const canSecondVote = !isAdopted25 && votePour >= totalTantiemes / 3;
      return {
        resultat: isAdopted25 ? 'adopte' : 'rejete',
        canSecondVote,
      };

    case 'article_26':
      // Double majorité: majority of members AND 2/3 of tantièmes
      // For simplicity, we check if pour >= 2/3 of total tantièmes
      return {
        resultat: votePour >= (totalTantiemes * 2) / 3 ? 'adopte' : 'rejete',
        canSecondVote: false,
      };

    case 'unanimite':
      // 100% des tantièmes
      return {
        resultat: votePour === totalTantiemes ? 'adopte' : 'rejete',
        canSecondVote: false,
      };

    default:
      return { resultat: 'rejete', canSecondVote: false };
  }
}

/**
 * Finalize voting on a resolution (calculate and store result)
 */
export async function finalizeResolutionVote(
  coproId: string,
  agId: string,
  resolutionId: string,
  userId: string,
  userEmail: string,
  typeMajorite: MajoriteType
): Promise<ResolutionResult> {
  const votes = await getVotes(coproId, agId, resolutionId);
  const summary = await getAttendanceSummary(coproId, agId);

  const votePour = votes
    .filter((v) => v.choix === 'pour')
    .reduce((sum, v) => sum + v.tantiemes, 0);
  const voteContre = votes
    .filter((v) => v.choix === 'contre')
    .reduce((sum, v) => sum + v.tantiemes, 0);
  const voteAbstention = votes
    .filter((v) => v.choix === 'abstention')
    .reduce((sum, v) => sum + v.tantiemes, 0);

  const { resultat, canSecondVote } = calculateMajorityResult(
    typeMajorite,
    votePour,
    voteContre,
    voteAbstention,
    summary.tantiemesTotal
  );

  // Update resolution with results
  await updateResolutionResults(coproId, agId, resolutionId, {
    resultat,
    votePour,
    voteContre,
    voteAbstention,
  });

  // Create historique entry
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail,
    action: 'update',
    entityType: 'resolution',
    entityId: resolutionId,
    entityLabel: `Vote finalisé: ${resultat}`,
    before: null,
    after: { resultat, votePour, voteContre, voteAbstention },
  });

  return {
    resultat,
    votePour,
    voteContre,
    voteAbstention,
    canSecondVote,
  };
}

/**
 * Get opposants (voted contre) and défaillants (absent non représenté)
 */
export async function getOpposantsDefaillants(
  coproId: string,
  agId: string,
  resolutionId: string
): Promise<{
  opposants: Array<{ nom: string; prenom: string; tantiemes: number }>;
  defaillants: Array<{ nom: string; prenom: string; tantiemes: number }>;
}> {
  const votes = await getVotes(coproId, agId, resolutionId);
  const presences = await getPresences(coproId, agId);

  // Opposants: voted contre
  const opposantsIds = votes
    .filter((v) => v.choix === 'contre')
    .map((v) => v.coproprietaireId);

  const opposants = presences
    .filter((p) => opposantsIds.includes(p.coproprietaireId))
    .map((p) => ({
      nom: p.nom,
      prenom: p.prenom,
      tantiemes: p.tantiemes,
    }));

  // Défaillants: absent and not represented
  const defaillants = presences
    .filter((p) => p.statut === 'absent')
    .map((p) => ({
      nom: p.nom,
      prenom: p.prenom,
      tantiemes: p.tantiemes,
    }));

  return { opposants, defaillants };
}
