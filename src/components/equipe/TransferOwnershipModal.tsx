'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Crown, AlertTriangle } from 'lucide-react';
import type { MembreSyndic } from '@/types/membre-syndic';

interface MembreAvecId extends MembreSyndic {
  userId: string;
}

interface TransferOwnershipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetMembre: MembreAvecId | null;
  onTransfer: (newOwnerId: string) => Promise<void>;
}

export function TransferOwnershipModal({
  open,
  onOpenChange,
  targetMembre,
  onTransfer,
}: TransferOwnershipModalProps) {
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setError(null);
    onOpenChange(false);
  };

  const handleTransfer = async () => {
    if (!targetMembre) return;

    setIsTransferring(true);
    setError(null);

    try {
      await onTransfer(targetMembre.userId);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsTransferring(false);
    }
  };

  const targetName = targetMembre?.displayName || targetMembre?.email || 'ce membre';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Transférer la propriété
          </DialogTitle>
          <DialogDescription>
            Vous êtes sur le point de transférer la propriété de cette copropriété.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              {error}
            </Alert>
          )}

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <div className="ml-2">
              <p className="font-medium">Attention, cette action est importante</p>
              <ul className="mt-2 text-sm text-muted-foreground list-disc pl-4 space-y-1">
                <li><strong>{targetName}</strong> deviendra le nouvel administrateur</li>
                <li>Vous deviendrez gestionnaire</li>
                <li>Seul le nouvel administrateur pourra gerer l&apos;equipe</li>
                <li>Cette action peut etre annulee par le nouvel administrateur</li>
              </ul>
            </div>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isTransferring}
          >
            Annuler
          </Button>
          <Button
            variant="default"
            onClick={handleTransfer}
            disabled={isTransferring}
          >
            {isTransferring ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Transfert...
              </>
            ) : (
              <>
                <Crown className="h-4 w-4 mr-2" />
                Confirmer le transfert
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
