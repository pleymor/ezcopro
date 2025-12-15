# Zod Schemas Contract

**Date**: 2025-12-15
**Purpose**: Runtime validation et type inference

---

## Schémas de base

### Types primitifs

```typescript
import { z } from 'zod';

// Montant en centimes (entier positif)
export const amountCentsSchema = z.number().int().positive();

// Tantièmes (entier positif)
export const tantiemesSchema = z.number().int().positive();

// Email optionnel
export const optionalEmailSchema = z.string().email().optional().nullable();

// Téléphone français optionnel
export const optionalPhoneSchema = z
  .string()
  .regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Format téléphone invalide')
  .optional()
  .nullable();

// Timestamp Firestore
export const timestampSchema = z.object({
  seconds: z.number(),
  nanoseconds: z.number(),
});

// ID Firestore
export const firestoreIdSchema = z.string().min(1).max(128);
```

---

## Schémas d'entités

### User

```typescript
export const userSchema = z.object({
  id: firestoreIdSchema,
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
  photoURL: z.string().url().nullable(),
  coproprietes: z.array(firestoreIdSchema),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type User = z.infer<typeof userSchema>;
```

### Copropriété

```typescript
export const coproprietéSchema = z.object({
  id: firestoreIdSchema,
  nom: z.string().min(1).max(200),
  adresse: z.string().min(1).max(500),
  members: z.array(firestoreIdSchema).min(1),
  totalTantiemes: z.number().int().nonnegative(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  createdBy: firestoreIdSchema,
});

export type Copropriete = z.infer<typeof coproprietéSchema>;

// Input pour création
export const createCoproprietéInputSchema = z.object({
  nom: z.string().min(1).max(200),
  adresse: z.string().min(1).max(500),
});

export type CreateCoproprietéInput = z.infer<typeof createCoproprietéInputSchema>;

// Input pour mise à jour
export const updateCoproprietéInputSchema = z.object({
  nom: z.string().min(1).max(200).optional(),
  adresse: z.string().min(1).max(500).optional(),
});

export type UpdateCoproprietéInput = z.infer<typeof updateCoproprietéInputSchema>;
```

### Lot

```typescript
export const lotTypeSchema = z.enum([
  'appartement',
  'cave',
  'parking',
  'local_commercial',
  'autre',
]);

export type LotType = z.infer<typeof lotTypeSchema>;

export const lotSchema = z.object({
  id: firestoreIdSchema,
  numero: z.string().min(1).max(20),
  type: lotTypeSchema,
  tantiemes: tantiemesSchema,
  coproprietaireId: firestoreIdSchema,
  description: z.string().max(500).nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type Lot = z.infer<typeof lotSchema>;

// Input pour création
export const createLotInputSchema = z.object({
  numero: z.string().min(1).max(20),
  type: lotTypeSchema,
  tantiemes: tantiemesSchema,
  coproprietaireId: firestoreIdSchema,
  description: z.string().max(500).optional(),
});

export type CreateLotInput = z.infer<typeof createLotInputSchema>;

// Input pour mise à jour
export const updateLotInputSchema = z.object({
  numero: z.string().min(1).max(20).optional(),
  type: lotTypeSchema.optional(),
  tantiemes: tantiemesSchema.optional(),
  coproprietaireId: firestoreIdSchema.optional(),
  description: z.string().max(500).nullable().optional(),
});

export type UpdateLotInput = z.infer<typeof updateLotInputSchema>;
```

### Copropriétaire

```typescript
export const coproprietaireSchema = z.object({
  id: firestoreIdSchema,
  nom: z.string().min(1).max(100),
  prenom: z.string().max(100),
  email: optionalEmailSchema,
  telephone: optionalPhoneSchema,
  userId: firestoreIdSchema.nullable(),
  isAnonymized: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type Coproprietaire = z.infer<typeof coproprietaireSchema>;

// Input pour création
export const createCoproprietaireInputSchema = z.object({
  nom: z.string().min(1).max(100),
  prenom: z.string().max(100).default(''),
  email: optionalEmailSchema,
  telephone: optionalPhoneSchema,
});

export type CreateCoproprietaireInput = z.infer<typeof createCoproprietaireInputSchema>;

// Input pour mise à jour
export const updateCoproprietaireInputSchema = z.object({
  nom: z.string().min(1).max(100).optional(),
  prenom: z.string().max(100).optional(),
  email: optionalEmailSchema,
  telephone: optionalPhoneSchema,
});

export type UpdateCoproprietaireInput = z.infer<typeof updateCoproprietaireInputSchema>;
```

