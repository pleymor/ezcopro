'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import type { Presence } from '@/types/assemblee-generale';

interface RepresentativeSelectorProps {
  value: string | null;
  onChange: (representantId: string | null) => void;
  presences: Presence[];
  currentPresenceId: string;
  disabled?: boolean;
}

const MAX_REPRESENTATIONS = 3;

export function RepresentativeSelector({
  value,
  onChange,
  presences,
  currentPresenceId,
  disabled = false,
}: RepresentativeSelectorProps) {
  // Get copropriétaires présents who can be representatives
  const availableRepresentatives = presences.filter((p) => {
    // Can't represent themselves
    if (p.id === currentPresenceId) return false;
    // Must be present (not represented themselves)
    if (p.statut !== 'present') return false;
    return true;
  });

  // Count how many people each présent is representing
  const representationCounts: Record<string, number> = {};
  presences.forEach((p) => {
    if (p.representeParId && p.statut === 'represente') {
      representationCounts[p.representeParId] = (representationCounts[p.representeParId] || 0) + 1;
    }
  });

  // Check if selected representative is at limit
  const selectedRepCount = value ? (representationCounts[value] || 0) : 0;
  const isAtLimit = selectedRepCount >= MAX_REPRESENTATIONS;

  return (
    <div className="space-y-2">
      <Select
        value={value ?? ''}
        onValueChange={(val) => onChange(val || null)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choisir un représentant" />
        </SelectTrigger>
        <SelectContent>
          {availableRepresentatives.length === 0 ? (
            <div className="py-2 px-3 text-sm text-muted-foreground">
              Aucun copropriétaire présent disponible
            </div>
          ) : (
            availableRepresentatives.map((presence) => {
              const repCount = representationCounts[presence.id] || 0;
              const atLimit = repCount >= MAX_REPRESENTATIONS;

              return (
                <SelectItem
                  key={presence.id}
                  value={presence.id}
                  disabled={atLimit && presence.id !== value}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{presence.nom} {presence.prenom}</span>
                    {repCount > 0 && (
                      <span className={`text-xs ${atLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                        ({repCount}/{MAX_REPRESENTATIONS})
                      </span>
                    )}
                  </div>
                </SelectItem>
              );
            })
          )}
        </SelectContent>
      </Select>

      {isAtLimit && value && (
        <Alert variant="warning" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Ce représentant a atteint la limite légale de {MAX_REPRESENTATIONS} procurations.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
