'use client';

import { useState } from 'react';
import { useEquipe } from '@/hooks/useEquipe';
import {
  EquipeMemberList,
  InviteMemberModal,
  InvitationsPendingList,
  TransferOwnershipModal,
} from '@/components/equipe';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Users, UserPlus, Info, AlertTriangle } from 'lucide-react';

export default function EquipePage() {
  const {
    membres,
    invitations,
    currentUserId,
    loading,
    error,
    canManageTeam,
    canTransferOwnership,
    updateMembreRole,
    removeMembre,
    transferOwnership,
    inviteMembre,
    cancelInvitation,
    resendInvitation,
    getMembreById,
  } = useEquipe();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState<string | null>(null);

  const handleTransferOwnershipClick = (userId: string) => {
    setTransferTargetId(userId);
    setShowTransferModal(true);
  };

  const handleTransfer = async (newOwnerId: string) => {
    await transferOwnership(newOwnerId);
    setShowTransferModal(false);
    setTransferTargetId(null);
  };

  const transferTarget = transferTargetId ? getMembreById(transferTargetId) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Equipe</h1>
          </div>
          {canManageTeam && (
            <Button onClick={() => setShowInviteModal(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Inviter un membre
            </Button>
          )}
        </div>
        <p className="text-muted-foreground mt-2">
          Gerez les membres de votre equipe et leurs permissions.
        </p>
      </div>

      {/* Info sur les roles */}
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>A propos des roles</AlertTitle>
        <AlertDescription>
          <ul className="mt-2 text-sm space-y-1">
            <li>
              <strong>Administrateur</strong> : Acces complet, gestion de l&apos;equipe
              et transfert d&apos;administration
            </li>
            <li>
              <strong>Gestionnaire</strong> : Creer, modifier et supprimer les
              donnees de la copropriete
            </li>
            <li>
              <strong>Lecteur</strong> : Consultation seule, aucune modification
              possible
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Liste des membres */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Membres ({membres.length})
          </h2>
          <EquipeMemberList
            membres={membres}
            currentUserId={currentUserId || ''}
            canManageTeam={canManageTeam}
            canTransferOwnership={canTransferOwnership}
            onUpdateRole={updateMembreRole}
            onRemove={removeMembre}
            onTransferOwnership={handleTransferOwnershipClick}
          />
        </div>

        {/* Invitations en attente */}
        {canManageTeam && invitations.length > 0 && (
          <InvitationsPendingList
            invitations={invitations}
            canManageTeam={canManageTeam}
            onCancel={cancelInvitation}
            onResend={resendInvitation}
          />
        )}
      </div>

      {/* Modal d'invitation */}
      <InviteMemberModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        onInvite={inviteMembre}
      />

      {/* Modal de transfert de propriete */}
      <TransferOwnershipModal
        open={showTransferModal}
        onOpenChange={setShowTransferModal}
        targetMembre={transferTarget || null}
        onTransfer={handleTransfer}
      />
    </div>
  );
}