### Appel de fonds

```typescript
export const appelDeFondsSchema = z.object({
  id: firestoreIdSchema,
  libelle: z.string().min(1).max(200),
  montantTotalCents: amountCentsSchema,
  dateEcheance: timestampSchema,
  dateCreation: timestampSchema,
  createdBy: firestoreIdSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type AppelDeFonds = z.infer<typeof appelDeFondsSchema>;

// Input pour création
export const createAppelInputSchema = z.object({
  libelle: z.string().min(1).max(200),
  montantTotalCents: amountCentsSchema,
  dateEcheance: z.date(),
});

export type CreateAppelInput = z.infer<typeof createAppelInputSchema>;
```

### Répartition

```typescript
export const repartitionSchema = z.object({
  id: firestoreIdSchema,
  lotId: firestoreIdSchema,
  coproprietaireId: firestoreIdSchema,
  montantCents: amountCentsSchema,
  tantiemesSnapshot: tantiemesSchema,
  createdAt: timestampSchema,
});

export type Repartition = z.infer<typeof repartitionSchema>;
```

### Paiement

```typescript
export const paiementSchema = z.object({
  id: firestoreIdSchema,
  coproprietaireId: firestoreIdSchema,
  montantCents: amountCentsSchema,
  datePaiement: timestampSchema,
  reference: z.string().max(100).nullable(),
  createdBy: firestoreIdSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type Paiement = z.infer<typeof paiementSchema>;

// Input pour création
export const createPaiementInputSchema = z.object({
  coproprietaireId: firestoreIdSchema,
  montantCents: amountCentsSchema,
  datePaiement: z.date(),
  reference: z.string().max(100).optional(),
});

export type CreatePaiementInput = z.infer<typeof createPaiementInputSchema>;

// Input pour mise à jour
export const updatePaiementInputSchema = z.object({
  montantCents: amountCentsSchema.optional(),
  datePaiement: z.date().optional(),
  reference: z.string().max(100).nullable().optional(),
});

export type UpdatePaiementInput = z.infer<typeof updatePaiementInputSchema>;
```

### Historique

```typescript
export const actionTypeSchema = z.enum(['create', 'update', 'delete']);
export type ActionType = z.infer<typeof actionTypeSchema>;

export const entityTypeSchema = z.enum([
  'lot',
  'coproprietaire',
  'appel',
  'paiement',
  'copropriete',
]);
export type EntityType = z.infer<typeof entityTypeSchema>;

export const historiqueEntrySchema = z.object({
  id: firestoreIdSchema,
  userId: firestoreIdSchema,
  userEmail: z.string().email(),
  action: actionTypeSchema,
  entityType: entityTypeSchema,
  entityId: firestoreIdSchema,
  entityLabel: z.string().max(200),
  before: z.record(z.unknown()).nullable(),
  after: z.record(z.unknown()).nullable(),
  timestamp: timestampSchema,
});

export type HistoriqueEntry = z.infer<typeof historiqueEntrySchema>;
```

### Invitation

```typescript
export const invitationSchema = z.object({
  code: z.string().min(6).max(10),
  coproprietéId: firestoreIdSchema,
  coproprietaireId: firestoreIdSchema,
  createdBy: firestoreIdSchema,
  expiresAt: timestampSchema,
  usedAt: timestampSchema.nullable(),
  usedBy: firestoreIdSchema.nullable(),
  createdAt: timestampSchema,
});

export type Invitation = z.infer<typeof invitationSchema>;
```

---

## Schémas de formulaires

### Formulaire Lot

