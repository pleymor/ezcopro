# Research: Gestion des clés de répartition

**Date**: 2026-01-12
**Feature**: 007-cles-repartition

## Research Tasks

### 1. Data Model Design for Quotes-Parts

**Question**: How to store quotes-parts efficiently - embedded in CleRepartition or separate collection?

**Decision**: Embedded array in CleRepartition document

**Rationale**:
- Small data size: typical copropriété has 3-30 lots, so quotes-parts array will have 3-30 entries
- Always read together with the key
- Simpler queries and atomic updates
- No need for subcollection queries

**Alternatives Considered**:
- Separate `quoteParts` subcollection: Rejected - unnecessary complexity for small datasets
- Separate `quoteParts` collection with foreign key: Rejected - requires joins, no benefit

### 2. Millièmes Precision and Storage

**Question**: How to store and calculate millièmes values?

**Decision**: Store as integers (0-10000), calculate percentages on display

**Rationale**:
- Avoid floating-point precision issues
- Matches French property law standard (millièmes = parts per 10000)
- Integer math is deterministic
- Constitution principle VI requires decimal types for financial calculations

**Alternatives Considered**:
- Store as decimals (0.0000 to 1.0000): Rejected - floating-point precision issues
- Store as basis points (0-10000): Same as millièmes, this is what we chose

### 3. Default Key Auto-Creation Trigger

**Question**: When and how to create the default "Tantièmes généraux" key?

**Decision**: Create on first access to clés de répartition section if none exist

**Rationale**:
- Lazy initialization avoids creating unused data
- Uses existing lot tantièmes as source
- User sees immediate value on first visit
- Specified in clarification session

**Implementation**:
- Check in `useClesRepartition` hook or page component
- If `cles.length === 0` and `lots.length > 0`, trigger creation
- Map lot tantièmes to quotes-parts, normalizing to base 10000 if needed

### 4. Navigation Pattern for Submenu

**Question**: How to implement "Clés de répartition" as submenu of "Lots"?

**Decision**: Add expandable submenu in Navigation component

**Rationale**:
- Specified in clarification: "Sous-menu de Lots"
- Keeps main navigation clean
- Logical grouping (lots and their distribution keys)

**Implementation**:
- Add `subItems` property to nav item type
- Render nested links when parent is active or expanded
- Route: `/lots/cles-repartition`

### 5. Deletion Protection Check

**Question**: How to check if a key is used in fund calls (appels de fonds)?

**Decision**: Query appels collection for references to cleRepartitionId

**Rationale**:
- Simple existence check before deletion
- Follows existing pattern for referential integrity
- Clear error message if blocked

**Implementation**:
- Before delete: `query(appelsRef, where('cleRepartitionId', '==', keyId), limit(1))`
- If result exists, throw error with message
- Note: This requires checking existing appel schema for cleRepartitionId field

### 6. Form Pattern for Quotes-Parts Input

**Question**: Best UX pattern for entering quotes-parts for all lots?

**Decision**: Single form with all lots displayed in a table/grid

**Rationale**:
- Specified in clarification: "Formulaire avec tous les lots affichés"
- Allows quick data entry
- Shows running total in real-time
- Visual feedback for 10000 millièmes target

**Implementation**:
- QuotesPartsEditor component
- Table with columns: Lot numero, Type, Owner name, Quote-part input
- Footer row showing total and deviation from 10000
- Warning alert if total ≠ 10000 (not blocking)

### 7. Existing Code Integration

**Question**: What existing code can be reused?

**Findings**:
- `src/hooks/useClesRepartition.ts`: Exists but only returns mock data, needs full implementation
- `src/lib/schemas/assemblee-generale.ts`: Contains minimal `cleRepartitionSchema` (id, nom, description)
- `src/lib/test/mock-data.ts`: Contains mock clesRepartition array
- `src/types/assemblee-generale.ts`: Re-exports CleRepartition type

**Decision**:
- Create new `src/lib/schemas/cle-repartition.ts` with full schema including quotes-parts
- Update `useClesRepartition.ts` with full CRUD operations
- Keep compatibility with existing AG module that uses cleRepartitionId

## Dependencies Identified

1. **Lot data**: Need access to lots for quotes-parts editor
2. **Appel schema**: Need to verify cleRepartitionId field exists for deletion check
3. **Existing CleRepartition type**: Used by AG module, maintain backward compatibility

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking AG module | Medium | High | Keep existing CleRepartition type compatible |
| Performance with many lots | Low | Medium | Pagination if > 50 lots (rare) |
| Concurrent edits | Low | Medium | Last-write-wins (acceptable for MVP) |

## Open Questions (Resolved)

All questions resolved through research and existing clarifications.
