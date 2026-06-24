'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { ExtranetCondoProvider } from '@/hooks/useExtranetCondo';
import { FullPageLoading } from '@/components/ui/loading';
import { ExtranetLayoutContent } from '@/components/layouts/ExtranetLayoutContent';

/**
 * Layout pour les pages extranet copropriétaires.
 * Affiche une navigation adaptée aux copropriétaires.
 */
export default function ExtranetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <FullPageLoading />;
  }

  if (!user) {
    return null;
  }

  return (
    <ExtranetCondoProvider>
      <ExtranetLayoutContent>{children}</ExtranetLayoutContent>
    </ExtranetCondoProvider>
  );
}
