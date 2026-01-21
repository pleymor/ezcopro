'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { getUserCondos } from '@/lib/firebase/services/condo';
import type { Condo } from '@/types/condo';

const STORAGE_KEY = 'ezcopro_selected_condo_id';
const STORAGE_CONDO_KEY = 'ezcopro_selected_condo';

interface CondoContextType {
  condos: Condo[];
  selectedCondo: Condo | null;
  setSelectedCondo: (condo: Condo | null) => void;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const CondoContext = createContext<CondoContextType | undefined>(undefined);

interface CondoProviderProps {
  children: ReactNode;
}

// Read from localStorage (synchronous, client-side)
function getStoredCondo(): Condo | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_CONDO_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function getStoredCondoId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function CondoProvider({ children }: CondoProviderProps) {
  const { user, loading: authLoading } = useAuth();
  const [condos, setCondos] = useState<Condo[]>([]);
  // Initialize with localStorage (accepts hydration mismatch as intentional)
  const [selectedCondo, setSelectedCondoState] = useState<Condo | null>(() => getStoredCondo());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wrapper to persist the choice
  const setSelectedCondo = useCallback((condo: Condo | null) => {
    setSelectedCondoState(condo);
    if (condo) {
      localStorage.setItem(STORAGE_KEY, condo.id);
      localStorage.setItem(STORAGE_CONDO_KEY, JSON.stringify(condo));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_CONDO_KEY);
    }
  }, []);

  const fetchCondos = useCallback(async () => {
    if (!user) {
      // Don't set loading=false here - wait for auth to complete
      // This prevents a race condition where loading becomes false
      // before we've had a chance to fetch with a valid user
      setCondos([]);
      setSelectedCondoState(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userCondos = await getUserCondos(user.uid);
      setCondos(userCondos);

      // Check if saved condo still exists
      const savedId = getStoredCondoId();
      const savedCondo = savedId ? userCondos.find(c => c.id === savedId) : null;

      if (savedCondo) {
        // Update with fresh data
        setSelectedCondoState(savedCondo);
        localStorage.setItem(STORAGE_CONDO_KEY, JSON.stringify(savedCondo));
      } else if (userCondos.length === 1 && !savedId) {
        // Auto-select only if no condo was saved
        setSelectedCondo(userCondos[0]!);
      } else if (savedId && !savedCondo) {
        // The saved condo no longer exists, clean up
        setSelectedCondo(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading condos');
    } finally {
      setLoading(false);
    }
  }, [user, setSelectedCondo]);

  useEffect(() => {
    fetchCondos();
  }, [user]); // Only when user changes

  const value: CondoContextType = {
    condos,
    selectedCondo,
    setSelectedCondo,
    loading: authLoading || loading,
    error,
    refresh: fetchCondos,
  };

  return (
    <CondoContext.Provider value={value}>{children}</CondoContext.Provider>
  );
}

export function useCondo(): CondoContextType {
  const context = useContext(CondoContext);
  if (context === undefined) {
    throw new Error('useCondo must be used within a CondoProvider');
  }
  return context;
}
