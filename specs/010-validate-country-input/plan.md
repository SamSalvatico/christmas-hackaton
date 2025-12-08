# Implementation Plan: Country Input Validation

**Branch**: `010-validate-country-input` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-validate-country-input/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Refactor the countries API to extract fetch and cache logic into a reusable service (`lib/api/countries-service.ts`), and add country validation functionality that can be used by both `/cultural-data` and `/recipe` API endpoints. The validation will check country names against the valid countries list using case-insensitive matching and proper whitespace handling, rejecting invalid countries early in the request pipeline to prevent unnecessary processing.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode), Node.js 24+  
**Primary Dependencies**: Next.js 16.0.7, React 19.2.1  
**Storage**: In-memory cache (Map-based with TTL) - reuse existing cache utility from `lib/utils/cache.ts`  
**Testing**: Jest, React Testing Library (deferred for now - focus on implementation)  
**Target Platform**: Node.js server runtime (Next.js API routes)  
**Project Type**: Web application (single service SSR)  
**Performance Goals**: 
- Country validation completes within 50ms for 95% of requests
- Error messages for invalid countries returned within 100ms
- No significant impact on existing API response times  
**Constraints**: 
- Must reuse existing cache utility
- Must maintain backward compatibility with existing `/countries` API endpoint
- Validation must occur before cache checks and external API calls (fail fast)
- Must use same validation logic across all endpoints for consistency  
**Scale/Scope**: 
- Single service application
- 2 API endpoints requiring validation (`/cultural-data`, `/recipe`)
- 1 API endpoint to refactor (`/countries`)
- 1 new service module (`lib/api/countries-service.ts`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Assessment ✅

**Modular Architecture**: 
- ✅ Clear separation: `lib/api/countries-service.ts` for reusable service logic, `app/api/countries/route.ts` for API endpoint
- ✅ Dependencies flow unidirectionally: API routes → services → cache/utils
- ✅ Service module is independently testable and reusable across endpoints
- ✅ Validation logic centralized in service, ensuring consistency

**Code Readability**: 
- ✅ Service functions will have clear, descriptive names (`getCountriesList`, `validateCountry`, etc.)
- ✅ TypeScript types ensure self-documenting interfaces
- ✅ JSDoc comments will document function behavior and parameters
- ✅ Error messages are user-friendly and consistent

**User-Centric Design**: 
- ✅ Validation errors provide clear, actionable feedback ("Country 'X' is not recognized. Please select a valid country from the list.")
- ✅ Early validation prevents confusing downstream errors
- ✅ Consistent error format across endpoints improves developer experience

### Post-Design Assessment

*To be completed after Phase 1 design*

## Project Structure

### Documentation (this feature)

```text
specs/010-validate-country-input/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── api/
│   ├── countries/
│   │   └── route.ts              # Refactored to use countries-service
│   ├── cultural-data/
│   │   └── route.ts              # Add country validation
│   └── recipe/
│       └── route.ts              # Add country validation

lib/
├── api/
│   └── countries-service.ts      # NEW: Service with fetch, cache, and validation logic
├── types/
│   └── countries.ts              # May need to add validation result types
└── utils/
    └── cache.ts                  # Existing - no changes needed

tests/
├── integration/
│   └── countries-service.test.ts # Future: test service functions
└── unit/
    └── country-validation.test.ts # Future: test validation logic
```

**Structure Decision**: Using existing Next.js 16 App Router structure. The service layer (`lib/api/countries-service.ts`) will be the single source of truth for countries data fetching, caching, and validation. API routes will be thin wrappers that call the service.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. The refactoring improves modularity by extracting reusable logic, and the validation adds minimal complexity while significantly improving error handling and user experience.
