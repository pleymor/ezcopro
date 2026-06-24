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
import type { Folder, CreateFolderInput, UpdateFolderInput } from '@/types/folder';
import type { AccessLevel } from '@/types/document';

const MAX_FOLDER_DEPTH = 3;

/**
 * Get the folders collection for a condo
 */
function getFoldersCollection(condoId: string) {
  return collection(db, 'condos', condoId, 'folders');
}

/**
 * Subscribe to folders at a specific level (parentId)
 */
export function subscribeToFolders(
  condoId: string,
  parentId: string | null,
  callback: (folders: Folder[]) => void,
  options?: {
    accessLevelFilter?: AccessLevel[];
  }
): () => void {
  const q = query(
    getFoldersCollection(condoId),
    where('parentId', '==', parentId),
    orderBy('name', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    let folders = snapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data(),
    })) as Folder[];

    // Filter by accessLevel if specified
    if (options?.accessLevelFilter && options.accessLevelFilter.length > 0) {
      folders = folders.filter((f) =>
        options.accessLevelFilter!.includes(f.accessLevel)
      );
    }

    callback(folders);
  });
}

/**
 * Get a folder by ID
 */
export async function getFolder(
  condoId: string,
  folderId: string
): Promise<Folder | null> {
  const docRef = doc(getFoldersCollection(condoId), folderId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Folder;
}

/**
 * Get the full path of a folder (for breadcrumb)
 */
export async function getFolderPath(
  condoId: string,
  folderId: string | null
): Promise<Folder[]> {
  if (!folderId) {
    return [];
  }

  const path: Folder[] = [];
  let currentId: string | null = folderId;

  while (currentId) {
    const folder = await getFolder(condoId, currentId);
    if (!folder) {
      break;
    }
    path.unshift(folder);
    currentId = folder.parentId;
  }

  return path;
}

/**
 * Calculate the depth of a parent folder
 */
async function getParentDepth(
  condoId: string,
  parentId: string | null
): Promise<number> {
  if (!parentId) {
    return 0;
  }

  const path = await getFolderPath(condoId, parentId);
  return path.length;
}

/**
 * Create a new folder
 */
export async function createFolder(
  condoId: string,
  input: CreateFolderInput,
  createdBy: string
): Promise<Folder> {
  // Check depth
  const parentDepth = await getParentDepth(condoId, input.parentId ?? null);
  const newDepth = parentDepth + 1;

  if (newDepth > MAX_FOLDER_DEPTH) {
    throw new Error(
      `Maximum folder depth reached (${MAX_FOLDER_DEPTH} levels maximum)`
    );
  }

  const now = Timestamp.now();
  const folderData = {
    name: input.name,
    parentId: input.parentId ?? null,
    accessLevel: input.accessLevel ?? 'all',
    createdBy,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(getFoldersCollection(condoId), folderData);

  return {
    id: docRef.id,
    ...folderData,
  } as Folder;
}

/**
 * Update a folder
 */
export async function updateFolder(
  condoId: string,
  folderId: string,
  input: UpdateFolderInput
): Promise<void> {
  const docRef = doc(getFoldersCollection(condoId), folderId);

  await updateDoc(docRef, {
    ...input,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Check if a folder is empty (no subfolders or documents)
 */
export async function isFolderEmpty(
  condoId: string,
  folderId: string
): Promise<boolean> {
  // Check subfolders
  const subFoldersQuery = query(
    getFoldersCollection(condoId),
    where('parentId', '==', folderId)
  );
  const subFoldersSnap = await getDocs(subFoldersQuery);

  if (!subFoldersSnap.empty) {
    return false;
  }

  // Check documents
  const documentsCollection = collection(
    db,
    'condos',
    condoId,
    'documents'
  );
  const documentsQuery = query(
    documentsCollection,
    where('folderId', '==', folderId)
  );
  const documentsSnap = await getDocs(documentsQuery);

  return documentsSnap.empty;
}

/**
 * Delete a folder
 * @param force - If true, recursively delete all content
 */
export async function deleteFolder(
  condoId: string,
  folderId: string,
  force: boolean = false
): Promise<void> {
  const isEmpty = await isFolderEmpty(condoId, folderId);

  if (!isEmpty && !force) {
    throw new Error(
      'Folder is not empty. Use force=true to delete recursively.'
    );
  }

  if (force && !isEmpty) {
    // Recursively delete subfolders
    const subFoldersQuery = query(
      getFoldersCollection(condoId),
      where('parentId', '==', folderId)
    );
    const subFoldersSnap = await getDocs(subFoldersQuery);

    for (const subDoc of subFoldersSnap.docs) {
      await deleteFolder(condoId, subDoc.id, true);
    }

    // Move documents to root (or delete according to policy)
    const documentsCollection = collection(
      db,
      'condos',
      condoId,
      'documents'
    );
    const documentsQuery = query(
      documentsCollection,
      where('folderId', '==', folderId)
    );
    const documentsSnap = await getDocs(documentsQuery);

    const batch = writeBatch(db);
    documentsSnap.docs.forEach((docSnap) => {
      batch.update(docSnap.ref, {
        folderId: null,
        updatedAt: Timestamp.now(),
      });
    });
    await batch.commit();
  }

  // Delete the folder
  const docRef = doc(getFoldersCollection(condoId), folderId);
  await deleteDoc(docRef);
}

/**
 * Get inherited access level for a new folder
 */
export async function getInheritedAccessLevel(
  condoId: string,
  parentId: string | null
): Promise<AccessLevel> {
  if (!parentId) {
    return 'all'; // Default for root
  }

  const parent = await getFolder(condoId, parentId);
  return parent?.accessLevel || 'all';
}

/**
 * Get all folders for a condo
 */
export async function getAllFolders(condoId: string): Promise<Folder[]> {
  const q = query(
    getFoldersCollection(condoId),
    orderBy('name', 'asc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Folder[];
}
