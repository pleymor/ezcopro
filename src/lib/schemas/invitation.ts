import { z } from 'zod';
import { firestoreIdSchema, timestampSchema } from './primitives';

export const invitationSchema = z.object({
  code: z.string().min(6).max(10),
  coproprietéId: firestoreIdSchema,
  coproprietaireId: firestoreIdSchema,
  createdBy: firestoreIdSchema,
  expiresAt: timestampSchema,
  usedAt: timestampSchema.nullable(),
  usedBy: firestoreIdSchema.nullable(),
  createdAt: timestampSchema,
});

export type Invitation = z.infer<typeof invitationSchema>;
