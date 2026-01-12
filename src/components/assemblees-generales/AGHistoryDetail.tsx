'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Users, FileText } from 'lucide-react';
import type { AssembleeGenerale, Resolution, Presence } from '@/types/assemblee-generale';
import { agTypeLabels, majoriteTypeLabels, resolutionResultatLabels } from '@/lib/schemas/assemblee-generale';

interface AGHistoryDetailProps {
  ag: AssembleeGenerale;
  resolutions: Resolution[];
  presences: Presence[];
}

export function AGHistoryDetail({ ag, resolutions, presences }: AGHistoryDetailProps) {
  const agDate = ag.date instanceof Date ? ag.date : new Date(ag.date.seconds * 1000);
  const sortedResolutions = [...resolutions].sort((a, b) => a.ordre - b.ordre);

  // Attendance stats
  const presents = presences.filter((p) => p.statut === 'present');
  const representes = presences.filter((p) => p.statut === 'represente');
  const absents = presences.filter((p) => p.statut === 'absent');

  const tantiemesPresents = presents.reduce((sum, p) => sum + p.tantiemes, 0);
  const tantiemesRepresentes = representes.reduce((sum, p) => sum + p.tantiemes, 0);

  // Resolution stats
  const votedResolutions = resolutions.filter((r) => r.resultat !== 'non_vote');
  const adoptedResolutions = resolutions.filter((r) => r.resultat === 'adopte');
  const rejectedResolutions = resolutions.filter((r) => r.resultat === 'rejete');

  return (
    <div className="space-y-6">
      {/* AG Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AG {agTypeLabels[ag.type]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium">{format(agDate, 'EEEE d MMMM yyyy', { locale: fr })}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Heure</p>
              <p className="font-medium">{ag.heure}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-muted-foreground">Lieu</p>
              <p className="font-medium">{ag.lieu}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Présences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{presents.length}</p>
              <p className="text-sm text-muted-foreground">Présents</p>
              <p className="text-xs text-muted-foreground">{tantiemesPresents} t.</p>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{representes.length}</p>
              <p className="text-sm text-muted-foreground">Représentés</p>
              <p className="text-xs text-muted-foreground">{tantiemesRepresentes} t.</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold text-muted-foreground">{absents.length}</p>
              <p className="text-sm text-muted-foreground">Absents</p>
            </div>
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Quorum : {tantiemesPresents + tantiemesRepresentes} tantièmes représentés sur {ag.totalTantiemes}
          </p>
        </CardContent>
      </Card>

      {/* Vote Results Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé des votes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold">{votedResolutions.length}</p>
              <p className="text-sm text-muted-foreground">Résolutions votées</p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{adoptedResolutions.length}</p>
              <p className="text-sm text-muted-foreground">Adoptées</p>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{rejectedResolutions.length}</p>
              <p className="text-sm text-muted-foreground">Rejetées</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resolutions List */}
      <Card>
        <CardHeader>
          <CardTitle>Résolutions</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedResolutions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Aucune résolution
            </p>
          ) : (
            <div className="space-y-4">
              {sortedResolutions.map((resolution) => {
                const isVoted = resolution.resultat !== 'non_vote';
                const isAdopted = resolution.resultat === 'adopte';

                return (
                  <div
                    key={resolution.id}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">
                          #{resolution.numero} - {resolution.titre}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {majoriteTypeLabels[resolution.typeMajorite]}
                        </p>
                      </div>
                      {isVoted && (
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
                            isAdopted
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          }`}
                        >
                          {isAdopted ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          {resolutionResultatLabels[resolution.resultat]}
                        </div>
                      )}
                    </div>

                    {resolution.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {resolution.description}
                      </p>
                    )}

                    {isVoted && (
                      <div className="grid grid-cols-3 gap-2 text-sm pt-2 border-t">
                        <div className="text-center">
                          <p className="text-green-600 font-medium">{resolution.votePour}</p>
                          <p className="text-xs text-muted-foreground">Pour</p>
                        </div>
                        <div className="text-center">
                          <p className="text-red-600 font-medium">{resolution.voteContre}</p>
                          <p className="text-xs text-muted-foreground">Contre</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground font-medium">{resolution.voteAbstention}</p>
                          <p className="text-xs text-muted-foreground">Abstention</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
