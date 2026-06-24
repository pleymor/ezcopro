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
import { useCondo } from '@/lib/hooks/useCondo';
import type { Lot } from '@/types/lot';
import type { Coproprietaire } from '@/types/coproprietaire';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function LotsPage() {
  const { user } = useAuth();
  const { selectedCondo, loading: condoLoading } = useCondo();
  const coproId = selectedCondo?.id ?? null;

  // Permissions basées sur le modèle condos
  const canWrite = useMemo(() => {
    if (!user || !selectedCondo) return false;
    if (selectedCondo.ownerId === user.uid) return true;
    return selectedCondo.boardMemberIds?.includes(user.uid) ?? false;
  }, [user, selectedCondo]);
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
    if (!coproId) {
      // No condo selected: resolve the loading state so the
      // "Aucune copropriété sélectionnée" guard can render instead
      // of hanging forever on "Chargement des lots...".
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubLots = subscribeToLots(coproId, (updatedLots) => {
      setLots(updatedLots);
      setLoading(false);
    });

    const unsubCopros = subscribeToCoproprietaires(coproId, (updatedCopros) => {
      setCoproprietaires(updatedCopros);
    });

    return () => {
      unsubLots();
      unsubCopros();
    };
  }, [coproId]);

  const handleDelete = async () => {
    if (!deleteTarget || !selectedCondo || !user) return;

    setIsDeleting(true);
    try {
      await deleteLot(selectedCondo.id, deleteTarget.id, user.uid, user.email || '');
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
          <h1 className="text-2xl font-bold">Lots</h1>
          <p className="text-sm text-muted-foreground">
            {lots.length} lot{lots.length > 1 ? 's' : ''} - Total: {totalTantiemes} tantièmes
          </p>
        </div>
        {canWrite && (
          <Link href="/lots/new">
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
            <Link href="/lots/new">
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
              condoId={selectedCondo.id}
              lot={lot}
              totalTantiemes={totalTantiemes}
              coproprietaireName={getCoproprietaireName(lot.coproprietaireId)}
              onDelete={canWrite ? () => setDeleteTarget(lot) : undefined}
              isEditable={canWrite}
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
