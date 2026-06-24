import { z } from 'zod';
import { firestoreIdSchema, timestampSchema } from './primitives';

// Statut d'une invitation gestionnaire
export const statutInvitationGestionnaireSchema = z.enum([
  'en_attente',
  'acceptee',
  'expiree',
  'annulee',
]);

export type StatutInvitationGestionnaire = z.infer<typeof statutInvitationGestionnaireSchema>;

// Rôles possibles pour une invitation (pas "proprietaire" car non invitable)
export const roleInvitableSchema = z.enum(['gestionnaire', 'lecteur']);

export type RoleInvitable = z.infer<typeof roleInvitableSchema>;

// Schema complet d'une invitation gestionnaire
export const invitationGestionnaireSchema = z.object({
  id: firestoreIdSchema,
  email: z.string().email(),
  coproprieteId: firestoreIdSchema,
  coproprieteNom: z.string(),
  role: roleInvitableSchema,
  token: z.string().uuid(),
  statut: statutInvitationGestionnaireSchema,
  dateEnvoi: timestampSchema,
  dateExpiration: timestampSchema,
  invitePar: firestoreIdSchema,
  inviteParEmail: z.string().email().optional(),
  // Rempli lors de l'acceptation
  acceptePar: firestoreIdSchema.optional(),
  dateAcceptation: timestampSchema.optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type InvitationGestionnaire = z.infer<typeof invitationGestionnaireSchema>;

// Input pour création d'invitation
export const createInvitationGestionnaireInputSchema = z.object({
  email: z.string().email('Email invalide'),
  role: roleInvitableSchema,
});

export type CreateInvitationGestionnaireInput = z.infer<typeof createInvitationGestionnaireInputSchema>;

// Input pour acceptation d'invitation (avec compte existant)
export const acceptInvitationGestionnaireInputSchema = z.object({
  token: z.string().uuid('Token invalide'),
});

export type AcceptInvitationGestionnaireInput = z.infer<typeof acceptInvitationGestionnaireInputSchema>;

// Validation du token pour acceptation sans compte
export const validateInvitationTokenInputSchema = z.object({
  token: z.string().uuid('Token invalide'),
});

export type ValidateInvitationTokenInput = z.infer<typeof validateInvitationTokenInputSchema>;

// Labels pour les statuts
export const statutInvitationLabels: Record<StatutInvitationGestionnaire, string> = {
  en_attente: 'En attente',
  acceptee: 'Acceptée',
  expiree: 'Expirée',
  annulee: 'Annulée',
};

// Couleurs pour les statuts (Tailwind classes)
export const statutInvitationColors: Record<StatutInvitationGestionnaire, string> = {
  en_attente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  acceptee: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  expiree: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  annulee: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};
