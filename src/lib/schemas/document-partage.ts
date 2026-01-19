import { z } from 'zod';
import { firestoreIdSchema, timestampSchema } from './primitives';

// Catégories de documents
export const categorieDocumentSchema = z.enum([
  'ag',
  'contrats',
  'reglement',
  'travaux',
  'autres',
]);

export type CategorieDocument = z.infer<typeof categorieDocumentSchema>;

// Labels des catégories pour l'affichage
export const CATEGORIE_LABELS: Record<CategorieDocument, string> = {
  ag: 'Assemblées Générales',
  contrats: 'Contrats',
  reglement: 'Règlement',
  travaux: 'Travaux',
  autres: 'Autres',
};

// Types MIME autorisés
export const mimeTypeAutoriseSchema = z.enum([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

export type MimeTypeAutorise = z.infer<typeof mimeTypeAutoriseSchema>;

// Taille maximale de fichier (10 Mo)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Quota de stockage par copropriété (500 Mo)
export const QUOTA_STOCKAGE_COPRO = 500 * 1024 * 1024;

// Schema complet d'un document partagé
export const documentPartageSchema = z.object({
  id: firestoreIdSchema,
  nom: z.string().min(1).max(255),
  type: mimeTypeAutoriseSchema,
  taille: z.number().int().positive().max(MAX_FILE_SIZE),
  storagePath: z.string().min(1),
  categorie: categorieDocumentSchema,
  visibleExtranet: z.boolean(),
  datePartage: timestampSchema.nullable(),
  consultePar: z.array(firestoreIdSchema),
  uploadedBy: firestoreIdSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type DocumentPartage = z.infer<typeof documentPartageSchema>;

// Input pour upload de document
export const uploadDocumentInputSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(255, 'Nom trop long'),
  categorie: categorieDocumentSchema,
  visibleExtranet: z.boolean().default(false),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentInputSchema>;

// Input pour mise à jour de visibilité
export const updateVisibiliteInputSchema = z.object({
  visibleExtranet: z.boolean(),
});

export type UpdateVisibiliteInput = z.infer<typeof updateVisibiliteInputSchema>;
