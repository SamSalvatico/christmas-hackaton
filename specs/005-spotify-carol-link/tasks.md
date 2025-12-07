# Tasks: Spotify Christmas Carol Link

**Input**: Design documents from `/specs/005-spotify-carol-link/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL and not included in this feature (as per project requirements).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Next.js 16 App Router structure
- Paths: `app/`, `lib/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment configuration

- [ ] T001 Add Spotify environment variables to `.env.sample` file with placeholder values for `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`
- [ ] T002 Update `.env.local` file (if exists) or document requirement for `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` environment variables

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 [P] Create TypeScript types for Spotify API responses in `lib/types/spotify.ts` including `SpotifyAccessToken`, `SpotifySearchResponse`, `SpotifyTracksObject`, `SpotifyTrack`, and `SpotifyExternalUrls` interfaces
- [ ] T004 [P] Extend `CountryCulturalData` type in `lib/types/dishes.ts` to include optional `spotifyUrl: string | null` field, creating `CountryCulturalDataWithSpotify` type or extending existing type
- [ ] T005 [P] Update `CountryCulturalApiSuccessResponse` type in `lib/types/dishes.ts` to reflect the extended response structure with `spotifyUrl` field

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Search Spotify for Christmas Carol (Priority: P1) 🎯 MVP

**Goal**: Automatically search Spotify for Christmas carols when they are available in cultural data, retrieve the Spotify URL, and make it available for display.

**Independent Test**: Can be fully tested by providing a carol name, triggering the Spotify search, and verifying the system returns a Spotify URL. The test can use a mock Spotify API response to verify the URL extraction logic.

### Implementation for User Story 1

- [ ] T006 [P] [US1] Create `getSpotifyAccessToken` function in `lib/api/spotify-service.ts` that implements OAuth2 client credentials flow: reads `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` from environment, encodes to base64, requests token from `https://accounts.spotify.com/api/token`, and returns `SpotifyAccessToken`
- [ ] T007 [US1] Implement token caching logic in `getSpotifyAccessToken` function in `lib/api/spotify-service.ts` using existing cache utility with key `spotify-access-token` and TTL based on `expires_in` from token response
- [ ] T008 [US1] Create `searchSpotifyTrack` function in `lib/api/spotify-service.ts` that takes a carol name, URL-encodes it, calls `GET https://api.spotify.com/v1/search?q={encodedName}&type=track&limit=1&offset=0` with Bearer token, and returns `SpotifySearchResponse`
- [ ] T009 [US1] Create `extractSpotifyUrl` function in `lib/api/spotify-service.ts` that safely extracts URL from `tracks.items[0].external_urls.spotify` using optional chaining, returns `string | null` (null if no results or missing URL)
- [ ] T010 [US1] Create `searchSpotifyForCarol` function in `lib/api/spotify-service.ts` that orchestrates the full flow: checks cache for Spotify URL (key: `spotify-url:${carolName.toLowerCase()}`), if cache miss gets access token (with caching), searches Spotify, extracts URL, caches valid URLs for 20 minutes (1,200,000ms), returns `string | null`
- [ ] T011 [US1] Add error handling in `searchSpotifyForCarol` function in `lib/api/spotify-service.ts` for rate limiting (429), authentication errors (401 with token refresh retry), network timeouts, and API errors - all should return `null` gracefully without throwing
- [ ] T012 [US1] Update `POST /api/dishes` route handler in `app/api/dishes/route.ts` to call `searchSpotifyForCarol` after retrieving cultural data, only if `carol` is not null, and include `spotifyUrl` in the response data
- [ ] T013 [US1] Update response type in `app/api/dishes/route.ts` to use extended type with `spotifyUrl` field, ensuring TypeScript types are correct

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. The system should automatically search Spotify when a carol is available and return the URL in the API response.

---

## Phase 4: User Story 2 - Display Spotify URL on Page (Priority: P2)

**Goal**: Display the Spotify URL for the Christmas carol on the page alongside cultural data, allowing users to access the song on Spotify.

**Independent Test**: Can be fully tested by providing a mock Spotify URL and verifying the UI displays it correctly. The test verifies the layout and link presentation without requiring the Spotify API integration.

### Implementation for User Story 2

- [ ] T014 [P] [US2] Update `CountryCulturalData` type usage in `app/page.tsx` to handle the new `spotifyUrl` field (if type was extended) or use the extended type
- [ ] T015 [US2] Update the results display section in `app/page.tsx` to show Spotify URL when available: display as clickable link with text "Listen on Spotify" or the URL itself, styled consistently with existing UI
- [ ] T016 [US2] Add "not found on spotify" message display in `app/page.tsx` when `spotifyUrl` is `null` but `carol` is not null (indicating search was performed but no results found)
- [ ] T017 [US2] Ensure Spotify link opens in new tab/window with `target="_blank"` and `rel="noopener noreferrer"` attributes in `app/page.tsx`
- [ ] T018 [US2] Update JSON display (if still showing raw JSON) in `app/page.tsx` to include `spotifyUrl` field in the displayed data structure

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users should see the Spotify URL displayed on the page when available, and a "not found on spotify" message when the search returned no results.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T019 [P] Add JSDoc comments to all new functions in `lib/api/spotify-service.ts` explaining parameters, return values, and error handling behavior
- [ ] T020 [P] Add error logging for Spotify API errors in `lib/api/spotify-service.ts` using console.error or appropriate logging mechanism, ensuring sensitive data (tokens, secrets) are not logged
- [ ] T021 [P] Verify environment variable validation in `lib/api/spotify-service.ts` throws clear error messages if `SPOTIFY_CLIENT_ID` or `SPOTIFY_CLIENT_SECRET` are missing
- [ ] T022 [P] Add timeout handling (5 seconds) for Spotify API calls in `lib/api/spotify-service.ts` using AbortController or fetch timeout mechanism
- [ ] T023 [P] Verify cache key normalization (lowercase carol names) in `searchSpotifyForCarol` function in `lib/api/spotify-service.ts` to ensure consistent caching
- [ ] T024 [P] Test graceful degradation: verify that when Spotify API fails, cultural data is still returned with `spotifyUrl: null` in `app/api/dishes/route.ts`
- [ ] T025 [P] Run quickstart.md validation: test the complete flow from country selection to Spotify URL display, verify all scenarios from quickstart.md work correctly
- [ ] T026 [P] Verify TypeScript compilation passes without errors: run `npm run build` or `tsc --noEmit` to ensure all types are correct
- [ ] T027 [P] Verify linting passes: run `npm run lint` to ensure code follows project style guidelines

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1) can start after Foundational
  - User Story 2 (P2) depends on User Story 1 completion (needs Spotify search to work before displaying)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 completion - Needs Spotify search functionality to be working before UI can display results

