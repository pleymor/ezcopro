import { z } from 'zod';
import { firestoreIdSchema, timestampSchema } from './primitives';
import { accessLevelSchema } from './document';

export const folderSchema = z.object({
  id: firestoreIdSchema,
  name: z.string().min(1).max(255),
  parentId: firestoreIdSchema.nullable(), // null = root
  accessLevel: accessLevelSchema,
  createdBy: firestoreIdSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type Folder = z.infer<typeof folderSchema>;

export const createFolderInputSchema = z.object({
  name: z.string().min(1).max(255),
  parentId: firestoreIdSchema.nullable().optional(),
  accessLevel: accessLevelSchema.default('all'),
});

export type CreateFolderInput = z.infer<typeof createFolderInputSchema>;

export const updateFolderInputSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  parentId: firestoreIdSchema.nullable().optional(),
  accessLevel: accessLevelSchema.optional(),
});

export type UpdateFolderInput = z.infer<typeof updateFolderInputSchema>;

export const folderFormSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255),
  accessLevel: accessLevelSchema,
});

export type FolderFormData = z.infer<typeof folderFormSchema>;
