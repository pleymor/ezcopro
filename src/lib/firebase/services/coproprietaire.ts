import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config';
import type { Coproprietaire, CreateCoproprietaireInput, UpdateCoproprietaireInput } from '@/types/coproprietaire';
import { createHistoriqueEntry } from './historique';
import { IS_TEST_MODE, mockStore, generateTestId, createMockTimestamp } from '@/lib/test/mock-data';

/**
 * Récupère tous les copropriétaires d'une copropriété
 */
export async function getCoproprietaires(coproId: string): Promise<Coproprietaire[]> {
  if (IS_TEST_MODE) {
    return [...mockStore.coproprietaires].sort((a, b) => a.nom.localeCompare(b.nom));
  }

  const cpQuery = query(
    collection(db, 'coproprietes', coproId, 'coproprietaires'),
    orderBy('nom', 'asc')
  );
  const snapshot = await getDocs(cpQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Coproprietaire[];
}

/**
 * Observe les copropriétaires en temps réel
 */
export function subscribeToCoproprietaires(
  coproId: string,
  callback: (coproprietaires: Coproprietaire[]) => void
): Unsubscribe {
  if (IS_TEST_MODE) {
    callback([...mockStore.coproprietaires].sort((a, b) => a.nom.localeCompare(b.nom)));
    return () => {};
  }

  const cpQuery = query(
    collection(db, 'coproprietes', coproId, 'coproprietaires'),
    orderBy('nom', 'asc')
  );

  return onSnapshot(cpQuery, (snapshot) => {
    const coproprietaires = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Coproprietaire[];
    callback(coproprietaires);
  });
}

/**
 * Récupère un copropriétaire par ID
 */
export async function getCoproprietaire(
  coproId: string,
  coproprietaireId: string
): Promise<Coproprietaire | null> {
  if (IS_TEST_MODE) {
    return mockStore.coproprietaires.find(cp => cp.id === coproprietaireId) || null;
  }

  const cpRef = doc(db, 'coproprietes', coproId, 'coproprietaires', coproprietaireId);
  const cpDoc = await getDoc(cpRef);

  if (!cpDoc.exists()) {
    return null;
  }

  return { id: cpDoc.id, ...cpDoc.data() } as Coproprietaire;
}

/**
 * Crée un nouveau copropriétaire
 */
export async function createCoproprietaire(
  coproId: string,
  userId: string,
  input: CreateCoproprietaireInput
): Promise<Coproprietaire> {
  if (IS_TEST_MODE) {
    const now = createMockTimestamp();
    const coproprietaire: Coproprietaire = {
      id: generateTestId(),
      nom: input.nom,
      prenom: input.prenom || '',
      email: input.email || null,
      telephone: input.telephone || null,
      userId: null,
      isAnonymized: false,
      createdAt: now,
      updatedAt: now,
    };
    mockStore.coproprietaires.push(coproprietaire);
    return coproprietaire;
  }

  const cpRef = doc(collection(db, 'coproprietes', coproId, 'coproprietaires'));
  const now = serverTimestamp();

  const coproprietaire = {
    id: cpRef.id,
    nom: input.nom,
    prenom: input.prenom || '',
    email: input.email || null,
    telephone: input.telephone || null,
    userId: null,
    isAnonymized: false,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(cpRef, coproprietaire);

  // Créer l'entrée d'historique
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail: '',
    action: 'create',
    entityType: 'coproprietaire',
    entityId: cpRef.id,
    entityLabel: `${input.nom} ${input.prenom || ''}`.trim(),
    before: null,
    after: coproprietaire,
  });

  return coproprietaire as unknown as Coproprietaire;
}

/**
 * Met à jour un copropriétaire
 */
export async function updateCoproprietaire(
  coproId: string,
  coproprietaireId: string,
  userId: string,
  input: UpdateCoproprietaireInput
): Promise<void> {
  if (IS_TEST_MODE) {
    const index = mockStore.coproprietaires.findIndex(cp => cp.id === coproprietaireId);
    if (index === -1) {
      throw new Error('Copropriétaire non trouvé');
    }
    mockStore.coproprietaires[index] = {
      ...mockStore.coproprietaires[index]!,
      ...input,
      updatedAt: createMockTimestamp(),
    };
    return;
  }

  const cpRef = doc(db, 'coproprietes', coproId, 'coproprietaires', coproprietaireId);
  const cpDoc = await getDoc(cpRef);

  if (!cpDoc.exists()) {
    throw new Error('Copropriétaire non trouvé');
  }

  const before = cpDoc.data();

  await updateDoc(cpRef, {
    ...input,
    updatedAt: serverTimestamp(),
  });

  // Créer l'entrée d'historique
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail: '',
    action: 'update',
    entityType: 'coproprietaire',
    entityId: coproprietaireId,
    entityLabel: `${input.nom || before.nom} ${input.prenom || before.prenom || ''}`.trim(),
    before,
    after: { ...before, ...input },
  });
}

/**
 * Anonymise un copropriétaire (RGPD)
 */
export async function anonymizeCoproprietaire(
  coproId: string,
  coproprietaireId: string,
  userId: string
): Promise<void> {
  if (IS_TEST_MODE) {
    const index = mockStore.coproprietaires.findIndex(cp => cp.id === coproprietaireId);
    if (index === -1) {
      throw new Error('Copropriétaire non trouvé');
    }
    mockStore.coproprietaires[index] = {
      ...mockStore.coproprietaires[index]!,
      nom: 'Ancien copropriétaire',
      prenom: '',
      email: null,
      telephone: null,
      updatedAt: createMockTimestamp(),
    };
    return;
  }

  const cpRef = doc(db, 'coproprietes', coproId, 'coproprietaires', coproprietaireId);
  const cpDoc = await getDoc(cpRef);

  if (!cpDoc.exists()) {
    throw new Error('Copropriétaire non trouvé');
  }

  const before = cpDoc.data();

  const anonymizedData = {
    nom: 'Ancien copropriétaire',
    prenom: '',
    email: null,
    telephone: null,
    isAnonymized: true,
    updatedAt: serverTimestamp(),
  };

  await updateDoc(cpRef, anonymizedData);

  // Créer l'entrée d'historique
  await createHistoriqueEntry(coproId, {
    userId,
    userEmail: '',
    action: 'update',
    entityType: 'coproprietaire',
    entityId: coproprietaireId,
    entityLabel: 'Anonymisation RGPD',
    before,
    after: { ...before, ...anonymizedData },
  });
}
