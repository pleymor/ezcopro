'use client';

import { useState } from 'react';
import { Mail, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInvitationStatus } from '@/hooks/useInvitationsExtranet';

interface InviteButtonProps {
  coproprietaireId: string;
  coproprietaireNom: string;
  coproprietaireEmail: string | null;
  linkedUserId?: string | null;
  currentUserEmail?: string | null;
  onInvite: (email: string) => Promise<void>;
  onResend?: () => Promise<void>;
  disabled?: boolean;
}

/**
 * Bouton pour inviter un copropriétaire sur l'extranet.
 * Affiche différents états selon le statut de l'invitation.
 */
export function InviteButton({
  coproprietaireId,
  coproprietaireNom,
  coproprietaireEmail,
  linkedUserId,
  currentUserEmail,
  onInvite,
  onResend,
  disabled = false,
}: InviteButtonProps) {
  const { hasPending, hasAccount: hasAccountFromInvitation, loading: statusLoading } = useInvitationStatus(coproprietaireId);

  // Compte actif si userId lié, invitation acceptée, ou email identique à l'utilisateur connecté
  const emailMatchesCurrentUser = !!(currentUserEmail && coproprietaireEmail &&
    currentUserEmail.toLowerCase() === coproprietaireEmail.toLowerCase());
  const hasAccount = !!linkedUserId || hasAccountFromInvitation || emailMatchesCurrentUser;
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState(coproprietaireEmail || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si le copropriétaire a déjà un compte, ne rien afficher ici
  // (l'icône est affichée à côté du nom dans CoproprietaireCard)
  if (hasAccount) {
    return null;
  }

  // Si une invitation est en attente, afficher uniquement le bouton Renvoyer
  // (l'icône de statut est affichée à côté du nom dans CoproprietaireCard)
  if (hasPending) {
    if (!onResend) return null;
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={async () => {
          setIsSubmitting(true);
          try {
            await onResend();
          } finally {
            setIsSubmitting(false);
          }
        }}
        disabled={isSubmitting || disabled}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : (
          <Send className="h-4 w-4 mr-1" />
        )}
        Renvoyer
      </Button>
    );
  }

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Veuillez saisir une adresse email');
      return;
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Adresse email invalide');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onInvite(email);
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || statusLoading}
        >
          {statusLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4 mr-1" />
          )}
          Inviter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inviter {coproprietaireNom} sur l&apos;extranet</DialogTitle>
          <DialogDescription>
            Un email d&apos;invitation sera envoyé à l&apos;adresse indiquée.
            Le copropriétaire pourra créer son compte et accéder à son espace personnel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemple.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              disabled={isSubmitting}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Envoyer l&apos;invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
