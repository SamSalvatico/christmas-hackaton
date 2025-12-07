# Data Model: Spotify Christmas Carol Link

**Date**: 2024-12-19  
**Feature**: Spotify Christmas Carol Link

## Entities

### SpotifyAccessToken

Represents an OAuth2 access token for Spotify API authentication.

**Attributes**:
- `access_token` (string): The access token value
  - **Type**: `string`
  - **Required**: Yes
  - **Validation**: Non-empty string
  - **Example**: `"BQC...xyz"`
- `token_type` (string): Token type (always "Bearer" for Spotify)
  - **Type**: `string`
  - **Required**: Yes
  - **Validation**: Must be "Bearer"
  - **Example**: `"Bearer"`
- `expires_in` (number): Token expiration time in seconds
  - **Type**: `number`
  - **Required**: Yes
  - **Validation**: Positive integer (typically 3600 = 1 hour)
  - **Example**: `3600`
- `timestamp` (number): Unix timestamp (milliseconds) when token was obtained
  - **Type**: `number`
  - **Required**: Yes (for cache expiration calculation)
  - **Validation**: Positive integer, milliseconds since epoch
  - **Example**: `1703001234567`

**Source**: Retrieved from Spotify OAuth2 token endpoint (`https://accounts.spotify.com/api/token`)

**Usage**: 
- Cached in memory until expiration
- Used in Authorization header for Spotify API requests
- Automatically refreshed when expired

---

### SpotifySearchResponse

Represents the response from Spotify search API.

**Attributes**:
- `tracks` (SpotifyTracksObject): Tracks search results
  - **Type**: `SpotifyTracksObject`
  - **Required**: Yes
  - **Validation**: Must be valid SpotifyTracksObject structure
- `albums` (SpotifyAlbumsObject): Albums search results (not used)
  - **Type**: `SpotifyAlbumsObject`
  - **Required**: No (not used in this feature)
- `artists` (SpotifyArtistsObject): Artists search results (not used)
  - **Type**: `SpotifyArtistsObject`
  - **Required**: No (not used in this feature)

**Source**: Retrieved from Spotify Web API search endpoint

**Usage**: 
- Parsed to extract first track's Spotify URL
- Only `tracks.items[0]` is used (limit=1 in search)

---

### SpotifyTracksObject

Represents the tracks portion of Spotify search response.

**Attributes**:
- `href` (string): Link to full search results
  - **Type**: `string`
  - **Required**: No (not used)
- `items` (SpotifyTrack[]): Array of track results
  - **Type**: `SpotifyTrack[]`
  - **Required**: Yes
  - **Validation**: Array (may be empty if no results)
  - **Example**: `[{ name: "...", external_urls: { spotify: "..." } }]`
- `limit` (number): Maximum number of items returned
  - **Type**: `number`
  - **Required**: No (not used)
- `offset` (number): Offset of results
  - **Type**: `number`
  - **Required**: No (not used)
- `total` (number): Total number of results available
  - **Type**: `number`
  - **Required**: No (not used)

**Source**: Part of SpotifySearchResponse

**Usage**: 
- Extract first item (`items[0]`) for Spotify URL

---

### SpotifyTrack

Represents a single track from Spotify search results.

**Attributes**:
- `id` (string): Spotify track ID
  - **Type**: `string`
  - **Required**: No (not used)
- `name` (string): Track name
  - **Type**: `string`
  - **Required**: No (not used, but useful for validation)
- `external_urls` (SpotifyExternalUrls): External URLs for the track
  - **Type**: `SpotifyExternalUrls`
  - **Required**: Yes (for extracting Spotify URL)
  - **Validation**: Must contain `spotify` property
- `artists` (SpotifyArtist[]): Track artists
  - **Type**: `SpotifyArtist[]`
  - **Required**: No (not used)
- `album` (SpotifyAlbum): Track album
  - **Type**: `SpotifyAlbum`
  - **Required**: No (not used)

**Source**: Part of SpotifyTracksObject.items array

**Usage**: 
- Extract `external_urls.spotify` for the Spotify URL

---

### SpotifyExternalUrls

Represents external URLs for a Spotify resource.

**Attributes**:
- `spotify` (string): Open Spotify URL
  - **Type**: `string`
  - **Required**: Yes
  - **Validation**: Valid URL format, starts with `https://open.spotify.com/`
  - **Example**: `"https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh"`

**Source**: Part of SpotifyTrack.external_urls

**Usage**: 
- Primary attribute used - the Spotify URL to display to users

---

### SpotifyUrlCacheEntry

Represents a cached Spotify URL entry with expiration metadata.

