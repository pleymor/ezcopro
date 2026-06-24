'use client';

import { Folder, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FolderCard } from './FolderCard';
import type { Dossier, NiveauAcces } from '@/types/dossier';

interface FolderTreeProps {
  folders: Dossier[];
  onOpenFolder: (folderId: string) => void;
  onCreateFolder?: () => void;
  onRenameFolder?: (folderId: string, newName: string) => Promise<void>;
  onDeleteFolder?: (folderId: string) => void;
  onChangeAccess?: (folderId: string, niveauAcces: NiveauAcces) => Promise<void>;
  isEditable?: boolean;
  emptyMessage?: string;
}

/**
 * Composant affichant la liste des dossiers d'un niveau
 */
export function FolderTree({
  folders,
  onOpenFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onChangeAccess,
  isEditable = true,
  emptyMessage = 'Aucun dossier',
}: FolderTreeProps) {
  if (folders.length === 0) {
    return (
      <div className="text-center py-8" data-testid="folder-tree-empty">
        <Folder className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground mb-4">{emptyMessage}</p>
        {isEditable && onCreateFolder && (
          <Button variant="outline" onClick={onCreateFolder}>
            <FolderPlus className="h-4 w-4 mr-2" />
            Créer un dossier
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2" data-testid="folder-tree">
      {folders.map((folder) => (
        <FolderCard
          key={folder.id}
          folder={folder}
          onOpen={onOpenFolder}
          onRename={onRenameFolder}
          onDelete={onDeleteFolder}
          onChangeAccess={onChangeAccess}
          isEditable={isEditable}
        />
      ))}
    </div>
  );
}
