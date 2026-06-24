'use client';

import { useState } from 'react';
import {
  Folder,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronRight,
  Lock,
  Users,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import type { Dossier, NiveauAcces } from '@/types/dossier';
import { NIVEAU_ACCES_LABELS } from '@/lib/schemas/dossier';

interface FolderCardProps {
  folder: Dossier;
  onOpen: (folderId: string) => void;
  onRename?: (folderId: string, newName: string) => Promise<void>;
  onDelete?: (folderId: string) => void;
  onChangeAccess?: (folderId: string, niveauAcces: NiveauAcces) => Promise<void>;
  isEditable?: boolean;
}

const ACCESS_ICONS: Record<NiveauAcces, React.ElementType> = {
  syndic: Lock,
  conseil: Users,
  tous: Globe,
};

const ACCESS_COLORS: Record<NiveauAcces, string> = {
  syndic: 'text-orange-600 dark:text-orange-400',
  conseil: 'text-blue-600 dark:text-blue-400',
  tous: 'text-green-600 dark:text-green-400',
};

const NIVEAU_ACCES_OPTIONS: NiveauAcces[] = ['syndic', 'conseil', 'tous'];

/**
 * Carte représentant un dossier dans l'arborescence
 */
export function FolderCard({
  folder,
  onOpen,
  onRename,
  onDelete,
  onChangeAccess,
  isEditable = true,
}: FolderCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.nom);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingAccess, setIsChangingAccess] = useState(false);

  const handleChangeAccess = async (newAccess: NiveauAcces) => {
    if (!onChangeAccess || newAccess === folder.niveauAcces) return;

    setIsChangingAccess(true);
    try {
      await onChangeAccess(folder.id, newAccess);
    } catch (error) {
      console.error('Erreur lors du changement de niveau d\'accès:', error);
    } finally {
      setIsChangingAccess(false);
    }
  };

  const AccessIcon = ACCESS_ICONS[folder.niveauAcces];

  const handleRename = async () => {
    if (!onRename || newName.trim() === folder.nom) {
      setIsRenaming(false);
      return;
    }

    setIsSaving(true);
    try {
      await onRename(folder.id, newName.trim());
      setIsRenaming(false);
    } catch (error) {
      console.error('Erreur lors du renommage:', error);
      setNewName(folder.nom);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setNewName(folder.nom);
    }
  };

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer group"
      onClick={() => !isRenaming && onOpen(folder.id)}
      data-testid={`folder-card-${folder.id}`}
    >
      {/* Icône dossier */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
        <Folder className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      </div>

      {/* Nom et infos */}
      <div className="flex-1 min-w-0">
        {isRenaming ? (
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            autoFocus
            className="h-8"
            onClick={(e) => e.stopPropagation()}
            data-testid="folder-rename-input"
          />
        ) : (
          <h3 className="font-medium truncate" data-testid="folder-name">
            {folder.nom}
          </h3>
        )}
        <div className="flex items-center gap-2 mt-1">
          <Badge
            variant="outline"
            className={`text-xs ${ACCESS_COLORS[folder.niveauAcces]}`}
          >
            <AccessIcon className="h-3 w-3 mr-1" />
            {NIVEAU_ACCES_LABELS[folder.niveauAcces]}
          </Badge>
        </div>
      </div>

      {/* Actions */}
      {isEditable && (
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRename && (
                <DropdownMenuItem
                  onClick={() => setIsRenaming(true)}
                  data-testid="folder-rename-btn"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Renommer
                </DropdownMenuItem>
              )}
              {onChangeAccess && (
                <>
                  <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">
                    Niveau d&apos;accès
                  </div>
                  {NIVEAU_ACCES_OPTIONS.map((option) => {
                    const OptionIcon = ACCESS_ICONS[option];
                    const isSelected = option === folder.niveauAcces;
                    return (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => handleChangeAccess(option)}
                        disabled={isChangingAccess || isSelected}
                        data-testid={`folder-access-option-${option}`}
                      >
                        <OptionIcon className={`h-4 w-4 mr-2 ${ACCESS_COLORS[option]}`} />
                        <span className={isSelected ? 'font-medium' : ''}>
                          {NIVEAU_ACCES_LABELS[option]}
                        </span>
                        {isSelected && <span className="ml-2 text-xs text-muted-foreground">(actuel)</span>}
                      </DropdownMenuItem>
                    );
                  })}
                </>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(folder.id)}
                  className="text-red-600 dark:text-red-400"
                  data-testid="folder-delete-btn"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Chevron navigation */}
      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    </div>
  );
}
