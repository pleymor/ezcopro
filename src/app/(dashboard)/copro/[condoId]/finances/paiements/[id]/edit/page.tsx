'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PaiementForm } from '@/components/forms/PaiementForm';
import { getPaiement, updatePaiement, deletePaiement } from '@/lib/firebase/services/paiement';
import { subscribeToCoproprietaires } from '@/lib/firebase/services/coproprietaire';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCondoFromUrl } from '@/lib/hooks/useCondoFromUrl';
import { condoPaths } from '@/lib/utils/condo-routes';
import { paiementFormToInput, type PaiementFormData } from '@/lib/schemas/paiement';
import type { Paiement } from '@/types/paiement';
import type { Coproprietaire } from '@/types/coproprietaire';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function EditPaiementPage() {
  const params = useParams();
  const router = useRouter();
  const paiementId = params.id as string;
  const { user } = useAuth();
  const { condoId, currentCondo, loading: condoLoading } = useCondoFromUrl();
  const [paiement, setPaiement] = useState<Paiement | null>(null);
  const [coproprietaires, setCoproprietaires] = useState<Coproprietaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!condoId) return;

    const loadData = async () => {
      try {
        const paiementData = await getPaiement(condoId, paiementId);
        if (!paiementData) {
          setError('Paiement non trouvé');
          return;
        }
        setPaiement(paiementData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const unsubscribe = subscribeToCoproprietaires(condoId, setCoproprietaires);

    return () => unsubscribe();
  }, [condoId, paiementId]);

  const handleSubmit = async (data: PaiementFormData) => {
    if (!condoId || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const input = paiementFormToInput(data);
      await updatePaiement(condoId, paiementId, user.uid, user.email || '', input);
      router.push(condoPaths.finances(condoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!condoId || !user) return;

    setIsDeleting(true);
    try {
      await deletePaiement(condoId, paiementId, user.uid, user.email || '');
      router.push(condoPaths.finances(condoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  if (condoLoading || loading) {
    return <Loading message="Chargement du paiement..." />;
  }

  if (!currentCondo || !condoId) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  if (!paiement) {
    return <ErrorMessage message={error || 'Paiement non trouvé'} />;
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <div className="mb-6">
        <Link href={condoPaths.finances(condoId)}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux finances
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Modifier le paiement</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4">
              <ErrorMessage message={error} onRetry={() => setError(null)} />
            </div>
          )}

          <PaiementForm
            initialData={paiement}
            coproprietaires={coproprietaires}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Supprimer le paiement"
        description="Êtes-vous sûr de vouloir supprimer ce paiement ? Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}
