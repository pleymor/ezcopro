'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { coproprieteFormSchema, type CoproprieteFormData } from '@/lib/schemas/copropriete';
import { createCopropriete } from '@/lib/firebase/services/copropriete';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCopropriete } from '@/lib/hooks/useCopropriete';
import { useState } from 'react';

interface CoproprieteFormProps {
  onSuccess?: () => void;
}

export function CoproprieteForm({ onSuccess }: CoproprieteFormProps) {
  const { user } = useAuth();
  const { refresh } = useCopropriete();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CoproprieteFormData>({
    resolver: zodResolver(coproprieteFormSchema),
  });

  const onSubmit = async (data: CoproprieteFormData) => {
    if (!user) return;

    setError(null);
    try {
      await createCopropriete(user.uid, data);
      await refresh();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nom">Nom de la copropriété</Label>
        <Input
          id="nom"
          placeholder="Résidence Les Lilas"
          {...register('nom')}
          aria-invalid={!!errors.nom}
        />
        {errors.nom && (
          <p className="text-sm text-destructive">{errors.nom.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="adresse">Adresse</Label>
        <Input
          id="adresse"
          placeholder="12 rue des Fleurs, 75001 Paris"
          {...register('adresse')}
          aria-invalid={!!errors.adresse}
        />
        {errors.adresse && (
          <p className="text-sm text-destructive">{errors.adresse.message}</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Création en cours...
          </>
        ) : (
          'Créer la copropriété'
        )}
      </Button>
    </form>
  );
}
