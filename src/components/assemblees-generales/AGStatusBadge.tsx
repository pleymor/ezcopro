'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';
import type { AGStatus } from '@/types/assemblee-generale';

const agStatusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      status: {
        brouillon: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        convoquee: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        en_cours: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
        terminee: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      },
    },
    defaultVariants: {
      status: 'brouillon',
    },
  }
);

const STATUS_LABELS: Record<AGStatus, string> = {
  brouillon: 'Brouillon',
  convoquee: 'Convoquée',
  en_cours: 'En cours',
  terminee: 'Terminée',
};

interface AGStatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof agStatusBadgeVariants> {
  status: AGStatus;
}

export function AGStatusBadge({ status, className, ...props }: AGStatusBadgeProps) {
  return (
    <span className={cn(agStatusBadgeVariants({ status }), className)} {...props}>
      {STATUS_LABELS[status]}
    </span>
  );
}
