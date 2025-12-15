'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { getUserCoproprietes } from '@/lib/firebase/services/copropriete';
import type { Copropriete } from '@/types/copropriete';

const STORAGE_KEY = 'ezcopro_selected_copro_id';
const STORAGE_COPRO_KEY = 'ezcopro_selected_copro';

interface CoproprieteContextType {
  coproprietes: Copropriete[];
  selectedCopro: Copropriete | null;
  setSelectedCopro: (copro: Copropriete | null) => void;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const CoproprieteContext = createContext<CoproprieteContextType | undefined>(undefined);

interface CoproprieteProviderProps {
  children: ReactNode;
}

// Lire depuis localStorage (synchrone, côté client)
function getStoredCopro(): Copropriete | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_COPRO_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function getStoredCoproId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function CoproprieteProvider({ children }: CoproprieteProviderProps) {
  const { user } = useAuth();
  const [coproprietes, setCoproprietes] = useState<Copropriete[]>([]);
  // Initialiser avec localStorage (accepte hydration mismatch car c'est intentionnel)
  const [selectedCopro, setSelectedCoproState] = useState<Copropriete | null>(() => getStoredCopro());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wrapper pour persister le choix
  const setSelectedCopro = useCallback((copro: Copropriete | null) => {
    setSelectedCoproState(copro);
    if (copro) {
      localStorage.setItem(STORAGE_KEY, copro.id);
      localStorage.setItem(STORAGE_COPRO_KEY, JSON.stringify(copro));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_COPRO_KEY);
    }
  }, []);

  const fetchCoproprietes = useCallback(async () => {
    if (!user) {
      setCoproprietes([]);
      setSelectedCoproState(null);
      setLoading(false);
      return;
    }

    setError(null);

    try {
      const copros = await getUserCoproprietes(user.uid);
      setCoproprietes(copros);

      // Vérifier que la copro sauvegardée existe toujours
      const savedId = getStoredCoproId();
      const savedCopro = savedId ? copros.find(c => c.id === savedId) : null;

      if (savedCopro) {
        // Mettre à jour avec les données fraîches
        setSelectedCoproState(savedCopro);
        localStorage.setItem(STORAGE_COPRO_KEY, JSON.stringify(savedCopro));
      } else if (copros.length === 1 && !savedId) {
        // Auto-sélection uniquement si aucune copro n'était sauvegardée
        setSelectedCopro(copros[0]!);
      } else if (savedId && !savedCopro) {
        // La copro sauvegardée n'existe plus, nettoyer
        setSelectedCopro(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [user, setSelectedCopro]);

  useEffect(() => {
    fetchCoproprietes();
  }, [user]); // Seulement quand user change

  const value: CoproprieteContextType = {
    coproprietes,
    selectedCopro,
    setSelectedCopro,
    loading: loading && !selectedCopro, // Pas de loading si on a déjà une copro
    error,
    refresh: fetchCoproprietes,
  };

  return (
    <CoproprieteContext.Provider value={value}>{children}</CoproprieteContext.Provider>
  );
}

export function useCopropriete(): CoproprieteContextType {
  const context = useContext(CoproprieteContext);
  if (context === undefined) {
    throw new Error('useCopropriete must be used within a CoproprieteProvider');
  }
  return context;
}
