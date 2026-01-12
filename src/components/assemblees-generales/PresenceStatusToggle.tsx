'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import type { PresenceStatus } from '@/types/assemblee-generale';
import { presenceStatusLabels } from '@/lib/schemas/assemblee-generale';

interface PresenceStatusToggleProps {
  value: PresenceStatus;
  onChange: (status: PresenceStatus) => void;
  disabled?: boolean;
}

const STATUS_CONFIG: Record<PresenceStatus, { className: string; activeClassName: string }> = {
  present: {
    className: 'hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900 dark:hover:text-green-300',
    activeClassName: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700',
  },
  represente: {
    className: 'hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-300',
    activeClassName: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700',
  },
  absent: {
    className: 'hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300',
    activeClassName: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
  },
};

export function PresenceStatusToggle({ value, onChange, disabled = false }: PresenceStatusToggleProps) {
  const statuses: PresenceStatus[] = ['present', 'represente', 'absent'];

  return (
    <div className="flex gap-1">
      {statuses.map((status) => {
        const isActive = value === status;
        const config = STATUS_CONFIG[status];

        return (
          <Button
            key={status}
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onChange(status)}
            className={cn(
              'text-xs transition-colors',
              isActive ? config.activeClassName : config.className
            )}
          >
            {presenceStatusLabels[status]}
          </Button>
        );
      })}
    </div>
  );
}
