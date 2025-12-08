# Tasks: Country Input Validation

**Feature**: 010-validate-country-input  
**Branch**: `010-validate-country-input`  
**Date**: 2024-12-19  
**Spec**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Overview

This feature refactors the countries API to extract fetch and cache logic into a reusable service, and adds country validation to `/cultural-data` and `/recipe` API endpoints. The validation ensures only valid countries from the countries list can be used, providing better error handling and preventing unnecessary processing.

## Dependencies

**User Story Completion Order**:
1. **Foundational Phase**: Countries Service and Type Definitions - **BLOCKING** for both user stories (must be complete before any validation can be added)
2. **User Story 1** (P1): Validate Country in Cultural Data API - **INDEPENDENT** (can be implemented in parallel with US2 after foundational phase)
3. **User Story 2** (P1): Validate Country in Recipe API - **INDEPENDENT** (can be implemented in parallel with US1 after foundational phase)

**Parallel Execution Opportunities**:
- Type definitions and service function implementations can be done in parallel
- Refactoring `/api/countries` and adding validation to `/api/cultural-data` and `/api/recipe` can be done in parallel after foundational phase
- Both user stories (US1 and US2) can be implemented in parallel after foundational phase

## Implementation Strategy

**MVP Scope**: Foundational Phase + User Story 1 (Basic validation for cultural data endpoint)
- Enables country validation for cultural data requests
- Recipe validation can be added incrementally in US2
- Users get immediate benefit from validation on one endpoint

**Incremental Delivery**:
1. **Phase 1**: Type definitions (ValidationResult interface)
2. **Phase 2**: Countries service implementation (foundational)
3. **Phase 3**: Refactor countries API route to use service
4. **Phase 4**: Add validation to cultural data API (US1)
5. **Phase 5**: Add validation to recipe API (US2)
6. **Phase 6**: Polish and error handling improvements

---

## Phase 1: Setup

**Goal**: Create type definitions required for validation functionality.

**Independent Test**: Types compile without errors, ValidationResult interface is accessible and properly typed.

### Tasks

- [ ] T001 Create ValidationResult interface in `lib/types/countries.ts`
- [ ] T002 [P] Add JSDoc documentation for ValidationResult interface in `lib/types/countries.ts`
- [ ] T003 [P] Export ValidationResult interface from `lib/types/countries.ts`

---

## Phase 2: Foundational

**Goal**: Create countries service with fetch, cache, and validation logic. This is a blocking prerequisite for all user stories.

**Independent Test**: Service functions can be imported and called, getCountriesList() returns countries array, validateCountry() returns ValidationResult, isCountryValid() returns boolean. Service handles cache hits/misses correctly.

### Tasks

- [ ] T004 Create countries-service.ts file in `lib/api/countries-service.ts`
- [ ] T005 [P] Import cache utility and types in `lib/api/countries-service.ts`
- [ ] T006 [P] Define COUNTRIES_CACHE_KEY constant ('countries') in `lib/api/countries-service.ts`
- [ ] T007 [P] Define CACHE_TTL constant (10 minutes) in `lib/api/countries-service.ts`
- [ ] T008 [P] Define REST_COUNTRIES_URL constant in `lib/api/countries-service.ts`
- [ ] T009 [P] Define REQUEST_TIMEOUT constant (10 seconds) in `lib/api/countries-service.ts`
- [ ] T010 Implement fetchCountriesFromAPI function in `lib/api/countries-service.ts`
- [ ] T011 [P] Add error handling for timeout in fetchCountriesFromAPI in `lib/api/countries-service.ts`
- [ ] T012 [P] Add error handling for non-OK responses in fetchCountriesFromAPI in `lib/api/countries-service.ts`
- [ ] T013 [P] Implement country name extraction (name.common) in fetchCountriesFromAPI in `lib/api/countries-service.ts`
- [ ] T014 [P] Implement filtering of empty country names in fetchCountriesFromAPI in `lib/api/countries-service.ts`
- [ ] T015 [P] Implement alphabetical sorting of countries in fetchCountriesFromAPI in `lib/api/countries-service.ts`
- [ ] T016 Implement getCountriesList function in `lib/api/countries-service.ts`
- [ ] T017 [P] Add cache check logic in getCountriesList in `lib/api/countries-service.ts`
- [ ] T018 [P] Add cache set logic with TTL in getCountriesList in `lib/api/countries-service.ts`
- [ ] T019 [P] Add expired cache fallback logic in getCountriesList in `lib/api/countries-service.ts`
- [ ] T020 [P] Add error handling for countries list unavailable in getCountriesList in `lib/api/countries-service.ts`
- [ ] T021 Create normalized lookup set creation function in `lib/api/countries-service.ts`
- [ ] T022 [P] Implement normalized lookup caching logic in `lib/api/countries-service.ts`
- [ ] T023 Implement validateCountry function in `lib/api/countries-service.ts`
- [ ] T024 [P] Add input validation (null/undefined check) in validateCountry in `lib/api/countries-service.ts`
- [ ] T025 [P] Add input type validation (string check) in validateCountry in `lib/api/countries-service.ts`
- [ ] T026 [P] Add whitespace trimming in validateCountry in `lib/api/countries-service.ts`
- [ ] T027 [P] Add empty string check in validateCountry in `lib/api/countries-service.ts`
- [ ] T028 [P] Add case-insensitive normalization in validateCountry in `lib/api/countries-service.ts`
- [ ] T029 [P] Add countries list retrieval in validateCountry in `lib/api/countries-service.ts`
- [ ] T030 [P] Add normalized lookup creation/usage in validateCountry in `lib/api/countries-service.ts`
- [ ] T031 [P] Add validation result construction in validateCountry in `lib/api/countries-service.ts`
- [ ] T032 [P] Add error message formatting for invalid countries in validateCountry in `lib/api/countries-service.ts`
- [ ] T033 [P] Add error handling for countries list unavailable in validateCountry in `lib/api/countries-service.ts`
- [ ] T034 Implement isCountryValid function in `lib/api/countries-service.ts`
- [ ] T035 [P] Add JSDoc documentation for all service functions in `lib/api/countries-service.ts`
- [ ] T036 [P] Export all service functions and constants from `lib/api/countries-service.ts`

