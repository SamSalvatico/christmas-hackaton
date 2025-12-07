# Tasks: Improve API Naming

**Input**: Design documents from `/specs/006-improve-api-naming/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL and not included in this feature (as per project requirements).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Next.js 16 App Router structure
- Paths: `app/`, `lib/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare for refactoring by identifying all files and references that need updating

- [ ] T001 [P] Search codebase for all references to `/api/dishes` endpoint URL in `app/` directory
- [ ] T002 [P] Search codebase for all references to `DishesApiRequest`, `DishesApiResponse`, `CountryCulturalApiResponse` type names in `lib/` and `app/` directories
- [ ] T003 [P] Search codebase for all references to `queryDishesAndCarolWithRetry` function name in `lib/` and `app/` directories
- [ ] T004 [P] Search codebase for all imports from `@/lib/types/dishes` in `lib/` and `app/` directories
- [ ] T005 Create backup branch or ensure git commit before starting refactoring

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create new file structure and prepare for renaming - MUST be complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create new directory `app/api/cultural-data/` for new route file
- [ ] T007 [P] Create new route file `app/api/cultural-data/route.ts` by copying content from `app/api/dishes/route.ts`
- [ ] T008 [P] Create new type file `lib/types/cultural-data.ts` by copying content from `lib/types/dishes.ts`

**Checkpoint**: Foundation ready - new files created, ready for renaming work

---

## Phase 3: User Story 1 - Rename API Endpoint to Reflect Data Content (Priority: P1) 🎯 MVP

**Goal**: Rename API endpoint from `/api/dishes` to `/api/cultural-data` and update route file, maintaining backward compatibility with old endpoint.

**Independent Test**: Can be fully tested by verifying the new endpoint `/api/cultural-data` exists and returns the same data structure as before. Test that requests to the new endpoint return cultural data (dishes, carol, spotifyUrl) with the same structure and behavior.

### Implementation for User Story 1

- [ ] T009 [US1] Update route handler documentation comments in `app/api/cultural-data/route.ts` to reflect new endpoint name `/api/cultural-data` and that it returns cultural data
- [ ] T010 [US1] Update route handler function comments in `app/api/cultural-data/route.ts` to use "cultural data" terminology instead of "dishes"
- [ ] T011 [US1] Update cache key function comments in `app/api/cultural-data/route.ts` to reflect cultural data (already uses "cultural-data" in key, just update comments)
- [ ] T012 [US1] Update error messages in `app/api/cultural-data/route.ts` to use "cultural data" terminology instead of "dishes" where appropriate
- [ ] T013 [US1] Update frontend code in `app/page.tsx` to call new endpoint `/api/cultural-data` instead of `/api/dishes` in the fetch call
- [ ] T014 [US1] Update frontend function comment in `app/page.tsx` to reflect it fetches cultural data, not just dishes
- [ ] T015 [US1] Maintain backward compatibility by keeping old route file `app/api/dishes/route.ts` that imports handler from new route or shows deprecation notice
- [ ] T016 [US1] Test new endpoint `/api/cultural-data` returns same data structure as old endpoint
- [ ] T017 [US1] Test old endpoint `/api/dishes` still works (backward compatibility)

**Checkpoint**: At this point, User Story 1 should be fully functional. The new endpoint `/api/cultural-data` works and returns cultural data, and the old endpoint still works for backward compatibility.

---

## Phase 4: User Story 2 - Update Type Names to Match API Purpose (Priority: P2)

**Goal**: Rename TypeScript types from `DishesApiRequest`, `CountryCulturalApiResponse`, etc. to `CulturalDataApiRequest`, `CulturalDataApiResponse`, etc. to reflect cultural data API.

**Independent Test**: Can be fully tested by verifying TypeScript types compile correctly with new names and that all references to old type names are updated. The test verifies type safety and consistency without requiring the API endpoint to be working.

### Implementation for User Story 2

