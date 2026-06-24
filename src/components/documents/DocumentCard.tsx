'use client';

import { useState } from 'react';
import {
  Download,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  FolderOpen,
  Calendar,
  HardDrive,
  ArrowRightLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { DocumentPartage } from '@/types/document-partage';
import { CATEGORIE_LABELS } from '@/lib/schemas/document-partage';

interface DocumentCardProps {
  document: DocumentPartage;
  onToggleVisibility?: (documentId: string, visible: boolean) => Promise<void>;
  onDownload: (storagePath: string) => Promise<string>;
  onDelete?: (documentId: string, storagePath: string) => Promise<void>;
  onMove?: (document: DocumentPartage) => void;
  isEditable?: boolean;
}

const FILE_TYPE_ICONS: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/gif': 'GIF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
};

/**
 * Carte d'un document avec actions pour le syndic
 */
export function DocumentCard({
  document,
  onToggleVisibility,
  onDownload,
  onDelete,
  onMove,
  isEditable = true,
}: DocumentCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toggling, setToggling] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
  };

  const formatDate = (timestamp: { seconds: number; nanoseconds: number } | null): string => {
    if (!timestamp) return '-';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const url = await onDownload(document.storagePath);
      // Ouvrir dans un nouvel onglet
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleToggleVisibility = async () => {
    if (!onToggleVisibility) return;
    setToggling(true);
    try {
      await onToggleVisibility(document.id, !document.visibleExtranet);
    } catch (error) {
      console.error('Erreur lors du changement de visibilité:', error);
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(document.id, document.storagePath);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setDeleting(false);
    }
  };

  const fileTypeLabel = FILE_TYPE_ICONS[document.type] || 'FILE';

  return (
    <>
      <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
        {/* Icône fichier */}
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">{fileTypeLabel}</span>
        </div>

        {/* Infos document */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium truncate">{document.nom}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  <FolderOpen className="h-3 w-3 mr-1" />
                  {CATEGORIE_LABELS[document.categorie]}
                </Badge>
                {document.visibleExtranet ? (
                  <Badge variant="default" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Visible
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Masqué
                  </Badge>
                )}
              </div>
            </div>

            {/* Menu actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownload} disabled={downloading}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </DropdownMenuItem>
                {isEditable && onMove && (
                  <DropdownMenuItem onClick={() => onMove(document)}>
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Déplacer
                  </DropdownMenuItem>
                )}
                {isEditable && onDelete && (
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Métadonnées */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              {formatFileSize(document.taille)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Ajouté le {formatDate(document.createdAt)}
            </span>
            {document.visibleExtranet && document.datePartage && (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <Eye className="h-3 w-3" />
                Partagé le {formatDate(document.datePartage)}
              </span>
            )}
          </div>

          {/* Toggle visibilité */}
          {isEditable && onToggleVisibility ? (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <Switch
                id={`visibility-${document.id}`}
                checked={document.visibleExtranet}
                onCheckedChange={handleToggleVisibility}
                disabled={toggling}
              />
              <Label htmlFor={`visibility-${document.id}`} className="text-sm cursor-pointer">
                {document.visibleExtranet
                  ? 'Visible sur l\'extranet'
                  : 'Masqué sur l\'extranet'}
              </Label>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t text-sm text-muted-foreground">
              {document.visibleExtranet
                ? 'Visible sur l\'extranet'
                : 'Masqué sur l\'extranet'}
            </div>
          )}

          {/* Stats de consultation */}
          {document.visibleExtranet && document.consultePar.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Consulté par {document.consultePar.length} copropriétaire{document.consultePar.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le document ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer &quot;{document.nom}&quot; ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
