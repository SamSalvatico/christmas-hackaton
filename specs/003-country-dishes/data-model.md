# Data Model: Country Famous Dishes

**Date**: 2024-12-19  
**Feature**: Country Famous Dishes

## Entities

### Dish

Represents a famous dish from a country with its details.

**Attributes**:
- `name` (string): The dish name
  - **Type**: `string`
  - **Required**: Yes
  - **Validation**: Non-empty string, trimmed
  - **Example**: `"Pasta Carbonara"`, `"Tiramisu"`, `"Bruschetta"`
- `description` (string): Brief description of the dish
  - **Type**: `string`
  - **Required**: Yes
  - **Validation**: Non-empty string, typically 1-3 sentences
  - **Example**: `"A classic Roman pasta dish made with eggs, cheese, pancetta, and black pepper."`
- `ingredients` (string[]): List of main ingredients
  - **Type**: `string[]`
  - **Required**: Yes
  - **Validation**: Non-empty array, all elements are non-empty strings
  - **Display**: First 8 ingredients shown, then "There's more!" if list exceeds 8 items
  - **Example**: `["pasta", "eggs", "pecorino cheese", "pancetta", "black pepper"]`
- `type` (string): Category of the dish
  - **Type**: `"entry" | "main" | "dessert"`
  - **Required**: Yes
  - **Validation**: Must be one of: "entry", "main", "dessert"
  - **Values**: 
    - `"entry"`: Appetizer/starter dish
    - `"main"`: Main course dish
    - `"dessert"`: Dessert dish
- `country` (string): Country name this dish belongs to
  - **Type**: `string`
  - **Required**: Yes
  - **Validation**: Non-empty string, matches selected country name
  - **Example**: `"Italy"`, `"France"`, `"Japan"`

**Source**: Extracted from OpenAI API response after parsing and validation

**Usage**: 
- Stored in cache as part of `DishesResponse`
- Displayed on page as JSON (initially)
- Used for validation before caching

### DishesResponse

Represents the complete response for dishes of a country, organized by category.

**Attributes**:
- `entry` (Dish | null): Entry/appetizer dish or null if not available
  - **Type**: `Dish | null`
  - **Required**: No (can be null)
  - **Validation**: If not null, must be a valid Dish object with type "entry"
- `main` (Dish | null): Main course dish or null if not available
  - **Type**: `Dish | null`
  - **Required**: No (can be null)
  - **Validation**: If not null, must be a valid Dish object with type "main"
- `dessert` (Dish | null): Dessert dish or null if not available
  - **Type**: `Dish | null`
  - **Required**: No (can be null)
  - **Validation**: If not null, must be a valid Dish object with type "dessert"

**Validation Rules**:
- At least one category (entry, main, or dessert) must be non-null
- If all categories are null, response is considered invalid (no dishes found)
- Each non-null category must contain a valid Dish object

**Usage**: 
- Returned from OpenAI API after parsing
- Cached as complete object (only if valid)
- Displayed on page as JSON

### DishesCacheEntry

Represents a cached entry for dishes response with expiration metadata.

**Attributes**:
- `data` (DishesResponse): Valid dishes response data
  - **Type**: `DishesResponse`
  - **Required**: Yes
  - **Validation**: Must be a valid DishesResponse (at least one non-null category)
- `timestamp` (number): Unix timestamp (milliseconds) when cache was created
  - **Type**: `number`
  - **Required**: Yes
  - **Validation**: Positive integer, represents milliseconds since epoch
- `ttl` (number): Time-to-live in milliseconds (20 minutes = 1,200,000ms)
  - **Type**: `number`
  - **Required**: Yes
  - **Validation**: Positive integer, fixed at 1,200,000ms (20 minutes)

**Cache Key**: `'dishes:{countryName}'` (country name as part of key)

**Expiration Logic**:
```typescript
const isExpired = (Date.now() - entry.timestamp) > entry.ttl;
```

**Storage**: In-memory `Map<string, DishesCacheEntry>`

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

