'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCondo } from '@/lib/hooks/useCondo';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  subscribeToFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  getFolderPath,
  getInheritedAccessLevel,
  getAllFolders,
} from '@/lib/firebase/services/folder';
import type { Folder, CreateFolderInput, UpdateFolderInput } from '@/types/folder';
import type { AccessLevel } from '@/types/document';

export interface UseCondoFoldersOptions {
  parentId?: string | null;
  accessLevelFilter?: AccessLevel[];
  /** Override the active condo (e.g. from a URL-scoped route). Falls back to the selected condo. */
  condoId?: string;
}

export interface UseCondoFoldersResult {
  folders: Folder[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
  create: (input: CreateFolderInput) => Promise<Folder>;
  update: (folderId: string, input: UpdateFolderInput) => Promise<void>;
  remove: (folderId: string, force?: boolean) => Promise<void>;
  getPath: (folderId: string | null) => Promise<Folder[]>;
  getInheritedAccess: (parentId: string | null) => Promise<AccessLevel>;
  getAll: () => Promise<Folder[]>;
}

/**
 * Hook to manage folders for a condo (syndic side)
 */
export function useCondoFolders(options?: UseCondoFoldersOptions): UseCondoFoldersResult {
  const { selectedCondo } = useCondo();
  const { user } = useAuth();
  const condoId = options?.condoId ?? selectedCondo?.id;
  const parentId = options?.parentId ?? null;

  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Subscribe to folders at current level
  useEffect(() => {
    if (!condoId) {
      setFolders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToFolders(condoId, parentId, (folderList) => {
      setFolders(folderList);
      setLoading(false);
    }, {
      accessLevelFilter: options?.accessLevelFilter,
    });

    return () => unsubscribe();
  }, [condoId, parentId, refreshTrigger, options?.accessLevelFilter]);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const create = useCallback(
    async (input: CreateFolderInput): Promise<Folder> => {
      if (!condoId || !user?.uid) {
        throw new Error('Not authenticated or no condo selected');
      }

      return createFolder(condoId, input, user.uid);
    },
    [condoId, user?.uid]
  );

  const update = useCallback(
    async (folderId: string, input: UpdateFolderInput): Promise<void> => {
      if (!condoId) {
        throw new Error('No condo selected');
      }

      await updateFolder(condoId, folderId, input);
    },
    [condoId]
  );

  const remove = useCallback(
    async (folderId: string, force: boolean = false): Promise<void> => {
      if (!condoId) {
        throw new Error('No condo selected');
      }

      await deleteFolder(condoId, folderId, force);
    },
    [condoId]
  );

  const getPath = useCallback(
    async (folderId: string | null): Promise<Folder[]> => {
      if (!condoId) {
        return [];
      }

      return getFolderPath(condoId, folderId);
    },
    [condoId]
  );

  const getInheritedAccess = useCallback(
    async (parentId: string | null): Promise<AccessLevel> => {
      if (!condoId) {
        return 'all';
      }

      return getInheritedAccessLevel(condoId, parentId);
    },
    [condoId]
  );

  const getAll = useCallback(
    async (): Promise<Folder[]> => {
      if (!condoId) {
        return [];
      }

      return getAllFolders(condoId);
    },
    [condoId]
  );

  return {
    folders,
    loading,
    error,
    refresh,
    create,
    update,
    remove,
    getPath,
    getInheritedAccess,
    getAll,
  };
}

/**
 * Hook to get the path (breadcrumb) for a folder
 */
export function useFolderBreadcrumb(folderId: string | null) {
  const { selectedCondo } = useCondo();
  const condoId = selectedCondo?.id;

  const [path, setPath] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!condoId) {
      setPath([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getFolderPath(condoId, folderId)
      .then(setPath)
      .catch((err) => {
        console.error('Error getting folder path:', err);
        setPath([]);
      })
      .finally(() => setLoading(false));
  }, [condoId, folderId]);

  return { path, loading };
}