- [ ] T018 [P] [US2] Rename `DishesApiRequest` to `CulturalDataApiRequest` in `lib/types/cultural-data.ts` and update JSDoc comment
- [ ] T019 [P] [US2] Rename `CountryCulturalApiResponse` to `CulturalDataApiResponse` in `lib/types/cultural-data.ts` and update JSDoc comment
- [ ] T020 [P] [US2] Rename `CountryCulturalApiSuccessResponse` to `CulturalDataApiSuccessResponse` in `lib/types/cultural-data.ts` and update JSDoc comment
- [ ] T021 [P] [US2] Rename `CountryCulturalApiErrorResponse` to `CulturalDataApiErrorResponse` in `lib/types/cultural-data.ts` and update JSDoc comment
- [ ] T022 [P] [US2] Rename `DishesApiErrorResponse` to `CulturalDataApiErrorResponse` in `lib/types/cultural-data.ts` (if still exists) and update JSDoc comment
- [ ] T023 [US2] Update file header comment in `lib/types/cultural-data.ts` to reflect it contains cultural data types, not just dishes types
- [ ] T024 [US2] Update type export in `lib/types/index.ts` to export from `cultural-data` instead of `dishes` if it exists
- [ ] T025 [US2] Update all imports in `app/api/cultural-data/route.ts` to use new type names (`CulturalDataApiRequest`, `CulturalDataApiResponse`, etc.)
- [ ] T026 [US2] Update all imports in `app/page.tsx` to use new type names (`CulturalDataApiRequest`, `CulturalDataApiResponse`, etc.)
- [ ] T027 [US2] Update all type usages in `app/api/cultural-data/route.ts` to use new type names
- [ ] T028 [US2] Update all type usages in `app/page.tsx` to use new type names
- [ ] T029 [US2] Update all imports in `app/api/cultural-data/route.ts` to import from `@/lib/types/cultural-data` instead of `@/lib/types/dishes`
- [ ] T030 [US2] Update all imports in `app/page.tsx` to import from `@/lib/types/cultural-data` instead of `@/lib/types/dishes`
- [ ] T031 [US2] Update all imports in `lib/api/openai-service.ts` to import from `@/lib/types/cultural-data` instead of `@/lib/types/dishes`
- [ ] T032 [US2] Update all imports in `lib/api/spotify-service.ts` to import from `@/lib/types/cultural-data` instead of `@/lib/types/dishes` (if it imports from dishes)
- [ ] T033 [US2] Verify TypeScript compilation passes: run `npm run build` to ensure all type references are updated correctly

**Checkpoint**: At this point, User Stories 1 AND 2 should both work. All type names are updated consistently, TypeScript compiles without errors, and the API endpoint works with new types.

---

## Phase 5: User Story 3 - Update Function Names and References (Priority: P3)

**Goal**: Rename function `queryDishesAndCarolWithRetry` to `queryCulturalDataWithRetry` and update all references, comments, and variable names to use "cultural data" terminology consistently.

**Independent Test**: Can be fully tested by verifying all function names, variable names, and comments are updated consistently. The test verifies code consistency without requiring runtime execution.

### Implementation for User Story 3

- [ ] T034 [US3] Rename function `queryDishesAndCarolWithRetry` to `queryCulturalDataWithRetry` in `lib/api/openai-service.ts`
- [ ] T035 [US3] Update function JSDoc comment for `queryCulturalDataWithRetry` in `lib/api/openai-service.ts` to use "cultural data" terminology
- [ ] T036 [US3] Update function parameter comments in `queryCulturalDataWithRetry` in `lib/api/openai-service.ts` to use "cultural data" terminology
- [ ] T037 [US3] Update all function calls to `queryDishesAndCarolWithRetry` in `app/api/cultural-data/route.ts` to use new name `queryCulturalDataWithRetry`
- [ ] T038 [US3] Update import statement in `app/api/cultural-data/route.ts` to import `queryCulturalDataWithRetry` instead of `queryDishesAndCarolWithRetry`
- [ ] T039 [US3] Update all comments in `app/api/cultural-data/route.ts` that mention "dishes" when they mean "cultural data" to use accurate terminology
- [ ] T040 [US3] Update all comments in `lib/api/openai-service.ts` that mention "dishes and carol" when they mean "cultural data" to use accurate terminology
- [ ] T041 [US3] Update error messages in `lib/api/openai-service.ts` that mention "dishes" when they mean "cultural data" to use accurate terminology
- [ ] T042 [US3] Update variable names in `app/api/cultural-data/route.ts` that use "dishes" terminology when they contain cultural data to use accurate names (if any exist)
- [ ] T043 [US3] Update variable names in `lib/api/openai-service.ts` that use "dishes" terminology when they contain cultural data to use accurate names (if any exist)
- [ ] T044 [US3] Update file header comment in `lib/api/openai-service.ts` to reflect it queries cultural data, not just dishes and carol
- [ ] T045 [US3] Verify all references to old function name are updated: search codebase for `queryDishesAndCarolWithRetry` and ensure no remaining references

**Checkpoint**: At this point, all user stories should be complete. Function names, variable names, and comments accurately reflect "cultural data" terminology throughout the codebase.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, cleanup, and backward compatibility maintenance

- [ ] T046 [P] Verify old endpoint `/api/dishes` still works and shows deprecation notice or redirects properly
- [ ] T047 [P] Update old route file `app/api/dishes/route.ts` to import handler from new route or add deprecation notice in response
- [ ] T048 [P] Verify TypeScript compilation passes without errors: run `npm run build` to ensure all types are correct
- [ ] T049 [P] Verify linting passes: run `npm run lint` to ensure code follows project style guidelines
- [ ] T050 [P] Search codebase for any remaining references to old naming (dishes API, old type names, old function names) and update if found
- [ ] T051 [P] Verify all imports are updated: search for `@/lib/types/dishes` and ensure all are updated to `@/lib/types/cultural-data`
- [ ] T052 [P] Test new endpoint `/api/cultural-data` with frontend: verify complete flow from country selection to data display works correctly
- [ ] T053 [P] Test old endpoint `/api/dishes` with frontend: verify backward compatibility works (if old endpoint still accessible)
- [ ] T054 [P] Update API documentation comments to reflect new endpoint name and purpose
- [ ] T055 [P] Run quickstart.md validation: test the complete migration flow and verify all scenarios work correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1) can start after Foundational
  - User Story 2 (P2) depends on User Story 1 completion (types used by endpoint)
  - User Story 3 (P3) depends on User Stories 1 and 2 completion (functions used by endpoint)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 completion - Types are used by the endpoint, so endpoint must exist first
