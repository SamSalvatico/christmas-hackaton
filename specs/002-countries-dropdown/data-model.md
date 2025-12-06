# Data Model: Countries Searchable Dropdown

**Date**: 2024-12-19  
**Feature**: Countries Searchable Dropdown

## Entities

### Country

Represents a country name string extracted from the REST Countries API response.

**Attributes**:
- `name` (string): The country name (from `name.common` field in API response)
  - **Type**: `string`
  - **Required**: Yes
  - **Validation**: Non-empty string, trimmed
  - **Example**: `"United States"`, `"United Kingdom"`, `"Antigua and Barbuda"`

**Source**: Extracted from REST Countries API response:
```json
{
  "name": {
    "common": "Antigua and Barbuda",
    "official": "Antigua and Barbuda",
    "nativeName": { ... }
  }
}
```

**Usage**: 
- Stored in cache as array of strings: `string[]`
- Displayed in dropdown as `SelectItem` components
- Used for search filtering with case-insensitive partial matching

### CountriesCacheEntry

Represents a cached entry for the countries list with expiration metadata.

**Attributes**:
- `data` (string[]): Array of country name strings
  - **Type**: `string[]`
  - **Required**: Yes
  - **Validation**: Non-empty array, all elements are non-empty strings
- `timestamp` (number): Unix timestamp (milliseconds) when cache was created
  - **Type**: `number`
  - **Required**: Yes
  - **Validation**: Positive integer, represents milliseconds since epoch
- `ttl` (number): Time-to-live in milliseconds (10 minutes = 600,000ms)
  - **Type**: `number`
  - **Required**: Yes
  - **Validation**: Positive integer, fixed at 600,000ms (10 minutes)

**Cache Key**: `'countries'` (constant string)

**Expiration Logic**:
```typescript
const isExpired = (Date.now() - entry.timestamp) > entry.ttl;
```

**Storage**: In-memory `Map<string, CountriesCacheEntry>`

### SelectedCountry

Represents the user's selected country from the dropdown.

**Attributes**:
- `value` (string | null): Selected country name or null if none selected
  - **Type**: `string | null`
  - **Required**: No (can be null)
  - **Validation**: If not null, must be a valid country name from the countries list

**State Management**: React state in `CountryDropdown` component

**Usage**: 
- Displayed in dropdown as selected value
- Passed to "Santa Search" button action
- Logged to console when "Santa Search" is clicked

## Request/Response Structures

### GET /api/countries Request

**Method**: `GET`  
**Path**: `/api/countries`  
**Query Parameters**: None  
**Headers**: Standard Next.js request headers  
**Body**: None

### GET /api/countries Response

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: string[]; // Array of country names
}
```

**Example**:
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
```typescript
{
  success: false;
  error: {
    message: string; // User-friendly error message
  };
}
```

**Example**:
```json
{
  "success": false,
  "error": {
    "message": "Unable to load countries. Please try again later."
  }
}
```

### REST Countries API Response

**Endpoint**: `GET https://restcountries.com/v3.1/all?fields=name`

**Response Structure**:
```typescript
interface RestCountriesResponse {
  name: {
    common: string;
    official: string;
    nativeName?: {
      [key: string]: {
        official: string;
        common: string;
      };
    };
  };
}[]
```

**Transformation**: Extract `name.common` from each item to create `string[]` array

## Validation Rules

### Country Name Validation

1. **Non-empty**: Country name must not be empty or whitespace-only
2. **Trimmed**: Leading/trailing whitespace removed before storage
3. **Unique**: No duplicate country names in the array (handled by REST Countries API)

### Cache Entry Validation

1. **Data Required**: Cache entry must have non-empty `data` array
2. **Timestamp Required**: Cache entry must have valid `timestamp` (positive integer)
3. **TTL Fixed**: Cache entry must have `ttl` of exactly 600,000ms (10 minutes)
4. **Expiration Check**: Cache entry is considered expired if `(Date.now() - timestamp) > ttl`

### API Response Validation

1. **Success Response**: Must have `success: true` and `data: string[]`
2. **Error Response**: Must have `success: false` and `error: { message: string }`
3. **Data Format**: `data` must be an array of non-empty strings

## State Transitions

### Cache Lifecycle

1. **Empty**: No cache entry exists
   - **Trigger**: First API call or cache expired/cleared
   - **Action**: Fetch from REST Countries API, create cache entry

2. **Valid**: Cache entry exists and not expired
   - **Trigger**: API call within 10 minutes of cache creation
   - **Action**: Return cached data, skip external API call

3. **Expired**: Cache entry exists but TTL exceeded
   - **Trigger**: API call after 10 minutes of cache creation
   - **Action**: Fetch fresh data from REST Countries API, update cache entry

4. **Error with Cache**: External API fails but valid cache exists
   - **Trigger**: REST Countries API unavailable, cache still valid
   - **Action**: Return cached data (even if expired), log warning

5. **Error without Cache**: External API fails and no cache available
   - **Trigger**: REST Countries API unavailable, no cache or cache expired
   - **Action**: Return error response with user-friendly message

### User Selection Flow

1. **No Selection**: User has not selected a country
   - **State**: `selectedCountry = null`
   - **UI**: Dropdown shows placeholder, "Santa Search" button disabled

2. **Searching**: User is typing in dropdown search field
   - **State**: `searchTerm` changes, `filteredCountries` updates
   - **UI**: Dropdown shows filtered list, "Santa Search" button disabled

3. **Selected**: User has selected a country
   - **State**: `selectedCountry = "Country Name"`
   - **UI**: Dropdown shows selected country, "Santa Search" button enabled

4. **Action Triggered**: User clicks "Santa Search" button
   - **State**: `selectedCountry` logged to console
   - **UI**: Button shows loading state (if future enhancement), then returns to normal

## Data Flow

### Countries List Fetching

```
User loads home page
  ↓
Client component calls GET /api/countries
  ↓
API route checks cache
  ├─ Cache valid? → Return cached data
  └─ Cache invalid/missing? → Fetch from REST Countries API
      ├─ Success? → Extract name.common, cache, return data
      └─ Failure? → Check cache (even if expired)
          ├─ Cache exists? → Return cached data with warning
          └─ No cache? → Return error response
```

### Country Selection and Search

```
User types in dropdown
  ↓
searchTerm state updates
  ↓
filterCountries() function filters countries array
  ↓
filteredCountries state updates
  ↓
Dropdown displays filtered list
  ↓
User selects country
  ↓
selectedCountry state updates
  ↓
"Santa Search" button enabled
  ↓
User clicks "Santa Search"
  ↓
console.log(selectedCountry)
```

## Type Definitions

```typescript
// Country name (string)
type CountryName = string;

// Countries list (array of country names)
type CountriesList = CountryName[];

// Cache entry structure
interface CountriesCacheEntry {
  data: CountriesList;
  timestamp: number; // milliseconds since epoch
  ttl: number; // milliseconds (600,000 = 10 minutes)
}

// API Success Response
interface CountriesApiSuccessResponse {
  success: true;
  data: CountriesList;
}

// API Error Response
interface CountriesApiErrorResponse {
  success: false;
  error: {
    message: string;
  };
}

// API Response (union type)
type CountriesApiResponse = CountriesApiSuccessResponse | CountriesApiErrorResponse;

// REST Countries API Response Item
interface RestCountriesItem {
  name: {
    common: string;
    official: string;
    nativeName?: {
      [key: string]: {
        official: string;
        common: string;
      };
    };
  };
}

// REST Countries API Response
type RestCountriesResponse = RestCountriesItem[];
```

