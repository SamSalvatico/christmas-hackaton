# Tasks: Countries Searchable Dropdown

**Input**: Design documents from `/specs/002-countries-dropdown/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Testing is deferred as per project requirements - no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify Next.js 16 project structure exists (extends feature 001)
- [x] T002 [P] Verify HeroUI dependencies are installed in package.json
- [x] T003 [P] Verify TypeScript strict mode configuration in tsconfig.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create TypeScript type definitions for countries API in lib/types/countries.ts
- [x] T005 [P] Create in-memory cache utility with TTL support in lib/utils/cache.ts
- [x] T006 [P] Verify HeroUIProvider is configured in app/layout.tsx (from feature 001)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Countries List API with Server-Side Caching (Priority: P1) 🎯 MVP

**Goal**: Provide a Next.js API endpoint that fetches country names from REST Countries API, caches them server-side for 10 minutes, and returns an array of country names.

**Independent Test**: Call `GET /api/countries` and verify it returns `{ success: true, data: string[] }`. On first call, it should fetch from REST Countries API. On subsequent calls within 10 minutes, it should return cached data without external API calls.

### Implementation for User Story 1

- [x] T007 [US1] Implement cache get/set methods with TTL expiration check in lib/utils/cache.ts
- [x] T008 [US1] Implement REST Countries API fetch function with error handling in app/api/countries/route.ts
- [x] T009 [US1] Implement data transformation to extract name.common from REST Countries API response in app/api/countries/route.ts
- [x] T010 [US1] Implement cache check logic (valid/expired/missing) in app/api/countries/route.ts
- [x] T011 [US1] Implement GET /api/countries route handler with success response format in app/api/countries/route.ts
- [x] T012 [US1] Implement error handling with user-friendly messages and cache fallback in app/api/countries/route.ts
- [x] T013 [US1] Add timeout handling (10 seconds) for REST Countries API calls in app/api/countries/route.ts
- [x] T014 [US1] Add JSDoc comments for API route handler functions in app/api/countries/route.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. You can call `GET /api/countries` and receive country names with caching.

---

## Phase 4: User Story 2 - Searchable Country Dropdown on Home Page (Priority: P2)

**Goal**: Display a searchable HeroUI dropdown on the home page that automatically populates with countries from the API and allows users to search/filter countries using case-insensitive partial matching.

**Independent Test**: Load the home page, verify the dropdown appears and is populated with countries, and test the search/filter functionality to find specific countries in the list. Search should work with case-insensitive partial matching (ilike).

### Implementation for User Story 2

- [x] T015 [US2] Create CountryDropdown component with HeroUI Select in components/features/country-dropdown.tsx
- [x] T016 [US2] Implement client-side fetch of countries from /api/countries on component mount in components/features/country-dropdown.tsx
- [x] T017 [US2] Implement loading state display while fetching countries in components/features/country-dropdown.tsx
- [x] T018 [US2] Implement error state display with user-friendly error message in components/features/country-dropdown.tsx
- [x] T019 [US2] Implement case-insensitive partial matching filter function (ilike) in components/features/country-dropdown.tsx
- [x] T020 [US2] Implement real-time search filtering as user types in components/features/country-dropdown.tsx
- [x] T021 [US2] Integrate CountryDropdown component into home page in app/page.tsx
- [x] T022 [US2] Add empty state message when no countries match search in components/features/country-dropdown.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. The home page displays a searchable dropdown populated with countries.

---

## Phase 5: User Story 3 - Country Selection and Santa Search Action (Priority: P3)

**Goal**: Allow users to select a country from the dropdown and click a "Santa Search" button that logs the selected country to the browser console (placeholder for future functionality).

**Independent Test**: Select a country from the dropdown, verify the "Santa Search" button is enabled, click the button, and verify the selected country name is logged to the browser console.

### Implementation for User Story 3

- [x] T023 [US3] Implement country selection state management in components/features/country-dropdown.tsx
- [x] T024 [US3] Create SantaSearchButton component with disabled state when no country selected in components/features/santa-search-button.tsx
- [x] T025 [US3] Implement console.log action for selected country in components/features/santa-search-button.tsx
- [x] T026 [US3] Integrate SantaSearchButton component into home page next to CountryDropdown in app/page.tsx
- [x] T027 [US3] Connect country selection from dropdown to SantaSearchButton component in app/page.tsx
- [x] T028 [US3] Add visual feedback when country is selected (dropdown shows selected value) in components/features/country-dropdown.tsx

**Checkpoint**: All user stories should now be independently functional. Users can search countries, select one, and trigger the "Santa Search" action.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T029 [P] Add JSDoc comments for all component props and functions in components/features/country-dropdown.tsx
- [x] T030 [P] Add JSDoc comments for all component props and functions in components/features/santa-search-button.tsx
- [x] T031 [P] Verify TypeScript strict mode compliance across all new files
- [x] T032 [P] Verify error messages are user-friendly (not technical) across all components
- [x] T033 [P] Verify accessibility (keyboard navigation, ARIA) works with HeroUI components
- [x] T034 [P] Run quickstart.md validation scenarios
- [x] T035 [P] Verify performance: API response <1s with cache, dropdown populated within 2 seconds

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed sequentially in priority order (P1 → P2 → P3)
  - US2 depends on US1 (needs API endpoint)
  - US3 depends on US2 (needs dropdown)
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Must start after US1 is complete - Depends on `/api/countries` endpoint
- **User Story 3 (P3)**: Must start after US2 is complete - Depends on CountryDropdown component

### Within Each User Story

- Types before implementation
- Cache utility before API route
- API route before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T002 and T003 can run in parallel (different files)
- **Phase 2**: T005 and T006 can run in parallel (different files)
- **Phase 3 (US1)**: T007, T008, T009 can be worked on in parallel (different concerns)
- **Phase 4 (US2)**: T015, T016, T017, T018 can be worked on in parallel (different features)
- **Phase 5 (US3)**: T023, T024 can be worked on in parallel (different components)
- **Phase 6**: All tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch foundational tasks in parallel:
Task: "Create in-memory cache utility with TTL support in lib/utils/cache.ts"
Task: "Verify HeroUIProvider is configured in app/layout.tsx"

# Launch US1 implementation tasks (after foundational):
Task: "Implement cache get/set methods with TTL expiration check in lib/utils/cache.ts"
Task: "Implement REST Countries API fetch function with error handling in app/api/countries/route.ts"
Task: "Implement data transformation to extract name.common from REST Countries API response in app/api/countries/route.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently by calling `GET /api/countries`
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently (API endpoint works) → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently (dropdown works) → Deploy/Demo
4. Add User Story 3 → Test independently (selection and button work) → Deploy/Demo
5. Each story adds value without breaking previous stories

### Sequential Implementation (Recommended)

With single developer or small team:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Complete User Story 1 (API endpoint)
   - Then complete User Story 2 (Dropdown)
   - Then complete User Story 3 (Selection & Button)
3. Stories complete sequentially, each building on the previous

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Testing is deferred - focus on manual testing and validation
- All error messages must be user-friendly (not technical)
- Search filtering must use case-insensitive partial matching (ilike)
- Cache TTL must be exactly 10 minutes (600,000 milliseconds)

---

## Task Summary

- **Total Tasks**: 35
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 3 tasks
- **Phase 3 (US1 - MVP)**: 8 tasks
- **Phase 4 (US2)**: 8 tasks
- **Phase 5 (US3)**: 6 tasks
- **Phase 6 (Polish)**: 7 tasks

**Suggested MVP Scope**: Phases 1-3 (User Story 1 only) - provides working API endpoint with caching.

