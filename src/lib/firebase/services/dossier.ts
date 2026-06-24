'use client';

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config';
import type { Dossier, CreateDossierInput, UpdateDossierInput, NiveauAcces } from '@/types/dossier';
import { MAX_FOLDER_DEPTH } from '@/lib/schemas/dossier';

/**
 * Récupère la collection de dossiers pour une copropriété
 */
function getDossiersCollection(coproprieteId: string) {
  return collection(db, 'coproprietes', coproprieteId, 'dossiers');
}

/**
 * Subscribe aux dossiers d'un niveau spécifique (parentId)
 */
export function subscribeToDossiers(
  coproprieteId: string,
  parentId: string | null,
  callback: (dossiers: Dossier[]) => void,
  options?: {
    niveauAccesFilter?: NiveauAcces[];
  }
): () => void {
  const q = query(
    getDossiersCollection(coproprieteId),
    where('parentId', '==', parentId),
    orderBy('nom', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    let dossiers = snapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data(),
    })) as Dossier[];

    // Filtrage par niveau d'accès si spécifié
    if (options?.niveauAccesFilter && options.niveauAccesFilter.length > 0) {
      dossiers = dossiers.filter((d) =>
        options.niveauAccesFilter!.includes(d.niveauAcces)
      );
    }

    callback(dossiers);
  });
}

/**
 * Récupère un dossier par son ID
 */
