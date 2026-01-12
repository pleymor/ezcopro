'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { lotFormSchema, lotTypeLabels, type LotFormData, type Lot, type LotType } from '@/lib/schemas/lot';
import { AlertTriangle } from 'lucide-react';

interface LotFormProps {
  initialData?: Partial<Lot>;
  coproprietaires: Array<{ id: string; nom: string; prenom: string }>;
  totalTantiemes: number;
  onSubmit: (data: LotFormData) => Promise<void>;
  isLoading?: boolean;
}

const LOT_TYPES: LotType[] = ['appartement', 'cave', 'parking', 'local_commercial', 'autre'];

export function LotForm({
  initialData,
  coproprietaires,
  totalTantiemes,
  onSubmit,
  isLoading = false,
}: LotFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LotFormData>({
    resolver: zodResolver(lotFormSchema),
    defaultValues: {
      numero: initialData?.numero || '',
      type: initialData?.type || 'appartement',
      tantiemes: initialData?.tantiemes || 0,
      coproprietaireId: initialData?.coproprietaireId || '',
      description: initialData?.description || '',
    },
  });

  const currentTantiemes = watch('tantiemes');
  const newTotal = totalTantiemes + (currentTantiemes || 0) - (initialData?.tantiemes || 0);

  // Warning si total tantièmes inhabituels
  const showHighWarning = newTotal > 10000;
  const showLowWarning = newTotal > 0 && newTotal < 100;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="numero">Numéro du lot</Label>
        <Input
          id="numero"
          placeholder="A01"
          {...register('numero')}
          aria-invalid={!!errors.numero}
        />
        {errors.numero && (
          <p className="text-sm text-destructive">{errors.numero.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type de lot</Label>
        <Select
          defaultValue={initialData?.type || 'appartement'}
          onValueChange={(value) => setValue('type', value as LotType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un type" />
          </SelectTrigger>
          <SelectContent>
            {LOT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {lotTypeLabels[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tantiemes">Tantièmes</Label>
        <Input
          id="tantiemes"
          type="number"
          min="1"
          placeholder="150"
          {...register('tantiemes', { valueAsNumber: true })}
          aria-invalid={!!errors.tantiemes}
        />
        {errors.tantiemes && (
          <p className="text-sm text-destructive">{errors.tantiemes.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Total après ajout : {newTotal} tantièmes
        </p>
      </div>

      {showHighWarning && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Le total des tantièmes ({newTotal}) est inhabituellement élevé. Vérifiez les valeurs saisies.
          </AlertDescription>
        </Alert>
      )}

      {showLowWarning && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Le total des tantièmes ({newTotal}) est inhabituellement bas.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="coproprietaireId">Propriétaire</Label>
        <Select
          defaultValue={initialData?.coproprietaireId || ''}
          onValueChange={(value) => setValue('coproprietaireId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un propriétaire" />
          </SelectTrigger>
          <SelectContent>
            {coproprietaires.map((cp) => (
              <SelectItem key={cp.id} value={cp.id}>
                {cp.nom} {cp.prenom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.coproprietaireId && (
          <p className="text-sm text-destructive">{errors.coproprietaireId.message}</p>
        )}
        {coproprietaires.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Aucun copropriétaire. Créez-en un d&apos;abord.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optionnel)</Label>
        <Input
          id="description"
          placeholder="3ème étage, vue jardin"
          {...register('description')}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading || coproprietaires.length === 0}>
        {isLoading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Enregistrement...
          </>
        ) : initialData?.id ? (
          'Mettre à jour'
        ) : (
          'Créer le lot'
        )}
      </Button>
    </form>
  );
}
