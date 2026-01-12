'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  CleRepartition,
  CreateCleRepartitionInput,
  UpdateCleRepartitionInput,
  QuotePart,
} from '@/lib/schemas/cle-repartition';
import { validateQuotePartsTotal, CleRepartitionError } from '@/lib/schemas/cle-repartition';
import {
  IS_TEST_MODE,
  mockStore,
  generateTestId,
  createMockTimestamp,
} from '@/lib/test/mock-data';
import {
  subscribeToClesRepartition,
  createCleRepartition as fbCreateCle,
  updateCleRepartition as fbUpdateCle,
  deleteCleRepartition as fbDeleteCle,
  createDefaultCleRepartition as fbCreateDefaultCle,
  checkCleNameExists,
  isCleInUse,
} from '@/lib/firebase/cles-repartition';

interface UseClesRepartitionResult {
  cles: CleRepartition[];
  loading: boolean;
  error: Error | null;

  // CRUD operations
  createCle: (input: CreateCleRepartitionInput) => Promise<string>;
  updateCle: (cleId: string, input: UpdateCleRepartitionInput) => Promise<void>;
  deleteCle: (cleId: string) => Promise<void>;

  // Helpers
  createDefaultCle: (lots: Array<{ id: string; tantiemes: number }>) => Promise<string>;
  getCleById: (cleId: string) => CleRepartition | undefined;
  validateTotal: (quoteParts: QuotePart[]) => { total: number; isValid: boolean; deviation: number };
  checkNameExists: (nom: string, excludeId?: string) => Promise<boolean>;
  checkIsInUse: (cleId: string) => Promise<boolean>;
}

