'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { Spinner } from '@/components/ui/spinner';
import {
  getHistorique,
  type HistoriqueEntry,
  type EntityType,
} from '@/lib/firebase/services/historique';
import { useCopropriete } from '@/lib/hooks/useCopropriete';
import { formatRelativeDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  Users,
  Receipt,
  CreditCard,
  Home,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DocumentSnapshot } from 'firebase/firestore';

type FilterType = 'all' | EntityType;

const ENTITY_FILTERS: Array<{ value: FilterType; label: string; icon: React.ElementType }> = [
  { value: 'all', label: 'Tous', icon: Home },
  { value: 'lot', label: 'Lots', icon: Building2 },
  { value: 'coproprietaire', label: 'Copropriétaires', icon: Users },
  { value: 'appel', label: 'Appels', icon: Receipt },
  { value: 'paiement', label: 'Paiements', icon: CreditCard },
];

const ACTION_CONFIG = {
  create: { icon: Plus, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Création' },
  update: { icon: Pencil, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Modification' },
  delete: { icon: Trash2, color: 'text-destructive', bgColor: 'bg-red-100', label: 'Suppression' },
};

const ENTITY_LABELS: Record<EntityType, string> = {
  lot: 'Lot',
  coproprietaire: 'Copropriétaire',
  appel: 'Appel de fonds',
  paiement: 'Paiement',
  copropriete: 'Copropriété',
  assemblee_generale: 'Assemblée Générale',
  resolution: 'Résolution',
  presence: 'Présence',
  vote: 'Vote',
};

export default function HistoriquePage() {
  const { selectedCopro, loading: coproLoading } = useCopropriete();
  const [entries, setEntries] = useState<HistoriqueEntry[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  // Charger l'historique
  const loadHistorique = useCallback(
    async (reset: boolean = false) => {
      if (!selectedCopro) return;

      if (reset) {
        setLoading(true);
        setEntries([]);
        setLastDoc(null);
      } else {
        setLoadingMore(true);
      }

      try {
        const result = await getHistorique(selectedCopro.id, {
          limit: 20,
          entityType: filter === 'all' ? undefined : filter,
          startAfterDoc: reset ? undefined : lastDoc || undefined,
        });

        if (reset) {
          setEntries(result.entries);
        } else {
          setEntries((prev) => [...prev, ...result.entries]);
        }
        setHasMore(result.hasMore);
        setLastDoc(result.lastDoc);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedCopro, filter, lastDoc]
  );

  // Charger au montage et quand le filtre change
  useEffect(() => {
    loadHistorique(true);
  }, [selectedCopro, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    loadHistorique(false);
  };

  const toggleExpand = (entryId: string) => {
    setExpandedEntry((prev) => (prev === entryId ? null : entryId));
  };

  if (coproLoading || loading) {
    return <Loading message="Chargement de l'historique..." />;
  }

  if (!selectedCopro) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Historique</h1>
        <p className="text-sm text-muted-foreground">
          Journal des actions effectuées sur la copropriété
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} onRetry={() => loadHistorique(true)} />
        </div>
      )}

      {/* Filtres */}
      <div className="mb-6 flex flex-wrap gap-2">
        {ENTITY_FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.value)}
            className={cn(filter === f.value && 'bg-primary')}
          >
            <f.icon className="mr-2 h-4 w-4" />
            {f.label}
          </Button>
        ))}
      </div>

      {/* Liste des entrées */}
      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {filter === 'all'
                ? "Aucune action enregistrée pour l'instant"
                : `Aucune action sur les ${ENTITY_FILTERS.find((f) => f.value === filter)?.label.toLowerCase()}`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div role="list" className="space-y-3">
          {entries.map((entry) => (
            <HistoriqueEntryCard
              key={entry.id}
              entry={entry}
              isExpanded={expandedEntry === entry.id}
              onToggle={() => toggleExpand(entry.id)}
            />
          ))}

          {/* Charger plus */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Chargement...
                  </>
                ) : (
                  'Charger plus'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface HistoriqueEntryCardProps {
  entry: HistoriqueEntry;
  isExpanded: boolean;
  onToggle: () => void;
}

function HistoriqueEntryCard({ entry, isExpanded, onToggle }: HistoriqueEntryCardProps) {
  const actionConfig = ACTION_CONFIG[entry.action];
  const ActionIcon = actionConfig.icon;
  const hasDetails = entry.action === 'update' && entry.before && entry.after;

  return (
    <Card
      role="listitem"
      data-action={entry.action}
      className={cn(hasDetails && 'cursor-pointer')}
      onClick={hasDetails ? onToggle : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icône de l'action */}
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              actionConfig.bgColor
            )}
          >
            <ActionIcon className={cn('h-5 w-5', actionConfig.color)} />
          </div>

          {/* Contenu */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <span className={cn('font-medium', actionConfig.color)}>
                  {actionConfig.label}
                </span>
                <span className="mx-1 text-muted-foreground">-</span>
                <span className="text-muted-foreground">
                  {ENTITY_LABELS[entry.entityType]}
                </span>
              </div>
              {hasDetails && (
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>

            <p className="font-medium truncate">{entry.entityLabel}</p>

            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{entry.userEmail || 'Système'}</span>
              <span>•</span>
              <span>{formatRelativeDate(entry.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Détails (pour les modifications) */}
        {isExpanded && hasDetails && (
          <div className="mt-4 border-t pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">Avant</h4>
                <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">
                  {JSON.stringify(entry.before, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">Après</h4>
                <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">
                  {JSON.stringify(entry.after, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
