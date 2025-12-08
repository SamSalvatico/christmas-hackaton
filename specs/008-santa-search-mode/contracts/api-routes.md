# API Contracts: Santa Search Response Mode Selection

**Date**: 2024-12-19  
**Feature**: 008-santa-search-mode

## Endpoints

### POST /api/cultural-data

Queries OpenAI to retrieve comprehensive cultural data (famous dishes and Christmas carol) for a selected country. Now supports optional `mode` parameter to select between fast response (gpt-3.5-turbo) and detailed response (o4-mini) modes. Implements independent caching per mode.

**Note**: This endpoint extends the existing `/api/cultural-data` endpoint. The request structure is extended with an optional `mode` parameter for backward compatibility.

#### Request

**Method**: `POST`  
**Path**: `/api/cultural-data`  
**Query Parameters**: None  
**Headers**:

- `Content-Type: application/json`
- Standard Next.js request headers
- No authentication required (OpenAI API key stored server-side)

**Body Schema**:
```typescript
{
  country: string;        // Country name (required)
  mode?: 'fast' | 'detailed'; // Search mode (optional, defaults to 'fast')
}
```

**Field Descriptions**:
- `country` (string, required): Name of the country to query cultural data for. Must be non-empty after trimming.
- `mode` (string, optional): Response mode selection. 
  - `'fast'`: Fast search mode using gpt-3.5-turbo model (default)
  - `'detailed'`: Detective Santa mode using o4-mini model
  - If omitted, defaults to `'fast'` for backward compatibility

**Example Request (Fast Mode - Default)**:
```http
POST /api/cultural-data HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "country": "Italy"
}
```

**Example Request (Fast Mode - Explicit)**:
```http
POST /api/cultural-data HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "country": "Italy",
  "mode": "fast"
}
```

**Example Request (Detailed Mode)**:
```http
POST /api/cultural-data HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "country": "Italy",
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
    dishes: {
      entry: {
        name: string;
        description: string;
        ingredients: string[];
        country?: string;
        type?: 'entry';
      } | null;
      main: {
        name: string;
        description: string;
        ingredients: string[];
        country?: string;
        type?: 'main';
      } | null;
      dessert: {
        name: string;
        description: string;
        ingredients: string[];
        country?: string;
        type?: 'dessert';
      } | null;
    };
    carol: {
      name: string;
      author: string | null;
      country: string;
    } | null;
    spotifyUrl?: string | null;
  };
}
```

**Response Characteristics by Mode**:

- **Fast Mode** (`mode: 'fast'`):
  - Uses `gpt-3.5-turbo` model
  - Faster response time (target: 30% faster than detailed mode)
  - Concise descriptions (1-3 sentences)
  - Essential information only

- **Detailed Mode** (`mode: 'detailed'`):
  - Uses `o4-mini` model
  - Slower response time but more comprehensive
  - Detailed descriptions with cultural context
  - Extensive ingredient lists
  - Additional historical/cultural information

**Example Response (Fast Mode)**:
```json
{
  "success": true,
  "data": {
    "dishes": {
      "entry": {
        "name": "Bruschetta",
        "description": "Toasted bread topped with fresh tomatoes, garlic, and basil.",
        "ingredients": ["bread", "tomatoes", "garlic", "basil", "olive oil"],
        "country": "Italy",
        "type": "entry"
      },
      "main": {
        "name": "Pasta Carbonara",
        "description": "Classic Roman pasta with eggs, cheese, and pancetta.",
        "ingredients": ["pasta", "eggs", "pecorino", "pancetta", "pepper"],
        "country": "Italy",
        "type": "main"
      },
      "dessert": {
        "name": "Tiramisu",
        "description": "Coffee-flavored dessert with ladyfingers and mascarpone.",
        "ingredients": ["ladyfingers", "mascarpone", "coffee", "cocoa"],
        "country": "Italy",
        "type": "dessert"
      }
    },
    "carol": {
      "name": "Tu scendi dalle stelle",
      "author": null,
      "country": "Italy"
    },
    "spotifyUrl": "https://open.spotify.com/track/..."
  }
}
```

