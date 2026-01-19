'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { CoproprietaireCard } from '@/components/coproprietaires/CoproprietaireCard';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  subscribeToCoproprietaires,
  anonymizeCoproprietaire,
} from '@/lib/firebase/services/coproprietaire';
import { getLotsByCoproprietaire } from '@/lib/firebase/services/lot';
import { createInvitationExtranet } from '@/lib/firebase/services/invitation-extranet';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCoproId } from '@/lib/hooks/useCoproId';
import type { Coproprietaire } from '@/types/coproprietaire';
import type { Lot } from '@/types/lot';
import { Plus } from 'lucide-react';

export default function CoproprietairesPage() {
  const { user } = useAuth();
  const { coproId, selectedCopro, loading: coproLoading } = useCoproId();
  const [coproprietaires, setCoproprietaires] = useState<Coproprietaire[]>([]);
  const [lotsMap, setLotsMap] = useState<Record<string, Lot[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anonymizeTarget, setAnonymizeTarget] = useState<Coproprietaire | null>(null);
  const [isAnonymizing, setIsAnonymizing] = useState(false);

  // Handler pour inviter un copropriétaire sur l'extranet
  const handleInviteExtranet = useCallback(async (coproprietaireId: string, email: string) => {
    if (!selectedCopro || !user) {
      throw new Error('Copropriété ou utilisateur non défini');
    }
    await createInvitationExtranet(selectedCopro.id, {
      email,
      coproprietaireId,
    }, user.uid);
  }, [selectedCopro, user]);

  useEffect(() => {
    if (!coproId) return;

    const unsubscribe = subscribeToCoproprietaires(coproId, async (updated) => {
      setCoproprietaires(updated);

      // Charger les lots pour chaque copropriétaire
      const lotsPromises = updated.map(async (cp) => {
        const lots = await getLotsByCoproprietaire(coproId, cp.id);
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
  }, [coproId]);

  const handleAnonymize = async () => {
    if (!anonymizeTarget || !selectedCopro || !user) return;

    setIsAnonymizing(true);
    try {
      await anonymizeCoproprietaire(selectedCopro.id, anonymizeTarget.id, user.uid, user.email || '');
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
              onInviteExtranet={(email) => handleInviteExtranet(cp.id, email)}
              onAnonymize={() => setAnonymizeTarget(cp)}
            />
          ))}
        </div>
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
