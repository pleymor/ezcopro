'use client';

/**
 * COMPATIBILITY LAYER
 * This file provides backwards compatibility for components using the old French API.
 * New code should use useCondo from '@/lib/hooks/useCondo'.
 *
 * @deprecated Use useCondo instead
 */

import { useMemo } from 'react';
import { useCondo, CondoProvider } from './useCondo';
import type { Condo } from '@/types/condo';

// Re-export the provider with the old name
export { CondoProvider as CoproprieteProvider };

// Legacy type that maps to the new Condo type
export interface Copropriete {
  id: string;
  nom: string;
  adresse: string;
  membres?: Record<string, { role: string; email?: string }>;
  memberIds?: string[];
  totalTantiemes: number;
  createdAt: { seconds: number; nanoseconds: number };
  updatedAt: { seconds: number; nanoseconds: number };
}

// Map a Condo to the legacy Copropriete format
function condoToCopropriete(condo: Condo | null): Copropriete | null {
  if (!condo) return null;

  return {
    id: condo.id,
    nom: condo.name,
    adresse: condo.address,
    membres: {
      [condo.ownerId]: { role: 'admin' },
    },
    memberIds: [condo.ownerId, ...condo.boardMemberIds],
    totalTantiemes: condo.totalShares,
    createdAt: condo.createdAt as { seconds: number; nanoseconds: number },
    updatedAt: condo.updatedAt as { seconds: number; nanoseconds: number },
  };
}

interface CoproprieteContextType {
  coproprietes: Copropriete[];
  selectedCopro: Copropriete | null;
  setSelectedCopro: (copro: Copropriete | null) => void;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * @deprecated Use useCondo instead
 */
export function useCopropriete(): CoproprieteContextType {
  const { condos, selectedCondo, setSelectedCondo, loading, error, refresh } = useCondo();

  // Map condos to coproprietes
  const coproprietes = useMemo(() => {
    return condos.map(condo => condoToCopropriete(condo)!);
  }, [condos]);

  const selectedCopro = useMemo(() => {
    return condoToCopropriete(selectedCondo);
  }, [selectedCondo]);

  // Wrap setSelectedCondo to accept legacy format
  const setSelectedCopro = (copro: Copropriete | null) => {
    if (!copro) {
      setSelectedCondo(null);
      return;
    }
    // Find the original condo
    const condo = condos.find(c => c.id === copro.id);
    setSelectedCondo(condo ?? null);
  };

  return {
    coproprietes,
    selectedCopro,
    setSelectedCopro,
    loading,
    error,
    refresh,
  };
}
