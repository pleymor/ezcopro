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
import type { DocumentPartage, CategorieDocument, NiveauAcces } from '@/types/document-partage';
import { QUOTA_STOCKAGE_COPRO, MAX_FILE_SIZE, mimeTypeAutoriseSchema } from '@/lib/schemas/document-partage';

/**
 * Récupère la collection de documents pour une copropriété
 * Utilise le nouveau schéma condos/{id}/documents
 */
function getDocumentsCollection(coproprieteId: string) {
  return collection(db, 'condos', coproprieteId, 'documents');
}

/**
 * Subscribe to documents updates for a copropriété
 */
export function subscribeToDocuments(
  coproprieteId: string,
  callback: (documents: DocumentPartage[]) => void,
  options?: {
    visibleExtranetOnly?: boolean;
    categorie?: CategorieDocument;
    dossierId?: string | null;
    niveauAccesFilter?: NiveauAcces[];
  }
): () => void {
  let q: Query<DocumentData> = query(
    getDocumentsCollection(coproprieteId),
    orderBy('createdAt', 'desc')
  );

  // Filter by dossierId if specified (including null for root)
  if (options?.dossierId !== undefined) {
    q = query(
      getDocumentsCollection(coproprieteId),
      where('dossierId', '==', options.dossierId),
      orderBy('createdAt', 'desc')
    );
  }

  if (options?.visibleExtranetOnly) {
    q = query(
      getDocumentsCollection(coproprieteId),
      where('visibleExtranet', '==', true),
      orderBy('createdAt', 'desc')
    );
  }

  if (options?.categorie) {
    q = query(
      getDocumentsCollection(coproprieteId),
      where('categorie', '==', options.categorie),
      orderBy('createdAt', 'desc')
    );
  }

  return onSnapshot(
    q,
    (snapshot) => {
      let documents = snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      })) as DocumentPartage[];

      // Filter by niveauAcces if specified (client-side filter)
      if (options?.niveauAccesFilter && options.niveauAccesFilter.length > 0) {
        documents = documents.filter((doc) =>
          options.niveauAccesFilter!.includes(doc.niveauAcces || 'syndic')
        );
      }

      callback(documents);
    },
    (error) => {
      console.error('Error subscribing to documents:', error);
    }
  );
}

/**
 * Calcule l'espace utilisé par la copropriété
 */
export async function getUsedStorage(coproprieteId: string): Promise<number> {
  const q = query(getDocumentsCollection(coproprieteId));
  const snapshot = await getDocs(q);

  return snapshot.docs.reduce((total, doc) => {
    const data = doc.data();
    return total + (data.taille || 0);
  }, 0);
}

/**
 * Vérifie si l'upload est possible (quota non dépassé)
 */
export async function canUpload(
  coproprieteId: string,
  fileSize: number
): Promise<{ canUpload: boolean; usedSpace: number; remainingSpace: number }> {
  const usedSpace = await getUsedStorage(coproprieteId);
  const remainingSpace = QUOTA_STOCKAGE_COPRO - usedSpace;

  return {
    canUpload: fileSize <= remainingSpace,
    usedSpace,
    remainingSpace,
  };
}

/**
 * Valide le type MIME du fichier
 */
export function isValidMimeType(mimeType: string): boolean {
  const result = mimeTypeAutoriseSchema.safeParse(mimeType);
  return result.success;
}

/**
 * Valide la taille du fichier
 */
export function isValidFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

/**
 * Upload un document pour une copropriété
 */
export async function uploadDocument(
  coproprieteId: string,
  file: File,
  metadata: {
    nom: string;
    categorie: CategorieDocument;
    visibleExtranet: boolean;
    dossierId?: string | null;
    niveauAcces?: NiveauAcces;
  },
  uploadedBy: string
): Promise<DocumentPartage> {
  // Validations
  if (!isValidMimeType(file.type)) {
    throw new Error(`Type de fichier non autorisé: ${file.type}`);
  }

  if (!isValidFileSize(file.size)) {
    throw new Error(`Fichier trop volumineux (max ${MAX_FILE_SIZE / (1024 * 1024)} Mo)`);
  }

  // Vérification du quota
  const quotaCheck = await canUpload(coproprieteId, file.size);
  if (!quotaCheck.canUpload) {
    throw new Error(
      `Quota dépassé. Espace restant: ${(quotaCheck.remainingSpace / (1024 * 1024)).toFixed(2)} Mo`
    );
  }

  // Génération du chemin de stockage unique
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `coproprietes/${coproprieteId}/documents/${timestamp}_${sanitizedName}`;

  // Upload vers Firebase Storage
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file);

  // Déterminer le niveau d'accès
  // Si visibleExtranet est true et pas de niveauAcces spécifié, utiliser 'tous' pour compatibilité
  const niveauAcces = metadata.niveauAcces ||
    (metadata.visibleExtranet ? 'tous' : 'syndic');

  // Création du document Firestore
  const now = Timestamp.now();
  const documentData = {
    nom: metadata.nom,
    type: file.type,
    taille: file.size,
    storagePath,
    categorie: metadata.categorie,
    visibleExtranet: metadata.visibleExtranet,
    dossierId: metadata.dossierId ?? null,
    niveauAcces,
    datePartage: metadata.visibleExtranet || niveauAcces !== 'syndic' ? now : null,
    consultePar: [],
    uploadedBy,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(getDocumentsCollection(coproprieteId), documentData);

  return {
    id: docRef.id,
    ...documentData,
  } as DocumentPartage;
}

/**
 * Met à jour la visibilité d'un document sur l'extranet
 */
export async function updateDocumentVisibility(
  coproprieteId: string,
  documentId: string,
  visibleExtranet: boolean
): Promise<void> {
  const docRef = doc(getDocumentsCollection(coproprieteId), documentId);

  const updateData: Record<string, unknown> = {
    visibleExtranet,
    updatedAt: Timestamp.now(),
  };

  // Si on rend visible, on met à jour la date de partage
  if (visibleExtranet) {
    updateData.datePartage = Timestamp.now();
  }

  await updateDoc(docRef, updateData);
}

/**
 * Met à jour les métadonnées d'un document
 */
export async function updateDocumentMetadata(
  coproprieteId: string,
  documentId: string,
  metadata: {
    nom?: string;
    categorie?: CategorieDocument;
  }
): Promise<void> {
  const docRef = doc(getDocumentsCollection(coproprieteId), documentId);

  await updateDoc(docRef, {
    ...metadata,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Supprime un document
 */
export async function deleteDocument(
  coproprieteId: string,
  documentId: string,
  storagePath: string
): Promise<void> {
  // Supprimer du Storage
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.warn('Erreur lors de la suppression du fichier Storage:', error);
  }

  // Supprimer de Firestore
  const docRef = doc(getDocumentsCollection(coproprieteId), documentId);
  await deleteDoc(docRef);
}

/**
 * Récupère l'URL de téléchargement d'un document
 */
export async function getDocumentDownloadUrl(storagePath: string): Promise<string> {
  const storageRef = ref(storage, storagePath);
  return getDownloadURL(storageRef);
}

/**
 * Marque un document comme consulté par un copropriétaire
 */
export async function markDocumentAsViewed(
  coproprieteId: string,
  documentId: string,
  coproprietaireId: string
): Promise<void> {
  const docRef = doc(getDocumentsCollection(coproprieteId), documentId);

  // On utilise arrayUnion pour ajouter le copropriétaire sans doublon
  const { arrayUnion } = await import('firebase/firestore');

  await updateDoc(docRef, {
    consultePar: arrayUnion(coproprietaireId),
    updatedAt: Timestamp.now(),
  });
}
