# API Route Contracts: Spotify Christmas Carol Link

**Date**: 2024-12-19  
**Feature**: Spotify Christmas Carol Link

## Overview

This document defines the API contracts for the Spotify Christmas Carol Link feature. The feature extends the existing `/api/dishes` endpoint to include Spotify URL search functionality.

---

## POST /api/dishes

**Description**: Retrieves cultural data (dishes and carol) for a country and searches Spotify for the carol if available. Returns extended response including Spotify URL.

**Method**: `POST`  
**Path**: `/api/dishes`  
**Content-Type**: `application/json`

### Request

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "country": "Italy"
}
```

**Request Body Schema**:
```typescript
{
  country: string; // Required, non-empty string
}
```

**Validation Rules**:
- `country` must be present
- `country` must be a non-empty string after trimming

### Response

#### Success Response (200 OK)

**Response Body**:
```json
{
  "success": true,
  "data": {
    "dishes": {
      "entry": { "name": "...", "description": "...", "ingredients": [...] } | null,
      "main": { "name": "...", "description": "...", "ingredients": [...] } | null,
      "dessert": { "name": "...", "description": "...", "ingredients": [...] } | null
    },
    "carol": {
      "name": "Tu scendi dalle stelle",
      "author": "Alfonso Maria de' Liguori",
      "country": "Italy"
    } | null,
    "spotifyUrl": "https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh" | null
  }
}
```

**Response Schema**:
```typescript
{
  success: true;
  data: {
    dishes: DishesResponse;
    carol: ChristmasCarol | null;
    spotifyUrl: string | null; // NEW: Spotify URL or null
  };
}
```

**Response Fields**:
- `success` (boolean): Always `true` for success responses
- `data.dishes` (DishesResponse): Dishes data (from feature 003)
- `data.carol` (ChristmasCarol | null): Carol data (from feature 004), null if not available
- `data.spotifyUrl` (string | null): Spotify URL for the carol, null if:
  - Carol is not available (null)
  - Spotify search returned no results
  - Spotify API error occurred

#### Error Response (400 Bad Request)

**Response Body**:
```json
{
  "success": false,
  "error": {
    "message": "Country name is required"
  }
}
```

**Response Schema**:
```typescript
{
  success: false;
  error: {
    message: string;
  };
}
```

**Error Scenarios**:
- Missing `country` field
- `country` is not a string
- `country` is empty after trimming

#### Error Response (500 Internal Server Error)

**Response Body**:
```json
{
  "success": false,
  "error": {
    "message": "Unable to retrieve cultural data for this country: [error details]. Please try again later."
  }
}
```

**Error Scenarios**:
- OpenAI API errors (rate limit, service unavailable, etc.)
- Spotify API errors (rate limit, authentication failure, etc.)
- Network errors
- Internal server errors

**Note**: Spotify API errors do not prevent cultural data from being returned. If cultural data is available but Spotify search fails, the response includes cultural data with `spotifyUrl: null`.

---

## Internal API: Spotify Token Endpoint

**Description**: Internal function to obtain Spotify access token using client credentials flow.

**Endpoint**: `https://accounts.spotify.com/api/token`  
**Method**: `POST`  
**Content-Type**: `application/x-www-form-urlencoded`

### Request

**Headers**:
```
Authorization: Basic {base64(client_id:client_secret)}
Content-Type: application/x-www-form-urlencoded
```

**Request Body** (form-encoded):
```
grant_type=client_credentials
```

### Response

#### Success Response (200 OK)

**Response Body**:
```json
{
  "access_token": "BQC...xyz",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Response Schema**:
```typescript
{
  access_token: string;
  token_type: 'Bearer';
  expires_in: number; // seconds
}
```

#### Error Response (400 Bad Request)

**Response Body**:
```json
{
  "error": "invalid_client",
  "error_description": "Invalid client credentials"
}
```

**Error Scenarios**:
- Invalid client_id or client_secret
- Missing credentials
- Malformed request

---

## Internal API: Spotify Search Endpoint

**Description**: Internal function to search Spotify for tracks.

**Endpoint**: `https://api.spotify.com/v1/search`  
**Method**: `GET`  
**Authorization**: Bearer token

### Request

**Headers**:
```
Authorization: Bearer {access_token}
```

**Query Parameters**:
- `q` (string, required): URL-encoded search query (carol name)
  - Example: `tu%20scendi%20dalle%20stelle`
- `type` (string, required): `track` (fixed)
- `limit` (number, required): `1` (fixed)
- `offset` (number, required): `0` (fixed)

**Example Request**:
```
GET https://api.spotify.com/v1/search?q=tu%20scendi%20dalle%20stelle&type=track&limit=1&offset=0
Authorization: Bearer BQC...xyz
```

### Response

#### Success Response (200 OK)

**Response Body**:
```json
{
  "tracks": {
    "href": "https://api.spotify.com/v1/search?query=tu+scendi+dalle+stelle&type=track&offset=0&limit=1",
    "items": [
      {
        "id": "4iV5W9uYEdYUVa79Axb7Rh",
        "name": "Tu scendi dalle stelle",
        "external_urls": {
          "spotify": "https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh"
        },
        "artists": [...],
        "album": {...}
      }
    ],
    "limit": 1,
    "offset": 0,
    "total": 1
  }
}
```

