'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type CategorieDocument,
  CATEGORIE_LABELS,
  MAX_FILE_SIZE,
  mimeTypeAutoriseSchema,
} from '@/lib/schemas/document-partage';

interface DocumentUploadFormProps {
  onUpload: (
    file: File,
    metadata: { nom: string; categorie: CategorieDocument; visibleExtranet: boolean }
  ) => Promise<void>;
  remainingStorage: number;
  disabled?: boolean;
}

const CATEGORIES: CategorieDocument[] = ['ag', 'contrats', 'reglement', 'travaux', 'autres'];

const MIME_TYPES_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'image/gif': 'GIF',
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/vnd.ms-excel': 'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
};

/**
 * Formulaire d'upload de document
 */
export function DocumentUploadForm({
  onUpload,
  remainingStorage,
  disabled = false,
}: DocumentUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [nom, setNom] = useState('');
  const [categorie, setCategorie] = useState<CategorieDocument>('autres');
  const [visibleExtranet, setVisibleExtranet] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Vérification du type MIME
    const mimeResult = mimeTypeAutoriseSchema.safeParse(file.type);
    if (!mimeResult.success) {
      return `Type de fichier non autorisé. Types acceptés: ${Object.values(MIME_TYPES_LABELS).join(', ')}`;
    }

    // Vérification de la taille
    if (file.size > MAX_FILE_SIZE) {
      return `Fichier trop volumineux (max ${MAX_FILE_SIZE / (1024 * 1024)} Mo)`;
    }

    // Vérification du quota
    if (file.size > remainingStorage) {
      return `Espace insuffisant. Il reste ${(remainingStorage / (1024 * 1024)).toFixed(2)} Mo disponibles.`;
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setFile(selectedFile);
    // Pré-remplir le nom avec le nom du fichier (sans extension)
    if (!nom) {
      const nameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, '');
      setNom(nameWithoutExtension);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    if (!nom.trim()) {
      setError('Veuillez entrer un nom pour le document');
      return;
    }

    setUploading(true);

    try {
      await onUpload(file, {
        nom: nom.trim(),
        categorie,
        visibleExtranet,
      });

      // Reset du formulaire
      setFile(null);
      setNom('');
      setCategorie('autres');
      setVisibleExtranet(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Zone de drop / sélection de fichier */}
      <div className="space-y-2">
        <Label>Fichier</Label>
        {!file ? (
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-1">
              Cliquez pour sélectionner un fichier
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, Word, Excel, Images • Max {MAX_FILE_SIZE / (1024 * 1024)} Mo
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <FileText className="h-8 w-8 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(file.size)} • {MIME_TYPES_LABELS[file.type] || file.type}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
          onChange={handleFileChange}
          disabled={disabled || uploading}
        />
      </div>

      {/* Nom du document */}
      <div className="space-y-2">
        <Label htmlFor="nom">Nom du document</Label>
        <Input
          id="nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom affiché pour le document"
          disabled={disabled || uploading}
        />
      </div>

      {/* Catégorie */}
      <div className="space-y-2">
        <Label>Catégorie</Label>
        <Select
          value={categorie}
          onValueChange={(value) => setCategorie(value as CategorieDocument)}
          disabled={disabled || uploading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {CATEGORIE_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Visibilité extranet */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="visibleExtranet"
          checked={visibleExtranet}
          onCheckedChange={(checked) => setVisibleExtranet(checked === true)}
          disabled={disabled || uploading}
        />
        <Label htmlFor="visibleExtranet" className="cursor-pointer">
          Rendre visible sur l'extranet copropriétaires
        </Label>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-sm">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Bouton submit */}
      <Button
        type="submit"
        className="w-full"
        disabled={disabled || uploading || !file}
      >
        {uploading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Upload en cours...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Ajouter le document
          </>
        )}
      </Button>
    </form>
  );
}
