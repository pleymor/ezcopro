'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FullPageLoading } from '@/components/ui/loading';
import { InvitationAcceptForm } from '@/components/extranet/InvitationAcceptForm';
import {
  validateInvitationExtranet,
  acceptInvitation,
} from '@/lib/firebase/services/invitation-extranet';
import type { InvitationExtranet } from '@/types/invitation-extranet';

type InvitationState =
  | { status: 'loading' }
  | { status: 'valid'; invitation: InvitationExtranet }
  | { status: 'expired' }
  | { status: 'used' }
  | { status: 'not_found' }
  | { status: 'error'; message: string };

export default function InvitationPage() {
  const params = useParams();
  const token = params.token as string;
  const [state, setState] = useState<InvitationState>({ status: 'loading' });

  useEffect(() => {
    const checkInvitation = async () => {
      try {
        const result = await validateInvitationExtranet(token);

        if (!result.valid) {
          switch (result.error) {
            case 'expired':
              setState({ status: 'expired' });
              break;
            case 'used':
              setState({ status: 'used' });
              break;
            case 'not_found':
              setState({ status: 'not_found' });
              break;
            default:
              setState({ status: 'error', message: 'Erreur inconnue' });
          }
          return;
        }

        if (result.invitation) {
          setState({ status: 'valid', invitation: result.invitation });
        } else {
          setState({ status: 'error', message: 'Invitation invalide' });
        }
      } catch (err) {
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Erreur lors de la validation',
        });
      }
    };

    checkInvitation();
  }, [token]);

  const handleAccept = async (_password: string) => {
    if (state.status !== 'valid') return;

    // TODO: Créer le compte Firebase Auth avec email/password
    // Pour l'instant, on simule l'acceptation
    // La Cloud Function settera les custom claims

    // Marquer l'invitation comme acceptée
    await acceptInvitation(state.invitation.id, 'new-user-id');
  };

  if (state.status === 'loading') {
    return <FullPageLoading message="Vérification de l'invitation..." />;
  }

  if (state.status === 'expired') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
            <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle>Invitation expirée</CardTitle>
          <CardDescription>
            Cette invitation a expiré. Contactez votre syndic pour recevoir une nouvelle invitation.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button variant="outline" asChild>
            <a href="/login">Retour à la connexion</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (state.status === 'used') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle>Invitation déjà utilisée</CardTitle>
          <CardDescription>
            Vous avez déjà créé votre compte. Connectez-vous pour accéder à votre espace.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild>
            <a href="/login">Se connecter</a>
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
              : 'Cette invitation n\'existe pas ou a été supprimée.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button variant="outline" asChild>
            <a href="/login">Retour à la connexion</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Status: valid
  return (
    <InvitationAcceptForm
      email={state.invitation.email}
      onAccept={handleAccept}
    />
  );
}