**Example Response (Detailed Mode)**:
```json
{
  "success": true,
  "data": {
    "dishes": {
      "entry": {
        "name": "Bruschetta",
        "description": "Bruschetta is a traditional Italian antipasto that originated in central Italy during the 15th century. The name comes from the Italian word 'bruscare', meaning 'to roast over coals'. This simple yet flavorful dish consists of grilled bread rubbed with garlic and topped with fresh, ripe tomatoes, basil, and high-quality extra virgin olive oil. It's a staple of Italian Christmas Eve celebrations, often served as part of the 'Cena della Vigilia' (Christmas Eve dinner) which traditionally features fish and vegetarian dishes.",
        "ingredients": [
          "rustic Italian bread (preferably ciabatta or pugliese)",
          "ripe cherry tomatoes",
          "fresh garlic cloves",
          "fresh basil leaves",
          "extra virgin olive oil",
          "sea salt",
          "black pepper",
          "optional: balsamic vinegar reduction"
        ],
        "country": "Italy",
        "type": "entry"
      },
      "main": {
        "name": "Pasta Carbonara",
        "description": "Pasta Carbonara is a beloved Roman pasta dish that has become a Christmas tradition in many Italian households. Despite popular misconceptions, authentic carbonara contains no cream—only eggs, cheese, pancetta (or guanciale), and black pepper. The dish's origins are debated, with some theories suggesting it was created by Italian charcoal workers ('carbonari') in the mid-20th century. The key to perfect carbonara is the technique of combining hot pasta with raw eggs off the heat, creating a creamy sauce without scrambling. During Christmas, it's often served as a rich, comforting main course that brings families together.",
        "ingredients": [
          "spaghetti or rigatoni pasta",
          "fresh eggs (preferably free-range)",
          "pecorino romano cheese (freshly grated)",
          "guanciale or pancetta (cubed)",
          "freshly ground black pepper",
          "sea salt for pasta water",
          "optional: parmesan cheese for additional flavor"
        ],
        "country": "Italy",
        "type": "main"
      },
      "dessert": {
        "name": "Tiramisu",
        "description": "Tiramisu, meaning 'pick me up' in Italian, is a modern classic that has become synonymous with Italian Christmas desserts. While its exact origins are disputed (with claims from both Veneto and Friuli-Venezia Giulia regions), it gained popularity in the 1980s. This elegant dessert features layers of coffee-soaked ladyfingers, rich mascarpone cream, and cocoa powder. The combination of coffee, cream, and alcohol creates a sophisticated flavor profile that perfectly concludes a festive Christmas meal. Many families have their own secret recipes passed down through generations.",
        "ingredients": [
          "ladyfinger biscuits (savoiardi)",
          "mascarpone cheese (room temperature)",
          "strong espresso coffee (cooled)",
          "eggs (separated)",
          "granulated sugar",
          "unsweetened cocoa powder",
          "marsala wine or coffee liqueur (optional)",
          "dark chocolate shavings (for garnish)"
        ],
        "country": "Italy",
        "type": "dessert"
      }
    },
    "carol": {
      "name": "Tu scendi dalle stelle",
      "author": "Alfonso Maria de' Liguori",
      "country": "Italy"
    },
    "spotifyUrl": "https://open.spotify.com/track/..."
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

2. **Invalid Mode** (if mode validation is strict):
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
    "message": "Unable to connect to cultural data service. Please try again later."
  }
}
```

3. **No Cultural Data Found**:
```json
{
  "success": false,
  "error": {
    "message": "No cultural data found for this country. Please try another country."
  }
}
```

4. **Generic Error**:
```json
{
  "success": false,
  "error": {
    "message": "Unable to retrieve cultural data for this country: [error details]. Please try again later."
  }
}
```

## Caching Behavior

### Cache Key Format

Cache keys follow the pattern: `cultural-data:{country}:{mode}`

**Examples**:
- Fast mode for Italy: `cultural-data:italy:fast`
- Detailed mode for Italy: `cultural-data:italy:detailed`
- Fast mode for France: `cultural-data:france:fast`

### Cache TTL

- **TTL**: 20 minutes (1,200,000 milliseconds)
- **Scope**: Independent per mode
- **Behavior**: Each mode maintains its own cache entries

### Cache Isolation

- Fast mode and detailed mode cache entries are completely independent
- Searching for the same country in different modes will:
  1. Check cache for the specific mode only
  2. Generate new response if cache miss
  3. Store result in mode-specific cache key

### Cache Flow

```
Request: { country: "Italy", mode: "fast" }
  ↓
Cache Key: "cultural-data:italy:fast"
  ↓
Check cache → Hit: Return cached data
           → Miss: Query OpenAI (gpt-3.5-turbo) → Cache result → Return data

Request: { country: "Italy", mode: "detailed" }
  ↓
Cache Key: "cultural-data:italy:detailed"
  ↓
Check cache → Hit: Return cached data
           → Miss: Query OpenAI (o4-mini) → Cache result → Return data
```

## Backward Compatibility

### Existing API Calls

API calls without the `mode` parameter continue to work:

```http
POST /api/cultural-data HTTP/1.1
Content-Type: application/json

{
  "country": "Italy"
}
```

**Behavior**: Defaults to `mode: 'fast'`, uses `gpt-3.5-turbo` model, cache key: `cultural-data:italy:fast`

### Response Structure

Response structure remains unchanged. Only the content detail level varies based on mode.

## Performance Characteristics

### Fast Mode
- **Model**: gpt-3.5-turbo
- **Target Response Time**: At least 30% faster than detailed mode
- **Content**: Concise, essential information
- **Use Case**: Quick searches, overview information

### Detailed Mode
- **Model**: o4-mini
- **Target Response Time**: Slower but more comprehensive
- **Content**: Detailed descriptions with cultural context
- **Use Case**: In-depth exploration, comprehensive information

### Cached Responses
- **Response Time**: < 100ms (near-instant)
- **Cache Hit Rate Target**: ≥ 80% for repeated searches within TTL

## Rate Limiting

No rate limiting implemented at the API level. OpenAI API rate limits apply based on API key configuration.

## Notes

- Mode parameter is optional for backward compatibility
- Invalid mode values default to 'fast'
- Cache entries are independent per mode to prevent cross-contamination
- Response structure is identical for both modes; only content detail differs
- Spotify URL search is performed regardless of mode (if carol is available)

