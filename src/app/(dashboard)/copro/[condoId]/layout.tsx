'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCondoFromUrl } from '@/lib/hooks/useCondoFromUrl';
import { FullPageLoading } from '@/components/ui/loading';
import { CondoNavigation } from '@/components/layouts/CondoNavigation';

// Update the last condo cookie
function setLastCondoCookie(condoId: string) {
  document.cookie = `lastCondoId=${condoId}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

export default function CondoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { condoId, currentCondo, loading, hasAccess, refresh } = useCondoFromUrl();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to condo selector if no access
  useEffect(() => {
    if (!loading && !hasAccess) {
      router.replace('/copro');
    }
  }, [loading, hasAccess, router]);

  // Update last condo cookie when accessing a condo
  useEffect(() => {
    if (hasAccess && condoId) {
      setLastCondoCookie(condoId);
    }
  }, [hasAccess, condoId]);

  // Check if a condo refresh is needed (after accepting invitation)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const needsRefresh = localStorage.getItem('ezcopro_needs_condo_refresh');
    if (needsRefresh === 'true') {
      localStorage.removeItem('ezcopro_needs_condo_refresh');
      refresh();
    }
  }, [pathname, refresh]);

  if (loading) {
    return <FullPageLoading />;
  }

  if (!hasAccess || !condoId || !currentCondo) {
    return <FullPageLoading />;
  }

  return (
    <>
      <CondoNavigation condoId={condoId} condo={currentCondo} />
      <main id="main-content" className="flex-1 pb-16 md:pb-0 md:ml-64">
        {children}
      </main>
    </>
  );
}
