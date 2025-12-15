'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/hooks/useAuth';
import { CoproprieteProvider } from '@/lib/hooks/useCopropriete';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <CoproprieteProvider>{children}</CoproprieteProvider>
    </AuthProvider>
  );
}
