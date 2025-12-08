# Tasks: Dish Recipe Viewing

**Feature**: 009-dish-recipe-view  
**Branch**: `009-dish-recipe-view`  
**Date**: 2024-12-19  
**Spec**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Overview

This feature allows users to view step-by-step recipes for dishes by clicking on dish names. A tooltip appears on hover showing "View the recipe", and clicking opens a modal with the recipe displayed step-by-step. Recipes are generated using the selected search mode and cached independently per dish, country, and mode combination.

## Dependencies

**User Story Completion Order**:
1. **User Story 1** (P1): View Recipe for a Dish - **BLOCKING** for user experience (UI foundation)
2. **User Story 2** (P1): Recipe Generation with Selected Search Mode - **DEPENDS** on US1 (needs modal to display recipes)
3. **User Story 3** (P1): Recipe Caching for Performance - **DEPENDS** on US2 (needs recipe generation to cache)

**Parallel Execution Opportunities**:
- Type definitions and API request/response types can be done in parallel
- Recipe generation function and cache key function can be done in parallel
- Modal component and dish card updates can be done in parallel after types are defined
- API route implementation can be done in parallel with modal component

## Implementation Strategy

**MVP Scope**: User Story 1 + User Story 2 (Basic recipe viewing without caching)
- Enables basic recipe viewing functionality
- Caching can be added incrementally in US3
- Users can view recipes immediately

**Incremental Delivery**:
1. **Phase 1**: Type definitions and interfaces
2. **Phase 2**: Cache key function for recipes
3. **Phase 3**: Clickable dish names and modal UI (US1)
4. **Phase 4**: Recipe generation API and service (US2)
5. **Phase 5**: Recipe caching implementation (US3)
6. **Phase 6**: Polish and error handling

---

## Phase 1: Setup

**Goal**: Create type definitions and interfaces required for all user stories.

**Independent Test**: Types compile without errors, interfaces are accessible and properly typed.

### Tasks

- [ ] T001 Create RecipeStep interface in `lib/types/cultural-data.ts`
- [ ] T002 [P] Create Recipe interface in `lib/types/cultural-data.ts`
- [ ] T003 [P] Create RecipeApiRequest interface in `lib/types/cultural-data.ts`
- [ ] T004 [P] Create RecipeApiResponse union type in `lib/types/cultural-data.ts`
- [ ] T005 [P] Create RecipeModalProps interface in `lib/types/cultural-data.ts`
- [ ] T006 [P] Extend DishCardProps interface with onRecipeClick and selectedMode props in `lib/types/cultural-data.ts`

---

## Phase 2: Foundational

**Goal**: Create cache key generation function for recipes. This is a blocking prerequisite for recipe caching.

**Independent Test**: Cache key function generates correct keys with dish name, country, and mode, handles special characters appropriately.

### Tasks

- [ ] T007 Create getRecipeCacheKey function in `app/api/recipe/route.ts`
- [ ] T008 [P] Add JSDoc documentation for getRecipeCacheKey function in `app/api/recipe/route.ts`
- [ ] T009 [P] Implement cache key normalization (lowercase, space-to-hyphen) in `app/api/recipe/route.ts`

---

## Phase 3: User Story 1 - View Recipe for a Dish

**Story Goal**: Users can view recipes for dishes by clicking on dish names. Hover shows "View the recipe" tooltip, clicking opens modal with step-by-step instructions.

**Independent Test**: User can hover over dish name to see tooltip, click dish name to open modal, see recipe displayed, navigate steps, and close modal.

**Acceptance Criteria**:
- Dish names are clickable in dish cards
- "View the recipe" tooltip appears on hover
- Tooltip disappears when cursor moves away
- Clicking dish name opens modal
- Modal displays recipe with step-by-step format
- Modal can be closed by clicking outside or close button
- Step navigation works (Next/Previous buttons)

### Tasks

- [ ] T010 [US1] Create RecipeModal component file in `components/features/recipe-modal.tsx`
- [ ] T011 [US1] Implement RecipeModal component with HeroUI Modal in `components/features/recipe-modal.tsx`
- [ ] T012 [US1] Add step-by-step navigation state (currentStep) in RecipeModal component in `components/features/recipe-modal.tsx`
- [ ] T013 [US1] Implement step display with Next/Previous buttons in RecipeModal component in `components/features/recipe-modal.tsx`
- [ ] T014 [US1] Add loading state display (Santa loader) in RecipeModal component in `components/features/recipe-modal.tsx`
- [ ] T015 [US1] Add error state display with retry option in RecipeModal component in `components/features/recipe-modal.tsx`
- [ ] T016 [US1] Implement modal close handlers (backdrop click, close button) in RecipeModal component in `components/features/recipe-modal.tsx`
- [ ] T017 [US1] Update DishCard component to make dish name clickable in `components/features/dish-card.tsx`
- [ ] T018 [US1] Add HeroUI Tooltip component to dish name in DishCard component in `components/features/dish-card.tsx`
- [ ] T019 [US1] Implement onRecipeClick callback prop in DishCard component in `components/features/dish-card.tsx`
- [ ] T020 [US1] Add recipe modal state management to HomePage component in `app/page.tsx`
- [ ] T021 [US1] Add recipe loading state to HomePage component in `app/page.tsx`
- [ ] T022 [US1] Add recipe error state to HomePage component in `app/page.tsx`
- [ ] T023 [US1] Integrate RecipeModal component in HomePage component in `app/page.tsx`
- [ ] T024 [US1] Pass onRecipeClick handler to DishCard components in HomePage component in `app/page.tsx`
- [ ] T025 [US1] Pass selectedMode to DishCard components in HomePage component in `app/page.tsx`
- [ ] T026 [US1] Style RecipeModal to match existing UI patterns in `components/features/recipe-modal.tsx`

