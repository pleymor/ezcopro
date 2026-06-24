'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { RoleSelect } from './RoleSelect';
import type { RoleInvitable } from '@/types/invitation-gestionnaire';
import { Mail, UserPlus } from 'lucide-react';

const inviteFormSchema = z.object({
  email: z.string().email('Email invalide'),
  role: z.enum(['gestionnaire', 'lecteur']),
});

type InviteFormData = z.infer<typeof inviteFormSchema>;

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (data: { email: string; role: RoleInvitable }) => Promise<unknown>;
}

export function InviteMemberModal({
  open,
  onOpenChange,
  onInvite,
}: InviteMemberModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
      role: 'gestionnaire',
    },
  });

  const role = watch('role');

  const handleClose = () => {
    reset();
    setError(null);
    setSuccess(false);
    onOpenChange(false);
  };

  const onSubmit = async (data: InviteFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await onInvite(data);
      setSuccess(true);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Inviter un membre
          </DialogTitle>
          <DialogDescription>
            Envoyez une invitation par email pour ajouter un nouveau membre a l&apos;equipe.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              {error}
            </Alert>
          )}

          {success && (
            <Alert>
              Invitation envoyee ! Le destinataire recevra un lien pour rejoindre l&apos;equipe.
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="email@exemple.com"
                className="pl-10"
                {...register('email')}
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <RoleSelect
              value={role}
              onChange={(v) => setValue('role', v as RoleInvitable)}
              disabled={isSubmitting}
              excludeProprietaire
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Envoi...
                </>
              ) : (
                'Envoyer l\'invitation'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
