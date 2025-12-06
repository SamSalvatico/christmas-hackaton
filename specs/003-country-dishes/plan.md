# Implementation Plan: Country Famous Dishes

**Branch**: `003-country-dishes` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-country-dishes/spec.md`

## Summary

Build a feature that queries an LLM (OpenAI) to retrieve famous dishes for a selected country, categorizes them by type (entry/appetizer, main course, dessert), and displays one dish per available category. Each dish shows its name, brief description, and ingredients list. The feature integrates with the country selection from feature 002 and displays JSON results on the page after the Santa Search button is clicked.

**Technical Approach**:

- Next.js 16 API route (`/api/dishes`) that uses OpenAI SDK to query dishes for a country
- Structured prompt with specific format requirements (JSON response)
- In-memory cache with 20-minute TTL for valid responses only
- Automatic retry with refined query for invalid/malformed responses
- Simple JSON display on home page after Santa Search button click
- Ingredient list truncation (first 8 items + "There's more!" message)

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode)  
**Primary Dependencies**: Next.js 16.0.7, React 19.2.1, OpenAI SDK (openai), Node.js 24+  
**Storage**: In-memory cache (Map-based with TTL) - no persistent storage required  
**Testing**: Deferred (as per project requirements)  
**Target Platform**: Web browser (Next.js SSR)  
**Project Type**: Web application (single service, frontend + backend)  
**Performance Goals**:

- LLM query response within 10 seconds
- Display results within 2 seconds of receiving response
- Cache hit response <1 second

**Constraints**:

- Cache must expire after exactly 20 minutes
- Cache only valid responses (invalid/malformed responses not cached)
- Must handle OpenAI API rate limiting and errors gracefully
- Must retry with refined query for invalid/malformed responses
- Must display JSON content simply on page (no complex UI initially)
- Keep implementation simple and straightforward

**Scale/Scope**: 2-3 users, single-instance deployment, OpenAI API integration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Modular Architecture ✅

- **Clear module boundaries**: API route (`app/api/dishes/route.ts`), OpenAI service (`lib/api/openai-service.ts`), cache utility (reuse `lib/utils/cache.ts`), page integration (`app/page.tsx`)
- **Unidirectional dependencies**: Page → API Route → OpenAI Service → Cache Utility
- **Independent testability**: Each module can be tested independently (API route, OpenAI service, cache logic, JSON display)

### Code Readability ✅

- **Self-documenting code**: Clear function names (`queryDishesForCountry`, `parseDishResponse`, `validateDishData`), descriptive variable names
- **Naming conventions**: TypeScript strict types, consistent camelCase naming
- **Documentation**: JSDoc comments for OpenAI service functions, API route handlers, and response parsing logic
- **Complex logic**: Response parsing and validation extracted to separate functions with clear implementation

### User-Centric Design ✅

- **User needs**: Discover famous dishes for selected countries
- **Intuitive interface**: Simple JSON display initially, clear error messages
- **Error messages**: User-friendly messages like "Unable to find dishes for this country. Please try again." instead of technical errors
- **Loading states**: Show loading indicator while querying OpenAI
- **Empty states**: Show helpful message when no dishes found

**No violations identified** - All principles are satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/003-country-dishes/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-routes.md    # API endpoint contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── api/
│   └── dishes/
│       └── route.ts          # POST /api/dishes - query OpenAI for dishes
├── page.tsx                   # Home page (updated to display JSON results)
└── layout.tsx                 # Root layout (existing)

components/
└── features/
    └── santa-search-button.tsx # Updated to trigger dish search

lib/
├── api/
│   └── openai-service.ts     # OpenAI SDK integration for dish queries
├── utils/
│   └── cache.ts              # Reuse existing cache utility (20 min TTL)
└── types/
    └── dishes.ts              # TypeScript types for dishes API
```

**Structure Decision**: Extends existing Next.js 16 App Router structure. API route in `app/api/dishes/`, OpenAI service in `lib/api/`, reuse existing cache utility with 20-minute TTL, and types in `lib/types/`. This follows the modular architecture established in previous features.

## Complexity Tracking

> **No violations** - All constitution principles are satisfied without requiring complexity justification.
