# Research: Country Input Validation and Service Refactoring

**Date**: 2024-12-19  
**Feature**: Country Input Validation  
**Purpose**: Research service extraction patterns, validation strategies, and error handling approaches for country validation

## Technology Decisions

### Service Extraction Pattern

**Decision**: Extract countries fetch and cache logic into `lib/api/countries-service.ts` following the existing service pattern (similar to `openai-service.ts` and `spotify-service.ts`)

**Rationale**:
- Consistent with existing codebase architecture where services live in `lib/api/`
- Enables reuse across multiple API endpoints and future features
- Separates concerns: API routes handle HTTP, services handle business logic
- Makes testing easier by isolating service logic from Next.js route handlers
- Follows single responsibility principle: service handles countries data, routes handle HTTP

**Pattern**:
- Service exports functions: `getCountriesList()`, `validateCountry(countryName: string)`
- Service uses existing cache utility from `lib/utils/cache.ts`
- Service handles all cache key management internally
- API routes import and call service functions

**Alternatives Considered**:
- **Keep logic in route**: Rejected because it prevents reuse and violates DRY principle
- **Create separate validation utility**: Rejected because validation needs access to countries list, which should be managed by the service
- **Use middleware**: Rejected because Next.js App Router doesn't have traditional middleware, and validation needs to be endpoint-specific

### Country Validation Strategy

**Decision**: Use case-insensitive exact matching with whitespace trimming

**Rationale**:
- Case-insensitive matching provides better user experience (users may type "italy", "Italy", "ITALY")
- Whitespace trimming handles common input errors (leading/trailing spaces)
- Exact matching ensures data integrity (no fuzzy matching that could match wrong countries)
- Simple and performant (O(n) lookup in countries array)
- Aligns with specification requirements (FR-003, FR-004, FR-009)

**Implementation Approach**:
1. Normalize input: `countryName.trim().toLowerCase()`
2. Normalize countries list: Create a normalized lookup map/set for O(1) validation
3. Check if normalized input exists in normalized countries list
4. Return validation result with original country name for error messages

**Alternatives Considered**:
- **Fuzzy matching**: Rejected because it could match incorrect countries and violates FR-009 (exact matching requirement)
- **Case-sensitive matching**: Rejected because it reduces user experience and doesn't align with FR-003
- **Database lookup**: Rejected because countries list is small and changes infrequently, in-memory is sufficient

### Error Handling Strategy

**Decision**: Return structured validation results with clear error messages

**Rationale**:
- Consistent error format across endpoints improves developer experience
- User-friendly error messages help users correct their input
- Early validation (before cache/external calls) prevents wasted resources
- Structured results enable consistent error responses

**Error Message Format**:
- Invalid country: `"Country 'X' is not recognized. Please select a valid country from the list."`
- Empty country: `"Country name is required"` (already exists, maintain consistency)
- Countries list unavailable: `"Unable to validate country. Please try again later."`

**Alternatives Considered**:
- **Generic error messages**: Rejected because they don't help users understand what went wrong
- **Throw exceptions**: Rejected because structured results are more explicit and easier to handle
- **Return null/undefined**: Rejected because it doesn't distinguish between different error types

### Cache Strategy

**Decision**: Reuse existing cache utility with same TTL (10 minutes) and cache key pattern

**Rationale**:
- Existing cache utility (`lib/utils/cache.ts`) is already in use and tested
- Same TTL ensures consistency with current `/countries` endpoint behavior
- Service will manage cache key internally (`COUNTRIES_CACHE_KEY`)
- Cache hit/miss logic remains the same, just moved to service

**Cache Key Management**:
- Service exports `COUNTRIES_CACHE_KEY` constant for consistency
- Service handles all cache operations internally
- API routes don't need to know about cache keys

**Alternatives Considered**:
- **New cache instance**: Rejected because it would duplicate cache logic and reduce efficiency
- **Different TTL**: Rejected because 10 minutes is appropriate for countries data (changes infrequently)
- **No caching**: Rejected because it would impact performance and increase external API calls

### Service Function Design

**Decision**: Export three main functions from countries-service

