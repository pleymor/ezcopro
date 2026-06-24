'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useCopropriete } from '@/lib/hooks/useCopropriete';
import { useAuth } from '@/lib/hooks/useAuth';
import type {
  RoleSyndic,
  MembreSyndic,
} from '@/types/membre-syndic';
import { rolePermissions } from '@/types/membre-syndic';
import type {
  InvitationGestionnaire,
  CreateInvitationGestionnaireInput,
} from '@/types/invitation-gestionnaire';
import {
  updateMembreRole as fbUpdateMembreRole,
  removeMembre as fbRemoveMembre,
  transferOwnership as fbTransferOwnership,
} from '@/lib/firebase/services/membre-syndic';
import {
  createInvitationGestionnaire,
  cancelInvitationGestionnaire,
  resendInvitationGestionnaire,
  getInvitationsForCopropriete,
} from '@/lib/firebase/services/invitation-gestionnaire';
import type { Copropriete } from '@/types/copropriete';

interface MembreAvecId extends MembreSyndic {
  userId: string;
}

interface UseEquipeResult {
  // État
  membres: MembreAvecId[];
  invitations: InvitationGestionnaire[];
  currentUserRole: RoleSyndic | null;
  currentUserId: string | null;
  loading: boolean;
  error: Error | null;

  // Permissions de l'utilisateur courant
  canRead: boolean;
  canWrite: boolean;
  canManageTeam: boolean;
  canTransferOwnership: boolean;

  // Actions membres
  updateMembreRole: (userId: string, newRole: RoleSyndic) => Promise<void>;
  removeMembre: (userId: string) => Promise<void>;
  transferOwnership: (newOwnerId: string) => Promise<void>;

  // Actions invitations
  inviteMembre: (input: CreateInvitationGestionnaireInput) => Promise<InvitationGestionnaire>;
  cancelInvitation: (invitationId: string) => Promise<void>;
  resendInvitation: (invitationId: string) => Promise<InvitationGestionnaire>;

  // Helpers
  getMembreById: (userId: string) => MembreAvecId | undefined;
  refreshInvitations: () => Promise<void>;
}

