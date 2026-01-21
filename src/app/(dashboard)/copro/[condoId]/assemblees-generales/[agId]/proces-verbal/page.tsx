'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { PVDocument } from '@/components/assemblees-generales/PVDocument';
import { useCondoFromUrl } from '@/lib/hooks/useCondoFromUrl';
import { useAssembleeGenerale } from '@/hooks/useAssembleeGenerale';
import { useResolutions } from '@/hooks/useResolutions';
import { usePresences } from '@/hooks/usePresences';
import { transitionAGStatus } from '@/lib/firebase/services/assemblee-generale';
import { getOpposantsDefaillants } from '@/lib/firebase/services/vote';
import { useAuth } from '@/lib/hooks/useAuth';
import { condoPaths } from '@/lib/utils/condo-routes';

interface PersonInfo {
  nom: string;
  prenom: string;
  tantiemes: number;
}

interface PageProps {
  params: Promise<{ agId: string }>;
}

export default function ProcesVerbalPage({ params }: PageProps) {
  const { agId } = use(params);
  const { user } = useAuth();
  const { condoId, currentCondo, loading: condoLoading } = useCondoFromUrl();
  const { ag, loading: agLoading, error: agError } = useAssembleeGenerale(
    condoId,
    agId
  );
  const { resolutions, loading: resolutionsLoading, error: resolutionsError } = useResolutions(
    condoId,
    agId
  );
  const { presences, loading: presencesLoading, error: presencesError } = usePresences(
    condoId,
    agId
  );

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [opposantsPerResolution, setOpposantsPerResolution] = useState<Record<string, PersonInfo[]>>({});
  const [defaillants, setDefaillants] = useState<PersonInfo[]>([]);
  const [loadingOpposants, setLoadingOpposants] = useState(true);

  // Load opposants and defaillants for each voted resolution
  useEffect(() => {
    async function loadOpposantsDefaillants() {
      if (!condoId || !resolutions.length) {
        setLoadingOpposants(false);
        return;
      }

      const opposantsMap: Record<string, PersonInfo[]> = {};
      let allDefaillants: PersonInfo[] = [];

      for (const resolution of resolutions) {
        if (resolution.resultat !== 'non_vote') {
          try {
            const { opposants, defaillants: resDefaillants } = await getOpposantsDefaillants(
              condoId,
              agId,
              resolution.id
            );
            opposantsMap[resolution.id] = opposants;
            // Only set defaillants once (same for all resolutions)
            if (allDefaillants.length === 0) {
              allDefaillants = resDefaillants;
            }
          } catch (err) {
            console.error('Error loading opposants/defaillants:', err);
          }
        }
      }

      setOpposantsPerResolution(opposantsMap);
      setDefaillants(allDefaillants);
      setLoadingOpposants(false);
    }

    loadOpposantsDefaillants();
  }, [condoId, agId, resolutions]);

  if (condoLoading || agLoading || resolutionsLoading || presencesLoading || loadingOpposants) {
    return <Loading message="Chargement du procès-verbal..." />;
  }

  if (!currentCondo || !condoId) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  const error = agError || resolutionsError || presencesError;
  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  if (!ag) {
    return <ErrorMessage message="Assemblée générale non trouvée" />;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleFinalize = async () => {
    if (!user || ag.statut !== 'en_cours' || !condoId) return;

    setIsTransitioning(true);
    try {
      await transitionAGStatus(condoId, agId, user.uid, user.email || '', 'terminee');
    } catch (err) {
      console.error('Error finalizing AG:', err);
    } finally {
      setIsTransitioning(false);
    }
  };

  const canFinalize = ag.statut === 'en_cours';
  const allResolutionsVoted = resolutions.every((r) => r.resultat !== 'non_vote');

  return (
    <div className="min-h-screen">
      {/* Actions bar - hidden on print */}
      <div className="no-print sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={condoPaths.agDetail(condoId, agId)}
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

              {canFinalize && (
                <Button
                  onClick={handleFinalize}
                  disabled={isTransitioning || !allResolutionsVoted}
                  title={!allResolutionsVoted ? 'Toutes les résolutions doivent être votées' : ''}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {isTransitioning ? 'En cours...' : 'Clôturer l\'AG'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status info - hidden on print */}
      {ag.statut === 'terminee' && (
        <div className="no-print container mx-auto max-w-4xl px-4 py-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
            Cette assemblée générale est terminée. Le procès-verbal est définitif.
          </div>
        </div>
      )}

      {canFinalize && !allResolutionsVoted && (
        <div className="no-print container mx-auto max-w-4xl px-4 py-4">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
            Attention : Toutes les résolutions n&apos;ont pas été votées. Vous devez voter sur toutes les résolutions avant de pouvoir clôturer l&apos;AG.
          </div>
        </div>
      )}

      {/* Document */}
      <div className="py-8">
        <PVDocument
          ag={ag}
          resolutions={resolutions}
          presences={presences}
          coproName={currentCondo.nom}
          coproAddress={currentCondo.adresse}
          opposantsPerResolution={opposantsPerResolution}
          defaillants={defaillants}
        />
      </div>
    </div>
  );
}
