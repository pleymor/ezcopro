'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PresenceStatusToggle } from './PresenceStatusToggle';
import { RepresentativeSelector } from './RepresentativeSelector';
import type { Presence, PresenceStatus } from '@/types/assemblee-generale';
import { updatePresence } from '@/lib/firebase/services/presence';
import { useAuth } from '@/lib/hooks/useAuth';

interface PresenceSheetProps {
  presences: Presence[];
  coproId: string;
  agId: string;
  disabled?: boolean;
}

export function PresenceSheet({ presences, coproId, agId, disabled = false }: PresenceSheetProps) {
  const { user } = useAuth();
  const [updating, setUpdating] = useState<string | null>(null);

  const sortedPresences = [...presences].sort((a, b) =>
    `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`)
  );

  const handleStatusChange = async (presenceId: string, status: PresenceStatus) => {
    if (!user || disabled) return;

    setUpdating(presenceId);
    try {
      await updatePresence(coproId, agId, presenceId, user.uid, {
        statut: status,
        // Clear representative if changing away from represente
        representeParId: status === 'represente' ? undefined : null,
      });
    } catch (err) {
      console.error('Error updating presence:', err);
    } finally {
      setUpdating(null);
    }
  };

  const handleRepresentativeChange = async (presenceId: string, representeParId: string | null) => {
    if (!user || disabled) return;

    setUpdating(presenceId);
    try {
      await updatePresence(coproId, agId, presenceId, user.uid, {
        representeParId,
      });
    } catch (err) {
      console.error('Error updating representative:', err);
    } finally {
      setUpdating(null);
    }
  };

  if (presences.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Aucun copropriétaire à afficher. Initialisez la feuille de présence.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {sortedPresences.map((presence) => (
        <Card
          key={presence.id}
          className={`transition-opacity ${updating === presence.id ? 'opacity-50' : ''}`}
        >
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <CardTitle className="text-base">{presence.nom} {presence.prenom}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">{presence.tantiemes} tantièmes</span>
                </p>
              </div>
              <PresenceStatusToggle
                value={presence.statut}
                onChange={(status) => handleStatusChange(presence.id, status)}
                disabled={disabled || updating === presence.id}
              />
            </div>
          </CardHeader>

          {presence.statut === 'represente' && (
            <CardContent className="pt-0">
              <div className="max-w-xs">
                <label className="text-sm text-muted-foreground mb-1 block">
                  Représenté par :
                </label>
                <RepresentativeSelector
                  value={presence.representeParId}
                  onChange={(representeParId) => handleRepresentativeChange(presence.id, representeParId)}
                  presences={presences}
                  currentPresenceId={presence.id}
                  disabled={disabled || updating === presence.id}
                />
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
