# Tasks: Country Famous Dishes

**Input**: Design documents from `/specs/003-country-dishes/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are deferred as per project requirements - no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
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

**Purpose**: Project initialization and dependency installation

- [x] T001 Install OpenAI SDK package by running `npm install openai` in project root
- [x] T002 Create `.env.local` file in project root with `OPENAI_API_KEY` placeholder (if not exists)
- [x] T003 [P] Create `.env.sample` file in project root with example environment variable `OPENAI_API_KEY=sk-your-api-key-here` as documentation
- [x] T004 [P] Add `.env.local` to `.gitignore` if not already present to prevent committing API keys

**Checkpoint**: Dependencies installed and environment variable configured

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create TypeScript type definitions for Dish entity in `lib/types/dishes.ts` with name, description, ingredients, type, country fields
- [x] T006 [P] Create TypeScript type definitions for DishesResponse in `lib/types/dishes.ts` with entry, main, dessert fields (each Dish | null)
- [x] T007 [P] Create TypeScript type definitions for DishesApiRequest in `lib/types/dishes.ts` with country field
- [x] T008 [P] Create TypeScript type definitions for DishesApiSuccessResponse and DishesApiErrorResponse in `lib/types/dishes.ts`
- [x] T009 [P] Create TypeScript union type DishesApiResponse in `lib/types/dishes.ts` combining success and error responses
- [x] T010 Export all dish types from `lib/types/dishes.ts` and update `lib/types/index.ts` to export from dishes module

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Query LLM for Famous Dishes by Country (Priority: P1) 🎯 MVP

**Goal**: Query OpenAI to retrieve famous dishes for a selected country, categorize them by type (entry, main, dessert), and return one dish per available category with caching and retry logic.

**Independent Test**: Select a country, trigger the dish search, and verify the system returns dishes (one entry, one main, one dessert, or fewer if not all categories are found) with their details. Can use a mock OpenAI response to verify categorization and data extraction.

### Implementation for User Story 1

- [x] T011 [US1] Create OpenAI service module in `lib/api/openai-service.ts` with function to initialize OpenAI client using `OPENAI_API_KEY` environment variable
- [x] T012 [US1] Implement `buildDishPrompt` function in `lib/api/openai-service.ts` that creates structured prompt with explicit JSON format requirements for country dishes
- [x] T013 [US1] Implement `buildRefinedDishPrompt` function in `lib/api/openai-service.ts` that creates refined prompt with more explicit format requirements for retry scenarios
- [x] T014 [US1] Implement `queryDishesForCountry` function in `lib/api/openai-service.ts` that calls OpenAI API with structured prompt and returns parsed JSON response
- [x] T015 [US1] Implement `parseDishResponse` function in `lib/api/openai-service.ts` that parses OpenAI JSON response string into DishesResponse type
- [x] T016 [US1] Implement `validateDishData` function in `lib/api/openai-service.ts` that validates DishesResponse has at least one non-null category and all non-null dishes have required fields
- [x] T017 [US1] Implement `queryDishesWithRetry` function in `lib/api/openai-service.ts` that attempts query, validates response, and retries with refined prompt if invalid (max 1 retry)
- [x] T018 [US1] Add error handling in `lib/api/openai-service.ts` for OpenAI API errors (rate limits, timeouts, service unavailable) with user-friendly error messages
- [x] T019 [US1] Create API route handler in `app/api/dishes/route.ts` that exports POST function to handle dish queries
- [x] T020 [US1] Implement request validation in `app/api/dishes/route.ts` POST handler to validate country parameter is present and non-empty
- [x] T021 [US1] Implement cache check logic in `app/api/dishes/route.ts` POST handler using existing cache utility with key pattern `dishes:{countryName}` and 20-minute TTL
- [x] T022 [US1] Implement cache hit response in `app/api/dishes/route.ts` POST handler that returns cached DishesResponse if valid and not expired
- [x] T023 [US1] Implement OpenAI query logic in `app/api/dishes/route.ts` POST handler that calls `queryDishesWithRetry` when cache miss or expired
- [x] T024 [US1] Implement cache storage logic in `app/api/dishes/route.ts` POST handler that stores valid DishesResponse in cache with 20-minute TTL (only if validation passes)
- [x] T025 [US1] Implement error response handling in `app/api/dishes/route.ts` POST handler for no dishes found, rate limits, service unavailable, and invalid responses after retry
- [x] T026 [US1] Add JSDoc comments to all functions in `lib/api/openai-service.ts` explaining purpose, parameters, and return values
- [x] T027 [US1] Add JSDoc comments to POST handler in `app/api/dishes/route.ts` explaining request flow, caching, and error handling

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. API endpoint should return dishes for a country with proper caching and error handling.

---

## Phase 4: User Story 2 - Display Dishes Organized by Type (Priority: P2)

**Goal**: Display famous dishes for selected country in organized layout, showing one dish per available type (entry, main, dessert) with name, description, and ingredients list. Display first 8 ingredients followed by "There's more!" if list exceeds 8 items.

**Independent Test**: Provide mock dish data and verify the UI displays sections for each available category, each showing dish name, description, and ingredients list with truncation if applicable. Test verifies layout and information presentation without requiring LLM integration.

### Implementation for User Story 2

- [x] T028 [US2] Add state management in `app/page.tsx` for dishes data (DishesResponse | null), loading state (boolean), and error state (string | null)
- [x] T029 [US2] Implement `fetchDishes` function in `app/page.tsx` that calls POST `/api/dishes` endpoint with selected country and handles response
- [x] T030 [US2] Implement loading state display in `app/page.tsx` that shows loading indicator while querying OpenAI API
- [x] T031 [US2] Implement error state display in `app/page.tsx` that shows user-friendly error message when dish query fails
- [x] T032 [US2] Implement JSON display section in `app/page.tsx` that renders DishesResponse as formatted JSON using `<pre>` tag with `JSON.stringify(data, null, 2)`
- [x] T033 [US2] Implement conditional rendering in `app/page.tsx` that displays JSON only when dishes data is available, shows loading during fetch, and shows error on failure
- [x] T034 [US2] Add ingredient truncation utility function in `app/page.tsx` or separate utility that returns first 8 ingredients plus "There's more!" message if list exceeds 8 items
- [x] T035 [US2] Update JSON display in `app/page.tsx` to apply ingredient truncation when rendering dishes data (for future UI enhancement, keep in JSON for now)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Home page should display JSON content after dish query completes.

---

## Phase 5: User Story 3 - Integration with Country Selection (Priority: P3)

**Goal**: Integrate dish search with existing country selection dropdown and Santa Search button. When user selects country and clicks button, trigger dish query and display results on same page.

**Independent Test**: Select a country from dropdown, click action button, and verify dish search is triggered with correct country name. Test verifies integration between components without requiring full LLM functionality.

### Implementation for User Story 3

- [x] T036 [US3] Update `SantaSearchButton` component in `components/features/santa-search-button.tsx` to accept `onSearch` callback prop that receives country name
- [x] T037 [US3] Update `handleClick` function in `components/features/santa-search-button.tsx` to call `onSearch` callback with selected country when button is clicked
- [x] T038 [US3] Update home page in `app/page.tsx` to pass `handleDishSearch` function to `SantaSearchButton` component via `onSearch` prop
- [x] T039 [US3] Implement `handleDishSearch` function in `app/page.tsx` that clears previous results, sets loading state, and calls `fetchDishes` with selected country
- [x] T040 [US3] Update home page in `app/page.tsx` to clear previous dish results when new search is initiated (set dishes data to null before new fetch)
- [x] T041 [US3] Verify `SantaSearchButton` remains disabled when no country is selected in `components/features/santa-search-button.tsx` (existing behavior should be maintained)
- [x] T042 [US3] Test full integration flow: select country → click Santa Search → verify API call → verify JSON display → verify loading and error states

**Checkpoint**: All user stories should now be independently functional. Full user journey from country selection to dish display should work end-to-end.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T043 [P] Update `README.md` in project root to document OpenAI API key configuration requirement
- [x] T044 [P] Add environment variable documentation in `README.md` explaining `OPENAI_API_KEY` setup and reference to `.env.sample` file
- [x] T045 [P] Verify all TypeScript types are properly exported and imported across modules
- [x] T046 [P] Run `npm run lint` to check for linting errors and fix any issues
- [x] T047 [P] Verify code follows project constitution principles (modular architecture, code readability, user-centric design)
- [ ] T048 [P] Test cache expiration behavior: wait 20+ minutes and verify fresh data is fetched - MANUAL TEST REQUIRED
- [ ] T049 [P] Test retry logic: simulate invalid response and verify refined query is attempted - MANUAL TEST REQUIRED
- [ ] T050 [P] Test error scenarios: rate limits, service unavailable, no dishes found - MANUAL TEST REQUIRED
- [x] T051 [P] Verify ingredient truncation logic works correctly for lists with 8 or fewer items vs more than 8 items
- [ ] T052 [P] Run quickstart.md validation to ensure all setup steps work correctly - MANUAL TEST REQUIRED

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed sequentially in priority order (P1 → P2 → P3)
  - US2 depends on US1 (needs API endpoint)
  - US3 depends on US1 and US2 (needs API and display)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 completion (needs API endpoint from US1)
- **User Story 3 (P3)**: Depends on US1 and US2 completion (needs API endpoint and display from previous stories)

### Within Each User Story

- Type definitions before service implementation
- Service implementation before API route
- API route before UI integration
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T002 and T003 can run in parallel (different files)
- **Phase 2**: T005, T006, T007, T008 can run in parallel (all type definitions in same file but different exports)
- **Phase 3 (US1)**: 
  - T011, T012 can run in parallel (different prompt functions)
  - T014, T015 can run in parallel (different parsing/validation functions)
- **Phase 6**: Most polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch prompt building functions in parallel:
Task: "Implement buildDishPrompt function in lib/api/openai-service.ts"
Task: "Implement buildRefinedDishPrompt function in lib/api/openai-service.ts"

# Launch parsing/validation functions in parallel:
Task: "Implement parseDishResponse function in lib/api/openai-service.ts"
Task: "Implement validateDishData function in lib/api/openai-service.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (install OpenAI SDK, configure env)
2. Complete Phase 2: Foundational (create type definitions)
3. Complete Phase 3: User Story 1 (OpenAI service + API route)
4. **STOP and VALIDATE**: Test API endpoint independently with curl/Postman
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test API independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test display independently → Deploy/Demo
4. Add User Story 3 → Test integration independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Sequential Strategy (Recommended)

With single developer or limited capacity:

1. Complete Setup + Foundational together
2. Complete User Story 1 (P1) → Test → Deploy
3. Complete User Story 2 (P2) → Test → Deploy
4. Complete User Story 3 (P3) → Test → Deploy
5. Complete Polish phase → Final validation

---

## Notes

- [P] tasks = different files or functions, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Cache utility from feature 002 is reused - no need to recreate
- OpenAI API key must be set in `.env.local` before testing
- All error messages should be user-friendly (no technical jargon)
- Only valid responses are cached (invalid/malformed responses trigger retry, not cache)

---

## Task Summary

**Total Tasks**: 52

**Tasks per Phase**:
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 6 tasks
- Phase 3 (User Story 1): 17 tasks
- Phase 4 (User Story 2): 8 tasks
- Phase 5 (User Story 3): 7 tasks
- Phase 6 (Polish): 10 tasks

**Tasks per User Story**:
- User Story 1: 17 tasks
- User Story 2: 8 tasks
- User Story 3: 7 tasks

**Parallel Opportunities Identified**: 
- Phase 1: 2 parallel tasks (T003, T004)
- Phase 2: 4 parallel tasks (T006-T009)
- Phase 3: 4 parallel opportunities (prompt functions, parsing/validation functions)
- Phase 6: Most tasks can run in parallel

**Independent Test Criteria**:
- **US1**: API endpoint returns dishes for country, handles caching, retry, and errors
- **US2**: UI displays JSON content correctly with loading and error states
- **US3**: Full integration flow works from country selection to dish display

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 27 tasks

**Format Validation**: ✅ All tasks follow checklist format with checkbox, ID, optional [P] marker, optional [Story] label, and file paths

