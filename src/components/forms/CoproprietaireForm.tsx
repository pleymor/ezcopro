'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
  coproprietaireFormSchema,
  type CoproprietaireFormData,
  type Coproprietaire,
} from '@/lib/schemas/coproprietaire';

interface CoproprietaireFormProps {
  initialData?: Partial<Coproprietaire>;
  onSubmit: (data: CoproprietaireFormData) => Promise<void>;
  isLoading?: boolean;
}

export function CoproprietaireForm({
  initialData,
  onSubmit,
  isLoading = false,
}: CoproprietaireFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CoproprietaireFormData>({
    resolver: zodResolver(coproprietaireFormSchema),
    defaultValues: {
      nom: initialData?.nom || '',
      prenom: initialData?.prenom || '',
      email: initialData?.email || '',
      telephone: initialData?.telephone || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nom">Nom</Label>
        <Input
          id="nom"
          placeholder="Dupont"
          {...register('nom')}
          aria-invalid={!!errors.nom}
        />
        {errors.nom && (
          <p className="text-sm text-destructive">{errors.nom.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="prenom">Prénom (optionnel)</Label>
        <Input
          id="prenom"
          placeholder="Jean"
          {...register('prenom')}
          aria-invalid={!!errors.prenom}
        />
        {errors.prenom && (
          <p className="text-sm text-destructive">{errors.prenom.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email (optionnel)</Label>
        <Input
          id="email"
          type="email"
          placeholder="jean.dupont@email.com"
          {...register('email')}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="telephone">Téléphone (optionnel)</Label>
        <Input
          id="telephone"
          type="tel"
          placeholder="0612345678"
          {...register('telephone')}
          aria-invalid={!!errors.telephone}
        />
        {errors.telephone && (
          <p className="text-sm text-destructive">{errors.telephone.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Format: 0612345678 ou +33612345678
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Enregistrement...
          </>
        ) : initialData?.id ? (
          'Mettre à jour'
        ) : (
          'Créer le copropriétaire'
        )}
      </Button>
    </form>
  );
}
