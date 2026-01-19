'use client';

import { AlertTriangle, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatMontant } from '@/hooks/useExtranetSolde';
import { cn } from '@/lib/utils/cn';

interface SoldeCardProps {
  soldeCents: number;
  totalDuCents: number;
  totalPayeCents: number;
  isDebiteur: boolean;
  showDetails?: boolean;
}

/**
 * Carte affichant le solde du copropriétaire.
 * Affiche une indication visuelle selon que le solde est débiteur ou créditeur.
 */
export function SoldeCard({
  soldeCents,
  totalDuCents,
  totalPayeCents,
  isDebiteur,
  showDetails = true,
}: SoldeCardProps) {
  return (
    <Card className={cn(
      'transition-colors',
      isDebiteur && 'border-red-200 dark:border-red-900'
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Mon solde</CardTitle>
          {isDebiteur ? (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
        </div>
        <CardDescription>
          {isDebiteur ? 'Solde débiteur' : 'Compte à jour'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Montant principal */}
        <div className={cn(
          'text-3xl font-bold',
          isDebiteur ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
        )}>
          {isDebiteur ? '-' : ''}{formatMontant(Math.abs(soldeCents))}
        </div>

        {/* Détails */}
        {showDetails && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total appelé</span>
              <span>{formatMontant(totalDuCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total payé</span>
              <span className="text-green-600 dark:text-green-400">
                {formatMontant(totalPayeCents)}
              </span>
            </div>
          </div>
        )}

        {/* Message d'alerte si débiteur */}
        {isDebiteur && (
          <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-300">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Paiement en attente</p>
                <p className="mt-1 text-red-600 dark:text-red-400">
                  Merci de régulariser votre situation auprès du syndic.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lien vers le détail */}
        <Button variant="outline" className="w-full" asChild>
          <a href="/extranet/solde">
            <TrendingUp className="h-4 w-4 mr-2" />
            Voir le détail
            <ArrowRight className="h-4 w-4 ml-auto" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
