'use client';

import { useState, useEffect, useCallback } from 'react';
import type { InvitationExtranet, CreateInvitationInput } from '@/types/invitation-extranet';
import {
  getInvitationsForCopropriete,
  createInvitationExtranet,
  resendInvitation,
  hasPendingInvitation,
  hasAcceptedInvitation,
} from '@/lib/firebase/services/invitation-extranet';

interface UseInvitationsExtranetResult {
  invitations: InvitationExtranet[];
  loading: boolean;
  error: Error | null;
  createInvitation: (input: CreateInvitationInput) => Promise<InvitationExtranet>;
  resendInvitation: (invitationId: string) => Promise<InvitationExtranet>;
  refresh: () => Promise<void>;
}

/**
 * Hook pour gérer les invitations extranet d'une copropriété (côté syndic)
 */
export function useInvitationsExtranet(
  coproprieteId: string | null,
  userId: string | null
): UseInvitationsExtranetResult {
  const [invitations, setInvitations] = useState<InvitationExtranet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInvitations = useCallback(async () => {
    if (!coproprieteId) {
      setInvitations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getInvitationsForCopropriete(coproprieteId);
      setInvitations(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors du chargement des invitations'));
    } finally {
      setLoading(false);
    }
  }, [coproprieteId]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const createInvitationHandler = useCallback(async (input: CreateInvitationInput): Promise<InvitationExtranet> => {
    if (!coproprieteId || !userId) {
      throw new Error('Copropriété ou utilisateur non défini');
    }

    const invitation = await createInvitationExtranet(coproprieteId, input, userId);
    // Rafraîchir la liste
    await fetchInvitations();
    return invitation;
  }, [coproprieteId, userId, fetchInvitations]);

  const resendInvitationHandler = useCallback(async (invitationId: string): Promise<InvitationExtranet> => {
    if (!coproprieteId || !userId) {
      throw new Error('Copropriété ou utilisateur non défini');
    }

    const invitation = await resendInvitation(coproprieteId, invitationId, userId);
    // Rafraîchir la liste
    await fetchInvitations();
    return invitation;
  }, [coproprieteId, userId, fetchInvitations]);

  return {
    invitations,
    loading,
    error,
    createInvitation: createInvitationHandler,
    resendInvitation: resendInvitationHandler,
    refresh: fetchInvitations,
  };
}

interface UseInvitationStatusResult {
  hasPending: boolean;
  hasAccount: boolean;
  loading: boolean;
}

/**
 * Hook pour vérifier le statut d'invitation d'un copropriétaire
 */
export function useInvitationStatus(
  coproprietaireId: string | null
): UseInvitationStatusResult {
  const [hasPending, setHasPending] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coproprietaireId) {
      setHasPending(false);
      setHasAccount(false);
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      setLoading(true);
      try {
        const [pending, accepted] = await Promise.all([
          hasPendingInvitation(coproprietaireId),
          hasAcceptedInvitation(coproprietaireId),
        ]);
        setHasPending(pending);
        setHasAccount(accepted);
      } catch {
        // Ignorer les erreurs, considérer comme pas d'invitation
        setHasPending(false);
        setHasAccount(false);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [coproprietaireId]);

  return { hasPending, hasAccount, loading };
}
