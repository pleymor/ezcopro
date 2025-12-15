'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { getCoproprietaire } from '@/lib/firebase/services/coproprietaire';
import { subscribeToLots } from '@/lib/firebase/services/lot';
import { subscribeToPaiements } from '@/lib/firebase/services/paiement';
import { getDetailSoldeCoproprietaire, type DetailSolde } from '@/lib/firebase/services/solde';
import { useCopropriete } from '@/lib/hooks/useCopropriete';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import type { Coproprietaire } from '@/types/coproprietaire';
import type { Lot } from '@/types/lot';
import type { Paiement } from '@/types/paiement';
import { cn } from '@/lib/utils/cn';
import { ArrowLeft, Receipt, CreditCard, Building2 } from 'lucide-react';

export default function DetailSoldePage() {
  const params = useParams();
  const coproprietaireId = params.id as string;
  const { selectedCopro, loading: coproLoading } = useCopropriete();
  const [coproprietaire, setCoproprietaire] = useState<Coproprietaire | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [detail, setDetail] = useState<DetailSolde | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger le copropriétaire et les données
  useEffect(() => {
    if (!selectedCopro) return;

    const loadCoproprietaire = async () => {
      try {
        const copro = await getCoproprietaire(selectedCopro.id, coproprietaireId);
        if (!copro) {
          setError('Copropriétaire non trouvé');
          return;
        }
        setCoproprietaire(copro);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      }
    };

    loadCoproprietaire();

    const unsubLots = subscribeToLots(selectedCopro.id, setLots);
    const unsubPaiements = subscribeToPaiements(selectedCopro.id, setPaiements);

    return () => {
      unsubLots();
      unsubPaiements();
    };
  }, [selectedCopro, coproprietaireId]);

  // Calculer le détail du solde
  useEffect(() => {
    if (!selectedCopro || !coproprietaire) return;

    const loadDetail = async () => {
      try {
        const detailSolde = await getDetailSoldeCoproprietaire(
          selectedCopro.id,
          coproprietaireId,
          lots,
          paiements
        );
        setDetail(detailSolde);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de calcul');
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [selectedCopro, coproprietaire, coproprietaireId, lots, paiements]);

  // Lots du copropriétaire
  const coproLots = lots.filter((l) => l.coproprietaireId === coproprietaireId);

  if (coproLoading || loading) {
    return <Loading message="Chargement du détail..." />;
  }

  if (error || !coproprietaire) {
    return <ErrorMessage message={error || 'Copropriétaire non trouvé'} />;
  }

  if (!detail) {
    return <ErrorMessage message="Impossible de calculer le solde" />;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link href="/soldes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux soldes
          </Button>
        </Link>
      </div>

      {/* En-tête copropriétaire */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">
            {coproprietaire.prenom} {coproprietaire.nom}
          </CardTitle>
          {coproprietaire.email && (
            <p className="text-sm text-muted-foreground">{coproprietaire.email}</p>
          )}
        </CardHeader>
        <CardContent>
          {/* Lots */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Building2 className="h-4 w-4" />
              <span>Lots ({coproLots.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {coproLots.map((lot) => (
                <span
                  key={lot.id}
                  className="rounded-full bg-muted px-3 py-1 text-sm"
                >
                  {lot.numero}
                </span>
              ))}
            </div>
          </div>

          {/* Résumé du solde */}
          <div className="grid grid-cols-3 gap-4 border-t pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Dû</p>
              <p className="text-xl font-bold">{formatCurrency(detail.totalDuCents)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payé</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(detail.totalPayeCents)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Solde</p>
              <p
                className={cn(
                  'text-xl font-bold',
                  detail.soldeCents > 0 ? 'text-destructive' : 'text-green-600'
                )}
              >
                {formatCurrency(detail.soldeCents)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appels de fonds */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            <CardTitle>Appels de fonds</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {detail.appels.length === 0 ? (
            <p className="text-muted-foreground">Aucun appel de fonds</p>
          ) : (
            <div className="space-y-3">
              {detail.appels.map((appel, index) => (
                <div
                  key={`${appel.appelId}-${appel.lotId}-${index}`}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{appel.libelle}</p>
                    <p className="text-sm text-muted-foreground">
                      Lot {appel.lotNumero} - Échéance: {formatDate(appel.dateEcheance)}
                    </p>
                  </div>
                  <p className="font-medium">{formatCurrency(appel.montantCents)}</p>
                </div>
              ))}
              <div className="flex justify-between border-t pt-3 font-bold">
                <span>Total dû</span>
                <span>{formatCurrency(detail.totalDuCents)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paiements */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle>Paiements</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {detail.paiements.length === 0 ? (
            <p className="text-muted-foreground">Aucun paiement enregistré</p>
          ) : (
            <div className="space-y-3">
              {detail.paiements.map((paiement) => (
                <div
                  key={paiement.paiementId}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{formatDate(paiement.datePaiement)}</p>
                    {paiement.reference && (
                      <p className="text-sm text-muted-foreground">
                        Réf: {paiement.reference}
                      </p>
                    )}
                  </div>
                  <p className="font-medium text-green-600">
                    +{formatCurrency(paiement.montantCents)}
                  </p>
                </div>
              ))}
              <div className="flex justify-between border-t pt-3 font-bold">
                <span>Total payé</span>
                <span className="text-green-600">
                  {formatCurrency(detail.totalPayeCents)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
