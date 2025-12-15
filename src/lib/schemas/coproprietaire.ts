import { z } from 'zod';
import { firestoreIdSchema, timestampSchema, optionalEmailSchema, optionalPhoneSchema } from './primitives';

export const coproprietaireSchema = z.object({
  id: firestoreIdSchema,
  nom: z.string().min(1).max(100),
  prenom: z.string().max(100),
  email: optionalEmailSchema,
  telephone: optionalPhoneSchema,
  userId: firestoreIdSchema.nullable(),
  isAnonymized: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type Coproprietaire = z.infer<typeof coproprietaireSchema>;

// Input pour création
export const createCoproprietaireInputSchema = z.object({
  nom: z.string().min(1).max(100),
  prenom: z.string().max(100).default(''),
  email: optionalEmailSchema,
  telephone: optionalPhoneSchema,
});

export type CreateCoproprietaireInput = z.infer<typeof createCoproprietaireInputSchema>;

// Input pour mise à jour
export const updateCoproprietaireInputSchema = z.object({
  nom: z.string().min(1).max(100).optional(),
  prenom: z.string().max(100).optional(),
  email: optionalEmailSchema,
  telephone: optionalPhoneSchema,
});

export type UpdateCoproprietaireInput = z.infer<typeof updateCoproprietaireInputSchema>;

// Formulaire
export const coproprietaireFormSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(100, 'Maximum 100 caractères'),
  prenom: z.string().max(100, 'Maximum 100 caractères').default(''),
  email: z
    .string()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),
  telephone: z
    .string()
    .regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Format: 0612345678 ou +33612345678')
    .optional()
    .or(z.literal('')),
});

export type CoproprietaireFormData = z.infer<typeof coproprietaireFormSchema>;
