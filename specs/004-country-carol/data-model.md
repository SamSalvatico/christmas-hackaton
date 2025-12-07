# Data Model: Country Christmas Carol

**Date**: 2024-12-19  
**Feature**: Country Christmas Carol

## Entities

### ChristmasCarol

Represents a famous Christmas carol from a country.

**Attributes**:
- `name` (string): The carol name
  - **Type**: `string`
  - **Required**: Yes
  - **Validation**: Non-empty string, trimmed
  - **Example**: `"Silent Night"`, `"Jingle Bells"`, `"O Holy Night"`
- `author` (string | null): Author/composer of the carol
  - **Type**: `string | null`
  - **Required**: No (optional)
  - **Validation**: If not null, must be non-empty string. Can be null for traditional/folk carols where author is unknown
  - **Example**: `"Franz Xaver Gruber"`, `"James Lord Pierpont"`, `null`
- `country` (string): Country name this carol belongs to
  - **Type**: `string`
  - **Required**: Yes
  - **Validation**: Non-empty string, matches selected country name
  - **Example**: `"Austria"`, `"United States"`, `"France"`

**Source**: Extracted from OpenAI API response after parsing and validation

**Usage**: 
- Stored in cache as part of `CountryCulturalData`
- Displayed on page alongside dishes
- Used for validation before caching

### CountryCulturalData

Represents the combined response for dishes and carol for a country.

**Attributes**:
- `dishes` (DishesResponse): Dishes response structure (from feature 003)
  - **Type**: `DishesResponse`
  - **Required**: Yes
  - **Validation**: Must be a valid DishesResponse (at least one non-null category)
- `carol` (ChristmasCarol | null): Christmas carol or null if not available
  - **Type**: `ChristmasCarol | null`
  - **Required**: No (can be null)
  - **Validation**: If not null, must be a valid ChristmasCarol object with name and optional author

**Validation Rules**:
- At least one of dishes or carol must be present (dishes must have at least one non-null category OR carol must be non-null)
- If both dishes and carol are missing/invalid, response is considered invalid
- Dishes validation follows feature 003 rules (at least one non-null category)
- Carol validation: if present, must have non-empty name

**Usage**: 
- Returned from OpenAI API after parsing
- Cached as complete object (only if valid)
- Displayed on page as JSON

### CountryCulturalCacheEntry

Represents a cached entry for combined dishes and carol response with expiration metadata.

**Attributes**:
- `data` (CountryCulturalData): Valid combined response data
  - **Type**: `CountryCulturalData`
  - **Required**: Yes
  - **Validation**: Must be a valid CountryCulturalData (dishes valid and/or carol valid)
- `timestamp` (number): Unix timestamp (milliseconds) when cache was created
  - **Type**: `number`
  - **Required**: Yes
  - **Validation**: Positive integer, represents milliseconds since epoch
- `ttl` (number): Time-to-live in milliseconds (20 minutes = 1,200,000ms)
  - **Type**: `number`
  - **Required**: Yes
  - **Validation**: Positive integer, fixed at 1,200,000ms (20 minutes)

**Cache Key**: `'dishes:{countryName}'` (same as feature 003, but now contains combined data)

**Expiration Logic**:
```typescript
const isExpired = (Date.now() - entry.timestamp) > entry.ttl;
```

**Storage**: In-memory `Map<string, CountryCulturalCacheEntry>` (reuses existing cache utility)

**Important**: Only valid responses are cached. Invalid or malformed responses are not stored.

## Request/Response Structures

### POST /api/dishes Request

**Method**: `POST`  
**Path**: `/api/dishes`  
**Query Parameters**: None  
**Headers**: 
- `Content-Type: application/json`
- Standard Next.js request headers

**Body**:
```typescript
{
  country: string; // Country name
}
```

**Example**:
```json
{
  "country": "Italy"
}
```

**Note**: Same request structure as feature 003. No changes needed.

