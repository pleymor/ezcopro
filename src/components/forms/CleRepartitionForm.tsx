'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { QuotesPartsEditor } from '@/components/cles-repartition/QuotesPartsEditor';
import {
  cleRepartitionFormSchema,
  type CleRepartitionFormData,
  type CleRepartition,
  type QuotePart,
} from '@/lib/schemas/cle-repartition';
import type { Lot } from '@/types/lot';
import type { Coproprietaire } from '@/types/coproprietaire';

interface CleRepartitionFormProps {
  initialData?: Partial<CleRepartition>;
  lots: Lot[];
  coproprietaires: Coproprietaire[];
  onSubmit: (data: CleRepartitionFormData) => Promise<void>;
  isLoading?: boolean;
}

export function CleRepartitionForm({
  initialData,
  lots,
  coproprietaires,
  onSubmit,
  isLoading = false,
}: CleRepartitionFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CleRepartitionFormData>({
    resolver: zodResolver(cleRepartitionFormSchema),
    defaultValues: {
      nom: initialData?.nom || '',
      description: initialData?.description || '',
      quoteParts: initialData?.quoteParts || [],
    },
  });

  const quoteParts = watch('quoteParts');

  // Initialize quotes-parts for new clés with all lots included,
  // calculated proportionally from their tantièmes
  useEffect(() => {
    if (!initialData?.id && lots.length > 0 && quoteParts.length === 0) {
      const totalTantiemes = lots.reduce((sum, lot) => sum + lot.tantiemes, 0);

      if (totalTantiemes === 0) {
        // Fallback: equal distribution if no tantièmes
        const equalValue = Math.floor(10000 / lots.length);
        const initialQuoteParts: QuotePart[] = lots.map((lot, index) => ({
          lotId: lot.id,
          valeur: index === 0 ? 10000 - equalValue * (lots.length - 1) : equalValue,
        }));
        setValue('quoteParts', initialQuoteParts);
      } else {
        // Calculate proportional quote-parts from tantièmes
        const initialQuoteParts: QuotePart[] = lots.map((lot) => ({
          lotId: lot.id,
          valeur: Math.round((lot.tantiemes / totalTantiemes) * 10000),
        }));

        // Adjust to ensure total is exactly 10000 (handle rounding)
        const total = initialQuoteParts.reduce((sum, qp) => sum + qp.valeur, 0);
        if (total !== 10000 && initialQuoteParts.length > 0) {
          const diff = 10000 - total;
          // Add diff to the lot with highest value
          let maxIndex = 0;
          let maxValue = initialQuoteParts[0]?.valeur ?? 0;
          for (let i = 1; i < initialQuoteParts.length; i++) {
            const value = initialQuoteParts[i]?.valeur ?? 0;
            if (value > maxValue) {
              maxValue = value;
              maxIndex = i;
            }
          }
          const maxQuotePart = initialQuoteParts[maxIndex];
          if (maxQuotePart) {
            maxQuotePart.valeur += diff;
          }
        }

        setValue('quoteParts', initialQuoteParts);
      }
    }
  }, [initialData?.id, lots, quoteParts.length, setValue]);

  const handleQuotePartsChange = (newQuoteParts: QuotePart[]) => {
    setValue('quoteParts', newQuoteParts, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name field */}
      <div className="space-y-2">
        <Label htmlFor="nom">Nom de la clé</Label>
        <Input
          id="nom"
          placeholder="Ex: Charges générales, Ascenseur, Chauffage..."
          {...register('nom')}
          aria-invalid={!!errors.nom}
        />
        {errors.nom && (
          <p className="text-sm text-destructive">{errors.nom.message}</p>
        )}
      </div>

      {/* Description field */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (optionnel)</Label>
        <Input
          id="description"
          placeholder="Description de cette clé de répartition"
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Quotes-parts editor */}
      <div className="space-y-2">
        <Label>Quotes-parts par lot</Label>
        <QuotesPartsEditor
          quoteParts={quoteParts}
          onChange={handleQuotePartsChange}
          lots={lots}
          coproprietaires={coproprietaires}
          disabled={isLoading}
        />
        {errors.quoteParts && (
          <p className="text-sm text-destructive">
            {typeof errors.quoteParts === 'object' && 'message' in errors.quoteParts
              ? errors.quoteParts.message
              : 'Erreur dans les quotes-parts'}
          </p>
        )}
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || lots.length === 0}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Enregistrement...
          </>
        ) : initialData?.id ? (
          'Mettre à jour'
        ) : (
          'Créer la clé'
        )}
      </Button>

      {lots.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Créez des lots avant de pouvoir créer une clé de répartition.
        </p>
      )}
    </form>
  );
}
