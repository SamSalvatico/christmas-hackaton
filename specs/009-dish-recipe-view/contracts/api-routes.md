# API Contracts: Dish Recipe Viewing

**Date**: 2024-12-19  
**Feature**: 009-dish-recipe-view

## Endpoints

### POST /api/recipe

Queries OpenAI to retrieve step-by-step recipe instructions for a specific dish from a country. Uses the selected search mode (fast or detailed) to generate recipes with appropriate detail level. Implements independent caching per dish, country, and mode combination.

**Note**: This is a new endpoint that extends the existing API to support recipe viewing functionality.

#### Request

**Method**: `POST`  
**Path**: `/api/recipe`  
**Query Parameters**: None  
**Headers**:

- `Content-Type: application/json`
- Standard Next.js request headers
- No authentication required (OpenAI API key stored server-side)

**Body Schema**:
```typescript
{
  country: string;        // Country name (required)
  dishName: string;       // Dish name (required)
  mode?: 'fast' | 'detailed'; // Search mode (optional, defaults to 'fast')
}
```

**Field Descriptions**:
- `country` (string, required): Name of the country where the dish originates. Must be non-empty after trimming.
- `dishName` (string, required): Name of the dish to get recipe for. Must be non-empty after trimming.
- `mode` (string, optional): Response mode selection.
  - `'fast'`: Fast search mode using fast mode model (default)
  - `'detailed'`: Detective Santa mode using detailed mode model
  - If omitted, defaults to `'fast'` for backward compatibility

**Example Request (Fast Mode - Default)**:
```http
POST /api/recipe HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "country": "Italy",
  "dishName": "Pasta Carbonara"
}
```

**Example Request (Fast Mode - Explicit)**:
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

**Example Request (Detailed Mode)**:
```http
POST /api/recipe HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "country": "Italy",
  "dishName": "Pasta Carbonara",
  "mode": "detailed"
}
```

#### Response

**Success Response** (200 OK):

**Schema**:
```typescript
{
  success: true;
  data: {
    steps: Array<{
      stepNumber: number;
      instruction: string;
      details?: string;
    }>;
  };
}
```

**Response Characteristics by Mode**:

- **Fast Mode** (`mode: 'fast'`):
  - Uses fast mode model
  - Concise step-by-step instructions
  - Essential cooking information only

- **Detailed Mode** (`mode: 'detailed'`):
  - Uses detailed mode model
  - Comprehensive step-by-step instructions
  - Additional context (cooking tips, timing, temperature details)

**Example Response (Fast Mode)**:
```json
{
  "success": true,
  "data": {
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Bring a large pot of salted water to a boil.",
        "details": "Use about 1 tablespoon of salt per 4 quarts of water"
      },
      {
        "stepNumber": 2,
        "instruction": "Cook the pasta according to package directions until al dente.",
        "details": "Typically 8-10 minutes for spaghetti"
      },
      {
        "stepNumber": 3,
        "instruction": "While pasta cooks, whisk together eggs and grated cheese in a bowl.",
        "details": null
      },
      {
        "stepNumber": 4,
        "instruction": "Cook pancetta in a large pan until crispy.",
        "details": "About 5-7 minutes over medium heat"
      },
      {
        "stepNumber": 5,
        "instruction": "Drain pasta, reserving some pasta water, then add to pan with pancetta.",
        "details": null
      },
      {
        "stepNumber": 6,
        "instruction": "Remove pan from heat and quickly stir in egg mixture, adding pasta water as needed.",
        "details": "The residual heat will cook the eggs without scrambling them"
      },
      {
        "stepNumber": 7,
        "instruction": "Season with black pepper and serve immediately.",
        "details": null
      }
    ]
  }
}
```

