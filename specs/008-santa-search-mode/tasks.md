# Tasks: Santa Search Response Mode Selection

**Feature**: 008-santa-search-mode  
**Branch**: `008-santa-search-mode`  
**Date**: 2024-12-19  
**Spec**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Overview

This feature allows users to choose between "Fast search" (gpt-3.5-turbo) and "Detective Santa" (o4-mini) response modes. Tasks are organized by user story to enable independent implementation and testing.

## Dependencies

**User Story Completion Order**:
1. **User Story 1** (P1): Choose Response Mode Before Search - **BLOCKING** for all other stories
2. **User Story 2** (P1): Receive Faster Response - Can be done in parallel with US3 after US1
3. **User Story 3** (P1): Receive Detailed Response - Can be done in parallel with US2 after US1
4. **User Story 4** (P1): Independent Caching - **DEPENDS** on US2 and US3 (cache key implementation)

**Parallel Execution Opportunities**:
- US2 and US3 can be implemented in parallel (same code paths, different models)
- Type definitions and model mapping can be done in parallel with UI component
- Cache key function update can be done in parallel with service layer changes

## Implementation Strategy

**MVP Scope**: User Story 1 + User Story 2 (Fast mode only)
- Enables basic mode selection and fast response
- Detailed mode can be added incrementally
- Cache isolation works for both modes once implemented

**Incremental Delivery**:
1. **Phase 1-2**: Types and foundational changes
2. **Phase 3**: Mode selector UI (US1)
3. **Phase 4**: Fast mode implementation (US2) - MVP complete
4. **Phase 5**: Detailed mode implementation (US3)
5. **Phase 6**: Cache isolation verification (US4)
6. **Phase 7**: Polish and integration

---

## Phase 1: Setup

**Goal**: Create type definitions and model mapping constants required for all user stories.

**Independent Test**: Types compile without errors, model mapping constant is accessible.

### Tasks

- [ ] T001 Create SearchMode type definition in `lib/types/cultural-data.ts`
- [ ] T002 [P] Create MODEL_MAP constant mapping SearchMode to OpenAI model names in `lib/api/openai-service.ts`
- [ ] T003 [P] Extend CulturalDataApiRequest interface with optional mode parameter in `lib/types/cultural-data.ts`

---

## Phase 2: Foundational

**Goal**: Update cache key generation function to support mode parameter. This is a blocking prerequisite for cache isolation.

**Independent Test**: Cache key function generates correct keys with mode parameter, maintains backward compatibility.

### Tasks

- [ ] T004 Update getCacheKey function to accept mode parameter in `app/api/cultural-data/route.ts`
- [ ] T005 [P] Add JSDoc documentation for updated getCacheKey function in `app/api/cultural-data/route.ts`

---

## Phase 3: User Story 1 - Choose Response Mode Before Search

**Story Goal**: Users can select between "Fast search" and "Detective Santa" modes before initiating a search. Default is "Fast search".

**Independent Test**: User can see mode selector, select a mode, see selection clearly indicated, change selection, and default is "Fast search".

**Acceptance Criteria**:
- Mode selector visible below country dropdown
- Two options: "Fast search" and "Detective Santa"
- Selected mode is clearly indicated
- User can change selection
- Default is "Fast search"
- Selection persists until changed or page refresh

### Tasks

- [ ] T006 [US1] Create SearchModeSelector component in `components/features/search-mode-selector.tsx`
- [ ] T007 [US1] Implement mode selection UI using HeroUI Select component in `components/features/search-mode-selector.tsx`
- [ ] T008 [US1] Add props interface SearchModeSelectorProps with selectedMode and onModeChange in `components/features/search-mode-selector.tsx`
- [ ] T009 [US1] Set default selected mode to 'fast' in SearchModeSelector component in `components/features/search-mode-selector.tsx`
- [ ] T010 [US1] Add selectedMode state to HomePage component in `app/page.tsx`
- [ ] T011 [US1] Integrate SearchModeSelector component below CountryDropdown in `app/page.tsx`
- [ ] T012 [US1] Connect SearchModeSelector onModeChange callback to update selectedMode state in `app/page.tsx`
- [ ] T013 [US1] Style SearchModeSelector to match existing UI patterns in `components/features/search-mode-selector.tsx`

---

## Phase 4: User Story 2 - Receive Faster Response with Basic Information

**Story Goal**: Users selecting "Fast search" mode receive results quickly using gpt-3.5-turbo model with concise but useful information.

**Independent Test**: Fast mode returns results noticeably faster than detailed mode, contains essential information (dish names, basic descriptions, carol names), and cached results return instantly.

**Acceptance Criteria**:
- Fast mode uses gpt-3.5-turbo model
- Results returned within expected faster timeframe
- Essential information present (dish names, basic descriptions, carol names)
- Descriptions are concise but informative
- Cached results return immediately

### Tasks

- [ ] T014 [US2] Update queryDishesAndCarolForCountry function to accept model parameter in `lib/api/openai-service.ts`
- [ ] T015 [US2] Update queryCulturalDataWithRetry function to accept mode parameter in `lib/api/openai-service.ts`
- [ ] T016 [US2] Map mode to model using MODEL_MAP in queryCulturalDataWithRetry function in `lib/api/openai-service.ts`
- [ ] T017 [US2] Update API route to extract mode parameter from request body in `app/api/cultural-data/route.ts`
- [ ] T018 [US2] Default mode to 'fast' if not provided in API route in `app/api/cultural-data/route.ts`
- [ ] T019 [US2] Pass mode parameter to queryCulturalDataWithRetry function in `app/api/cultural-data/route.ts`
- [ ] T020 [US2] Update cache key generation to include mode in API route in `app/api/cultural-data/route.ts`
- [ ] T021 [US2] Update fetchCulturalData function to include mode parameter in request body in `app/page.tsx`
- [ ] T022 [US2] Pass selectedMode state to fetchCulturalData function call in `app/page.tsx`

