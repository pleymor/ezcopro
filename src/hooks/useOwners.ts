'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCondo } from '@/lib/hooks/useCondo';
import { subscribeToOwners } from '@/lib/firebase/services/owner';
import type { Owner } from '@/types/owner';

export interface UseOwnersResult {
  owners: Owner[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

/**
 * Hook to get the list of owners for the selected condo
 */
export function useOwners(): UseOwnersResult {
  const { selectedCondo } = useCondo();
  const condoId = selectedCondo?.id;

  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!condoId) {
      setOwners([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToOwners(condoId, (ownerList) => {
      setOwners(ownerList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [condoId, refreshTrigger]);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    owners,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook to get board members only
 */
export function useBoardMembers(): UseOwnersResult {
  const { owners, loading, error, refresh } = useOwners();

  const boardMembers = owners.filter(owner => owner.isBoardMember);

  return {
    owners: boardMembers,
    loading,
    error,
    refresh,
  };
}
