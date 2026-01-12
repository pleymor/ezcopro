'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { ResolutionForm } from '@/components/assemblees-generales/ResolutionForm';
import { ResolutionList } from '@/components/assemblees-generales/ResolutionList';
import { useCopropriete } from '@/lib/hooks/useCopropriete';
import { useAssembleeGenerale } from '@/hooks/useAssembleeGenerale';
import { useResolutions } from '@/hooks/useResolutions';
import type { Resolution } from '@/types/assemblee-generale';

interface PageProps {
  params: Promise<{ agId: string }>;
}

export default function OrdreDuJourPage({ params }: PageProps) {
  const { agId } = use(params);
  const { selectedCopro, loading: coproLoading } = useCopropriete();
  const { ag, loading: agLoading, error: agError } = useAssembleeGenerale(
    selectedCopro?.id ?? null,
    agId
  );
  const { resolutions, loading: resolutionsLoading, error: resolutionsError } = useResolutions(
    selectedCopro?.id ?? null,
    agId
  );

  const [showForm, setShowForm] = useState(false);
  const [editingResolution, setEditingResolution] = useState<Resolution | null>(null);

  if (coproLoading || agLoading || resolutionsLoading) {
    return <Loading message="Chargement de l'ordre du jour..." />;
  }

  if (!selectedCopro) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  if (agError || resolutionsError) {
    return <ErrorMessage message={(agError || resolutionsError)?.message ?? 'Erreur'} />;
  }

  if (!ag) {
    return <ErrorMessage message="Assemblée générale non trouvée" />;
  }

  const isEditable = ag.statut === 'brouillon' || ag.statut === 'convoquee';

  const handleSuccess = () => {
    setShowForm(false);
    setEditingResolution(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingResolution(null);
  };

  const handleEdit = (resolution: Resolution) => {
    setEditingResolution(resolution);
    setShowForm(true);
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
          <h1 className="text-2xl font-bold">Ordre du jour</h1>
          <p className="text-sm text-muted-foreground">
            {resolutions.length} résolution{resolutions.length > 1 ? 's' : ''}
          </p>
        </div>
        {isEditable && !showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une résolution
          </Button>
        )}
      </div>

      {!isEditable && (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
          L&apos;ordre du jour ne peut plus être modifié car l&apos;AG est {ag.statut === 'en_cours' ? 'en cours' : 'terminée'}.
        </div>
      )}

      {showForm ? (
        <div className="mb-6">
          <ResolutionForm
            coproId={selectedCopro.id}
            agId={agId}
            resolution={editingResolution ?? undefined}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <ResolutionList
          resolutions={resolutions}
          coproId={selectedCopro.id}
          agId={agId}
          onEdit={isEditable ? handleEdit : undefined}
          disabled={!isEditable}
        />
      )}

      {resolutions.length === 0 && !showForm && isEditable && (
        <div className="mt-4 rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Aucune résolution pour l&apos;instant</p>
          <Button variant="outline" className="mt-4" onClick={() => setShowForm(true)}>
            Créer la première résolution
          </Button>
        </div>
      )}
    </div>
  );
}
