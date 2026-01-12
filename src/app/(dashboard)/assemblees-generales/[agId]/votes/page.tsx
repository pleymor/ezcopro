'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { useCopropriete } from '@/lib/hooks/useCopropriete';
import { useAssembleeGenerale } from '@/hooks/useAssembleeGenerale';
import { useResolutions } from '@/hooks/useResolutions';
import { majoriteTypeLabels, resolutionResultatLabels } from '@/lib/schemas/assemblee-generale';

interface PageProps {
  params: Promise<{ agId: string }>;
}

export default function VotesPage({ params }: PageProps) {
  const { agId } = use(params);
  const { selectedCopro, loading: coproLoading } = useCopropriete();
  const { ag, loading: agLoading, error: agError } = useAssembleeGenerale(
    selectedCopro?.id ?? null,
    agId
  );
  const { resolutions, loading: resolutionsLoading, error: resolutionsError } = useResolutions(
    selectedCopro?.id ?? null,
    agId
  );

  if (coproLoading || agLoading || resolutionsLoading) {
    return <Loading message="Chargement des votes..." />;
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

  const sortedResolutions = [...resolutions].sort((a, b) => a.ordre - b.ordre);

  const getStatusIcon = (resultat: string) => {
    switch (resultat) {
      case 'adopte':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'rejete':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/assemblees-generales/${agId}` as '/assemblees-generales/[agId]'}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l&apos;AG
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Votes</h1>
        <p className="text-sm text-muted-foreground">
          {resolutions.filter((r) => r.resultat !== 'non_vote').length} / {resolutions.length} résolution{resolutions.length > 1 ? 's' : ''} votée{resolutions.length > 1 ? 's' : ''}
        </p>
      </div>

      {ag.statut !== 'en_cours' && ag.statut !== 'terminee' && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
          L&apos;AG doit être démarrée pour procéder aux votes.
        </div>
      )}

      {resolutions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucune résolution à voter. Ajoutez des résolutions à l&apos;ordre du jour.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sortedResolutions.map((resolution) => (
            <Link
              key={resolution.id}
              href={`/assemblees-generales/${agId}/votes/${resolution.id}` as '/assemblees-generales/[agId]/votes/[resolutionId]'}
            >
              <Card className="hover:bg-accent/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(resolution.resultat)}
                      <div>
                        <CardTitle className="text-base">
                          #{resolution.numero} - {resolution.titre}
                        </CardTitle>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {majoriteTypeLabels[resolution.typeMajorite]}
                          </span>
                          <span className={`text-xs ${
                            resolution.resultat === 'adopte' ? 'text-green-600' :
                            resolution.resultat === 'rejete' ? 'text-red-600' :
                            'text-muted-foreground'
                          }`}>
                            {resolutionResultatLabels[resolution.resultat]}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
