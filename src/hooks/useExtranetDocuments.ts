'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUserRole } from './useUserRole';
import {
  subscribeToDocuments,
  getDocumentDownloadUrl,
  markDocumentAsViewed,
} from '@/lib/firebase/services/document-partage';
import type { DocumentPartage, CategorieDocument } from '@/types/document-partage';
import { IS_TEST_MODE } from '@/lib/test/mock-data';
import { getDocumentsForExtranet } from '@/lib/test/mock-data-extranet';

export interface DocumentExtranet extends DocumentPartage {
  isNew: boolean;
}

export interface UseExtranetDocumentsResult {
  documents: DocumentExtranet[];
  filteredDocuments: DocumentExtranet[];
  loading: boolean;
  error: Error | null;
  selectedCategorie: CategorieDocument | null;
  setSelectedCategorie: (categorie: CategorieDocument | null) => void;
  categoryCounts: Record<CategorieDocument, number>;
  newDocumentsCount: number;
  refresh: () => void;
  downloadDocument: (document: DocumentExtranet) => Promise<string>;
}

/**
 * Hook pour accéder aux documents partagés côté copropriétaire
 */
export function useExtranetDocuments(): UseExtranetDocumentsResult {
  const { coproprieteId, coproprietaireId, loading: roleLoading } = useUserRole();
  const [allDocuments, setAllDocuments] = useState<DocumentPartage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedCategorie, setSelectedCategorie] = useState<CategorieDocument | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Charger les documents visibles sur l'extranet
  useEffect(() => {
    if (roleLoading) return;

    if (!coproprieteId) {
      setAllDocuments([]);
      setLoading(false);
      return;
    }

    // En mode test, utiliser les données mock
    if (IS_TEST_MODE) {
      const mockDocuments = getDocumentsForExtranet();
      setAllDocuments(mockDocuments);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToDocuments(
      coproprieteId,
      (documents) => {
        setAllDocuments(documents);
        setLoading(false);
      },
      { visibleExtranetOnly: true }
    );

    return () => unsubscribe();
  }, [coproprieteId, roleLoading, refreshTrigger]);

  // Ajouter l'indicateur "nouveau" aux documents
  const documents = useMemo((): DocumentExtranet[] => {
    return allDocuments
      .map((doc) => ({
        ...doc,
        // Un document est "nouveau" si le copropriétaire ne l'a pas encore consulté
        isNew: coproprietaireId ? !doc.consultePar.includes(coproprietaireId) : false,
      }))
      .sort((a, b) => {
        // Trier par date de partage décroissante
        const dateA = a.datePartage?.seconds || 0;
        const dateB = b.datePartage?.seconds || 0;
        return dateB - dateA;
      });
  }, [allDocuments, coproprietaireId]);

  // Filtrer par catégorie
  const filteredDocuments = useMemo((): DocumentExtranet[] => {
    if (!selectedCategorie) {
      return documents;
    }
    return documents.filter((doc) => doc.categorie === selectedCategorie);
  }, [documents, selectedCategorie]);

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

  // Nombre de nouveaux documents
  const newDocumentsCount = useMemo(() => {
    return documents.filter((doc) => doc.isNew).length;
  }, [documents]);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Télécharger et marquer comme consulté
  const downloadDocument = useCallback(
    async (document: DocumentExtranet): Promise<string> => {
      if (!coproprieteId || !coproprietaireId) {
        throw new Error('Non authentifié');
      }

      // Marquer comme consulté si c'est nouveau
      if (document.isNew) {
        try {
          await markDocumentAsViewed(coproprieteId, document.id, coproprietaireId);
        } catch (err) {
          console.warn('Erreur lors du marquage comme consulté:', err);
        }
      }

      // Récupérer l'URL de téléchargement
      return getDocumentDownloadUrl(document.storagePath);
    },
    [coproprieteId, coproprietaireId]
  );

  return {
    documents,
    filteredDocuments,
    loading: loading || roleLoading,
    error,
    selectedCategorie,
    setSelectedCategorie,
    categoryCounts,
    newDocumentsCount,
    refresh,
    downloadDocument,
  };
}
