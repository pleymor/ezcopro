'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { subscribeToCoproprietaires } from '@/lib/firebase/services/coproprietaire';
import { subscribeToLots } from '@/lib/firebase/services/lot';
import { subscribeToPaiements } from '@/lib/firebase/services/paiement';
import {
  calculateSoldesByCoproprietaire,
  filterSoldes,
  type SoldeCoproprietaire,
  type SoldeFilter,
} from '@/lib/firebase/services/solde';
import { useCondoFromUrl } from '@/lib/hooks/useCondoFromUrl';
import { condoPaths } from '@/lib/utils/condo-routes';
import { formatCurrency } from '@/lib/utils/format';
import type { Coproprietaire } from '@/types/coproprietaire';
import type { Lot } from '@/types/lot';
import type { Paiement } from '@/types/paiement';
import { cn } from '@/lib/utils/cn';
import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';

export default function SoldesPage() {
  const { condoId, currentCondo, loading: condoLoading } = useCondoFromUrl();
  const [coproprietaires, setCoproprietaires] = useState<Coproprietaire[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [soldes, setSoldes] = useState<SoldeCoproprietaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SoldeFilter>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!condoId) return;

    const unsubCopros = subscribeToCoproprietaires(condoId, setCoproprietaires);
    const unsubLots = subscribeToLots(condoId, setLots);
    const unsubPaiements = subscribeToPaiements(condoId, setPaiements);

    return () => {
      unsubCopros();
      unsubLots();
      unsubPaiements();
    };
  }, [condoId]);

  useEffect(() => {
    if (!condoId || coproprietaires.length === 0) {
      setLoading(false);
      return;
    }

    const loadSoldes = async () => {
      try {
        const calculatedSoldes = await calculateSoldesByCoproprietaire(
          condoId,
          coproprietaires,
          lots,
          paiements
        );
        setSoldes(calculatedSoldes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de calcul des soldes');
      } finally {
        setLoading(false);
      }
    };

    loadSoldes();
  }, [condoId, coproprietaires, lots, paiements]);

  const filteredSoldes = useMemo(() => filterSoldes(soldes, filter), [soldes, filter]);

  const stats = useMemo(() => {
    const enRetard = soldes.filter((s) => s.soldeCents > 0).length;
    const aJour = soldes.filter((s) => s.soldeCents <= 0).length;
    return { enRetard, aJour, total: soldes.length };
  }, [soldes]);

  if (condoLoading || loading) {
    return <Loading message="Calcul des soldes..." />;
  }

  if (!currentCondo || !condoId) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Soldes</h1>
        <p className="text-sm text-muted-foreground">
          Vue d&apos;ensemble des soldes de la copropriété
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} onRetry={() => setError(null)} />
        </div>
      )}

      <div className="mb-4 flex gap-2" role="group" aria-label="Filtres">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          aria-pressed={filter === 'all'}
        >
          Tous ({stats.total})
        </Button>
        <Button
          variant={filter === 'aJour' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('aJour')}
          aria-pressed={filter === 'aJour'}
        >
          À jour ({stats.aJour})
        </Button>
        <Button
          variant={filter === 'enRetard' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('enRetard')}
          aria-pressed={filter === 'enRetard'}
        >
          En retard ({stats.enRetard})
        </Button>
      </div>

      {filteredSoldes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {filter === 'all'
                ? 'Aucun copropriétaire'
                : filter === 'aJour'
                  ? 'Aucun copropriétaire à jour'
                  : 'Aucun copropriétaire en retard'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="px-4 py-3">Copropriétaire</th>
                    <th className="px-4 py-3 text-right">Solde</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSoldes.map((solde) => (
                    <tr
                      key={solde.coproprietaireId}
                      className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={condoPaths.soldeDetail(condoId, solde.coproprietaireId)}
                          className="flex items-center gap-2"
                        >
                          <SoldeIcon soldeCents={solde.soldeCents} />
                          <div>
                            <div className="font-medium">
                              {solde.coproprietaire.prenom} {solde.coproprietaire.nom}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {solde.lots.length} lot{solde.lots.length > 1 ? 's' : ''}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td
                        className={cn(
                          'px-4 py-3 text-right font-medium',
                          solde.soldeCents > 0 ? 'text-destructive' : 'text-green-600'
                        )}
                      >
                        {formatCurrency(solde.soldeCents)}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={condoPaths.soldeDetail(condoId, solde.coproprietaireId)}>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SoldeIcon({ soldeCents }: { soldeCents: number }) {
  if (soldeCents > 0) {
    return <TrendingDown className="h-5 w-5 text-destructive" />;
  }
  if (soldeCents < 0) {
    return <TrendingUp className="h-5 w-5 text-green-600" />;
  }
  return <Minus className="h-5 w-5 text-muted-foreground" />;
}