---

## Phase 4: User Story 2 - Recipe Generation with Selected Search Mode

**Story Goal**: Recipe generation uses the currently selected search mode (fast or detailed) and includes dish name and country name in the request. Recipes are formatted as multiple sequential steps.

**Independent Test**: Fast mode uses fast model, detailed mode uses detailed model, recipe request includes dish name and country, recipes are formatted as step-by-step instructions.

**Acceptance Criteria**:
- Fast mode uses fast mode model for recipe generation
- Detailed mode uses detailed mode model for recipe generation
- Recipe request includes dish name and country name
- Recipes are formatted as multiple sequential steps
- Fast mode recipes are concise but clear
- Detailed mode recipes are comprehensive with additional context

### Tasks

- [ ] T027 [US2] Create buildRecipePrompt function in `lib/api/openai-service.ts`
- [ ] T028 [US2] Implement recipe prompt with dish name and country name in buildRecipePrompt function in `lib/api/openai-service.ts`
- [ ] T029 [US2] Add JSON format specification to recipe prompt in buildRecipePrompt function in `lib/api/openai-service.ts`
- [ ] T030 [US2] Create queryRecipeForDish function in `lib/api/openai-service.ts`
- [ ] T031 [US2] Implement queryRecipeForDish to accept dish name, country, and model parameters in `lib/api/openai-service.ts`
- [ ] T032 [US2] Add OpenAI API call with JSON response format in queryRecipeForDish function in `lib/api/openai-service.ts`
- [ ] T033 [US2] Implement recipe response parsing in queryRecipeForDish function in `lib/api/openai-service.ts`
- [ ] T034 [US2] Create queryRecipeWithRetry function in `lib/api/openai-service.ts`
- [ ] T035 [US2] Implement queryRecipeWithRetry to accept dish name, country, and mode parameters in `lib/api/openai-service.ts`
- [ ] T036 [US2] Map mode to model using MODEL_MAP in queryRecipeWithRetry function in `lib/api/openai-service.ts`
- [ ] T037 [US2] Add retry logic to queryRecipeWithRetry function in `lib/api/openai-service.ts`
- [ ] T038 [US2] Create POST /api/recipe route handler in `app/api/recipe/route.ts`
- [ ] T039 [US2] Implement request body validation in POST /api/recipe route in `app/api/recipe/route.ts`
- [ ] T040 [US2] Extract country, dishName, and mode from request body in POST /api/recipe route in `app/api/recipe/route.ts`
- [ ] T041 [US2] Default mode to 'fast' if not provided in POST /api/recipe route in `app/api/recipe/route.ts`
- [ ] T042 [US2] Call queryRecipeWithRetry with dish name, country, and mode in POST /api/recipe route in `app/api/recipe/route.ts`
- [ ] T043 [US2] Return success response with recipe data in POST /api/recipe route in `app/api/recipe/route.ts`
- [ ] T044 [US2] Implement error handling in POST /api/recipe route in `app/api/recipe/route.ts`
- [ ] T045 [US2] Create fetchRecipe function in HomePage component in `app/page.tsx`
- [ ] T046 [US2] Implement fetchRecipe to call /api/recipe endpoint in HomePage component in `app/page.tsx`
- [ ] T047 [US2] Pass country, dishName, and selectedMode to fetchRecipe function in HomePage component in `app/page.tsx`
- [ ] T048 [US2] Connect dish name click handler to fetchRecipe function in HomePage component in `app/page.tsx`
- [ ] T049 [US2] Update recipe modal to display fetched recipe data in HomePage component in `app/page.tsx`

---

## Phase 5: User Story 3 - Recipe Caching for Performance

**Story Goal**: Recipes are cached using dish name, country, and mode combination. Cached recipes are returned immediately. Cache maintains independent entries per dish, country, and mode.

**Independent Test**: First recipe request generates and caches recipe, second request for same dish/country/mode returns cached recipe immediately, different modes or countries generate new recipes.

