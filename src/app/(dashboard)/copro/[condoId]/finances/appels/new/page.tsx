'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { AppelForm } from '@/components/forms/AppelForm';
import { createAppelWithRepartitions } from '@/lib/firebase/services/appel';
import { subscribeToLots } from '@/lib/firebase/services/lot';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCondoFromUrl } from '@/lib/hooks/useCondoFromUrl';
import { condoPaths } from '@/lib/utils/condo-routes';
import { appelFormToInput, type AppelFormData } from '@/lib/schemas/appel';
import type { Lot } from '@/types/lot';
import { ArrowLeft } from 'lucide-react';

export default function NewAppelPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { condoId, currentCondo, loading: condoLoading } = useCondoFromUrl();
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!condoId) return;

    const unsubscribe = subscribeToLots(condoId, (updatedLots) => {
      setLots(updatedLots);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [condoId]);

  const handleSubmit = async (data: AppelFormData) => {
    if (!condoId || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const input = appelFormToInput(data);
      await createAppelWithRepartitions(condoId, user.uid, user.email || '', input, lots);
      router.push(condoPaths.finances(condoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrer les lots avec copropriétaire
  const lotsAvecCoproprietaire = lots.filter((l) => l.coproprietaireId);
  const totalTantiemes = lotsAvecCoproprietaire.reduce((sum, l) => sum + l.tantiemes, 0);

  if (condoLoading || loading) {
    return <Loading message="Chargement..." />;
  }

  if (!currentCondo || !condoId) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
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
          <CardTitle>Nouvel appel de fonds</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4">
              <ErrorMessage message={error} onRetry={() => setError(null)} />
            </div>
          )}

          <AppelForm
            lotsCount={lotsAvecCoproprietaire.length}
            totalTantiemes={totalTantiemes}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
