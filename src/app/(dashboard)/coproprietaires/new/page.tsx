'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { CoproprietaireForm } from '@/components/forms/CoproprietaireForm';
import { createCoproprietaire } from '@/lib/firebase/services/coproprietaire';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCopropriete } from '@/lib/hooks/useCopropriete';
import type { CoproprietaireFormData } from '@/types/coproprietaire';
import { ArrowLeft } from 'lucide-react';

export default function NewCoproprietairePage() {
  const { user } = useAuth();
  const { selectedCopro, loading: coproLoading } = useCopropriete();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CoproprietaireFormData) => {
    if (!selectedCopro || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await createCoproprietaire(selectedCopro.id, user.uid, {
        nom: data.nom,
        prenom: data.prenom || '',
        email: data.email || undefined,
        telephone: data.telephone || undefined,
      });
      router.push('/coproprietaires');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (coproLoading) {
    return <Loading />;
  }

  if (!selectedCopro) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  return (
    <div className="container mx-auto max-w-xl px-4 py-8">
      <Link href="/coproprietaires">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Nouveau copropriétaire</CardTitle>
          <CardDescription>Ajoutez un copropriétaire à la copropriété</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4">
              <ErrorMessage message={error} />
            </div>
          )}
          <CoproprietaireForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}