**Example Response (Detailed Mode)**:
```json
{
  "success": true,
  "data": {
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Prepare your mise en place: Bring a large pot of generously salted water to a rolling boil.",
        "details": "Use approximately 1 tablespoon of coarse sea salt per 4 quarts (3.8 liters) of water. The water should taste like the sea - this is crucial for properly seasoning the pasta from within. Use a pot large enough to allow the pasta to move freely while cooking."
      },
      {
        "stepNumber": 2,
        "instruction": "Cook 1 pound (450g) of high-quality spaghetti or rigatoni according to package directions until perfectly al dente.",
        "details": "Al dente means 'to the tooth' - the pasta should have a slight bite. For most dried pasta, this is 8-10 minutes. Start testing 2 minutes before the package suggests. The pasta will continue cooking slightly when added to the hot pan, so slightly undercook it. Reserve at least 1 cup of the starchy pasta water before draining - this is essential for creating the creamy sauce."
      },
      {
        "stepNumber": 3,
        "instruction": "While the pasta water comes to a boil, prepare the egg and cheese mixture: In a large bowl, whisk together 4 large fresh eggs (preferably free-range or organic) with 1 cup of freshly grated Pecorino Romano cheese.",
        "details": "Use room temperature eggs for best results. The cheese should be freshly grated from a block - pre-grated cheese contains anti-caking agents that can affect the texture. Some traditional recipes use a mix of Pecorino and Parmigiano-Reggiano, but authentic Roman carbonara uses only Pecorino Romano. Whisk until the mixture is smooth and well-combined."
      },
      {
        "stepNumber": 4,
        "instruction": "Cut 6-8 ounces (170-225g) of guanciale (or pancetta if guanciale is unavailable) into 1/4-inch cubes. Cook in a large skillet over medium-low heat until the fat renders and the pieces become golden and crispy, about 8-10 minutes.",
        "details": "Guanciale is cured pork jowl and is the traditional choice for authentic carbonara. It has more fat than pancetta, which contributes to the dish's richness. Start with a cold pan to render the fat slowly. The rendered fat is crucial for the sauce. Do not drain the fat - it's essential for the recipe. The crispy pieces should be golden brown but not burnt."
      },
      {
        "stepNumber": 5,
        "instruction": "Drain the cooked pasta, reserving at least 1 cup of the starchy pasta water. Immediately add the hot pasta to the skillet with the guanciale and its rendered fat, tossing to coat.",
        "details": "Work quickly here - the pasta should be very hot when added to the pan. The heat from the pasta and pan will help create the sauce. Toss the pasta well to ensure each strand is coated with the rendered fat. This step helps the sauce adhere to the pasta."
      },
      {
        "stepNumber": 6,
        "instruction": "Remove the skillet from the heat completely. Wait 30 seconds, then quickly pour in the egg and cheese mixture while continuously tossing the pasta vigorously.",
        "details": "This is the critical step - removing from heat prevents the eggs from scrambling. The residual heat from the pasta and pan will gently cook the eggs, creating a creamy, silky sauce. If the pan is too hot, you'll get scrambled eggs. If it's too cold, the sauce won't thicken. Toss continuously and quickly to distribute the sauce evenly. The motion should be almost like you're making a risotto - constant movement."
      },
      {
        "stepNumber": 7,
        "instruction": "Add reserved pasta water, one tablespoon at a time, while continuing to toss, until the sauce reaches a creamy consistency that coats the pasta.",
        "details": "The starchy pasta water is the secret to the perfect carbonara sauce. Add it gradually - you may need 2-4 tablespoons. The sauce should be creamy and smooth, not watery or clumpy. If it becomes too thin, you've added too much water. If it's too thick, add a bit more. The consistency should be similar to a loose custard."
      },
      {
        "stepNumber": 8,
        "instruction": "Season generously with freshly ground black pepper (at least 1 teaspoon, or to taste) and serve immediately in warm bowls.",
        "details": "Carbonara gets its name from 'carbonaro' (charcoal worker), and the black pepper represents the charcoal. Use a pepper mill for the freshest flavor. Some recipes call for additional cheese on top, but traditional Roman carbonara doesn't. Serve immediately - carbonara waits for no one. The dish should be eaten hot, as the sauce will continue to thicken as it cools."
      }
    ]
  }
}
```

**Error Response** (400 Bad Request):

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

1. **Missing Country**:
```json
{
  "success": false,
  "error": {
    "message": "Country name is required"
  }
}
```

