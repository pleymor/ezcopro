import { z } from 'zod';
import { firestoreIdSchema, timestampSchema } from './primitives';

// Schema des préférences de notification
export const preferencesNotificationSchema = z.object({
  id: firestoreIdSchema, // = userId Firebase
  emailNouveauxDocuments: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type PreferencesNotification = z.infer<typeof preferencesNotificationSchema>;

// Input pour mise à jour des préférences
export const updatePreferencesInputSchema = z.object({
  emailNouveauxDocuments: z.boolean(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesInputSchema>;

// Préférences par défaut pour un nouveau compte
export const DEFAULT_PREFERENCES: Omit<PreferencesNotification, 'id' | 'createdAt' | 'updatedAt'> = {
  emailNouveauxDocuments: true,
};