---

## Phase 5: User Story 3 - Receive Detailed Response with Comprehensive Information

**Story Goal**: Users selecting "Detective Santa" mode receive comprehensive results using o4-mini model with detailed descriptions and cultural context.

**Independent Test**: Detailed mode returns results with more comprehensive information (longer descriptions, more ingredients, cultural context), and cached results return instantly.

**Acceptance Criteria**:
- Detailed mode uses o4-mini model
- Results contain more comprehensive information than fast mode
- Detailed descriptions with cultural context
- More extensive ingredient lists
- Additional carol context (historical background, cultural significance)
- Cached results return immediately

### Tasks

- [ ] T023 [US3] Verify o4-mini model name is correct in MODEL_MAP constant in `lib/api/openai-service.ts`
- [ ] T024 [US3] Update MODEL_MAP to use correct detailed mode model name if needed in `lib/api/openai-service.ts`
- [ ] T025 [US3] Test detailed mode returns more comprehensive responses than fast mode (manual verification)

**Note**: Most implementation for US3 is shared with US2. The model selection logic already handles both modes. This phase focuses on verification and model name confirmation.

---

## Phase 6: User Story 4 - Independent Caching for Each Response Mode

**Story Goal**: Each response mode maintains separate cache entries, preventing cross-contamination between fast and detailed modes.

**Independent Test**: Searching same country in fast mode, then detailed mode, returns appropriate results for each mode. Both modes can have cached results simultaneously without interference.

**Acceptance Criteria**:
- Fast mode cache entries are independent from detailed mode
- Detailed mode cache entries are independent from fast mode
- Cache keys include both country and mode
- No cross-mode cache contamination
- Cache expiration is independent per mode

### Tasks

- [ ] T026 [US4] Verify cache key format includes mode: `cultural-data:{country}:{mode}` in `app/api/cultural-data/route.ts`
- [ ] T027 [US4] Test cache isolation: search same country in fast mode, verify cache key in `app/api/cultural-data/route.ts`
- [ ] T028 [US4] Test cache isolation: search same country in detailed mode, verify different cache key in `app/api/cultural-data/route.ts`
- [ ] T029 [US4] Test cache isolation: verify both modes can have cached results simultaneously in `app/api/cultural-data/route.ts`
- [ ] T030 [US4] Test cache isolation: verify fast mode doesn't return detailed mode cached data in `app/api/cultural-data/route.ts`
- [ ] T031 [US4] Test cache isolation: verify detailed mode doesn't return fast mode cached data in `app/api/cultural-data/route.ts`

**Note**: Cache isolation is primarily implemented in Phase 4 (T020). This phase focuses on verification and testing.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Final integration, error handling, loading states, and user experience improvements.

**Independent Test**: Complete end-to-end flow works, error handling is graceful, loading states are appropriate, and user experience is smooth.

### Tasks

- [ ] T032 Update error handling to handle mode-specific errors gracefully in `app/api/cultural-data/route.ts`
- [ ] T033 Add loading feedback that indicates detailed mode may take longer in `app/page.tsx`
- [ ] T034 Verify backward compatibility: API calls without mode parameter default to fast mode in `app/api/cultural-data/route.ts`
- [ ] T035 Test mode switching: user can change mode and search again with new mode in `app/page.tsx`
- [ ] T036 Verify mode selection persists during session until changed or page refresh in `app/page.tsx`
- [ ] T037 Add JSDoc comments for all new functions and components
- [ ] T038 Verify all TypeScript types are properly exported and imported
- [ ] T039 Test complete flow: select country → select mode → search → view results
- [ ] T040 Verify cache TTL is 20 minutes for both modes in `app/api/cultural-data/route.ts`
- [ ] T041 Test error scenarios: invalid mode, missing country, API failures

---

## Task Summary

**Total Tasks**: 41

**Tasks by Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 2 tasks
- Phase 3 (US1 - Mode Selection): 8 tasks
- Phase 4 (US2 - Fast Response): 9 tasks
- Phase 5 (US3 - Detailed Response): 3 tasks
- Phase 6 (US4 - Cache Isolation): 6 tasks
- Phase 7 (Polish): 10 tasks

**Tasks by User Story**:
- User Story 1: 8 tasks (T006-T013)
- User Story 2: 9 tasks (T014-T022)
- User Story 3: 3 tasks (T023-T025)
- User Story 4: 6 tasks (T026-T031)

**Parallel Opportunities**:
- T002 and T003 can be done in parallel (different files)
- T004 and T005 can be done in parallel (same file, different concerns)
- T006-T013 (US1) can be done in parallel with T014-T022 (US2) after Phase 1-2
- T023-T025 (US3) can be done in parallel with T026-T031 (US4) after Phase 4

**MVP Scope** (Phases 1-4):
- 22 tasks covering mode selection UI and fast response implementation
- Enables basic feature functionality
- Detailed mode and cache isolation verification can be added incrementally

---

## Notes

- All tasks follow the strict checklist format with Task ID, Story label (where applicable), and file paths
- Tasks are organized by user story to enable independent implementation and testing
- Dependencies are clearly marked (US1 blocks others, US4 depends on US2+US3)
- Parallel execution opportunities are identified with [P] markers
- MVP scope focuses on fast mode first, detailed mode can be added incrementally
- Cache isolation is primarily implemented in Phase 4, verified in Phase 6

