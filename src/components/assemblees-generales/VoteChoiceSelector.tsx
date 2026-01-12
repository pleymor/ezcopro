'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import type { VoteChoix } from '@/types/assemblee-generale';
import { voteChoixLabels } from '@/lib/schemas/assemblee-generale';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

interface VoteChoiceSelectorProps {
  value: VoteChoix | null;
  onChange: (choice: VoteChoix) => void;
  disabled?: boolean;
}

const VOTE_CONFIG: Record<VoteChoix, { icon: typeof ThumbsUp; activeClassName: string; hoverClassName: string }> = {
  pour: {
    icon: ThumbsUp,
    activeClassName: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700',
    hoverClassName: 'hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950 dark:hover:text-green-300',
  },
  contre: {
    icon: ThumbsDown,
    activeClassName: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700',
    hoverClassName: 'hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-300',
  },
  abstention: {
    icon: Minus,
    activeClassName: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
    hoverClassName: 'hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-850 dark:hover:text-gray-300',
  },
};

export function VoteChoiceSelector({ value, onChange, disabled = false }: VoteChoiceSelectorProps) {
  const choices: VoteChoix[] = ['pour', 'contre', 'abstention'];

  return (
    <div className="flex gap-2">
      {choices.map((choice) => {
        const isActive = value === choice;
        const config = VOTE_CONFIG[choice];
        const Icon = config.icon;

        return (
          <Button
            key={choice}
            type="button"
            variant="outline"
            size="lg"
            disabled={disabled}
            onClick={() => onChange(choice)}
            className={cn(
              'flex-1 transition-colors',
              isActive ? config.activeClassName : config.hoverClassName
            )}
          >
            <Icon className="mr-2 h-5 w-5" />
            {voteChoixLabels[choice]}
          </Button>
        );
      })}
    </div>
  );
}