### Within Each User Story

- **User Story 1**:
  - Types (T003-T005) can be created in parallel
  - Token function (T006) before search function (T008)
  - Search function (T008) before extraction function (T009)
  - All functions before orchestration (T010)
  - Error handling (T011) can be added incrementally
  - API route integration (T012-T013) after all service functions complete

- **User Story 2**:
  - Type updates (T014) can be done in parallel with display tasks
  - Display tasks (T015-T018) can be done in sequence or incrementally

### Parallel Opportunities

- **Phase 1**: All setup tasks can run in parallel (T001-T002)
- **Phase 2**: All foundational tasks marked [P] can run in parallel (T003-T005)
- **Phase 3 (US1)**: 
  - Token function (T006) and search function (T008) can be developed in parallel after types are done
  - Error handling (T011) can be added incrementally alongside other functions
- **Phase 4 (US2)**: 
  - Type updates (T014) can be done in parallel with display implementation
- **Phase 5**: All polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# After Foundational phase, these can run in parallel:
Task T006: "Create getSpotifyAccessToken function in lib/api/spotify-service.ts"
Task T008: "Create searchSpotifyTrack function in lib/api/spotify-service.ts"
Task T009: "Create extractSpotifyUrl function in lib/api/spotify-service.ts"

# Then orchestration:
Task T010: "Create searchSpotifyForCarol function in lib/api/spotify-service.ts" (depends on T006, T008, T009)
Task T011: "Add error handling in searchSpotifyForCarol function" (depends on T010)

# Finally integration:
Task T012: "Update POST /api/dishes route handler in app/api/dishes/route.ts" (depends on T010, T011)
Task T013: "Update response type in app/api/dishes/route.ts" (depends on T012)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (environment variables)
2. Complete Phase 2: Foundational (types) - **CRITICAL - blocks all stories**
3. Complete Phase 3: User Story 1 (Spotify search integration)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Test with a country that has a carol (e.g., Italy)
   - Verify API response includes `spotifyUrl` field
   - Verify cache works (second request should be faster)
   - Test error scenarios (invalid credentials, network issues)
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
   - Spotify search works, URL returned in API
   - Can verify via API response JSON
3. Add User Story 2 → Test independently → Deploy/Demo
   - Spotify URL displayed on page
   - Users can click and open Spotify
4. Add Polish tasks → Final validation → Deploy

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Spotify service + API integration)
   - Developer B: Can start User Story 2 UI work (with mock data) in parallel
3. Stories complete and integrate:
   - US1 provides real Spotify URLs
   - US2 displays them in UI

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Important**: Only cache valid Spotify URLs (not null results) to allow retry on cache miss
- **Important**: Token refresh should be automatic and transparent (check expiration before use)
- **Important**: All Spotify API errors should be handled gracefully - never break cultural data display

---

## Task Summary

- **Total Tasks**: 27
- **Phase 1 (Setup)**: 2 tasks
- **Phase 2 (Foundational)**: 3 tasks
- **Phase 3 (User Story 1)**: 8 tasks
- **Phase 4 (User Story 2)**: 5 tasks
- **Phase 5 (Polish)**: 9 tasks

### Task Count per User Story

- **User Story 1 (P1)**: 8 tasks (T006-T013)
- **User Story 2 (P2)**: 5 tasks (T014-T018)

### Parallel Opportunities Identified

- Phase 1: 2 parallel tasks
- Phase 2: 3 parallel tasks
- Phase 3: Multiple parallel opportunities (token, search, extraction functions)
- Phase 4: Type updates can be parallel with display
- Phase 5: 9 parallel tasks

### Independent Test Criteria

- **User Story 1**: Can be tested by calling `/api/dishes` with a country that has a carol, verifying `spotifyUrl` is returned in response. Can mock Spotify API responses to test URL extraction logic.
- **User Story 2**: Can be tested by providing mock response data with `spotifyUrl` field and verifying UI displays it correctly. Does not require Spotify API to be working.

### Suggested MVP Scope

**MVP = User Story 1 only** (Phase 1 + Phase 2 + Phase 3)
- Setup environment variables
- Create types
- Implement Spotify search service
- Integrate with API route
- Verify Spotify URL is returned in API response

This provides the core functionality. User Story 2 (UI display) can be added as a follow-up increment.

