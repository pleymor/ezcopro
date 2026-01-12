'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { VoteScreen } from '@/components/assemblees-generales/VoteScreen';
import { useCopropriete } from '@/lib/hooks/useCopropriete';
import { useAssembleeGenerale } from '@/hooks/useAssembleeGenerale';
import { useResolutions } from '@/hooks/useResolutions';
import { usePresences } from '@/hooks/usePresences';
import { useVotes } from '@/hooks/useVotes';

interface PageProps {
  params: Promise<{ agId: string; resolutionId: string }>;
}

export default function ResolutionVotePage({ params }: PageProps) {
  const { agId, resolutionId } = use(params);
  const { selectedCopro, loading: coproLoading } = useCopropriete();
  const { ag, loading: agLoading, error: agError } = useAssembleeGenerale(
    selectedCopro?.id ?? null,
    agId
  );
  const { resolutions, loading: resolutionsLoading, error: resolutionsError } = useResolutions(
    selectedCopro?.id ?? null,
    agId
  );
  const { presences, loading: presencesLoading, error: presencesError } = usePresences(
    selectedCopro?.id ?? null,
    agId
  );
  const { votes, loading: votesLoading, error: votesError } = useVotes(
    selectedCopro?.id ?? null,
    agId,
    resolutionId
  );

  if (coproLoading || agLoading || resolutionsLoading || presencesLoading || votesLoading) {
    return <Loading message="Chargement du vote..." />;
  }

  if (!selectedCopro) {
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
          href={`/assemblees-generales/${agId}/votes` as '/assemblees-generales/[agId]/votes'}
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
            <Link href={`/assemblees-generales/${agId}/votes/${prevResolution.id}` as '/assemblees-generales/[agId]/votes/[resolutionId]'}>
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
            </Link>
          )}
          {nextResolution && (
            <Link href={`/assemblees-generales/${agId}/votes/${nextResolution.id}` as '/assemblees-generales/[agId]/votes/[resolutionId]'}>
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
        coproId={selectedCopro.id}
        agId={agId}
      />
    </div>
  );
}
