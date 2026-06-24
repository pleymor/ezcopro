import { z } from 'zod';
import { firestoreIdSchema, timestampSchema } from './primitives';

/**
 * Profondeur maximale des dossiers
 *
 * - 0 = dossier racine
 * - 1 = sous-dossier niveau 1
 * - 2 = sous-dossier niveau 2 (maximum)
 *
 * Total : 3 niveaux de profondeur possibles
 */
export const MAX_FOLDER_DEPTH = 2;

/**
 * Niveaux d'accès pour les dossiers et documents
 *
 * ## Hiérarchie des accès
 *
 * | Niveau    | Syndic | Conseil Syndical | Copropriétaire |
 * |-----------|--------|------------------|----------------|
 * | `syndic`  | ✅     | ❌               | ❌             |
 * | `conseil` | ✅     | ✅               | ❌             |
 * | `tous`    | ✅     | ✅               | ✅             |
 *
 * ## Cas limites
 *
 * - **Valeur undefined** : Traité comme `tous` (fallback permissif)
 * - **Héritage** : Les sous-dossiers héritent du niveau du parent par défaut
 * - **Documents** : Héritent du niveau du dossier lors de l'upload
 *
 * @see specs/010-ged-dossiers/ACCESS-CONTROL.md pour la documentation complète
 */
export const niveauAccesSchema = z.enum(['syndic', 'conseil', 'tous']);

export type NiveauAcces = z.infer<typeof niveauAccesSchema>;

/**
 * Labels des niveaux d'accès pour l'affichage UI
 */
export const NIVEAU_ACCES_LABELS: Record<NiveauAcces, string> = {
  syndic: 'Syndic seul',
  conseil: 'Conseil syndical',
  tous: 'Tous les copropriétaires',
};

/**
 * Descriptions détaillées des niveaux d'accès
 */
export const NIVEAU_ACCES_DESCRIPTIONS: Record<NiveauAcces, string> = {
  syndic: 'Visible uniquement par le syndic',
  conseil: 'Visible par le conseil syndical et le syndic',
  tous: 'Visible par tous les copropriétaires',
};

// Regex pour le nom de dossier (lettres, chiffres, espaces, tirets, underscores, accents)
const nomDossierRegex = /^[\w\s\-àâäéèêëïîôùûüçÀÂÄÉÈÊËÏÎÔÙÛÜÇ]+$/i;

// Schema complet d'un dossier
export const dossierSchema = z.object({
  id: firestoreIdSchema,
  nom: z
    .string()
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères')
    .regex(nomDossierRegex, 'Le nom contient des caractères non autorisés'),
  parentId: z.string().nullable(),
  path: z.string().min(1),
  depth: z.number().int().min(0).max(MAX_FOLDER_DEPTH),
  niveauAcces: niveauAccesSchema,
  coproprieteId: firestoreIdSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  createdBy: firestoreIdSchema,
});

export type Dossier = z.infer<typeof dossierSchema>;

// Input pour la création d'un dossier
export const createDossierInputSchema = z.object({
  nom: z
    .string()
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères')
    .regex(nomDossierRegex, 'Le nom contient des caractères non autorisés')
    .transform((val) => val.trim()),
  parentId: z.string().nullable().default(null),
  niveauAcces: niveauAccesSchema,
});

export type CreateDossierInput = z.infer<typeof createDossierInputSchema>;

// Input pour la mise à jour d'un dossier
export const updateDossierInputSchema = z.object({
  nom: z
    .string()
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères')
    .regex(nomDossierRegex, 'Le nom contient des caractères non autorisés')
    .transform((val) => val.trim())
    .optional(),
  niveauAcces: niveauAccesSchema.optional(),
});

export type UpdateDossierInput = z.infer<typeof updateDossierInputSchema>;
