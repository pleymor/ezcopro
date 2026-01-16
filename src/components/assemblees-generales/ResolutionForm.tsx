'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { MajorityTypeSelector } from './MajorityTypeSelector';
import { CleRepartitionSelector } from './CleRepartitionSelector';
import type { MajoriteType, CreateResolutionInput, Resolution } from '@/types/assemblee-generale';
import { createResolution, updateResolution } from '@/lib/firebase/services/resolution';
import { useAuth } from '@/lib/hooks/useAuth';
import { useClesRepartition } from '@/hooks/useClesRepartition';

interface ResolutionFormProps {
  coproId: string;
  agId: string;
  resolution?: Resolution;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ResolutionForm({
  coproId,
  agId,
  resolution,
  onSuccess,
  onCancel,
}: ResolutionFormProps) {
  const { user } = useAuth();
  const { cles } = useClesRepartition(coproId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    titre: resolution?.titre ?? '',
    description: resolution?.description ?? '',
    typeMajorite: (resolution?.typeMajorite ?? 'article_24') as MajoriteType,
    cleRepartitionId: resolution?.cleRepartitionId ?? '',
  });

  const isEditing = !!resolution;

  // Set default clé when cles are loaded and no value is set
  useEffect(() => {
    if (!formData.cleRepartitionId && cles.length > 0) {
      const defaultCle = cles.find((c) => c.isDefault) || cles[0];
      if (defaultCle) {
        setFormData((prev) => ({ ...prev, cleRepartitionId: defaultCle.id }));
      }
    }
  }, [cles, formData.cleRepartitionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.titre.trim()) {
      setError('Le titre est requis.');
      return;
    }

    if (!formData.cleRepartitionId) {
      setError('La clé de répartition est requise.');
      return;
    }

    if (!user) {
      setError('Vous devez être connecté.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        await updateResolution(coproId, agId, resolution.id, user.uid, user.email || '', {
          titre: formData.titre.trim(),
          description: formData.description.trim() || null,
          typeMajorite: formData.typeMajorite,
          cleRepartitionId: formData.cleRepartitionId,
        });
      } else {
        const input: CreateResolutionInput = {
          titre: formData.titre.trim(),
          description: formData.description.trim() || undefined,
          typeMajorite: formData.typeMajorite,
          cleRepartitionId: formData.cleRepartitionId,
        };
        await createResolution(coproId, agId, user.uid, user.email || '', input);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error saving resolution:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue lors de l\'enregistrement.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Modifier la résolution' : 'Nouvelle résolution'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="titre">Titre *</Label>
            <Input
              id="titre"
              type="text"
              placeholder="Ex: Approbation des comptes 2024"
              value={formData.titre}
              onChange={(e) => setFormData((prev) => ({ ...prev, titre: e.target.value }))}
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnelle)</Label>
            <textarea
              id="description"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Détails supplémentaires sur la résolution..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              maxLength={2000}
            />
          </div>

          <MajorityTypeSelector
            value={formData.typeMajorite}
            onChange={(value) => setFormData((prev) => ({ ...prev, typeMajorite: value }))}
          />

          <CleRepartitionSelector
            coproId={coproId}
            value={formData.cleRepartitionId}
            onChange={(value) => setFormData((prev) => ({ ...prev, cleRepartitionId: value }))}
          />
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Annuler
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