export function useClesRepartition(coproId: string | null): UseClesRepartitionResult {
  const [cles, setCles] = useState<CleRepartition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to clés changes
  useEffect(() => {
    if (!coproId) {
      setCles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Test mode uses mock data
    if (IS_TEST_MODE) {
      setCles(mockStore.clesRepartition);
      setLoading(false);
      return;
    }

    // Production mode uses Firebase
    const unsubscribe = subscribeToClesRepartition(
      coproId,
      (data) => {
        setCles(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [coproId]);

  // Create a new clé
  const createCle = useCallback(
    async (input: CreateCleRepartitionInput): Promise<string> => {
      if (!coproId) throw new Error('Copropriété non sélectionnée');

      if (IS_TEST_MODE) {
        // Check name uniqueness in mock
        const exists = mockStore.clesRepartition.some((c) => c.nom === input.nom);
        if (exists) {
          throw new CleRepartitionError(
            'CLE_NAME_EXISTS',
            'Une clé de répartition avec ce nom existe déjà'
          );
        }

        const newCle: CleRepartition = {
          id: generateTestId(),
          nom: input.nom,
          description: input.description ?? null,
          quoteParts: input.quoteParts,
          isDefault: false,
          createdAt: createMockTimestamp(),
          updatedAt: createMockTimestamp(),
        };
        mockStore.clesRepartition.push(newCle);
        setCles([...mockStore.clesRepartition]);
        return newCle.id;
      }

      return fbCreateCle(coproId, input);
    },
    [coproId]
  );

  // Update an existing clé
  const updateCle = useCallback(
    async (cleId: string, input: UpdateCleRepartitionInput): Promise<void> => {
      if (!coproId) throw new Error('Copropriété non sélectionnée');

      if (IS_TEST_MODE) {
        const index = mockStore.clesRepartition.findIndex((c) => c.id === cleId);
        if (index === -1) {
          throw new CleRepartitionError('CLE_NOT_FOUND', 'Clé de répartition introuvable');
        }

        // Check name uniqueness if changing
        if (input.nom) {
          const exists = mockStore.clesRepartition.some(
            (c) => c.nom === input.nom && c.id !== cleId
          );
          if (exists) {
            throw new CleRepartitionError(
              'CLE_NAME_EXISTS',
              'Une clé de répartition avec ce nom existe déjà'
            );
          }
        }

        const current = mockStore.clesRepartition[index]!;
        mockStore.clesRepartition[index] = {
          ...current,
          ...(input.nom !== undefined && { nom: input.nom }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.quoteParts !== undefined && { quoteParts: input.quoteParts }),
          updatedAt: createMockTimestamp(),
        };
        setCles([...mockStore.clesRepartition]);
        return;
      }

      await fbUpdateCle(coproId, cleId, input);
    },
    [coproId]
  );

  // Delete a clé (with protection)
  const deleteCle = useCallback(
    async (cleId: string): Promise<void> => {
      if (!coproId) throw new Error('Copropriété non sélectionnée');

      if (IS_TEST_MODE) {
        const index = mockStore.clesRepartition.findIndex((c) => c.id === cleId);
        if (index === -1) {
          throw new CleRepartitionError('CLE_NOT_FOUND', 'Clé de répartition introuvable');
        }
        if (mockStore.clesRepartition[index]!.isDefault) {
          throw new CleRepartitionError(
            'CLE_IS_DEFAULT',
            'La clé par défaut ne peut pas être supprimée'
          );
        }
        // Note: In test mode, we don't check for appel usage
        mockStore.clesRepartition.splice(index, 1);
        setCles([...mockStore.clesRepartition]);
        return;
      }

      await fbDeleteCle(coproId, cleId);
    },
    [coproId]
  );

  // Create default clé from lots
  const createDefaultCle = useCallback(
    async (lots: Array<{ id: string; tantiemes: number }>): Promise<string> => {
      if (!coproId) throw new Error('Copropriété non sélectionnée');

      if (IS_TEST_MODE) {
        // Check if default already exists
        const existingDefault = mockStore.clesRepartition.find((c) => c.isDefault);
        if (existingDefault) {
          return existingDefault.id;
        }

        const totalTantiemes = lots.reduce((sum, lot) => sum + lot.tantiemes, 0);
        const quoteParts: QuotePart[] = lots.map((lot) => ({
          lotId: lot.id,
          valeur: totalTantiemes > 0 ? Math.round((lot.tantiemes / totalTantiemes) * 10000) : 0,
        }));

        // Adjust rounding
        const total = quoteParts.reduce((sum, qp) => sum + qp.valeur, 0);
        if (total !== 10000 && quoteParts.length > 0 && quoteParts[0]) {
          quoteParts[0].valeur += 10000 - total;
        }

        const newCle: CleRepartition = {
          id: generateTestId(),
          nom: 'Tantièmes généraux',
          description: 'Clé par défaut basée sur les tantièmes des lots',
          quoteParts,
          isDefault: true,
          createdAt: createMockTimestamp(),
          updatedAt: createMockTimestamp(),
        };
        mockStore.clesRepartition.push(newCle);
        setCles([...mockStore.clesRepartition]);
        return newCle.id;
      }

      return fbCreateDefaultCle(coproId, lots);
    },
    [coproId]
  );

  // Get a clé by ID
  const getCleById = useCallback(
    (cleId: string): CleRepartition | undefined => {
      return cles.find((c) => c.id === cleId);
    },
    [cles]
  );

  // Validate total (re-export for convenience)
  const validateTotal = useCallback(
    (quoteParts: QuotePart[]) => validateQuotePartsTotal(quoteParts),
    []
  );

  // Check if name exists
  const checkNameExists = useCallback(
    async (nom: string, excludeId?: string): Promise<boolean> => {
      if (!coproId) return false;

      if (IS_TEST_MODE) {
        return mockStore.clesRepartition.some(
          (c) => c.nom === nom && c.id !== excludeId
        );
      }

      return checkCleNameExists(coproId, nom, excludeId);
    },
    [coproId]
  );

  // Check if clé is in use
  const checkIsInUse = useCallback(
    async (cleId: string): Promise<boolean> => {
      if (!coproId) return false;

      if (IS_TEST_MODE) {
        // In test mode, check mock appels for cleRepartitionId
        return mockStore.appels.some(
          (a) => 'cleRepartitionId' in a && (a as Record<string, unknown>).cleRepartitionId === cleId
        );
      }

      return isCleInUse(coproId, cleId);
    },
    [coproId]
  );

  return useMemo(
    () => ({
      cles,
      loading,
      error,
      createCle,
      updateCle,
      deleteCle,
      createDefaultCle,
      getCleById,
      validateTotal,
      checkNameExists,
      checkIsInUse,
    }),
    [
      cles,
      loading,
      error,
      createCle,
      updateCle,
      deleteCle,
      createDefaultCle,
      getCleById,
      validateTotal,
      checkNameExists,
      checkIsInUse,
    ]
  );
}
