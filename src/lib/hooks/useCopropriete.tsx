'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { getUserCoproprietes } from '@/lib/firebase/services/copropriete';
import type { Copropriete } from '@/types/copropriete';

const STORAGE_KEY = 'ezcopro_selected_copro_id';
const STORAGE_COPRO_KEY = 'ezcopro_selected_copro';

// Test mode configuration
const IS_TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === 'true';
const TEST_COPRO: Copropriete = {
  id: 'test-copro-123',
  nom: 'Résidence Test',
  adresse: '123 Rue du Test, 75001 Paris',
  members: ['test-user-123'],
  totalTantiemes: 500,
  createdBy: 'test-user-123',
  createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
  updatedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
};

// Helper to check localStorage test modes (client-side only)
function isTestEmptyMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('ezcopro_test_empty_mode') === 'true';
}

function isTestErrorMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('ezcopro_test_error_mode') === 'true';
}

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

    // In test mode, use mock data based on localStorage flags
    if (IS_TEST_MODE) {
      // Test error mode: simulate loading failure
      if (isTestErrorMode()) {
        setError('Erreur de chargement simulée pour les tests');
        setLoading(false);
        return;
      }
      // Test empty mode: simulate user with no coproprietes
      if (isTestEmptyMode()) {
        setCoproprietes([]);
        setSelectedCoproState(null);
        setLoading(false);
        return;
      }
      // Default test mode: user with one copropriete
      setCoproprietes([TEST_COPRO]);
      setSelectedCoproState(TEST_COPRO);
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