**Acceptance Criteria**:
- Recipes are cached using key that includes dish name, country, and mode
- Cached recipes are returned immediately (< 100ms)
- Fast and detailed modes maintain separate cache entries
- Same dish from different countries maintains separate cache entries
- Cache expires after TTL period (20 minutes)
- New recipes are generated when cache is expired or unavailable

### Tasks

- [ ] T050 [US3] Import cache utility in POST /api/recipe route in `app/api/recipe/route.ts`
- [ ] T051 [US3] Check cache for recipe using getRecipeCacheKey before generation in POST /api/recipe route in `app/api/recipe/route.ts`
- [ ] T052 [US3] Return cached recipe immediately if cache hit in POST /api/recipe route in `app/api/recipe/route.ts`
- [ ] T053 [US3] Generate recipe only if cache miss in POST /api/recipe route in `app/api/recipe/route.ts`
- [ ] T054 [US3] Cache generated recipe using getRecipeCacheKey after generation in POST /api/recipe route in `app/api/recipe/route.ts`
- [ ] T055 [US3] Set cache TTL to 20 minutes (1,200,000 ms) in POST /api/recipe route in `app/api/recipe/route.ts`
- [ ] T056 [US3] Verify cache key includes dish name, country, and mode in getRecipeCacheKey function in `app/api/recipe/route.ts`
- [ ] T057 [US3] Test cache isolation between fast and detailed modes (manual verification)
- [ ] T058 [US3] Test cache isolation between different countries (manual verification)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Goal**: Error handling, edge cases, accessibility, and user experience improvements.

**Independent Test**: All edge cases handled gracefully, error messages are user-friendly, modal is accessible, responsive design works on all devices.

### Tasks

- [ ] T059 Handle recipe generation failures gracefully in POST /api/recipe route in `app/api/recipe/route.ts`
- [ ] T060 Return user-friendly error messages in POST /api/recipe route in `app/api/recipe/route.ts`
- [ ] T061 Implement retry functionality in RecipeModal component error state in `components/features/recipe-modal.tsx`
- [ ] T062 Handle network errors during recipe fetch in HomePage component in `app/page.tsx`
- [ ] T063 Handle very long recipe responses with appropriate scrolling in RecipeModal component in `components/features/recipe-modal.tsx`
- [ ] T064 Handle special characters in dish names for cache keys in getRecipeCacheKey function in `app/api/recipe/route.ts`
- [ ] T065 Handle dishes without traditional recipes gracefully in queryRecipeWithRetry function in `lib/api/openai-service.ts`
- [ ] T066 Close existing modal when new dish name is clicked in HomePage component in `app/page.tsx`
- [ ] T067 Add keyboard navigation support to RecipeModal component in `components/features/recipe-modal.tsx`
- [ ] T068 Add ARIA labels for accessibility in RecipeModal component in `components/features/recipe-modal.tsx`
- [ ] T069 Verify responsive design on mobile, tablet, and desktop for RecipeModal component in `components/features/recipe-modal.tsx`
- [ ] T070 Add loading state feedback for long recipe generation times in RecipeModal component in `components/features/recipe-modal.tsx`
- [ ] T071 Verify step navigation buttons are disabled at first/last step in RecipeModal component in `components/features/recipe-modal.tsx`
- [ ] T072 Add JSDoc comments to all new functions in `lib/api/openai-service.ts`
- [ ] T073 Add JSDoc comments to POST /api/recipe route handler in `app/api/recipe/route.ts`
- [ ] T074 Verify all TypeScript types are properly exported in `lib/types/cultural-data.ts`

---

## Task Summary

**Total Tasks**: 74

**Tasks by Phase**:
- Phase 1 (Setup): 6 tasks
- Phase 2 (Foundational): 3 tasks
- Phase 3 (User Story 1): 17 tasks
- Phase 4 (User Story 2): 23 tasks
- Phase 5 (User Story 3): 9 tasks
- Phase 6 (Polish): 16 tasks

**Tasks by User Story**:
- User Story 1: 17 tasks
- User Story 2: 23 tasks
- User Story 3: 9 tasks
- Polish: 16 tasks

**Parallel Opportunities**:
- Phase 1: Types can be created in parallel (T002-T006)
- Phase 2: Documentation can be done in parallel with implementation (T008-T009)
- Phase 3: Modal component and DishCard updates can be done in parallel after types (T010-T026)
- Phase 4: Recipe generation functions and API route can be done in parallel (T027-T049)
- Phase 5: Cache implementation tasks can be done in parallel (T050-T058)

**Independent Test Criteria**:
- **US1**: Hover shows tooltip, click opens modal, recipe displays, steps navigate, modal closes
- **US2**: Fast mode uses fast model, detailed mode uses detailed model, recipes formatted as steps
- **US3**: First request caches, second request returns cached, different modes/countries generate new

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 + Phase 4 (Basic recipe viewing without caching)
- Enables complete recipe viewing functionality
- Caching can be added in Phase 5
- Total: 49 tasks for MVP

