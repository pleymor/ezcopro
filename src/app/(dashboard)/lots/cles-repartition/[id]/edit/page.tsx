'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { CleRepartitionForm } from '@/components/forms/CleRepartitionForm';
import { useClesRepartition } from '@/hooks/useClesRepartition';
import { useCopropriete } from '@/lib/hooks/useCopropriete';
import { subscribeToLots } from '@/lib/firebase/services/lot';
import { subscribeToCoproprietaires } from '@/lib/firebase/services/coproprietaire';
import type { Lot } from '@/types/lot';
import type { Coproprietaire } from '@/types/coproprietaire';
import type { CleRepartitionFormData } from '@/lib/schemas/cle-repartition';

export default function EditCleRepartitionPage() {
  const params = useParams();
  const router = useRouter();
  const cleId = params.id as string;

  const { selectedCopro, loading: coproLoading } = useCopropriete();
  const {
    cles,
    loading: clesLoading,
    error: hookError,
    updateCle,
    checkNameExists,
  } = useClesRepartition(selectedCopro?.id || '');

  const [lots, setLots] = useState<Lot[]>([]);
  const [coproprietaires, setCoproprietaires] = useState<Coproprietaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the current clé
  const cle = cles.find((c) => c.id === cleId);

  // Subscribe to lots and coproprietaires
  useEffect(() => {
    if (!selectedCopro) return;

    let lotsLoaded = false;
    let cpLoaded = false;

    const checkComplete = () => {
      if (lotsLoaded && cpLoaded) {
        setLoading(false);
      }
    };

    const unsubscribeLots = subscribeToLots(selectedCopro.id, (updatedLots) => {
      setLots(updatedLots);
      lotsLoaded = true;
      checkComplete();
    });

    const unsubscribeCp = subscribeToCoproprietaires(
      selectedCopro.id,
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
  }, [selectedCopro]);

  const handleSubmit = async (data: CleRepartitionFormData) => {
    if (!selectedCopro || !cle) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Check name uniqueness if name changed
      if (data.nom !== cle.nom) {
        const nameExists = await checkNameExists(data.nom, cleId);
        if (nameExists) {
          setError('Une clé de répartition avec ce nom existe déjà');
          setIsSubmitting(false);
          return;
        }
      }

      await updateCle(cleId, {
        nom: data.nom,
        description: data.description ?? null,
        quoteParts: data.quoteParts,
      });

      router.push(`/lots/cles-repartition/${cleId}` as Route);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (coproLoading || clesLoading || loading) {
    return <Loading message="Chargement..." />;
  }

  if (!selectedCopro) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  if (!cle) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <ErrorMessage message="Clé de répartition introuvable" />
        <div className="mt-4">
          <Link href={'/lots/cles-repartition' as Route}>
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
        <Link href={`/lots/cles-repartition/${cleId}` as Route}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Modifier la clé de répartition</h1>
        <p className="text-sm text-muted-foreground">
          Modifiez les informations et les quotes-parts de cette clé
        </p>
      </div>

      {(error || hookError) && (
        <div className="mb-4">
          <ErrorMessage
            message={error || hookError?.message || 'Une erreur est survenue'}
            onRetry={() => setError(null)}
          />
        </div>
      )}

      <div className="rounded-lg border bg-card p-6">
        <CleRepartitionForm
          initialData={cle}
          lots={lots}
          coproprietaires={coproprietaires}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
