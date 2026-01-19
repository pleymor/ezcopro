'use client';

import { ArrowLeft, RefreshCw, FileText, Bell } from 'lucide-react';
import { useExtranetDocuments } from '@/hooks/useExtranetDocuments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorMessage } from '@/components/ui/error-message';
import { CategoryFilter } from '@/components/extranet/CategoryFilter';
import { DocumentItem } from '@/components/extranet/DocumentItem';

/**
 * Page des documents partagés pour les copropriétaires
 */
export default function ExtranetDocumentsPage() {
  const {
    filteredDocuments,
    loading,
    error,
    selectedCategorie,
    setSelectedCategorie,
    categoryCounts,
    newDocumentsCount,
    refresh,
    downloadDocument,
  } = useExtranetDocuments();

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

  const totalDocuments = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <a href="/extranet">
              <ArrowLeft className="h-5 w-5" />
            </a>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Documents
            </h1>
            <p className="text-muted-foreground">
              Consultez les documents partagés par votre syndic
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Résumé */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Documents disponibles</CardDescription>
            <CardTitle className="text-3xl">{totalDocuments}</CardTitle>
          </CardHeader>
        </Card>
        <Card className={newDocumentsCount > 0 ? 'border-blue-200 dark:border-blue-900' : ''}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Bell className="h-3 w-3" />
              Nouveaux documents
            </CardDescription>
            <CardTitle className="text-3xl">
              {newDocumentsCount > 0 ? (
                <span className="text-blue-600 dark:text-blue-400">{newDocumentsCount}</span>
              ) : (
                <span className="text-muted-foreground">0</span>
              )}
            </CardTitle>
          </CardHeader>
          {newDocumentsCount > 0 && (
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                {newDocumentsCount} document{newDocumentsCount > 1 ? 's' : ''} non consulté{newDocumentsCount > 1 ? 's' : ''}
              </p>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Filtre par catégorie */}
      <Card>
        <CardContent className="pt-6">
          <CategoryFilter
            selectedCategorie={selectedCategorie}
            onCategorieChange={setSelectedCategorie}
            categoryCounts={categoryCounts}
          />
        </CardContent>
      </Card>

      {/* Liste des documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {selectedCategorie ? `Documents - ${selectedCategorie}` : 'Tous les documents'}
          </CardTitle>
          <CardDescription>
            {filteredDocuments.length} document{filteredDocuments.length > 1 ? 's' : ''}
            {selectedCategorie && ' dans cette catégorie'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {totalDocuments === 0
                  ? "Aucun document n'a encore été partagé"
                  : 'Aucun document dans cette catégorie'}
              </p>
              {selectedCategorie && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSelectedCategorie(null)}
                >
                  Voir tous les documents
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc) => (
                <DocumentItem
                  key={doc.id}
                  document={doc}
                  onDownload={downloadDocument}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
