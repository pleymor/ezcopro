import { z } from 'zod';
import { firestoreIdSchema, timestampSchema, tantiemesSchema } from './primitives';

// ============================================
// ENUMS
// ============================================

export const agStatusSchema = z.enum(['brouillon', 'convoquee', 'en_cours', 'terminee']);
export type AGStatus = z.infer<typeof agStatusSchema>;

export const agStatusLabels: Record<AGStatus, string> = {
  brouillon: 'Brouillon',
  convoquee: 'Convoquée',
  en_cours: 'En cours',
  terminee: 'Terminée',
};

export const agTypeSchema = z.enum(['ordinaire', 'extraordinaire', 'mixte']);
export type AGType = z.infer<typeof agTypeSchema>;

export const agTypeLabels: Record<AGType, string> = {
  ordinaire: 'Ordinaire',
  extraordinaire: 'Extraordinaire',
  mixte: 'Mixte',
};

export const majoriteTypeSchema = z.enum(['article_24', 'article_25', 'article_26', 'unanimite']);
export type MajoriteType = z.infer<typeof majoriteTypeSchema>;

export const majoriteTypeLabels: Record<MajoriteType, string> = {
  article_24: 'Article 24 (majorité simple)',
  article_25: 'Article 25 (majorité absolue)',
  article_26: 'Article 26 (double majorité)',
  unanimite: 'Unanimité',
};

export const presenceStatusSchema = z.enum(['present', 'represente', 'absent']);
export type PresenceStatus = z.infer<typeof presenceStatusSchema>;

export const presenceStatusLabels: Record<PresenceStatus, string> = {
  present: 'Présent',
  represente: 'Représenté',
  absent: 'Absent',
};

export const voteChoixSchema = z.enum(['pour', 'contre', 'abstention']);
export type VoteChoix = z.infer<typeof voteChoixSchema>;

export const voteChoixLabels: Record<VoteChoix, string> = {
  pour: 'Pour',
  contre: 'Contre',
  abstention: 'Abstention',
};

export const resolutionResultatSchema = z.enum(['adopte', 'rejete', 'non_vote']);
export type ResolutionResultat = z.infer<typeof resolutionResultatSchema>;

export const resolutionResultatLabels: Record<ResolutionResultat, string> = {
  adopte: 'Adoptée',
  rejete: 'Rejetée',
  non_vote: 'Non votée',
};

// ============================================
// ASSEMBLÉE GÉNÉRALE
// ============================================

