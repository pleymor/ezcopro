'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { CoproprietaireForm } from '@/components/forms/CoproprietaireForm';
import {
  getCoproprietaire,
  updateCoproprietaire,
} from '@/lib/firebase/services/coproprietaire';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCopropriete } from '@/lib/hooks/useCopropriete';
import type { Coproprietaire, CoproprietaireFormData } from '@/types/coproprietaire';
import { ArrowLeft } from 'lucide-react';

export default function EditCoproprietairePage() {
  const { user } = useAuth();
  const { selectedCopro, loading: coproLoading } = useCopropriete();
  const router = useRouter();
  const params = useParams();
  const coproprietaireId = params.id as string;

  const [coproprietaire, setCoproprietaire] = useState<Coproprietaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedCopro) return;

      try {
        const cp = await getCoproprietaire(selectedCopro.id, coproprietaireId);
        if (!cp) {
          setError('Copropriétaire non trouvé');
          return;
        }
        setCoproprietaire(cp);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCopro, coproprietaireId]);

  const handleSubmit = async (data: CoproprietaireFormData) => {
    if (!selectedCopro || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await updateCoproprietaire(selectedCopro.id, coproprietaireId, user.uid, user.email || '', {
        nom: data.nom,
        prenom: data.prenom || '',
        email: data.email || null,
        telephone: data.telephone || null,
      });
      router.push('/coproprietaires');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
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

  if (!coproprietaire) {
    return <ErrorMessage message="Copropriétaire non trouvé" />;
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
          <CardTitle>
            Modifier {coproprietaire.nom} {coproprietaire.prenom}
          </CardTitle>
          <CardDescription>Modifiez les informations du copropriétaire</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4">
              <ErrorMessage message={error} />
            </div>
          )}
          <CoproprietaireForm
            initialData={coproprietaire}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
