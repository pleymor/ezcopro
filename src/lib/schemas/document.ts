import { z } from 'zod';
import { firestoreIdSchema, timestampSchema } from './primitives';

export const accessLevelSchema = z.enum(['syndic', 'board', 'all']);

export type AccessLevel = z.infer<typeof accessLevelSchema>;

export const accessLevelLabels: Record<AccessLevel, string> = {
  syndic: 'Syndic uniquement',
  board: 'Conseil syndical',
  all: 'Tous les copropriétaires',
};

export const documentSchema = z.object({
  id: firestoreIdSchema,
  name: z.string().min(1).max(255),
  type: z.string(), // MIME type
  url: z.string().url(),
  size: z.number().int().nonnegative(), // bytes
  folderId: firestoreIdSchema.nullable(), // null = root
  accessLevel: accessLevelSchema,
  uploadedBy: firestoreIdSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type Document = z.infer<typeof documentSchema>;

export const createDocumentInputSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string(),
  url: z.string().url(),
  size: z.number().int().nonnegative(),
  folderId: firestoreIdSchema.nullable().optional(),
  accessLevel: accessLevelSchema.default('all'),
});

export type CreateDocumentInput = z.infer<typeof createDocumentInputSchema>;

export const updateDocumentInputSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  folderId: firestoreIdSchema.nullable().optional(),
  accessLevel: accessLevelSchema.optional(),
});

export type UpdateDocumentInput = z.infer<typeof updateDocumentInputSchema>;
