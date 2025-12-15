'use client';

import { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { createInvitation } from '@/lib/firebase/services/invitation';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Coproprietaire } from '@/types/coproprietaire';
import { Copy, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface InvitationModalProps {
  coproId: string;
  coproprietaire: Coproprietaire;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvitationModal({
  coproId,
  coproprietaire,
  open,
  onOpenChange,
}: InvitationModalProps) {
  const { user } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateCode = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const invitation = await createInvitation(coproId, coproprietaire.id, user.uid);
      setCode(invitation.code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!code) return;

    const inviteUrl = `${window.location.origin}/join/${code}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setCode(null);
    setError(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg'
          )}
        >
          <DialogPrimitive.Close
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>

          <div className="flex flex-col space-y-2 text-center sm:text-left">
            <DialogPrimitive.Title className="text-lg font-semibold">
              Inviter {coproprietaire.nom} {coproprietaire.prenom}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground">
              Générez un code d&apos;invitation pour permettre à ce copropriétaire de rejoindre
              l&apos;espace en ligne.
            </DialogPrimitive.Description>
          </div>

          <div className="space-y-4">
            {!code ? (
              <Button onClick={handleGenerateCode} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Génération...
                  </>
                ) : (
                  'Générer un code d\'invitation'
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-sm text-muted-foreground">Code d&apos;invitation</p>
                  <p className="text-3xl font-bold tracking-widest">{code}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Valide pendant 7 jours
                  </p>
                </div>
                <Button onClick={handleCopy} variant="outline" className="w-full">
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copier le lien d&apos;invitation
                    </>
                  )}
                </Button>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
