'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PresenceSheet } from '@/components/assemblees-generales/PresenceSheet';
import { PresenceSummary } from '@/components/assemblees-generales/PresenceSummary';
import { useCopropriete } from '@/lib/hooks/useCopropriete';
import { useAssembleeGenerale } from '@/hooks/useAssembleeGenerale';
import { usePresences } from '@/hooks/usePresences';
import { transitionAGStatus } from '@/lib/firebase/services/assemblee-generale';
import { useAuth } from '@/lib/hooks/useAuth';

interface PageProps {
  params: Promise<{ agId: string }>;
}

export default function PresencePage({ params }: PageProps) {
  const { agId } = use(params);
  const { user } = useAuth();
  const { selectedCopro, loading: coproLoading } = useCopropriete();
  const { ag, loading: agLoading, error: agError } = useAssembleeGenerale(
    selectedCopro?.id ?? null,
    agId
  );
  const {
    presences,
    summary,
    loading: presencesLoading,
    error: presencesError,
    initialize,
  } = usePresences(selectedCopro?.id ?? null, agId);

  const [isInitializing, setIsInitializing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);

  if (coproLoading || agLoading || presencesLoading) {
    return <Loading message="Chargement de la feuille de présence..." />;
  }

  if (!selectedCopro) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  if (agError || presencesError) {
    return <ErrorMessage message={(agError || presencesError)?.message ?? 'Erreur'} />;
  }

  if (!ag) {
    return <ErrorMessage message="Assemblée générale non trouvée" />;
  }

  const canEdit = ag.statut === 'convoquee' || ag.statut === 'en_cours';
  const canStart = ag.statut === 'convoquee' && presences.length > 0;
  const isReadOnly = ag.statut === 'terminee';

  const handleInitialize = async () => {
    if (!user) return;
    setIsInitializing(true);
    try {
      await initialize(user.uid, user.email || '');
    } catch (err) {
      console.error('Error initializing presences:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleStartAG = async () => {
    if (!user || !selectedCopro) return;
    setIsStarting(true);
    try {
      await transitionAGStatus(selectedCopro.id, agId, user.uid, user.email || '', 'en_cours');
      setShowStartDialog(false);
    } catch (err) {
      console.error('Error starting AG:', err);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/assemblees-generales/${agId}` as '/assemblees-generales/[agId]'}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l&apos;AG
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Feuille de présence</h1>
          <p className="text-sm text-muted-foreground">
            {presences.length} copropriétaire{presences.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {presences.length === 0 && ag.statut !== 'terminee' && (
            <Button onClick={handleInitialize} disabled={isInitializing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isInitializing ? 'animate-spin' : ''}`} />
              Initialiser
            </Button>
          )}
          {canStart && (
            <Button onClick={() => setShowStartDialog(true)} variant="default">
              <Play className="mr-2 h-4 w-4" />
              Démarrer l&apos;AG
            </Button>
          )}
        </div>
      </div>

      {isReadOnly && (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
          L&apos;AG est terminée. La feuille de présence est en lecture seule.
        </div>
      )}

      {ag.statut === 'brouillon' && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
          L&apos;AG doit d&apos;abord être convoquée avant de pouvoir gérer les présences.
        </div>
      )}

      <div className="mb-6">
        <PresenceSummary summary={summary} totalTantiemes={ag.totalTantiemes} />
      </div>

      {presences.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            La feuille de présence n&apos;a pas encore été initialisée.
          </p>
          {ag.statut !== 'terminee' && ag.statut !== 'brouillon' && (
            <Button variant="outline" className="mt-4" onClick={handleInitialize} disabled={isInitializing}>
              Initialiser la feuille de présence
            </Button>
          )}
        </div>
      ) : (
        <PresenceSheet
          presences={presences}
          coproId={selectedCopro.id}
          agId={agId}
          disabled={!canEdit}
        />
      )}

      <ConfirmDialog
        open={showStartDialog}
        onOpenChange={setShowStartDialog}
        title="Démarrer l'assemblée générale"
        description="Une fois l'AG démarrée, vous pourrez procéder aux votes. Êtes-vous sûr de vouloir commencer ?"
        confirmLabel="Démarrer"
        onConfirm={handleStartAG}
        isLoading={isStarting}
      />
    </div>
  );
}
