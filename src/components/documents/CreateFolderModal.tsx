'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FolderPlus, Lock, Users, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createDossierInputSchema, type CreateDossierInput, type NiveauAcces } from '@/types/dossier';
import { NIVEAU_ACCES_LABELS } from '@/lib/schemas/dossier';

interface CreateFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateDossierInput) => Promise<void>;
  parentId: string | null;
  defaultNiveauAcces?: NiveauAcces;
  currentDepth?: number;
}

const ACCESS_OPTIONS: { value: NiveauAcces; label: string; icon: React.ElementType; description: string }[] = [
  {
    value: 'syndic',
    label: NIVEAU_ACCES_LABELS.syndic,
    icon: Lock,
    description: 'Visible uniquement par vous',
  },
  {
    value: 'conseil',
    label: NIVEAU_ACCES_LABELS.conseil,
    icon: Users,
    description: 'Visible par le conseil syndical',
  },
  {
    value: 'tous',
    label: NIVEAU_ACCES_LABELS.tous,
    icon: Globe,
    description: 'Visible par tous les copropriétaires',
  },
];

/**
 * Modal de création d'un nouveau dossier
 */
export function CreateFolderModal({
  open,
  onOpenChange,
  onSubmit,
  parentId,
  defaultNiveauAcces = 'syndic',
  currentDepth = 0,
}: CreateFolderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateDossierInput>({
    resolver: zodResolver(createDossierInputSchema),
    defaultValues: {
      nom: '',
      parentId,
      niveauAcces: defaultNiveauAcces,
    },
  });

  const niveauAcces = watch('niveauAcces');

  // Reset form when opening
  useEffect(() => {
    if (open) {
      reset({
        nom: '',
        parentId,
        niveauAcces: defaultNiveauAcces,
      });
    }
  }, [open, parentId, defaultNiveauAcces, reset]);

  const handleFormSubmit = async (data: CreateDossierInput) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isMaxDepth = currentDepth >= 2; // 0, 1, 2 = 3 levels max

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            {parentId ? 'Créer un sous-dossier' : 'Créer un dossier'}
          </DialogTitle>
          <DialogDescription>
            {parentId
              ? 'Le sous-dossier sera créé dans le dossier actuel.'
              : 'Le dossier sera créé à la racine.'}
          </DialogDescription>
        </DialogHeader>

        {isMaxDepth ? (
          <div className="py-4 text-center text-muted-foreground">
            <p>Profondeur maximale atteinte (3 niveaux).</p>
            <p className="text-sm mt-2">
              Vous ne pouvez pas créer de sous-dossier à ce niveau.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Nom du dossier */}
            <div className="space-y-2">
              <Label htmlFor="nom">Nom du dossier</Label>
              <Input
                id="nom"
                placeholder="Ex: Contrats 2025"
                {...register('nom')}
                data-testid="folder-name-input"
              />
              {errors.nom && (
                <p className="text-sm text-red-500">{errors.nom.message}</p>
              )}
            </div>

            {/* Niveau d'accès */}
            <div className="space-y-2">
              <Label>Niveau d&apos;accès</Label>
              <Select
                value={niveauAcces}
                onValueChange={(value) => setValue('niveauAcces', value as NiveauAcces)}
              >
                <SelectTrigger data-testid="folder-access-select">
                  <SelectValue placeholder="Sélectionner le niveau d'accès" />
                </SelectTrigger>
                <SelectContent>
                  {ACCESS_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      data-testid={`access-option-${option.value}`}
                    >
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        <div>
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({option.description})
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.niveauAcces && (
                <p className="text-sm text-red-500">{errors.niveauAcces.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting} data-testid="create-folder-submit">
                {isSubmitting ? 'Création...' : 'Créer le dossier'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
