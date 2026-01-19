'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
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
import {
  type PeriodFilter as PeriodFilterType,
  type PeriodPreset,
  getPeriodFromPreset,
  PERIOD_PRESETS,
} from '@/hooks/useExtranetPaiements';

interface PeriodFilterProps {
  period: PeriodFilterType;
  onPeriodChange: (period: PeriodFilterType) => void;
}

/**
 * Composant de filtrage par période.
 * Permet de sélectionner une période prédéfinie ou personnalisée.
 */
export function PeriodFilter({ period, onPeriodChange }: PeriodFilterProps) {
  const [preset, setPreset] = useState<PeriodPreset | 'custom'>('all');
  const [showCustom, setShowCustom] = useState(false);

  const handlePresetChange = (value: string) => {
    if (value === 'custom') {
      setPreset('custom');
      setShowCustom(true);
      return;
    }

    setPreset(value as PeriodPreset);
    setShowCustom(false);
    onPeriodChange(getPeriodFromPreset(value as PeriodPreset));
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    onPeriodChange({
      ...period,
      startDate: date,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    onPeriodChange({
      ...period,
      endDate: date,
    });
  };

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0] ?? '';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Période</span>
        </div>

        <Select value={preset} onValueChange={handlePresetChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sélectionner une période" />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_PRESETS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
            <SelectItem value="custom">Période personnalisée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showCustom && (
        <div className="flex flex-wrap items-end gap-4 p-4 rounded-lg bg-muted/50">
          <div className="space-y-2">
            <Label htmlFor="startDate">Date de début</Label>
            <Input
              id="startDate"
              type="date"
              value={formatDateForInput(period.startDate)}
              onChange={handleStartDateChange}
              className="w-[160px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Date de fin</Label>
            <Input
              id="endDate"
              type="date"
              value={formatDateForInput(period.endDate)}
              onChange={handleEndDateChange}
              className="w-[160px]"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPreset('all');
              setShowCustom(false);
              onPeriodChange({ startDate: null, endDate: null });
            }}
          >
            Réinitialiser
          </Button>
        </div>
      )}

      {/* Affichage de la période sélectionnée */}
      {(period.startDate || period.endDate) && (
        <p className="text-sm text-muted-foreground">
          {period.startDate && period.endDate ? (
            <>
              Du {period.startDate.toLocaleDateString('fr-FR')} au{' '}
              {period.endDate.toLocaleDateString('fr-FR')}
            </>
          ) : period.startDate ? (
            <>Depuis le {period.startDate.toLocaleDateString('fr-FR')}</>
          ) : period.endDate ? (
            <>Jusqu&apos;au {period.endDate.toLocaleDateString('fr-FR')}</>
          ) : null}
        </p>
      )}
    </div>
  );
}
