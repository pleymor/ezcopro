'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCopropriete } from '@/lib/hooks/useCopropriete';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  subscribeToDossiers,
  createDossier,
  updateDossier,
  deleteDossier,
  isDossierEmpty,
  moveDocument,
  getInheritedNiveauAcces,
} from '@/lib/firebase/services/dossier';
import type {
  Dossier,
  CreateDossierInput,
  UpdateDossierInput,
  NiveauAcces,
} from '@/types/dossier';

// Test mode configuration
const IS_TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === 'true';

// Mock folders for test mode
const TEST_FOLDERS: Dossier[] = [
  {
    id: 'test-folder-1',
    nom: 'Contrats',
    parentId: null,
    path: '/Contrats',
    depth: 0,
    niveauAcces: 'tous',
    coproprieteId: 'test-copro-123',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 30, nanoseconds: 0 },
    updatedAt: { seconds: Math.floor(Date.now() / 1000) - 86400, nanoseconds: 0 },
    createdBy: 'test-user-123',
  },
  {
    id: 'test-folder-2',
    nom: 'AG',
    parentId: null,
    path: '/AG',
    depth: 0,
    niveauAcces: 'tous',
    coproprieteId: 'test-copro-123',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 20, nanoseconds: 0 },
    updatedAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 5, nanoseconds: 0 },
    createdBy: 'test-user-123',
  },
  {
    id: 'test-folder-3',
    nom: 'Privé Syndic',
    parentId: null,
    path: '/Privé Syndic',
    depth: 0,
    niveauAcces: 'syndic',
    coproprieteId: 'test-copro-123',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 10, nanoseconds: 0 },
    updatedAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 2, nanoseconds: 0 },
    createdBy: 'test-user-123',
  },
  {
    id: 'test-folder-4',
    nom: 'Documents Conseil',
    parentId: null,
    path: '/Documents Conseil',
    depth: 0,
    niveauAcces: 'conseil',
    coproprieteId: 'test-copro-123',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 5, nanoseconds: 0 },
    updatedAt: { seconds: Math.floor(Date.now() / 1000) - 86400, nanoseconds: 0 },
    createdBy: 'test-user-123',
  },
];

export interface UseFoldersResult {
  folders: Dossier[];
  loading: boolean;
  error: Error | null;
  createFolder: (input: CreateDossierInput) => Promise<Dossier>;
  updateFolder: (folderId: string, input: UpdateDossierInput) => Promise<void>;
  deleteFolder: (folderId: string, force?: boolean) => Promise<void>;
  isFolderEmpty: (folderId: string) => Promise<boolean>;
  moveDocumentToFolder: (documentId: string, targetFolderId: string | null) => Promise<void>;
  /** Sync version - computes from local folders data */
  getDefaultNiveauAcces: (parentId: string | null) => NiveauAcces;
  /** Async version - fetches from server */
  getDefaultNiveauAccesAsync: (parentId: string | null) => Promise<NiveauAcces>;
  refresh: () => void;
}

export interface UseFoldersOptions {
  /**
   * Filtre les dossiers par niveau d'accès autorisé.
   *
   * @example
   * // Pour un copropriétaire standard (accès uniquement aux dossiers publics)
   * useFolders(null, { niveauAccesFilter: ['tous'] })
   *
   * // Pour un membre du conseil syndical
   * useFolders(null, { niveauAccesFilter: ['conseil', 'tous'] })
   *
   * // Pour le syndic (pas de filtre = accès complet)
   * useFolders(null)
   */
  niveauAccesFilter?: NiveauAcces[];
}

/**
 * Hook pour gérer les dossiers d'une copropriété
 *
 * ## Gestion des accès
 *
 * Ce hook supporte le filtrage par niveau d'accès via l'option `niveauAccesFilter`.
 * Les niveaux sont hiérarchiques :
 * - `syndic` : Visible uniquement par le syndic
 * - `conseil` : Visible par le syndic et les membres du conseil
 * - `tous` : Visible par tous les copropriétaires
 *
 * ## Héritage des droits
 *
 * Lors de la création d'un sous-dossier, le niveau d'accès est hérité du parent :
 * - `getDefaultNiveauAcces(parentId)` : Version synchrone (utilise les données locales)
 * - `getDefaultNiveauAccesAsync(parentId)` : Version asynchrone (requête serveur)
 *
 * ## Cas limites
 *
 * - **Dossier racine** : Niveau par défaut = `syndic` (le plus restrictif)
 * - **Parent non trouvé** : Fallback vers `syndic`
 * - **Suppression de dossier non vide** : Utiliser `deleteFolder(id, true)` pour forcer
 *
 * @param parentId - ID du dossier parent (null = racine)
 * @param options - Options de filtrage
 *
 * @see specs/010-ged-dossiers/ACCESS-CONTROL.md pour la documentation complète
 */
