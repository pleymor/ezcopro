'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useExtranetCondo } from './useExtranetCondo';
import { useCondo } from '@/lib/hooks/useCondo';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  subscribeToDocuments,
  getDocumentDownloadUrl,
  markDocumentAsViewed,
} from '@/lib/firebase/services/document-partage';
import type { DocumentPartage, CategorieDocument } from '@/types/document-partage';
import type { NiveauAcces } from '@/types/dossier';
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
 * Détermine les niveaux d'accès autorisés pour un utilisateur
 *
 * ## Règles d'accès aux documents
 *
 * | Niveau d'accès document | Syndic | Conseil Syndical | Copropriétaire |
 * |-------------------------|--------|------------------|----------------|
 * | `syndic`                | ✅     | ❌               | ❌             |
 * | `conseil`               | ✅     | ✅               | ❌             |
 * | `tous`                  | ✅     | ✅               | ✅             |
 *
 * ## Cas limites gérés
 *
 * 1. **Document sans niveau d'accès** : Traité comme `tous` (accès public)
 * 2. **Utilisateur non authentifié** : Aucun document visible
 * 3. **Membre du conseil révoqué** : Perd immédiatement l'accès aux documents `conseil`
 * 4. **Nouveau membre du conseil** : Accès immédiat aux documents `conseil` existants
 * 5. **Syndic sur extranet** : A accès à tous les documents (fallback sécuritaire)
 *
 * @param isSyndic - L'utilisateur a-t-il le rôle syndic ?
 * @param isConseilMember - L'utilisateur est-il membre du conseil syndical ?
 * @returns Liste des niveaux d'accès autorisés
 */
function getAllowedAccessLevels(
  isSyndic: boolean,
  isConseilMember: boolean
): NiveauAcces[] {
  // Cas 1: Le syndic peut tout voir (accès administrateur)
  if (isSyndic) {
    return ['syndic', 'conseil', 'tous'];
  }

  // Cas 2: Les membres du conseil ont un accès élargi
  if (isConseilMember) {
    return ['conseil', 'tous'];
  }

  // Cas 3: Les copropriétaires lambda n'ont accès qu'aux documents publics
  return ['tous'];
}

/**
 * Hook pour accéder aux documents partagés côté copropriétaire (extranet)
 *
 * ## Fonctionnalités
 *
 * - Charge les documents visibles sur l'extranet
 * - Filtre automatiquement selon le niveau d'accès de l'utilisateur
 * - Marque les documents non consultés comme "nouveaux"
 * - Permet de filtrer par catégorie
 *
 * ## Gestion des accès
 *
 * Le hook détermine automatiquement les documents visibles en fonction de:
 * 1. Le rôle de l'utilisateur (syndic vs copropriétaire)
 * 2. L'appartenance au conseil syndical
 * 3. Le niveau d'accès (`niveauAcces`) de chaque document
 *
 * ## Cas limites
 *
 * - **Documents sans niveauAcces**: Traités comme `tous` (public par défaut)
 * - **Chargement du conseil**: Attend la liste des membres avant d'afficher
 * - **Mode test**: Utilise les données mock avec filtrage simulé
 *
 * @example
 * ```tsx
 * const { documents, loading, isConseilMember } = useExtranetDocuments();
 *
 * // Un copropriétaire verra uniquement les documents avec niveauAcces = 'tous'
 * // Un membre du conseil verra 'conseil' et 'tous'
 * // Le syndic verra tous les documents
 * ```
 */
export function useExtranetDocuments(): UseExtranetDocumentsResult {
  const { user } = useAuth();
  const { selectedCondo, loading: condoLoading } = useExtranetCondo();
  const { condos: adminCondos } = useCondo();
  const [allDocuments, setAllDocuments] = useState<DocumentPartage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedCategorie, setSelectedCategorie] = useState<CategorieDocument | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Extraire les IDs de la copropriété sélectionnée
  const coproprieteId = selectedCondo?.coproprieteId ?? null;
  const coproprietaireId = selectedCondo?.coproprietaireId ?? null;

  // Vérifier si l'utilisateur est syndic de cette copropriété (propriétaire ou membre du conseil d'admin)
  const isSyndic = useMemo(() => {
    if (!user || !coproprieteId) return false;
    const adminCondo = adminCondos.find((c) => c.id === coproprieteId);
    if (!adminCondo) return false;
    return adminCondo.ownerId === user.uid || adminCondo.boardMemberIds.includes(user.uid);
  }, [user, coproprieteId, adminCondos]);

  // Vérifier si l'utilisateur est membre du conseil syndical (from ExtranetCondoInfo)
  const isConseilMember = selectedCondo?.isBoardMember ?? false;

  // Niveaux d'accès autorisés pour cet utilisateur
  const allowedAccessLevels = useMemo(() => {
    return getAllowedAccessLevels(isSyndic, isConseilMember);
  }, [isSyndic, isConseilMember]);

  // Charger les documents visibles sur l'extranet
  useEffect(() => {
    if (condoLoading) return;

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
  }, [coproprieteId, condoLoading, refreshTrigger]);

  // Ajouter l'indicateur "nouveau" aux documents et filtrer par niveau d'accès
  const documents = useMemo((): DocumentExtranet[] => {
    return allDocuments
      // Filtrer par niveau d'accès autorisé
      .filter((doc) => {
        const docAccessLevel = doc.niveauAcces || 'tous';
        return allowedAccessLevels.includes(docAccessLevel);
      })
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
  }, [allDocuments, coproprietaireId, allowedAccessLevels]);

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
    loading: loading || condoLoading,
    error,
    selectedCategorie,
    setSelectedCategorie,
    categoryCounts,
    newDocumentsCount,
    refresh,
    downloadDocument,
  };
}
