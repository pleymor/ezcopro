'use client';

import { useState, useEffect } from 'react';
import { Folder, FolderOpen, ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Dossier } from '@/types/dossier';

interface MoveDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentName: string;
  folders: Dossier[];
  currentFolderId: string | null;
  onMove: (targetFolderId: string | null) => Promise<void>;
  onLoadSubfolders?: (folderId: string) => Promise<Dossier[]>;
}

interface BreadcrumbItem {
  id: string | null;
  nom: string;
}

/**
 * Modal pour déplacer un document vers un autre dossier
 */
export function MoveDocumentModal({
  open,
  onOpenChange,
  documentName,
  folders: initialFolders,
  currentFolderId,
  onMove,
  onLoadSubfolders,
}: MoveDocumentModalProps) {
  const [isMoving, setIsMoving] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [currentViewFolderId, setCurrentViewFolderId] = useState<string | null>(null);
  const [displayedFolders, setDisplayedFolders] = useState<Dossier[]>(initialFolders);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([{ id: null, nom: 'Racine' }]);
  const [loading, setLoading] = useState(false);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setSelectedFolderId(null);
      setCurrentViewFolderId(null);
      setDisplayedFolders(initialFolders);
      setBreadcrumb([{ id: null, nom: 'Racine' }]);
    }
  }, [open, initialFolders]);

  const handleNavigateToFolder = async (folderId: string | null, folderName: string = 'Racine') => {
    if (folderId === currentViewFolderId) return;

    setLoading(true);
    try {
      if (folderId === null) {
        // Back to root
        setDisplayedFolders(initialFolders);
        setBreadcrumb([{ id: null, nom: 'Racine' }]);
      } else if (onLoadSubfolders) {
        const subfolders = await onLoadSubfolders(folderId);
        setDisplayedFolders(subfolders);

        // Update breadcrumb
        const folderIndex = breadcrumb.findIndex((b) => b.id === folderId);
        if (folderIndex >= 0) {
          // Navigating back via breadcrumb
          setBreadcrumb(breadcrumb.slice(0, folderIndex + 1));
        } else {
          // Navigating forward
          setBreadcrumb([...breadcrumb, { id: folderId, nom: folderName }]);
        }
      }
      setCurrentViewFolderId(folderId);
    } catch (error) {
      console.error('Erreur lors du chargement des sous-dossiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async () => {
    // Can't move to current folder
    if (selectedFolderId === currentFolderId) {
      onOpenChange(false);
      return;
    }

    setIsMoving(true);
    try {
      await onMove(selectedFolderId);
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors du déplacement:', error);
    } finally {
      setIsMoving(false);
    }
  };

  const handleSelectCurrentView = () => {
    setSelectedFolderId(currentViewFolderId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Déplacer le document
          </DialogTitle>
          <DialogDescription>
            Sélectionnez le dossier de destination pour &quot;{documentName}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
            {breadcrumb.map((item, index) => (
              <div key={item.id ?? 'root'} className="flex items-center">
                {index > 0 && <ChevronRight className="h-3 w-3 mx-1" />}
                <button
                  onClick={() => handleNavigateToFolder(item.id, item.nom)}
                  className="hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {item.id === null ? (
                    <Home className="h-4 w-4" />
                  ) : (
                    item.nom
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Current location selector */}
          <div
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedFolderId === currentViewFolderId
                ? 'border-primary bg-primary/10'
                : 'hover:bg-muted/50'
            }`}
            onClick={handleSelectCurrentView}
            data-testid="move-to-current-view"
          >
            <Home className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">
                {currentViewFolderId === null ? 'Racine' : breadcrumb[breadcrumb.length - 1]?.nom}
              </p>
              <p className="text-xs text-muted-foreground">
                Déplacer ici
              </p>
            </div>
            {selectedFolderId === currentViewFolderId && (
              <span className="text-xs text-primary font-medium">Sélectionné</span>
            )}
          </div>

          {/* Folders list */}
          <div className="border rounded-lg max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : displayedFolders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun sous-dossier</p>
              </div>
            ) : (
              <div className="divide-y">
                {displayedFolders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                      selectedFolderId === folder.id
                        ? 'bg-primary/10'
                        : 'hover:bg-muted/50'
                    } ${folder.id === currentFolderId ? 'opacity-50' : ''}`}
                    onClick={() => {
                      if (folder.id !== currentFolderId) {
                        setSelectedFolderId(folder.id);
                      }
                    }}
                    data-testid={`move-folder-option-${folder.id}`}
                  >
                    <Folder className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{folder.nom}</p>
                      {folder.id === currentFolderId && (
                        <p className="text-xs text-muted-foreground">Emplacement actuel</p>
                      )}
                    </div>
                    {folder.depth < 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigateToFolder(folder.id, folder.nom);
                        }}
                        disabled={loading}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isMoving}
          >
            Annuler
          </Button>
          <Button
            onClick={handleMove}
            disabled={isMoving || selectedFolderId === currentFolderId}
            data-testid="move-document-submit"
          >
            {isMoving ? 'Déplacement...' : 'Déplacer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
