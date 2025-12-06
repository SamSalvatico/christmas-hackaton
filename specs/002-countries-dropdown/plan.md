# Implementation Plan: Countries Searchable Dropdown

**Branch**: `002-countries-dropdown` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-countries-dropdown/spec.md`

## Summary

Build a searchable country dropdown feature that fetches country names from the REST Countries API, caches them server-side for 10 minutes, and displays them in a searchable HeroUI dropdown on the home page. Users can search countries using case-insensitive partial matching (ilike comparison) and select one country to trigger a "Santa Search" action (currently logs to console).

**Technical Approach**:

- Next.js 16 API route (`/api/countries`) that fetches from REST Countries API using native `fetch`
- In-memory cache with 10-minute TTL for country list
- HeroUI Select/Autocomplete component for searchable dropdown
- Client-side filtering with case-insensitive partial matching
- Strict TypeScript types throughout
- User-friendly error handling and messages

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode)  
**Primary Dependencies**: Next.js 16.0.7, React 19.2.1, HeroUI 2.8.5, Node.js 24+  
**Storage**: In-memory cache (Map-based with TTL) - no persistent storage required  
**Testing**: Deferred (as per project requirements)  
**Target Platform**: Web browser (Next.js SSR)  
**Project Type**: Web application (single service, frontend + backend)  
**Performance Goals**:

- API response <1s with cache, <5s without cache
- Dropdown populated within 2 seconds of page load
- Real-time search filtering as user types

**Constraints**:

- Cache must expire after exactly 10 minutes
- Search must use case-insensitive partial matching (ilike)
- Must handle REST Countries API failures gracefully
- Must display meaningful error messages to users
**Scale/Scope**: 2-3 users, ~250 countries in dropdown, single-instance deployment

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Modular Architecture ✅

- **Clear module boundaries**: API route (`app/api/countries/route.ts`), cache utility (`lib/utils/cache.ts`), UI component (`components/features/country-dropdown.tsx`), page integration (`app/page.tsx`)
- **Unidirectional dependencies**: Page → Component → API Route → Cache Utility → External API
- **Independent testability**: Each module can be tested independently (API route, cache logic, component rendering, search filtering)

### Code Readability ✅

- **Self-documenting code**: Clear function names (`fetchCountries`, `getCachedCountries`, `filterCountries`), descriptive variable names
- **Naming conventions**: TypeScript strict types, consistent camelCase naming
- **Documentation**: JSDoc comments for cache utility functions, API route handlers, and complex search logic
- **Complex logic**: Search filtering extracted to separate function with clear implementation

### User-Centric Design ✅

- **User needs**: Easy country selection with search functionality
- **Intuitive interface**: HeroUI dropdown with built-in search, clear visual feedback
- **Error messages**: User-friendly messages like "Unable to load countries. Please try again later." instead of technical errors
- **Accessibility**: HeroUI components are accessible by default (ARIA support, keyboard navigation)
- **Loading states**: Show loading indicator while fetching countries
- **Empty states**: Show helpful message when no countries match search

**No violations identified** - All principles are satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/002-countries-dropdown/
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
│   └── countries/
│       └── route.ts          # GET /api/countries - fetch and cache countries
├── page.tsx                   # Home page with country dropdown
└── layout.tsx                 # Root layout (existing)

components/
└── features/
    ├── country-dropdown.tsx   # HeroUI Select/Autocomplete component
    └── santa-search-button.tsx # Santa Search button component

lib/
├── utils/
│   └── cache.ts              # In-memory cache utility with TTL
└── types/
    └── countries.ts          # TypeScript types for countries API

```

**Structure Decision**: Extends existing Next.js 16 App Router structure. API route in `app/api/countries/`, reusable components in `components/features/`, cache utility in `lib/utils/`, and types in `lib/types/`. This follows the modular architecture established in feature 001.

## Complexity Tracking

> **No violations** - All constitution principles are satisfied without requiring complexity justification.
