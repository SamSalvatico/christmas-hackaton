# API Contracts: Country Christmas Carol

**Date**: 2024-12-19  
**Feature**: Country Christmas Carol

## Endpoints

### POST /api/dishes

Queries OpenAI to retrieve famous dishes and a Christmas carol for a selected country in a single request. Returns dishes categorized by type (entry, main, dessert) and a famous Christmas carol with name and optional author.

**Note**: This endpoint extends feature 003. The request structure remains the same, but the response now includes carol information alongside dishes.

#### Request

**Method**: `POST`  
**Path**: `/api/dishes`  
**Query Parameters**: None  
**Headers**:

- `Content-Type: application/json`
- Standard Next.js request headers
- No authentication required (OpenAI API key stored server-side)

**Body Schema**:
```typescript
{
  country: string; // Country name
}
```

**Example Request**:
```http
POST /api/dishes HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "country": "Italy"
}
```

#### Response

**Success Response** (200 OK):

**Schema**:
```typescript
{
  success: true;
  data: {
    dishes: {
      entry: {
        name: string;
        description: string;
        ingredients: string[];
      } | null;
      main: {
        name: string;
        description: string;
        ingredients: string[];
      } | null;
      dessert: {
        name: string;
        description: string;
        ingredients: string[];
      } | null;
    };
    carol: {
      name: string;
      author: string | null;
    } | null;
  };
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

**Properties**:

- `success` (boolean, required): Always `true` for success response
- `data` (object, required): Combined cultural data object
  - `dishes` (object, required): Dishes response structure (same as feature 003)
    - `entry` (object | null): Entry/appetizer dish or null if not available
    - `main` (object | null): Main course dish or null if not available
    - `dessert` (object | null): Dessert dish or null if not available
  - `carol` (object | null): Christmas carol or null if not available
    - `name` (string, required): Carol name
    - `author` (string | null): Author/composer name or null if unknown

**Error Response** (400 Bad Request):

**Schema**:
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

**Schema**:
```typescript
{
  success: false;
  error: {
    message: string; // User-friendly error message
  };
}
```

**Examples**:

No dishes or carol found:
```json
{
  "success": false,
  "error": {
    "message": "No famous dishes or carol found for this country. Please try another country."
  }
}
```

Rate limited:
```json
{
  "success": false,
  "error": {
    "message": "Service is temporarily unavailable. Please try again in a moment."
  }
}
```

Service unavailable:
```json
{
  "success": false,
  "error": {
    "message": "Unable to connect to dish service. Please try again later."
  }
}
```

#### Behavior

1. **Validation**: Validate request body contains non-empty `country` field
2. **Cache Check**: Check in-memory cache for valid entry (not expired) for the country
3. **Cache Hit**: If valid cache exists, return cached data immediately (no OpenAI API call)
4. **Cache Miss**: If cache is expired or missing:
   - Query OpenAI API with combined prompt (dishes + carol) requesting JSON format
   - Parse JSON response from OpenAI
   - Validate response structure (dishes valid and/or carol valid)
   - If invalid/malformed: Retry with refined query (max 1 retry)
   - If valid: Store in cache with 20-minute TTL, return data
   - If still invalid after retry: Return error response, do not cache
5. **Error Handling**: If OpenAI API fails:
   - Check if expired cache exists (fallback)
   - If expired cache exists, return it with warning (optional)
   - If no cache exists, return error response

#### Caching

- **Storage**: In-memory cache (JavaScript `Map`)
- **Cache Key**: `'dishes:{countryName}'` (same as feature 003, but now contains combined data)
- **TTL**: 20 minutes (1,200,000 milliseconds)
- **Expiration**: Automatic based on timestamp comparison
- **Scope**: Per-instance (not shared across instances in multi-instance deployment)
- **Important**: Only valid, successfully parsed responses are cached. Invalid or malformed responses are not stored. Carol information is cached together with dishes in the same cache entry.

#### Timeout

- **OpenAI API Timeout**: 30 seconds
- **Behavior on Timeout**: Return error response (or fallback to expired cache if available)

#### Retry Logic

- **Max Retries**: 1 retry attempt for invalid/malformed responses
- **Retry Condition**: Response fails JSON parsing or validation
- **Refined Query**: Retry uses more explicit format requirements in prompt (includes both dishes and carol)
- **No Retry For**: Rate limits, service unavailability, network errors (these return errors immediately)

#### Error Codes

| HTTP Status | Scenario | Response |
|------------|----------|----------|
| 200 | Success (cached or fresh) | `{ success: true, data: CountryCulturalData }` |
| 400 | Missing or invalid country parameter | `{ success: false, error: { message: string } }` |
| 500 | No dishes or carol found | `{ success: false, error: { message: "No famous dishes or carol found..." } }` |
| 500 | OpenAI rate limit | `{ success: false, error: { message: "Service is temporarily unavailable..." } }` |
| 500 | OpenAI service unavailable | `{ success: false, error: { message: "Unable to connect..." } }` |
| 500 | Network timeout | `{ success: false, error: { message: "Request timed out..." } }` |
| 500 | Invalid response after retry | `{ success: false, error: { message: "Unable to retrieve data..." } }` |

#### Rate Limiting

- **Not Required**: This endpoint does not require rate limiting for 2-3 users
- **External API**: OpenAI API has its own rate limits (handled by OpenAI SDK)

#### Authentication

- **Not Required**: This endpoint is publicly accessible
- **OpenAI API Key**: Stored server-side in environment variable (`OPENAI_API_KEY`)

## External API Contract

### OpenAI Chat Completions API

**Endpoint**: `POST https://api.openai.com/v1/chat/completions`

