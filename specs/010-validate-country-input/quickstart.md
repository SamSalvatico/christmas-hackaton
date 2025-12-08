# Quickstart: Country Input Validation

**Feature**: 010-validate-country-input  
**Date**: 2024-12-19

## Overview

This feature adds country validation to the `/cultural-data` and `/recipe` API endpoints, and refactors the countries API to use a reusable service. The validation ensures that only valid countries from the countries list can be used in API requests, providing better error handling and preventing unnecessary processing.

## Key Changes

1. **New Service**: `lib/api/countries-service.ts` - Extracts countries fetch/cache logic and adds validation
2. **Refactored Endpoint**: `app/api/countries/route.ts` - Now uses countries-service
3. **Updated Endpoints**: `app/api/cultural-data/route.ts` and `app/api/recipe/route.ts` - Add country validation

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    API Routes                           │
│  /api/countries  /api/cultural-data  /api/recipe       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              countries-service.ts                       │
│  • getCountriesList()                                   │
│  • validateCountry()                                    │
│  • isCountryValid()                                     │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│  Cache Utility  │    │ REST Countries   │
│  (lib/utils/    │    │      API         │
│   cache.ts)     │    │                  │
└─────────────────┘    └──────────────────┘
```

## Implementation Steps

### Step 1: Create Countries Service

Create `lib/api/countries-service.ts` with:

1. **Export constants**:
   - `COUNTRIES_CACHE_KEY = 'countries'`
   - `CACHE_TTL = 10 * 60 * 1000` (10 minutes)

2. **Implement `getCountriesList()`**:
   - Check cache first
   - If cache miss, fetch from REST Countries API
   - Extract country names, filter empty, sort
   - Cache result with TTL
   - Return countries list

3. **Implement `validateCountry(countryName: string)`**:
   - Validate input (not null, is string, not empty after trim)
   - Get countries list (from cache or API)
   - Create normalized lookup set (if not exists)
   - Check if normalized input in lookup set
   - Return `ValidationResult`

4. **Implement `isCountryValid(countryName: string)`**:
   - Call `validateCountry()` internally
   - Return `result.isValid`

### Step 2: Refactor Countries API Route

Update `app/api/countries/route.ts`:

1. **Import service**:
   ```typescript
   import { getCountriesList } from '@/lib/api/countries-service';
   ```

2. **Replace fetch/cache logic**:
   - Remove `fetchCountriesFromAPI()` function
   - Remove cache get/set logic
   - Call `getCountriesList()` from service
   - Keep error handling and response formatting

### Step 3: Add Validation to Cultural Data API

Update `app/api/cultural-data/route.ts`:

1. **Import service**:
   ```typescript
   import { validateCountry } from '@/lib/api/countries-service';
   ```

2. **Add validation after parsing request body**:
   ```typescript
   const countryName = body.country.trim();
   const mode: SearchMode = body.mode || 'fast';
   
   // Validate country
   const validation = await validateCountry(countryName);
   if (!validation.isValid) {
     return NextResponse.json<CulturalDataApiResponse>(
       {
         success: false,
         error: {
           message: validation.error || 'Country name is required',
         },
       },
       { status: 400 }
     );
   }
   
   // Continue with existing logic...
   ```

### Step 4: Add Validation to Recipe API

Update `app/api/recipe/route.ts`:

1. **Import service**:
   ```typescript
   import { validateCountry } from '@/lib/api/countries-service';
   ```

2. **Add validation after parsing request body**:
   ```typescript
   const countryName = country.trim();
   const normalizedDishName = dishName.trim();
   const searchMode: SearchMode = mode || 'fast';
   
   // Validate country
   const validation = await validateCountry(countryName);
   if (!validation.isValid) {
     return NextResponse.json(
       {
         success: false,
         error: {
           message: validation.error || 'Country name is required',
         },
       },
       { status: 400 }
     );
   }
   
   // Continue with existing logic...
   ```

## Type Definitions

Add to `lib/types/countries.ts`:

```typescript
export interface ValidationResult {
  isValid: boolean;
  countryName: string;
  error?: string;
}
```

## Testing the Implementation

### Test Valid Country

```bash
# Cultural Data API
curl -X POST http://localhost:3000/api/cultural-data \
  -H "Content-Type: application/json" \
  -d '{"country": "Italy"}'

