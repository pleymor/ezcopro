'use client';

import { useState, useMemo, useCallback } from 'react';
import { FileText, Upload, FolderOpen, HardDrive, RefreshCw, FolderPlus } from 'lucide-react';
import { useCondoDocuments } from '@/hooks/useCondoDocuments';
import { useCondoFolders, useFolderBreadcrumb } from '@/hooks/useCondoFolders';
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
import { AccessLevelBadge } from '@/components/documents/AccessLevelBadge';
import type { AccessLevel } from '@/types/document';

const STORAGE_QUOTA = 500 * 1024 * 1024; // 500 MB

/**
 * Documents management page (syndic)
 */
export default function DocumentsPage() {
  // Folder navigation state
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
  } = useCondoDocuments({ folderId: currentFolderId });

  const {
    folders,
    loading: foldersLoading,
    error: foldersError,
    refresh: refreshFolders,
    create: createFolder,
  } = useCondoFolders({ parentId: currentFolderId });

  const { path: folderPath } = useFolderBreadcrumb(currentFolderId);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderAccessLevel, setNewFolderAccessLevel] = useState<AccessLevel>('all');

  // Get current folder details
  const currentFolder = useMemo(() => {
    if (!currentFolderId) return null;
    return folderPath[folderPath.length - 1] ?? null;
  }, [currentFolderId, folderPath]);

  // Stats
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

  // Breadcrumb navigation
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Documents
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage shared documents for owners
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={createFolderDialogOpen} onOpenChange={setCreateFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Folder</DialogTitle>
                <DialogDescription>
                  Create a new folder to organize your documents.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Folder Name</label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="Enter folder name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Access Level</label>
                  <select
                    value={newFolderAccessLevel}
                    onChange={(e) => setNewFolderAccessLevel(e.target.value as AccessLevel)}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  >
                    <option value="syndic">Syndic only</option>
                    <option value="board">Board members</option>
                    <option value="all">All owners</option>
                  </select>
                </div>
                <Button onClick={handleCreateFolder} className="w-full">
                  Create Folder
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Select a file and set its access level.
                  {currentFolder && (
                    <span className="block mt-1">
                      Uploading to: <strong>{currentFolder.name}</strong>
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">File</label>
                  <input
                    type="file"
                    name="file"
                    required
                    className="w-full mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Document Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="Enter document name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Access Level</label>
                  <select
                    name="accessLevel"
                    defaultValue="all"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  >
                    <option value="syndic">Syndic only</option>
                    <option value="board">Board members</option>
                    <option value="all">All owners</option>
                  </select>
                </div>
                <p className="text-xs text-muted-foreground">
                  Remaining space: {formatSize(remainingStorage)}
                </p>
                <Button type="submit" className="w-full">
                  Upload
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Breadcrumb */}
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Documents</CardDescription>
            <CardTitle className="text-3xl">{documents.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Visible to All</CardDescription>
            <CardTitle className="text-3xl text-green-600 dark:text-green-400">
              {docsByAccessLevel.all}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Board Only</CardDescription>
            <CardTitle className="text-3xl text-blue-600 dark:text-blue-400">
              {docsByAccessLevel.board}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              Storage Used
            </CardDescription>
            <CardTitle className="text-xl">
              {formatSize(usedStorage)} / {formatSize(STORAGE_QUOTA)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Progress value={quotaPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {quotaPercentage.toFixed(1)}% used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Folders and Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            {currentFolder ? currentFolder.name : 'Root'}
          </CardTitle>
          <CardDescription>
            {folders.length} folder{folders.length !== 1 ? 's' : ''} • {documents.length} document{documents.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Folders */}
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

          {/* Documents */}
          {documents.length === 0 && folders.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {currentFolderId
                  ? 'This folder is empty'
                  : 'No documents or folders yet'}
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setCreateFolderDialogOpen(true)}
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
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
                    Download
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