**Response Schema**:
```typescript
{
  tracks: {
    items: Array<{
      id: string;
      name: string;
      external_urls: {
        spotify: string; // The URL we extract
      };
      // ... other fields
    }>;
    // ... other fields
  };
}
```

**URL Extraction**:
- Extract `tracks.items[0].external_urls.spotify`
- If `items` array is empty, return `null` (no results found)

#### Error Response (401 Unauthorized)

**Response Body**:
```json
{
  "error": {
    "status": 401,
    "message": "Invalid access token"
  }
}
```

**Error Scenarios**:
- Expired access token
- Invalid access token
- Missing Authorization header

**Handling**: Automatically refresh token and retry request (once)

#### Error Response (429 Too Many Requests)

**Response Body**:
```json
{
  "error": {
    "status": 429,
    "message": "API rate limit exceeded"
  }
}
```

**Error Scenarios**:
- Too many requests per second (Spotify limit: 10 req/s per client)
- Rate limit window exceeded

**Handling**: Return user-friendly error message, omit Spotify URL, continue with cultural data

#### Error Response (500/503 Service Unavailable)

**Response Body**:
```json
{
  "error": {
    "status": 500,
    "message": "Internal server error"
  }
}
```

**Error Scenarios**:
- Spotify API internal error
- Network timeout
- Service unavailable

**Handling**: Log error, omit Spotify URL, continue with cultural data (graceful degradation)

---

## Caching Behavior

### Cultural Data Cache

- **Cache Key**: `cultural-data:${countryName.toLowerCase()}`
- **TTL**: 20 minutes (1,200,000 milliseconds)
- **Storage**: In-memory cache (reuses existing cache utility)

### Spotify URL Cache

- **Cache Key**: `spotify-url:${carolName.toLowerCase()}`
- **TTL**: 20 minutes (1,200,000 milliseconds)
- **Storage**: In-memory cache (reuses existing cache utility)
- **Note**: Only valid URLs are cached. Null results are not cached to allow retry.

### Access Token Cache

- **Cache Key**: `spotify-access-token`
- **TTL**: Token expiration time (typically 1 hour, 3,600,000 milliseconds)
- **Storage**: In-memory cache (reuses existing cache utility)
- **Note**: Token is automatically refreshed when expired.

---

## Error Handling

### Graceful Degradation

The API implements graceful degradation for Spotify search:

1. **Cultural data always returned**: Even if Spotify search fails, cultural data is still returned
2. **Spotify URL optional**: `spotifyUrl` field is always present but may be `null`
3. **User-friendly messages**: Errors are logged but not exposed to users (except rate limiting)
4. **No breaking changes**: Missing Spotify URL does not break existing functionality

### Error Priority

1. **Critical errors** (OpenAI API failure): Return error response, no data
2. **Non-critical errors** (Spotify API failure): Return cultural data with `spotifyUrl: null`
3. **Rate limiting**: Return user-friendly message if applicable, otherwise omit link

---

## Performance Considerations

### Response Time Targets

- **Cultural data retrieval**: < 10 seconds (from feature 004)
- **Spotify search**: < 2 seconds (including authentication if needed)
- **Total response time**: < 12 seconds (cultural data + Spotify search)
- **Cache hit response**: < 1 second

### Optimization Strategies

1. **Parallel execution**: Spotify search can run in parallel with cultural data retrieval (if not cached)
2. **Cache-first**: Check cache before making API calls
3. **Token reuse**: Cache and reuse access tokens until expiration
4. **Timeout handling**: Set reasonable timeouts for API calls (5 seconds)

---

## Security Considerations

### Environment Variables

- `SPOTIFY_CLIENT_ID`: Spotify application client ID (required)
- `SPOTIFY_CLIENT_SECRET`: Spotify application client secret (required, sensitive)

**Security Notes**:
- Client secret must never be exposed to frontend
- Base64 encoding is not encryption - it's just encoding
- Tokens should be cached securely (in-memory only, not in logs)

### API Authentication

- Client credentials flow is server-side only
- Access tokens are not exposed to frontend
- Token refresh is automatic and transparent

---

## Testing Scenarios

### Happy Path

1. Request cultural data for country with carol
2. Spotify search returns result
3. Response includes `spotifyUrl` with valid URL

### No Carol Available

1. Request cultural data for country without carol
2. Spotify search is skipped
3. Response includes `spotifyUrl: null`

### No Spotify Results

1. Request cultural data for country with carol
2. Spotify search returns no results
3. Response includes `spotifyUrl: null`

### Spotify API Error

1. Request cultural data for country with carol
2. Spotify API returns error (rate limit, timeout, etc.)
3. Response includes cultural data with `spotifyUrl: null`
4. Error is logged but not exposed to user

### Cache Hit

1. Request cultural data for country (cached)
2. Spotify URL is cached
3. Response includes cached `spotifyUrl`
4. No API calls made

