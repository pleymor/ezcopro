import { z } from 'zod';
import { firestoreIdSchema, timestampSchema } from './primitives';

export const condoSchema = z.object({
  id: firestoreIdSchema,
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(500),
  ownerId: firestoreIdSchema, // The syndic (single admin)
  boardMemberIds: z.array(firestoreIdSchema), // Conseil syndical user IDs
  totalShares: z.number().int().nonnegative(), // Total tantièmes
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  deletedAt: timestampSchema.nullable().optional(), // Soft delete timestamp
});

export type Condo = z.infer<typeof condoSchema>;

export const createCondoInputSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(500),
});

export type CreateCondoInput = z.infer<typeof createCondoInputSchema>;

export const updateCondoInputSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  address: z.string().min(1).max(500).optional(),
});

export type UpdateCondoInput = z.infer<typeof updateCondoInputSchema>;

export const condoFormSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(200, 'Maximum 200 caractères'),
  address: z.string().min(1, "L'adresse est requise").max(500, 'Maximum 500 caractères'),
});

export type CondoFormData = z.infer<typeof condoFormSchema>;