- **User Story 3 (P3)**: Depends on User Stories 1 and 2 completion - Functions are used by endpoint, so endpoint and types must exist first

### Within Each User Story

- **User Story 1**:
  - Create new route file before updating it
  - Update route handler before updating frontend
  - Test new endpoint before maintaining old endpoint

- **User Story 2**:
  - Rename types in type file before updating imports
  - Update type file before updating imports in other files
  - Update imports before updating type usages
  - Verify compilation after all updates

- **User Story 3**:
  - Rename function before updating function calls
  - Update function before updating imports
  - Update comments and variable names incrementally
  - Verify all references updated

### Parallel Opportunities

- **Phase 1**: All setup tasks marked [P] can run in parallel (T001-T004)
- **Phase 2**: All foundational tasks marked [P] can run in parallel (T007-T008)
- **Phase 4 (US2)**: Type renaming tasks marked [P] can run in parallel (T018-T022)
- **Phase 6**: All polish tasks marked [P] can run in parallel (T046-T055)

---

## Parallel Example: User Story 2

```bash
# After User Story 1, these type renames can run in parallel:
Task T018: "Rename DishesApiRequest to CulturalDataApiRequest in lib/types/cultural-data.ts"
Task T019: "Rename CountryCulturalApiResponse to CulturalDataApiResponse in lib/types/cultural-data.ts"
Task T020: "Rename CountryCulturalApiSuccessResponse to CulturalDataApiSuccessResponse in lib/types/cultural-data.ts"
Task T021: "Rename CountryCulturalApiErrorResponse to CulturalDataApiErrorResponse in lib/types/cultural-data.ts"
Task T022: "Rename DishesApiErrorResponse to CulturalDataApiErrorResponse in lib/types/cultural-data.ts"

# Then update imports and usages:
Task T025-T032: Update all imports and type usages (sequential within each file)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (identify all references)
2. Complete Phase 2: Foundational (create new files)
3. Complete Phase 3: User Story 1 (rename endpoint)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Test new endpoint `/api/cultural-data` works
   - Test old endpoint `/api/dishes` still works
   - Verify frontend uses new endpoint
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
   - New endpoint works, old endpoint maintained
   - Frontend updated to use new endpoint
3. Add User Story 2 → Test independently → Deploy/Demo
   - All types renamed consistently
   - TypeScript compilation passes
4. Add User Story 3 → Test independently → Deploy/Demo
   - All functions and references updated
   - Code consistency improved
5. Add Polish tasks → Final validation → Deploy

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (endpoint renaming)
   - Developer B: Can prepare User Story 2 (type renaming research)
3. After User Story 1:
   - Developer A: User Story 2 (type renaming - can work on different types in parallel)
   - Developer B: User Story 3 (function renaming research)
4. After User Story 2:
   - Developer A: User Story 3 (function renaming)
   - Developer B: Polish tasks (verification, testing)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Important**: This is a refactoring - no functional changes, only naming improvements
- **Important**: Maintain backward compatibility throughout migration
- **Important**: Update all references atomically to avoid compilation errors
- **Important**: Test after each user story to ensure nothing breaks

---

## Task Summary

- **Total Tasks**: 55
- **Phase 1 (Setup)**: 5 tasks
- **Phase 2 (Foundational)**: 3 tasks
- **Phase 3 (User Story 1)**: 9 tasks
- **Phase 4 (User Story 2)**: 16 tasks
- **Phase 5 (User Story 3)**: 12 tasks
- **Phase 6 (Polish)**: 10 tasks

### Task Count per User Story

- **User Story 1 (P1)**: 9 tasks (T009-T017)
- **User Story 2 (P2)**: 16 tasks (T018-T033)
- **User Story 3 (P3)**: 12 tasks (T034-T045)

### Parallel Opportunities Identified

- Phase 1: 4 parallel tasks (T001-T004)
- Phase 2: 2 parallel tasks (T007-T008)
- Phase 4: 5 parallel tasks (T018-T022) for type renaming
- Phase 6: 10 parallel tasks (T046-T055) for verification

### Independent Test Criteria

- **User Story 1**: Can be tested by calling `/api/cultural-data` endpoint and verifying it returns same data structure as old endpoint. Can test backward compatibility by calling old endpoint.
- **User Story 2**: Can be tested by running TypeScript compilation and verifying all types resolve correctly. Can verify type names are consistent throughout codebase.
- **User Story 3**: Can be tested by searching codebase for old function names and verifying all are updated. Can verify comments and variable names use consistent terminology.

### Suggested MVP Scope

**MVP = User Story 1 only** (Phase 1 + Phase 2 + Phase 3)

- Setup and identify all references
- Create new file structure
- Rename API endpoint
- Update frontend to use new endpoint
- Maintain backward compatibility

This provides the core naming improvement. User Stories 2 and 3 (type and function renaming) can be added as follow-up increments for full consistency.
