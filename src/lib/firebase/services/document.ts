'use client';

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  Timestamp,
  arrayUnion,
  type Query,
  type DocumentData,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from '../config';
import type { Document, AccessLevel, UpdateDocumentInput } from '@/types/document';

const STORAGE_QUOTA = 500 * 1024 * 1024; // 500 MB per condo
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB per file

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

/**
 * Get the documents collection for a condo
 */
function getDocumentsCollection(condoId: string) {
  return collection(db, 'condos', condoId, 'documents');
}

/**
 * Subscribe to documents updates for a condo
 */
export function subscribeToDocuments(
  condoId: string,
  callback: (documents: Document[]) => void,
  options?: {
    folderId?: string | null;
    accessLevelFilter?: AccessLevel[];
  }
): () => void {
  let q: Query<DocumentData>;

  if (options?.folderId !== undefined) {
    q = query(
      getDocumentsCollection(condoId),
      where('folderId', '==', options.folderId),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(
      getDocumentsCollection(condoId),
      orderBy('createdAt', 'desc')
    );
  }

  return onSnapshot(q, (snapshot) => {
    let documents = snapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data(),
    })) as Document[];

    // Filter by accessLevel if specified (client-side filter)
    if (options?.accessLevelFilter && options.accessLevelFilter.length > 0) {
      documents = documents.filter((doc) =>
        options.accessLevelFilter!.includes(doc.accessLevel)
      );
    }

    callback(documents);
  });
}

/**
 * Calculate used storage for a condo
 */
export async function getUsedStorage(condoId: string): Promise<number> {
  const q = query(getDocumentsCollection(condoId));
  const snapshot = await getDocs(q);

  return snapshot.docs.reduce((total, doc) => {
    const data = doc.data();
    return total + (data.size || 0);
  }, 0);
}

/**
 * Check if upload is possible (quota not exceeded)
 */
export async function canUpload(
  condoId: string,
  fileSize: number
): Promise<{ canUpload: boolean; usedSpace: number; remainingSpace: number }> {
  const usedSpace = await getUsedStorage(condoId);
  const remainingSpace = STORAGE_QUOTA - usedSpace;

  return {
    canUpload: fileSize <= remainingSpace,
    usedSpace,
    remainingSpace,
  };
}

/**
 * Validate file MIME type
 */
export function isValidMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

/**
 * Upload a document for a condo
 */
export async function uploadDocument(
  condoId: string,
  file: File,
  metadata: {
    name: string;
    folderId?: string | null;
    accessLevel?: AccessLevel;
  },
  uploadedBy: string
): Promise<Document> {
  // Validations
  if (!isValidMimeType(file.type)) {
    throw new Error(`File type not allowed: ${file.type}`);
  }

  if (!isValidFileSize(file.size)) {
    throw new Error(`File too large (max ${MAX_FILE_SIZE / (1024 * 1024)} MB)`);
  }

  // Quota check
  const quotaCheck = await canUpload(condoId, file.size);
  if (!quotaCheck.canUpload) {
    throw new Error(
      `Quota exceeded. Remaining space: ${(quotaCheck.remainingSpace / (1024 * 1024)).toFixed(2)} MB`
    );
  }

  // Generate unique storage path
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `condos/${condoId}/documents/${timestamp}_${sanitizedName}`;

  // Upload to Firebase Storage
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file);

  // Get download URL
  const url = await getDownloadURL(storageRef);

  // Create Firestore document
  const now = Timestamp.now();
  const documentData = {
    name: metadata.name,
    type: file.type,
    url,
    size: file.size,
    folderId: metadata.folderId ?? null,
    accessLevel: metadata.accessLevel ?? 'all',
    uploadedBy,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(getDocumentsCollection(condoId), documentData);

  return {
    id: docRef.id,
    ...documentData,
  } as Document;
}

/**
 * Update document metadata
 */
export async function updateDocument(
  condoId: string,
  documentId: string,
  input: UpdateDocumentInput
): Promise<void> {
  const docRef = doc(getDocumentsCollection(condoId), documentId);

  await updateDoc(docRef, {
    ...input,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Update document access level
 */
export async function updateDocumentAccessLevel(
  condoId: string,
  documentId: string,
  accessLevel: AccessLevel
): Promise<void> {
  const docRef = doc(getDocumentsCollection(condoId), documentId);

  await updateDoc(docRef, {
    accessLevel,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Move document to another folder
 */
export async function moveDocument(
  condoId: string,
  documentId: string,
  targetFolderId: string | null
): Promise<void> {
  const docRef = doc(getDocumentsCollection(condoId), documentId);

  await updateDoc(docRef, {
    folderId: targetFolderId,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete a document
 */
export async function deleteDocument(
  condoId: string,
  documentId: string,
  url: string
): Promise<void> {
  // Delete from Storage
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.warn('Error deleting file from Storage:', error);
  }

  // Delete from Firestore
  const docRef = doc(getDocumentsCollection(condoId), documentId);
  await deleteDoc(docRef);
}

/**
 * Mark document as viewed by an owner
 */
export async function markDocumentAsViewed(
  condoId: string,
  documentId: string,
  ownerId: string
): Promise<void> {
  const docRef = doc(getDocumentsCollection(condoId), documentId);

  await updateDoc(docRef, {
    viewedBy: arrayUnion(ownerId),
    updatedAt: Timestamp.now(),
  });
}

/**
 * Get documents for a specific folder
 */
export async function getDocumentsInFolder(
  condoId: string,
  folderId: string | null
): Promise<Document[]> {
  const q = query(
    getDocumentsCollection(condoId),
    where('folderId', '==', folderId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Document[];
}
