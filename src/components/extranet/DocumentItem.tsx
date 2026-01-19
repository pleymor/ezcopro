'use client';

import { useState } from 'react';
import { Download, Eye, FileText, Calendar, HardDrive, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { DocumentExtranet } from '@/hooks/useExtranetDocuments';
import { CATEGORIE_LABELS } from '@/lib/schemas/document-partage';

interface DocumentItemProps {
  document: DocumentExtranet;
  onDownload: (document: DocumentExtranet) => Promise<string>;
}

const FILE_TYPE_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'Image',
  'image/png': 'Image',
  'image/gif': 'Image',
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/vnd.ms-excel': 'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
};

// Taille max pour prévisualisation (5 Mo)
const MAX_PREVIEW_SIZE = 5 * 1024 * 1024;

/**
 * Composant affichant un document avec badge "Nouveau" si non consulté
 */
export function DocumentItem({ document, onDownload }: DocumentItemProps) {
  const [downloading, setDownloading] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
  };

  const formatDate = (timestamp: { seconds: number; nanoseconds: number } | null): string => {
    if (!timestamp) return '-';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const url = await onDownload(document);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    } finally {
      setDownloading(false);
    }
  };

  const canPreview = document.taille <= MAX_PREVIEW_SIZE && document.type === 'application/pdf';
  const fileTypeLabel = FILE_TYPE_LABELS[document.type] || 'Fichier';

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      {/* Icône fichier */}
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center relative">
        <FileText className="h-6 w-6 text-primary" />
        {document.isNew && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-background" />
        )}
      </div>

      {/* Infos document */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{document.nom}</h3>
              {document.isNew && (
                <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-xs">
                  Nouveau
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {CATEGORIE_LABELS[document.categorie]}
              </Badge>
              <span className="text-xs text-muted-foreground">{fileTypeLabel}</span>
            </div>
          </div>
        </div>

        {/* Métadonnées */}
        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <HardDrive className="h-3 w-3" />
            {formatFileSize(document.taille)}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(document.datePartage)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="default"
            size="sm"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Chargement...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </>
            )}
          </Button>

          {canPreview && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Eye className="h-4 w-4 mr-2" />
              Prévisualiser
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Variante compacte pour la liste
 */
export function DocumentItemCompact({ document, onDownload }: DocumentItemProps) {
  const [downloading, setDownloading] = useState(false);

  const formatDate = (timestamp: { seconds: number; nanoseconds: number } | null): string => {
    if (!timestamp) return '-';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('fr-FR');
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const url = await onDownload(document);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
      onClick={handleDownload}
    >
      <div className="flex items-center gap-3 min-w-0">
        <FileText className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{document.nom}</p>
            {document.isNew && (
              <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-xs">
                Nouveau
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDate(document.datePartage)} • {CATEGORIE_LABELS[document.categorie]}
          </p>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        disabled={downloading}
        onClick={(e) => {
          e.stopPropagation();
          handleDownload();
        }}
      >
        {downloading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
        ) : (
          <ExternalLink className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
