'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCondo } from '@/lib/hooks/useCondo';
import { subscribeToCoproprietaires } from '@/lib/firebase/services/coproprietaire';
import type { Coproprietaire } from '@/types/coproprietaire';

export interface UseCoproprietairesResult {
  coproprietaires: Coproprietaire[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

/**
 * Hook pour récupérer la liste des copropriétaires de la copropriété sélectionnée
 */
export function useCoproprietaires(): UseCoproprietairesResult {
  const { selectedCondo } = useCondo();
  const coproprieteId = selectedCondo?.id;

  const [coproprietaires, setCoproprietaires] = useState<Coproprietaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!coproprieteId) {
      setCoproprietaires([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToCoproprietaires(coproprieteId, (cp) => {
      setCoproprietaires(cp);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [coproprieteId, refreshTrigger]);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    coproprietaires,
    loading,
    error,
    refresh,
  };
}
