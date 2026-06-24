'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserRole, isSyndic, isCoproprietaire } from '@/types/auth';
import { getAcceptedInvitationForUser } from '@/lib/firebase/services/invitation-extranet';

interface UseUserRoleReturn {
  /** Rôle de l'utilisateur (syndic ou coproprietaire) */
  role: UserRole | null;
  /** L'utilisateur est-il un syndic ? */
  isSyndic: boolean;
  /** L'utilisateur est-il un copropriétaire ? */
  isCoproprietaire: boolean;
  /** ID de la copropriété de l'utilisateur */
  coproprieteId: string | null;
  /** ID du copropriétaire (si rôle coproprietaire) */
  coproprietaireId: string | null;
  /** Chargement en cours ? */
  loading: boolean;
  /** L'utilisateur est-il authentifié avec un rôle valide ? */
  isAuthenticated: boolean;
}

/**
 * Hook pour obtenir le rôle de l'utilisateur connecté.
 * Fournit des helpers pour vérifier rapidement le type d'utilisateur.
 *
 * Si les custom claims ne sont pas définis, tente de récupérer
 * les infos depuis une invitation extranet acceptée (fallback).
 */
export function useUserRole(): UseUserRoleReturn {
  const { user, claims, loading: authLoading } = useAuth();
  const [fallbackData, setFallbackData] = useState<{
    coproprieteId: string;
    coproprietaireId: string;
  } | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [fallbackChecked, setFallbackChecked] = useState(false);

  // Vérifier si on a besoin du fallback (pas de claims coproprietaire)
  const needsFallback = !authLoading && user && !claims?.coproprietaireId;

  // Charger les données de fallback depuis l'invitation acceptée
  useEffect(() => {
    if (!needsFallback || fallbackChecked) return;

    const loadFallback = async () => {
      setFallbackLoading(true);
      try {
        const data = await getAcceptedInvitationForUser(user!.uid);
        setFallbackData(data);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'invitation:', error);
      } finally {
        setFallbackLoading(false);
        setFallbackChecked(true);
      }
    };

    loadFallback();
  }, [needsFallback, fallbackChecked, user]);

  // Reset fallback when user changes
  useEffect(() => {
    setFallbackData(null);
    setFallbackChecked(false);
  }, [user?.uid]);

  return useMemo(() => {
    const loading = authLoading || fallbackLoading;

    // Priorité aux claims, puis au fallback
    const hasFallbackCoproprietaire = fallbackData !== null;
    const role = claims?.role ?? (hasFallbackCoproprietaire ? 'coproprietaire' : null);
    const coproprieteId = claims?.coproprieteId ?? fallbackData?.coproprieteId ?? null;
    const coproprietaireId = claims?.coproprietaireId ?? fallbackData?.coproprietaireId ?? null;

    const isCoproprietaireUser = isCoproprietaire(claims) || hasFallbackCoproprietaire;

    return {
      role,
      isSyndic: isSyndic(claims),
      isCoproprietaire: isCoproprietaireUser,
      coproprieteId,
      coproprietaireId,
      loading,
      isAuthenticated: !!user && (!!claims || hasFallbackCoproprietaire),
    };
  }, [user, claims, authLoading, fallbackLoading, fallbackData]);
}
