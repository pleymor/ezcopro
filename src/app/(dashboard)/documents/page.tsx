'use client';

import { useState, useMemo } from 'react';
import { FileText, Upload, FolderOpen, HardDrive, RefreshCw, Filter } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DocumentUploadForm } from '@/components/documents/DocumentUploadForm';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { ErrorMessage } from '@/components/ui/error-message';
import type { CategorieDocument } from '@/types/document-partage';
import { CATEGORIE_LABELS, QUOTA_STOCKAGE_COPRO } from '@/lib/schemas/document-partage';

type FilterCategorie = CategorieDocument | 'all';

const CATEGORIES: CategorieDocument[] = ['ag', 'contrats', 'reglement', 'travaux', 'autres'];

/**
 * Page de gestion des documents partagés (syndic)
 */
export default function DocumentsPage() {
  const {
    documents,
    loading,
    error,
    usedStorage,
    remainingStorage,
    quotaPercentage,
    categoryCounts,
    refresh,
    upload,
    toggleVisibility,
    remove,
    getDownloadUrl,
  } = useDocuments();

  const [filterCategorie, setFilterCategorie] = useState<FilterCategorie>('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Filtrer les documents par catégorie
  const filteredDocuments = useMemo(() => {
    if (filterCategorie === 'all') {
      return documents;
    }
    return documents.filter((doc) => doc.categorie === filterCategorie);
  }, [documents, filterCategorie]);

  // Stats
  const visibleCount = documents.filter((d) => d.visibleExtranet).length;
  const hiddenCount = documents.length - visibleCount;

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
  };

  const handleUpload = async (
    file: File,
    metadata: { nom: string; categorie: CategorieDocument; visibleExtranet: boolean }
  ) => {
    await upload(file, metadata);
    setUploadDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <ErrorMessage message={error.message} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Documents partagés
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les documents accessibles sur l'extranet copropriétaires
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Ajouter un document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un document</DialogTitle>
                <DialogDescription>
                  Sélectionnez un fichier et choisissez ses paramètres de partage.
                </DialogDescription>
              </DialogHeader>
              <DocumentUploadForm
                onUpload={handleUpload}
                remainingStorage={remainingStorage}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats et quota */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total documents</CardDescription>
            <CardTitle className="text-3xl">{documents.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Visibles sur l'extranet</CardDescription>
            <CardTitle className="text-3xl text-green-600 dark:text-green-400">
              {visibleCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Masqués</CardDescription>
            <CardTitle className="text-3xl text-muted-foreground">{hiddenCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              Espace utilisé
            </CardDescription>
            <CardTitle className="text-xl">
              {formatSize(usedStorage)} / {formatSize(QUOTA_STOCKAGE_COPRO)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Progress value={quotaPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {quotaPercentage.toFixed(1)}% utilisé
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compteurs par catégorie */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Catégories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Badge
                key={cat}
                variant={filterCategorie === cat ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => setFilterCategorie(filterCategorie === cat ? 'all' : cat)}
              >
                {CATEGORIE_LABELS[cat]} ({categoryCounts[cat]})
              </Badge>
            ))}
            {filterCategorie !== 'all' && (
              <Badge
                variant="outline"
                className="cursor-pointer"
                onClick={() => setFilterCategorie('all')}
              >
                Afficher tout
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des documents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Liste des documents
              </CardTitle>
              <CardDescription>
                {filteredDocuments.length} document{filteredDocuments.length > 1 ? 's' : ''}
                {filterCategorie !== 'all' && ` dans ${CATEGORIE_LABELS[filterCategorie]}`}
              </CardDescription>
            </div>
            <Select
              value={filterCategorie}
              onValueChange={(value) => setFilterCategorie(value as FilterCategorie)}
            >
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORIE_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {documents.length === 0
                  ? "Aucun document n'a encore été ajouté"
                  : 'Aucun document dans cette catégorie'}
              </p>
              {documents.length === 0 && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Ajouter un document
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onToggleVisibility={toggleVisibility}
                  onDownload={getDownloadUrl}
                  onDelete={remove}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
