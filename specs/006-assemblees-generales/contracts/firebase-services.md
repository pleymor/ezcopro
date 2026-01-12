# API Contracts: Firebase Services

This document defines the service layer contracts for the Assemblées Générales feature.

## AssembleeGenerale Service

### Functions

```typescript
// ============================================
// ASSEMBLÉE GÉNÉRALE CRUD
// ============================================

/**
 * Get all AGs for a copropriété
 */
async function getAssembleesGenerales(
  coproId: string
): Promise<AssembleeGenerale[]>;

/**
 * Subscribe to AGs in real-time
 */
function subscribeToAssembleesGenerales(
  coproId: string,
  callback: (ags: AssembleeGenerale[]) => void
): Unsubscribe;

/**
 * Get a single AG by ID
 */
async function getAssembleeGenerale(
  coproId: string,
  agId: string
): Promise<AssembleeGenerale | null>;

/**
 * Create a new AG
 */
async function createAssembleeGenerale(
  coproId: string,
  userId: string,
  input: CreateAGInput
): Promise<AssembleeGenerale>;

/**
 * Update an AG (only in brouillon status)
 */
async function updateAssembleeGenerale(
  coproId: string,
  agId: string,
  userId: string,
  input: UpdateAGInput
): Promise<void>;

/**
 * Delete an AG (only in brouillon status)
 */
async function deleteAssembleeGenerale(
  coproId: string,
  agId: string,
  userId: string
): Promise<void>;

/**
 * Transition AG status
 */
async function transitionAGStatus(
  coproId: string,
  agId: string,
  userId: string,
  newStatus: AGStatus
): Promise<void>;

// ============================================
// RESOLUTION CRUD
// ============================================

/**
 * Get all resolutions for an AG
 */
async function getResolutions(
  coproId: string,
  agId: string
): Promise<Resolution[]>;

/**
 * Subscribe to resolutions in real-time
 */
function subscribeToResolutions(
  coproId: string,
  agId: string,
  callback: (resolutions: Resolution[]) => void
): Unsubscribe;

/**
 * Create a new resolution
 */
async function createResolution(
  coproId: string,
  agId: string,
  userId: string,
  input: CreateResolutionInput
): Promise<Resolution>;

/**
 * Update a resolution
 */
async function updateResolution(
  coproId: string,
  agId: string,
  resolutionId: string,
  userId: string,
  input: UpdateResolutionInput
): Promise<void>;

/**
 * Delete a resolution
 */
async function deleteResolution(
  coproId: string,
  agId: string,
  resolutionId: string,
  userId: string
): Promise<void>;

/**
 * Reorder resolutions
 */
async function reorderResolutions(
  coproId: string,
  agId: string,
  userId: string,
  orderedIds: string[]
): Promise<void>;

// ============================================
// PRESENCE CRUD
// ============================================

/**
 * Get all presences for an AG
 */
async function getPresences(
  coproId: string,
  agId: string
): Promise<Presence[]>;

/**
 * Subscribe to presences in real-time
 */
function subscribeToPresences(
  coproId: string,
  agId: string,
  callback: (presences: Presence[]) => void
): Unsubscribe;

/**
 * Initialize presences from current copropriétaires
 * Called when AG is created or when attendance sheet is first accessed
 */
async function initializePresences(
  coproId: string,
  agId: string,
  userId: string
): Promise<void>;

/**
 * Update a presence status
 */
async function updatePresence(
  coproId: string,
  agId: string,
  presenceId: string,
  userId: string,
  input: UpdatePresenceInput
): Promise<void>;

/**
 * Get attendance summary
 */
async function getAttendanceSummary(
  coproId: string,
  agId: string
): Promise<AttendanceSummary>;

// ============================================
// VOTE CRUD
// ============================================

/**
 * Get all votes for a resolution
 */
async function getVotes(
  coproId: string,
  agId: string,
  resolutionId: string
): Promise<Vote[]>;

/**
 * Subscribe to votes in real-time
 */
function subscribeToVotes(
  coproId: string,
  agId: string,
  resolutionId: string,
  callback: (votes: Vote[]) => void
): Unsubscribe;

/**
 * Record a vote
 */
async function recordVote(
  coproId: string,
  agId: string,
  resolutionId: string,
  userId: string,
  input: RecordVoteInput
): Promise<Vote>;

/**
 * Update a vote
 */
async function updateVote(
  coproId: string,
  agId: string,
  resolutionId: string,
  voteId: string,
  userId: string,
  input: UpdateVoteInput
): Promise<void>;

/**
 * Finalize voting on a resolution (calculate result)
 */
async function finalizeResolutionVote(
  coproId: string,
  agId: string,
  resolutionId: string,
  userId: string
): Promise<ResolutionResult>;

// ============================================
// CLÉS DE RÉPARTITION (Read-only)
// ============================================

/**
 * Get all clés de répartition
 */
async function getClesRepartition(
  coproId: string
): Promise<CleRepartition[]>;
```

