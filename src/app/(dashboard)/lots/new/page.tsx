'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { LotForm } from '@/components/forms/LotForm';
import { createLot, getLots } from '@/lib/firebase/services/lot';
import { getCoproprietaires } from '@/lib/firebase/services/coproprietaire';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCopropriete } from '@/lib/hooks/useCopropriete';
import type { LotFormData } from '@/types/lot';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewLotPage() {
  const { user } = useAuth();
  const { selectedCopro, loading: coproLoading } = useCopropriete();
  const router = useRouter();
  const [coproprietaires, setCoproprietaires] = useState<
    Array<{ id: string; nom: string; prenom: string }>
  >([]);
  const [totalTantiemes, setTotalTantiemes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedCopro) return;

      try {
        const [cps, lots] = await Promise.all([
          getCoproprietaires(selectedCopro.id),
          getLots(selectedCopro.id),
        ]);
        setCoproprietaires(cps.map((cp) => ({ id: cp.id, nom: cp.nom, prenom: cp.prenom })));
        setTotalTantiemes(lots.reduce((sum, lot) => sum + lot.tantiemes, 0));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCopro]);

  const handleSubmit = async (data: LotFormData) => {
    if (!selectedCopro || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await createLot(selectedCopro.id, user.uid, {
        numero: data.numero,
        type: data.type,
        tantiemes: data.tantiemes,
        coproprietaireId: data.coproprietaireId,
        description: data.description,
      });
      router.push('/lots');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
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
    <div className="container mx-auto max-w-xl px-4 py-8">
      <Link href="/lots">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux lots
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Nouveau lot</CardTitle>
          <CardDescription>Créez un nouveau lot dans la copropriété</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4">
              <ErrorMessage message={error} />
            </div>
          )}
          <LotForm
            coproprietaires={coproprietaires}
            totalTantiemes={totalTantiemes}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
