'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Clock, CheckCircle2, Users, LogIn } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  validateInvitationGestionnaire,
  acceptInvitationGestionnaire,
} from '@/lib/firebase/services/invitation-gestionnaire';
import type { InvitationGestionnaire } from '@/types/invitation-gestionnaire';
import { roleLabels } from '@/types/membre-syndic';

type InvitationState =
  | { status: 'loading' }
  | { status: 'valid'; invitation: InvitationGestionnaire }
  | { status: 'expired' }
  | { status: 'not_found' }
  | { status: 'accepted' }
  | { status: 'error'; message: string };

export default function InvitationEquipePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [state, setState] = useState<InvitationState>({ status: 'loading' });
  const [accepting, setAccepting] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const checkInvitation = async () => {
      try {
        const invitation = await validateInvitationGestionnaire(token);

        if (!invitation) {
          setState({ status: 'not_found' });
          return;
        }

        setState({ status: 'valid', invitation });
      } catch (err) {
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Erreur lors de la validation',
        });
      }
    };

    checkInvitation();
  }, [token]);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Erreur connexion:', err);
    } finally {
      setSigningIn(false);
    }
  };

  const handleAccept = async () => {
    if (state.status !== 'valid' || !user) return;

    setAccepting(true);
    try {
      await acceptInvitationGestionnaire(
        token,
        user.uid,
        user.email || '',
        user.displayName || undefined
      );
      // Signaler qu'un refresh des copropriétés est nécessaire
      localStorage.setItem('ezcopro_needs_copro_refresh', 'true');
      setState({ status: 'accepted' });
      // Rediriger vers le dashboard apres 2 secondes
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Erreur lors de l\'acceptation',
      });
    } finally {
      setAccepting(false);
    }
  };

  if (state.status === 'loading' || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (state.status === 'accepted') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle>Invitation acceptee !</CardTitle>
          <CardDescription>
            Vous avez rejoint l&apos;equipe. Redirection en cours...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (state.status === 'expired') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
            <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle>Invitation expiree</CardTitle>
          <CardDescription>
            Cette invitation a expire. Demandez a l&apos;administrateur de vous envoyer une nouvelle invitation.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button variant="outline" asChild>
            <Link href="/">Retour a l&apos;accueil</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (state.status === 'not_found' || state.status === 'error') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle>Invitation invalide</CardTitle>
          <CardDescription>
            {state.status === 'error'
              ? state.message
              : 'Cette invitation n\'existe pas ou a ete annulee.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button variant="outline" asChild>
            <Link href="/">Retour a l&apos;accueil</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Status: valid
  const { invitation } = state;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Invitation a rejoindre une equipe</CardTitle>
        <CardDescription>
          Vous avez ete invite a rejoindre l&apos;equipe de gestion
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Copropriete</span>
            <span className="font-medium">{invitation.coproprieteNom}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Role</span>
            <Badge variant="secondary">{roleLabels[invitation.role]}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm">{invitation.email}</span>
          </div>
        </div>

        {user ? (
          <div className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              Connecte en tant que <strong>{user.email}</strong>
            </p>
            <Button
              className="w-full"
              onClick={handleAccept}
              disabled={accepting}
            >
              {accepting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Acceptation...
                </>
              ) : (
                'Accepter l\'invitation'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              Connectez-vous pour accepter cette invitation
            </p>
            <Button
              className="w-full"
              onClick={handleSignIn}
              disabled={signingIn}
            >
              {signingIn ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Connexion...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Se connecter avec Google
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
