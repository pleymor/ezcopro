'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { LotForm } from '@/components/forms/LotForm';
import { getLot, getLots, updateLot } from '@/lib/firebase/services/lot';
import { getCoproprietaires } from '@/lib/firebase/services/coproprietaire';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCondoFromUrl } from '@/lib/hooks/useCondoFromUrl';
import { condoPaths } from '@/lib/utils/condo-routes';
import type { Lot, LotFormData } from '@/types/lot';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditLotPage() {
  const { user } = useAuth();
  const { condoId, currentCondo, loading: condoLoading } = useCondoFromUrl();
  const router = useRouter();
  const params = useParams();
  const lotId = params.id as string;

  const [lot, setLot] = useState<Lot | null>(null);
  const [coproprietaires, setCoproprietaires] = useState<
    Array<{ id: string; nom: string; prenom: string }>
  >([]);
  const [totalTantiemes, setTotalTantiemes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!condoId) return;

      try {
        const [lotData, cps, lots] = await Promise.all([
          getLot(condoId, lotId),
          getCoproprietaires(condoId),
          getLots(condoId),
        ]);

        if (!lotData) {
          setError('Lot non trouvé');
          return;
        }

        setLot(lotData);
        setCoproprietaires(cps.map((cp) => ({ id: cp.id, nom: cp.nom, prenom: cp.prenom })));
        // Exclure les tantièmes du lot actuel du total
        setTotalTantiemes(
          lots.filter((l) => l.id !== lotId).reduce((sum, l) => sum + l.tantiemes, 0)
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [condoId, lotId]);

  const handleSubmit = async (data: LotFormData) => {
    if (!condoId || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await updateLot(condoId, lotId, user.uid, user.email || '', {
        numero: data.numero,
        type: data.type,
        tantiemes: data.tantiemes,
        coproprietaireId: data.coproprietaireId,
        description: data.description || null,
      });
      router.push(condoPaths.lots(condoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (condoLoading || loading) {
    return <Loading message="Chargement du lot..." />;
  }

  if (!currentCondo || !condoId) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  if (!lot) {
    return <ErrorMessage message="Lot non trouvé" />;
  }

  return (
    <div className="container mx-auto max-w-xl px-4 py-8">
      <Link href={condoPaths.lots(condoId)}>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux lots
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Modifier le lot {lot.numero}</CardTitle>
          <CardDescription>Modifiez les informations du lot</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4">
              <ErrorMessage message={error} />
            </div>
          )}
          <LotForm
            initialData={lot}
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
