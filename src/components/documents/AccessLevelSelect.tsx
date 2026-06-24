'use client';

import { Lock, Users, Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { NiveauAcces } from '@/types/dossier';
import { NIVEAU_ACCES_LABELS } from '@/lib/schemas/dossier';

interface AccessLevelSelectProps {
  value: NiveauAcces;
  onChange: (value: NiveauAcces) => void;
  disabled?: boolean;
  size?: 'sm' | 'default';
}

const ACCESS_OPTIONS: { value: NiveauAcces; label: string; icon: React.ElementType; description: string }[] = [
  {
    value: 'syndic',
    label: NIVEAU_ACCES_LABELS.syndic,
    icon: Lock,
    description: 'Visible uniquement par le syndic',
  },
  {
    value: 'conseil',
    label: NIVEAU_ACCES_LABELS.conseil,
    icon: Users,
    description: 'Visible par le conseil syndical et le syndic',
  },
  {
    value: 'tous',
    label: NIVEAU_ACCES_LABELS.tous,
    icon: Globe,
    description: 'Visible par tous les copropriétaires',
  },
];

/**
 * Sélecteur de niveau d'accès pour dossiers et documents
 */
export function AccessLevelSelect({
  value,
  onChange,
  disabled = false,
  size = 'default',
}: AccessLevelSelectProps) {
  const currentOption = ACCESS_OPTIONS.find((opt) => opt.value === value);
  const Icon = currentOption?.icon || Lock;

  const triggerClasses = size === 'sm' ? 'h-8 text-sm' : '';

  return (
    <Select
      value={value}
      onValueChange={(newValue) => onChange(newValue as NiveauAcces)}
      disabled={disabled}
    >
      <SelectTrigger className={triggerClasses} data-testid="access-level-select">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {ACCESS_OPTIONS.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            data-testid={`access-level-option-${option.value}`}
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
  );
}
