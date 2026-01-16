'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useClesRepartition } from '@/hooks/useClesRepartition';

interface CleRepartitionSelectorProps {
  coproId: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
}

export function CleRepartitionSelector({
  coproId,
  value,
  onChange,
  disabled = false,
  label = 'Clé de répartition',
  id = 'cle-repartition',
}: CleRepartitionSelectorProps) {
  const { cles, loading } = useClesRepartition(coproId);

  const selectedCle = cles.find((c) => c.id === value);

  if (loading) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label} *</Label>
        <div className="flex h-10 items-center gap-2 rounded-md border px-3">
          <Spinner size="sm" />
          <span className="text-sm text-muted-foreground">Chargement...</span>
        </div>
      </div>
    );
  }

  if (cles.length === 0) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label} *</Label>
        <div className="flex h-10 items-center rounded-md border border-dashed px-3">
          <span className="text-sm text-muted-foreground">
            Aucune clé de répartition disponible
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label} *</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id}>
          <SelectValue placeholder="Sélectionner une clé de répartition" />
        </SelectTrigger>
        <SelectContent>
          {cles.map((cle) => (
            <SelectItem key={cle.id} value={cle.id}>
              <div className="flex items-center gap-2">
                <span>{cle.nom}</span>
                {cle.isDefault && (
                  <span className="text-xs text-muted-foreground">(par défaut)</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedCle?.description && (
        <p className="text-xs text-muted-foreground">{selectedCle.description}</p>
      )}
    </div>
  );
}