**Functions**:
1. `getCountriesList()`: Returns countries list (from cache or API), handles all fetch/cache logic
2. `validateCountry(countryName: string)`: Validates country name, returns validation result
3. `isCountryValid(countryName: string)`: Convenience function returning boolean

**Rationale**:
- `getCountriesList()` encapsulates all fetch/cache logic, making it reusable
- `validateCountry()` returns structured result with validation status and error details
- `isCountryValid()` provides simple boolean check for cases where only yes/no is needed
- Clear separation of concerns: fetch vs validation

**Return Types**:
```typescript
interface ValidationResult {
  isValid: boolean;
  countryName: string; // normalized/trimmed
  error?: string; // only present if invalid
}

function validateCountry(countryName: string): Promise<ValidationResult>
function isCountryValid(countryName: string): Promise<boolean>
function getCountriesList(): Promise<CountriesList>
```

**Alternatives Considered**:
- **Single validation function**: Rejected because different use cases need different return types
- **Synchronous validation**: Rejected because it needs countries list which may require async fetch
- **Validation in route handlers**: Rejected because it violates DRY and makes testing harder

## Integration Points

### Countries API Route Refactoring

**Current State**: `app/api/countries/route.ts` contains:
- REST Countries API fetch logic
- Cache get/set logic
- Error handling
- Response formatting

**Refactored State**: Route will:
- Import `getCountriesList()` from service
- Call service function
- Format response (success/error)
- Handle HTTP-specific concerns only

**Migration Strategy**:
1. Create service with existing logic
2. Update route to use service
3. Test that behavior is unchanged
4. Remove duplicate code from route

### Cultural Data API Integration

**Current State**: `app/api/cultural-data/route.ts` validates:
- Country is non-empty string
- Does NOT validate against countries list

**Updated State**: Route will:
- Import `validateCountry()` from service
- Call validation before any processing
- Return validation error if country invalid
- Proceed normally if valid

**Integration Point**: Add validation immediately after parsing request body, before cache check (FR-010: fail fast)

### Recipe API Integration

**Current State**: `app/api/recipe/route.ts` validates:
- Country is non-empty string
- Does NOT validate against countries list

**Updated State**: Route will:
- Import `validateCountry()` from service
- Call validation before any processing
- Return validation error if country invalid
- Proceed normally if valid

**Integration Point**: Add validation immediately after parsing request body, before cache check (FR-010: fail fast)

## Performance Considerations

### Validation Performance

**Optimization**: Create normalized lookup map/set for O(1) validation instead of O(n) array search

**Implementation**:
- When countries list is fetched, create a `Set<string>` of normalized country names
- Cache the normalized set alongside the countries list
- Validation becomes: `normalizedSet.has(normalizedInput)`

**Impact**: 
- Reduces validation time from O(n) to O(1)
- Ensures validation completes within 50ms target (SC-003)
- Minimal memory overhead (one Set per countries list)

### Cache Efficiency

**Strategy**: Service manages cache, ensuring single source of truth

**Benefits**:
- No duplicate cache entries
- Consistent cache key usage
- Efficient memory usage
- Easy cache invalidation if needed

## Error Scenarios

### Countries List Unavailable

**Scenario**: REST Countries API fails or times out

**Handling**:
- Service returns error, doesn't throw
- Validation functions return appropriate error
- API routes return user-friendly error message
- Existing fallback to expired cache (if available) is preserved

### Invalid Country Input

**Scenario**: User provides country name not in list

**Handling**:
- Validation returns `{ isValid: false, error: "Country 'X' is not recognized..." }`
- API route returns 400 Bad Request with error message
- No external API calls made (fail fast)

### Empty/Missing Country

**Scenario**: User doesn't provide country or provides empty string

**Handling**:
- Validation catches this before checking countries list
- Returns `{ isValid: false, error: "Country name is required" }`
- API route returns 400 Bad Request
- Consistent with existing behavior

## Testing Strategy (Future)

**Unit Tests**:
- Test `validateCountry()` with various inputs (valid, invalid, edge cases)
- Test `getCountriesList()` cache behavior
- Test normalization (case-insensitive, whitespace)

**Integration Tests**:
- Test API routes with valid/invalid countries
- Test error responses
- Test cache behavior across requests

**Note**: Testing is deferred for now per project conventions, but structure supports easy testing later

