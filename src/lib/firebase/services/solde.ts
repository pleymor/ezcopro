import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config';
import type { Repartition } from '@/types/repartition';
import type { Paiement } from '@/types/paiement';
import type { Coproprietaire } from '@/types/coproprietaire';
import type { Lot } from '@/types/lot';

export interface SoldeCoproprietaire {
  coproprietaireId: string;
  coproprietaire: Coproprietaire;
  lots: Lot[];
  totalDuCents: number;
  totalPayeCents: number;
  soldeCents: number; // positif = débiteur (doit de l'argent), négatif = créditeur
}

export interface SoldeGlobal {
  totalAppeleCents: number;
  totalPayeCents: number;
  soldeCents: number;
}

/**
 * Récupère toutes les répartitions pour tous les appels d'une copropriété
 */
async function getAllRepartitions(coproId: string): Promise<Repartition[]> {
  // Récupérer tous les appels
  const appelsSnapshot = await getDocs(collection(db, 'coproprietes', coproId, 'appels'));

  // Pour chaque appel, récupérer ses répartitions
  const allRepartitions: Repartition[] = [];

  for (const appelDoc of appelsSnapshot.docs) {
    const repartitionsSnapshot = await getDocs(
      collection(db, 'coproprietes', coproId, 'appels', appelDoc.id, 'repartitions')
    );

    repartitionsSnapshot.docs.forEach((doc) => {
      allRepartitions.push({ id: doc.id, ...doc.data() } as Repartition);
    });
  }

  return allRepartitions;
}

/**
 * Calcule le solde pour chaque copropriétaire
 */
export async function calculateSoldesByCoproprietaire(
  coproId: string,
  coproprietaires: Coproprietaire[],
  lots: Lot[],
  paiements: Paiement[]
): Promise<SoldeCoproprietaire[]> {
  // Récupérer toutes les répartitions
  const allRepartitions = await getAllRepartitions(coproId);

  // Filtrer les copropriétaires non anonymisés
  const activeCoproprietaires = coproprietaires.filter((c) => !c.isAnonymized);

  // Calculer le solde pour chaque copropriétaire
  const soldes: SoldeCoproprietaire[] = activeCoproprietaires.map((copro) => {
    // Trouver les lots de ce copropriétaire
    const coproLots = lots.filter((l) => l.coproprietaireId === copro.id);

    // Calculer le total dû (somme des répartitions)
    const totalDuCents = allRepartitions
      .filter((r) => r.coproprietaireId === copro.id)
      .reduce((sum, r) => sum + r.montantCents, 0);

    // Calculer le total payé
    const totalPayeCents = paiements
      .filter((p) => p.coproprietaireId === copro.id)
      .reduce((sum, p) => sum + p.montantCents, 0);

    // Solde = dû - payé (positif = doit de l'argent)
    const soldeCents = totalDuCents - totalPayeCents;

    return {
      coproprietaireId: copro.id,
      coproprietaire: copro,
      lots: coproLots,
      totalDuCents,
      totalPayeCents,
      soldeCents,
    };
  });

  // Trier par solde décroissant (les plus débiteurs en premier)
  return soldes.sort((a, b) => b.soldeCents - a.soldeCents);
}

/**
 * Calcule le solde global de la copropriété
 */
export function calculateSoldeGlobal(
  soldesCoproprietaires: SoldeCoproprietaire[]
): SoldeGlobal {
  const totalAppeleCents = soldesCoproprietaires.reduce((sum, s) => sum + s.totalDuCents, 0);
  const totalPayeCents = soldesCoproprietaires.reduce((sum, s) => sum + s.totalPayeCents, 0);
  const soldeCents = totalAppeleCents - totalPayeCents;

  return {
    totalAppeleCents,
    totalPayeCents,
    soldeCents,
  };
}

/**
 * Filtre les soldes par état
 */
export type SoldeFilter = 'all' | 'aJour' | 'enRetard';

export function filterSoldes(
  soldes: SoldeCoproprietaire[],
  filter: SoldeFilter
): SoldeCoproprietaire[] {
  switch (filter) {
    case 'aJour':
      return soldes.filter((s) => s.soldeCents <= 0);
    case 'enRetard':
      return soldes.filter((s) => s.soldeCents > 0);
    default:
      return soldes;
  }
}

/**
 * Récupère le détail des appels et paiements pour un copropriétaire
 */
export interface DetailAppel {
  appelId: string;
  libelle: string;
  dateEcheance: { seconds: number; nanoseconds: number };
  montantCents: number;
  lotId: string;
  lotNumero: string;
}

export interface DetailPaiement {
  paiementId: string;
  datePaiement: { seconds: number; nanoseconds: number };
  montantCents: number;
  reference: string | null;
}

export interface DetailSolde {
  appels: DetailAppel[];
  paiements: DetailPaiement[];
  totalDuCents: number;
  totalPayeCents: number;
  soldeCents: number;
}

export async function getDetailSoldeCoproprietaire(
  coproId: string,
  coproprietaireId: string,
  lots: Lot[],
  paiements: Paiement[]
): Promise<DetailSolde> {
  // Récupérer tous les appels avec leurs répartitions
  const appelsSnapshot = await getDocs(
    query(
      collection(db, 'coproprietes', coproId, 'appels'),
      orderBy('dateEcheance', 'desc')
    )
  );

  const detailAppels: DetailAppel[] = [];

  for (const appelDoc of appelsSnapshot.docs) {
    const appelData = appelDoc.data();

    // Récupérer les répartitions de cet appel pour ce copropriétaire
    const repartitionsSnapshot = await getDocs(
      query(
        collection(db, 'coproprietes', coproId, 'appels', appelDoc.id, 'repartitions'),
        where('coproprietaireId', '==', coproprietaireId)
      )
    );

    for (const repDoc of repartitionsSnapshot.docs) {
      const repData = repDoc.data();
      const lot = lots.find((l) => l.id === repData.lotId);

      detailAppels.push({
        appelId: appelDoc.id,
        libelle: appelData.libelle,
        dateEcheance: appelData.dateEcheance,
        montantCents: repData.montantCents,
        lotId: repData.lotId,
        lotNumero: lot?.numero || 'N/A',
      });
    }
  }

  // Filtrer les paiements de ce copropriétaire
  const coproPaiements = paiements
    .filter((p) => p.coproprietaireId === coproprietaireId)
    .map((p) => ({
      paiementId: p.id,
      datePaiement: p.datePaiement,
      montantCents: p.montantCents,
      reference: p.reference,
    }));

  // Calculer les totaux
  const totalDuCents = detailAppels.reduce((sum, a) => sum + a.montantCents, 0);
  const totalPayeCents = coproPaiements.reduce((sum, p) => sum + p.montantCents, 0);

  return {
    appels: detailAppels,
    paiements: coproPaiements,
    totalDuCents,
    totalPayeCents,
    soldeCents: totalDuCents - totalPayeCents,
  };
}
