/**
 * Helper functions to generate condo-scoped URLs.
 * All dashboard routes should use these helpers.
 */

/**
 * Generate a condo-scoped path.
 * @param condoId - The condo ID
 * @param path - Optional path suffix (should start with '/')
 * @returns The full path, e.g., '/copro/abc123/lots'
 */
export function condoPath(condoId: string, path: string = ''): string {
  return `/copro/${condoId}${path}`;
}

/**
 * Navigation paths for a condo.
 */
export const condoPaths = {
  dashboard: (condoId: string) => condoPath(condoId),
  lots: (condoId: string) => condoPath(condoId, '/lots'),
  lotsNew: (condoId: string) => condoPath(condoId, '/lots/new'),
  lotEdit: (condoId: string, lotId: string) => condoPath(condoId, `/lots/${lotId}/edit`),
  cleRepartition: (condoId: string) => condoPath(condoId, '/lots/cles-repartition'),
  coproprietaires: (condoId: string) => condoPath(condoId, '/coproprietaires'),
  coproprietairesNew: (condoId: string) => condoPath(condoId, '/coproprietaires/new'),
  coproprietaireEdit: (condoId: string, ownerId: string) => condoPath(condoId, `/coproprietaires/${ownerId}/edit`),
  finances: (condoId: string) => condoPath(condoId, '/finances'),
  appels: (condoId: string) => condoPath(condoId, '/finances/appels'),
  appelNew: (condoId: string) => condoPath(condoId, '/finances/appels/new'),
  appelDetail: (condoId: string, appelId: string) => condoPath(condoId, `/finances/appels/${appelId}`),
  appelEdit: (condoId: string, appelId: string) => condoPath(condoId, `/finances/appels/${appelId}/edit`),
  paiements: (condoId: string) => condoPath(condoId, '/finances/paiements'),
  paiementNew: (condoId: string) => condoPath(condoId, '/finances/paiements/new'),
  paiementEdit: (condoId: string, paiementId: string) => condoPath(condoId, `/finances/paiements/${paiementId}/edit`),
  soldes: (condoId: string) => condoPath(condoId, '/soldes'),
  soldeDetail: (condoId: string, ownerId: string) => condoPath(condoId, `/soldes/${ownerId}`),
  documents: (condoId: string) => condoPath(condoId, '/documents'),
  assembleesGenerales: (condoId: string) => condoPath(condoId, '/assemblees-generales'),
  agNew: (condoId: string) => condoPath(condoId, '/assemblees-generales/nouvelle'),
  agDetail: (condoId: string, agId: string) => condoPath(condoId, `/assemblees-generales/${agId}`),
  agEdit: (condoId: string, agId: string) => condoPath(condoId, `/assemblees-generales/${agId}/edit`),
  agOrdreDuJour: (condoId: string, agId: string) => condoPath(condoId, `/assemblees-generales/${agId}/ordre-du-jour`),
  agResolutions: (condoId: string, agId: string) => condoPath(condoId, `/assemblees-generales/${agId}/resolutions`),
  agVotes: (condoId: string, agId: string) => condoPath(condoId, `/assemblees-generales/${agId}/votes`),
  agVote: (condoId: string, agId: string, resolutionId: string) => condoPath(condoId, `/assemblees-generales/${agId}/votes/${resolutionId}`),
  agPresence: (condoId: string, agId: string) => condoPath(condoId, `/assemblees-generales/${agId}/presence`),
  agConvocation: (condoId: string, agId: string) => condoPath(condoId, `/assemblees-generales/${agId}/convocation`),
  agProcesVerbal: (condoId: string, agId: string) => condoPath(condoId, `/assemblees-generales/${agId}/proces-verbal`),
  historique: (condoId: string) => condoPath(condoId, '/historique'),
  parametres: (condoId: string) => condoPath(condoId, '/parametres'),
  equipe: (condoId: string) => condoPath(condoId, '/parametres/equipe'),
  rolesAcces: (condoId: string) => condoPath(condoId, '/parametres/roles-et-acces'),
  cleRepartitionNew: (condoId: string) => condoPath(condoId, '/lots/cles-repartition/nouvelle'),
  cleRepartitionDetail: (condoId: string, cleId: string) => condoPath(condoId, `/lots/cles-repartition/${cleId}`),
  cleRepartitionEdit: (condoId: string, cleId: string) => condoPath(condoId, `/lots/cles-repartition/${cleId}/edit`),
} as const;
