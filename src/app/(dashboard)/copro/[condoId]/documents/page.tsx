'use client';

import { useState, useMemo, useCallback } from 'react';
import { FileText, Upload, FolderOpen, HardDrive, RefreshCw, FolderPlus } from 'lucide-react';
import { useCondoDocuments } from '@/hooks/useCondoDocuments';
import { useCondoFolders, useFolderBreadcrumb } from '@/hooks/useCondoFolders';
import { useCondoFromUrl } from '@/lib/hooks/useCondoFromUrl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ErrorMessage } from '@/components/ui/error-message';
import { Loading } from '@/components/ui/loading';
import { AccessLevelBadge } from '@/components/documents/AccessLevelBadge';
import type { AccessLevel } from '@/types/document';

const STORAGE_QUOTA = 500 * 1024 * 1024; // 500 MB

export default function DocumentsPage() {
  const { condoId, currentCondo, loading: condoLoading } = useCondoFromUrl();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const {
    documents,
    loading: docsLoading,
    error: docsError,
    usedStorage,
    remainingStorage,
    quotaPercentage,
    refresh: refreshDocs,
    upload,
  } = useCondoDocuments({ folderId: currentFolderId, condoId: condoId ?? undefined });

  const {
    folders,
    loading: foldersLoading,
    error: foldersError,
    refresh: refreshFolders,
    create: createFolder,
  } = useCondoFolders({ parentId: currentFolderId, condoId: condoId ?? undefined });

  const { path: folderPath } = useFolderBreadcrumb(currentFolderId);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderAccessLevel, setNewFolderAccessLevel] = useState<AccessLevel>('all');

  const currentFolder = useMemo(() => {
    if (!currentFolderId) return null;
    return folderPath[folderPath.length - 1] ?? null;
  }, [currentFolderId, folderPath]);

  const docsByAccessLevel = useMemo(() => {
    return {
      syndic: documents.filter(d => d.accessLevel === 'syndic').length,
      board: documents.filter(d => d.accessLevel === 'board').length,
      all: documents.filter(d => d.accessLevel === 'all').length,
    };
  }, [documents]);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const breadcrumbItems = useMemo(() => {
    const items: { id: string | null; name: string }[] = [{ id: null, name: 'Root' }];
    folderPath.forEach((folder) => {
      items.push({ id: folder.id, name: folder.name });
    });
    return items;
  }, [folderPath]);

  const handleBreadcrumbNavigate = useCallback((folderId: string | null) => {
    setCurrentFolderId(folderId);
  }, []);

  const handleFolderClick = useCallback((folderId: string) => {
    setCurrentFolderId(folderId);
  }, []);

  const handleCreateFolder = useCallback(async () => {
    if (!newFolderName.trim()) return;
    await createFolder({
      name: newFolderName.trim(),
      parentId: currentFolderId,
      accessLevel: newFolderAccessLevel,
    });
    setNewFolderName('');
    setCreateFolderDialogOpen(false);
  }, [createFolder, currentFolderId, newFolderName, newFolderAccessLevel]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const accessLevel = formData.get('accessLevel') as AccessLevel;

    if (!file || !name) return;

    await upload(file, {
      name,
      folderId: currentFolderId,
      accessLevel,
    });
    setUploadDialogOpen(false);
  };

  const handleRefresh = useCallback(() => {
    refreshDocs();
    refreshFolders();
  }, [refreshDocs, refreshFolders]);

  if (condoLoading) {
    return <Loading message="Chargement..." />;
  }

  if (!currentCondo || !condoId) {
    return <ErrorMessage message="Aucune copropriété sélectionnée" />;
  }

  const isLoading = docsLoading || foldersLoading;
  const combinedError = docsError || foldersError;

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (combinedError) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <ErrorMessage message={combinedError.message} onRetry={handleRefresh} />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Documents
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les documents partagés avec les copropriétaires
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Dialog open={createFolderDialogOpen} onOpenChange={setCreateFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="h-4 w-4 mr-2" />
                Nouveau dossier
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un dossier</DialogTitle>
                <DialogDescription>
                  Créez un nouveau dossier pour organiser vos documents.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nom du dossier</label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="Entrez le nom du dossier"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Niveau d&apos;accès</label>
                  <select
                    value={newFolderAccessLevel}
                    onChange={(e) => setNewFolderAccessLevel(e.target.value as AccessLevel)}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  >
                    <option value="syndic">Syndic uniquement</option>
                    <option value="board">Conseil syndical</option>
                    <option value="all">Tous les copropriétaires</option>
                  </select>
                </div>
                <Button onClick={handleCreateFolder} className="w-full">
                  Créer le dossier
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Téléverser
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Téléverser un document</DialogTitle>
                <DialogDescription>
                  Sélectionnez un fichier et définissez son niveau d&apos;accès.
                  {currentFolder && (
                    <span className="block mt-1">
                      Dossier cible: <strong>{currentFolder.name}</strong>
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Fichier</label>
                  <input type="file" name="file" required className="w-full mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Nom du document</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="Entrez le nom du document"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Niveau d&apos;accès</label>
                  <select
                    name="accessLevel"
                    defaultValue="all"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  >
                    <option value="syndic">Syndic uniquement</option>
                    <option value="board">Conseil syndical</option>
                    <option value="all">Tous les copropriétaires</option>
                  </select>
                </div>
                <p className="text-xs text-muted-foreground">
                  Espace restant: {formatSize(remainingStorage)}
                </p>
                <Button type="submit" className="w-full">
                  Téléverser
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <nav className="flex items-center space-x-2 text-sm">
        {breadcrumbItems.map((item, index) => (
          <span key={item.id ?? 'root'} className="flex items-center">
            {index > 0 && <span className="mx-2 text-muted-foreground">/</span>}
            <button
              onClick={() => handleBreadcrumbNavigate(item.id)}
              className={`hover:underline ${
                index === breadcrumbItems.length - 1
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {item.name}
            </button>
          </span>
        ))}
      </nav>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Documents</CardDescription>
            <CardTitle className="text-3xl">{documents.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Visibles par tous</CardDescription>
            <CardTitle className="text-3xl text-green-600 dark:text-green-400">
              {docsByAccessLevel.all}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conseil uniquement</CardDescription>
            <CardTitle className="text-3xl text-blue-600 dark:text-blue-400">
              {docsByAccessLevel.board}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              Stockage utilisé
            </CardDescription>
            <CardTitle className="text-xl">
              {formatSize(usedStorage)} / {formatSize(STORAGE_QUOTA)}
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            {currentFolder ? currentFolder.name : 'Racine'}
          </CardTitle>
          <CardDescription>
            {folders.length} dossier{folders.length !== 1 ? 's' : ''} • {documents.length} document{documents.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {folders.length > 0 && (
            <div className="mb-6 grid gap-2">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  onClick={() => handleFolderClick(folder.id)}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted cursor-pointer"
                >
                  <FolderOpen className="h-5 w-5 text-blue-500" />
                  <span className="flex-1 font-medium">{folder.name}</span>
                  <AccessLevelBadge level={folder.accessLevel} />
                </div>
              ))}
            </div>
          )}

          {documents.length === 0 && folders.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {currentFolderId ? 'Ce dossier est vide' : 'Aucun document ou dossier'}
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button variant="outline" onClick={() => setCreateFolderDialogOpen(true)}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Nouveau dossier
                </Button>
                <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Téléverser
                </Button>
              </div>
            </div>
          ) : documents.length > 0 && (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted"
                >
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(doc.size)} • {doc.type}
                    </p>
                  </div>
                  <AccessLevelBadge level={doc.accessLevel} />
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Télécharger
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
