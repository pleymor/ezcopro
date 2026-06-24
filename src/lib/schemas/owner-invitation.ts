import { z } from 'zod';
import { firestoreIdSchema, timestampSchema } from './primitives';

export const invitationStatusSchema = z.enum(['pending', 'accepted', 'expired', 'cancelled']);

export type InvitationStatus = z.infer<typeof invitationStatusSchema>;

export const invitationStatusLabels: Record<InvitationStatus, string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  expired: 'Expirée',
  cancelled: 'Annulée',
};

export const invitationStatusColors: Record<InvitationStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  expired: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const ownerInvitationSchema = z.object({
  id: firestoreIdSchema,
  condoId: firestoreIdSchema,
  condoName: z.string(),
  ownerId: firestoreIdSchema, // ID of the owner in owners subcollection
  email: z.string().email(),
  token: z.string(), // UUID for the invitation link
  status: invitationStatusSchema,
  invitedBy: firestoreIdSchema,
  invitedByEmail: z.string().email().optional(),
  acceptedBy: firestoreIdSchema.nullable(), // Firebase user ID who accepted
  sentAt: timestampSchema,
  expiresAt: timestampSchema,
  acceptedAt: timestampSchema.nullable(),
});

export type OwnerInvitation = z.infer<typeof ownerInvitationSchema>;

export const createOwnerInvitationInputSchema = z.object({
  ownerId: firestoreIdSchema,
  email: z.string().email(),
});

export type CreateOwnerInvitationInput = z.infer<typeof createOwnerInvitationInputSchema>;
