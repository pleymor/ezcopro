'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { VoteScreen } from '@/components/assemblees-generales/VoteScreen';
import { useCondoFromUrl } from '@/lib/hooks/useCondoFromUrl';
import { useAssembleeGenerale } from '@/hooks/useAssembleeGenerale';
import { useResolutions } from '@/hooks/useResolutions';
import { usePresences } from '@/hooks/usePresences';
import { useVotes } from '@/hooks/useVotes';
import { condoPaths } from '@/lib/utils/condo-routes';

interface PageProps {
  params: Promise<{ agId: string; resolutionId: string }>;
}

export default function ResolutionVotePage({ params }: PageProps) {
  const { agId, resolutionId } = use(params);
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
  const { votes, loading: votesLoading, error: votesError } = useVotes(
    condoId,
    agId,
    resolutionId
  );

  if (condoLoading || agLoading || resolutionsLoading || presencesLoading || votesLoading) {
    return <Loading message="Chargement du vote..." />;
  }

  if (!currentCondo || !condoId) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  const error = agError || resolutionsError || presencesError || votesError;
  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  if (!ag) {
    return <ErrorMessage message="Assemblée générale non trouvée" />;
  }

  const sortedResolutions = [...resolutions].sort((a, b) => a.ordre - b.ordre);
  const resolution = sortedResolutions.find((r) => r.id === resolutionId);

  if (!resolution) {
    return <ErrorMessage message="Résolution non trouvée" />;
  }

  const currentIndex = sortedResolutions.findIndex((r) => r.id === resolutionId);
  const prevResolution = currentIndex > 0 ? sortedResolutions[currentIndex - 1] : null;
  const nextResolution = currentIndex < sortedResolutions.length - 1 ? sortedResolutions[currentIndex + 1] : null;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={condoPaths.agVotes(condoId, agId)}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux votes
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          Résolution {resolution.numero} / {sortedResolutions.length}
        </h1>
        <div className="flex gap-2">
          {prevResolution && (
            <Link href={condoPaths.agVote(condoId, agId, prevResolution.id)}>
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
            </Link>
          )}
          {nextResolution && (
            <Link href={condoPaths.agVote(condoId, agId, nextResolution.id)}>
              <Button variant="outline" size="sm">
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      <VoteScreen
        resolution={resolution}
        presences={presences}
        votes={votes}
        coproId={condoId}
        agId={agId}
      />
    </div>
  );
}
