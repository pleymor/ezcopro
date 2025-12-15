'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { useAuth } from '@/lib/hooks/useAuth';
import { FullPageLoading } from '@/components/ui/loading';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/lots');
    }
  }, [user, loading, router]);

  if (loading) {
    return <FullPageLoading message="Vérification de la connexion..." />;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">EzCopro</CardTitle>
        <CardDescription>
          Gestion simplifiée pour les copropriétés avec syndic bénévole
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">
          Connectez-vous pour accéder à votre espace copropriété
        </p>
        <GoogleSignInButton />
      </CardContent>
    </Card>
  );
}
