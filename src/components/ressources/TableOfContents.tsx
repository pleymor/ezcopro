'use client';

import { useState } from 'react';
import type { ObligationCategory, ObligationIconName } from '@/types/obligations';
import { ChevronDown, ChevronUp, List, Calculator, Users, Shield, FileText, Archive } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const iconMap = {
  'calculator': Calculator,
  'users': Users,
  'shield': Shield,
  'file-text': FileText,
  'archive': Archive,
} as const satisfies Record<ObligationIconName, React.ComponentType<{ className?: string }>>;

interface TableOfContentsProps {
  categories: ObligationCategory[];
}

export function TableOfContents({ categories }: TableOfContentsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <nav
      data-testid="table-of-contents"
      className="rounded-lg border bg-card p-4"
    >
      {/* Mobile: Collapsible header */}
      <button
        className="flex w-full items-center justify-between md:hidden"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <List className="h-4 w-4" />
          <span className="font-medium">Sommaire</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {/* Desktop: Always visible title */}
      <div className="hidden md:flex items-center gap-2 mb-3">
        <List className="h-4 w-4" />
        <span className="font-medium">Sommaire</span>
      </div>

      {/* Links list */}
      <ul
        className={cn(
          'space-y-1 mt-3 md:mt-0',
          !isExpanded && 'hidden md:block'
        )}
      >
        {categories.map((category) => {
          const Icon = iconMap[category.iconName];
          return (
            <li key={category.id}>
              <a
                href={`#${category.id}`}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Icon className="h-4 w-4" />
                {category.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
