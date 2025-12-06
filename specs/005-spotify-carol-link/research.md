# Research: Spotify Christmas Carol Link

**Date**: 2024-12-19  
**Feature**: Spotify Christmas Carol Link

## Research Decisions

### Decision 1: Spotify API Authentication Method

**Decision**: Use OAuth2 Client Credentials Flow for server-side authentication.

**Rationale**: 
- Client credentials flow is appropriate for server-to-server API calls where no user authentication is required
- Provides secure access to Spotify Web API without user interaction
- Token can be cached and reused until expiration
- Simpler than authorization code flow for this use case (no redirects, no user consent)

**Alternatives Considered**:
- **Authorization Code Flow**: Rejected because it requires user interaction and redirects, which is unnecessary for server-side search operations
- **Implicit Grant Flow**: Rejected because it's designed for client-side applications and less secure
- **API Key**: Not available - Spotify only supports OAuth2

**Implementation Details**:
- Store `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` in environment variables
- Encode `client_id:client_secret` to base64 for Authorization header
- Request token from `https://accounts.spotify.com/api/token` with `grant_type=client_credentials`
- Cache access token until expiration (typically 1 hour)
- Refresh token automatically when expired

**References**:
- [Spotify Authorization Guide](https://developer.spotify.com/documentation/general/guides/authorization-guide/)
- [Client Credentials Flow](https://developer.spotify.com/documentation/general/guides/authorization/client-credentials/)

---

### Decision 2: Spotify Search API Endpoint and Parameters

**Decision**: Use `GET /v1/search` endpoint with `type=track`, `limit=1`, `offset=0`, and URL-encoded carol name as query parameter.

**Rationale**:
- Search endpoint is the standard way to find tracks by name
- Limiting to 1 result matches the requirement and reduces response size
- Using `type=track` ensures we only get track results (not albums, artists, etc.)
- URL encoding is required for special characters in carol names

**Alternatives Considered**:
- **Track-specific endpoint**: Rejected because it requires Spotify track ID, which we don't have
- **Multiple result types**: Rejected because we only need tracks, and limiting to tracks improves relevance
- **Higher limit**: Rejected because requirement specifies limit to 1 result

**Implementation Details**:
- Endpoint: `https://api.spotify.com/v1/search`
- Query parameters:
  - `q`: URL-encoded carol name (e.g., `tu%20scendi%20dalle%20stelle`)
  - `type`: `track` (fixed)
  - `limit`: `1` (fixed)
  - `offset`: `0` (fixed)
- Authorization: Bearer token from client credentials flow
- Response structure: `{ tracks: { items: [{ external_urls: { spotify: "..." } }] } }`

**References**:
- [Spotify Web API OpenAPI Schema](https://developer.spotify.com/reference/web-api/open-api-schema.yaml)
- [Search for Item endpoint](https://developer.spotify.com/documentation/web-api/reference/search)

---

### Decision 3: Response Parsing Strategy

**Decision**: Extract Spotify URL from `tracks.items[0].external_urls.spotify` with null checks at each level.

**Rationale**:
- Nested structure requires careful null/undefined checking
- First result (`items[0]`) matches the requirement to limit to 1 result
- `external_urls.spotify` is the standard field for open Spotify URLs
- Defensive programming prevents runtime errors when structure is unexpected

**Alternatives Considered**:
- **Optional chaining**: Accepted - use TypeScript optional chaining (`?.`) for safe navigation
- **Try-catch with fallback**: Accepted - wrap parsing in try-catch to handle malformed responses
- **Multiple result evaluation**: Rejected because requirement specifies first result only

**Implementation Details**:
```typescript
const spotifyUrl = response.tracks?.items?.[0]?.external_urls?.spotify;
if (spotifyUrl && typeof spotifyUrl === 'string') {
  return spotifyUrl;
}
return null; // No result found
```

**References**:
- [Spotify Web API Track Object](https://developer.spotify.com/documentation/web-api/reference/get-track)

---

### Decision 4: Caching Strategy

**Decision**: Cache Spotify URLs for 20 minutes (same TTL as cultural data) using existing cache utility.

**Rationale**:
- Consistent caching strategy across features (cultural data also cached for 20 minutes)
- Reduces redundant API calls to Spotify
- Spotify URLs are stable (don't change frequently)
- 20 minutes balances freshness with API call reduction

**Alternatives Considered**:
- **No caching**: Rejected because it would result in redundant API calls for the same carol
- **Longer cache (24 hours)**: Rejected because it's inconsistent with cultural data caching and may show stale links
- **Shorter cache (5 minutes)**: Rejected because Spotify URLs are stable and don't need frequent refresh

**Implementation Details**:
- Cache key: `spotify-url:${carolName.toLowerCase()}`
- TTL: 20 minutes (1,200,000 milliseconds)
- Store only valid URLs (null results not cached to allow retry)
- Check cache before making API call

**References**:
- Existing cache utility: `lib/utils/cache.ts`
- Feature 004 caching strategy (20-minute TTL)

---

### Decision 5: Error Handling Strategy

**Decision**: Graceful degradation - display "not found on spotify" for missing results, omit link for API errors, never break cultural data display.

**Rationale**:
- User-centric design: errors should not prevent users from seeing cultural data
- Clear messaging: "not found on spotify" is user-friendly and informative
- Graceful degradation: missing Spotify link is not critical functionality
- API errors should be logged but not displayed to users (unless rate limiting)

**Alternatives Considered**:
- **Show technical errors**: Rejected because it's not user-friendly
- **Hide missing results silently**: Rejected because users should know when Spotify link is unavailable
- **Block cultural data on Spotify error**: Rejected because Spotify search is supplementary, not critical

**Implementation Details**:
- No results: Display "not found on spotify" message
- API errors (rate limit, timeout, network): Log error, omit Spotify link, continue with cultural data
- Rate limiting: Return user-friendly message if applicable, otherwise omit link
- Network timeouts: Retry once, then omit link if still failing

**References**:
- Spotify API error responses: [Spotify Web API Error Responses](https://developer.spotify.com/documentation/web-api/reference/get-track)

---

### Decision 6: Integration Point

**Decision**: Integrate Spotify search into existing `/api/dishes` route after cultural data retrieval, or create separate endpoint that can be called from frontend.

**Rationale**:
- Two options considered:
  1. **Server-side integration**: Search Spotify in `/api/dishes` route after carol retrieval (synchronous)
  2. **Client-side integration**: Create separate `/api/spotify/search` endpoint, call from frontend after cultural data loads (asynchronous)
- Server-side integration provides better UX (single request, faster) but increases API route complexity
- Client-side integration provides better separation of concerns but requires additional request
- **Chosen**: Server-side integration for better UX and simpler frontend code

**Alternatives Considered**:
- **Separate API endpoint**: Rejected because it requires additional frontend request and more complex state management
- **Background job**: Rejected because it's overkill for this use case and adds unnecessary complexity

**Implementation Details**:
- After retrieving cultural data (from cache or OpenAI), check if carol exists
- If carol exists, search Spotify (check cache first, then API)
- Include Spotify URL in response alongside cultural data
- Frontend displays Spotify URL if available, "not found on spotify" if null

**References**:
- Existing API route: `app/api/dishes/route.ts`
- Feature 004 response structure: `CountryCulturalData`

---

## Technical Constraints

1. **Spotify API Rate Limits**: 
   - Client credentials flow: 10 requests per second per client
   - Must implement rate limit handling and retry logic

2. **Token Expiration**:
   - Access tokens expire after 1 hour
   - Must implement token refresh logic

3. **URL Encoding**:
   - Carol names may contain special characters, accents, spaces
   - Must properly URL-encode search query

4. **Response Structure**:
   - Spotify API returns nested JSON structure
   - Must safely navigate nested properties with null checks

5. **Network Reliability**:
   - API calls may timeout or fail
   - Must implement timeout handling and retry logic

## Dependencies

- **Spotify Web API**: External service, requires internet connection
- **Environment Variables**: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_ID` (must be set)
- **Existing Cache Utility**: `lib/utils/cache.ts` (reuse)
- **Existing Types**: `CountryCulturalData` from feature 004 (extend if needed)

## Open Questions Resolved

- ✅ Authentication method: Client credentials flow
- ✅ Search endpoint: `/v1/search` with `type=track&limit=1`
- ✅ Response parsing: Extract from `tracks.items[0].external_urls.spotify`
- ✅ Caching: 20 minutes (same as cultural data)
- ✅ Error handling: Graceful degradation with user-friendly messages
- ✅ Integration point: Server-side in `/api/dishes` route

