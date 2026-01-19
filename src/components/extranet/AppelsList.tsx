'use client';

import { Calendar, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatMontant, formatDate } from '@/hooks/useExtranetSolde';
import type { DetailAppel } from '@/lib/firebase/services/solde';

interface AppelsListProps {
  appels: DetailAppel[];
  title?: string;
  emptyMessage?: string;
  maxItems?: number;
}

/**
 * Liste des appels de fonds pour un copropriétaire.
 */
export function AppelsList({
  appels,
  title = 'Mes appels de fonds',
  emptyMessage = 'Aucun appel de fonds',
  maxItems,
}: AppelsListProps) {
  const displayedAppels = maxItems ? appels.slice(0, maxItems) : appels;
  const hasMore = maxItems && appels.length > maxItems;

  // Regrouper les appels par appelId pour éviter les doublons d'affichage
  const groupedAppels = displayedAppels.reduce((acc, appel) => {
    const existing = acc.find((a) => a.appelId === appel.appelId);
    if (existing) {
      existing.montantCents += appel.montantCents;
      existing.lots.push({ lotId: appel.lotId, lotNumero: appel.lotNumero });
    } else {
      acc.push({
        ...appel,
        lots: [{ lotId: appel.lotId, lotNumero: appel.lotNumero }],
      });
    }
    return acc;
  }, [] as (DetailAppel & { lots: { lotId: string; lotNumero: string }[] })[]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>
          {appels.length} appel{appels.length > 1 ? 's' : ''} de fonds
        </CardDescription>
      </CardHeader>
      <CardContent>
        {groupedAppels.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {emptyMessage}
          </p>
        ) : (
          <div className="space-y-3">
            {groupedAppels.map((appel, index) => (
              <div
                key={`${appel.appelId}-${index}`}
                className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium">{appel.libelle}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Échéance: {formatDate(appel.dateEcheance)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Home className="h-3 w-3" />
                      {appel.lots.map((l) => l.lotNumero).join(', ')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatMontant(appel.montantCents)}</p>
                </div>
              </div>
            ))}

            {hasMore && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                +{appels.length - maxItems} autres appels
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Version compacte pour le dashboard
 */
export function AppelsListCompact({ appels }: { appels: DetailAppel[] }) {
  if (appels.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Aucun appel de fonds</p>
    );
  }

  // Prendre les 3 derniers appels
  const recentAppels = appels.slice(0, 3);

  return (
    <div className="space-y-2">
      {recentAppels.map((appel, index) => (
        <div
          key={`${appel.appelId}-${index}`}
          className="flex items-center justify-between text-sm"
        >
          <span className="truncate max-w-[60%]">{appel.libelle}</span>
          <Badge variant="outline">{formatMontant(appel.montantCents)}</Badge>
        </div>
      ))}
      {appels.length > 3 && (
        <p className="text-xs text-muted-foreground">
          +{appels.length - 3} autres
        </p>
      )}
    </div>
  );
}
