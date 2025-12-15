import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  serverTimestamp,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../config';

export type ActionType = 'create' | 'update' | 'delete';
export type EntityType = 'lot' | 'coproprietaire' | 'appel' | 'paiement' | 'copropriete';

export interface HistoriqueEntry {
  id: string;
  userId: string;
  userEmail: string;
  action: ActionType;
  entityType: EntityType;
  entityId: string;
  entityLabel: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  timestamp: { seconds: number; nanoseconds: number };
}

interface CreateHistoriqueInput {
  userId: string;
  userEmail: string;
  action: ActionType;
  entityType: EntityType;
  entityId: string;
  entityLabel: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}

/**
 * Crée une entrée d'historique
 */
export async function createHistoriqueEntry(
  coproId: string,
  input: CreateHistoriqueInput
): Promise<void> {
  const histRef = doc(collection(db, 'coproprietes', coproId, 'historique'));

  await setDoc(histRef, {
    id: histRef.id,
    ...input,
    timestamp: serverTimestamp(),
  });
}

export interface HistoriqueOptions {
  limit?: number;
  startAfterDoc?: DocumentSnapshot;
  entityType?: EntityType;
}

export interface HistoriquePage {
  entries: HistoriqueEntry[];
  hasMore: boolean;
  lastDoc: DocumentSnapshot | null;
}

/**
 * Récupère l'historique d'une copropriété (paginé)
 */
export async function getHistorique(
  coproId: string,
  options: HistoriqueOptions = {}
): Promise<HistoriquePage> {
  const pageLimit = options.limit || 50;

  let histQuery = query(
    collection(db, 'coproprietes', coproId, 'historique'),
    orderBy('timestamp', 'desc'),
    limit(pageLimit + 1) // +1 pour savoir s'il y a plus
  );

  if (options.entityType) {
    histQuery = query(
      collection(db, 'coproprietes', coproId, 'historique'),
      where('entityType', '==', options.entityType),
      orderBy('timestamp', 'desc'),
      limit(pageLimit + 1)
    );
  }

  if (options.startAfterDoc) {
    histQuery = query(histQuery, startAfter(options.startAfterDoc));
  }

  const snapshot = await getDocs(histQuery);
  const docs = snapshot.docs;
  const hasMore = docs.length > pageLimit;

  const entries = docs.slice(0, pageLimit).map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as HistoriqueEntry[];

  return {
    entries,
    hasMore,
    lastDoc: docs.length > 0 ? docs[docs.length - 1]! : null,
  };
}
