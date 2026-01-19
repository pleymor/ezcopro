'use client';

import { FolderOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CategorieDocument } from '@/types/document-partage';
import { CATEGORIE_LABELS } from '@/lib/schemas/document-partage';

interface CategoryFilterProps {
  selectedCategorie: CategorieDocument | null;
  onCategorieChange: (categorie: CategorieDocument | null) => void;
  categoryCounts: Record<CategorieDocument, number>;
}

const CATEGORIES: CategorieDocument[] = ['ag', 'contrats', 'reglement', 'travaux', 'autres'];

/**
 * Composant de filtrage par catégorie pour les documents extranet
 */
export function CategoryFilter({
  selectedCategorie,
  onCategorieChange,
  categoryCounts,
}: CategoryFilterProps) {
  const totalDocuments = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FolderOpen className="h-4 w-4" />
        <span>Filtrer par catégorie</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Bouton "Tous" */}
        <Badge
          variant={selectedCategorie === null ? 'default' : 'secondary'}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onCategorieChange(null)}
        >
          Tous ({totalDocuments})
        </Badge>

        {/* Boutons par catégorie */}
        {CATEGORIES.map((cat) => {
          const count = categoryCounts[cat];
          // Masquer les catégories vides
          if (count === 0) return null;

          return (
            <Badge
              key={cat}
              variant={selectedCategorie === cat ? 'default' : 'secondary'}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onCategorieChange(selectedCategorie === cat ? null : cat)}
            >
              {CATEGORIE_LABELS[cat]} ({count})
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
