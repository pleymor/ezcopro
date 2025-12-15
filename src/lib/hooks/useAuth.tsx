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
} from '@/lib/firebase/auth';

// Test mode configuration
const IS_TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === 'true';
const TEST_USER: AuthUser = {
  uid: 'test-user-123',
  email: 'test@ezcopro.local',
  displayName: 'Test User',
  photoURL: null,
};

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(IS_TEST_MODE ? TEST_USER : null);
  const [loading, setLoading] = useState(!IS_TEST_MODE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In test mode, skip Firebase auth
    if (IS_TEST_MODE) {
      setUser(TEST_USER);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const authUser = await firebaseSignInWithGoogle();
      setUser(authUser);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await firebaseSignOut();
      setUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de déconnexion';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
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
