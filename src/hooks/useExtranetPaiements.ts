'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUserRole } from './useUserRole';
import { subscribeToPaiements } from '@/lib/firebase/services/paiement';
import type { Paiement } from '@/types/paiement';
import { IS_TEST_MODE } from '@/lib/test/mock-data';
import { getPaiementsForCoproprietaire } from '@/lib/test/mock-data-extranet';

export interface PaiementExtranet {
  id: string;
  datePaiement: { seconds: number; nanoseconds: number };
  montantCents: number;
  reference: string | null;
}

export interface PeriodFilter {
  startDate: Date | null;
  endDate: Date | null;
}

interface UseExtranetPaiementsResult {
  paiements: PaiementExtranet[];
  filteredPaiements: PaiementExtranet[];
  totalPaiements: number;
  totalMontantCents: number;
  loading: boolean;
  error: Error | null;
  period: PeriodFilter;
  setPeriod: (period: PeriodFilter) => void;
  refresh: () => void;
}

/**
 * Hook pour récupérer les paiements du copropriétaire connecté.
 * Permet de filtrer par période.
 */
export function useExtranetPaiements(): UseExtranetPaiementsResult {
  const { coproprieteId, coproprietaireId, loading: roleLoading } = useUserRole();
  const [allPaiements, setAllPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [period, setPeriod] = useState<PeriodFilter>({
    startDate: null,
    endDate: null,
  });

  // Charger les paiements
  useEffect(() => {
    if (roleLoading) return;

    if (!coproprieteId || !coproprietaireId) {
      setAllPaiements([]);
      setLoading(false);
      return;
    }

    // En mode test, utiliser les données mock
    if (IS_TEST_MODE) {
      const mockPaiements = getPaiementsForCoproprietaire(coproprietaireId);
      setAllPaiements(mockPaiements);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToPaiements(coproprieteId, (paiements) => {
      // Filtrer les paiements du copropriétaire connecté
      const myPaiements = paiements.filter(
        (p) => p.coproprietaireId === coproprietaireId
      );
      setAllPaiements(myPaiements);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [coproprieteId, coproprietaireId, roleLoading]);

  // Convertir et trier les paiements
  const paiements = useMemo((): PaiementExtranet[] => {
    return allPaiements
      .map((p) => ({
        id: p.id,
        datePaiement: p.datePaiement,
        montantCents: p.montantCents,
        reference: p.reference,
      }))
      .sort((a, b) => b.datePaiement.seconds - a.datePaiement.seconds);
  }, [allPaiements]);

  // Filtrer par période
  const filteredPaiements = useMemo((): PaiementExtranet[] => {
    if (!period.startDate && !period.endDate) {
      return paiements;
    }

    return paiements.filter((p) => {
      const paiementDate = new Date(p.datePaiement.seconds * 1000);

      if (period.startDate && paiementDate < period.startDate) {
        return false;
      }

      if (period.endDate) {
        // Inclure toute la journée de fin
        const endOfDay = new Date(period.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (paiementDate > endOfDay) {
          return false;
        }
      }

      return true;
    });
  }, [paiements, period]);

  // Calculer les totaux
  const totalPaiements = filteredPaiements.length;
  const totalMontantCents = filteredPaiements.reduce(
    (sum, p) => sum + p.montantCents,
    0
  );

  const refresh = useCallback(() => {
    // Force re-fetch en mode réel (le subscribe se chargera de la mise à jour)
    setLoading(true);
    setTimeout(() => setLoading(false), 100);
  }, []);

  return {
    paiements,
    filteredPaiements,
    totalPaiements,
    totalMontantCents,
    loading: loading || roleLoading,
    error,
    period,
    setPeriod,
    refresh,
  };
}

/**
 * Prédéfinitions de périodes courantes
 */
export type PeriodPreset = 'all' | 'thisYear' | 'lastYear' | 'last6Months' | 'last12Months';

export function getPeriodFromPreset(preset: PeriodPreset): PeriodFilter {
  const now = new Date();

  switch (preset) {
    case 'thisYear':
      return {
        startDate: new Date(now.getFullYear(), 0, 1),
        endDate: null,
      };
    case 'lastYear':
      return {
        startDate: new Date(now.getFullYear() - 1, 0, 1),
        endDate: new Date(now.getFullYear() - 1, 11, 31),
      };
    case 'last6Months':
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return {
        startDate: sixMonthsAgo,
        endDate: null,
      };
    case 'last12Months':
      const twelveMonthsAgo = new Date(now);
      twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
      return {
        startDate: twelveMonthsAgo,
        endDate: null,
      };
    case 'all':
    default:
      return {
        startDate: null,
        endDate: null,
      };
  }
}

export const PERIOD_PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: 'all', label: 'Toutes les périodes' },
  { value: 'thisYear', label: 'Cette année' },
  { value: 'lastYear', label: 'Année précédente' },
  { value: 'last6Months', label: '6 derniers mois' },
  { value: 'last12Months', label: '12 derniers mois' },
];
