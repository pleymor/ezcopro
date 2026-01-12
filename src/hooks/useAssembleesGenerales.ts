'use client';

import { useState, useEffect } from 'react';
import type { AssembleeGenerale } from '@/types/assemblee-generale';
import { subscribeToAssembleesGenerales } from '@/lib/firebase/services/assemblee-generale';

interface UseAssembleesGeneralesResult {
  ags: AssembleeGenerale[];
  loading: boolean;
  error: Error | null;
}

export function useAssembleesGenerales(coproId: string | null): UseAssembleesGeneralesResult {
  const [ags, setAgs] = useState<AssembleeGenerale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!coproId) {
      setAgs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToAssembleesGenerales(coproId, (data) => {
      setAgs(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [coproId]);

  return { ags, loading, error };
}
