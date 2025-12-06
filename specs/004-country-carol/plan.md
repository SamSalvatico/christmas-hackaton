# Implementation Plan: Country Christmas Carol

**Branch**: `004-country-carol` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-country-carol/spec.md`

## Summary

Extend feature 003 (Country Famous Dishes) to include a famous Christmas carol in the same LLM request. The system queries OpenAI in a single request to retrieve both dishes and a Christmas carol for a selected country, returning the carol name and author (when available) alongside dish information. Uses the same caching (20-minute TTL), retry logic, and error handling as dishes.

**Technical Approach**:

- Extend existing OpenAI service to include Christmas carol in prompt
- Update prompt structure to request both dishes and carol in single query
- Extend TypeScript types to include ChristmasCarol entity
- Update DishesResponse to include carol field (or create combined response type)
- Update API route to handle carol data in response
- Update home page to display carol alongside dishes
- Reuse existing caching and retry logic (no changes needed)

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode)  
**Primary Dependencies**: Next.js 16.0.7, React 19.2.1, OpenAI SDK (openai), Node.js 24+  
**Storage**: In-memory cache (Map-based with TTL) - reuse existing cache utility  
**Testing**: Deferred (as per project requirements)  
**Target Platform**: Web browser (Next.js SSR)  
**Project Type**: Web application (single service, frontend + backend)  
**Performance Goals**:

- LLM query response within 10 seconds (same as dishes)
- Display results within 2 seconds of receiving response
- Cache hit response <1 second

**Constraints**:

- Must use same caching logic as dishes (20-minute TTL, valid responses only)
- Must use same retry logic as dishes (automatic retry with refined query)
- Must use same error handling as dishes (user-friendly messages)
- Carol information cached together with dishes in same cache entry
- Single LLM request for both dishes and carol (no separate API calls)
- Author information is optional (may not be available for traditional/folk carols)

**Scale/Scope**: 2-3 users, single-instance deployment, OpenAI API integration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Modular Architecture ✅

- **Clear module boundaries**: Extends existing modules (OpenAI service, API route, types, page), no new modules needed
- **Unidirectional dependencies**: Page → API Route → OpenAI Service → Cache Utility (same as feature 003)
- **Independent testability**: Carol extraction and validation can be tested independently, integrates with existing dish logic

### Code Readability ✅

- **Self-documenting code**: Clear function names (`buildCombinedPrompt`, `parseCarolData`, `validateCarolData`), descriptive variable names
- **Naming conventions**: TypeScript strict types, consistent camelCase naming (follows feature 003 patterns)
- **Documentation**: JSDoc comments for new functions, updated comments for modified functions
- **Complex logic**: Carol parsing and validation extracted to separate functions with clear implementation

### User-Centric Design ✅

- **User needs**: Discover Christmas carols alongside dishes for selected countries
- **Intuitive interface**: Carol displayed alongside dishes in same JSON format
- **Error messages**: User-friendly messages (same as dishes), graceful handling of missing carols
- **Loading states**: Same loading indicator as dishes (no additional UI needed)
- **Empty states**: Gracefully handle missing carol information (display dishes only)

**No violations identified** - All principles are satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/004-country-carol/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-routes.md    # API endpoint contracts (updated)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── api/
│   └── dishes/
│       └── route.ts          # POST /api/dishes - updated to handle carol in response
├── page.tsx                   # Home page (updated to display carol alongside dishes)
└── layout.tsx                 # Root layout (existing)

lib/
├── api/
│   └── openai-service.ts     # Updated to include carol in prompt and parsing
└── types/
    └── dishes.ts              # Extended with ChristmasCarol type and combined response
```

**Structure Decision**: Extends existing Next.js 16 App Router structure. Modifies existing files rather than creating new ones. Reuses all existing infrastructure (cache, error handling, retry logic). This follows the modular architecture established in feature 003 and maintains consistency.

## Complexity Tracking

> **No violations** - All constitution principles are satisfied without requiring complexity justification.
