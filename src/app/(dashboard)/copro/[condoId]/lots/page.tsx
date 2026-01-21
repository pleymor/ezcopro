'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { LotCard } from '@/components/lots/LotCard';
import { subscribeToLots, deleteLot } from '@/lib/firebase/services/lot';
import { subscribeToCoproprietaires } from '@/lib/firebase/services/coproprietaire';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCondoFromUrl } from '@/lib/hooks/useCondoFromUrl';
import { condoPaths } from '@/lib/utils/condo-routes';
import type { Lot } from '@/types/lot';
import type { Coproprietaire } from '@/types/coproprietaire';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function LotsPage() {
  const { user } = useAuth();
  const { condoId, currentCondo, loading: condoLoading } = useCondoFromUrl();

  // Permissions basées sur le modèle condos
  const canWrite = useMemo(() => {
    if (!user || !currentCondo) return false;
    if (currentCondo.ownerId === user.uid) return true;
    return currentCondo.boardMemberIds?.includes(user.uid) ?? false;
  }, [user, currentCondo]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [coproprietaires, setCoproprietaires] = useState<Coproprietaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Map des copropriétaires par ID pour un accès rapide
  const coproprietairesMap = useMemo(() => {
    return new Map(coproprietaires.map((cp) => [cp.id, cp]));
  }, [coproprietaires]);

  const getCoproprietaireName = (coproprietaireId: string | null): string | undefined => {
    if (!coproprietaireId) return undefined;
    const cp = coproprietairesMap.get(coproprietaireId);
    if (!cp) return undefined;
    if (cp.isAnonymized) return 'Ancien copropriétaire';
    return `${cp.prenom} ${cp.nom}`.trim();
  };

  useEffect(() => {
    if (!condoId) return;

    const unsubLots = subscribeToLots(condoId, (updatedLots) => {
      setLots(updatedLots);
      setLoading(false);
    });

    const unsubCopros = subscribeToCoproprietaires(condoId, (updatedCopros) => {
      setCoproprietaires(updatedCopros);
    });

    return () => {
      unsubLots();
      unsubCopros();
    };
  }, [condoId]);

  const handleDelete = async () => {
    if (!deleteTarget || !currentCondo || !user) return;

    setIsDeleting(true);
    try {
      await deleteLot(currentCondo.id, deleteTarget.id, user.uid, user.email || '');
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalTantiemes = lots.reduce((sum, lot) => sum + lot.tantiemes, 0);

  if (condoLoading || loading) {
    return <Loading message="Chargement des lots..." />;
  }

  if (!currentCondo || !condoId) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lots</h1>
          <p className="text-sm text-muted-foreground">
            {lots.length} lot{lots.length > 1 ? 's' : ''} - Total: {totalTantiemes} tantièmes
          </p>
        </div>
        {canWrite && (
          <Link href={condoPaths.lotsNew(condoId)}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un lot
            </Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} onRetry={() => setError(null)} />
        </div>
      )}

      {lots.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Aucun lot pour l&apos;instant</p>
          {canWrite && (
            <Link href={condoPaths.lotsNew(condoId)}>
              <Button variant="outline" className="mt-4">
                Créer le premier lot
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {lots.map((lot) => (
            <LotCard
              key={lot.id}
              lot={lot}
              totalTantiemes={totalTantiemes}
              coproprietaireName={getCoproprietaireName(lot.coproprietaireId)}
              onDelete={canWrite ? () => setDeleteTarget(lot) : undefined}
              isEditable={canWrite}
              condoId={condoId}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Supprimer le lot"
        description={`Êtes-vous sûr de vouloir supprimer le lot ${deleteTarget?.numero} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}
