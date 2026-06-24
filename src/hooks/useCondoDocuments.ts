'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCondo } from '@/lib/hooks/useCondo';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  subscribeToDocuments,
  uploadDocument,
  updateDocument,
  updateDocumentAccessLevel,
  moveDocument,
  deleteDocument,
  getUsedStorage,
  canUpload,
} from '@/lib/firebase/services/document';
import type { Document, AccessLevel } from '@/types/document';

const STORAGE_QUOTA = 500 * 1024 * 1024; // 500 MB

export interface UploadMetadata {
  name: string;
  folderId?: string | null;
  accessLevel?: AccessLevel;
}

export interface UseCondoDocumentsOptions {
  folderId?: string | null;
  accessLevelFilter?: AccessLevel[];
  /** Override the active condo (e.g. from a URL-scoped route). Falls back to the selected condo. */
  condoId?: string;
}

export interface UseCondoDocumentsResult {
  documents: Document[];
  loading: boolean;
  error: Error | null;
  usedStorage: number;
  remainingStorage: number;
  quotaPercentage: number;
  refresh: () => void;
  upload: (file: File, metadata: UploadMetadata) => Promise<Document>;
  updateAccessLevel: (documentId: string, accessLevel: AccessLevel) => Promise<void>;
  move: (documentId: string, targetFolderId: string | null) => Promise<void>;
  rename: (documentId: string, name: string) => Promise<void>;
  remove: (documentId: string, url: string) => Promise<void>;
  canUploadFile: (fileSize: number) => Promise<boolean>;
}

/**
 * Hook to manage documents for a condo (syndic side)
 */
export function useCondoDocuments(options?: UseCondoDocumentsOptions): UseCondoDocumentsResult {
  const { selectedCondo } = useCondo();
  const { user } = useAuth();
  const condoId = options?.condoId ?? selectedCondo?.id;

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [usedStorage, setUsedStorage] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Subscribe to documents
  useEffect(() => {
    if (!condoId) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToDocuments(condoId, (docs) => {
      setDocuments(docs);
      setLoading(false);
    }, {
      folderId: options?.folderId,
      accessLevelFilter: options?.accessLevelFilter,
    });

    return () => unsubscribe();
  }, [condoId, refreshTrigger, options?.folderId, options?.accessLevelFilter]);

  // Calculate used storage
  useEffect(() => {
    if (!condoId) {
      setUsedStorage(0);
      return;
    }

    getUsedStorage(condoId)
      .then(setUsedStorage)
      .catch((err) => {
        console.error('Error calculating storage:', err);
      });
  }, [condoId, documents.length]);

  // Derived calculations
  const remainingStorage = STORAGE_QUOTA - usedStorage;
  const quotaPercentage = (usedStorage / STORAGE_QUOTA) * 100;

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const upload = useCallback(
    async (file: File, metadata: UploadMetadata): Promise<Document> => {
      if (!condoId || !user?.uid) {
        throw new Error('Not authenticated or no condo selected');
      }

      return uploadDocument(condoId, file, metadata, user.uid);
    },
    [condoId, user?.uid]
  );

  const updateAccessLevelFn = useCallback(
    async (documentId: string, accessLevel: AccessLevel): Promise<void> => {
      if (!condoId) {
        throw new Error('No condo selected');
      }

      await updateDocumentAccessLevel(condoId, documentId, accessLevel);
    },
    [condoId]
  );

  const move = useCallback(
    async (documentId: string, targetFolderId: string | null): Promise<void> => {
      if (!condoId) {
        throw new Error('No condo selected');
      }

      await moveDocument(condoId, documentId, targetFolderId);
    },
    [condoId]
  );

  const rename = useCallback(
    async (documentId: string, name: string): Promise<void> => {
      if (!condoId) {
        throw new Error('No condo selected');
      }

      await updateDocument(condoId, documentId, { name });
    },
    [condoId]
  );

  const remove = useCallback(
    async (documentId: string, url: string): Promise<void> => {
      if (!condoId) {
        throw new Error('No condo selected');
      }

      await deleteDocument(condoId, documentId, url);
    },
    [condoId]
  );

  const canUploadFile = useCallback(
    async (fileSize: number): Promise<boolean> => {
      if (!condoId) {
        return false;
      }

      const result = await canUpload(condoId, fileSize);
      return result.canUpload;
    },
    [condoId]
  );

  return {
    documents,
    loading,
    error,
    usedStorage,
    remainingStorage,
    quotaPercentage,
    refresh,
    upload,
    updateAccessLevel: updateAccessLevelFn,
    move,
    rename,
    remove,
    canUploadFile,
  };
}
