'use client';

import { FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentItem, DocumentItemCompact } from './DocumentItem';
import type { DocumentExtranet } from '@/hooks/useExtranetDocuments';

interface DocumentsListProps {
  documents: DocumentExtranet[];
  onDownload: (document: DocumentExtranet) => Promise<string>;
  title?: string;
  description?: string;
  emptyMessage?: string;
  compact?: boolean;
}

/**
 * Liste des documents partagés pour l'extranet copropriétaires
 */
export function DocumentsList({
  documents,
  onDownload,
  title = 'Documents',
  description,
  emptyMessage = 'Aucun document disponible',
  compact = false,
}: DocumentsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : compact ? (
          <div className="space-y-2">
            {documents.map((doc) => (
              <DocumentItemCompact
                key={doc.id}
                document={doc}
                onDownload={onDownload}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <DocumentItem
                key={doc.id}
                document={doc}
                onDownload={onDownload}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Variante compacte pour le dashboard extranet
 */
export function DocumentsListCompact({
  documents,
  onDownload,
  maxItems = 3,
}: {
  documents: DocumentExtranet[];
  onDownload: (document: DocumentExtranet) => Promise<string>;
  maxItems?: number;
}) {
  const displayedDocs = documents.slice(0, maxItems);
  const remainingCount = documents.length - maxItems;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents récents
          </CardTitle>
          {documents.length > 0 && (
            <a
              href="/extranet/documents"
              className="text-sm text-primary hover:underline"
            >
              Voir tout
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun document partagé
          </p>
        ) : (
          <div className="space-y-2">
            {displayedDocs.map((doc) => (
              <DocumentItemCompact
                key={doc.id}
                document={doc}
                onDownload={onDownload}
              />
            ))}
            {remainingCount > 0 && (
              <a
                href="/extranet/documents"
                className="block text-center text-sm text-muted-foreground hover:text-primary py-2"
              >
                +{remainingCount} autre{remainingCount > 1 ? 's' : ''} document{remainingCount > 1 ? 's' : ''}
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
