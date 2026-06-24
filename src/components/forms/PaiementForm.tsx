'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { paiementFormSchema, type PaiementFormData, type Paiement } from '@/lib/schemas/paiement';

interface PaiementFormProps {
  initialData?: Partial<Paiement>;
  coproprietaires: Array<{ id: string; nom: string; prenom: string; isAnonymized?: boolean }>;
  onSubmit: (data: PaiementFormData) => Promise<void>;
  isLoading?: boolean;
}

export function PaiementForm({
  initialData,
  coproprietaires,
  onSubmit,
  isLoading = false,
}: PaiementFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PaiementFormData>({
    resolver: zodResolver(paiementFormSchema),
    defaultValues: {
      coproprietaireId: initialData?.coproprietaireId || '',
      montantEuros: initialData?.montantCents ? initialData.montantCents / 100 : 0,
      datePaiement: initialData?.datePaiement
        ? new Date(initialData.datePaiement.seconds * 1000).toISOString().split('T')[0] as unknown as Date
        : new Date().toISOString().split('T')[0] as unknown as Date,
      reference: initialData?.reference || '',
    },
  });

  // Filtrer les copropriétaires non anonymisés
  const activeCoproprietaires = coproprietaires.filter((c) => !c.isAnonymized);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="coproprietaireId">Copropriétaire</Label>
        <Select
          defaultValue={initialData?.coproprietaireId || ''}
          onValueChange={(value) => setValue('coproprietaireId', value)}
        >
          <SelectTrigger id="coproprietaireId">
            <SelectValue placeholder="Sélectionner un copropriétaire" />
          </SelectTrigger>
          <SelectContent>
            {activeCoproprietaires.map((cp) => (
              <SelectItem key={cp.id} value={cp.id}>
                {cp.prenom} {cp.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.coproprietaireId && (
          <p className="text-sm text-destructive">{errors.coproprietaireId.message}</p>
        )}
        {activeCoproprietaires.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Aucun copropriétaire actif. Créez-en un d&apos;abord.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="montantEuros">Montant (€)</Label>
        <Input
          id="montantEuros"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="250.00"
          {...register('montantEuros')}
          aria-invalid={!!errors.montantEuros}
        />
        {errors.montantEuros && (
          <p className="text-sm text-destructive">{errors.montantEuros.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="datePaiement">Date de paiement</Label>
        <Input
          id="datePaiement"
          type="date"
          {...register('datePaiement')}
          aria-invalid={!!errors.datePaiement}
        />
        {errors.datePaiement && (
          <p className="text-sm text-destructive">{errors.datePaiement.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reference">Référence (optionnel)</Label>
        <Input
          id="reference"
          placeholder="Ex: CHQ-001, VIR-2024-01"
          {...register('reference')}
        />
        {errors.reference && (
          <p className="text-sm text-destructive">{errors.reference.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Numéro de chèque, référence virement, etc.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading || activeCoproprietaires.length === 0}>
        {isLoading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Enregistrement...
          </>
        ) : initialData?.id ? (
          'Mettre à jour'
        ) : (
          'Enregistrer le paiement'
        )}
      </Button>
    </form>
  );
}
