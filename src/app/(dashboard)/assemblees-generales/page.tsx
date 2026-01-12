'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Calendar, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { AGList } from '@/components/assemblees-generales/AGList';
import { AGHistoryList } from '@/components/assemblees-generales/AGHistoryList';
import { useCopropriete } from '@/lib/hooks/useCopropriete';
import { useAssembleesGenerales } from '@/hooks/useAssembleesGenerales';
import { cn } from '@/lib/utils/cn';

type TabType = 'active' | 'history';

export default function AssembleesGeneralesPage() {
  const { selectedCopro, loading: coproLoading } = useCopropriete();
  const { ags, loading: agsLoading, error } = useAssembleesGenerales(selectedCopro?.id ?? null);
  const [activeTab, setActiveTab] = useState<TabType>('active');

  if (coproLoading || agsLoading) {
    return <Loading message="Chargement des assemblées générales..." />;
  }

  if (!selectedCopro) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  const activeAGs = ags.filter((ag) => ag.statut !== 'terminee');
  const historyAGs = ags.filter((ag) => ag.statut === 'terminee');

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assemblées Générales</h1>
          <p className="text-sm text-muted-foreground">
            {ags.length} assemblée{ags.length > 1 ? 's' : ''} générale{ags.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/assemblees-generales/nouvelle">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle AG
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b">
        <button
          onClick={() => setActiveTab('active')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'active'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Calendar className="h-4 w-4" />
          En cours ({activeAGs.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <History className="h-4 w-4" />
          Historique ({historyAGs.length})
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'active' && (
        <>
          {activeAGs.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">Aucune assemblée générale en cours</p>
              <Link href="/assemblees-generales/nouvelle">
                <Button variant="outline" className="mt-4">
                  Créer une nouvelle AG
                </Button>
              </Link>
            </div>
          ) : (
            <AGList ags={activeAGs} />
          )}
        </>
      )}

      {activeTab === 'history' && (
        <AGHistoryList ags={historyAGs} />
      )}
    </div>
  );
}
