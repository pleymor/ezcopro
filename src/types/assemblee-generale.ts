export type {
  // Enums
  AGStatus,
  AGType,
  MajoriteType,
  PresenceStatus,
  VoteChoix,
  ResolutionResultat,
  // Entities
  AssembleeGenerale,
  Resolution,
  Presence,
  Vote,
  CleRepartition,
  // Input types
  CreateAGInput,
  UpdateAGInput,
  AGFormData,
  CreateResolutionInput,
  UpdateResolutionInput,
  ResolutionFormData,
  UpdatePresenceInput,
  RecordVoteInput,
  UpdateVoteInput,
  // Result types
  AttendanceSummary,
  ResolutionResult,
  // Error types
  AGErrorCode,
} from '@/lib/schemas/assemblee-generale';

export {
  // Labels
  agStatusLabels,
  agTypeLabels,
  majoriteTypeLabels,
  presenceStatusLabels,
  voteChoixLabels,
  resolutionResultatLabels,
  // Schemas (for runtime validation)
  agStatusSchema,
  agTypeSchema,
  majoriteTypeSchema,
  presenceStatusSchema,
  voteChoixSchema,
  resolutionResultatSchema,
  // Form schemas
  agFormSchema,
  resolutionFormSchema,
  // Error class
  AGError,
} from '@/lib/schemas/assemblee-generale';
