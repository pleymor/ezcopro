'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { appelFormSchema, type AppelFormData } from '@/lib/schemas/appel';
import { formatCurrency } from '@/lib/utils/format';
import { AlertTriangle, Info } from 'lucide-react';

interface AppelFormProps {
  lotsCount: number;
  totalTantiemes: number;
  onSubmit: (data: AppelFormData) => Promise<void>;
  isLoading?: boolean;
}

export function AppelForm({
  lotsCount,
  totalTantiemes,
  onSubmit,
  isLoading = false,
}: AppelFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AppelFormData>({
    resolver: zodResolver(appelFormSchema),
    defaultValues: {
      libelle: '',
      montantEuros: 0,
      dateEcheance: new Date().toISOString().split('T')[0] as unknown as Date,
    },
  });

  const montantEuros = watch('montantEuros');
  const montantCents = Math.round((montantEuros || 0) * 100);

  // Prévisualisation de la répartition
  const hasLots = lotsCount > 0 && totalTantiemes > 0;
  const moyenneParLot = hasLots ? montantCents / lotsCount : 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="libelle">Libellé</Label>
        <Input
          id="libelle"
          placeholder="Ex: Charges Q1 2024"
          {...register('libelle')}
          aria-invalid={!!errors.libelle}
        />
        {errors.libelle && (
          <p className="text-sm text-destructive">{errors.libelle.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="montantEuros">Montant total (€)</Label>
        <Input
          id="montantEuros"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="1500.00"
          {...register('montantEuros')}
          aria-invalid={!!errors.montantEuros}
        />
        {errors.montantEuros && (
          <p className="text-sm text-destructive">{errors.montantEuros.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateEcheance">Date d&apos;échéance</Label>
        <Input
          id="dateEcheance"
          type="date"
          {...register('dateEcheance')}
          aria-invalid={!!errors.dateEcheance}
        />
        {errors.dateEcheance && (
          <p className="text-sm text-destructive">{errors.dateEcheance.message}</p>
        )}
      </div>

      {/* Info répartition */}
      {hasLots && montantCents > 0 && (
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <p className="font-medium">Répartition automatique</p>
              <p className="text-muted-foreground">
                {formatCurrency(montantCents)} sera réparti entre {lotsCount} lots ({totalTantiemes} tantièmes total).
              </p>
              <p className="text-muted-foreground">
                Moyenne par lot: ~{formatCurrency(Math.round(moyenneParLot))}
              </p>
            </div>
          </div>
        </div>
      )}

      {!hasLots && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Aucun lot avec copropriétaire assigné. Veuillez d&apos;abord créer des lots et leur assigner des copropriétaires.
          </AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isLoading || !hasLots}>
        {isLoading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Création...
          </>
        ) : (
          'Créer l\'appel de fonds'
        )}
      </Button>
    </form>
  );
}
