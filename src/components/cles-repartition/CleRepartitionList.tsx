'use client';

import Link from 'next/link';
import { Plus, Key, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CleRepartition } from '@/lib/schemas/cle-repartition';
import { validateQuotePartsTotal } from '@/lib/schemas/cle-repartition';
import { condoPaths } from '@/lib/utils/condo-routes';

interface CleRepartitionListProps {
  cles: CleRepartition[];
  onCreateDefault?: () => void;
  isCreatingDefault?: boolean;
  isEditable?: boolean;
  condoId: string;
}

export function CleRepartitionList({
  cles,
  onCreateDefault,
  isCreatingDefault = false,
  isEditable = true,
  condoId,
}: CleRepartitionListProps) {
  if (cles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <Key className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Aucune clé de répartition</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Créez votre première clé pour répartir les charges entre les lots.
        </p>
        {isEditable && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            {onCreateDefault && (
              <Button
                variant="outline"
                onClick={onCreateDefault}
                disabled={isCreatingDefault}
              >
                {isCreatingDefault ? 'Création...' : 'Créer la clé par défaut'}
              </Button>
            )}
            <Link href={condoPaths.cleRepartitionNew(condoId)}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Créer une clé personnalisée
              </Button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isEditable && (
        <div className="flex justify-end">
          <Link href={condoPaths.cleRepartitionNew(condoId)}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle clé
            </Button>
          </Link>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {cles.map((cle) => (
          <CleRepartitionCard key={cle.id} cle={cle} condoId={condoId} />
        ))}
      </div>
    </div>
  );
}

interface CleRepartitionCardProps {
  cle: CleRepartition;
  condoId: string;
}

function CleRepartitionCard({ cle, condoId }: CleRepartitionCardProps) {
  const { total, isValid } = validateQuotePartsTotal(cle.quoteParts);
  const percentage = ((total / 10000) * 100).toFixed(1);
  const lotCount = cle.quoteParts.length;
  const nonZeroCount = cle.quoteParts.filter((qp) => qp.valeur > 0).length;

  return (
    <Link href={condoPaths.cleRepartitionDetail(condoId, cle.id)}>
      <div className="group rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold truncate">{cle.nom}</h3>
              {cle.isDefault && (
                <Badge variant="secondary" className="shrink-0">
                  Par défaut
                </Badge>
              )}
            </div>
            {cle.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {cle.description}
              </p>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Lots:</span>
            <span className="font-medium">
              {nonZeroCount}/{lotCount}
            </span>
          </div>
          {!isValid && (
            <div className="flex items-center gap-1 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">{percentage}%</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
