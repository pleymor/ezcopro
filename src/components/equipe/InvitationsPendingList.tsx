'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Mail, Clock, XCircle, RefreshCw, Copy, Check } from 'lucide-react';
import type { InvitationGestionnaire } from '@/types/invitation-gestionnaire';
import { roleLabels } from '@/types/membre-syndic';
import { statutInvitationLabels, statutInvitationColors } from '@/types/invitation-gestionnaire';

interface InvitationsPendingListProps {
  invitations: InvitationGestionnaire[];
  canManageTeam: boolean;
  onCancel: (invitationId: string) => Promise<void>;
  onResend: (invitationId: string) => Promise<InvitationGestionnaire>;
}

export function InvitationsPendingList({
  invitations,
  canManageTeam,
  onCancel,
  onResend,
}: InvitationsPendingListProps) {
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<InvitationGestionnaire | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtrer pour ne montrer que les invitations actives
  const activeInvitations = invitations.filter(
    (inv) => inv.statut === 'en_attente' || inv.statut === 'expiree'
  );

  if (activeInvitations.length === 0) {
    return null;
  }

  const handleCancelClick = (invitation: InvitationGestionnaire) => {
    setSelectedInvitation(invitation);
    setShowCancelDialog(true);
  };

  const handleCancel = async () => {
    if (!selectedInvitation) return;
    setCancelingId(selectedInvitation.id);
    try {
      await onCancel(selectedInvitation.id);
      setShowCancelDialog(false);
    } finally {
      setCancelingId(null);
      setSelectedInvitation(null);
    }
  };

  const handleResend = async (invitation: InvitationGestionnaire) => {
    setResendingId(invitation.id);
    try {
      await onResend(invitation.id);
    } finally {
      setResendingId(null);
    }
  };

  const getInvitationLink = (token: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/invitation-equipe/${token}`;
  };

  const handleCopyLink = async (invitation: InvitationGestionnaire) => {
    const link = getInvitationLink(invitation.token);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(invitation.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    return new Date(timestamp.seconds * 1000).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        Invitations en attente ({activeInvitations.length})
      </h3>

      {activeInvitations.map((invitation) => (
        <Card key={invitation.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{invitation.email}</span>
                  <Badge variant="secondary">
                    {roleLabels[invitation.role]}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Envoyée le {formatDate(invitation.dateEnvoi)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={statutInvitationColors[invitation.statut]}>
                {statutInvitationLabels[invitation.statut]}
              </Badge>

              {canManageTeam && (
                <div className="flex gap-1">
                  {invitation.statut === 'en_attente' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyLink(invitation)}
                      title="Copier le lien d'invitation"
                    >
                      {copiedId === invitation.id ? (
                        <>
                          <Check className="h-4 w-4 mr-1 text-green-600" />
                          Copie !
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copier le lien
                        </>
                      )}
                    </Button>
                  )}
                  {(invitation.statut === 'en_attente' || invitation.statut === 'expiree') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResend(invitation)}
                      disabled={resendingId === invitation.id}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-1 ${resendingId === invitation.id ? 'animate-spin' : ''}`}
                      />
                      Renvoyer
                    </Button>
                  )}
                  {invitation.statut === 'en_attente' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleCancelClick(invitation)}
                      disabled={cancelingId === invitation.id}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Annuler
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Annuler l'invitation ?"
        description={`L'invitation envoyée à ${selectedInvitation?.email || ''} sera annulée.`}
        confirmLabel="Annuler l'invitation"
        onConfirm={handleCancel}
        isLoading={cancelingId !== null}
        variant="destructive"
      />
    </div>
  );
}
