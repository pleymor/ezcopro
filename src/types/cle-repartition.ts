export type {
  // Core types
  CleRepartition,
  QuotePart,
  // Input types
  CreateCleRepartitionInput,
  UpdateCleRepartitionInput,
  CleRepartitionFormData,
  // Error types
  CleRepartitionErrorCode,
} from '@/lib/schemas/cle-repartition';

export {
  // Schemas (for runtime validation)
  cleRepartitionSchema,
  quotePartSchema,
  milliemesSchema,
  createCleRepartitionInputSchema,
  updateCleRepartitionInputSchema,
  cleRepartitionFormSchema,
  // Validation helpers
  validateQuotePartsTotal,
  createQuotePartsFromTantiemes,
  // Error class and messages
  CleRepartitionError,
  cleRepartitionErrorMessages,
} from '@/lib/schemas/cle-repartition';
