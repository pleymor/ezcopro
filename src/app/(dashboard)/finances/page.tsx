'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { AppelCard } from '@/components/finances/AppelCard';
import { PaiementCard } from '@/components/finances/PaiementCard';
import { subscribeToAppels, deleteAppel } from '@/lib/firebase/services/appel';
import { subscribeToPaiements, deletePaiement } from '@/lib/firebase/services/paiement';
import { subscribeToCoproprietaires } from '@/lib/firebase/services/coproprietaire';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCondo } from '@/lib/hooks/useCondo';
import type { AppelDeFonds } from '@/types/appel';
import type { Paiement } from '@/types/paiement';
import type { Coproprietaire } from '@/types/coproprietaire';
import { Plus, Receipt, CreditCard } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatCurrency } from '@/lib/utils/format';

type TabType = 'appels' | 'paiements';

export default function FinancesPage() {
  const { user } = useAuth();
  const { selectedCondo, loading: condoLoading } = useCondo();
  const coproId = selectedCondo?.id ?? null;

  // Permissions basées sur le modèle condos
  const canWrite = useMemo(() => {
    if (!user || !selectedCondo) return false;
    if (selectedCondo.ownerId === user.uid) return true;
    return selectedCondo.boardMemberIds?.includes(user.uid) ?? false;
  }, [user, selectedCondo]);
  const [activeTab, setActiveTab] = useState<TabType>('appels');
  const [appels, setAppels] = useState<AppelDeFonds[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [coproprietaires, setCoproprietaires] = useState<Coproprietaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteAppelTarget, setDeleteAppelTarget] = useState<AppelDeFonds | null>(null);
  const [deletePaiementTarget, setDeletePaiementTarget] = useState<Paiement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!coproId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubAppels = subscribeToAppels(coproId, (updated) => {
      setAppels(updated);
      setLoading(false);
    });

    const unsubPaiements = subscribeToPaiements(coproId, (updated) => {
      setPaiements(updated);
    });

    const unsubCopros = subscribeToCoproprietaires(coproId, (updated) => {
      setCoproprietaires(updated);
    });

    return () => {
      unsubAppels();
      unsubPaiements();
      unsubCopros();
    };
  }, [coproId]);

  const handleDeleteAppel = async () => {
    if (!deleteAppelTarget || !selectedCondo || !user) return;

    setIsDeleting(true);
    try {
      await deleteAppel(selectedCondo.id, deleteAppelTarget.id, user.uid, user.email || '');
      setDeleteAppelTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeletePaiement = async () => {
    if (!deletePaiementTarget || !selectedCondo || !user) return;

    setIsDeleting(true);
    try {
      await deletePaiement(selectedCondo.id, deletePaiementTarget.id, user.uid, user.email || '');
      setDeletePaiementTarget(null);
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

  // Calcul des totaux
  const totalAppele = appels.reduce((sum, a) => sum + a.montantTotalCents, 0);
  const totalPaye = paiements.reduce((sum, p) => sum + p.montantCents, 0);
  const soldeGlobal = totalAppele - totalPaye;

  if (condoLoading || loading) {
    return <Loading message="Chargement des finances..." />;
  }

  if (!selectedCondo) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 text-center">
        <ErrorMessage message="Aucune copropriété sélectionnée" />
        <Link href="/copro">
          <Button variant="outline" className="mt-4">
            Choisir une copropriété
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Finances</h1>
        <div className="mt-2 flex gap-4 text-sm">
          <span>Total appelé: <strong>{formatCurrency(totalAppele)}</strong></span>
          <span>Total payé: <strong>{formatCurrency(totalPaye)}</strong></span>
          <span className={soldeGlobal > 0 ? 'text-destructive' : 'text-green-600'}>
            Solde: <strong>{formatCurrency(soldeGlobal)}</strong>
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} onRetry={() => setError(null)} />
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b">
        <div className="flex gap-4" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'appels'}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 transition-colors ${
              activeTab === 'appels'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('appels')}
          >
            <Receipt className="h-4 w-4" />
            Appels de fonds ({appels.length})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'paiements'}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 transition-colors ${
              activeTab === 'paiements'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('paiements')}
          >
            <CreditCard className="h-4 w-4" />
            Paiements ({paiements.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div role="tabpanel">
        {activeTab === 'appels' && (
          <>
            {canWrite && (
              <div className="mb-4 flex justify-end">
                <Link href="/finances/appels/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvel appel
                  </Button>
                </Link>
              </div>
            )}

            {appels.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground">Aucun appel de fonds</p>
                {canWrite && (
                  <Link href="/finances/appels/new">
                    <Button variant="outline" className="mt-4">
                      Créer le premier appel
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {appels.map((appel) => (
                  <AppelCard
                    key={appel.id}
                    condoId={selectedCondo.id}
                    appel={appel}
                    onDelete={canWrite ? () => setDeleteAppelTarget(appel) : undefined}
                    isEditable={canWrite}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'paiements' && (
          <>
            {canWrite && (
              <div className="mb-4 flex justify-end">
                <Link href="/finances/paiements/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Enregistrer un paiement
                  </Button>
                </Link>
              </div>
            )}

            {paiements.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground">Aucun paiement enregistré</p>
                {canWrite && (
                  <Link href="/finances/paiements/new">
                    <Button variant="outline" className="mt-4">
                      Enregistrer le premier paiement
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {paiements.map((paiement) => (
                  <PaiementCard
                    key={paiement.id}
                    condoId={selectedCondo.id}
                    paiement={paiement}
                    coproprietaireNom={getCoproprietaireNom(paiement.coproprietaireId)}
                    onDelete={canWrite ? () => setDeletePaiementTarget(paiement) : undefined}
                    isEditable={canWrite}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteAppelTarget}
        onOpenChange={() => setDeleteAppelTarget(null)}
        title="Supprimer l'appel de fonds"
        description={`Êtes-vous sûr de vouloir supprimer l'appel "${deleteAppelTarget?.libelle}" ? Cette action supprimera également toutes les répartitions associées.`}
        confirmLabel="Supprimer"
        onConfirm={handleDeleteAppel}
        isLoading={isDeleting}
        variant="destructive"
      />

      <ConfirmDialog
        open={!!deletePaiementTarget}
        onOpenChange={() => setDeletePaiementTarget(null)}
        title="Supprimer le paiement"
        description="Êtes-vous sûr de vouloir supprimer ce paiement ? Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={handleDeletePaiement}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}
