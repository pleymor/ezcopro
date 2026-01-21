'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Clock, FileText, Users, Vote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { AGStatusBadge } from '@/components/assemblees-generales/AGStatusBadge';
import { useCondoFromUrl } from '@/lib/hooks/useCondoFromUrl';
import { useAssembleeGenerale } from '@/hooks/useAssembleeGenerale';
import { condoPaths } from '@/lib/utils/condo-routes';

const AG_TYPE_LABELS = {
  ordinaire: 'Assemblée Générale Ordinaire',
  extraordinaire: 'Assemblée Générale Extraordinaire',
  mixte: 'Assemblée Générale Mixte',
} as const;

type FirestoreTimestamp = { seconds: number; nanoseconds: number };

function formatDate(date: FirestoreTimestamp | Date): string {
  const d = date instanceof Date ? date : new Date(date.seconds * 1000);
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface PageProps {
  params: Promise<{ agId: string }>;
}

export default function AGDetailPage({ params }: PageProps) {
  const { agId } = use(params);
  const { condoId, currentCondo, loading: condoLoading } = useCondoFromUrl();
  const { ag, loading: agLoading, error } = useAssembleeGenerale(
    condoId,
    agId
  );

  if (condoLoading || agLoading) {
    return <Loading message="Chargement de l'AG..." />;
  }

  if (!currentCondo || !condoId) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  if (!ag) {
    return <ErrorMessage message="Assemblée générale non trouvée" />;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={condoPaths.assembleesGenerales(condoId)}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux AG
        </Link>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{AG_TYPE_LABELS[ag.type]}</h1>
          <p className="text-muted-foreground">{formatDate(ag.date)}</p>
        </div>
        <AGStatusBadge status={ag.statut} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{formatDate(ag.date)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Heure</p>
                <p className="font-medium">{ag.heure}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Lieu</p>
                <p className="font-medium">{ag.lieu}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Ordre du jour
            </CardTitle>
            <CardDescription>Gérer les résolutions de l&apos;AG</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={condoPaths.agOrdreDuJour(condoId, agId)}>
              <Button className="w-full">Voir l&apos;ordre du jour</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Feuille de présence
            </CardTitle>
            <CardDescription>Gérer les présences et procurations</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={condoPaths.agPresence(condoId, agId)}>
              <Button className="w-full" variant="outline">
                Gérer les présences
              </Button>
            </Link>
          </CardContent>
        </Card>

        {ag.statut === 'en_cours' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Vote className="h-5 w-5" />
                Votes
              </CardTitle>
              <CardDescription>Enregistrer les votes sur les résolutions</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={condoPaths.agVotes(condoId, agId)}>
                <Button className="w-full" variant="outline">
                  Gérer les votes
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
