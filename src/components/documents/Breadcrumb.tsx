'use client';

import { Home, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  id: string | null;
  nom: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (folderId: string | null) => void;
}

/**
 * Fil d'Ariane pour la navigation dans l'arborescence des dossiers
 */
export function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <nav
      className="flex items-center gap-1 text-sm"
      aria-label="Fil d'Ariane"
      data-testid="breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isRoot = item.id === null;

        return (
          <div key={item.id ?? 'root'} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground flex-shrink-0" />
            )}
            {isLast ? (
              <span
                className="font-medium text-foreground flex items-center gap-1"
                data-testid={`breadcrumb-item-${item.id ?? 'root'}`}
              >
                {isRoot && <Home className="h-4 w-4" />}
                {item.nom}
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-muted-foreground hover:text-foreground"
                onClick={() => onNavigate(item.id)}
                data-testid={`breadcrumb-link-${item.id ?? 'root'}`}
              >
                {isRoot && <Home className="h-4 w-4 mr-1" />}
                {item.nom}
              </Button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
