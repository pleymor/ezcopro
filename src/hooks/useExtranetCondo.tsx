'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  getAllAcceptedInvitationsForUser,
  type AcceptedInvitation,
} from '@/lib/firebase/services/invitation-extranet';

const STORAGE_KEY = 'ezcopro_extranet_selected_condo';

export interface ExtranetCondoInfo {
  /** ID de la copropriété */
  coproprieteId: string;
  /** Nom de la copropriété */
  coproprieteName: string;
  /** ID du copropriétaire dans cette copropriété */
  coproprietaireId: string;
  /** Email utilisé pour l'invitation */
  email: string;
  /** Le copropriétaire est-il membre du conseil syndical ? */
  isBoardMember: boolean;
}

interface ExtranetCondoContextType {
  /** Liste des copropriétés accessibles via extranet */
  condos: ExtranetCondoInfo[];
  /** Copropriété actuellement sélectionnée */
  selectedCondo: ExtranetCondoInfo | null;
  /** Sélectionner une copropriété */
  setSelectedCondo: (condo: ExtranetCondoInfo | null) => void;
  /** Sélectionner par ID */
  selectCondoById: (coproprieteId: string) => void;
  /** Chargement en cours */
  loading: boolean;
  /** Erreur éventuelle */
  error: Error | null;
  /** L'utilisateur a-t-il accès à plusieurs copropriétés ? */
  hasMultipleCondos: boolean;
}

const ExtranetCondoContext = createContext<ExtranetCondoContextType | undefined>(undefined);

interface ExtranetCondoProviderProps {
  children: ReactNode;
}

export function ExtranetCondoProvider({ children }: ExtranetCondoProviderProps) {
  const { user } = useAuth();
  const [condos, setCondos] = useState<ExtranetCondoInfo[]>([]);
  const [selectedCondo, setSelectedCondoState] = useState<ExtranetCondoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Charger les invitations acceptées et les infos des copropriétés
  useEffect(() => {
    if (!user) {
      setCondos([]);
      setSelectedCondoState(null);
      setLoading(false);
      setIsInitialized(true);
      return;
    }

    const loadCondos = async () => {
      setLoading(true);
      setError(null);

      try {
        // Récupérer toutes les invitations acceptées
        const invitations = await getAllAcceptedInvitationsForUser(user.uid);

        if (invitations.length === 0) {
          setCondos([]);
          setSelectedCondoState(null);
          setLoading(false);
          setIsInitialized(true);
          return;
        }

        // Récupérer les noms des copropriétés et les infos du copropriétaire
        const condoInfos: ExtranetCondoInfo[] = await Promise.all(
          invitations.map(async (inv: AcceptedInvitation) => {
            let coproprieteName = 'Copropriété';
            let isBoardMember = false;

            try {
              // Try new schema first (condos collection)
              const condoDoc = await getDoc(doc(db, 'condos', inv.coproprieteId));
              if (condoDoc.exists()) {
                coproprieteName = condoDoc.data().name || 'Copropriété';
              } else {
                // Fallback to old schema (coproprietes collection)
                const oldCondoDoc = await getDoc(doc(db, 'coproprietes', inv.coproprieteId));
                if (oldCondoDoc.exists()) {
                  coproprieteName = oldCondoDoc.data().nom || 'Copropriété';
                }
              }

              // Fetch owner document to check board member status
              const ownerDoc = await getDoc(
                doc(db, 'condos', inv.coproprieteId, 'owners', inv.coproprietaireId)
              );
              if (ownerDoc.exists()) {
                isBoardMember = ownerDoc.data().isBoardMember === true;
              }
            } catch (e) {
              console.error('Erreur lors de la récupération des infos copropriété:', e);
            }

            return {
              coproprieteId: inv.coproprieteId,
              coproprieteName,
              coproprietaireId: inv.coproprietaireId,
              email: inv.email,
              isBoardMember,
            };
          })
        );

        setCondos(condoInfos);

        // Restaurer la sélection depuis localStorage ou sélectionner la première
        const storedId = localStorage.getItem(STORAGE_KEY);
        const storedCondo = storedId ? condoInfos.find((c) => c.coproprieteId === storedId) : null;

        if (storedCondo) {
          setSelectedCondoState(storedCondo);
        } else if (condoInfos.length > 0 && condoInfos[0]) {
          setSelectedCondoState(condoInfos[0]);
        }

        setLoading(false);
        setIsInitialized(true);
      } catch (e) {
        console.error('Erreur lors du chargement des copropriétés extranet:', e);
        setError(e instanceof Error ? e : new Error('Erreur inconnue'));
        setLoading(false);
        setIsInitialized(true);
      }
    };

    loadCondos();
  }, [user]);

  // Sélectionner une copropriété et persister
  const setSelectedCondo = useCallback((condo: ExtranetCondoInfo | null) => {
    setSelectedCondoState(condo);
    if (condo) {
      localStorage.setItem(STORAGE_KEY, condo.coproprieteId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Sélectionner par ID
  const selectCondoById = useCallback((coproprieteId: string) => {
    const condo = condos.find((c) => c.coproprieteId === coproprieteId);
    if (condo) {
      setSelectedCondo(condo);
    }
  }, [condos, setSelectedCondo]);

  const hasMultipleCondos = condos.length > 1;

  const value = useMemo(
    () => ({
      condos,
      selectedCondo,
      setSelectedCondo,
      selectCondoById,
      loading,
      error,
      hasMultipleCondos,
    }),
    [condos, selectedCondo, setSelectedCondo, selectCondoById, loading, error, hasMultipleCondos]
  );

  // Ne pas rendre tant que non initialisé pour éviter un flash
  if (!isInitialized) {
    return null;
  }

  return (
    <ExtranetCondoContext.Provider value={value}>
      {children}
    </ExtranetCondoContext.Provider>
  );
}

export function useExtranetCondo(): ExtranetCondoContextType {
  const context = useContext(ExtranetCondoContext);
  if (context === undefined) {
    throw new Error('useExtranetCondo must be used within an ExtranetCondoProvider');
  }
  return context;
}
