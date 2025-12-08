# API Contracts: Country Input Validation

**Date**: 2024-12-19  
**Feature**: 010-validate-country-input

## Service Functions

### Countries Service (`lib/api/countries-service.ts`)

#### `getCountriesList()`

Fetches and returns the list of valid countries, using cache when available.

**Signature**:
```typescript
function getCountriesList(): Promise<CountriesList>
```

**Returns**: `Promise<CountriesList>` - Array of country name strings

**Behavior**:
- Checks cache first (cache key: `"countries"`)
- If cache hit: Returns cached countries list immediately
- If cache miss: Fetches from REST Countries API, caches result (10min TTL), returns list
- If fetch fails but expired cache exists: Returns expired cache (graceful degradation)
- If fetch fails and no cache: Throws error

**Errors**:
- `Error("Unable to load countries. Please try again later.")` - When API fetch fails and no cache available
- `Error("Request timed out. Please try again.")` - When API request times out

#### `validateCountry(countryName: string)`

Validates a country name against the valid countries list.

**Signature**:
```typescript
function validateCountry(countryName: string): Promise<ValidationResult>
```

**Parameters**:
- `countryName: string` - The country name to validate

**Returns**: `Promise<ValidationResult>` - Validation result object

**Behavior**:
- Trims whitespace from input
- Normalizes input (lowercase) for comparison
- Gets countries list (from cache or API)
- Creates normalized lookup set if not already created
- Checks if normalized input exists in countries list
- Returns validation result

**Validation Result**:
```typescript
interface ValidationResult {
  isValid: boolean;
  countryName: string; // trimmed
  error?: string; // only if isValid is false
}
```

**Error Cases**:
- Empty/null/undefined input → `{ isValid: false, countryName: "", error: "Country name is required" }`
- Not a string → `{ isValid: false, countryName: "", error: "Country name must be a string" }`
- Not in countries list → `{ isValid: false, countryName: "trimmed input", error: "Country 'X' is not recognized. Please select a valid country from the list." }`
- Countries list unavailable → `{ isValid: false, countryName: "trimmed input", error: "Unable to validate country. Please try again later." }`

**Success Case**:
- Valid country → `{ isValid: true, countryName: "trimmed input" }`

#### `isCountryValid(countryName: string)`

Convenience function that returns boolean indicating if country is valid.

**Signature**:
```typescript
function isCountryValid(countryName: string): Promise<boolean>
```

**Parameters**:
- `countryName: string` - The country name to validate

**Returns**: `Promise<boolean>` - `true` if valid, `false` otherwise

**Behavior**:
- Calls `validateCountry()` internally
- Returns `result.isValid`

## Endpoints

### GET /api/countries

Returns a list of country names with server-side caching (10 minutes TTL).

**Note**: This endpoint is refactored to use `countries-service.ts` but maintains the same external API contract.

#### Request

**Method**: `GET`  
**Path**: `/api/countries`  
**Query Parameters**: None  
**Headers**: Standard Next.js request headers

#### Response

**Success Response** (200 OK):

**Schema**:
```typescript
{
  success: true;
  data: string[]; // Array of country names
}
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    "Afghanistan",
    "Albania",
    "Algeria",
    ...
    "Zimbabwe"
  ]
}
```

**Error Response** (500 Internal Server Error):

**Schema**:
```typescript
{
  success: false;
  error: {
    message: string;
  };
}
```

**Error Scenarios**:

1. **Service Temporarily Unavailable**:
```json
{
  "success": false,
  "error": {
    "message": "Unable to load countries. Please try again later."
  }
}
```

2. **Request Timeout**:
```json
{
  "success": false,
  "error": {
    "message": "Request timed out. Please try again."
  }
}
```

3. **Unexpected Error**:
```json
{
  "success": false,
  "error": {
    "message": "An unexpected error occurred. Please try again later."
  }
}
```

### POST /api/cultural-data

Queries OpenAI to retrieve comprehensive cultural data (famous dishes, Christmas carol, and Spotify URL) for a selected country.

**Note**: This endpoint now includes country validation before processing.

#### Request

**Method**: `POST`  
**Path**: `/api/cultural-data`  
**Query Parameters**: None  
**Headers**:

- `Content-Type: application/json`
- Standard Next.js request headers

**Body Schema**:
```typescript
{
  country: string;        // Country name (required)
  mode?: 'fast' | 'detailed'; // Search mode (optional, defaults to 'fast')
}
```

**Field Descriptions**:
- `country` (string, required): Name of the country. Must be a valid country from the countries list (case-insensitive, whitespace trimmed).
- `mode` (string, optional): Response mode selection.
  - `'fast'`: Fast search mode (default)
  - `'detailed'`: Detailed search mode
  - If omitted, defaults to `'fast'`

**Example Request**:
```http
POST /api/cultural-data HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "country": "Italy",
  "mode": "fast"
}
```

#### Response

**Success Response** (200 OK):

**Schema**: Same as before (unchanged)

**Error Response** (400 Bad Request) - **NEW**: Country Validation Errors

**Schema**:
```typescript
{
  success: false;
  error: {
    message: string;
  };
}
```

**New Error Scenarios**:

1. **Invalid Country**:
```json
{
  "success": false,
  "error": {
    "message": "Country 'InvalidCountry' is not recognized. Please select a valid country from the list."
  }
}
```

2. **Empty Country** (existing, unchanged):
```json
{
  "success": false,
  "error": {
    "message": "Country name is required"
  }
}
```

**Error Response** (500 Internal Server Error):

**Schema**: Same as before (unchanged)

**Note**: All existing error scenarios remain unchanged. Country validation errors are returned as 400 Bad Request before any processing occurs.

