'use client';

import { useUserRole } from '@/hooks/useUserRole';
import { useExtranetSolde } from '@/hooks/useExtranetSolde';
import { useExtranetDocuments } from '@/hooks/useExtranetDocuments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SoldeCard } from '@/components/extranet/SoldeCard';
import { AppelsListCompact } from '@/components/extranet/AppelsList';
import { DocumentsListCompact } from '@/components/extranet/DocumentsList';
import { ErrorMessage } from '@/components/ui/error-message';
import { CreditCard } from 'lucide-react';

/**
 * Page d'accueil de l'extranet copropriétaire.
 * Affiche le solde, les derniers documents et les appels de fonds.
 */
export default function ExtranetPage() {
  const { loading: roleLoading } = useUserRole();
  const { data: soldeData, loading: soldeLoading, error } = useExtranetSolde();
  const { documents, loading: docsLoading, downloadDocument } = useExtranetDocuments();

  const loading = roleLoading || soldeLoading || docsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <ErrorMessage message={error.message} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Mon espace copropriétaire</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Carte Solde */}
        {soldeData ? (
          <SoldeCard
            soldeCents={soldeData.soldeCents}
            totalDuCents={soldeData.totalDuCents}
            totalPayeCents={soldeData.totalPayeCents}
            isDebiteur={soldeData.isDebiteur}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Mon solde</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Aucune donnée disponible
              </p>
            </CardContent>
          </Card>
        )}

        {/* Carte Appels récents */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Derniers appels
            </CardTitle>
          </CardHeader>
          <CardContent>
            {soldeData ? (
              <AppelsListCompact appels={soldeData.appels} />
            ) : (
              <p className="text-muted-foreground text-sm">
                Aucun appel de fonds
              </p>
            )}
          </CardContent>
        </Card>

        {/* Carte Documents */}
        <DocumentsListCompact
          documents={documents}
          onDownload={downloadDocument}
          maxItems={3}
        />
      </div>
    </div>
  );
}
