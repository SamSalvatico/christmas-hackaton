# API Route Contracts: Improve API Naming

**Date**: 2024-12-19  
**Feature**: Improve API Naming

## Overview

This document defines the API contracts for the renamed cultural data endpoint. The endpoint has been renamed from `/api/dishes` to `/api/cultural-data` to accurately reflect that it returns comprehensive cultural data (dishes, Christmas carol, and Spotify URL).

---

## POST /api/cultural-data

**Description**: Retrieves comprehensive cultural data (dishes, Christmas carol, and Spotify URL) for a selected country.

**Method**: `POST`  
**Path**: `/api/cultural-data`  
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
interface CulturalDataApiRequest {
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
interface CulturalDataApiSuccessResponse {
  success: true;
  data: CountryCulturalData;
}

interface CountryCulturalData {
  dishes: DishesResponse;
  carol: ChristmasCarol | null;
  spotifyUrl: string | null;
}
```

**Response Fields**:
- `success` (boolean): Always `true` for success responses
- `data.dishes` (DishesResponse): Dishes data organized by category (entry, main, dessert)
- `data.carol` (ChristmasCarol | null): Christmas carol or null if not available
- `data.spotifyUrl` (string | null): Spotify URL for the carol or null if not found/not available

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
interface CulturalDataApiErrorResponse {
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

---

## POST /api/dishes (Deprecated)

**Description**: Legacy endpoint that has been renamed to `/api/cultural-data`. This endpoint is maintained for backward compatibility but is deprecated.

**Method**: `POST`  
**Path**: `/api/dishes`  
**Status**: Deprecated  
**Migration**: Use `/api/cultural-data` instead

### Request

Same as `/api/cultural-data` request structure.

### Response

**Option 1: Redirect Response (301 Moved Permanently)**

**Headers**:
```
Location: /api/cultural-data
```

**Response Body**: Empty or redirect message

**Option 2: Deprecation Notice Response (200 OK)**

**Headers**:
```
X-API-Deprecated: true
X-API-Deprecation-Date: 2024-12-19
X-API-Sunset-Date: 2025-01-19
```

**Response Body**: Same as `/api/cultural-data` success/error response, with additional deprecation notice:

```json
{
  "success": true,
  "data": { ... },
  "deprecation": {
    "message": "This endpoint is deprecated. Please use /api/cultural-data instead.",
    "sunsetDate": "2025-01-19"
  }
}
```

**Recommendation**: Use Option 2 (Deprecation Notice) to maintain functionality while encouraging migration.

---

## Type Definitions

### Request Types

```typescript
/**
 * API request structure for cultural data queries
 */
interface CulturalDataApiRequest {
  /** Country name to query cultural data for */
  country: string;
}
```

### Response Types

```typescript
/**
 * API success response structure for cultural data
 */
interface CulturalDataApiSuccessResponse {
  success: true;
  data: CountryCulturalData;
}

/**
 * API error response structure
 */
interface CulturalDataApiErrorResponse {
  success: false;
  error: {
    message: string;
  };
}

/**
 * API response union type (success or error)
 */
type CulturalDataApiResponse =
  | CulturalDataApiSuccessResponse
  | CulturalDataApiErrorResponse;
```

### Data Types

```typescript
/**
 * Combined response structure for dishes, carol, and Spotify URL for a country
 */
interface CountryCulturalData {
  /** Dishes response structure */
  dishes: DishesResponse;
  /** Christmas carol or null if not available */
  carol: ChristmasCarol | null;
  /** Spotify URL for the carol or null if not found/not available */
  spotifyUrl?: string | null;
}

/**
 * Dishes response structure organized by category
 */
interface DishesResponse {
  entry: Dish | null;
  main: Dish | null;
  dessert: Dish | null;
}

/**
 * Christmas Carol entity
 */
interface ChristmasCarol {
  name: string;
  author: string | null;
  country: string;
}

/**
 * Dish entity
 */
interface Dish {
  name: string;
  description: string;
  ingredients: string[];
  country?: string;
  type?: 'entry' | 'main' | 'dessert';
}
```

---

## Migration Guide

### For API Consumers

**Step 1**: Update endpoint URL
- Old: `POST /api/dishes`
- New: `POST /api/cultural-data`

**Step 2**: Update request/response types (if using TypeScript)
- Old: `DishesApiRequest`, `CountryCulturalApiResponse`
- New: `CulturalDataApiRequest`, `CulturalDataApiResponse`

**Step 3**: Test new endpoint
- Verify same request structure works
- Verify same response structure returned
- Update any hardcoded endpoint URLs

**Step 4**: Remove old endpoint usage
- Old endpoint will be deprecated
- Plan to remove old endpoint references

### Example Migration

**Before**:
```typescript
const response = await fetch('/api/dishes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ country: 'Italy' }),
});

const result: CountryCulturalApiResponse = await response.json();
```

**After**:
```typescript
const response = await fetch('/api/cultural-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ country: 'Italy' }),
});

const result: CulturalDataApiResponse = await response.json();
```

---

## Caching Behavior

### Cultural Data Cache

- **Cache Key**: `cultural-data:${countryName.toLowerCase()}`
- **TTL**: 20 minutes (1,200,000 milliseconds)
- **Storage**: In-memory cache (reuses existing cache utility)

**Note**: Cache keys already use "cultural-data" terminology, no changes needed.

---

## Error Handling

### Graceful Degradation

The API implements graceful degradation:

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

- **Cultural data retrieval**: < 10 seconds (from OpenAI)
- **Spotify search**: < 2 seconds (if carol available)
- **Total response time**: < 12 seconds (cultural data + Spotify search)
- **Cache hit response**: < 1 second

### Optimization Strategies

1. **Cache-first**: Check cache before making API calls
2. **Parallel execution**: Spotify search can run in parallel with cultural data retrieval (if not cached)
3. **Token reuse**: Cache and reuse access tokens until expiration
4. **Timeout handling**: Set reasonable timeouts for API calls (5 seconds)

---

## Security Considerations

### Environment Variables

- `OPENAI_API_KEY`: OpenAI API key (required)
- `SPOTIFY_CLIENT_ID`: Spotify application client ID (required)
- `SPOTIFY_CLIENT_SECRET`: Spotify application client secret (required, sensitive)

**Security Notes**:
- API keys must never be exposed to frontend
- Secrets should be cached securely (in-memory only, not in logs)
- All API calls are server-side only

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

### Backward Compatibility

1. Request to old endpoint `/api/dishes`
2. Endpoint returns deprecation notice
3. Response includes same data structure as new endpoint
4. Client can migrate to new endpoint

