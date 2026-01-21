'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getAppel, getRepartitions, deleteAppel } from '@/lib/firebase/services/appel';
import { subscribeToCoproprietaires } from '@/lib/firebase/services/coproprietaire';
import { subscribeToLots } from '@/lib/firebase/services/lot';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCondoFromUrl } from '@/lib/hooks/useCondoFromUrl';
import { condoPaths } from '@/lib/utils/condo-routes';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import type { AppelDeFonds } from '@/types/appel';
import type { Repartition } from '@/types/repartition';
import type { Coproprietaire } from '@/types/coproprietaire';
import type { Lot } from '@/types/lot';
import { ArrowLeft, Trash2, Calendar, Receipt } from 'lucide-react';

export default function AppelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appelId = params.id as string;
  const { user } = useAuth();
  const { condoId, currentCondo, loading: condoLoading } = useCondoFromUrl();
  const [appel, setAppel] = useState<AppelDeFonds | null>(null);
  const [repartitions, setRepartitions] = useState<Repartition[]>([]);
  const [coproprietaires, setCoproprietaires] = useState<Coproprietaire[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!condoId) return;

    const loadData = async () => {
      try {
        const [appelData, repartitionsData] = await Promise.all([
          getAppel(condoId, appelId),
          getRepartitions(condoId, appelId),
        ]);

        if (!appelData) {
          setError('Appel de fonds non trouvé');
          return;
        }

        setAppel(appelData);
        setRepartitions(repartitionsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Souscrire aux copropriétaires et lots pour avoir les noms
    const unsubCopros = subscribeToCoproprietaires(condoId, setCoproprietaires);
    const unsubLots = subscribeToLots(condoId, setLots);

    return () => {
      unsubCopros();
      unsubLots();
    };
  }, [condoId, appelId]);

  const handleDelete = async () => {
    if (!condoId || !user) return;

    setIsDeleting(true);
    try {
      await deleteAppel(condoId, appelId, user.uid, user.email || '');
      router.push(condoPaths.finances(condoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const getCoproprietaireNom = (id: string): string => {
    const copro = coproprietaires.find((c) => c.id === id);
    if (!copro) return 'Inconnu';
    if (copro.isAnonymized) return 'Ancien copropriétaire';
    return `${copro.prenom} ${copro.nom}`;
  };

  const getLotNumero = (id: string): string => {
    const lot = lots.find((l) => l.id === id);
    return lot?.numero || 'N/A';
  };

  if (condoLoading || loading) {
    return <Loading message="Chargement de l'appel..." />;
  }

  if (!currentCondo || !condoId) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  if (error || !appel) {
    return <ErrorMessage message={error || 'Appel non trouvé'} />;
  }

  const isEchu = new Date(appel.dateEcheance.seconds * 1000) < new Date();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link href={condoPaths.finances(condoId)}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux finances
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{appel.libelle}</CardTitle>
              <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Échéance: {formatDate(appel.dateEcheance)}
                  {isEchu && <span className="ml-2 text-destructive">(échu)</span>}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatCurrency(appel.montantTotalCents)}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="mt-2 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            <CardTitle>Répartitions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {repartitions.length === 0 ? (
            <p className="text-muted-foreground">Aucune répartition</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-2">Lot</th>
                    <th className="pb-2">Copropriétaire</th>
                    <th className="pb-2 text-right">Tantièmes</th>
                    <th className="pb-2 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {repartitions.map((rep) => (
                    <tr key={rep.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{getLotNumero(rep.lotId)}</td>
                      <td className="py-3">{getCoproprietaireNom(rep.coproprietaireId)}</td>
                      <td className="py-3 text-right text-muted-foreground">
                        {rep.tantiemesSnapshot}
                      </td>
                      <td className="py-3 text-right font-medium">
                        {formatCurrency(rep.montantCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t font-bold">
                    <td className="pt-3" colSpan={2}>Total</td>
                    <td className="pt-3 text-right">
                      {repartitions.reduce((sum, r) => sum + r.tantiemesSnapshot, 0)}
                    </td>
                    <td className="pt-3 text-right">
                      {formatCurrency(repartitions.reduce((sum, r) => sum + r.montantCents, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Supprimer l'appel de fonds"
        description={`Êtes-vous sûr de vouloir supprimer l'appel "${appel.libelle}" ? Cette action supprimera également toutes les répartitions associées.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}
