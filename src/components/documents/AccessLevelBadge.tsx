'use client';

import { Lock, Users, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { AccessLevel } from '@/types/document';
import { accessLevelLabels } from '@/types/document';

interface AccessLevelBadgeProps {
  level: AccessLevel;
  showLabel?: boolean;
  size?: 'sm' | 'default';
}

const ACCESS_CONFIG: Record<AccessLevel, {
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
}> = {
  syndic: {
    icon: Lock,
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    textColor: 'text-orange-700 dark:text-orange-300',
  },
  board: {
    icon: Users,
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-300',
  },
  all: {
    icon: Globe,
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-300',
  },
};

/**
 * Badge displaying the access level of a folder or document
 */
export function AccessLevelBadge({
  level,
  showLabel = true,
  size = 'default',
}: AccessLevelBadgeProps) {
  const config = ACCESS_CONFIG[level];
  const Icon = config.icon;

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  return (
    <Badge
      variant="secondary"
      className={`${config.bgColor} ${config.textColor} ${sizeClasses} border-0`}
      data-testid={`access-badge-${level}`}
    >
      <Icon className={`${iconSize} ${showLabel ? 'mr-1' : ''}`} />
      {showLabel && accessLevelLabels[level]}
    </Badge>
  );
}
