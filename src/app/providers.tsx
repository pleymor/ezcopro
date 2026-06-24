'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/hooks/useAuth';
import { CondoProvider } from '@/lib/hooks/useCondo';
import { ThemeProvider } from '@/lib/hooks/useTheme';
import { ViewModeProvider } from '@/hooks/useViewMode';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CondoProvider>
          <ViewModeProvider>{children}</ViewModeProvider>
        </CondoProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
