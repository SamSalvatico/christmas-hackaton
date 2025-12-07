/**
 * Spotify Web API service for searching Christmas carols
 */

import { cache } from '@/lib/utils/cache';
import type {
  SpotifyAccessToken,
  SpotifySearchResponse,
} from '@/lib/types/spotify';

/**
 * Cache key for Spotify access token
 */
const TOKEN_CACHE_KEY = 'spotify-access-token';

/**
 * Spotify OAuth2 token endpoint
 */
const TOKEN_URL = 'https://accounts.spotify.com/api/token';

/**
 * Spotify Web API base URL
 */
const API_BASE_URL = 'https://api.spotify.com/v1';

/**
 * Cache TTL for Spotify URLs: 20 minutes in milliseconds
 */
const SPOTIFY_URL_CACHE_TTL = 20 * 60 * 1000; // 1,200,000 milliseconds

/**
 * Request timeout for Spotify API calls: 5 seconds
 */
const REQUEST_TIMEOUT = 5000;

/**
 * Get cache key for a carol's Spotify URL
 * @param carolName - Name of the Christmas carol
 * @returns Cache key string
 */
function getSpotifyUrlCacheKey(carolName: string): string {
  return `spotify-url:${carolName.toLowerCase()}`;
}

/**
 * Get Spotify access token using OAuth2 client credentials flow
 * Implements token caching to avoid redundant API calls
 * @returns Promise resolving to SpotifyAccessToken
 * @throws Error if credentials are missing or API request fails
 */
async function getSpotifyAccessToken(): Promise<SpotifyAccessToken> {
  // Check cache for valid token
  const cachedToken = cache.get<SpotifyAccessToken>(TOKEN_CACHE_KEY);
  if (cachedToken) {
    // Verify token is not expired
    if (cachedToken.timestamp && cachedToken.expires_in) {
      const now = Date.now();
      const tokenAge = now - cachedToken.timestamp;
      const expirationTime = cachedToken.expires_in * 1000; // Convert to milliseconds

      if (tokenAge < expirationTime - 60000) {
        // Token is still valid (with 1 minute buffer)
        return cachedToken;
      }
    }
  }

  // Validate environment variables
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables are required'
    );
  }

  // Encode credentials to base64
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64'
  );

  // Request token from Spotify
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(
        `Spotify token request failed: ${response.status} ${errorText}`
      );
    }

    const tokenData: Omit<SpotifyAccessToken, 'timestamp'> =
      await response.json();

    // Add timestamp for cache expiration calculation
    const token: SpotifyAccessToken = {
      ...tokenData,
      timestamp: Date.now(),
    };

    // Cache token with TTL based on expires_in (convert seconds to milliseconds)
    const tokenTtl = tokenData.expires_in * 1000;
    cache.set(TOKEN_CACHE_KEY, token, tokenTtl);

    return token;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Spotify token request timed out');
    }
    throw error;
  }
}

/**
 * Search Spotify for a track by name
 * @param carolName - Name of the Christmas carol to search for
 * @param accessToken - Spotify access token
 * @returns Promise resolving to SpotifySearchResponse
 * @throws Error if API request fails
 */
async function searchSpotifyTrack(
  carolName: string,
  accessToken: string
): Promise<SpotifySearchResponse> {
  // URL-encode the carol name
  const encodedName = encodeURIComponent(carolName);

  // Build search URL
  const searchUrl = `${API_BASE_URL}/search?q=${encodedName}&type=track&limit=1&offset=0`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new Error(
          `Spotify API rate limit exceeded${retryAfter ? `. Retry after ${retryAfter} seconds` : ''}`
        );
      }

      // Handle authentication errors
      if (response.status === 401) {
        throw new Error('Spotify API authentication failed');
      }

      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(
        `Spotify search request failed: ${response.status} ${errorText}`
      );
    }

    const searchData: SpotifySearchResponse = await response.json();
    return searchData;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Spotify search request timed out');
    }
    throw error;
  }
}

/**
 * Extract Spotify URL from search response
 * Safely navigates nested structure using optional chaining
 * @param searchResponse - Spotify search response
 * @returns Spotify URL string or null if not found
 */
function extractSpotifyUrl(
  searchResponse: SpotifySearchResponse
): string | null {
  const spotifyUrl =
    searchResponse.tracks?.items?.[0]?.external_urls?.spotify;

  if (spotifyUrl && typeof spotifyUrl === 'string' && spotifyUrl.length > 0) {
    // Validate URL format
    if (spotifyUrl.startsWith('https://open.spotify.com/')) {
      return spotifyUrl;
    }
  }

  return null;
}

/**
 * Search Spotify for a Christmas carol and return the Spotify URL
 * Implements caching to avoid redundant API calls
 * @param carolName - Name of the Christmas carol to search for
 * @returns Promise resolving to Spotify URL string or null if not found
 */
export async function searchSpotifyForCarol(
  carolName: string
): Promise<string | null> {
  if (!carolName || typeof carolName !== 'string' || carolName.trim().length === 0) {
    return null;
  }

  const normalizedName = carolName.trim();

  // Check cache for Spotify URL
  const cacheKey = getSpotifyUrlCacheKey(normalizedName);
  const cachedUrl = cache.get<string>(cacheKey);
  if (cachedUrl) {
    return cachedUrl;
  }

  try {
    // Get access token (with caching)
    const token = await getSpotifyAccessToken();

    // Search Spotify
    const searchResponse = await searchSpotifyTrack(
      normalizedName,
      token.access_token
    );

    // Extract URL
    const spotifyUrl = extractSpotifyUrl(searchResponse);

    // Cache valid URLs only (not null results to allow retry)
    if (spotifyUrl) {
      cache.set(cacheKey, spotifyUrl, SPOTIFY_URL_CACHE_TTL);
    }

    return spotifyUrl;
  } catch (error) {
    // Log error but don't throw - graceful degradation
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Spotify search error:', errorMessage);

    // Handle specific error cases
    if (errorMessage.includes('authentication failed')) {
      // Try refreshing token once
      try {
        // Clear cached token to force refresh
        cache.delete(TOKEN_CACHE_KEY);
        const newToken = await getSpotifyAccessToken();
        const retryResponse = await searchSpotifyTrack(
          normalizedName,
          newToken.access_token
        );
        const retryUrl = extractSpotifyUrl(retryResponse);
        if (retryUrl) {
          cache.set(cacheKey, retryUrl, SPOTIFY_URL_CACHE_TTL);
        }
        return retryUrl;
      } catch (retryError) {
        // Retry failed, return null gracefully
        console.error('Spotify search retry failed:', retryError);
        return null;
      }
    }

    // For all other errors (rate limit, timeout, network, etc.), return null gracefully
    return null;
  }
}

