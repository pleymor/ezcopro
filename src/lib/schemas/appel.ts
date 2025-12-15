import { z } from 'zod';
import { firestoreIdSchema, timestampSchema, amountCentsSchema } from './primitives';

export const appelDeFondsSchema = z.object({
  id: firestoreIdSchema,
  libelle: z.string().min(1).max(200),
  montantTotalCents: amountCentsSchema,
  dateEcheance: timestampSchema,
  dateCreation: timestampSchema,
  createdBy: firestoreIdSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type AppelDeFonds = z.infer<typeof appelDeFondsSchema>;

// Input pour création
export const createAppelInputSchema = z.object({
  libelle: z.string().min(1).max(200),
  montantTotalCents: amountCentsSchema,
  dateEcheance: z.date(),
});

export type CreateAppelInput = z.infer<typeof createAppelInputSchema>;

// Formulaire
export const appelFormSchema = z.object({
  libelle: z.string().min(1, 'Le libellé est requis').max(200, 'Maximum 200 caractères'),
  montantEuros: z.coerce
    .number()
    .positive('Le montant doit être positif')
    .multipleOf(0.01, 'Maximum 2 décimales'),
  dateEcheance: z.coerce.date(),
});

export type AppelFormData = z.infer<typeof appelFormSchema>;

// Helper pour convertir le formulaire en input
export const appelFormToInput = (form: AppelFormData): CreateAppelInput => ({
  libelle: form.libelle,
  montantTotalCents: Math.round(form.montantEuros * 100),
  dateEcheance: form.dateEcheance,
});