---

## Phase 3: Refactor Countries API

**Goal**: Refactor the countries API route to use the new countries-service, maintaining backward compatibility.

**Independent Test**: GET /api/countries returns same response format as before, behavior unchanged, cache still works correctly.

### Tasks

- [ ] T037 Update imports in `app/api/countries/route.ts` to use getCountriesList from countries-service
- [ ] T038 [P] Remove fetchCountriesFromAPI function from `app/api/countries/route.ts`
- [ ] T039 [P] Remove cache get/set logic from `app/api/countries/route.ts`
- [ ] T040 [P] Remove COUNTRIES_CACHE_KEY, CACHE_TTL, REQUEST_TIMEOUT constants from `app/api/countries/route.ts`
- [ ] T041 [P] Remove REST_COUNTRIES_URL constant from `app/api/countries/route.ts`
- [ ] T042 Replace cache check logic with getCountriesList() call in GET handler in `app/api/countries/route.ts`
- [ ] T043 [P] Update error handling to work with service function in GET handler in `app/api/countries/route.ts`
- [ ] T044 [P] Maintain same response format and error messages in GET handler in `app/api/countries/route.ts`
- [ ] T045 [P] Add JSDoc comment noting refactoring to use service in `app/api/countries/route.ts`

---

## Phase 4: User Story 1 - Validate Country in Cultural Data API

**Story Goal**: Users submitting requests to `/cultural-data` with invalid country names receive clear error messages. Valid countries proceed normally. Validation occurs before any processing (fail fast).

**Independent Test**: Sending request to `/cultural-data` with valid country succeeds, with invalid country returns 400 error with clear message, case-insensitive matching works, whitespace trimming works, empty country returns error.

**Acceptance Criteria**:
- Valid country names proceed normally and return cultural data
- Invalid country names are rejected with 400 error and clear message
- Case-insensitive matching works (Italy = italy = ITALY)
- Whitespace is trimmed before validation
- Empty country names are rejected with error
- Validation occurs before cache checks and external API calls

### Tasks

- [ ] T046 [US1] Import validateCountry from countries-service in `app/api/cultural-data/route.ts`
- [ ] T047 [US1] [P] Import ValidationResult type in `app/api/cultural-data/route.ts`
- [ ] T048 [US1] Add country validation call after parsing request body in POST handler in `app/api/cultural-data/route.ts`
- [ ] T049 [US1] [P] Add validation result check (isValid) in POST handler in `app/api/cultural-data/route.ts`
- [ ] T050 [US1] [P] Add 400 error response for invalid countries in POST handler in `app/api/cultural-data/route.ts`
- [ ] T051 [US1] [P] Use validation.error for error message in error response in POST handler in `app/api/cultural-data/route.ts`
- [ ] T052 [US1] [P] Ensure validation occurs before cache check in POST handler in `app/api/cultural-data/route.ts`
- [ ] T053 [US1] [P] Ensure validation occurs before external API calls in POST handler in `app/api/cultural-data/route.ts`
- [ ] T054 [US1] [P] Use validation.countryName (trimmed) for subsequent processing in POST handler in `app/api/cultural-data/route.ts`
- [ ] T055 [US1] [P] Add JSDoc comment documenting validation behavior in POST handler in `app/api/cultural-data/route.ts`

