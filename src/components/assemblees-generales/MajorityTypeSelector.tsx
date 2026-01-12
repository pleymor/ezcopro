'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { MajoriteType } from '@/types/assemblee-generale';
import { majoriteTypeLabels } from '@/lib/schemas/assemblee-generale';

interface MajorityTypeSelectorProps {
  value: MajoriteType;
  onChange: (value: MajoriteType) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
}

const MAJORITY_TYPES: { value: MajoriteType; label: string; description: string }[] = [
  {
    value: 'article_24',
    label: majoriteTypeLabels.article_24,
    description: 'Majorité des voix exprimées des copropriétaires présents ou représentés',
  },
  {
    value: 'article_25',
    label: majoriteTypeLabels.article_25,
    description: 'Majorité des voix de tous les copropriétaires (>50% des tantièmes)',
  },
  {
    value: 'article_26',
    label: majoriteTypeLabels.article_26,
    description: 'Majorité des membres représentant 2/3 des voix',
  },
  {
    value: 'unanimite',
    label: majoriteTypeLabels.unanimite,
    description: 'Accord de tous les copropriétaires',
  },
];

export function MajorityTypeSelector({
  value,
  onChange,
  disabled = false,
  label = 'Type de majorité',
  id = 'majorite-type',
}: MajorityTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label} *</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id}>
          <SelectValue placeholder="Sélectionner le type de majorité" />
        </SelectTrigger>
        <SelectContent>
          {MAJORITY_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              <div className="flex flex-col">
                <span>{type.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value && (
        <p className="text-xs text-muted-foreground">
          {MAJORITY_TYPES.find((t) => t.value === value)?.description}
        </p>
      )}
    </div>
  );
}
