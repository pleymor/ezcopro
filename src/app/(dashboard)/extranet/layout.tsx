'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useExtranetDocuments } from '@/hooks/useExtranetDocuments';
import { FullPageLoading } from '@/components/ui/loading';
import { ExtranetNavigation } from '@/components/layouts/ExtranetNavigation';

/**
 * Layout pour les pages extranet copropriétaires.
 * Affiche une navigation adaptée aux copropriétaires.
 */
export default function ExtranetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const { loading: roleLoading } = useUserRole();
  const { newDocumentsCount } = useExtranetDocuments();
  const router = useRouter();

  const loading = authLoading || roleLoading;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Note: Dans une vraie application, on vérifierait aussi isCoproprietaire
  // et on redirigerait vers / si l'utilisateur n'est pas un copropriétaire.
  // Pour le développement, on laisse l'accès ouvert.

  if (loading) {
    return <FullPageLoading />;
  }

  if (!user) {
    return null;
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
