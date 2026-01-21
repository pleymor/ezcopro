'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { PaiementForm } from '@/components/forms/PaiementForm';
import { createPaiement } from '@/lib/firebase/services/paiement';
import { subscribeToCoproprietaires } from '@/lib/firebase/services/coproprietaire';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCondoFromUrl } from '@/lib/hooks/useCondoFromUrl';
import { condoPaths } from '@/lib/utils/condo-routes';
import { paiementFormToInput, type PaiementFormData } from '@/lib/schemas/paiement';
import type { Coproprietaire } from '@/types/coproprietaire';
import { ArrowLeft } from 'lucide-react';

export default function NewPaiementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { condoId, currentCondo, loading: condoLoading } = useCondoFromUrl();
  const [coproprietaires, setCoproprietaires] = useState<Coproprietaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!condoId) return;

    const unsubscribe = subscribeToCoproprietaires(condoId, (updated) => {
      setCoproprietaires(updated);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [condoId]);

  const handleSubmit = async (data: PaiementFormData) => {
    if (!condoId || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const input = paiementFormToInput(data);
      await createPaiement(condoId, user.uid, user.email || '', input);
      router.push(condoPaths.finances(condoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
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
          <CardTitle>Enregistrer un paiement</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4">
              <ErrorMessage message={error} onRetry={() => setError(null)} />
            </div>
          )}

          <PaiementForm
            coproprietaires={coproprietaires}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