2. **Missing Dish Name**:
```json
{
  "success": false,
  "error": {
    "message": "Dish name is required"
  }
}
```

3. **Invalid Mode** (if mode validation is strict):
```json
{
  "success": false,
  "error": {
    "message": "Invalid mode. Must be 'fast' or 'detailed'"
  }
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
    "message": "Service is temporarily unavailable. Please try again in a moment."
  }
}
```

2. **Unable to Connect**:
```json
{
  "success": false,
  "error": {
    "message": "Unable to connect to recipe service. Please try again later."
  }
}
```

3. **Recipe Generation Failed**:
```json
{
  "success": false,
  "error": {
    "message": "Unable to generate recipe for this dish. Please try again later."
  }
}
```

4. **Invalid Recipe Format**:
```json
{
  "success": false,
  "error": {
    "message": "Recipe format is invalid. Please try again."
  }
}
```

5. **Generic Error**:
```json
{
  "success": false,
  "error": {
    "message": "Unable to retrieve recipe: [error details]. Please try again later."
  }
}
```

## Caching Behavior

### Cache Key Format

Cache keys follow the pattern: `recipe:{dishName}:{country}:{mode}`

**Examples**:
- Fast mode for Pasta Carbonara from Italy: `recipe:pasta-carbonara:italy:fast`
- Detailed mode for Pasta Carbonara from Italy: `recipe:pasta-carbonara:italy:detailed`
- Fast mode for Tiramisu from Italy: `recipe:tiramisu:italy:fast`
- Fast mode for Pasta Carbonara from France: `recipe:pasta-carbonara:france:fast`

### Cache TTL

- **TTL**: 20 minutes (1,200,000 milliseconds)
- **Scope**: Independent per dish, country, and mode
- **Behavior**: Each combination maintains its own cache entry

### Cache Isolation

- Fast mode and detailed mode cache entries are completely independent
- Same dish from different countries have separate cache entries
- Searching for the same dish in different modes will:
  1. Check cache for the specific mode only
  2. Generate new recipe if cache miss
  3. Store result in mode-specific cache key

### Cache Flow

```
Request: { country: "Italy", dishName: "Pasta Carbonara", mode: "fast" }
  ↓
Cache Key: "recipe:pasta-carbonara:italy:fast"
  ↓
Check cache → Hit: Return cached recipe
           → Miss: Query OpenAI (fast mode model) → Parse recipe → Cache result → Return recipe

Request: { country: "Italy", dishName: "Pasta Carbonara", mode: "detailed" }
  ↓
Cache Key: "recipe:pasta-carbonara:italy:detailed"
  ↓
Check cache → Hit: Return cached recipe
           → Miss: Query OpenAI (detailed mode model) → Parse recipe → Cache result → Return recipe
```

## Backward Compatibility

### API Design

The endpoint is new, so there are no existing clients to maintain backward compatibility with. However, the design follows existing patterns:
- Request/response structure consistent with `/api/cultural-data`
- Error handling patterns match existing endpoints
- Mode parameter is optional with default value

## Performance Characteristics

### Fast Mode
- **Model**: Fast mode model (same as fast search)
- **Target Response Time**: Faster than detailed mode
- **Content**: Concise step-by-step instructions
- **Use Case**: Quick recipe reference

### Detailed Mode
- **Model**: Detailed mode model (same as detailed search)
- **Target Response Time**: Slower but more comprehensive
- **Content**: Detailed step-by-step instructions with context
- **Use Case**: Comprehensive recipe with tips and details

### Cached Responses
- **Response Time**: < 100ms (near-instant)
- **Cache Hit Rate Target**: ≥ 80% for repeated requests within TTL

## Rate Limiting

No rate limiting implemented at the API level. OpenAI API rate limits apply based on API key configuration.

## Notes

- Mode parameter is optional for consistency with existing API patterns
- Invalid mode values default to 'fast'
- Cache entries are independent per dish, country, and mode to prevent cross-contamination
- Response structure is identical for both modes; only content detail differs
- Recipe steps are always returned in sequential order (stepNumber 1, 2, 3, ...)
- The `details` field in steps is optional and may be null or omitted