export function useEquipe(): UseEquipeResult {
  const { selectedCopro } = useCopropriete();
  const { user } = useAuth();
  const coproId = selectedCopro?.id || null;
  const userId = user?.uid || null;
  const [membres, setMembres] = useState<MembreAvecId[]>([]);
  const [invitations, setInvitations] = useState<InvitationGestionnaire[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<RoleSyndic | null>(null);
  const [coproNom, setCoproNom] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to copropriété changes (for membres)
  useEffect(() => {
    if (!coproId) {
      setMembres([]);
      setCurrentUserRole(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const coproRef = doc(db, 'coproprietes', coproId);
    const unsubscribe = onSnapshot(
      coproRef,
      async (snapshot) => {
        if (!snapshot.exists()) {
          setMembres([]);
          setCurrentUserRole(null);
          setLoading(false);
          return;
        }

        const data = snapshot.data() as Copropriete;
        setCoproNom(data.nom);

        // Convertir le map en array
        const membresArray: MembreAvecId[] = Object.entries(data.membres || {}).map(
          ([id, membre]) => {
            // Enrichir les données du membre courant avec son email/displayName de l'auth
            if (id === userId && user) {
              return {
                userId: id,
                ...membre,
                email: membre.email || user.email || undefined,
                displayName: membre.displayName || user.displayName || undefined,
              };
            }
            return {
              userId: id,
              ...membre,
            };
          }
        );

        // Trier: admin d'abord, puis gestionnaires, puis lecteurs
        const roleOrder: Record<RoleSyndic, number> = {
          admin: 0,
          gestionnaire: 1,
          lecteur: 2,
        };
        membresArray.sort((a, b) => roleOrder[a.role] - roleOrder[b.role]);

        setMembres(membresArray);

        // Définir le rôle de l'utilisateur courant
        const currentUserRoleValue = userId && data.membres?.[userId]
          ? data.membres[userId].role
          : null;
        setCurrentUserRole(currentUserRoleValue);

        // Mettre à jour Firestore si l'email/displayName manque
        if (userId && data.membres?.[userId]) {
          const membreData = data.membres[userId];
          const canWriteData = currentUserRoleValue === 'admin' || currentUserRoleValue === 'gestionnaire';
          if (canWriteData && user && (!membreData.email || !membreData.displayName)) {
            const { updateDoc: updateDocFn, serverTimestamp } = await import('firebase/firestore');
            const updates: Record<string, unknown> = {};
            if (!membreData.email && user.email) {
              updates[`membres.${userId}.email`] = user.email;
            }
            if (!membreData.displayName && user.displayName) {
              updates[`membres.${userId}.displayName`] = user.displayName;
            }
            if (Object.keys(updates).length > 0) {
              updates.updatedAt = serverTimestamp();
              updateDocFn(coproRef, updates).catch(console.error);
            }
          }
        }

        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [coproId, userId, user]);

  // Charger les invitations
  const refreshInvitations = useCallback(async () => {
    if (!coproId) {
      setInvitations([]);
      return;
    }

    try {
      const invits = await getInvitationsForCopropriete(coproId);
      setInvitations(invits);
    } catch (err) {
      console.error('Erreur chargement invitations:', err);
    }
  }, [coproId]);

  useEffect(() => {
    refreshInvitations();
  }, [refreshInvitations]);

  // Permissions basées sur le rôle
  const permissions = useMemo(() => {
    if (!currentUserRole) {
      return {
        canRead: false,
        canWrite: false,
        canManageTeam: false,
        canTransferOwnership: false,
      };
    }
    return rolePermissions[currentUserRole];
  }, [currentUserRole]);

  // Mettre à jour le rôle d'un membre
  const updateMembreRole = useCallback(
    async (targetUserId: string, newRole: RoleSyndic): Promise<void> => {
      if (!coproId) throw new Error('Copropriété non sélectionnée');
      if (!permissions.canManageTeam) {
        throw new Error("Vous n'avez pas les droits pour gérer l'équipe");
      }

      await fbUpdateMembreRole(coproId, targetUserId, newRole);
    },
    [coproId, permissions.canManageTeam]
  );

  // Retirer un membre
  const removeMembre = useCallback(
    async (targetUserId: string): Promise<void> => {
      if (!coproId) throw new Error('Copropriété non sélectionnée');
      if (!permissions.canManageTeam) {
        throw new Error("Vous n'avez pas les droits pour gérer l'équipe");
      }

      await fbRemoveMembre(coproId, targetUserId);
    },
    [coproId, permissions.canManageTeam]
  );

  // Transférer la propriété
  const transferOwnership = useCallback(
    async (newOwnerId: string): Promise<void> => {
      if (!coproId || !userId) throw new Error('Copropriété non sélectionnée');
      if (!permissions.canTransferOwnership) {
        throw new Error("Vous n'avez pas les droits pour transférer la propriété");
      }

      await fbTransferOwnership(coproId, userId, newOwnerId);
    },
    [coproId, userId, permissions.canTransferOwnership]
  );

  // Inviter un membre
  const inviteMembre = useCallback(
    async (input: CreateInvitationGestionnaireInput): Promise<InvitationGestionnaire> => {
      if (!coproId || !userId) throw new Error('Copropriété non sélectionnée');
      if (!permissions.canManageTeam) {
        throw new Error("Vous n'avez pas les droits pour inviter des membres");
      }

      const currentMembre = membres.find((m) => m.userId === userId);

      const invitation = await createInvitationGestionnaire(
        coproId,
        coproNom,
        input,
        userId,
        currentMembre?.email
      );

      await refreshInvitations();
      return invitation;
    },
    [coproId, userId, coproNom, membres, permissions.canManageTeam, refreshInvitations]
  );

  // Annuler une invitation
  const cancelInvitation = useCallback(
    async (invitationId: string): Promise<void> => {
      if (!permissions.canManageTeam) {
        throw new Error("Vous n'avez pas les droits pour annuler les invitations");
      }

      await cancelInvitationGestionnaire(invitationId);
      await refreshInvitations();
    },
    [permissions.canManageTeam, refreshInvitations]
  );

  // Renvoyer une invitation
  const resendInvitation = useCallback(
    async (invitationId: string): Promise<InvitationGestionnaire> => {
      if (!permissions.canManageTeam) {
        throw new Error("Vous n'avez pas les droits pour renvoyer les invitations");
      }

      const invitation = await resendInvitationGestionnaire(invitationId);
      await refreshInvitations();
      return invitation;
    },
    [permissions.canManageTeam, refreshInvitations]
  );

  // Obtenir un membre par ID
  const getMembreById = useCallback(
    (targetUserId: string): MembreAvecId | undefined => {
      return membres.find((m) => m.userId === targetUserId);
    },
    [membres]
  );

  return useMemo(
    () => ({
      membres,
      invitations,
      currentUserRole,
      currentUserId: userId,
      loading,
      error,
      ...permissions,
      updateMembreRole,
      removeMembre,
      transferOwnership,
      inviteMembre,
      cancelInvitation,
      resendInvitation,
      getMembreById,
      refreshInvitations,
    }),
    [
      membres,
      invitations,
      currentUserRole,
      userId,
      loading,
      error,
      permissions,
      updateMembreRole,
      removeMembre,
      transferOwnership,
      inviteMembre,
      cancelInvitation,
      resendInvitation,
      getMembreById,
      refreshInvitations,
    ]
  );
}
