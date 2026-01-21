'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCondo } from '@/lib/hooks/useCondo';
import { FullPageLoading } from '@/components/ui/loading';
import { Navigation } from '@/components/layouts/Navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const { refresh } = useCondo();
  const router = useRouter();
  const pathname = usePathname();

  // Check if we're on a condo route (has its own navigation)
  const isCondoRoute = pathname?.startsWith('/copro/') && pathname !== '/copro';
  // /copro is the condo selector - minimal layout, no nav
  const isCondoSelector = pathname === '/copro';

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Check if a condo refresh is needed (after accepting invitation)
  // Triggered on each route change via pathname
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

  if (!user) {
    return null;
  }

  // Condo routes have their own layout with CondoNavigation
  if (isCondoRoute) {
    return (
      <div className="flex min-h-screen flex-col">
        {children}
      </div>
    );
  }

  // Condo selector has minimal layout (no nav)
  if (isCondoSelector) {
    return (
      <div className="flex min-h-screen flex-col">
        <main id="main-content" className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main id="main-content" className="flex-1 pb-16 md:pb-0 md:ml-64">{children}</main>
    </div>
  );
}