export async function getDossier(
  coproprieteId: string,
  dossierId: string
): Promise<Dossier | null> {
  const docRef = doc(getDossiersCollection(coproprieteId), dossierId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Dossier;
}

/**
 * Récupère le chemin complet d'un dossier (pour le breadcrumb)
 */
export async function getDossierPath(
  coproprieteId: string,
  dossierId: string | null
): Promise<Dossier[]> {
  if (!dossierId) {
    return [];
  }

  const path: Dossier[] = [];
  let currentId: string | null = dossierId;

  while (currentId) {
    const dossier = await getDossier(coproprieteId, currentId);
    if (!dossier) {
      break;
    }
    path.unshift(dossier);
    currentId = dossier.parentId;
  }

  return path;
}

/**
 * Calcule la profondeur d'un dossier parent
 */
async function getParentDepth(
  coproprieteId: string,
  parentId: string | null
): Promise<number> {
  if (!parentId) {
    return -1; // Racine
  }

  const parent = await getDossier(coproprieteId, parentId);
  if (!parent) {
    throw new Error('Dossier parent non trouvé');
  }

  return parent.depth;
}

/**
 * Construit le path complet d'un dossier
 */
async function buildDossierPath(
  coproprieteId: string,
  parentId: string | null,
  nom: string
): Promise<string> {
  if (!parentId) {
    return `/${nom}`;
  }

  const parent = await getDossier(coproprieteId, parentId);
  if (!parent) {
    throw new Error('Dossier parent non trouvé');
  }

  return `${parent.path}/${nom}`;
}

/**
 * Crée un nouveau dossier
 */
export async function createDossier(
  coproprieteId: string,
  input: CreateDossierInput,
  createdBy: string
): Promise<Dossier> {
  // Vérifier la profondeur
  const parentDepth = await getParentDepth(coproprieteId, input.parentId);
  const newDepth = parentDepth + 1;

  if (newDepth > MAX_FOLDER_DEPTH) {
    throw new Error(
      `Profondeur maximale atteinte (${MAX_FOLDER_DEPTH + 1} niveaux maximum)`
    );
  }

  // Construire le path
  const path = await buildDossierPath(coproprieteId, input.parentId, input.nom);

  const now = Timestamp.now();
  const dossierData = {
    nom: input.nom,
    parentId: input.parentId,
    path,
    depth: newDepth,
    niveauAcces: input.niveauAcces,
    coproprieteId,
    createdAt: now,
    updatedAt: now,
    createdBy,
  };

  const docRef = await addDoc(getDossiersCollection(coproprieteId), dossierData);

  return {
    id: docRef.id,
    ...dossierData,
  } as Dossier;
}

/**
 * Met à jour un dossier
 */
export async function updateDossier(
  coproprieteId: string,
  dossierId: string,
  input: UpdateDossierInput
): Promise<void> {
  const docRef = doc(getDossiersCollection(coproprieteId), dossierId);

  const updateData: Record<string, unknown> = {
    ...input,
    updatedAt: Timestamp.now(),
  };

  // Si le nom change, il faut mettre à jour le path
  if (input.nom) {
    const dossier = await getDossier(coproprieteId, dossierId);
    if (dossier) {
      updateData.path = await buildDossierPath(
        coproprieteId,
        dossier.parentId,
        input.nom
      );
    }
  }

  await updateDoc(docRef, updateData);
}

/**
 * Vérifie si un dossier est vide (pas de sous-dossiers ni documents)
 */
export async function isDossierEmpty(
  coproprieteId: string,
  dossierId: string
): Promise<boolean> {
  // Vérifier les sous-dossiers
  const subFoldersQuery = query(
    getDossiersCollection(coproprieteId),
    where('parentId', '==', dossierId)
  );
  const subFoldersSnap = await getDocs(subFoldersQuery);

  if (!subFoldersSnap.empty) {
    return false;
  }

  // Vérifier les documents
  const documentsCollection = collection(
    db,
    'coproprietes',
    coproprieteId,
    'documentsPartages'
  );
  const documentsQuery = query(
    documentsCollection,
    where('dossierId', '==', dossierId)
  );
  const documentsSnap = await getDocs(documentsQuery);

  return documentsSnap.empty;
}

/**
 * Supprime un dossier
 * @param force - Si true, supprime récursivement tout le contenu
 */
export async function deleteDossier(
  coproprieteId: string,
  dossierId: string,
  force: boolean = false
): Promise<void> {
  const isEmpty = await isDossierEmpty(coproprieteId, dossierId);

  if (!isEmpty && !force) {
    throw new Error(
      'Le dossier n\'est pas vide. Utilisez force=true pour supprimer récursivement.'
    );
  }

  if (force && !isEmpty) {
    // Supprimer récursivement les sous-dossiers
    const subFoldersQuery = query(
      getDossiersCollection(coproprieteId),
      where('parentId', '==', dossierId)
    );
    const subFoldersSnap = await getDocs(subFoldersQuery);

    for (const subDoc of subFoldersSnap.docs) {
      await deleteDossier(coproprieteId, subDoc.id, true);
    }

    // Déplacer les documents vers la racine (ou les supprimer selon la politique)
    const documentsCollection = collection(
      db,
      'coproprietes',
      coproprieteId,
      'documentsPartages'
    );
    const documentsQuery = query(
      documentsCollection,
      where('dossierId', '==', dossierId)
    );
    const documentsSnap = await getDocs(documentsQuery);

    const batch = writeBatch(db);
    documentsSnap.docs.forEach((docSnap) => {
      batch.update(docSnap.ref, {
        dossierId: null,
        updatedAt: Timestamp.now(),
      });
    });
    await batch.commit();
  }

  // Supprimer le dossier
  const docRef = doc(getDossiersCollection(coproprieteId), dossierId);
  await deleteDoc(docRef);
}

/**
 * Déplace un document vers un autre dossier
 */
export async function moveDocument(
  coproprieteId: string,
  documentId: string,
  targetDossierId: string | null
): Promise<void> {
  const documentsCollection = collection(
    db,
    'coproprietes',
    coproprieteId,
    'documentsPartages'
  );
  const docRef = doc(documentsCollection, documentId);

  // Récupérer le niveau d'accès du dossier cible
  let niveauAcces: NiveauAcces = 'syndic';
  if (targetDossierId) {
    const targetDossier = await getDossier(coproprieteId, targetDossierId);
    if (targetDossier) {
      niveauAcces = targetDossier.niveauAcces;
    }
  }

  await updateDoc(docRef, {
    dossierId: targetDossierId,
    niveauAcces,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Récupère le niveau d'accès hérité pour un nouveau dossier
 */
export async function getInheritedNiveauAcces(
  coproprieteId: string,
  parentId: string | null
): Promise<NiveauAcces> {
  if (!parentId) {
    return 'syndic'; // Par défaut pour la racine
  }

  const parent = await getDossier(coproprieteId, parentId);
  return parent?.niveauAcces || 'syndic';
}
