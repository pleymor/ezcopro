'use client';

import { useState, useEffect, useCallback } from 'react';
import { useExtranetCondo } from './useExtranetCondo';
import {
  getDetailSoldeCoproprietaire,
  type DetailAppel,
  type DetailPaiement,
} from '@/lib/firebase/services/solde';
import { subscribeToPaiements } from '@/lib/firebase/services/paiement';
import { subscribeToLots } from '@/lib/firebase/services/lot';
import type { Lot } from '@/types/lot';
import type { Paiement } from '@/types/paiement';
import { IS_TEST_MODE } from '@/lib/test/mock-data';
import {
  getExtranetSoldeForCoproprietaire,
  getAppelsForCoproprietaire,
  getPaiementsForCoproprietaire,
} from '@/lib/test/mock-data-extranet';

export interface ExtranetSoldeData {
  /** Solde en centimes (positif = débiteur, négatif = créditeur) */
  soldeCents: number;
  /** Total appelé en centimes */
  totalDuCents: number;
  /** Total payé en centimes */
  totalPayeCents: number;
  /** Liste des appels de fonds */
  appels: DetailAppel[];
  /** Liste des paiements */
  paiements: DetailPaiement[];
  /** L'utilisateur est-il débiteur ? */
  isDebiteur: boolean;
}

interface UseExtranetSoldeResult {
  data: ExtranetSoldeData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook pour récupérer le solde du copropriétaire connecté.
 * Utilise les claims Firebase pour identifier le copropriétaire.
 */
export function useExtranetSolde(): UseExtranetSoldeResult {
  const { selectedCondo, loading: condoLoading } = useExtranetCondo();
  const coproprieteId = selectedCondo?.coproprieteId ?? null;
  const coproprietaireId = selectedCondo?.coproprietaireId ?? null;
  const [data, setData] = useState<ExtranetSoldeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);

  // Charger les données de base (lots et paiements)
  useEffect(() => {
    if (!coproprieteId) return;

    // En mode test, utiliser les données mock
    if (IS_TEST_MODE) {
      return;
    }

    const unsubscribeLots = subscribeToLots(coproprieteId, setLots);
    const unsubscribePaiements = subscribeToPaiements(coproprieteId, setPaiements);

    return () => {
      unsubscribeLots();
      unsubscribePaiements();
    };
  }, [coproprieteId]);

  // Calculer le solde
  const fetchSolde = useCallback(async () => {
    if (condoLoading) return;

    if (!coproprieteId || !coproprietaireId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // En mode test, utiliser les données mock
      if (IS_TEST_MODE) {
        const mockSolde = getExtranetSoldeForCoproprietaire(coproprietaireId);
        const mockAppels = getAppelsForCoproprietaire(coproprietaireId);
        const mockPaiements = getPaiementsForCoproprietaire(coproprietaireId);

        setData({
          soldeCents: Math.abs(mockSolde.soldeCents),
          totalDuCents: mockSolde.totalAppelesCents,
          totalPayeCents: mockSolde.totalPayesCents,
          appels: mockAppels.map((a) => ({
            appelId: a.id,
            libelle: a.libelle,
            dateEcheance: a.dateEcheance,
            montantCents: a.montantCoproprietaireCents,
            lotId: 'test-lot-1',
            lotNumero: '101',
          })),
          paiements: mockPaiements.map((p) => ({
            paiementId: p.id,
            datePaiement: p.datePaiement,
            montantCents: p.montantCents,
            reference: p.reference,
          })),
          isDebiteur: mockSolde.soldeCents < 0,
        });
        setLoading(false);
        return;
      }

      // Mode production: utiliser le service réel
      const detailSolde = await getDetailSoldeCoproprietaire(
        coproprieteId,
        coproprietaireId,
        lots,
        paiements
      );

      setData({
        soldeCents: detailSolde.soldeCents,
        totalDuCents: detailSolde.totalDuCents,
        totalPayeCents: detailSolde.totalPayeCents,
        appels: detailSolde.appels,
        paiements: detailSolde.paiements,
        isDebiteur: detailSolde.soldeCents > 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors du chargement du solde'));
    } finally {
      setLoading(false);
    }
  }, [coproprieteId, coproprietaireId, lots, paiements, condoLoading]);

  // Charger le solde quand les données sont prêtes
  useEffect(() => {
    fetchSolde();
  }, [fetchSolde]);

  return {
    data,
    loading: loading || condoLoading,
    error,
    refresh: fetchSolde,
  };
}

/**
 * Formate un montant en centimes vers un affichage en euros
 */
export function formatMontant(cents: number): string {
  const euros = cents / 100;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(euros);
}

/**
 * Formate une date Firestore timestamp
 */
export function formatDate(timestamp: { seconds: number; nanoseconds: number }): string {
  const date = new Date(timestamp.seconds * 1000);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}
