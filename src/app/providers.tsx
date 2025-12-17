'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/hooks/useAuth';
import { CoproprieteProvider } from '@/lib/hooks/useCopropriete';
import { ThemeProvider } from '@/lib/hooks/useTheme';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CoproprieteProvider>{children}</CoproprieteProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
