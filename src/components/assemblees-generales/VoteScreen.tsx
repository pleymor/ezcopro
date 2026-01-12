'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VoteChoiceSelector } from './VoteChoiceSelector';
import { VoteResultDisplay } from './VoteResultDisplay';
import type { Resolution, Presence, Vote, VoteChoix } from '@/types/assemblee-generale';
import { majoriteTypeLabels } from '@/lib/schemas/assemblee-generale';
import { recordVote, finalizeResolutionVote } from '@/lib/firebase/services/vote';
import { useAuth } from '@/lib/hooks/useAuth';
import { Check } from 'lucide-react';

interface VoteScreenProps {
  resolution: Resolution;
  presences: Presence[];
  votes: Vote[];
  coproId: string;
  agId: string;
}

export function VoteScreen({
  resolution,
  presences,
  votes,
  coproId,
  agId,
}: VoteScreenProps) {
  const { user } = useAuth();
  const [localVotes, setLocalVotes] = useState<Record<string, VoteChoix>>(() => {
    const initial: Record<string, VoteChoix> = {};
    votes.forEach((v) => {
      initial[v.coproprietaireId] = v.choix;
    });
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Get copropriétaires who can vote (present or represented)
  const votingPresences = presences.filter(
    (p) => p.statut === 'present' || p.statut === 'represente'
  );

  const hasVoted = resolution.resultat !== 'non_vote';
  const allVoted = votingPresences.every((p) => localVotes[p.coproprietaireId]);

  const handleVoteChange = async (coproprietaireId: string, tantiemes: number, choice: VoteChoix, representeParId: string | null) => {
    if (!user || hasVoted) return;

    setLocalVotes((prev) => ({ ...prev, [coproprietaireId]: choice }));
    setIsSubmitting(true);

    try {
      await recordVote(
        coproId,
        agId,
        resolution.id,
        user.uid,
        { coproprietaireId, choix: choice },
        tantiemes,
        representeParId
      );
    } catch (err) {
      console.error('Error recording vote:', err);
      // Revert local state on error
      setLocalVotes((prev) => {
        const newState = { ...prev };
        delete newState[coproprietaireId];
        return newState;
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalize = async () => {
    if (!user || !allVoted) return;

    setIsFinalizing(true);
    try {
      await finalizeResolutionVote(coproId, agId, resolution.id, user.uid, resolution.typeMajorite);
    } catch (err) {
      console.error('Error finalizing vote:', err);
    } finally {
      setIsFinalizing(false);
    }
  };

  if (hasVoted) {
    return <VoteResultDisplay resolution={resolution} />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            #{resolution.numero} - {resolution.titre}
          </CardTitle>
          {resolution.description && (
            <p className="text-sm text-muted-foreground">{resolution.description}</p>
          )}
          <p className="text-sm font-medium text-primary">
            {majoriteTypeLabels[resolution.typeMajorite]}
          </p>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {votingPresences.map((presence) => {
          const currentVote = localVotes[presence.coproprietaireId];
          const hasThisVote = !!currentVote;

          return (
            <Card key={presence.id} className={hasThisVote ? 'border-green-200 dark:border-green-800' : ''}>
              <CardContent className="pt-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{presence.nom} {presence.prenom}</p>
                      <p className="text-sm text-muted-foreground">
                        {presence.tantiemes} tantièmes
                        {presence.statut === 'represente' && ' (représenté)'}
                      </p>
                    </div>
                    {hasThisVote && <Check className="h-5 w-5 text-green-600" />}
                  </div>
                  <VoteChoiceSelector
                    value={currentVote ?? null}
                    onChange={(choice) =>
                      handleVoteChange(presence.coproprietaireId, presence.tantiemes, choice, presence.representeParId ?? null)
                    }
                    disabled={isSubmitting || hasVoted}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-4">
        <p className="text-sm text-muted-foreground">
          {Object.keys(localVotes).length} / {votingPresences.length} votes enregistrés
        </p>
        <Button
          onClick={handleFinalize}
          disabled={!allVoted || isFinalizing}
          size="lg"
        >
          {isFinalizing ? 'Calcul en cours...' : 'Clôturer le vote'}
        </Button>
      </div>
    </div>
  );
}