**Request**:

- **Method**: `POST`
- **URL**: `https://api.openai.com/v1/chat/completions`
- **Headers**:
  - `Authorization: Bearer {OPENAI_API_KEY}`
  - `Content-Type: application/json`
- **Authentication**: Bearer token (API key from environment variable)

**Request Body**:
```typescript
{
  model: string; // e.g., "gpt-4" or "gpt-3.5-turbo"
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

**Response** (200 OK):

**Schema**:
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

**Example**:
```json
{
  "choices": [
    {
      "message": {
        "content": "{\"dishes\":{\"entry\":{\"name\":\"Bruschetta\",\"description\":\"Toasted bread topped with fresh tomatoes, garlic, and basil.\",\"ingredients\":[\"bread\",\"tomatoes\",\"garlic\",\"basil\",\"olive oil\",\"salt\"]},\"main\":{\"name\":\"Pasta Carbonara\",\"description\":\"A classic Roman pasta dish made with eggs, cheese, pancetta, and black pepper.\",\"ingredients\":[\"pasta\",\"eggs\",\"pecorino cheese\",\"pancetta\",\"black pepper\"]},\"dessert\":{\"name\":\"Tiramisu\",\"description\":\"A coffee-flavored Italian dessert made with ladyfingers, mascarpone, and cocoa.\",\"ingredients\":[\"ladyfingers\",\"mascarpone\",\"coffee\",\"cocoa powder\",\"eggs\",\"sugar\"]}},\"carol\":{\"name\":\"Tu scendi dalle stelle\",\"author\":\"Alfonso Maria de' Liguori\"}}"
      }
    }
  ],
  "usage": {
    "total_tokens": 312
  }
}
```

**Data Extraction**:

- Extract `choices[0].message.content` (JSON string)
- Parse JSON string to get combined object (dishes and carol)
- Validate structure (dishes valid and/or carol valid)
- Return validated `CountryCulturalData`

**Error Responses**:

- **401 Unauthorized**: Invalid API key → Return error "Service configuration error"
- **429 Too Many Requests**: Rate limit exceeded → Return error "Service is temporarily unavailable"
- **500 Internal Server Error**: OpenAI server error → Return error "Unable to connect to dish service"
- **Timeout**: Network timeout (30 seconds) → Return error "Request timed out"

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
```

## Testing Scenarios

### Success Scenarios

1. **First Request (Cache Miss)**:
   - Request: `POST /api/dishes` with `{ "country": "Italy" }`
   - Expected: Query OpenAI, parse response, cache if valid, return `{ success: true, data: CountryCulturalData }`
   - Response Time: <10 seconds

2. **Subsequent Request (Cache Hit)**:
   - Request: `POST /api/dishes` with `{ "country": "Italy" }` (within 20 minutes)
   - Expected: Return cached data without OpenAI API call
   - Response Time: <1 second

3. **Cache Expired (Cache Miss)**:
   - Request: `POST /api/dishes` with `{ "country": "Italy" }` (after 20 minutes)
   - Expected: Query OpenAI for fresh data, validate, update cache if valid, return data
   - Response Time: <10 seconds

4. **Dishes Only (No Carol)**:
   - Request: `POST /api/dishes` with `{ "country": "Japan" }`
   - Expected: Return dishes with `carol: null`
   - Response: `{ success: true, data: { dishes: {...}, carol: null } }`

5. **Carol Without Author**:
   - Request: `POST /api/dishes` with `{ "country": "Unknown" }`
   - Expected: Return carol with `author: null` if author unknown
   - Response: `{ success: true, data: { dishes: {...}, carol: { name: "...", author: null } } }`

### Error Scenarios

1. **Missing Country Parameter**:
   - Request: `POST /api/dishes` with `{}` or missing country
   - Expected: Return `{ success: false, error: { message: "Country name is required" } }`
   - Status: 400

2. **No Dishes or Carol Found**:
   - Request: `POST /api/dishes` with `{ "country": "UnknownCountry" }`
   - Expected: Return `{ success: false, error: { message: "No famous dishes or carol found..." } }`
   - Status: 500

3. **OpenAI Rate Limited**:
   - Request: `POST /api/dishes` (OpenAI returns 429)
   - Expected: Return `{ success: false, error: { message: "Service is temporarily unavailable..." } }`
   - Status: 500

4. **Invalid Response (Retry Success)**:
   - Request: `POST /api/dishes` (OpenAI returns malformed JSON)
   - Expected: Retry with refined query, if valid then cache and return, if still invalid return error
   - Status: 200 (if retry succeeds) or 500 (if retry fails)

5. **Service Unavailable**:
   - Request: `POST /api/dishes` (OpenAI service down)
   - Expected: Return `{ success: false, error: { message: "Unable to connect..." } }`
   - Status: 500

## Performance Requirements

- **Cache Hit Response Time**: <1 second (p95)
- **Cache Miss Response Time**: <10 seconds (p95)
- **OpenAI API Timeout**: 30 seconds
- **Cache TTL**: Exactly 20 minutes (1,200,000 milliseconds)
- **Retry Attempts**: Maximum 1 retry for invalid responses

## Security Considerations

- **API Key Security**: OpenAI API key stored in environment variable, never exposed to client
- **Input Validation**: Country name validated before querying OpenAI
- **Output Sanitization**: Carol data from OpenAI is validated before caching or returning
- **Rate Limiting**: Not required for 2-3 users, but OpenAI API has its own rate limits
- **CORS**: Handled by Next.js (same-origin for client-side requests)

