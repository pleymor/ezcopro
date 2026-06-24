'use client';

import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useExtranetSolde, formatMontant } from '@/hooks/useExtranetSolde';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppelsList } from '@/components/extranet/AppelsList';
import { PaiementsList } from '@/components/extranet/PaiementsList';
import { ErrorMessage } from '@/components/ui/error-message';
import { cn } from '@/lib/utils/cn';

/**
 * Page de détail du solde du copropriétaire.
 * Affiche le solde, la liste des appels et des paiements.
 */
export default function SoldeDetailPage() {
  const { data, loading, error, refresh } = useExtranetSolde();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <ErrorMessage message={error.message} onRetry={refresh} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <p className="text-muted-foreground">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <a href="/extranet">
              <ArrowLeft className="h-5 w-5" />
            </a>
          </Button>
          <h1 className="text-2xl font-bold">Mon solde</h1>
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Résumé du solde */}
      <Card className={cn(
        data.isDebiteur && 'border-red-200 dark:border-red-900'
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Résumé</CardTitle>
            {data.isDebiteur ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-1">Total appelé</p>
              <p className="text-2xl font-bold">{formatMontant(data.totalDuCents)}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-1">Total payé</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatMontant(data.totalPayeCents)}
              </p>
            </div>
            <div className={cn(
              'text-center p-4 rounded-lg',
              data.isDebiteur ? 'bg-red-50 dark:bg-red-950' : 'bg-green-50 dark:bg-green-950'
            )}>
              <p className="text-sm text-muted-foreground mb-1">Solde</p>
              <p className={cn(
                'text-2xl font-bold',
                data.isDebiteur ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
              )}>
                {data.isDebiteur ? '-' : ''}{formatMontant(Math.abs(data.soldeCents))}
              </p>
            </div>
          </div>

          {data.isDebiteur && (
            <div className="mt-4 rounded-md bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-300">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  Vous avez un solde débiteur de {formatMontant(Math.abs(data.soldeCents))}.
                  Merci de régulariser votre situation auprès du syndic.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Détails */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Liste des appels */}
        <AppelsList appels={data.appels} />

        {/* Liste des paiements */}
        <PaiementsList paiements={data.paiements} />
      </div>
    </div>
  );
}
