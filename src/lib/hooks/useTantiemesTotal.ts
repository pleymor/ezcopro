import { useEffect, useState } from 'react';
import { subscribeToLots } from '@/lib/firebase/services/lot';
import { useCopropriete } from './useCopropriete';

interface UseTantiemesTotalResult {
  totalTantiemes: number;
  loading: boolean;
}

export function useTantiemesTotal(): UseTantiemesTotalResult {
  const { selectedCopro } = useCopropriete();
  const [totalTantiemes, setTotalTantiemes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCopro) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToLots(selectedCopro.id, (lots) => {
      const total = lots.reduce((sum, lot) => sum + lot.tantiemes, 0);
      setTotalTantiemes(total);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedCopro]);

  return { totalTantiemes, loading };
}
