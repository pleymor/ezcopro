'use client';

import { useMemo } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserRole, isSyndic, isCoproprietaire } from '@/types/auth';

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
 */
export function useUserRole(): UseUserRoleReturn {
  const { user, claims, loading } = useAuth();

  return useMemo(() => {
    const role = claims?.role ?? null;
    const coproprieteId = claims?.coproprieteId ?? null;
    const coproprietaireId = claims?.coproprietaireId ?? null;

    return {
      role,
      isSyndic: isSyndic(claims),
      isCoproprietaire: isCoproprietaire(claims),
      coproprieteId,
      coproprietaireId,
      loading,
      isAuthenticated: !!user && !!claims,
    };
  }, [user, claims, loading]);
}
