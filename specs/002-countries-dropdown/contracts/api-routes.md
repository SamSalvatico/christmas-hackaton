# API Contracts: Countries Searchable Dropdown

**Date**: 2024-12-19  
**Feature**: Countries Searchable Dropdown

## Endpoints

### GET /api/countries

Retrieves a list of country names from the REST Countries API, with server-side caching for 10 minutes.

#### Request

**Method**: `GET`  
**Path**: `/api/countries`  
**Query Parameters**: None  
**Headers**:

- Standard Next.js request headers
- No authentication required
- No custom headers required

**Example Request**:

```http
GET /api/countries HTTP/1.1
Host: localhost:3000
Accept: application/json
```

#### Response

**Success Response** (200 OK):

**Schema**:

```typescript
{
  success: true;
  data: string[]; // Array of country names (name.common from REST Countries API)
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
    "Andorra",
    "Angola",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    ...
    "Zimbabwe"
  ]
}
```

**Properties**:

- `success` (boolean, required): Always `true` for success response
- `data` (string[], required): Array of country name strings, sorted alphabetically (optional, but recommended for UX)

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

**Example**:

```json
{
  "success": false,
  "error": {
    "message": "Unable to load countries. Please try again later."
  }
}
```

**Properties**:

- `success` (boolean, required): Always `false` for error response
- `error` (object, required): Error details
  - `message` (string, required): User-friendly error message

#### Behavior

1. **Cache Check**: On request, check in-memory cache for valid entry (not expired)
2. **Cache Hit**: If valid cache exists, return cached data immediately (no external API call)
3. **Cache Miss**: If cache is expired or missing:
   - Fetch from REST Countries API: `GET https://restcountries.com/v3.1/all?fields=name`
   - Extract `name.common` from each country object
   - Store in cache with 10-minute TTL
   - Return array of country names
4. **Error Handling**: If REST Countries API fails:
   - Check if expired cache exists (fallback)
   - If expired cache exists, return it with warning (optional)
   - If no cache exists, return error response

#### Caching

- **Storage**: In-memory cache (JavaScript `Map`)
- **Cache Key**: `'countries'` (constant string)
- **TTL**: 10 minutes (600,000 milliseconds)
- **Expiration**: Automatic based on timestamp comparison
- **Scope**: Per-instance (not shared across instances in multi-instance deployment)

#### Timeout

- **External API Timeout**: 10 seconds
- **Behavior on Timeout**: Return error response (or fallback to expired cache if available)

#### Error Codes

| HTTP Status | Scenario | Response |
|------------|----------|----------|
| 200 | Success (cached or fresh) | `{ success: true, data: string[] }` |
| 500 | REST Countries API failure, no cache | `{ success: false, error: { message: string } }` |
| 500 | Network timeout | `{ success: false, error: { message: "Request timed out. Please try again." } }` |
| 500 | Invalid response format | `{ success: false, error: { message: "Received invalid data. Please try again later." } }` |

#### Rate Limiting

- **Not Required**: This endpoint does not require rate limiting for 2-3 users
- **External API**: REST Countries API has its own rate limits (not documented, but generous for public use)

#### Authentication

- **Not Required**: This endpoint is publicly accessible
- **No API Keys**: REST Countries API does not require authentication

## External API Contract

### REST Countries API

**Endpoint**: `GET https://restcountries.com/v3.1/all?fields=name`

**Request**:

- **Method**: `GET`
- **URL**: `https://restcountries.com/v3.1/all?fields=name`
- **Query Parameters**: `fields=name` (limits response to name fields only)
- **Headers**: Standard HTTP headers
- **Authentication**: None required

**Response** (200 OK):

**Schema**:

```typescript
{
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

**Example**:
```json
[
  {
    "name": {
      "common": "Antigua and Barbuda",
      "official": "Antigua and Barbuda",
      "nativeName": {
        "eng": {
          "official": "Antigua and Barbuda",
          "common": "Antigua and Barbuda"
        }
      }
    }
  },
  {
    "name": {
      "common": "Argentina",
      "official": "Argentine Republic",
      "nativeName": {
        "grn": {
          "official": "Argentine Republic",
          "common": "Argentina"
        },
        "spa": {
          "official": "República Argentina",
          "common": "Argentina"
        }
      }
    }
  },
  ...
]
```

**Data Extraction**:

- Extract `name.common` from each item in the array
- Create array of strings: `string[]`
- Sort alphabetically (optional, but recommended for UX)

**Error Responses**:

- **429 Too Many Requests**: Rate limit exceeded (unlikely for 2-3 users)
- **500 Internal Server Error**: REST Countries API server error
- **Timeout**: Network timeout (10 seconds)

## Type Definitions

```typescript
// Countries API Success Response
interface CountriesApiSuccessResponse {
  success: true;
  data: string[]; // Array of country names
}

// Countries API Error Response
interface CountriesApiErrorResponse {
  success: false;
  error: {
    message: string;
  };
}

// Countries API Response (union type)
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

## Testing Scenarios

### Success Scenarios

1. **First Request (Cache Miss)**:
   - Request: `GET /api/countries`
   - Expected: Fetch from REST Countries API, cache result, return `{ success: true, data: string[] }`
   - Response Time: <5 seconds

2. **Subsequent Request (Cache Hit)**:
   - Request: `GET /api/countries` (within 10 minutes)
   - Expected: Return cached data without external API call
   - Response Time: <1 second

3. **Cache Expired (Cache Miss)**:
   - Request: `GET /api/countries` (after 10 minutes)
   - Expected: Fetch fresh data from REST Countries API, update cache, return data
   - Response Time: <5 seconds

### Error Scenarios

1. **REST Countries API Unavailable (No Cache)**:
   - Request: `GET /api/countries` (first request, API down)
   - Expected: Return `{ success: false, error: { message: "Unable to load countries. Please try again later." } }`
   - Status: 500

2. **REST Countries API Unavailable (Expired Cache Exists)**:
   - Request: `GET /api/countries` (API down, expired cache exists)
   - Expected: Return expired cache data (fallback) OR error response
   - Status: 200 (if returning cache) or 500 (if returning error)

3. **Network Timeout**:
   - Request: `GET /api/countries` (timeout after 10 seconds)
   - Expected: Return `{ success: false, error: { message: "Request timed out. Please try again." } }`
   - Status: 500

4. **Invalid Response Format**:
   - Request: `GET /api/countries` (REST Countries API returns unexpected format)
   - Expected: Return `{ success: false, error: { message: "Received invalid data. Please try again later." } }`
   - Status: 500

## Performance Requirements

- **Cache Hit Response Time**: <1 second (p95)
- **Cache Miss Response Time**: <5 seconds (p95)
- **External API Timeout**: 10 seconds
- **Cache TTL**: Exactly 10 minutes (600,000 milliseconds)

## Security Considerations

- **No Authentication Required**: Public endpoint, no sensitive data
- **Input Validation**: No user input, no validation needed
- **Output Sanitization**: Country names are strings from trusted API, no sanitization needed
- **Rate Limiting**: Not required for 2-3 users, but can be added if needed
- **CORS**: Handled by Next.js (same-origin for client-side requests)