# Recipe API
curl -X POST http://localhost:3000/api/recipe \
  -H "Content-Type: application/json" \
  -d '{"country": "Italy", "dishName": "Pasta Carbonara"}'
```

**Expected**: Both should return success responses (200 OK)

### Test Invalid Country

```bash
# Cultural Data API
curl -X POST http://localhost:3000/api/cultural-data \
  -H "Content-Type: application/json" \
  -d '{"country": "InvalidCountry"}'

# Recipe API
curl -X POST http://localhost:3000/api/recipe \
  -H "Content-Type: application/json" \
  -d '{"country": "InvalidCountry", "dishName": "Dish"}'
```

**Expected**: Both should return validation errors (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "message": "Country 'InvalidCountry' is not recognized. Please select a valid country from the list."
  }
}
```

### Test Case-Insensitive Matching

```bash
# Test lowercase
curl -X POST http://localhost:3000/api/cultural-data \
  -H "Content-Type: application/json" \
  -d '{"country": "italy"}'

# Test uppercase
curl -X POST http://localhost:3000/api/cultural-data \
  -H "Content-Type: application/json" \
  -d '{"country": "ITALY"}'
```

**Expected**: Both should return success responses (200 OK)

### Test Whitespace Trimming

```bash
curl -X POST http://localhost:3000/api/cultural-data \
  -H "Content-Type: application/json" \
  -d '{"country": "  Italy  "}'
```

**Expected**: Should return success response (200 OK), whitespace is trimmed

### Test Countries API (Refactored)

```bash
curl http://localhost:3000/api/countries
```

**Expected**: Should return countries list (200 OK), behavior unchanged from before

## Key Implementation Details

### Normalized Lookup Optimization

For efficient validation, create a normalized lookup set:

```typescript
// In countries-service.ts
let normalizedLookup: Set<string> | null = null;
let originalCountries: CountriesList | null = null;

function createNormalizedLookup(countries: CountriesList): Set<string> {
  return new Set(countries.map(c => c.toLowerCase()));
}

// In validateCountry():
const countries = await getCountriesList();
if (!normalizedLookup || countries !== originalCountries) {
  normalizedLookup = createNormalizedLookup(countries);
  originalCountries = countries;
}
```

### Error Message Format

Consistent error messages across endpoints:

- Invalid country: `"Country 'X' is not recognized. Please select a valid country from the list."`
- Empty country: `"Country name is required"`
- Countries unavailable: `"Unable to validate country. Please try again later."`

### Cache Key Management

- Use exported constant: `COUNTRIES_CACHE_KEY` from service
- Service manages cache internally
- API routes don't need to know cache keys

## Common Pitfalls

1. **Forgetting to await validation**: `validateCountry()` is async, must await
2. **Not trimming input**: Always trim country name before validation
3. **Not handling validation errors**: Check `validation.isValid` before proceeding
4. **Creating lookup on every validation**: Cache the normalized lookup set
5. **Not preserving original case**: Use trimmed input, not normalized, in error messages

## Next Steps

After implementation:

1. Test all validation scenarios
2. Verify backward compatibility (existing valid requests still work)
3. Check error messages are user-friendly
4. Verify performance (validation completes within 50ms target)
5. Update any client documentation if needed

## Related Files

- **Service**: `lib/api/countries-service.ts` (NEW)
- **Types**: `lib/types/countries.ts` (UPDATE)
- **API Routes**:
  - `app/api/countries/route.ts` (REFACTOR)
  - `app/api/cultural-data/route.ts` (UPDATE)
  - `app/api/recipe/route.ts` (UPDATE)

