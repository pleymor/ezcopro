'use client';

import { useState, useEffect } from 'react';
import type { Resolution } from '@/types/assemblee-generale';
import { subscribeToResolutions } from '@/lib/firebase/services/resolution';

interface UseResolutionsResult {
  resolutions: Resolution[];
  loading: boolean;
  error: Error | null;
}

export function useResolutions(
  coproId: string | null,
  agId: string | null
): UseResolutionsResult {
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!coproId || !agId) {
      setResolutions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToResolutions(coproId, agId, (data) => {
      setResolutions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [coproId, agId]);

  return { resolutions, loading, error };
}
