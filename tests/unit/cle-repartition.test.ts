import { describe, it, expect } from 'vitest';
import {
  cleRepartitionFormSchema,
  validateQuotePartsTotal,
  createQuotePartsFromTantiemes,
  CleRepartitionError,
} from '@/lib/schemas/cle-repartition';

// T009 - Unit test for cleRepartitionFormSchema validation
describe('cleRepartitionFormSchema', () => {
  it('should validate a correct form input', () => {
    const validInput = {
      nom: 'Charges générales',
      description: 'Répartition standard',
      quoteParts: [
        { lotId: 'lot-1', valeur: 5000 },
        { lotId: 'lot-2', valeur: 5000 },
      ],
    };

    const result = cleRepartitionFormSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const invalidInput = {
      nom: '',
      quoteParts: [],
    };

    const result = cleRepartitionFormSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('nom');
    }
  });

  it('should reject name exceeding 100 characters', () => {
    const invalidInput = {
      nom: 'a'.repeat(101),
      quoteParts: [],
    };

    const result = cleRepartitionFormSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it('should reject quote-part valeur below 0', () => {
    const invalidInput = {
      nom: 'Test',
      quoteParts: [{ lotId: 'lot-1', valeur: -1 }],
    };

    const result = cleRepartitionFormSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it('should reject quote-part valeur above 10000', () => {
    const invalidInput = {
      nom: 'Test',
      quoteParts: [{ lotId: 'lot-1', valeur: 10001 }],
    };

    const result = cleRepartitionFormSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it('should accept description up to 500 characters', () => {
    const validInput = {
      nom: 'Test',
      description: 'a'.repeat(500),
      quoteParts: [],
    };

    const result = cleRepartitionFormSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should coerce string values to numbers for quoteParts', () => {
    const input = {
      nom: 'Test',
      quoteParts: [{ lotId: 'lot-1', valeur: '5000' }],
    };

    const result = cleRepartitionFormSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quoteParts[0]?.valeur).toBe(5000);
    }
  });
});

// T010 - Unit test for validateQuotePartsTotal helper
describe('validateQuotePartsTotal', () => {
  it('should return valid when total equals 10000', () => {
    const quoteParts = [
      { lotId: 'lot-1', valeur: 5000 },
      { lotId: 'lot-2', valeur: 3000 },
      { lotId: 'lot-3', valeur: 2000 },
    ];

    const result = validateQuotePartsTotal(quoteParts);

    expect(result.total).toBe(10000);
    expect(result.isValid).toBe(true);
    expect(result.deviation).toBe(0);
  });

  it('should return invalid with positive deviation when total exceeds 10000', () => {
    const quoteParts = [
      { lotId: 'lot-1', valeur: 6000 },
      { lotId: 'lot-2', valeur: 5000 },
    ];

    const result = validateQuotePartsTotal(quoteParts);

    expect(result.total).toBe(11000);
    expect(result.isValid).toBe(false);
    expect(result.deviation).toBe(1000);
  });

  it('should return invalid with negative deviation when total is below 10000', () => {
    const quoteParts = [
      { lotId: 'lot-1', valeur: 4000 },
      { lotId: 'lot-2', valeur: 3000 },
    ];

    const result = validateQuotePartsTotal(quoteParts);

    expect(result.total).toBe(7000);
    expect(result.isValid).toBe(false);
    expect(result.deviation).toBe(-3000);
  });

  it('should handle empty array', () => {
    const result = validateQuotePartsTotal([]);

    expect(result.total).toBe(0);
    expect(result.isValid).toBe(false);
    expect(result.deviation).toBe(-10000);
  });

  it('should handle single lot with full share', () => {
    const quoteParts = [{ lotId: 'lot-1', valeur: 10000 }];

    const result = validateQuotePartsTotal(quoteParts);

    expect(result.total).toBe(10000);
    expect(result.isValid).toBe(true);
    expect(result.deviation).toBe(0);
  });
});

// T011 - Unit test for createQuotePartsFromTantiemes
describe('createQuotePartsFromTantiemes', () => {
  it('should create quote-parts normalized to base 10000', () => {
    const lots = [
      { id: 'lot-1', tantiemes: 500 },
      { id: 'lot-2', tantiemes: 300 },
      { id: 'lot-3', tantiemes: 200 },
    ];

    const quoteParts = createQuotePartsFromTantiemes(lots);

    expect(quoteParts).toHaveLength(3);
    expect(quoteParts[0]?.lotId).toBe('lot-1');
    expect(quoteParts[1]?.lotId).toBe('lot-2');
    expect(quoteParts[2]?.lotId).toBe('lot-3');

    // Total should equal 10000
    const total = quoteParts.reduce((sum, qp) => sum + qp.valeur, 0);
    expect(total).toBe(10000);
  });

  it('should handle rounding by adjusting first lot', () => {
    // Create lots that will cause rounding issues
    const lots = [
      { id: 'lot-1', tantiemes: 333 },
      { id: 'lot-2', tantiemes: 333 },
      { id: 'lot-3', tantiemes: 334 },
    ];

    const quoteParts = createQuotePartsFromTantiemes(lots);

    // Total should still equal 10000 after adjustment
    const total = quoteParts.reduce((sum, qp) => sum + qp.valeur, 0);
    expect(total).toBe(10000);
  });

  it('should handle single lot', () => {
    const lots = [{ id: 'lot-1', tantiemes: 1000 }];

    const quoteParts = createQuotePartsFromTantiemes(lots);

    expect(quoteParts).toHaveLength(1);
    expect(quoteParts[0]?.valeur).toBe(10000);
  });

  it('should handle empty lots array', () => {
    const quoteParts = createQuotePartsFromTantiemes([]);

    expect(quoteParts).toHaveLength(0);
  });

  it('should handle lots with zero tantièmes', () => {
    const lots = [
      { id: 'lot-1', tantiemes: 0 },
      { id: 'lot-2', tantiemes: 0 },
    ];

    const quoteParts = createQuotePartsFromTantiemes(lots);

    expect(quoteParts).toHaveLength(2);
    expect(quoteParts[0]?.valeur).toBe(0);
    expect(quoteParts[1]?.valeur).toBe(0);
  });
});

// T018 - Unit test for quote-part update (added early for completeness)
describe('CleRepartitionError', () => {
  it('should create error with correct code and message', () => {
    const error = new CleRepartitionError(
      'CLE_NAME_EXISTS',
      'Une clé de répartition avec ce nom existe déjà'
    );

    expect(error.name).toBe('CleRepartitionError');
    expect(error.code).toBe('CLE_NAME_EXISTS');
    expect(error.message).toBe('Une clé de répartition avec ce nom existe déjà');
    expect(error instanceof Error).toBe(true);
  });

  it('should have all error codes defined', () => {
    const codes = [
      'CLE_NOT_FOUND',
      'CLE_NAME_EXISTS',
      'CLE_IN_USE',
      'CLE_IS_DEFAULT',
      'INVALID_QUOTE_PARTS',
    ] as const;

    codes.forEach((code) => {
      const error = new CleRepartitionError(code, 'Test message');
      expect(error.code).toBe(code);
    });
  });
});
