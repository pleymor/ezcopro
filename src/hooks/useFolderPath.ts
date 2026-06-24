'use client';

import { useState, useEffect } from 'react';
import { useCopropriete } from '@/lib/hooks/useCopropriete';
import { getDossierPath } from '@/lib/firebase/services/dossier';
import type { Dossier } from '@/types/dossier';

// Test mode configuration
const IS_TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === 'true';

// Mock folder path for test mode
const TEST_FOLDERS_MAP: Record<string, Dossier> = {
  'test-folder-1': {
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
  'test-folder-2': {
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
  'test-folder-1-sub': {
    id: 'test-folder-1-sub',
    nom: '2024',
    parentId: 'test-folder-1',
    path: '/Contrats/2024',
    depth: 1,
    niveauAcces: 'tous',
    coproprieteId: 'test-copro-123',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 15, nanoseconds: 0 },
    updatedAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 3, nanoseconds: 0 },
    createdBy: 'test-user-123',
  },
};

export interface BreadcrumbItem {
  id: string | null;
  nom: string;
}

export interface UseFolderPathResult {
  path: Dossier[];
  currentFolder: Dossier | null;
  breadcrumb: BreadcrumbItem[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook pour récupérer le chemin complet d'un dossier (pour le breadcrumb)
 */
export function useFolderPath(folderId: string | null): UseFolderPathResult {
  const { selectedCopro } = useCopropriete();
  const coproprieteId = selectedCopro?.id;

  const [path, setPath] = useState<Dossier[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Dossier | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!coproprieteId) {
      setPath([]);
      setCurrentFolder(null);
      setLoading(false);
      return;
    }

    if (!folderId) {
      // Racine
      setPath([]);
      setCurrentFolder(null);
      setLoading(false);
      return;
    }

    const loadPath = async () => {
      setLoading(true);
      setError(null);

      try {
        // In test mode, use mock data
        if (IS_TEST_MODE) {
          const pathItems: Dossier[] = [];
          let currentId: string | null = folderId;

          while (currentId) {
            const folder: Dossier | undefined = TEST_FOLDERS_MAP[currentId];
            if (!folder) break;
            pathItems.unshift(folder);
            currentId = folder.parentId;
          }

          setPath(pathItems);
          setCurrentFolder(pathItems[pathItems.length - 1] || null);
          setLoading(false);
          return;
        }

        const fullPath = await getDossierPath(coproprieteId, folderId);
        setPath(fullPath);
        setCurrentFolder(fullPath[fullPath.length - 1] || null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erreur lors du chargement'));
      } finally {
        setLoading(false);
      }
    };

    loadPath();
  }, [coproprieteId, folderId]);

  // Construire le breadcrumb avec la racine
  const breadcrumb: BreadcrumbItem[] = [
    { id: null, nom: 'Documents' }, // Racine
    ...path.map((folder) => ({ id: folder.id, nom: folder.nom })),
  ];

  return {
    path,
    currentFolder,
    breadcrumb,
    loading,
    error,
  };
}
