import { z } from 'zod';
import { firestoreIdSchema, timestampSchema, tantiemesSchema } from './primitives';

export const lotTypeSchema = z.enum([
  'appartement',
  'cave',
  'parking',
  'local_commercial',
  'autre',
]);

export type LotType = z.infer<typeof lotTypeSchema>;

export const lotTypeLabels: Record<LotType, string> = {
  appartement: 'Appartement',
  cave: 'Cave',
  parking: 'Parking',
  local_commercial: 'Local commercial',
  autre: 'Autre',
};

export const lotSchema = z.object({
  id: firestoreIdSchema,
  numero: z.string().min(1).max(20),
  type: lotTypeSchema,
  tantiemes: tantiemesSchema,
  coproprietaireId: firestoreIdSchema,
  description: z.string().max(500).nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type Lot = z.infer<typeof lotSchema>;

// Input pour création
export const createLotInputSchema = z.object({
  numero: z.string().min(1).max(20),
  type: lotTypeSchema,
  tantiemes: tantiemesSchema,
  coproprietaireId: firestoreIdSchema,
  description: z.string().max(500).optional(),
});

export type CreateLotInput = z.infer<typeof createLotInputSchema>;

// Input pour mise à jour
export const updateLotInputSchema = z.object({
  numero: z.string().min(1).max(20).optional(),
  type: lotTypeSchema.optional(),
  tantiemes: tantiemesSchema.optional(),
  coproprietaireId: firestoreIdSchema.optional(),
  description: z.string().max(500).nullable().optional(),
});

export type UpdateLotInput = z.infer<typeof updateLotInputSchema>;

// Formulaire
export const lotFormSchema = z.object({
  numero: z.string().min(1, 'Le numéro est requis').max(20, 'Maximum 20 caractères'),
  type: lotTypeSchema,
  tantiemes: z.coerce
    .number()
    .int('Les tantièmes doivent être un nombre entier')
    .positive('Les tantièmes doivent être positifs'),
  coproprietaireId: z.string().min(1, 'Veuillez sélectionner un copropriétaire'),
  description: z.string().max(500).optional(),
});

export type LotFormData = z.infer<typeof lotFormSchema>;
