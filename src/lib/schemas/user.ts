import { z } from 'zod';
import { firestoreIdSchema, timestampSchema } from './primitives';

export const userSchema = z.object({
  id: firestoreIdSchema,
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
  photoURL: z.string().url().nullable(),
  coproprietes: z.array(firestoreIdSchema),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type User = z.infer<typeof userSchema>;

// Input pour création/mise à jour
export const upsertUserInputSchema = z.object({
  id: firestoreIdSchema,
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
  photoURL: z.string().url().nullable(),
});

export type UpsertUserInput = z.infer<typeof upsertUserInputSchema>;
