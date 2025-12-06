# Implementation Plan: Spotify Christmas Carol Link

**Branch**: `005-spotify-carol-link` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-spotify-carol-link/spec.md`

## Summary

Extend feature 004 (Country Christmas Carol) to automatically search Spotify for Christmas carols when they are available in the cultural data response. The system retrieves the Spotify URL for the carol and displays it on the page, allowing users to access the song directly on Spotify.

**Technical Approach**:

- Integrate Spotify Web API search endpoint (`GET /v1/search`)
- Implement OAuth2 client credentials flow for authentication (client_id + client_secret → base64 encoded → bearer token)
- Search Spotify using carol name with `type=track&limit=1&offset=0`
- Extract Spotify URL from `tracks.items[0].external_urls.spotify`
- Cache Spotify URLs for 20 minutes (same TTL as cultural data)
- Display Spotify URL on page or "not found on spotify" message
- Handle errors gracefully (rate limits, timeouts, no results)

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode)  
**Primary Dependencies**: Next.js 16.0.7, React 19.2.1, Node.js 24+, Spotify Web API  
**Storage**: In-memory cache (Map-based with TTL) - reuse existing cache utility  
**Testing**: Deferred (as per project requirements)  
**Target Platform**: Web browser (Next.js SSR)  
**Project Type**: Web application (single service, frontend + backend)  
**Performance Goals**:

- Spotify search completes within 2 seconds (including authentication)
- Display Spotify URL within 5 seconds of receiving cultural data
- Cache hit response <1 second

**Constraints**:

- Must use Spotify Web API client credentials flow (no user authentication required)
- Must cache Spotify URLs for 20 minutes (same TTL as cultural data)
- Must handle rate limiting gracefully (Spotify API rate limits apply)
- Must handle missing results gracefully (no error, display "not found on spotify")
- Must URL-encode carol names for search query
- Must extract URL from nested response structure (`tracks.items[0].external_urls.spotify`)

**Scale/Scope**: 2-3 users, single-instance deployment, Spotify API integration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Modular Architecture ✅

- **Clear module boundaries**: New Spotify service module (`lib/api/spotify-service.ts`), extends existing API route (`app/api/dishes/route.ts`), new types in `lib/types/spotify.ts`. Clear separation between Spotify integration and cultural data flow.
- **Unidirectional dependencies**: Page → API Route → Spotify Service → Cache Utility. Dependencies flow in one direction only.
- **Independent testability**: Spotify service can be tested independently with mock API responses. API route integration can be tested separately.

### Code Readability ✅

- **Self-documenting code**: Clear function names (`searchSpotifyTrack`, `getSpotifyAccessToken`, `extractSpotifyUrl`), descriptive variable names.
- **Naming conventions**: TypeScript strict types, consistent camelCase naming (follows existing patterns).
- **Documentation**: JSDoc comments for all new functions, error handling documented.
- **Complex logic**: Authentication flow and response parsing extracted to separate functions with clear implementation.

### User-Centric Design ✅

- **User needs**: Access Christmas carols on Spotify directly from the application.
- **Intuitive interface**: Spotify URL displayed alongside cultural data, clickable link format.
- **Error messages**: User-friendly messages ("not found on spotify" instead of technical errors), graceful handling of API failures.
- **Loading states**: Show loading indicator while searching Spotify (if applicable).
- **Empty states**: Display "not found on spotify" message when no results, without breaking the cultural data display.

**No violations identified** - All principles are satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/005-spotify-carol-link/
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
│       └── route.ts          # POST /api/dishes - updated to include Spotify search after carol retrieval
├── page.tsx                   # Home page (updated to display Spotify URL)
└── layout.tsx                 # Root layout (existing)

lib/
├── api/
│   └── spotify-service.ts     # NEW: Spotify API integration (authentication, search, URL extraction)
├── utils/
│   └── cache.ts               # Reuse existing cache utility (20 min TTL)
└── types/
    ├── dishes.ts              # Existing, no changes needed
    └── spotify.ts              # NEW: TypeScript types for Spotify API responses
```

**Structure Decision**: Extends existing Next.js 16 App Router structure. Creates new Spotify service module following the same patterns as OpenAI service. Reuses existing cache utility. Modifies existing API route and page to integrate Spotify search. This follows the modular architecture established in previous features and maintains consistency.

## Complexity Tracking

> **No violations** - All constitution principles are satisfied without requiring complexity justification.
