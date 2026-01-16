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
import { useCopropriete } from '@/lib/hooks/useCopropriete';
import { paiementFormToInput, type PaiementFormData } from '@/lib/schemas/paiement';
import type { Coproprietaire } from '@/types/coproprietaire';
import { ArrowLeft } from 'lucide-react';

export default function NewPaiementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedCopro, loading: coproLoading } = useCopropriete();
  const [coproprietaires, setCoproprietaires] = useState<Coproprietaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCopro) return;

    const unsubscribe = subscribeToCoproprietaires(selectedCopro.id, (updated) => {
      setCoproprietaires(updated);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedCopro]);

  const handleSubmit = async (data: PaiementFormData) => {
    if (!selectedCopro || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const input = paiementFormToInput(data);
      await createPaiement(selectedCopro.id, user.uid, user.email || '', input);
      router.push('/finances');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (coproLoading || loading) {
    return <Loading message="Chargement..." />;
  }

  if (!selectedCopro) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <div className="mb-6">
        <Link href="/finances">
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