### POST /api/dishes Response

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: CountryCulturalData;
}
```

**Example** (with dishes and carol):
```json
{
  "success": true,
  "data": {
    "dishes": {
      "entry": {
        "name": "Bruschetta",
        "description": "Toasted bread topped with fresh tomatoes, garlic, and basil.",
        "ingredients": ["bread", "tomatoes", "garlic", "basil", "olive oil", "salt"]
      },
      "main": {
        "name": "Pasta Carbonara",
        "description": "A classic Roman pasta dish made with eggs, cheese, pancetta, and black pepper.",
        "ingredients": ["pasta", "eggs", "pecorino cheese", "pancetta", "black pepper"]
      },
      "dessert": {
        "name": "Tiramisu",
        "description": "A coffee-flavored Italian dessert made with ladyfingers, mascarpone, and cocoa.",
        "ingredients": ["ladyfingers", "mascarpone", "coffee", "cocoa powder", "eggs", "sugar"]
      }
    },
    "carol": {
      "name": "Tu scendi dalle stelle",
      "author": "Alfonso Maria de' Liguori"
    }
  }
}
```

**Example** (with dishes but no carol):
```json
{
  "success": true,
  "data": {
    "dishes": {
      "entry": {
        "name": "Sushi",
        "description": "Vinegared rice with seafood and vegetables.",
        "ingredients": ["rice", "fish", "seaweed", "vegetables"]
      },
      "main": null,
      "dessert": {
        "name": "Mochi",
        "description": "Sweet rice cake with various fillings.",
        "ingredients": ["rice", "sugar", "filling"]
      }
    },
    "carol": null
  }
}
```

**Example** (carol without author):
```json
{
  "success": true,
  "data": {
    "dishes": { ... },
    "carol": {
      "name": "Traditional Folk Carol",
      "author": null
    }
  }
}
```

**Error Response** (400 Bad Request):
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
    "message": "Country name is required"
  }
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

**Examples**:
```json
{
  "success": false,
  "error": {
    "message": "No famous dishes or carol found for this country. Please try another country."
  }
}
```

```json
{
  "success": false,
  "error": {
    "message": "Service is temporarily unavailable. Please try again in a moment."
  }
}
```

### OpenAI API Response

**Endpoint**: OpenAI Chat Completions API (same as feature 003)

**Request Structure**:
```typescript
{
  model: string; // e.g., "gpt-4"
  messages: Array<{
    role: "user";
    content: string; // Combined prompt for dishes and carol
  }>;
  response_format: {
    type: "json_object";
  };
  temperature: number; // 0.7
  max_tokens: number; // 1000 (may need increase for combined response)
}
```

**Response Structure** (OpenAI):
```typescript
{
  choices: Array<{
    message: {
      content: string; // JSON string containing dishes and carol
    };
  }>;
  usage: {
    total_tokens: number;
  };
}
```

**Parsed Content** (from `content` field):
```typescript
{
  dishes: DishesResponse;
  carol: {
    name: string;
    author: string | null;
  } | null;
}
```

## Validation Rules

### ChristmasCarol Validation

1. **Name Required**: Carol name must not be empty or whitespace-only
2. **Author Optional**: Author can be null or non-empty string
3. **Country Required**: Country name must not be empty

### CountryCulturalData Validation

1. **At Least One Required**: Either dishes must have at least one non-null category OR carol must be non-null
2. **Valid Dishes**: If dishes present, must be valid DishesResponse (at least one non-null category)
3. **Valid Carol**: If carol present, must have non-empty name

### Cache Entry Validation

1. **Data Required**: Cache entry must have valid CountryCulturalData
2. **Timestamp Required**: Cache entry must have valid `timestamp` (positive integer)
3. **TTL Fixed**: Cache entry must have `ttl` of exactly 1,200,000ms (20 minutes)
4. **Expiration Check**: Cache entry is considered expired if `(Date.now() - timestamp) > ttl`
5. **Only Valid Responses**: Only valid, successfully parsed responses are cached

### API Request Validation

1. **Country Required**: Request must include non-empty `country` field
2. **Country Format**: Country name must be a string

### API Response Validation

1. **Success Response**: Must have `success: true` and `data: CountryCulturalData`
2. **Error Response**: Must have `success: false` and `error: { message: string }`
3. **Data Format**: `data` must be a valid CountryCulturalData (dishes valid and/or carol valid)

## State Transitions

### Cache Lifecycle

1. **Empty**: No cache entry exists for country
   - **Trigger**: First API call for country or cache expired/cleared
   - **Action**: Query OpenAI, validate response, cache if valid

2. **Valid**: Cache entry exists and not expired
   - **Trigger**: API call within 20 minutes of cache creation
   - **Action**: Return cached data, skip OpenAI API call

3. **Expired**: Cache entry exists but TTL exceeded
   - **Trigger**: API call after 20 minutes of cache creation
   - **Action**: Query OpenAI for fresh data, validate, update cache if valid

4. **Invalid Response**: OpenAI returns invalid/malformed data
   - **Trigger**: Response fails validation or parsing
   - **Action**: Retry with refined query (max 2 attempts), do not cache invalid responses

5. **Error with Cache**: OpenAI fails but valid cache exists
   - **Trigger**: OpenAI unavailable, cache still valid
   - **Action**: Return cached data (even if expired), log warning

6. **Error without Cache**: OpenAI fails and no cache available
   - **Trigger**: OpenAI unavailable, no cache or cache expired
   - **Action**: Return error response with user-friendly message

### Query Flow

1. **User Action**: User clicks Santa Search button with country selected
2. **Request Initiated**: Client sends POST /api/dishes with country name
3. **Cache Check**: API route checks cache for valid entry
4. **Cache Hit**: If valid cache exists, return immediately
5. **Cache Miss**: If no cache or expired:
   - Query OpenAI with combined prompt (dishes + carol)
   - Parse JSON response
   - Validate response structure (dishes and/or carol)
   - If invalid: Retry with refined query (max 1 retry)
   - If valid: Cache response, return data
   - If still invalid after retry: Return error, do not cache
6. **Display**: Client receives response and displays dishes and carol on page

## Data Flow

### Combined Query Flow

```
User clicks Santa Search button
  ↓