---

## Phase 5: User Story 2 - Validate Country in Recipe API

**Story Goal**: Users submitting requests to `/recipe` with invalid country names receive clear error messages. Valid countries proceed normally. Validation occurs before any processing (fail fast).

**Independent Test**: Sending request to `/recipe` with valid country succeeds, with invalid country returns 400 error with clear message, case-insensitive matching works, whitespace trimming works, empty country returns error.

**Acceptance Criteria**:
- Valid country names proceed normally and return recipe
- Invalid country names are rejected with 400 error and clear message
- Case-insensitive matching works (Italy = italy = ITALY)
- Whitespace is trimmed before validation
- Empty country names are rejected with error
- Validation occurs before cache checks and external API calls

### Tasks

- [ ] T056 [US2] Import validateCountry from countries-service in `app/api/recipe/route.ts`
- [ ] T057 [US2] [P] Import ValidationResult type in `app/api/recipe/route.ts`
- [ ] T058 [US2] Add country validation call after parsing request body in POST handler in `app/api/recipe/route.ts`
- [ ] T059 [US2] [P] Add validation result check (isValid) in POST handler in `app/api/recipe/route.ts`
- [ ] T060 [US2] [P] Add 400 error response for invalid countries in POST handler in `app/api/recipe/route.ts`
- [ ] T061 [US2] [P] Use validation.error for error message in error response in POST handler in `app/api/recipe/route.ts`
- [ ] T062 [US2] [P] Ensure validation occurs before cache check in POST handler in `app/api/recipe/route.ts`
- [ ] T063 [US2] [P] Ensure validation occurs before external API calls in POST handler in `app/api/recipe/route.ts`
- [ ] T064 [US2] [P] Use validation.countryName (trimmed) for subsequent processing in POST handler in `app/api/recipe/route.ts`
- [ ] T065 [US2] [P] Add JSDoc comment documenting validation behavior in POST handler in `app/api/recipe/route.ts`

---

## Phase 6: Polish & Cross-Cutting Concerns

**Goal**: Ensure consistency, error handling, and documentation across all changes.

**Independent Test**: All endpoints return consistent error messages, validation works correctly across all scenarios, code is well-documented, no regressions in existing functionality.

### Tasks

- [ ] T066 Verify error message consistency across `/cultural-data` and `/recipe` endpoints
- [ ] T067 [P] Verify case-insensitive matching works for all valid country names
- [ ] T068 [P] Verify whitespace trimming works correctly in both endpoints
- [ ] T069 [P] Verify empty country handling is consistent across endpoints
- [ ] T070 [P] Verify countries list unavailable handling works correctly
- [ ] T071 [P] Test validation performance (should complete within 50ms for 95% of requests)
- [ ] T072 [P] Test error response time (should return within 100ms)
- [ ] T073 [P] Verify backward compatibility of `/countries` endpoint (same response format)
- [ ] T074 [P] Verify no regressions in existing `/cultural-data` functionality for valid countries
- [ ] T075 [P] Verify no regressions in existing `/recipe` functionality for valid countries
- [ ] T076 [P] Review and update JSDoc comments for clarity and completeness
- [ ] T077 [P] Verify all TypeScript types are properly exported and used

---

## Task Summary

**Total Tasks**: 77

**Tasks by Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 33 tasks
- Phase 3 (Refactor Countries API): 9 tasks
- Phase 4 (User Story 1): 10 tasks
- Phase 5 (User Story 2): 10 tasks
- Phase 6 (Polish): 12 tasks

**Parallel Opportunities**:
- Phase 1: All 3 tasks can run in parallel
- Phase 2: Many tasks can run in parallel (constants, error handling, validation steps)
- Phase 3: Most tasks can run in parallel (removals and updates)
- Phase 4 & 5: Can be implemented in parallel after foundational phase
- Phase 6: Most verification tasks can run in parallel

**Independent Test Criteria**:
- **Phase 1**: Types compile, ValidationResult interface accessible
- **Phase 2**: Service functions importable and callable, cache works correctly
- **Phase 3**: Countries API returns same format, behavior unchanged
- **Phase 4 (US1)**: Valid countries succeed, invalid countries return 400, case-insensitive works
- **Phase 5 (US2)**: Valid countries succeed, invalid countries return 400, case-insensitive works
- **Phase 6**: All endpoints consistent, no regressions, performance targets met

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 + Phase 4 (User Story 1)
- Enables country validation for cultural data endpoint
- Provides reusable service for future use
- Recipe validation can be added incrementally