### POST /api/dishes Response

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: DishesResponse;
}
```

**Example**:
```json
{
  "success": true,
  "data": {
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
  }
}
```

**Partial Response Example** (only some categories available):
```json
{
  "success": true,
  "data": {
    "entry": null,
    "main": {
      "name": "Sushi",
      "description": "Vinegared rice with seafood and vegetables.",
      "ingredients": ["rice", "fish", "seaweed", "vegetables"]
    },
    "dessert": {
      "name": "Mochi",
      "description": "Sweet rice cake with various fillings.",
      "ingredients": ["rice", "sugar", "filling"]
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
    "message": "No famous dishes found for this country. Please try another country."
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

**Endpoint**: OpenAI Chat Completions API

**Request Structure**:
```typescript
{
  model: string; // e.g., "gpt-4"
  messages: Array<{
    role: "user";
    content: string; // Structured prompt
  }>;
  response_format: {
    type: "json_object";
  };
  temperature: number; // 0.7
  max_tokens: number; // 1000
}
```

**Response Structure** (OpenAI):
```typescript
{
  choices: Array<{
    message: {
      content: string; // JSON string
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
  entry: Dish | null;
  main: Dish | null;
  dessert: Dish | null;
}
```

## Validation Rules

### Dish Validation

1. **Name Required**: Dish name must not be empty or whitespace-only
2. **Description Required**: Dish description must not be empty
3. **Ingredients Required**: Ingredients array must have at least one item
4. **Type Valid**: Dish type must be "entry", "main", or "dessert"
5. **Type Consistency**: Dish type must match the category it's placed in

### DishesResponse Validation

1. **At Least One Category**: At least one of entry, main, or dessert must be non-null
2. **Valid Dishes**: Each non-null category must contain a valid Dish object
3. **Type Matching**: Dish.type must match its category (entry dish has type "entry")

### Cache Entry Validation

1. **Data Required**: Cache entry must have valid DishesResponse (at least one non-null category)
2. **Timestamp Required**: Cache entry must have valid `timestamp` (positive integer)
3. **TTL Fixed**: Cache entry must have `ttl` of exactly 1,200,000ms (20 minutes)
4. **Expiration Check**: Cache entry is considered expired if `(Date.now() - timestamp) > ttl`
5. **Only Valid Responses**: Only valid, successfully parsed responses are cached

### API Request Validation

1. **Country Required**: Request must include non-empty `country` field
2. **Country Format**: Country name must be a string

### API Response Validation

1. **Success Response**: Must have `success: true` and `data: DishesResponse`
2. **Error Response**: Must have `success: false` and `error: { message: string }`
3. **Data Format**: `data` must be a valid DishesResponse (at least one non-null category)

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
   - Query OpenAI with structured prompt
   - Parse JSON response
   - Validate response structure
   - If invalid: Retry with refined query (max 1 retry)
   - If valid: Cache response, return data
   - If still invalid after retry: Return error, do not cache
6. **Display**: Client receives response and displays JSON on page

## Data Flow

### Dish Query Flow

```
User clicks Santa Search button
  ↓
Client sends POST /api/dishes with country
  ↓
API route checks cache
  ├─ Cache valid? → Return cached data
  └─ Cache invalid/missing? → Query OpenAI
      ├─ Success? → Parse and validate JSON
      │   ├─ Valid? → Cache response, return data
      │   └─ Invalid? → Retry with refined query
      │       ├─ Valid? → Cache response, return data
      │       └─ Invalid? → Return error (no cache)
      └─ Failure? → Check cache (even if expired)
          ├─ Cache exists? → Return cached data with warning
          └─ No cache? → Return error response
```

### Ingredient List Display

```
Dish has ingredients array
  ↓
Check array length
  ├─ length <= 8? → Display all ingredients
  └─ length > 8? → Display first 8 + "There's more!" message
```

## Type Definitions

```typescript
// Dish entity
interface Dish {
  name: string;
  description: string;
  ingredients: string[];
  type: 'entry' | 'main' | 'dessert';
  country: string;
}

// Dishes response structure
interface DishesResponse {
  entry: Dish | null;
  main: Dish | null;
  dessert: Dish | null;
}

// Cache entry structure
interface DishesCacheEntry {
  data: DishesResponse;
  timestamp: number; // milliseconds since epoch
  ttl: number; // milliseconds (1,200,000 = 20 minutes)
}

// API Success Response
interface DishesApiSuccessResponse {
  success: true;
  data: DishesResponse;
}

// API Error Response
interface DishesApiErrorResponse {
  success: false;
  error: {
    message: string;
  };
}

// API Response (union type)
type DishesApiResponse = DishesApiSuccessResponse | DishesApiErrorResponse;

// API Request
interface DishesApiRequest {
  country: string;
}

// OpenAI Chat Completion Request
interface OpenAIRequest {
  model: string;
  messages: Array<{
    role: 'user';
    content: string;
  }>;
  response_format: {
    type: 'json_object';
  };
  temperature: number;
  max_tokens: number;
}

// OpenAI Chat Completion Response
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string; // JSON string
    };
  }>;
  usage: {
    total_tokens: number;
  };
}
```

