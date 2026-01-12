'use client';

import { useState, useEffect } from 'react';
import type { Vote } from '@/types/assemblee-generale';
import { subscribeToVotes } from '@/lib/firebase/services/vote';

interface UseVotesResult {
  votes: Vote[];
  loading: boolean;
  error: Error | null;
}

export function useVotes(
  coproId: string | null,
  agId: string | null,
  resolutionId: string | null
): UseVotesResult {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!coproId || !agId || !resolutionId) {
      setVotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToVotes(coproId, agId, resolutionId, (data) => {
      setVotes(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [coproId, agId, resolutionId]);

  return { votes, loading, error };
}
