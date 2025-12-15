'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

// This page is only available in test/emulator mode
// It allows programmatic login for e2e tests

export default function TestLoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only allow in emulator mode
    if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS !== 'true') {
      router.push('/login');
      return;
    }

    // Get credentials from URL params
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    const password = params.get('password');

    if (!email || !password) {
      setError('Missing email or password in URL params');
      return;
    }

    setStatus('loading');

    // Try to sign in, create user if doesn't exist
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        setStatus('success');
        router.push('/dashboard');
      })
      .catch(async (signInError) => {
        // If user doesn't exist, create it
        if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, email, password);
            setStatus('success');
            router.push('/dashboard');
          } catch (createError) {
            setError(`Failed to create user: ${createError}`);
            setStatus('error');
          }
        } else {
          setError(`Sign in failed: ${signInError.message}`);
          setStatus('error');
        }
      });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Test Login</h1>
        {status === 'loading' && <p>Authenticating...</p>}
        {status === 'success' && <p className="text-green-600">Success! Redirecting...</p>}
        {status === 'error' && <p className="text-red-600">{error}</p>}
        {status === 'idle' && !error && <p>Waiting for credentials...</p>}
        {error && <p className="text-red-600">{error}</p>}
      </div>
    </div>
  );
}
