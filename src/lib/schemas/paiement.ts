import { z } from 'zod';
import { firestoreIdSchema, timestampSchema, amountCentsSchema } from './primitives';

export const paiementSchema = z.object({
  id: firestoreIdSchema,
  coproprietaireId: firestoreIdSchema,
  montantCents: amountCentsSchema,
  datePaiement: timestampSchema,
  reference: z.string().max(100).nullable(),
  createdBy: firestoreIdSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type Paiement = z.infer<typeof paiementSchema>;

// Input pour création
export const createPaiementInputSchema = z.object({
  coproprietaireId: firestoreIdSchema,
  montantCents: amountCentsSchema,
  datePaiement: z.date(),
  reference: z.string().max(100).optional(),
});

export type CreatePaiementInput = z.infer<typeof createPaiementInputSchema>;

// Formulaire
export const paiementFormSchema = z.object({
  coproprietaireId: z.string().min(1, 'Veuillez sélectionner un copropriétaire'),
  montantEuros: z.coerce
    .number()
    .positive('Le montant doit être positif')
    .multipleOf(0.01, 'Maximum 2 décimales'),
  datePaiement: z.coerce.date(),
  reference: z.string().max(100).optional(),
});

export type PaiementFormData = z.infer<typeof paiementFormSchema>;

// Helper pour convertir le formulaire en input
export const paiementFormToInput = (form: PaiementFormData): CreatePaiementInput => ({
  coproprietaireId: form.coproprietaireId,
  montantCents: Math.round(form.montantEuros * 100),
  datePaiement: form.datePaiement,
  reference: form.reference,
});
