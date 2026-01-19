'use client';

import { Calendar, Receipt } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatMontant, formatDate } from '@/hooks/useExtranetSolde';
import type { DetailPaiement } from '@/lib/firebase/services/solde';

interface PaiementsListProps {
  paiements: DetailPaiement[];
  title?: string;
  emptyMessage?: string;
  maxItems?: number;
}

/**
 * Liste des paiements pour un copropriétaire.
 */
export function PaiementsList({
  paiements,
  title = 'Mes paiements',
  emptyMessage = 'Aucun paiement enregistré',
  maxItems,
}: PaiementsListProps) {
  // Trier par date décroissante
  const sortedPaiements = [...paiements].sort(
    (a, b) => b.datePaiement.seconds - a.datePaiement.seconds
  );
  const displayedPaiements = maxItems ? sortedPaiements.slice(0, maxItems) : sortedPaiements;
  const hasMore = maxItems && paiements.length > maxItems;

  // Calculer le total
  const totalPaye = paiements.reduce((sum, p) => sum + p.montantCents, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>
          {paiements.length} paiement{paiements.length > 1 ? 's' : ''} - Total: {formatMontant(totalPaye)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {displayedPaiements.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {emptyMessage}
          </p>
        ) : (
          <div className="space-y-3">
            {displayedPaiements.map((paiement) => (
              <div
                key={paiement.paiementId}
                className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-green-600" />
                    <p className="font-medium text-green-600 dark:text-green-400">
                      {formatMontant(paiement.montantCents)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(paiement.datePaiement)}
                    </span>
                    {paiement.reference && (
                      <Badge variant="outline" className="text-xs">
                        {paiement.reference}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {hasMore && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                +{paiements.length - maxItems} autres paiements
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
export function PaiementsListCompact({ paiements }: { paiements: DetailPaiement[] }) {
  if (paiements.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Aucun paiement enregistré</p>
    );
  }

  // Trier et prendre les 3 derniers paiements
  const recentPaiements = [...paiements]
    .sort((a, b) => b.datePaiement.seconds - a.datePaiement.seconds)
    .slice(0, 3);

  return (
    <div className="space-y-2">
      {recentPaiements.map((paiement) => (
        <div
          key={paiement.paiementId}
          className="flex items-center justify-between text-sm"
        >
          <span className="text-muted-foreground">
            {formatDate(paiement.datePaiement)}
          </span>
          <Badge variant="secondary" className="text-green-600">
            {formatMontant(paiement.montantCents)}
          </Badge>
        </div>
      ))}
      {paiements.length > 3 && (
        <p className="text-xs text-muted-foreground">
          +{paiements.length - 3} autres
        </p>
      )}
    </div>
  );
}