export function useFolders(
  parentId: string | null = null,
  options?: UseFoldersOptions
): UseFoldersResult {
  const { selectedCopro } = useCopropriete();
  const { user } = useAuth();
  const coproprieteId = selectedCopro?.id;

  const [folders, setFolders] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Subscribe aux dossiers
  useEffect(() => {
    if (!coproprieteId) {
      setFolders([]);
      setLoading(false);
      return;
    }

    // In test mode, use mock data
    if (IS_TEST_MODE) {
      let testFolders = TEST_FOLDERS.filter((f) => f.parentId === parentId);

      // Apply niveauAcces filter if provided
      if (options?.niveauAccesFilter && options.niveauAccesFilter.length > 0) {
        testFolders = testFolders.filter((f) =>
          options.niveauAccesFilter!.includes(f.niveauAcces)
        );
      }

      setFolders(testFolders);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToDossiers(
      coproprieteId,
      parentId,
      (dossiers) => {
        setFolders(dossiers);
        setLoading(false);
      },
      { niveauAccesFilter: options?.niveauAccesFilter }
    );

    return () => unsubscribe();
  }, [coproprieteId, parentId, refreshTrigger, options?.niveauAccesFilter]);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const createFolder = useCallback(
    async (input: CreateDossierInput): Promise<Dossier> => {
      if (!coproprieteId || !user?.uid) {
        throw new Error('Non authentifié ou copropriété non sélectionnée');
      }

      return createDossier(coproprieteId, input, user.uid);
    },
    [coproprieteId, user?.uid]
  );

  const updateFolder = useCallback(
    async (folderId: string, input: UpdateDossierInput): Promise<void> => {
      if (!coproprieteId) {
        throw new Error('Copropriété non sélectionnée');
      }

      await updateDossier(coproprieteId, folderId, input);
    },
    [coproprieteId]
  );

  const deleteFolder = useCallback(
    async (folderId: string, force: boolean = false): Promise<void> => {
      if (!coproprieteId) {
        throw new Error('Copropriété non sélectionnée');
      }

      await deleteDossier(coproprieteId, folderId, force);
    },
    [coproprieteId]
  );

  const isFolderEmpty = useCallback(
    async (folderId: string): Promise<boolean> => {
      if (!coproprieteId) {
        return true;
      }

      return isDossierEmpty(coproprieteId, folderId);
    },
    [coproprieteId]
  );

  const moveDocumentToFolder = useCallback(
    async (documentId: string, targetFolderId: string | null): Promise<void> => {
      if (!coproprieteId) {
        throw new Error('Copropriété non sélectionnée');
      }

      await moveDocument(coproprieteId, documentId, targetFolderId);
    },
    [coproprieteId]
  );

  const getDefaultNiveauAccesAsync = useCallback(
    async (parentIdParam: string | null): Promise<NiveauAcces> => {
      if (!coproprieteId) {
        return 'syndic';
      }

      return getInheritedNiveauAcces(coproprieteId, parentIdParam);
    },
    [coproprieteId]
  );

  // Sync version that computes from local folders data
  const getDefaultNiveauAcces = useCallback(
    (parentIdParam: string | null): NiveauAcces => {
      if (!parentIdParam) {
        return 'syndic';
      }
      // Find parent folder in local data and inherit its niveau acces
      const parentFolder = folders.find((f) => f.id === parentIdParam);
      return parentFolder?.niveauAcces || 'syndic';
    },
    [folders]
  );

  return {
    folders,
    loading,
    error,
    createFolder,
    updateFolder,
    deleteFolder,
    isFolderEmpty,
    moveDocumentToFolder,
    getDefaultNiveauAcces,
    getDefaultNiveauAccesAsync,
    refresh,
  };
}