Client sends POST /api/dishes with country
  ↓
API route checks cache
  ├─ Cache valid? → Return cached data (dishes + carol)
  └─ Cache invalid/missing? → Query OpenAI with combined prompt
      ├─ Success? → Parse and validate JSON (dishes + carol)
      │   ├─ Valid? → Cache response, return data
      │   └─ Invalid? → Retry with refined query
      │       ├─ Valid? → Cache response, return data
      │       └─ Invalid? → Return error (no cache)
      └─ Failure? → Check cache (even if expired)
          ├─ Cache exists? → Return cached data with warning
          └─ No cache? → Return error response
```

## Type Definitions

```typescript
// Christmas Carol entity
interface ChristmasCarol {
  name: string;
  author: string | null;
  country: string;
}

// Combined response structure
interface CountryCulturalData {
  dishes: DishesResponse;
  carol: ChristmasCarol | null;
}

// Cache entry structure
interface CountryCulturalCacheEntry {
  data: CountryCulturalData;
  timestamp: number; // milliseconds since epoch
  ttl: number; // milliseconds (1,200,000 = 20 minutes)
}

// API Success Response
interface CountryCulturalApiSuccessResponse {
  success: true;
  data: CountryCulturalData;
}

// API Error Response
interface CountryCulturalApiErrorResponse {
  success: false;
  error: {
    message: string;
  };
}

// API Response (union type)
type CountryCulturalApiResponse =
  | CountryCulturalApiSuccessResponse
  | CountryCulturalApiErrorResponse;

// API Request (same as feature 003)
interface DishesApiRequest {
  country: string;
}

// OpenAI Chat Completion Request (same structure, combined prompt)
interface OpenAIRequest {
  model: string;
  messages: Array<{
    role: 'user';
    content: string; // Combined prompt for dishes and carol
  }>;
  response_format: {
    type: 'json_object';
  };
  temperature: number;
  max_tokens: number; // May need increase for combined response
}

// OpenAI Chat Completion Response (same as feature 003)
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string; // JSON string containing dishes and carol
    };
  }>;
  usage: {
    total_tokens: number;
  };
}
```

