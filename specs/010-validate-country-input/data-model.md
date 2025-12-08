# Data Model: Country Input Validation

**Date**: 2024-12-19  
**Feature**: Country Input Validation  
**Purpose**: Define data structures and validation rules for country validation feature

## Entities

### Country Validation Result

Represents the outcome of validating a country name against the valid countries list.

**Fields**:
- `isValid: boolean` - Whether the country name is valid
- `countryName: string` - The normalized (trimmed) country name that was validated
- `error?: string` - Error message (only present if `isValid` is false)

**Validation Rules**:
- `isValid` must be `true` if country exists in countries list, `false` otherwise
- `countryName` must be trimmed (no leading/trailing whitespace)
- `error` must be present and non-empty if `isValid` is `false`
- `error` must be absent if `isValid` is `true`

**State Transitions**:
- Initial: Created when validation is performed
- No state changes (immutable result object)

**Example**:
```typescript
// Valid country
{
  isValid: true,
  countryName: "Italy"
}

// Invalid country
{
  isValid: false,
  countryName: "InvalidCountry",
  error: "Country 'InvalidCountry' is not recognized. Please select a valid country from the list."
}
```

### Countries List

Represents the authoritative list of valid country names.

**Fields**:
- `countries: string[]` - Array of country names (as they appear in REST Countries API)

**Validation Rules**:
- Array must not be empty (if empty, indicates countries list unavailable)
- Each country name must be a non-empty string
- Country names are as provided by REST Countries API (`name.common` field)
- List is sorted alphabetically for consistency

**State Transitions**:
- Fetched from REST Countries API
- Cached in memory with 10-minute TTL
- Refreshed when cache expires or on cache miss

**Example**:
```typescript
["Afghanistan", "Albania", "Algeria", ..., "Zimbabwe"]
```

### Normalized Countries Lookup

Internal data structure for efficient country validation.

**Fields**:
- `normalizedSet: Set<string>` - Set of normalized (lowercase) country names
- `originalMap: Map<string, string>` - Map from normalized to original country name

**Validation Rules**:
- Created from countries list when list is fetched
- Normalized names are lowercase versions of original names
- Used for O(1) validation lookups
- Cached alongside countries list

**State Transitions**:
- Created when countries list is fetched
- Updated when countries list is refreshed
- Cleared when cache expires

**Example**:
```typescript
normalizedSet: Set(["afghanistan", "albania", "algeria", ...])
originalMap: Map([
  ["afghanistan", "Afghanistan"],
  ["albania", "Albania"],
  ["algeria", "Algeria"],
  ...
])
```

## Validation Rules

### Country Name Input Validation

**Input**: Raw country name string from API request

**Validation Steps**:
1. Check if input is provided (not null/undefined)
2. Check if input is a string type
3. Trim whitespace from input
4. Check if trimmed input is non-empty
5. Normalize input (convert to lowercase)
6. Check if normalized input exists in normalized countries lookup set

**Output**: `ValidationResult` object

**Error Cases**:
- Input is null/undefined → `{ isValid: false, error: "Country name is required" }`
- Input is not a string → `{ isValid: false, error: "Country name must be a string" }`
- Trimmed input is empty → `{ isValid: false, error: "Country name is required" }`
- Normalized input not in countries list → `{ isValid: false, error: "Country 'X' is not recognized. Please select a valid country from the list." }`

**Success Case**:
- Normalized input exists in countries list → `{ isValid: true, countryName: "trimmed original" }`

### Countries List Availability

**Validation**: Countries list must be available for validation to work

**Error Handling**:
- If countries list cannot be fetched and cache is empty → Return error indicating countries list unavailable
- If countries list cannot be fetched but expired cache exists → Use expired cache (graceful degradation)
- If countries list is empty → Return error indicating no countries available

**Error Messages**:
- `"Unable to validate country. Please try again later."` - When countries list is unavailable
- `"No countries available for validation."` - When countries list is empty

## Relationships

### Countries Service → Countries List
- **Type**: One-to-one
- **Description**: Service fetches and caches one countries list
- **Lifetime**: Countries list cached for 10 minutes, then refreshed

### Countries Service → Normalized Lookup
- **Type**: One-to-one
- **Description**: Service creates one normalized lookup from countries list
- **Lifetime**: Created/updated when countries list is fetched/refreshed

### Validation Result → Country Input
- **Type**: One-to-one
- **Description**: Each validation produces one result for one input
- **Lifetime**: Result is returned immediately, not stored

## Data Flow

### Country Validation Flow

```
1. API Request receives country name
   ↓
2. Parse and extract country from request body
   ↓
3. Call validateCountry(countryName) from service
   ↓
4. Service normalizes input (trim + lowercase)
   ↓
5. Service gets countries list (from cache or API)
   ↓
6. Service creates/uses normalized lookup
   ↓
7. Service checks if normalized input in lookup set
   ↓
8. Service returns ValidationResult
   ↓
9. API route checks result.isValid
   ↓
10a. If valid: Continue with request processing
10b. If invalid: Return 400 with result.error
```

### Countries List Fetch Flow

```
1. getCountriesList() called
   ↓
2. Check cache for COUNTRIES_CACHE_KEY
   ↓
3a. If cache hit: Return cached countries list
3b. If cache miss: Continue to step 4
   ↓
4. Fetch from REST Countries API
   ↓
5a. If fetch succeeds:
    - Extract country names (name.common)
    - Filter empty names
    - Sort alphabetically
    - Store in cache with 10min TTL
    - Create normalized lookup
    - Return countries list
5b. If fetch fails:
    - Check for expired cache
    - If expired cache exists: Return it (graceful degradation)
    - If no cache: Throw error
```

## Type Definitions

### ValidationResult Interface

```typescript
interface ValidationResult {
  isValid: boolean;
  countryName: string;
  error?: string;
}
```

### Countries Service Functions

```typescript
// Get countries list (with caching)
function getCountriesList(): Promise<CountriesList>;

// Validate country name
function validateCountry(countryName: string): Promise<ValidationResult>;

// Check if country is valid (boolean convenience)
function isCountryValid(countryName: string): Promise<boolean>;
```

### Error Types

```typescript
// Countries list unavailable
interface CountriesUnavailableError {
  message: "Unable to validate country. Please try again later.";
  code: "COUNTRIES_UNAVAILABLE";
}

// Invalid country name
interface InvalidCountryError {
  message: string; // "Country 'X' is not recognized..."
  code: "INVALID_COUNTRY";
  countryName: string;
}
```

## Cache Strategy

### Cache Key

- **Key**: `"countries"` (exported as `COUNTRIES_CACHE_KEY`)
- **Value**: `CountriesList` (array of country name strings)
- **TTL**: 10 minutes (600,000 milliseconds)
- **Storage**: In-memory cache (`lib/utils/cache.ts`)

### Cache Invalidation

- **Automatic**: Cache expires after TTL (10 minutes)
- **Manual**: Not needed (countries list changes infrequently)
- **Refresh**: On cache miss, fetch from REST Countries API

### Normalized Lookup Cache

- **Storage**: Created alongside countries list, not separately cached
- **Lifetime**: Same as countries list cache
- **Purpose**: Enable O(1) validation lookups

