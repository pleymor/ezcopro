'use client';

import { useState, useEffect } from 'react';
import type { CleRepartition } from '@/types/assemblee-generale';
import { IS_TEST_MODE, mockStore } from '@/lib/test/mock-data';

interface UseClesRepartitionResult {
  cles: CleRepartition[];
  loading: boolean;
  error: Error | null;
}

// For now, clés de répartition are loaded from mock data
// In the future, this will fetch from Firestore
export function useClesRepartition(coproId: string | null): UseClesRepartitionResult {
  const [cles, setCles] = useState<CleRepartition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!coproId) {
      setCles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For MVP, always use mock data since clés de répartition module is out of scope
      if (IS_TEST_MODE || true) {
        setCles(mockStore.clesRepartition);
        setLoading(false);
        return;
      }

      // Future: Fetch from Firestore
      // const unsubscribe = subscribeToC lesRepartition(coproId, (data) => {
      //   setCles(data);
      //   setLoading(false);
      // });
      // return () => unsubscribe();
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Erreur lors du chargement des clés de répartition')
      );
      setLoading(false);
    }
  }, [coproId]);

  return { cles, loading, error };
}
