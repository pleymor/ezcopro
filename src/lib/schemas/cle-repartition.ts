import { z } from 'zod';
import { firestoreIdSchema, timestampSchema } from './primitives';

// ============================================
// MILLIÈMES & QUOTE-PARTS
// ============================================

// Millièmes value (0-10000, base for distribution)
export const milliemesSchema = z.number().int().min(0).max(10000);

// Quote-part (embedded in CleRepartition)
export const quotePartSchema = z.object({
  lotId: firestoreIdSchema,
  valeur: milliemesSchema,
});

export type QuotePart = z.infer<typeof quotePartSchema>;

// ============================================
// CLÉ DE RÉPARTITION
// ============================================

// Full CleRepartition schema
export const cleRepartitionSchema = z.object({
  id: firestoreIdSchema,
  nom: z.string().min(1, 'Le nom est requis').max(100, 'Maximum 100 caractères'),
  description: z.string().max(500, 'Maximum 500 caractères').nullable(),
  quoteParts: z.array(quotePartSchema),
  isDefault: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type CleRepartition = z.infer<typeof cleRepartitionSchema>;

// Create input schema
export const createCleRepartitionInputSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(100, 'Maximum 100 caractères'),
  description: z.string().max(500).optional(),
  quoteParts: z.array(quotePartSchema),
});

export type CreateCleRepartitionInput = z.infer<typeof createCleRepartitionInputSchema>;

// Update input schema
export const updateCleRepartitionInputSchema = z.object({
  nom: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  quoteParts: z.array(quotePartSchema).optional(),
});

export type UpdateCleRepartitionInput = z.infer<typeof updateCleRepartitionInputSchema>;

// Form schema (for React Hook Form)
export const cleRepartitionFormSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(100, 'Maximum 100 caractères'),
  description: z.string().max(500, 'Maximum 500 caractères').optional(),
  quoteParts: z.array(
    z.object({
      lotId: z.string().min(1),
      valeur: z.coerce.number().int().min(0, 'La valeur doit être positive').max(10000, 'Maximum 10000'),
    })
  ),
});

export type CleRepartitionFormData = z.infer<typeof cleRepartitionFormSchema>;

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validates the total of quote-parts against the expected 10000 millièmes
 */
export function validateQuotePartsTotal(quoteParts: QuotePart[]): {
  total: number;
  isValid: boolean;
  deviation: number;
} {
  const total = quoteParts.reduce((sum, qp) => sum + qp.valeur, 0);
  return {
    total,
    isValid: total === 10000,
    deviation: total - 10000,
  };
}

/**
 * Creates quote-parts from lot tantièmes, normalized to base 10000
 */
export function createQuotePartsFromTantiemes(
  lots: Array<{ id: string; tantiemes: number }>
): QuotePart[] {
  const totalTantiemes = lots.reduce((sum, lot) => sum + lot.tantiemes, 0);

  if (totalTantiemes === 0) {
    return lots.map((lot) => ({ lotId: lot.id, valeur: 0 }));
  }

  const quoteParts: QuotePart[] = lots.map((lot) => ({
    lotId: lot.id,
    valeur: Math.round((lot.tantiemes / totalTantiemes) * 10000),
  }));

  // Adjust rounding to ensure total = 10000
  const total = quoteParts.reduce((sum, qp) => sum + qp.valeur, 0);
  const firstQuotePart = quoteParts[0];
  if (total !== 10000 && firstQuotePart) {
    firstQuotePart.valeur += 10000 - total;
  }

  return quoteParts;
}

// ============================================
// ERROR TYPES
// ============================================

export type CleRepartitionErrorCode =
  | 'CLE_NOT_FOUND'
  | 'CLE_NAME_EXISTS'
  | 'CLE_IN_USE'
  | 'CLE_IS_DEFAULT'
  | 'INVALID_QUOTE_PARTS';

export class CleRepartitionError extends Error {
  constructor(
    public code: CleRepartitionErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'CleRepartitionError';
  }
}

// Error messages in French
export const cleRepartitionErrorMessages: Record<CleRepartitionErrorCode, string> = {
  CLE_NOT_FOUND: 'Clé de répartition introuvable',
  CLE_NAME_EXISTS: 'Une clé de répartition avec ce nom existe déjà',
  CLE_IN_USE: 'Cette clé est utilisée dans un ou plusieurs appels de fonds et ne peut pas être supprimée',
  CLE_IS_DEFAULT: 'La clé par défaut ne peut pas être supprimée',
  INVALID_QUOTE_PARTS: 'Les quotes-parts sont invalides',
};
