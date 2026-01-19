'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCopropriete } from '@/lib/hooks/useCopropriete';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  subscribeToDocuments,
  uploadDocument,
  updateDocumentVisibility,
  updateDocumentMetadata,
  deleteDocument,
  getDocumentDownloadUrl,
  getUsedStorage,
  canUpload,
} from '@/lib/firebase/services/document-partage';
import type { DocumentPartage, CategorieDocument } from '@/types/document-partage';
import { QUOTA_STOCKAGE_COPRO } from '@/lib/schemas/document-partage';

// Test mode configuration
const IS_TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === 'true';

// Mock documents for test mode
const TEST_DOCUMENTS: DocumentPartage[] = [
  {
    id: 'test-doc-1',
    nom: 'Règlement de copropriété',
    type: 'application/pdf',
    taille: 1024 * 500, // 500 Ko
    storagePath: 'coproprietes/test-copro-123/documents/reglement.pdf',
    categorie: 'reglement',
    visibleExtranet: true,
    datePartage: { seconds: Math.floor(Date.now() / 1000) - 86400, nanoseconds: 0 },
    consultePar: [],
    uploadedBy: 'test-user-123',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 30, nanoseconds: 0 },
    updatedAt: { seconds: Math.floor(Date.now() / 1000) - 86400, nanoseconds: 0 },
  },
  {
    id: 'test-doc-2',
    nom: 'PV AG 2024',
    type: 'application/pdf',
    taille: 1024 * 250, // 250 Ko
    storagePath: 'coproprietes/test-copro-123/documents/pv-ag-2024.pdf',
    categorie: 'ag',
    visibleExtranet: true,
    datePartage: { seconds: Math.floor(Date.now() / 1000) - 86400 * 7, nanoseconds: 0 },
    consultePar: ['test-cp-1'],
    uploadedBy: 'test-user-123',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 7, nanoseconds: 0 },
    updatedAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 7, nanoseconds: 0 },
  },
  {
    id: 'test-doc-3',
    nom: 'Contrat ascenseur',
    type: 'application/pdf',
    taille: 1024 * 150, // 150 Ko
    storagePath: 'coproprietes/test-copro-123/documents/contrat-ascenseur.pdf',
    categorie: 'contrats',
    visibleExtranet: false,
    datePartage: null,
    consultePar: [],
    uploadedBy: 'test-user-123',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 60, nanoseconds: 0 },
    updatedAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 60, nanoseconds: 0 },
  },
];

export interface UseDocumentsResult {
  documents: DocumentPartage[];
  loading: boolean;
  error: Error | null;
  usedStorage: number;
  remainingStorage: number;
  quotaPercentage: number;
  categoryCounts: Record<CategorieDocument, number>;
  refresh: () => void;
  upload: (
    file: File,
    metadata: { nom: string; categorie: CategorieDocument; visibleExtranet: boolean }
  ) => Promise<DocumentPartage>;
  toggleVisibility: (documentId: string, visible: boolean) => Promise<void>;
  updateMetadata: (
    documentId: string,
    metadata: { nom?: string; categorie?: CategorieDocument }
  ) => Promise<void>;
  remove: (documentId: string, storagePath: string) => Promise<void>;
  getDownloadUrl: (storagePath: string) => Promise<string>;
  canUploadFile: (fileSize: number) => Promise<boolean>;
}

/**
 * Hook pour gérer les documents partagés d'une copropriété (côté syndic)
 */
export function useDocuments(): UseDocumentsResult {
  const { selectedCopro } = useCopropriete();
  const { user } = useAuth();
  const coproprieteId = selectedCopro?.id;

  const [documents, setDocuments] = useState<DocumentPartage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [usedStorage, setUsedStorage] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Subscribe aux documents
  useEffect(() => {
    if (!coproprieteId) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    // In test mode, use mock data
    if (IS_TEST_MODE) {
      setDocuments(TEST_DOCUMENTS);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToDocuments(coproprieteId, (docs) => {
      setDocuments(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [coproprieteId, refreshTrigger]);

  // Calcul de l'espace utilisé
  useEffect(() => {
    if (!coproprieteId) {
      setUsedStorage(0);
      return;
    }

    // In test mode, calculate from mock data
    if (IS_TEST_MODE) {
      const totalSize = TEST_DOCUMENTS.reduce((sum, doc) => sum + doc.taille, 0);
      setUsedStorage(totalSize);
      return;
    }

    getUsedStorage(coproprieteId)
      .then(setUsedStorage)
      .catch((err) => {
        console.error('Erreur lors du calcul du stockage:', err);
      });
  }, [coproprieteId, documents.length]);

  // Calculs dérivés
  const remainingStorage = QUOTA_STOCKAGE_COPRO - usedStorage;
  const quotaPercentage = (usedStorage / QUOTA_STOCKAGE_COPRO) * 100;

  // Comptage par catégorie
  const categoryCounts = useMemo(() => {
    const counts: Record<CategorieDocument, number> = {
      ag: 0,
      contrats: 0,
      reglement: 0,
      travaux: 0,
      autres: 0,
    };

    documents.forEach((doc) => {
      if (counts[doc.categorie] !== undefined) {
        counts[doc.categorie]++;
      }
    });

    return counts;
  }, [documents]);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const upload = useCallback(
    async (
      file: File,
      metadata: { nom: string; categorie: CategorieDocument; visibleExtranet: boolean }
    ): Promise<DocumentPartage> => {
      if (!coproprieteId || !user?.uid) {
        throw new Error('Non authentifié ou copropriété non sélectionnée');
      }

      return uploadDocument(coproprieteId, file, metadata, user.uid);
    },
    [coproprieteId, user?.uid]
  );

  const toggleVisibility = useCallback(
    async (documentId: string, visible: boolean): Promise<void> => {
      if (!coproprieteId) {
        throw new Error('Copropriété non sélectionnée');
      }

      await updateDocumentVisibility(coproprieteId, documentId, visible);
    },
    [coproprieteId]
  );

  const updateMetadataFn = useCallback(
    async (
      documentId: string,
      metadata: { nom?: string; categorie?: CategorieDocument }
    ): Promise<void> => {
      if (!coproprieteId) {
        throw new Error('Copropriété non sélectionnée');
      }

      await updateDocumentMetadata(coproprieteId, documentId, metadata);
    },
    [coproprieteId]
  );

  const remove = useCallback(
    async (documentId: string, storagePath: string): Promise<void> => {
      if (!coproprieteId) {
        throw new Error('Copropriété non sélectionnée');
      }

      await deleteDocument(coproprieteId, documentId, storagePath);
    },
    [coproprieteId]
  );

  const getDownloadUrl = useCallback(
    async (storagePath: string): Promise<string> => {
      return getDocumentDownloadUrl(storagePath);
    },
    []
  );

  const canUploadFile = useCallback(
    async (fileSize: number): Promise<boolean> => {
      if (!coproprieteId) {
        return false;
      }

      const result = await canUpload(coproprieteId, fileSize);
      return result.canUpload;
    },
    [coproprieteId]
  );

  return {
    documents,
    loading,
    error,
    usedStorage,
    remainingStorage,
    quotaPercentage,
    categoryCounts,
    refresh,
    upload,
    toggleVisibility,
    updateMetadata: updateMetadataFn,
    remove,
    getDownloadUrl,
    canUploadFile,
  };
}
