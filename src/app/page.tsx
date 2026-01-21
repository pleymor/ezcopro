'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { FullPageLoading } from '@/components/ui/loading';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/copro');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return <FullPageLoading message="Redirection..." />;
}
