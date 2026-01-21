'use client';

import { useParams } from 'next/navigation';
import { useCondo } from './useCondo';
import type { Condo } from '@/types/condo';

interface UseCondoFromUrlResult {
  condoId: string | null;
  currentCondo: Condo | null;
  condos: Condo[];
  loading: boolean;
  hasAccess: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to read condoId from URL params and get the corresponding condo.
 * Used in /copro/[condoId]/* routes.
 */
export function useCondoFromUrl(): UseCondoFromUrlResult {
  const params = useParams();
  const condoId = params?.condoId as string | undefined ?? null;
  const { condos, loading, error, refresh } = useCondo();

  const currentCondo = condoId
    ? condos.find((c) => c.id === condoId) ?? null
    : null;

  const hasAccess = !!currentCondo;

  return {
    condoId,
    currentCondo,
    condos,
    loading,
    hasAccess,
    error,
    refresh,
  };
}
