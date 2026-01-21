'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CleRepartitionDetail } from '@/components/cles-repartition/CleRepartitionDetail';
import { useClesRepartition } from '@/hooks/useClesRepartition';
import { useCondoFromUrl } from '@/lib/hooks/useCondoFromUrl';
import { condoPaths } from '@/lib/utils/condo-routes';
import { subscribeToLots } from '@/lib/firebase/services/lot';
import { subscribeToCoproprietaires } from '@/lib/firebase/services/coproprietaire';
import type { Lot } from '@/types/lot';
import type { Coproprietaire } from '@/types/coproprietaire';

export default function CleRepartitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cleId = params.id as string;

  const { condoId, currentCondo, loading: condoLoading } = useCondoFromUrl();
  const {
    cles,
    loading: clesLoading,
    error: hookError,
    deleteCle,
    checkIsInUse,
  } = useClesRepartition(condoId || '');

  const [lots, setLots] = useState<Lot[]>([]);
  const [coproprietaires, setCoproprietaires] = useState<Coproprietaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [canDelete, setCanDelete] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the current clé
  const cle = cles.find((c) => c.id === cleId);

  // Subscribe to lots and coproprietaires
  useEffect(() => {
    if (!condoId) return;

    let lotsLoaded = false;
    let cpLoaded = false;

    const checkComplete = () => {
      if (lotsLoaded && cpLoaded) {
        setLoading(false);
      }
    };

    const unsubscribeLots = subscribeToLots(condoId, (updatedLots) => {
      setLots(updatedLots);
      lotsLoaded = true;
      checkComplete();
    });

    const unsubscribeCp = subscribeToCoproprietaires(
      condoId,
      (updatedCp) => {
        setCoproprietaires(updatedCp);
        cpLoaded = true;
        checkComplete();
      }
    );

    return () => {
      unsubscribeLots();
      unsubscribeCp();
    };
  }, [condoId]);

  // Check if clé can be deleted
  useEffect(() => {
    const checkDeletable = async () => {
      if (cle && !cle.isDefault) {
        const inUse = await checkIsInUse(cleId);
        setCanDelete(!inUse);
      } else {
        setCanDelete(false);
      }
    };

    if (!clesLoading && cle) {
      checkDeletable();
    }
  }, [cleId, cle, clesLoading, checkIsInUse]);

  const handleDelete = async () => {
    if (!cle || !condoId) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteCle(cleId);
      router.push(condoPaths.cleRepartition(condoId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors de la suppression'
      );
      setIsDeleting(false);
    }
  };

  if (condoLoading || clesLoading || loading) {
    return <Loading message="Chargement..." />;
  }

  if (!currentCondo || !condoId) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  if (!cle) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <ErrorMessage message="Clé de répartition introuvable" />
        <div className="mt-4">
          <Link href={condoPaths.cleRepartition(condoId)}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link href={condoPaths.cleRepartition(condoId)}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </Link>
      </div>

      {(error || hookError) && (
        <div className="mb-4">
          <ErrorMessage
            message={error || hookError?.message || 'Une erreur est survenue'}
            onRetry={() => setError(null)}
          />
        </div>
      )}

      <CleRepartitionDetail
        cle={cle}
        lots={lots}
        coproprietaires={coproprietaires}
        onDelete={() => setShowDeleteConfirm(true)}
        isDeleting={isDeleting}
        canDelete={canDelete}
        condoId={condoId}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Supprimer la clé de répartition"
        description={`Êtes-vous sûr de vouloir supprimer la clé "${cle.nom}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}