**Attributes**:
- `url` (string | null): Spotify URL or null if not found
  - **Type**: `string | null`
  - **Required**: Yes
  - **Validation**: If not null, must be valid Spotify URL
- `timestamp` (number): Unix timestamp (milliseconds) when cache was created
  - **Type**: `number`
  - **Required**: Yes
  - **Validation**: Positive integer, milliseconds since epoch
- `ttl` (number): Time-to-live in milliseconds (20 minutes = 1,200,000ms)
  - **Type**: `number`
  - **Required**: Yes
  - **Validation**: Positive integer, fixed at 1,200,000ms (20 minutes)

**Cache Key**: `spotify-url:${carolName.toLowerCase()}`

**Expiration Logic**:
```typescript
const isExpired = (Date.now() - entry.timestamp) > entry.ttl;
```

**Storage**: In-memory `Map<string, SpotifyUrlCacheEntry>` (reuses existing cache utility)

**Important**: Only valid URLs are cached. Null results (not found) are not cached to allow retry.

---

### CountryCulturalDataWithSpotify

Extended cultural data response that includes Spotify URL.

**Attributes**:
- `dishes` (DishesResponse): Dishes response structure (from feature 003)
  - **Type**: `DishesResponse`
  - **Required**: Yes
- `carol` (ChristmasCarol | null): Christmas carol or null if not available (from feature 004)
  - **Type**: `ChristmasCarol | null`
  - **Required**: No (can be null)
- `spotifyUrl` (string | null): Spotify URL for the carol or null if not found/not available
  - **Type**: `string | null`
  - **Required**: No (can be null)
  - **Validation**: If not null, must be valid Spotify URL

**Validation Rules**:
- At least one of dishes, carol, or spotifyUrl must be present
- If carol is null, spotifyUrl must be null (no search performed)
- If carol is present but spotifyUrl is null, it means search returned no results

**Usage**: 
- Returned from `/api/dishes` endpoint (extended response)
- Displayed on page alongside cultural data

---

## Request/Response Structures

### POST /api/dishes Request

**Method**: `POST`  
**Path**: `/api/dishes`  
**Query Parameters**: None  
**Headers**: 
- `Content-Type: application/json`
- Standard Next.js request headers

**Request Body**:
```typescript
{
  country: string; // Country name
}
```

**Response** (Success):
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

**Response** (Error):
```typescript
{
  success: false;
  error: {
    message: string;
  };
}
```

---

## State Transitions

### Spotify Search Flow

1. **Initial State**: Cultural data retrieved, carol available
2. **Check Cache**: Look for cached Spotify URL for carol name
3. **Cache Hit**: Return cached URL (if not expired)
4. **Cache Miss**: 
   - Check if access token exists and is valid
   - If token expired: Request new token
   - Search Spotify API with carol name
   - Parse response and extract URL
   - Cache URL (if found) or null (if not found, don't cache)
5. **Final State**: Spotify URL available or null

### Token Management Flow

1. **Initial State**: No token or token expired
2. **Request Token**: 
   - Encode client_id:client_secret to base64
   - POST to `https://accounts.spotify.com/api/token`
   - Receive access token with expiration
3. **Cache Token**: Store token with expiration timestamp
4. **Use Token**: Include in Authorization header for API requests
5. **Token Expired**: Automatically refresh when expired

---

## Validation Rules

### Spotify URL Validation

- Must be a valid URL format
- Must start with `https://open.spotify.com/`
- Must be a string (not null, not undefined, not empty)

### Carol Name Validation for Search

- Must be non-empty string
- Should be URL-encoded before use in search query
- Special characters and accents should be preserved (URL encoding handles this)

### Cache Entry Validation

- Timestamp must be valid (positive integer, milliseconds)
- TTL must be exactly 1,200,000ms (20 minutes)
- URL must be valid Spotify URL or null

---

## Type Definitions

```typescript
// Spotify API Types
interface SpotifyAccessToken {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  timestamp?: number; // Added for cache management
}

interface SpotifySearchResponse {
  tracks: SpotifyTracksObject;
  albums?: SpotifyAlbumsObject; // Not used
  artists?: SpotifyArtistsObject; // Not used
}

interface SpotifyTracksObject {
  href: string;
  items: SpotifyTrack[];
  limit: number;
  offset: number;
  total: number;
}

interface SpotifyTrack {
  id: string;
  name: string;
  external_urls: SpotifyExternalUrls;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  // ... other fields not used
}

interface SpotifyExternalUrls {
  spotify: string; // The URL we need
}

interface SpotifyUrlCacheEntry {
  url: string | null;
  timestamp: number;
  ttl: number;
}

// Extended Response Type
interface CountryCulturalDataWithSpotify extends CountryCulturalData {
  spotifyUrl: string | null;
}
```


