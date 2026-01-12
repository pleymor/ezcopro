'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import type { Resolution } from '@/types/assemblee-generale';
import { majoriteTypeLabels } from '@/lib/schemas/assemblee-generale';

interface VoteResultDisplayProps {
  resolution: Resolution;
  showSecondVoteOption?: boolean;
}

export function VoteResultDisplay({ resolution, showSecondVoteOption = true }: VoteResultDisplayProps) {
  const totalVotes = resolution.votePour + resolution.voteContre + resolution.voteAbstention;
  const isAdopted = resolution.resultat === 'adopte';
  // Can do second vote at Art.24 if Art.25 was used and got at least 1/3 of total votes
  const canSecondVote = resolution.typeMajorite === 'article_25' &&
    resolution.resultat === 'rejete' &&
    resolution.votePour >= totalVotes / 3;

  const pourPercent = totalVotes > 0 ? ((resolution.votePour / totalVotes) * 100).toFixed(1) : '0';
  const contrePercent = totalVotes > 0 ? ((resolution.voteContre / totalVotes) * 100).toFixed(1) : '0';
  const abstentionPercent = totalVotes > 0 ? ((resolution.voteAbstention / totalVotes) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Résultat du vote</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4 py-4">
            {isAdopted ? (
              <>
                <CheckCircle2 className="h-12 w-12 text-green-600" />
                <span className="text-2xl font-bold text-green-600">Adoptée</span>
              </>
            ) : (
              <>
                <XCircle className="h-12 w-12 text-red-600" />
                <span className="text-2xl font-bold text-red-600">Rejetée</span>
              </>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Majorité requise :</span>
              <span className="font-medium">{majoriteTypeLabels[resolution.typeMajorite]}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Pour</span>
                <span className="font-medium">{resolution.votePour} tantièmes ({pourPercent}%)</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${pourPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-red-600">Contre</span>
                <span className="font-medium">{resolution.voteContre} tantièmes ({contrePercent}%)</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                <div
                  className="h-full bg-red-500"
                  style={{ width: `${contrePercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Abstention</span>
                <span className="font-medium">{resolution.voteAbstention} tantièmes ({abstentionPercent}%)</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                <div
                  className="h-full bg-gray-400"
                  style={{ width: `${abstentionPercent}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showSecondVoteOption && canSecondVote && (
        <Alert>
          <ArrowRight className="h-4 w-4" />
          <AlertTitle>Second vote possible</AlertTitle>
          <AlertDescription>
            Cette résolution n&apos;a pas atteint la majorité absolue (Article 25), mais a recueilli
            au moins un tiers des voix. Elle peut être soumise immédiatement à un second vote
            à la majorité simple (Article 24).
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
