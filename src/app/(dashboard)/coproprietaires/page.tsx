'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { CoproprietaireCard } from '@/components/coproprietaires/CoproprietaireCard';
import { InvitationModal } from '@/components/coproprietaires/InvitationModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  subscribeToCoproprietaires,
  anonymizeCoproprietaire,
} from '@/lib/firebase/services/coproprietaire';
import { getLotsByCoproprietaire } from '@/lib/firebase/services/lot';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCopropriete } from '@/lib/hooks/useCopropriete';
import type { Coproprietaire } from '@/types/coproprietaire';
import type { Lot } from '@/types/lot';
import { Plus } from 'lucide-react';

export default function CoproprietairesPage() {
  const { user } = useAuth();
  const { selectedCopro, loading: coproLoading } = useCopropriete();
  const [coproprietaires, setCoproprietaires] = useState<Coproprietaire[]>([]);
  const [lotsMap, setLotsMap] = useState<Record<string, Lot[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteTarget, setInviteTarget] = useState<Coproprietaire | null>(null);
  const [anonymizeTarget, setAnonymizeTarget] = useState<Coproprietaire | null>(null);
  const [isAnonymizing, setIsAnonymizing] = useState(false);

  useEffect(() => {
    if (!selectedCopro) return;

    const unsubscribe = subscribeToCoproprietaires(selectedCopro.id, async (updated) => {
      setCoproprietaires(updated);

      // Charger les lots pour chaque copropriétaire
      const lotsPromises = updated.map(async (cp) => {
        const lots = await getLotsByCoproprietaire(selectedCopro.id, cp.id);
        return { id: cp.id, lots };
      });

      const lotsResults = await Promise.all(lotsPromises);
      const newLotsMap: Record<string, Lot[]> = {};
      lotsResults.forEach((result) => {
        newLotsMap[result.id] = result.lots;
      });
      setLotsMap(newLotsMap);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedCopro]);

  const handleAnonymize = async () => {
    if (!anonymizeTarget || !selectedCopro || !user) return;

    setIsAnonymizing(true);
    try {
      await anonymizeCoproprietaire(selectedCopro.id, anonymizeTarget.id, user.uid);
      setAnonymizeTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'anonymisation');
    } finally {
      setIsAnonymizing(false);
    }
  };

  if (coproLoading || loading) {
    return <Loading message="Chargement des copropriétaires..." />;
  }

  if (!selectedCopro) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Copropriétaires</h1>
          <p className="text-sm text-muted-foreground">
            {coproprietaires.length} copropriétaire{coproprietaires.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/coproprietaires/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} onRetry={() => setError(null)} />
        </div>
      )}

      {coproprietaires.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Aucun copropriétaire pour l&apos;instant</p>
          <Link href="/coproprietaires/new">
            <Button variant="outline" className="mt-4">
              Créer le premier copropriétaire
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {coproprietaires.map((cp) => (
            <CoproprietaireCard
              key={cp.id}
              coproprietaire={cp}
              lots={lotsMap[cp.id] || []}
              onInvite={() => setInviteTarget(cp)}
              onAnonymize={() => setAnonymizeTarget(cp)}
            />
          ))}
        </div>
      )}

      {inviteTarget && selectedCopro && (
        <InvitationModal
          coproId={selectedCopro.id}
          coproprietaire={inviteTarget}
          open={!!inviteTarget}
          onOpenChange={() => setInviteTarget(null)}
        />
      )}

      <ConfirmDialog
        open={!!anonymizeTarget}
        onOpenChange={() => setAnonymizeTarget(null)}
        title="Anonymiser le copropriétaire (RGPD)"
        description={`Êtes-vous sûr de vouloir anonymiser ${anonymizeTarget?.nom} ${anonymizeTarget?.prenom || ''} ? Les données personnelles seront supprimées mais l'historique financier sera conservé. Cette action est irréversible.`}
        confirmLabel="Anonymiser"
        onConfirm={handleAnonymize}
        isLoading={isAnonymizing}
        variant="destructive"
      />
    </div>
  );
}
