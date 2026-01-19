'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  AuthUser,
  signInWithGoogle as firebaseSignInWithGoogle,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getIdTokenResult,
} from '@/lib/firebase/auth';
import { CustomClaims } from '@/types/auth';

// Test mode configuration
const IS_TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === 'true';
const TEST_USER: AuthUser = {
  uid: 'test-user-123',
  email: 'test@ezcopro.local',
  displayName: 'Test User',
  photoURL: null,
};

// Fonction pour obtenir les claims de test (vérifie localStorage pour le rôle)
function getTestClaims(): CustomClaims {
  if (typeof window !== 'undefined') {
    const testRole = localStorage.getItem('ezcopro_test_role');
    if (testRole === 'coproprietaire') {
      const coproprietaireId = localStorage.getItem('ezcopro_test_coproprietaire_id') || 'test-cp-1';
      return {
        role: 'coproprietaire',
        coproprieteId: 'test-copro-123',
        coproprietaireId,
      };
    }
  }
  // Par défaut: syndic
  return {
    role: 'syndic',
    coproprieteId: 'test-copro-123',
  };
}

// Claims par défaut pour le mode test (syndic)
const TEST_CLAIMS: CustomClaims = {
  role: 'syndic',
  coproprieteId: 'test-copro-123',
};

interface AuthContextType {
  user: AuthUser | null;
  claims: CustomClaims | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshClaims: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(IS_TEST_MODE ? TEST_USER : null);
  const [claims, setClaims] = useState<CustomClaims | null>(IS_TEST_MODE ? getTestClaims() : null);
  const [loading, setLoading] = useState(!IS_TEST_MODE);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer les claims depuis le token
  const fetchClaims = useCallback(async () => {
    if (IS_TEST_MODE) {
      setClaims(getTestClaims());
      return;
    }
    try {
      const tokenResult = await getIdTokenResult();
      if (tokenResult?.claims) {
        const customClaims = tokenResult.claims as unknown as CustomClaims;
        // Vérifier que les claims attendus sont présents
        if (customClaims.role && customClaims.coproprieteId) {
          setClaims(customClaims);
        } else {
          setClaims(null);
        }
      } else {
        setClaims(null);
      }
    } catch {
      setClaims(null);
    }
  }, []);

  useEffect(() => {
    // In test mode, skip Firebase auth
    if (IS_TEST_MODE) {
      setUser(TEST_USER);
      setClaims(getTestClaims());
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(async (authUser) => {
      setUser(authUser);
      if (authUser) {
        await fetchClaims();
      } else {
        setClaims(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchClaims]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const authUser = await firebaseSignInWithGoogle();
      setUser(authUser);
      await fetchClaims();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchClaims]);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await firebaseSignOut();
      setUser(null);
      setClaims(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de déconnexion';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Fonction pour rafraîchir les claims (utile après acceptation d'invitation)
  const refreshClaims = useCallback(async () => {
    await fetchClaims();
  }, [fetchClaims]);

  const value: AuthContextType = {
    user,
    claims,
    loading,
    error,
    signInWithGoogle,
    signOut,
    refreshClaims,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