## Input/Output Types

```typescript
// ============================================
// AG Types
// ============================================

interface CreateAGInput {
  date: Date;
  heure: string;          // HH:mm
  lieu: string;
  type: 'ordinaire' | 'extraordinaire';
}

interface UpdateAGInput {
  date?: Date;
  heure?: string;
  lieu?: string;
  type?: 'ordinaire' | 'extraordinaire';
}

type AGStatus = 'brouillon' | 'convoquee' | 'en_cours' | 'terminee';

// ============================================
// Resolution Types
// ============================================

interface CreateResolutionInput {
  titre: string;
  description?: string;
  typeMajorite: MajoriteType;
  cleRepartitionId?: string;  // Defaults to 'tantiemes_generaux'
}

interface UpdateResolutionInput {
  titre?: string;
  description?: string;
  typeMajorite?: MajoriteType;
  cleRepartitionId?: string;
}

type MajoriteType = 'article_24' | 'article_25' | 'article_26' | 'unanimite';

interface ResolutionResult {
  resultat: 'adopte' | 'rejete';
  votePour: number;
  voteContre: number;
  voteAbstention: number;
  canSecondVote: boolean;  // True if Art.25 failed but got 1/3
}

// ============================================
// Presence Types
// ============================================

interface UpdatePresenceInput {
  statut: 'present' | 'represente' | 'absent';
  representeParId?: string | null;
}

interface AttendanceSummary {
  totalCoproprietaires: number;
  presents: number;
  representes: number;
  absents: number;
  tantiemesPresents: number;
  tantiemesRepresentes: number;
  tantiemesTotal: number;
  pourcentagePresence: number;
}

// ============================================
// Vote Types
// ============================================

interface RecordVoteInput {
  coproprietaireId: string;
  choix: 'pour' | 'contre' | 'abstention';
}

interface UpdateVoteInput {
  choix: 'pour' | 'contre' | 'abstention';
}
```

## Error Handling

All services throw typed errors:

```typescript
class AGError extends Error {
  constructor(
    public code: AGErrorCode,
    message: string
  ) {
    super(message);
  }
}

type AGErrorCode =
  | 'AG_NOT_FOUND'
  | 'AG_INVALID_STATUS_TRANSITION'
  | 'AG_CANNOT_MODIFY_NON_BROUILLON'
  | 'RESOLUTION_NOT_FOUND'
  | 'PRESENCE_NOT_FOUND'
  | 'VOTE_INVALID_COPROPRIÉTAIRE'
  | 'REPRESENTATION_LIMIT_EXCEEDED'
  | 'CANNOT_REPRESENT_ABSENT';
```

## Hooks

```typescript
// ============================================
// CUSTOM HOOKS
// ============================================

/**
 * Hook for AG data with real-time updates
 */
function useAssembleeGenerale(coproId: string, agId: string): {
  ag: AssembleeGenerale | null;
  loading: boolean;
  error: Error | null;
};

/**
 * Hook for AG list with real-time updates
 */
function useAssembleesGenerales(coproId: string): {
  ags: AssembleeGenerale[];
  loading: boolean;
  error: Error | null;
};

/**
 * Hook for resolutions with real-time updates
 */
function useResolutions(coproId: string, agId: string): {
  resolutions: Resolution[];
  loading: boolean;
  error: Error | null;
};

/**
 * Hook for presences with attendance summary
 */
function usePresences(coproId: string, agId: string): {
  presences: Presence[];
  summary: AttendanceSummary | null;
  loading: boolean;
  error: Error | null;
};

/**
 * Hook for votes on a resolution
 */
function useVotes(coproId: string, agId: string, resolutionId: string): {
  votes: Vote[];
  loading: boolean;
  error: Error | null;
};

/**
 * Hook for clés de répartition
 */
function useClesRepartition(coproId: string): {
  cles: CleRepartition[];
  loading: boolean;
  error: Error | null;
};
```
