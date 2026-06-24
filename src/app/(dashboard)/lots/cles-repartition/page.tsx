'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { CleRepartitionList } from '@/components/cles-repartition/CleRepartitionList';
import { useClesRepartition } from '@/hooks/useClesRepartition';
import { useCondo } from '@/lib/hooks/useCondo';
import { useAuth } from '@/lib/hooks/useAuth';
import { subscribeToLots } from '@/lib/firebase/services/lot';
import type { Lot } from '@/types/lot';

export default function ClesRepartitionPage() {
  const { user } = useAuth();
  const { selectedCondo, loading: condoLoading } = useCondo();

  // Permissions basées sur le modèle condos
  const canWrite = useMemo(() => {
    if (!user || !selectedCondo) return false;
    if (selectedCondo.ownerId === user.uid) return true;
    return selectedCondo.boardMemberIds?.includes(user.uid) ?? false;
  }, [user, selectedCondo]);
  const {
    cles,
    loading: clesLoading,
    error: hookError,
    createDefaultCle,
  } = useClesRepartition(selectedCondo?.id || '');

  const [lots, setLots] = useState<Lot[]>([]);
  const [lotsLoading, setLotsLoading] = useState(true);
  const [isCreatingDefault, setIsCreatingDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoCreateAttempted = useRef(false);

  // Subscribe to lots
  useEffect(() => {
    if (!selectedCondo) return;

    // Reset auto-create flag when condo changes
    autoCreateAttempted.current = false;

    const unsubscribe = subscribeToLots(selectedCondo.id, (updatedLots) => {
      setLots(updatedLots);
      setLotsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedCondo]);

  // Auto-create default clé on first access if no clés exist
  useEffect(() => {
    const autoCreateDefault = async () => {
      if (
        !clesLoading &&
        !lotsLoading &&
        cles.length === 0 &&
        lots.length > 0 &&
        !isCreatingDefault &&
        !autoCreateAttempted.current
      ) {
        autoCreateAttempted.current = true;
        await handleCreateDefault();
      }
    };

    autoCreateDefault();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clesLoading, lotsLoading, cles.length, lots.length]);

  const handleCreateDefault = async () => {
    if (!selectedCondo || lots.length === 0) return;

    setIsCreatingDefault(true);
    setError(null);

    try {
      await createDefaultCle(lots.map((l) => ({ id: l.id, tantiemes: l.tantiemes })));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors de la création de la clé par défaut'
      );
    } finally {
      setIsCreatingDefault(false);
    }
  };

  if (condoLoading || clesLoading || lotsLoading) {
    return <Loading message="Chargement des clés de répartition..." />;
  }

  if (!selectedCondo) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link href={'/lots' as Route}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux lots
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Clés de répartition</h1>
        <p className="text-sm text-muted-foreground">
          Gérez les clés de répartition pour distribuer les charges entre les lots
        </p>
      </div>

      {(error || hookError) && (
        <div className="mb-4">
          <ErrorMessage
            message={error || hookError?.message || 'Une erreur est survenue'}
            onRetry={() => setError(null)}
          />
        </div>
      )}

      {lots.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            Créez des lots avant de pouvoir gérer les clés de répartition.
          </p>
          {canWrite && (
            <Link href={'/lots/new' as Route}>
              <Button variant="outline" className="mt-4">
                Créer un lot
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <CleRepartitionList
          condoId={selectedCondo.id}
          cles={cles}
          onCreateDefault={canWrite ? handleCreateDefault : undefined}
          isCreatingDefault={isCreatingDefault}
          isEditable={canWrite}
        />
      )}
    </div>
  );
}
