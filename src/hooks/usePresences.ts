'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Presence, AttendanceSummary } from '@/types/assemblee-generale';
import {
  subscribeToPresences,
  getAttendanceSummary,
  initializePresences,
} from '@/lib/firebase/services/presence';

interface UsePresencesResult {
  presences: Presence[];
  summary: AttendanceSummary | null;
  loading: boolean;
  error: Error | null;
  initialize: (userId: string) => Promise<void>;
  refreshSummary: () => Promise<void>;
}

export function usePresences(coproId: string | null, agId: string | null): UsePresencesResult {
  const [presences, setPresences] = useState<Presence[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshSummary = useCallback(async () => {
    if (!coproId || !agId) return;

    try {
      const summaryData = await getAttendanceSummary(coproId, agId);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error refreshing summary:', err);
    }
  }, [coproId, agId]);

  const initialize = useCallback(
    async (userId: string) => {
      if (!coproId || !agId) return;

      try {
        await initializePresences(coproId, agId, userId);
        await refreshSummary();
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Erreur lors de l\'initialisation des présences')
        );
      }
    },
    [coproId, agId, refreshSummary]
  );

  useEffect(() => {
    if (!coproId || !agId) {
      setPresences([]);
      setSummary(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToPresences(coproId, agId, async (data) => {
      setPresences(data);
      setLoading(false);

      // Refresh summary when presences change
      if (data.length > 0) {
        await refreshSummary();
      }
    });

    return () => unsubscribe();
  }, [coproId, agId, refreshSummary]);

  return { presences, summary, loading, error, initialize, refreshSummary };
}
