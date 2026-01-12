'use client';

import { useState, useEffect } from 'react';
import type { AssembleeGenerale } from '@/types/assemblee-generale';
import { subscribeToAssembleeGenerale } from '@/lib/firebase/services/assemblee-generale';

interface UseAssembleeGeneraleResult {
  ag: AssembleeGenerale | null;
  loading: boolean;
  error: Error | null;
}

export function useAssembleeGenerale(
  coproId: string | null,
  agId: string | null
): UseAssembleeGeneraleResult {
  const [ag, setAg] = useState<AssembleeGenerale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!coproId || !agId) {
      setAg(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToAssembleeGenerale(coproId, agId, (data) => {
      setAg(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [coproId, agId]);

  return { ag, loading, error };
}