### POST /api/recipe

Queries OpenAI to retrieve step-by-step recipe instructions for a specific dish from a country.

**Note**: This endpoint now includes country validation before processing.

#### Request

**Method**: `POST`  
**Path**: `/api/recipe`  
**Query Parameters**: None  
**Headers**:

- `Content-Type: application/json`
- Standard Next.js request headers

**Body Schema**:
```typescript
{
  country: string;        // Country name (required)
  dishName: string;      // Dish name (required)
  mode?: 'fast' | 'detailed'; // Search mode (optional, defaults to 'fast')
}
```

**Field Descriptions**:
- `country` (string, required): Name of the country. Must be a valid country from the countries list (case-insensitive, whitespace trimmed).
- `dishName` (string, required): Name of the dish to get recipe for. Must be non-empty after trimming.
- `mode` (string, optional): Response mode selection.
  - `'fast'`: Fast search mode (default)
  - `'detailed'`: Detailed search mode
  - If omitted, defaults to `'fast'`

**Example Request**:
```http
POST /api/recipe HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "country": "Italy",
  "dishName": "Pasta Carbonara",
  "mode": "fast"
}
```

#### Response

**Success Response** (200 OK):

**Schema**: Same as before (unchanged)

**Error Response** (400 Bad Request) - **NEW**: Country Validation Errors

**Schema**:
```typescript
{
  success: false;
  error: {
    message: string;
  };
}
```

**New Error Scenarios**:

1. **Invalid Country**:
```json
{
  "success": false,
  "error": {
    "message": "Country 'InvalidCountry' is not recognized. Please select a valid country from the list."
  }
}
```

2. **Empty Country** (existing, unchanged):
```json
{
  "success": false,
  "error": {
    "message": "Country name is required"
  }
}
```

**Error Response** (500 Internal Server Error):

**Schema**: Same as before (unchanged)

**Note**: All existing error scenarios remain unchanged. Country validation errors are returned as 400 Bad Request before any processing occurs.

## Validation Behavior

### Validation Timing

Country validation occurs **before** any other processing:
1. Parse request body
2. **Validate country** ← NEW
3. Check cache
4. Make external API calls
5. Process response

This ensures invalid countries are rejected early (fail fast), preventing unnecessary resource usage.

### Validation Rules

1. **Case-Insensitive Matching**: Country names are compared case-insensitively
   - "Italy" = "italy" = "ITALY" = "ItAlY"

2. **Whitespace Trimming**: Leading and trailing whitespace is removed before validation
   - "  Italy  " → "Italy"

3. **Exact Matching**: Country must exactly match a country in the list (after normalization)
   - "United States" matches "United States" (exact)
   - "USA" does NOT match "United States" (not exact)

4. **Empty Input**: Empty, null, or undefined country names are rejected
   - Returns: "Country name is required"

### Error Message Consistency

All endpoints return consistent error messages for validation failures:
- Invalid country: `"Country 'X' is not recognized. Please select a valid country from the list."`
- Empty country: `"Country name is required"`
- Countries list unavailable: `"Unable to validate country. Please try again later."`

## Caching Behavior

### Countries List Cache

- **Cache Key**: `"countries"` (exported as `COUNTRIES_CACHE_KEY`)
- **TTL**: 10 minutes (600,000 milliseconds)
- **Storage**: In-memory cache (`lib/utils/cache.ts`)
- **Scope**: Shared across all endpoints using countries-service

### Cache Flow

```
Request to /api/cultural-data or /api/recipe
  ↓
validateCountry() called
  ↓
getCountriesList() called
  ↓
Check cache for "countries"
  ↓
Cache Hit: Return cached list → Create normalized lookup → Validate
Cache Miss: Fetch from REST Countries API → Cache result → Create normalized lookup → Validate
```

### Normalized Lookup Cache

- **Storage**: Created alongside countries list, not separately cached
- **Lifetime**: Same as countries list cache
- **Purpose**: Enable O(1) validation lookups
- **Scope**: Internal to countries-service, not exposed

## Backward Compatibility

### API Contract Changes

- **GET /api/countries**: No changes to external API contract (internal refactoring only)
- **POST /api/cultural-data**: Adds new 400 error responses for invalid countries, but existing behavior unchanged for valid countries
- **POST /api/recipe**: Adds new 400 error responses for invalid countries, but existing behavior unchanged for valid countries

### Breaking Changes

None. All changes are additive:
- New validation errors are returned for invalid inputs
- Valid inputs continue to work as before
- Error response format is consistent with existing patterns

### Migration Notes

- Existing clients sending valid country names will see no changes
- Clients sending invalid country names will now receive clearer error messages
- No changes required to existing client code

## Performance Characteristics

### Validation Performance

- **Target**: Validation completes within 50ms for 95% of requests (SC-003)
- **Optimization**: Normalized lookup set enables O(1) validation
- **Impact**: Minimal overhead on request processing

### Error Response Performance

- **Target**: Error messages returned within 100ms (SC-004)
- **Optimization**: Early validation prevents unnecessary processing
- **Impact**: Faster error responses for invalid inputs

### Cache Efficiency

- **Shared Cache**: Countries list cache shared across all endpoints
- **Efficiency**: Single cache entry for all validation operations
- **Memory**: Minimal overhead (one Set per countries list)

## Notes

- Country validation is case-insensitive but preserves original case in error messages
- Validation occurs before cache checks to fail fast on invalid input
- Countries list is fetched once and cached, then reused for all validations
- Normalized lookup is created once per countries list fetch, then reused
- Service functions are async to handle potential async cache/API operations
- All validation errors return 400 Bad Request status code
- Error messages are user-friendly and actionable

