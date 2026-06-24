'use client';

import { useExtranetDocuments } from '@/hooks/useExtranetDocuments';
import { useExtranetCondo } from '@/hooks/useExtranetCondo';
import { ExtranetNavigation } from '@/components/layouts/ExtranetNavigation';
import { FullPageLoading } from '@/components/ui/loading';

interface ExtranetLayoutContentProps {
  children: React.ReactNode;
}

/**
 * Contenu du layout extranet.
 * Séparé du layout principal pour pouvoir utiliser useExtranetCondo
 * qui nécessite le provider.
 */
export function ExtranetLayoutContent({ children }: ExtranetLayoutContentProps) {
  const { loading: condoLoading } = useExtranetCondo();
  const { newDocumentsCount } = useExtranetDocuments();

  if (condoLoading) {
    return <FullPageLoading />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ExtranetNavigation newDocumentsCount={newDocumentsCount} />
      <main id="main-content" className="flex-1 pb-16 md:pb-0 md:ml-64">
        {children}
      </main>
    </div>
  );
}
