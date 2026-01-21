'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { AGForm } from '@/components/assemblees-generales/AGForm';
import { useCondoFromUrl } from '@/lib/hooks/useCondoFromUrl';
import { useTantiemesTotal } from '@/lib/hooks/useTantiemesTotal';
import { condoPaths } from '@/lib/utils/condo-routes';

export default function NouvelleAGPage() {
  const router = useRouter();
  const { condoId, currentCondo, loading: condoLoading } = useCondoFromUrl();
  const { totalTantiemes, loading: tantiemesLoading } = useTantiemesTotal();

  if (condoLoading || tantiemesLoading) {
    return <Loading message="Chargement..." />;
  }

  if (!currentCondo || !condoId) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  if (totalTantiemes === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <ErrorMessage message="Vous devez d'abord créer des lots avec des tantièmes pour organiser une AG." />
        <div className="mt-4 text-center">
          <Link href={condoPaths.lots(condoId)}>
            <Button variant="outline">Gérer les lots</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={condoPaths.assembleesGenerales(condoId)}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux AG
        </Link>
      </div>

      <AGForm
        coproId={condoId}
        totalTantiemes={totalTantiemes}
        onSuccess={(agId) => router.push(condoPaths.agDetail(condoId, agId))}
        onCancel={() => router.push(condoPaths.assembleesGenerales(condoId))}
      />
    </div>
  );
}
