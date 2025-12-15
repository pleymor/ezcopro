<!--
  SYNC IMPACT REPORT
  ==================
  Version change: 0.0.0 → 1.0.0

  Modified principles: N/A (initial version)

  Added sections:
  - 7 Core Principles (I-VII)
  - Development Workflow section
  - Quality Gates section
  - Governance section

  Removed sections: N/A (initial version)

  Templates status:
  - .specify/templates/plan-template.md: ✅ Compatible (Constitution Check section exists)
  - .specify/templates/spec-template.md: ✅ Compatible (BDD scenarios, requirements format)
  - .specify/templates/tasks-template.md: ✅ Compatible (test-first workflow, phases)

  Follow-up TODOs: None
-->

# EzCopro Constitution

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)

Test-Driven Development (TDD) is mandatory for all feature development.

- Tests MUST be written before implementation code
- Tests MUST fail before implementation begins (Red phase)
- Implementation MUST be minimal to pass tests (Green phase)
- Refactoring MUST only occur with passing tests (Refactor phase)
- No pull request shall be merged without corresponding tests
- Test coverage MUST be maintained above 80% for critical paths

**Rationale**: TDD ensures correctness, provides living documentation, and prevents regression.
Bugs caught during development cost 10x less than bugs in production.

### II. Behavior-Driven Development (BDD)

All features MUST be specified using BDD acceptance scenarios.

- User stories MUST follow Given/When/Then format
- Acceptance scenarios MUST be written before implementation
- Scenarios MUST be understandable by non-technical stakeholders
- Each scenario MUST be independently testable
- Scenarios MUST map directly to automated tests

**Rationale**: BDD bridges the gap between business requirements and technical implementation,
ensuring the team builds what users actually need.

### III. Type Safety (NON-NEGOTIABLE)

Strict TypeScript typing is mandatory throughout the codebase.

- `strict: true` MUST be enabled in tsconfig.json
- `any` type is FORBIDDEN except in explicitly justified edge cases
- `unknown` MUST be used instead of `any` for truly unknown types
- All function parameters and return types MUST be explicitly typed
- External API responses MUST be validated with runtime type checking (e.g., Zod)
- Database queries MUST use typed ORM or query builders

**Rationale**: Type safety catches errors at compile time, improves IDE support,
and serves as documentation. Property management involves financial data where
type errors can have serious consequences.

### IV. Security First

Security is a non-negotiable requirement for all features.

- Authentication MUST use industry-standard protocols (OAuth2, JWT)
- Authorization MUST be enforced at both API and data layers
- All user input MUST be validated and sanitized
- Sensitive data (passwords, financial info) MUST be encrypted at rest and in transit
- SQL injection, XSS, and CSRF protections MUST be implemented
- Security-relevant actions MUST be logged with audit trails
- Dependencies MUST be regularly scanned for vulnerabilities
- Multi-tenant data isolation MUST be verified at every data access point

**Rationale**: EzCopro handles sensitive property and financial data for co-owners.
A security breach would damage trust irreparably and may have legal consequences.

### V. API-First Design

APIs MUST be designed before implementation begins.

- API contracts MUST be defined using OpenAPI/Swagger specification
- Breaking changes MUST increment the API major version
- All endpoints MUST return consistent error formats
- API documentation MUST be auto-generated and always current
- Frontend and backend teams MUST agree on contracts before implementation
- API responses MUST be paginated for list endpoints

**Rationale**: API-first enables parallel frontend/backend development,
ensures clear contracts, and prevents integration issues late in development.

### VI. Data Integrity & Auditability

All data operations MUST maintain integrity and be auditable.

- Database transactions MUST be used for multi-step operations
- Financial calculations MUST use decimal types, never floating point
- All mutations MUST be logged with timestamp, user, and before/after state
- Soft deletes MUST be used for business-critical entities
- Data migrations MUST be reversible and tested
- Backup and recovery procedures MUST be documented and tested

**Rationale**: Property management involves legal and financial records that
may be required for disputes, audits, or regulatory compliance years later.

### VII. Simplicity & Pragmatism

Prefer simple, working solutions over complex, theoretical ones.