```typescript
export const lotFormSchema = z.object({
  numero: z.string()
    .min(1, 'Le numéro est requis')
    .max(20, 'Maximum 20 caractères'),
  type: lotTypeSchema,
  tantiemes: z.coerce.number()
    .int('Les tantièmes doivent être un nombre entier')
    .positive('Les tantièmes doivent être positifs'),
  coproprietaireId: firestoreIdSchema
    .min(1, 'Veuillez sélectionner un copropriétaire'),
  description: z.string().max(500).optional(),
});

export type LotFormData = z.infer<typeof lotFormSchema>;
```

### Formulaire Copropriétaire

```typescript
export const coproprietaireFormSchema = z.object({
  nom: z.string()
    .min(1, 'Le nom est requis')
    .max(100, 'Maximum 100 caractères'),
  prenom: z.string()
    .max(100, 'Maximum 100 caractères')
    .default(''),
  email: z.string()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),
  telephone: z.string()
    .regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Format: 0612345678 ou +33612345678')
    .optional()
    .or(z.literal('')),
});

export type CoproprietaireFormData = z.infer<typeof coproprietaireFormSchema>;
```

### Formulaire Appel de fonds

```typescript
export const appelFormSchema = z.object({
  libelle: z.string()
    .min(1, 'Le libellé est requis')
    .max(200, 'Maximum 200 caractères'),
  montantEuros: z.coerce.number()
    .positive('Le montant doit être positif')
    .multipleOf(0.01, 'Maximum 2 décimales'),
  dateEcheance: z.date()
    .min(new Date(), 'La date doit être dans le futur'),
});

export type AppelFormData = z.infer<typeof appelFormSchema>;

// Helper pour convertir en input service
export const appelFormToInput = (form: AppelFormData): CreateAppelInput => ({
  libelle: form.libelle,
  montantTotalCents: Math.round(form.montantEuros * 100),
  dateEcheance: form.dateEcheance,
});
```

### Formulaire Paiement

```typescript
export const paiementFormSchema = z.object({
  coproprietaireId: firestoreIdSchema
    .min(1, 'Veuillez sélectionner un copropriétaire'),
  montantEuros: z.coerce.number()
    .positive('Le montant doit être positif')
    .multipleOf(0.01, 'Maximum 2 décimales'),
  datePaiement: z.date()
    .max(new Date(), 'La date ne peut pas être dans le futur'),
  reference: z.string().max(100).optional(),
});

export type PaiementFormData = z.infer<typeof paiementFormSchema>;

// Helper pour convertir en input service
export const paiementFormToInput = (form: PaiementFormData): CreatePaiementInput => ({
  coproprietaireId: form.coproprietaireId,
  montantCents: Math.round(form.montantEuros * 100),
  datePaiement: form.datePaiement,
  reference: form.reference,
});
```

### Formulaire Copropriété

```typescript
export const coproprietéFormSchema = z.object({
  nom: z.string()
    .min(1, 'Le nom est requis')
    .max(200, 'Maximum 200 caractères'),
  adresse: z.string()
    .min(1, "L'adresse est requise")
    .max(500, 'Maximum 500 caractères'),
});

export type CoproprietéFormData = z.infer<typeof coproprietéFormSchema>;
```

---

## Utilitaires de validation

```typescript
import { ZodError, ZodSchema } from 'zod';

/**
 * Valide des données et retourne le résultat typé ou lance une erreur
 */
export const validate = <T>(schema: ZodSchema<T>, data: unknown): T => {
  return schema.parse(data);
};

/**
 * Valide des données et retourne un résultat avec erreurs formatées
 */
export const safeValidate = <T>(
  schema: ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: formatZodErrors(result.error),
  };
};

/**
 * Formate les erreurs Zod pour affichage dans les formulaires
 */
export const formatZodErrors = (error: ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  return errors;
};
```

---

## Export centralisé

```typescript
// src/lib/schemas/index.ts

// Types primitifs
export * from './primitives';

// Entités
export * from './user';
export * from './copropriete';
export * from './lot';
export * from './coproprietaire';
export * from './appel';
export * from './repartition';
export * from './paiement';
export * from './historique';
export * from './invitation';

// Formulaires
export * from './forms';

// Utilitaires
export * from './utils';
```
