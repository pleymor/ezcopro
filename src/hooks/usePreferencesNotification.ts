'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useExtranetCondo } from './useExtranetCondo';
import {
  subscribeToPreferences,
  savePreferences,
} from '@/lib/firebase/services/preferences-notification';
import type { PreferencesNotification, UpdatePreferencesInput } from '@/types/preferences-notification';
import { DEFAULT_PREFERENCES } from '@/lib/schemas/preferences-notification';
import { IS_TEST_MODE } from '@/lib/test/mock-data';
import { TEST_PREFERENCES_NOTIFICATION } from '@/lib/test/mock-data-extranet';

export interface UsePreferencesNotificationResult {
  preferences: PreferencesNotification | null;
  loading: boolean;
  error: Error | null;
  saving: boolean;
  updatePreferences: (preferences: UpdatePreferencesInput) => Promise<void>;
  emailNouveauxDocuments: boolean;
  toggleEmailNouveauxDocuments: () => Promise<void>;
}

/**
 * Hook pour gérer les préférences de notification d'un copropriétaire
 */
export function usePreferencesNotification(): UsePreferencesNotificationResult {
  const { user } = useAuth();
  const { selectedCondo, loading: condoLoading } = useExtranetCondo();
  const coproprieteId = selectedCondo?.coproprieteId ?? null;
  const [preferences, setPreferences] = useState<PreferencesNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saving, setSaving] = useState(false);

  // Subscribe aux préférences
  useEffect(() => {
    if (condoLoading) return;

    if (!coproprieteId || !user?.uid) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    // En mode test, utiliser les données mock
    if (IS_TEST_MODE) {
      const mockPrefs = TEST_PREFERENCES_NOTIFICATION.find((p) => p.id === user.uid);
      setPreferences(mockPrefs || null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToPreferences(coproprieteId, user.uid, (prefs) => {
      setPreferences(prefs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [coproprieteId, user?.uid, condoLoading]);

  // Mettre à jour les préférences
  const updatePreferences = useCallback(
    async (newPreferences: UpdatePreferencesInput): Promise<void> => {
      if (!coproprieteId || !user?.uid) {
        throw new Error('Non authentifié');
      }

      setSaving(true);
      setError(null);

      try {
        const updated = await savePreferences(coproprieteId, user.uid, newPreferences);
        setPreferences(updated);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur lors de la sauvegarde');
        setError(error);
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [coproprieteId, user?.uid]
  );

  // Raccourci pour le toggle email nouveaux documents
  const toggleEmailNouveauxDocuments = useCallback(async (): Promise<void> => {
    const currentValue = preferences?.emailNouveauxDocuments ?? DEFAULT_PREFERENCES.emailNouveauxDocuments;
    await updatePreferences({ emailNouveauxDocuments: !currentValue });
  }, [preferences?.emailNouveauxDocuments, updatePreferences]);

  // Valeur courante de la préférence email (avec fallback sur défaut)
  const emailNouveauxDocuments = preferences?.emailNouveauxDocuments ?? DEFAULT_PREFERENCES.emailNouveauxDocuments;

  return {
    preferences,
    loading: loading || condoLoading,
    error,
    saving,
    updatePreferences,
    emailNouveauxDocuments,
    toggleEmailNouveauxDocuments,
  };
}