export const assembleeGeneraleSchema = z.object({
  id: firestoreIdSchema,
  date: timestampSchema,
  heure: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:mm requis'),
  lieu: z.string().min(1, 'Le lieu est requis').max(200, 'Maximum 200 caractères'),
  type: agTypeSchema,
  statut: agStatusSchema,
  dateConvocation: timestampSchema.nullable(),
  totalTantiemes: tantiemesSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type AssembleeGenerale = z.infer<typeof assembleeGeneraleSchema>;

// Input pour création
export const createAGInputSchema = z.object({
  date: z.date(),
  heure: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:mm requis'),
  lieu: z.string().min(1, 'Le lieu est requis').max(200, 'Maximum 200 caractères'),
  type: agTypeSchema,
});

export type CreateAGInput = z.infer<typeof createAGInputSchema>;

// Input pour mise à jour
export const updateAGInputSchema = z.object({
  date: z.date().optional(),
  heure: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:mm requis').optional(),
  lieu: z.string().min(1).max(200).optional(),
  type: agTypeSchema.optional(),
});

export type UpdateAGInput = z.infer<typeof updateAGInputSchema>;

// Formulaire AG
export const agFormSchema = z.object({
  date: z.string().min(1, 'La date est requise'),
  heure: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:mm requis'),
  lieu: z.string().min(1, 'Le lieu est requis').max(200, 'Maximum 200 caractères'),
  type: agTypeSchema,
});

export type AGFormData = z.infer<typeof agFormSchema>;

// ============================================
// RESOLUTION
// ============================================

export const resolutionSchema = z.object({
  id: firestoreIdSchema,
  numero: z.number().int().positive(),
  titre: z.string().min(1, 'Le titre est requis').max(200, 'Maximum 200 caractères'),
  description: z.string().max(2000, 'Maximum 2000 caractères').nullable(),
  typeMajorite: majoriteTypeSchema,
  cleRepartitionId: firestoreIdSchema,
  resultat: resolutionResultatSchema,
  votePour: z.number().int().nonnegative(),
  voteContre: z.number().int().nonnegative(),
  voteAbstention: z.number().int().nonnegative(),
  ordre: z.number().int().nonnegative(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type Resolution = z.infer<typeof resolutionSchema>;

// Input pour création
export const createResolutionInputSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(200, 'Maximum 200 caractères'),
  description: z.string().max(2000).optional(),
  typeMajorite: majoriteTypeSchema,
  cleRepartitionId: firestoreIdSchema.optional(),
});

export type CreateResolutionInput = z.infer<typeof createResolutionInputSchema>;

// Input pour mise à jour
export const updateResolutionInputSchema = z.object({
  titre: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  typeMajorite: majoriteTypeSchema.optional(),
  cleRepartitionId: firestoreIdSchema.optional(),
});

export type UpdateResolutionInput = z.infer<typeof updateResolutionInputSchema>;

// Formulaire résolution
export const resolutionFormSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(200, 'Maximum 200 caractères'),
  description: z.string().max(2000, 'Maximum 2000 caractères').optional(),
  typeMajorite: majoriteTypeSchema,
  cleRepartitionId: z.string().min(1, 'La clé de répartition est requise'),
});

export type ResolutionFormData = z.infer<typeof resolutionFormSchema>;

// ============================================
// PRESENCE
// ============================================

export const presenceSchema = z.object({
  id: firestoreIdSchema,
  coproprietaireId: firestoreIdSchema,
  nom: z.string(),
  prenom: z.string(),
  statut: presenceStatusSchema,
  representeParId: firestoreIdSchema.nullable(),
  tantiemes: tantiemesSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type Presence = z.infer<typeof presenceSchema>;

// Input pour mise à jour
export const updatePresenceInputSchema = z.object({
  statut: presenceStatusSchema.optional(),
  representeParId: firestoreIdSchema.nullable().optional(),
});

export type UpdatePresenceInput = z.infer<typeof updatePresenceInputSchema>;

// Résumé de présence
export const attendanceSummarySchema = z.object({
  totalCoproprietaires: z.number().int().nonnegative(),
  presents: z.number().int().nonnegative(),
  representes: z.number().int().nonnegative(),
  absents: z.number().int().nonnegative(),
  tantiemesPresents: z.number().int().nonnegative(),
  tantiemesRepresentes: z.number().int().nonnegative(),
  tantiemesTotal: z.number().int().nonnegative(),
  pourcentagePresence: z.number().nonnegative(),
});

export type AttendanceSummary = z.infer<typeof attendanceSummarySchema>;

// ============================================
// VOTE
// ============================================

export const voteSchema = z.object({
  id: firestoreIdSchema,
  resolutionId: firestoreIdSchema,
  coproprietaireId: firestoreIdSchema,
  choix: voteChoixSchema,
  tantiemes: tantiemesSchema,
  representantId: firestoreIdSchema.nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type Vote = z.infer<typeof voteSchema>;

// Input pour enregistrer un vote
export const recordVoteInputSchema = z.object({
  coproprietaireId: firestoreIdSchema,
  choix: voteChoixSchema,
});

export type RecordVoteInput = z.infer<typeof recordVoteInputSchema>;

// Input pour mise à jour
export const updateVoteInputSchema = z.object({
  choix: voteChoixSchema,
});

export type UpdateVoteInput = z.infer<typeof updateVoteInputSchema>;

// Résultat d'une résolution
export const resolutionResultSchema = z.object({
  resultat: z.enum(['adopte', 'rejete']),
  votePour: z.number().int().nonnegative(),
  voteContre: z.number().int().nonnegative(),
  voteAbstention: z.number().int().nonnegative(),
  canSecondVote: z.boolean(),
});

export type ResolutionResult = z.infer<typeof resolutionResultSchema>;

// ============================================
// CLÉ DE RÉPARTITION
// ============================================

export const cleRepartitionSchema = z.object({
  id: firestoreIdSchema,
  nom: z.string().min(1).max(100),
  description: z.string().max(500),
});

export type CleRepartition = z.infer<typeof cleRepartitionSchema>;

// ============================================
// ERRORS
// ============================================

export const agErrorCodeSchema = z.enum([
  'AG_NOT_FOUND',
  'AG_INVALID_STATUS_TRANSITION',
  'AG_CANNOT_MODIFY_NON_BROUILLON',
  'RESOLUTION_NOT_FOUND',
  'PRESENCE_NOT_FOUND',
  'VOTE_INVALID_COPROPRIETAIRE',
  'REPRESENTATION_LIMIT_EXCEEDED',
  'CANNOT_REPRESENT_ABSENT',
]);

export type AGErrorCode = z.infer<typeof agErrorCodeSchema>;

export class AGError extends Error {
  constructor(
    public code: AGErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'AGError';
  }
}
