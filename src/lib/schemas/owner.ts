import { z } from 'zod';
import { firestoreIdSchema, timestampSchema } from './primitives';

export const ownerSchema = z.object({
  id: firestoreIdSchema,
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  userId: firestoreIdSchema.nullable(), // Linked Firebase account
  isBoardMember: z.boolean().default(false), // Membre du conseil syndical
  isAnonymized: z.boolean().default(false),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type Owner = z.infer<typeof ownerSchema>;

export const createOwnerInputSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  isBoardMember: z.boolean().default(false),
});

export type CreateOwnerInput = z.infer<typeof createOwnerInputSchema>;

export const updateOwnerInputSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  isBoardMember: z.boolean().optional(),
});

export type UpdateOwnerInput = z.infer<typeof updateOwnerInputSchema>;

export const ownerFormSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis').max(100),
  lastName: z.string().min(1, 'Le nom est requis').max(100),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  isBoardMember: z.boolean().default(false),
});

export type OwnerFormData = z.infer<typeof ownerFormSchema>;
