import { z } from 'zod';

// Montant en centimes (entier positif)
export const amountCentsSchema = z.number().int().positive();

// Tantièmes (entier positif)
export const tantiemesSchema = z.number().int().positive();

// Email optionnel
export const optionalEmailSchema = z.string().email().optional().nullable();

// Téléphone français optionnel
export const optionalPhoneSchema = z
  .string()
  .regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Format téléphone invalide')
  .optional()
  .nullable();

// Timestamp Firestore
export const timestampSchema = z.object({
  seconds: z.number(),
  nanoseconds: z.number(),
});

export type FirestoreTimestamp = z.infer<typeof timestampSchema>;

// ID Firestore
export const firestoreIdSchema = z.string().min(1).max(128);
