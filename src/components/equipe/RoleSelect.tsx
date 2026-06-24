'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RoleSyndic } from '@/types/membre-syndic';
import { roleLabels, roleDescriptions } from '@/types/membre-syndic';

interface RoleSelectProps {
  value: RoleSyndic;
  onChange: (value: RoleSyndic) => void;
  disabled?: boolean;
  excludeProprietaire?: boolean;
}

export function RoleSelect({
  value,
  onChange,
  disabled = false,
  excludeProprietaire = false,
}: RoleSelectProps) {
  const roles: RoleSyndic[] = excludeProprietaire
    ? ['gestionnaire', 'lecteur']
    : ['admin', 'gestionnaire', 'lecteur'];

  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as RoleSyndic)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Sélectionner un rôle" />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role} value={role}>
            <div className="flex flex-col">
              <span className="font-medium">{roleLabels[role]}</span>
              <span className="text-xs text-muted-foreground">
                {roleDescriptions[role]}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
