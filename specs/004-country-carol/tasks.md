# Tasks: Country Christmas Carol

**Input**: Design documents from `/specs/004-country-carol/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are deferred as per project requirements - no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Next.js 16 App Router structure
- API routes: `app/api/`
- Components: `components/features/`
- Services: `lib/api/`
- Types: `lib/types/`
- Utils: `lib/utils/` (reuse existing cache)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new dependencies or setup required - feature extends existing functionality

**Note**: This feature extends feature 003 and requires no new dependencies or setup. All infrastructure is already in place.

**Checkpoint**: Ready to proceed to foundational phase

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 Create TypeScript type definition for ChristmasCarol entity in `lib/types/dishes.ts` with name (string), author (string | null), country (string) fields
- [x] T002 [P] Create TypeScript type definition for CountryCulturalData in `lib/types/dishes.ts` with dishes (DishesResponse) and carol (ChristmasCarol | null) fields
- [x] T003 [P] Create TypeScript type definition for CountryCulturalApiSuccessResponse in `lib/types/dishes.ts` with success: true and data: CountryCulturalData
- [x] T004 [P] Create TypeScript type definition for CountryCulturalApiErrorResponse in `lib/types/dishes.ts` with success: false and error: { message: string }
- [x] T005 [P] Create TypeScript union type CountryCulturalApiResponse in `lib/types/dishes.ts` combining success and error responses
- [x] T006 Export all new types from `lib/types/dishes.ts` and verify `lib/types/index.ts` exports them (already exports from dishes module)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Include Christmas Carol in LLM Query (Priority: P1) 🎯 MVP

**Goal**: Extend existing OpenAI service to include Christmas carol in the same LLM request as dishes. Update prompt structure, parsing, and validation to handle combined dishes and carol response.

**Independent Test**: Select a country, trigger the query, and verify the system returns dishes and a Christmas carol with name and optional author. Can use a mock LLM response to verify carol data extraction logic.

### Implementation for User Story 1

- [x] T007 [US1] Update `buildDishPrompt` function in `lib/api/openai-service.ts` to `buildCombinedPrompt` that includes both dishes and carol requests in single prompt
- [x] T008 [US1] Update `buildRefinedDishPrompt` function in `lib/api/openai-service.ts` to `buildRefinedCombinedPrompt` that includes both dishes and carol requirements in refined prompt
- [x] T009 [US1] Update `parseDishResponse` function in `lib/api/openai-service.ts` to `parseCombinedResponse` that parses both dishes and carol from OpenAI JSON response string
- [x] T010 [US1] Implement `parseCarolData` function in `lib/api/openai-service.ts` that extracts and validates ChristmasCarol object from parsed JSON
- [x] T011 [US1] Implement `validateCarolData` function in `lib/api/openai-service.ts` that validates ChristmasCarol has non-empty name and optional author
- [x] T012 [US1] Update `validateDishData` function in `lib/api/openai-service.ts` to `validateCombinedData` that validates both dishes (at least one non-null category) and/or carol (non-empty name if present)
- [x] T013 [US1] Update `queryDishesWithRetry` function in `lib/api/openai-service.ts` to `queryDishesAndCarolWithRetry` that uses combined prompt and returns CountryCulturalData
- [x] T014 [US1] Update error handling in `lib/api/openai-service.ts` to handle carol-specific errors gracefully (same user-friendly messages as dishes)
- [x] T015 [US1] Update API route handler in `app/api/dishes/route.ts` POST function to use `queryDishesAndCarolWithRetry` instead of `queryDishesWithRetry`
- [x] T016 [US1] Update cache check logic in `app/api/dishes/route.ts` POST handler to retrieve and return CountryCulturalData instead of DishesResponse
- [x] T017 [US1] Update cache storage logic in `app/api/dishes/route.ts` POST handler to store CountryCulturalData instead of DishesResponse (same 20-minute TTL)
- [x] T018 [US1] Update error response handling in `app/api/dishes/route.ts` POST handler to handle missing carol gracefully (dishes still returned if valid)
- [x] T019 [US1] Update JSDoc comments in `lib/api/openai-service.ts` for all modified functions explaining combined dishes and carol functionality
- [x] T020 [US1] Update JSDoc comments in `app/api/dishes/route.ts` POST handler explaining combined response structure and carol handling

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. API endpoint should return dishes and carol for a country with proper caching and error handling.

---

## Phase 4: User Story 2 - Display Christmas Carol Information (Priority: P2)

**Goal**: Update home page to display Christmas carol information alongside dishes, showing carol name and author (when available) in JSON format.

**Independent Test**: Provide mock carol data and verify the UI displays the carol name and author (when available) alongside dish information. Test verifies layout and information presentation without requiring LLM integration.

### Implementation for User Story 2

- [x] T021 [US2] Update state management in `app/page.tsx` to use CountryCulturalData instead of DishesResponse for dishes data state
- [x] T022 [US2] Update `fetchDishes` function in `app/page.tsx` to handle CountryCulturalData response structure with dishes and carol fields
- [x] T023 [US2] Update JSON display section in `app/page.tsx` to render CountryCulturalData as formatted JSON including both dishes and carol
- [x] T024 [US2] Implement conditional rendering in `app/page.tsx` to display carol information when carol is non-null, showing name and author (when available)
- [x] T025 [US2] Implement graceful handling in `app/page.tsx` for missing carol (carol is null) - display dishes only without error
- [x] T026 [US2] Update error state display in `app/page.tsx` to handle combined errors (dishes and carol) with user-friendly messages
- [x] T027 [US2] Verify loading state display in `app/page.tsx` works correctly for combined dishes and carol query (same as before)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Home page should display JSON content with both dishes and carol after query completes.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T028 [P] Update `README.md` in project root to document Christmas carol feature extension
- [x] T029 [P] Update API endpoint documentation in `README.md` to reflect combined dishes and carol response structure
- [x] T030 [P] Verify all TypeScript types are properly exported and imported across modules
- [x] T031 [P] Run `npm run lint` to check for linting errors and fix any issues
- [x] T032 [P] Verify code follows project constitution principles (modular architecture, code readability, user-centric design)
- [ ] T033 [P] Test cache expiration behavior: wait 20+ minutes and verify fresh data is fetched (dishes and carol) - MANUAL TEST REQUIRED
- [ ] T034 [P] Test retry logic: simulate invalid response and verify refined query is attempted (includes carol requirements) - MANUAL TEST REQUIRED
- [ ] T035 [P] Test error scenarios: rate limits, service unavailable, missing carol (dishes still displayed) - MANUAL TEST REQUIRED
- [ ] T036 [P] Verify carol display works correctly for carols with author vs without author (null) - MANUAL TEST REQUIRED
- [ ] T037 [P] Verify missing carol handling: countries without famous carols display dishes only - MANUAL TEST REQUIRED
- [ ] T038 [P] Run quickstart.md validation to ensure all setup steps work correctly - MANUAL TEST REQUIRED

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - no setup needed (extends existing feature)
- **Foundational (Phase 2)**: No dependencies - can start immediately
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories proceed sequentially in priority order (P1 → P2)
  - US2 depends on US1 (needs API endpoint with carol from US1)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 completion (needs API endpoint with carol from US1)

### Within Each User Story

- Type definitions before service implementation
- Service implementation before API route
- API route before UI integration
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 2**: T002, T003, T004, T005 can run in parallel (all type definitions in same file but different exports)
- **Phase 3 (US1)**: 
  - T010, T011 can run in parallel (different parsing/validation functions)
- **Phase 5**: Most polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch parsing/validation functions in parallel:
Task: "Implement parseCarolData function in lib/api/openai-service.ts"
Task: "Implement validateCarolData function in lib/api/openai-service.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (create type definitions)
2. Complete Phase 3: User Story 1 (update OpenAI service and API route)
3. **STOP and VALIDATE**: Test API endpoint independently with curl/Postman
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational → Foundation ready
2. Add User Story 1 → Test API independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test display independently → Deploy/Demo
4. Each story adds value without breaking previous stories

### Sequential Strategy (Recommended)

With single developer or limited capacity:

1. Complete Foundational together
2. Complete User Story 1 (P1) → Test → Deploy
3. Complete User Story 2 (P2) → Test → Deploy
4. Complete Polish phase → Final validation

---

## Notes

- [P] tasks = different files or functions, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- This feature extends feature 003 - modifies existing files rather than creating new ones
- Cache utility from feature 002 is reused - no changes needed
- OpenAI API key already configured from feature 003
- All error messages should be user-friendly (no technical jargon)
- Only valid responses are cached (invalid/malformed responses trigger retry, not cache)
- Carol information cached together with dishes in same cache entry

---

## Task Summary

**Total Tasks**: 38

**Tasks per Phase**:
- Phase 1 (Setup): 0 tasks (no setup needed - extends existing feature)
- Phase 2 (Foundational): 6 tasks
- Phase 3 (User Story 1): 14 tasks
- Phase 4 (User Story 2): 7 tasks
- Phase 5 (Polish): 11 tasks

**Tasks per User Story**:
- User Story 1: 14 tasks
- User Story 2: 7 tasks

**Parallel Opportunities Identified**: 
- Phase 2: 4 parallel tasks (T002-T005)
- Phase 3: 2 parallel opportunities (parsing/validation functions)
- Phase 5: Most tasks can run in parallel

**Independent Test Criteria**:
- **US1**: API endpoint returns dishes and carol for country, handles caching, retry, and errors
- **US2**: UI displays JSON content correctly with carol information alongside dishes

**Suggested MVP Scope**: Phase 2 + Phase 3 (User Story 1 only) = 20 tasks

**Format Validation**: ✅ All tasks follow checklist format with checkbox, ID, optional [P] marker, optional [Story] label, and file paths

