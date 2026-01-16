'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { ConvocationDocument } from '@/components/assemblees-generales/ConvocationDocument';
import { PouvoirForm } from '@/components/assemblees-generales/PouvoirForm';
import { useCopropriete } from '@/lib/hooks/useCopropriete';
import { useAssembleeGenerale } from '@/hooks/useAssembleeGenerale';
import { useResolutions } from '@/hooks/useResolutions';
import { transitionAGStatus } from '@/lib/firebase/services/assemblee-generale';
import { useAuth } from '@/lib/hooks/useAuth';
import { useState } from 'react';

interface PageProps {
  params: Promise<{ agId: string }>;
}

export default function ConvocationPage({ params }: PageProps) {
  const { agId } = use(params);
  const { user } = useAuth();
  const { selectedCopro, loading: coproLoading } = useCopropriete();
  const { ag, loading: agLoading, error: agError } = useAssembleeGenerale(
    selectedCopro?.id ?? null,
    agId
  );
  const { resolutions, loading: resolutionsLoading, error: resolutionsError } = useResolutions(
    selectedCopro?.id ?? null,
    agId
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  if (coproLoading || agLoading || resolutionsLoading) {
    return <Loading message="Chargement de la convocation..." />;
  }

  if (!selectedCopro) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  if (agError || resolutionsError) {
    return <ErrorMessage message={(agError || resolutionsError)?.message ?? 'Erreur'} />;
  }

  if (!ag) {
    return <ErrorMessage message="Assemblée générale non trouvée" />;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleMarkAsSent = async () => {
    if (!user || ag.statut !== 'brouillon') return;

    setIsTransitioning(true);
    try {
      await transitionAGStatus(selectedCopro.id, agId, user.uid, user.email || '', 'convoquee');
    } catch (err) {
      console.error('Error transitioning AG status:', err);
    } finally {
      setIsTransitioning(false);
    }
  };

  const canMarkAsSent = ag.statut === 'brouillon';

  return (
    <div className="min-h-screen">
      {/* Actions bar - hidden on print */}
      <div className="no-print sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/assemblees-generales/${agId}` as '/assemblees-generales/[agId]'}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l&apos;AG
            </Link>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimer
              </Button>

              {canMarkAsSent && (
                <Button
                  onClick={handleMarkAsSent}
                  disabled={isTransitioning}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isTransitioning ? 'En cours...' : 'Marquer comme envoyée'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status info - hidden on print */}
      {ag.statut === 'convoquee' && (
        <div className="no-print container mx-auto max-w-4xl px-4 py-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
            Cette convocation a été marquée comme envoyée. L&apos;AG est maintenant convoquée.
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="py-8">
        <ConvocationDocument
          ag={ag}
          resolutions={resolutions}
          coproName={selectedCopro.nom}
          coproAddress={selectedCopro.adresse}
        />

        <PouvoirForm
          ag={ag}
          coproName={selectedCopro.nom}
        />
      </div>
    </div>
  );
}
