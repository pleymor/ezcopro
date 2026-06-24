'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type ViewMode = 'admin' | 'extranet';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  isExtranetMode: boolean;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

const STORAGE_KEY = 'ezcopro_view_mode';

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>('admin');
  const [isInitialized, setIsInitialized] = useState(false);

  // Charger le mode depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY) as ViewMode | null;
      if (stored === 'admin' || stored === 'extranet') {
        setViewModeState(stored);
      }
      setIsInitialized(true);
    }
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }, []);

  const toggleViewMode = useCallback(() => {
    const newMode = viewMode === 'admin' ? 'extranet' : 'admin';
    setViewMode(newMode);
  }, [viewMode, setViewMode]);

  // Ne pas rendre les enfants tant que le mode n'est pas initialisé
  // pour éviter un flash de contenu incorrect
  if (!isInitialized) {
    return null;
  }

  return (
    <ViewModeContext.Provider
      value={{
        viewMode,
        setViewMode,
        toggleViewMode,
        isExtranetMode: viewMode === 'extranet',
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode(): ViewModeContextType {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
}
