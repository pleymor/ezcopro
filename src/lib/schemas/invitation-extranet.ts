import { z } from 'zod';
import { firestoreIdSchema, timestampSchema } from './primitives';

// Statut d'une invitation
export const statutInvitationSchema = z.enum(['en_attente', 'acceptee', 'expiree']);

export type StatutInvitation = z.infer<typeof statutInvitationSchema>;

// Schema complet d'une invitation extranet
export const invitationExtranetSchema = z.object({
  id: firestoreIdSchema,
  email: z.string().email(),
  coproprietaireId: firestoreIdSchema,
  token: z.string().uuid(),
  dateEnvoi: timestampSchema,
  dateExpiration: timestampSchema,
  statut: statutInvitationSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type InvitationExtranet = z.infer<typeof invitationExtranetSchema>;

// Input pour création d'invitation
export const createInvitationInputSchema = z.object({
  email: z.string().email('Email invalide'),
  coproprietaireId: firestoreIdSchema,
});

export type CreateInvitationInput = z.infer<typeof createInvitationInputSchema>;

// Input pour acceptation d'invitation
export const acceptInvitationInputSchema = z.object({
  token: z.string().uuid('Token invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export type AcceptInvitationInput = z.infer<typeof acceptInvitationInputSchema>;
