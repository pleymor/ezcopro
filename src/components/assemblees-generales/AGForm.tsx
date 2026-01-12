'use client';

import { useState, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { AGType, CreateAGInput } from '@/types/assemblee-generale';
import { createAssembleeGenerale } from '@/lib/firebase/services/assemblee-generale';
import { useAuth } from '@/lib/hooks/useAuth';

const AG_TYPES: { value: AGType; label: string }[] = [
  { value: 'ordinaire', label: 'Assemblée Générale Ordinaire' },
  { value: 'extraordinaire', label: 'Assemblée Générale Extraordinaire' },
  { value: 'mixte', label: 'Assemblée Générale Mixte' },
];

const MINIMUM_NOTICE_DAYS = 21;

interface AGFormProps {
  coproId: string;
  totalTantiemes: number;
  onSuccess?: (agId: string) => void;
  onCancel?: () => void;
}

export function AGForm({ coproId, totalTantiemes, onSuccess, onCancel }: AGFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: '',
    heure: '18:00',
    lieu: '',
    type: 'ordinaire' as AGType,
  });

  const daysUntilAG = useMemo(() => {
    if (!formData.date) return null;
    const agDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = agDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [formData.date]);

  const showWarning = daysUntilAG !== null && daysUntilAG < MINIMUM_NOTICE_DAYS && daysUntilAG >= 0;
  const isPastDate = daysUntilAG !== null && daysUntilAG < 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.date || !formData.heure || !formData.lieu) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (isPastDate) {
      setError('La date de l\'AG ne peut pas être dans le passé.');
      return;
    }

    if (!user) {
      setError('Vous devez être connecté pour créer une AG.');
      return;
    }

    setIsSubmitting(true);

    try {
      const input: CreateAGInput = {
        date: new Date(formData.date),
        heure: formData.heure,
        lieu: formData.lieu.trim(),
        type: formData.type,
      };

      const ag = await createAssembleeGenerale(coproId, user.uid, input, totalTantiemes);

      if (onSuccess) {
        onSuccess(ag.id);
      }
    } catch (err) {
      console.error('Error creating AG:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue lors de la création de l\'AG.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouvelle Assemblée Générale</CardTitle>
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

          {showWarning && (
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Attention - Délai de convocation</AlertTitle>
              <AlertDescription>
                La date choisie est dans {daysUntilAG} jour{daysUntilAG !== 1 ? 's' : ''}.
                Le délai légal de convocation est de 21 jours minimum.
                Vous risquez de ne pas pouvoir envoyer les convocations à temps.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date de l&apos;AG *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heure">Heure *</Label>
              <Input
                id="heure"
                type="time"
                value={formData.heure}
                onChange={(e) => setFormData((prev) => ({ ...prev, heure: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lieu">Lieu *</Label>
            <Input
              id="lieu"
              type="text"
              placeholder="Ex: Salle des fêtes, 12 rue de la Mairie"
              value={formData.lieu}
              onChange={(e) => setFormData((prev) => ({ ...prev, lieu: e.target.value }))}
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type d&apos;AG *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: AGType) => setFormData((prev) => ({ ...prev, type: value }))}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                {AG_TYPES.map((agType) => (
                  <SelectItem key={agType.value} value={agType.value}>
                    {agType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Annuler
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || isPastDate}>
            {isSubmitting ? 'Création...' : 'Créer l\'AG'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
