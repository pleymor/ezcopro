'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { CoproprietaireCard } from '@/components/coproprietaires/CoproprietaireCard';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  subscribeToCoproprietaires,
  anonymizeCoproprietaire,
} from '@/lib/firebase/services/coproprietaire';
import { getLotsByCoproprietaire } from '@/lib/firebase/services/lot';
import {
  createInvitationExtranet,
  getInvitationsForCoproprietaire,
  resendInvitation,
} from '@/lib/firebase/services/invitation-extranet';
import { setBoardMemberStatus, setPresidentStatus } from '@/lib/firebase/services/owner';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCondo } from '@/lib/hooks/useCondo';
import type { Coproprietaire } from '@/types/coproprietaire';
import type { Lot } from '@/types/lot';
import { Plus } from 'lucide-react';

export default function CoproprietairesPage() {
  const { user } = useAuth();
  const { selectedCondo, loading: condoLoading } = useCondo();
  const coproId = selectedCondo?.id ?? null;

  // Permissions basées sur le nouveau modèle condos
  const canWrite = useMemo(() => {
    if (!user || !selectedCondo) return false;
    // Owner peut tout faire
    if (selectedCondo.ownerId === user.uid) return true;
    // Board members peuvent aussi écrire
    return selectedCondo.boardMemberIds?.includes(user.uid) ?? false;
  }, [user, selectedCondo]);
  const [coproprietaires, setCoproprietaires] = useState<Coproprietaire[]>([]);
  const [lotsMap, setLotsMap] = useState<Record<string, Lot[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anonymizeTarget, setAnonymizeTarget] = useState<Coproprietaire | null>(null);
  const [isAnonymizing, setIsAnonymizing] = useState(false);

  // Handler pour inviter un copropriétaire sur l'extranet
  const handleInviteExtranet = useCallback(async (coproprietaireId: string, email: string) => {
    if (!selectedCondo || !user) {
      throw new Error('Copropriété ou utilisateur non défini');
    }
    await createInvitationExtranet(selectedCondo.id, {
      email,
      coproprietaireId,
    }, user.uid);
  }, [selectedCondo, user]);

  // Handler pour renvoyer une invitation
  const handleResendInvitation = useCallback(async (coproprietaireId: string) => {
    if (!selectedCondo || !user) {
      throw new Error('Copropriété ou utilisateur non défini');
    }
    // Trouver l'invitation en attente
    const invitations = await getInvitationsForCoproprietaire(coproprietaireId);
    const pendingInvitation = invitations.find((inv) => inv.statut === 'en_attente');
    if (!pendingInvitation) {
      throw new Error('Aucune invitation en attente');
    }
    await resendInvitation(selectedCondo.id, pendingInvitation.id, user.uid);
  }, [selectedCondo, user]);

  // Handler pour ajouter/retirer du conseil syndical
  const handleToggleBoardMember = useCallback(async (coproprietaireId: string, isBoardMember: boolean) => {
    if (!selectedCondo) {
      throw new Error('Copropriété non définie');
    }
    await setBoardMemberStatus(selectedCondo.id, coproprietaireId, isBoardMember);
  }, [selectedCondo]);

  // Handler pour nommer/retirer président
  const handleSetPresident = useCallback(async (coproprietaireId: string, isPresident: boolean) => {
    if (!selectedCondo) {
      throw new Error('Copropriété non définie');
    }
    await setPresidentStatus(selectedCondo.id, coproprietaireId, isPresident);
  }, [selectedCondo]);

  useEffect(() => {
    if (!coproId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToCoproprietaires(coproId, async (updated) => {
      setCoproprietaires(updated);

      // Charger les lots pour chaque copropriétaire
      const lotsPromises = updated.map(async (cp) => {
        const lots = await getLotsByCoproprietaire(coproId, cp.id);
        return { id: cp.id, lots };
      });

      const lotsResults = await Promise.all(lotsPromises);
      const newLotsMap: Record<string, Lot[]> = {};
      lotsResults.forEach((result) => {
        newLotsMap[result.id] = result.lots;
      });
      setLotsMap(newLotsMap);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [coproId]);

  const handleAnonymize = async () => {
    if (!anonymizeTarget || !selectedCondo || !user) return;

    setIsAnonymizing(true);
    try {
      await anonymizeCoproprietaire(selectedCondo.id, anonymizeTarget.id, user.uid, user.email || '');
      setAnonymizeTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'anonymisation');
    } finally {
      setIsAnonymizing(false);
    }
  };

  if (condoLoading || loading) {
    return <Loading message="Chargement des copropriétaires..." />;
  }

  if (!selectedCondo) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 text-center">
        <ErrorMessage message="Aucune copropriété sélectionnée" />
        <Link href="/copro">
          <Button variant="outline" className="mt-4">
            Choisir une copropriété
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Copropriétaires</h1>
          <p className="text-sm text-muted-foreground">
            {coproprietaires.length} copropriétaire{coproprietaires.length > 1 ? 's' : ''}
          </p>
        </div>
        {canWrite && (
          <Link href="/coproprietaires/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} onRetry={() => setError(null)} />
        </div>
      )}

      {coproprietaires.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Aucun copropriétaire pour l&apos;instant</p>
          {canWrite && (
            <Link href="/coproprietaires/new">
              <Button variant="outline" className="mt-4">
                Créer le premier copropriétaire
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {coproprietaires.map((cp) => (
            <CoproprietaireCard
              key={cp.id}
              condoId={selectedCondo.id}
              coproprietaire={cp}
              lots={lotsMap[cp.id] || []}
              onInviteExtranet={canWrite ? (email) => handleInviteExtranet(cp.id, email) : undefined}
              onResendInvitation={canWrite ? () => handleResendInvitation(cp.id) : undefined}
              onToggleBoardMember={canWrite ? (isBoardMember) => handleToggleBoardMember(cp.id, isBoardMember) : undefined}
              onSetPresident={canWrite ? (isPresident) => handleSetPresident(cp.id, isPresident) : undefined}
              onAnonymize={canWrite ? () => setAnonymizeTarget(cp) : undefined}
              isEditable={canWrite}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!anonymizeTarget}
        onOpenChange={() => setAnonymizeTarget(null)}
        title="Anonymiser le copropriétaire (RGPD)"
        description={`Êtes-vous sûr de vouloir anonymiser ${anonymizeTarget?.nom} ${anonymizeTarget?.prenom || ''} ? Les données personnelles seront supprimées mais l'historique financier sera conservé. Cette action est irréversible.`}
        confirmLabel="Anonymiser"
        onConfirm={handleAnonymize}
        isLoading={isAnonymizing}
        variant="destructive"
      />
    </div>
  );
}
