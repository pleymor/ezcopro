'use client';

import { ArrowLeft, RefreshCw, Receipt, Calendar } from 'lucide-react';
import { useExtranetPaiements } from '@/hooks/useExtranetPaiements';
import { formatMontant, formatDate } from '@/hooks/useExtranetSolde';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorMessage } from '@/components/ui/error-message';
import { PeriodFilter } from '@/components/extranet/PeriodFilter';
import { JustificatifPDF, JustificatifMultiplePDF } from '@/components/extranet/JustificatifPDF';

/**
 * Page de l'historique des paiements du copropriétaire.
 * Permet de filtrer par période et télécharger des justificatifs.
 */
export default function PaiementsPage() {
  const {
    filteredPaiements,
    totalPaiements,
    totalMontantCents,
    loading,
    error,
    period,
    setPeriod,
    refresh,
  } = useExtranetPaiements();

  // TODO: Récupérer les vrais noms depuis les données
  const coproprietaireNom = 'Copropriétaire';
  const coproprieteNom = 'Ma copropriété';

  // Label de la période pour l'export
  const getPeriodLabel = (): string => {
    if (!period.startDate && !period.endDate) {
      return 'Toutes les périodes';
    }
    if (period.startDate && period.endDate) {
      return `Du ${period.startDate.toLocaleDateString('fr-FR')} au ${period.endDate.toLocaleDateString('fr-FR')}`;
    }
    if (period.startDate) {
      return `Depuis le ${period.startDate.toLocaleDateString('fr-FR')}`;
    }
    if (period.endDate) {
      return `Jusqu'au ${period.endDate.toLocaleDateString('fr-FR')}`;
    }
    return 'Période sélectionnée';
  };

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
          <h1 className="text-2xl font-bold">Historique des paiements</h1>
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Filtres et actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <PeriodFilter period={period} onPeriodChange={setPeriod} />

            <JustificatifMultiplePDF
              paiements={filteredPaiements}
              coproprietaireNom={coproprietaireNom}
              coproprieteNom={coproprieteNom}
              periodLabel={getPeriodLabel()}
            />
          </div>
        </CardContent>
      </Card>

      {/* Résumé */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Nombre de paiements</CardDescription>
            <CardTitle className="text-3xl">{totalPaiements}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total payé</CardDescription>
            <CardTitle className="text-3xl text-green-600 dark:text-green-400">
              {formatMontant(totalMontantCents)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Liste des paiements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Détail des paiements
          </CardTitle>
          <CardDescription>
            {totalPaiements} paiement{totalPaiements > 1 ? 's' : ''} pour la période sélectionnée
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPaiements.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun paiement pour cette période
            </p>
          ) : (
            <div className="space-y-3">
              {filteredPaiements.map((paiement) => (
                <div
                  key={paiement.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        {formatMontant(paiement.montantCents)}
                      </p>
                      {paiement.reference && (
                        <Badge variant="outline" className="text-xs">
                          {paiement.reference}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(paiement.datePaiement)}
                    </div>
                  </div>

                  <JustificatifPDF
                    paiement={paiement}
                    coproprietaireNom={coproprietaireNom}
                    coproprieteNom={coproprieteNom}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
