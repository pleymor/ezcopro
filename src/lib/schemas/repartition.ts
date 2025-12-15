import { z } from 'zod';
import { firestoreIdSchema, timestampSchema, amountCentsSchema, tantiemesSchema } from './primitives';

export const repartitionSchema = z.object({
  id: firestoreIdSchema,
  lotId: firestoreIdSchema,
  coproprietaireId: firestoreIdSchema,
  montantCents: amountCentsSchema,
  tantiemesSnapshot: tantiemesSchema,
  createdAt: timestampSchema,
});

export type Repartition = z.infer<typeof repartitionSchema>;