- YAGNI: Do not build features until they are needed
- Start with the simplest solution that could work
- Complexity MUST be justified in code review
- Abstractions MUST solve existing problems, not hypothetical ones
- Third-party libraries are preferred over custom implementations
- Premature optimization is forbidden; measure before optimizing

**Rationale**: Complexity is the enemy of reliability. Simple code is easier
to understand, test, maintain, and debug. EzCopro must be maintainable long-term.

## Target Audience

EzCopro cible exclusivement les **copropriétés autogérées** (sans syndic professionnel).

**Profil type** :
- Petites à moyennes copropriétés (3-30 lots, souvent < 15)
- Gérées par un syndic bénévole (souvent le président du conseil)
- Budget très limité
- Besoin principal : simplifier l'organisation, la communication et la paperasse

## Business Model

### Phase MVP : Gratuit

- **Objectif** : Valider le produit avec ~5 copropriétés pilotes (~100 utilisateurs)
- **Coût cible** : 0€ (free tiers Firebase/Supabase/Vercel)
- **Aucune limitation artificielle** : Focus 100% sur la valeur utilisateur

### Phase Post-MVP : Gratuit généreux + revenus alternatifs

#### Principe fondamental
> **Coût par copro < 0.10€/mois** → le gratuit reste viable

#### Stratégie de monétisation (par ordre de priorité)

1. **Partenariats ciblés** (revenus principaux)
   - Assurance copro (Luko, etc.) : 20-50€/lead qualifié
   - Comparateur énergie : 10-30€/souscription
   - Annuaire artisans locaux : 10-20€/mois/artisan
   - Affiliation logiciels compatibles : 5-15%

2. **Contributions volontaires**
   - Bouton "Soutenir le projet"
   - Tier "Soutien" optionnel à 3-5€/mois avec extras cosmétiques

3. **Ce qu'on NE fait PAS**
   - ❌ Publicités classiques (AdSense) : mauvaise UX, revenus faibles
   - ❌ Paywall sur fonctions essentielles : friction trop forte pour la cible
   - ❌ Tracking utilisateur pour la pub

#### Format publicitaire accepté
- Encart discret en footer : "Nos partenaires"
- Page dédiée "Services recommandés"
- Jamais de popup ou interstitiel

### Optimisations techniques pour maîtriser les coûts

| Technique | Impact |
|-----------|--------|
| Cache agressif (PWA + Service Worker) | -50% lectures DB |
| Compression images | -70% stockage |
| Données locales (IndexedDB) | -40% requêtes serveur |
| Lazy loading / pagination | -30% bandwidth |
| Limite stockage soft (50 Mo/copro) | Maîtrise du storage |

### Projection financière (1000 copros)

| Coûts mensuels | Montant |
|----------------|---------|
| Infrastructure optimisée | ~60-100€ |

| Revenus mensuels | Montant |
|------------------|---------|
| Partenariats (leads, affiliation) | ~200-300€ |
| Contributions volontaires (5%) | ~150-250€ |
| **Marge estimée** | **~200-400€** |

## Development Workflow

All development MUST follow this workflow:

1. **Specification**: Write BDD scenarios in spec.md before coding
2. **Planning**: Create implementation plan with constitution check
3. **Test Writing**: Write failing tests based on acceptance scenarios
4. **Implementation**: Write minimal code to pass tests
5. **Refactoring**: Improve code while keeping tests green
6. **Code Review**: Verify constitution compliance before merge
7. **Deployment**: Automated deployment with rollback capability

## Quality Gates

The following gates MUST pass before merge:

- All tests pass (unit, integration, contract)
- Type checking passes with zero errors
- Linting passes with zero warnings
- Security scan shows no high/critical vulnerabilities
- Code review approved by at least one team member
- Constitution compliance verified

## Governance

This constitution is the supreme guide for all EzCopro development practices.

- All pull requests MUST demonstrate compliance with these principles
- Violations MUST be documented and justified in the PR description
- Constitution amendments require:
  1. Written proposal with rationale
  2. Team discussion and approval
  3. Migration plan for existing code (if applicable)
  4. Version increment following semver
- Quarterly reviews MUST assess constitution effectiveness
- Runtime development guidance is maintained in project documentation

**Version**: 1.0.0 | **Ratified**: 2025-12-15 | **Last Amended**: 2025-12-15
