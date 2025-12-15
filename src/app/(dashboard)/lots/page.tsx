'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { LotCard } from '@/components/lots/LotCard';
import { subscribeToLots, deleteLot } from '@/lib/firebase/services/lot';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCopropriete } from '@/lib/hooks/useCopropriete';
import type { Lot } from '@/types/lot';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function LotsPage() {
  const { user } = useAuth();
  const { selectedCopro, loading: coproLoading } = useCopropriete();
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!selectedCopro) return;

    const unsubscribe = subscribeToLots(selectedCopro.id, (updatedLots) => {
      setLots(updatedLots);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedCopro]);

  const handleDelete = async () => {
    if (!deleteTarget || !selectedCopro || !user) return;

    setIsDeleting(true);
    try {
      await deleteLot(selectedCopro.id, deleteTarget.id, user.uid);
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalTantiemes = lots.reduce((sum, lot) => sum + lot.tantiemes, 0);

  if (coproLoading || loading) {
    return <Loading message="Chargement des lots..." />;
  }

  if (!selectedCopro) {
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
        <Link href="/lots/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un lot
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} onRetry={() => setError(null)} />
        </div>
      )}

      {lots.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Aucun lot pour l&apos;instant</p>
          <Link href="/lots/new">
            <Button variant="outline" className="mt-4">
              Créer le premier lot
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {lots.map((lot) => (
            <LotCard
              key={lot.id}
              lot={lot}
              totalTantiemes={totalTantiemes}
              onDelete={() => setDeleteTarget(lot)}
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
