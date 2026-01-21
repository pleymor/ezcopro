'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { CleRepartitionForm } from '@/components/forms/CleRepartitionForm';
import { useClesRepartition } from '@/hooks/useClesRepartition';
import { useCondoFromUrl } from '@/lib/hooks/useCondoFromUrl';
import { condoPaths } from '@/lib/utils/condo-routes';
import { subscribeToLots } from '@/lib/firebase/services/lot';
import { subscribeToCoproprietaires } from '@/lib/firebase/services/coproprietaire';
import type { Lot } from '@/types/lot';
import type { Coproprietaire } from '@/types/coproprietaire';
import type { CleRepartitionFormData } from '@/lib/schemas/cle-repartition';

export default function NouvelleCleRepartitionPage() {
  const router = useRouter();
  const { condoId, currentCondo, loading: condoLoading } = useCondoFromUrl();
  const { createCle, checkNameExists, error: hookError } = useClesRepartition(
    condoId || ''
  );

  const [lots, setLots] = useState<Lot[]>([]);
  const [coproprietaires, setCoproprietaires] = useState<Coproprietaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (data: CleRepartitionFormData) => {
    if (!condoId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Check name uniqueness
      const nameExists = await checkNameExists(data.nom);
      if (nameExists) {
        setError('Une clé de répartition avec ce nom existe déjà');
        setIsSubmitting(false);
        return;
      }

      await createCle({
        nom: data.nom,
        description: data.description,
        quoteParts: data.quoteParts,
      });

      router.push(condoPaths.cleRepartition(condoId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors de la création'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (condoLoading || loading) {
    return <Loading message="Chargement..." />;
  }

  if (!currentCondo || !condoId) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link href={condoPaths.cleRepartition(condoId)}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Nouvelle clé de répartition</h1>
        <p className="text-sm text-muted-foreground">
          Créez une nouvelle clé pour répartir les charges entre les lots
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
          lots={lots}
          coproprietaires={coproprietaires}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
