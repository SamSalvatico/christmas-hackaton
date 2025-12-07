# Implementation Plan: Improve API Naming

**Branch**: `006-improve-api-naming` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-improve-api-naming/spec.md`

## Summary

Refactor API endpoint, file names, type names, and function names from "dishes" terminology to "cultural-data" terminology to accurately reflect that the API returns comprehensive cultural data (dishes, Christmas carol, and Spotify URL), not just dishes.

**Technical Approach**:

- Rename API route from `/api/dishes` to `/api/cultural-data`
- Rename route file from `app/api/dishes/route.ts` to `app/api/cultural-data/route.ts`
- Rename type file from `lib/types/dishes.ts` to `lib/types/cultural-data.ts` (or keep file and rename types)
- Rename types: `DishesApiRequest` → `CulturalDataApiRequest`, `DishesApiResponse` → `CulturalDataApiResponse`, etc.
- Rename functions: `queryDishesAndCarolWithRetry` → `queryCulturalDataWithRetry`
- Update all references, comments, and variable names throughout codebase
- Maintain backward compatibility with old endpoint (redirect or deprecation notice)
- Update frontend code to use new endpoint name

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode)  
**Primary Dependencies**: Next.js 16.0.7, React 19.2.1, Node.js 24+  
**Storage**: In-memory cache (Map-based with TTL) - no changes needed  
**Testing**: Deferred (as per project requirements)  
**Target Platform**: Web browser (Next.js SSR)  
**Project Type**: Web application (single service, frontend + backend)  
**Performance Goals**:

- No performance impact (refactoring only)
- TypeScript compilation time unchanged
- Runtime behavior identical

**Constraints**:

- Must maintain backward compatibility (old endpoint should still work)
- Must update all references atomically to avoid compilation errors
- Must preserve all existing functionality (no behavioral changes)
- Must update frontend code to use new endpoint
- Must ensure TypeScript strict mode compilation passes
- Must update all comments and documentation

**Scale/Scope**: 2-3 users, single-instance deployment, internal API refactoring

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Modular Architecture ✅

- **Clear module boundaries**: File renaming maintains existing module structure. Route file moves to new location but maintains same responsibilities. Type file maintains same structure with renamed types.
- **Unidirectional dependencies**: No dependency changes - only naming changes. Dependencies flow remains the same.
- **Independent testability**: Refactoring maintains existing testability. No structural changes to modules.

### Code Readability ✅

- **Self-documenting code**: Renaming improves code readability by making names accurately reflect their purpose. "Cultural data" is more accurate than "dishes" for endpoints/types that return multiple data types.
- **Naming conventions**: Follows existing TypeScript/Next.js naming patterns. Uses kebab-case for routes, PascalCase for types, camelCase for functions.
- **Documentation**: Comments and documentation will be updated to reflect new naming, improving clarity.
- **Complex logic**: No complex logic changes - pure refactoring.

### User-Centric Design ✅

- **User needs**: Developers (internal users) benefit from accurate naming that reduces confusion and improves API discoverability.
- **Intuitive interface**: API endpoint name `/api/cultural-data` clearly indicates what data is returned, improving developer experience.
- **Error messages**: Error messages will be updated to use consistent "cultural data" terminology.
- **Backward compatibility**: Old endpoint maintained to prevent breaking changes for any existing integrations.

**No violations identified** - All principles are satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/006-improve-api-naming/
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
│   ├── dishes/
│   │   └── route.ts          # OLD: To be renamed or deprecated
│   └── cultural-data/
│       └── route.ts          # NEW: Renamed route file
├── page.tsx                   # Updated to use new endpoint
└── layout.tsx                 # Root layout (no changes)

lib/
├── api/
│   └── openai-service.ts     # Updated function names
├── utils/
│   └── cache.ts               # No changes needed
└── types/
    ├── dishes.ts              # OLD: May be renamed or types renamed within
    └── cultural-data.ts       # NEW: Renamed type file (or types renamed in dishes.ts)
```

**Structure Decision**: Extends existing Next.js 16 App Router structure. Creates new route directory for cultural-data endpoint. May keep old endpoint for backward compatibility or remove after migration. Type file may be renamed or types renamed within existing file. This maintains modular architecture while improving naming clarity.

## Complexity Tracking

> **No violations** - All constitution principles are satisfied without requiring complexity justification.
