import { z } from 'zod';
import { firestoreIdSchema, timestampSchema } from './primitives';

// Rôles possibles pour un membre syndic
export const roleSyndicSchema = z.enum(['admin', 'gestionnaire', 'lecteur']);

export type RoleSyndic = z.infer<typeof roleSyndicSchema>;

// Schema pour un membre de l'équipe syndic
export const membreSyndicSchema = z.object({
  role: roleSyndicSchema,
  email: z.string().email().optional(),
  displayName: z.string().optional(),
  addedAt: timestampSchema,
  addedBy: firestoreIdSchema,
});

export type MembreSyndic = z.infer<typeof membreSyndicSchema>;

// Map des membres (userId -> MembreSyndic)
export const membresMapSchema = z.record(firestoreIdSchema, membreSyndicSchema);

export type MembresMap = z.infer<typeof membresMapSchema>;

// Input pour ajouter un membre
export const addMembreInputSchema = z.object({
  userId: firestoreIdSchema,
  role: roleSyndicSchema,
  email: z.string().email().optional(),
  displayName: z.string().optional(),
});

export type AddMembreInput = z.infer<typeof addMembreInputSchema>;

// Input pour mettre à jour le rôle d'un membre
export const updateMembreRoleInputSchema = z.object({
  userId: firestoreIdSchema,
  role: roleSyndicSchema,
});

export type UpdateMembreRoleInput = z.infer<typeof updateMembreRoleInputSchema>;

// Labels pour les rôles
export const roleLabels: Record<RoleSyndic, string> = {
  admin: 'Administrateur',
  gestionnaire: 'Gestionnaire',
  lecteur: 'Lecteur',
};

// Descriptions pour les rôles
export const roleDescriptions: Record<RoleSyndic, string> = {
  admin: 'Accès complet + gestion de l\'équipe',
  gestionnaire: 'Créer, modifier et supprimer les données',
  lecteur: 'Consultation seule',
};

// Permissions par rôle
export const rolePermissions: Record<RoleSyndic, {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canManageTeam: boolean;
  canTransferOwnership: boolean;
}> = {
  admin: {
    canRead: true,
    canWrite: true,
    canDelete: true,
    canManageTeam: true,
    canTransferOwnership: true,
  },
  gestionnaire: {
    canRead: true,
    canWrite: true,
    canDelete: true,
    canManageTeam: false,
    canTransferOwnership: false,
  },
  lecteur: {
    canRead: true,
    canWrite: false,
    canDelete: false,
    canManageTeam: false,
    canTransferOwnership: false,
  },
};
