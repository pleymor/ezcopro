'use client';

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config';
import type { PreferencesNotification, UpdatePreferencesInput } from '@/types/preferences-notification';
import { DEFAULT_PREFERENCES } from '@/lib/schemas/preferences-notification';

/**
 * Récupère le document de préférences pour un utilisateur
 */
function getPreferencesDoc(coproprieteId: string, userId: string) {
  return doc(db, 'coproprietes', coproprieteId, 'preferencesNotification', userId);
}

/**
 * Subscribe aux préférences de notification d'un utilisateur
 */
export function subscribeToPreferences(
  coproprieteId: string,
  userId: string,
  callback: (preferences: PreferencesNotification | null) => void
): () => void {
  const docRef = getPreferencesDoc(coproprieteId, userId);

  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({
        id: snapshot.id,
        ...snapshot.data(),
      } as PreferencesNotification);
    } else {
      callback(null);
    }
  });
}

/**
 * Récupère les préférences d'un utilisateur
 */
export async function getPreferences(
  coproprieteId: string,
  userId: string
): Promise<PreferencesNotification | null> {
  const docRef = getPreferencesDoc(coproprieteId, userId);
  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as PreferencesNotification;
  }

  return null;
}

/**
 * Crée ou met à jour les préférences d'un utilisateur
 */
export async function savePreferences(
  coproprieteId: string,
  userId: string,
  preferences: UpdatePreferencesInput
): Promise<PreferencesNotification> {
  const docRef = getPreferencesDoc(coproprieteId, userId);
  const now = Timestamp.now();

  // Vérifier si le document existe
  const existing = await getDoc(docRef);

  if (existing.exists()) {
    // Mise à jour
    await updateDoc(docRef, {
      ...preferences,
      updatedAt: now,
    });

    const existingData = existing.data();
    return {
      id: userId,
      emailNouveauxDocuments: preferences.emailNouveauxDocuments,
      createdAt: existingData.createdAt,
      updatedAt: now,
    } as PreferencesNotification;
  } else {
    // Création avec valeurs par défaut
    const newPreferences = {
      ...DEFAULT_PREFERENCES,
      ...preferences,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, newPreferences);

    return {
      id: userId,
      ...newPreferences,
    } as PreferencesNotification;
  }
}

/**
 * Initialise les préférences par défaut pour un nouvel utilisateur
 */
export async function initializePreferences(
  coproprieteId: string,
  userId: string
): Promise<PreferencesNotification> {
  const docRef = getPreferencesDoc(coproprieteId, userId);
  const now = Timestamp.now();

  const newPreferences = {
    ...DEFAULT_PREFERENCES,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(docRef, newPreferences);

  return {
    id: userId,
    ...newPreferences,
  } as PreferencesNotification;
}

/**
 * Récupère tous les utilisateurs qui ont activé les notifications pour nouveaux documents
 * Utilisé pour l'envoi d'emails (appelé depuis Cloud Function)
 */
export async function getUsersWithDocumentNotifications(
  _coproprieteId: string
): Promise<string[]> {
  // Cette fonction serait normalement appelée côté serveur (Cloud Function)
  // Pour l'instant, on retourne un tableau vide côté client
  console.warn('getUsersWithDocumentNotifications should be called from a Cloud Function');
  return [];
}
