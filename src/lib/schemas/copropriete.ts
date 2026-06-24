import { z } from 'zod';
import { firestoreIdSchema, timestampSchema } from './primitives';
import { membresMapSchema } from './membre-syndic';

export const coproprieteSchema = z.object({
  id: firestoreIdSchema,
  nom: z.string().min(1).max(200),
  adresse: z.string().min(1).max(500),
  // Map userId -> MembreSyndic (détails des membres)
  membres: membresMapSchema,
  // Array des userIds pour les queries Firestore (array-contains)
  memberIds: z.array(firestoreIdSchema).min(1),
  totalTantiemes: z.number().int().nonnegative(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type Copropriete = z.infer<typeof coproprieteSchema>;

// Input pour création
export const createCoproprieteInputSchema = z.object({
  nom: z.string().min(1).max(200),
  adresse: z.string().min(1).max(500),
});

export type CreateCoproprieteInput = z.infer<typeof createCoproprieteInputSchema>;

// Input pour mise à jour
export const updateCoproprieteInputSchema = z.object({
  nom: z.string().min(1).max(200).optional(),
  adresse: z.string().min(1).max(500).optional(),
});

export type UpdateCoproprieteInput = z.infer<typeof updateCoproprieteInputSchema>;

// Formulaire
export const coproprieteFormSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(200, 'Maximum 200 caractères'),
  adresse: z.string().min(1, "L'adresse est requise").max(500, 'Maximum 500 caractères'),
});

export type CoproprieteFormData = z.infer<typeof coproprieteFormSchema>;
