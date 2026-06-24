export type {
  DocumentPartage,
  CategorieDocument,
  MimeTypeAutorise,
  UploadDocumentInput,
  UpdateVisibiliteInput,
} from '@/lib/schemas/document-partage';

export {
  documentPartageSchema,
  categorieDocumentSchema,
  mimeTypeAutoriseSchema,
  uploadDocumentInputSchema,
  updateVisibiliteInputSchema,
  CATEGORIE_LABELS,
  MAX_FILE_SIZE,
  QUOTA_STOCKAGE_COPRO,
} from '@/lib/schemas/document-partage';

// Re-export NiveauAcces from dossier for convenience
export type { NiveauAcces } from '@/lib/schemas/dossier';
export { niveauAccesSchema, NIVEAU_ACCES_LABELS } from '@/lib/schemas/dossier';
