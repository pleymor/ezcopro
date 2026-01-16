'use client';

import { useMemo } from 'react';
import { useCopropriete } from './useCopropriete';

const STORAGE_KEY = 'ezcopro_selected_copro_id';

/**
 * Hook optimisé pour obtenir le coproId le plus rapidement possible.
 * Utilise le cache localStorage pour démarrer le chargement des données
 * en parallèle avec la vérification d'authentification.
 *
 * @returns coproId - L'ID de la copropriété (depuis cache ou contexte)
 * @returns isFromCache - true si l'ID vient du cache (pas encore vérifié)
 * @returns selectedCopro - L'objet copropriété complet (une fois chargé)
 * @returns loading - true si le contexte est encore en chargement
 */
export function useCoproId() {
  const { selectedCopro, loading } = useCopropriete();

  // Lire le cache immédiatement (synchrone)
  const cachedId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
  }, []);

  // Priorité: contexte vérifié > cache
  const coproId = selectedCopro?.id || cachedId;
  const isFromCache = !selectedCopro && !!cachedId;

  return {
    coproId,
    isFromCache,
    selectedCopro,
    loading: loading && !cachedId, // Pas de loading si on a un cache
  };
}
